const { ActionRowBuilder, ButtonBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

import { constants } from "./constants/constants.js"
import { createFavoriteButton, createNextButton, createPrevButton, createUnfavoriteButton } from "./utilities/utilities.js"

axios.defaults.httpsAgent = httpsAgent;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('View class schedule')
        .addStringOption(option =>
            option
            .setName('term')
            .setDescription('Select a term')
            .setAutocomplete(true)
            .setRequired(true))
        .addStringOption(option =>
            option
            .setName('subject')
            .setDescription('Select a subject')
            .setAutocomplete(true)
            .setRequired(true))
        .addStringOption(option => 
            option
            .setName('status')
            .setDescription('Select status')
            .setRequired(true)
            .addChoices(...constants.STATUS_CHOICES))
        .addStringOption(option => 
            option
            .setName('section')
            .setDescription('Select section')
            .setRequired(true)
            .addChoices(...constants.SECTION_CHOICES))
        .addStringOption(option => 
            option
            .setName('crs')
            .setDescription('Enter course number')),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        let choices;
        const data = await axios.get(constants.SCHEDULE_URL);
        const $ = cheerio.load(data.data);

        const focusedOptions = {
            'term': 'term',
            'subject': 'sel_subj'
        }

        if (focusedOptions[focusedOption.name]) {
            choices = $(`select[name="${focusedOptions[focusedOption.name]}"] option`).map((index, element) => {
                return {
                    name: $(element).text(),
                    value: $(element).val()
                }
            }).get();
        }

		const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedOption.value.toLowerCase()));
    
		await interaction.respond(filtered.slice(0, 25));
    },

    async createUserIfNew(interaction, db) {
        try {
            await db.collection("users").insertOne({_id: interaction.user.id, favorite_courses: []});
        } catch(error) {} //TODO: Add the correct error here for duplicate keys
    },

    async createButtons() {
        const urlButton = new ButtonBuilder()
            .setLabel('View in browser')
            .setStyle(ButtonStyle.Link)
            .setURL(`${constants.BASE_SCHEDULE_URL}/hxskschd.P_ListSchClassSimple?sel_subj=abcde&sel_day=abcde&sel_status=abcde&term=${term}&sel_status=%25${status}&sel_subj=${subject}&sel_sec=%25${section}&sel_crse=${crs}&begin_hh=00&begin_mi=00&end_hh=00&end_mi=00`)
        
        const prevButton = createPrevButton()
            .setDisabled(true);

        const nextButton = createNextButton()
            .setDisabled(courses.length <= 25);

        return [urlButton, prevButton, nextButton];
    },

	async run(interaction, db) {
        await this.createUserIfNew(interaction, db)
        const term = interaction.options.getString('term');
        const subject = interaction.options.getString('subject');
        const status = interaction.options.getString('status') === "%" ? "" : interaction.options.getString('status');
        const section = interaction.options.getString('section');
        const crs = interaction.options.getString('cts') ?? "";
        let data = await axios.get(constants.SCHEDULE_URL);
        let $ = cheerio.load(data.data);

        let options = $('select[name="term"] option');
        let dataArray = [];
        options.each((index, element) => {
            const optionValue = $(element).attr('value');
            dataArray.push(optionValue);
        });

        if (!dataArray.includes(interaction.options.getString('term'))) return await interaction.reply({content: "Invalid term search query, please select from the autocomplete options.", ephemeral: true});

        options = $('select[name="sel_subj"] option');
        options.each((index, element) => {
            const optionValue = $(element).attr('value');
            dataArray.push(optionValue);
        });

        if (!dataArray.includes(interaction.options.getString('subject'))) return await interaction.reply({content: "Invalid subject search query, please select from the autocomplete options.", ephemeral: true});

        data = await axios.get(`${constants.BASE_SCHEDULE_URL}/hxskschd.P_ListSchClassSimple?sel_subj=abcde&sel_day=abcde&sel_status=abcde&term=${term}&sel_status=%25${status}&sel_subj=${subject}&sel_sec=%25${section}&sel_crse=${crs}&begin_hh=00&begin_mi=00&end_hh=00&end_mi=00`);
        $ = cheerio.load(data.data);
        let courses = [];
        $('table tbody tr').each((index, element) => {
            if ($(element).find('td').length === 24) {
                const columns = $(element).find('td');
                const status = $(columns[0]).text().trim();
                const crn = $(columns[1]).text().trim();
                const title = $(columns[2]).text().trim();
                const crsNum = $(columns[4]).text().trim();
                const secNum = $(columns[5]).text().trim();
                let meetingTime = $(columns[7]).text().trim()+$(columns[8]).text().trim()+$(columns[9]).text().trim()+$(columns[10]).text().trim()+$(columns[11]).text().trim()+" "+$(columns[14]).text().trim();
                nextColumn = $(element).next('tr');
                if ($(nextColumn.find('td')[1]).text().length < 2) meetingTime += " & " + $(nextColumn.find('td')[1]).text().trim()+$(nextColumn.find('td')[2]).text().trim()+$(nextColumn.find('td')[3]).text().trim()+$(nextColumn.find('td')[4]).text().trim()+$(nextColumn.find('td')[5]).text().trim()+" "+$(nextColumn.find('td')[8]).text().trim();
                const date = $(columns[15]).text().trim();
                const location = $(columns[16]).text().trim();
                const cap = $(columns[17]).text().trim();
                const act = $(columns[18]).text().trim();
                const rem = $(columns[19]).text().trim();
                const instructor = $(columns[21]).text().trim();
                const weeks = $(columns[22]).text().trim();

                courses.push({
                    status,
                    crn,
                    title,
                    crsNum,
                    secNum,
                    meetingTime,
                    date,
                    location,
                    cap,
                    act,
                    rem,
                    instructor,
                    weeks 
                });
            }
        });

        if (courses.length == 0) return await interaction.reply({content: 'No classes matched your search queries.', ephemeral: true});
        const select = new StringSelectMenuBuilder()
            .setCustomId('course')
            .setPlaceholder('Select a course')
        
        courses.slice(0, 25).forEach(course => {
            select.addOptions(
                new StringSelectMenuOptionBuilder()
                .setLabel(course.title)
                .setDescription(`${subject}${course.crsNum} w/ ${course.instructor}`)
                .setValue(course.crn)
            );
        });

        const menu = new ActionRowBuilder()
			.addComponents(select);
        
        const buttons = new ActionRowBuilder()
            .addComponents(...this.createButtons());

        const response = await interaction.reply({components: [menu, buttons], ephemeral: true});

        const menuCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

        let chosenCourse;
        menuCollector.on('collect', async i => {
            for (let j = 0; j < courses.length; j++) {
                if (courses[j].crn == i.values[0]) {
                    chosenCourse = j;
                    break;
                }
            }
            let name = courses[chosenCourse].instructor;
            if (name !== "Staff") name = courses[chosenCourse].instructor.substring(courses[chosenCourse].instructor.indexOf(" ")+1)+" "+courses[chosenCourse].instructor.substring(0, courses[chosenCourse].instructor.indexOf(","));
            const embed = new EmbedBuilder()
                .setTitle(subject+courses[chosenCourse].crsNum+" "+courses[chosenCourse].title)
                .setColor('Navy')
                .setURL(`${constants.BASE_SCHEDULE_URL}/hxskschd.P_ListSchClassSimple?sel_subj=abcde&sel_day=abcde&sel_status=abcde&term=${term}&sel_status=%25${status}&sel_subj=${subject}&sel_sec=%25${section}&sel_crse=${crs}&begin_hh=00&begin_mi=00&end_hh=00&end_mi=00`)
                .setAuthor({name: "Taught by "+name})
                .setDescription(`Course number (CRN): **${courses[chosenCourse].crn}**
                    Status: **${courses[chosenCourse].status}**
                    Section: **${courses[chosenCourse].secNum}**
                    Credits: **${courses[chosenCourse].crsNum.substring(courses[chosenCourse].crsNum.length-1)}**
                    Students: **${courses[chosenCourse].act}/${courses[chosenCourse].cap}** | **${courses[chosenCourse].rem}** remaining seat(s) left.
                    Meeting time: **${courses[chosenCourse].meetingTime}**
                    Date: **${courses[chosenCourse].date}**
                    Location: **${courses[chosenCourse].location}**
                    Weeks: **${courses[chosenCourse].weeks}**`)

            let favoredCourse = await db.collection("users").findOne({_id: interaction.user.id, 'favorite_courses.crn': courses[chosenCourse].crn});
            
            const button = favoredCourse ? createUnfavoriteButton() : createFavoriteButton();
        
            const infoMenu = new ActionRowBuilder()
                .addComponents(button);

            await i.update({components: [infoMenu], embeds: [embed]});
        });

        const buttonCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 })

        var i = 0;

        buttonCollector.on('collect', async inter => { //This shares so much with favorites. Should try and combine them somewhere else.
            if (inter.customId === "fav") {
                db.collection("users").findOneAndUpdate({_id: interaction.user.id}, {$push: {favorite_courses: {...courses[chosenCourse], term: term, subject: subject}}});
                const favButton = createUnfavoriteButton();

                const infoMenu = new ActionRowBuilder()
                    .addComponents(favButton);
                
                return await inter.update({components: [infoMenu]});
            }
            if (inter.customId === "unfav") {
                db.collection("users").findOneAndUpdate({_id: interaction.user.id}, {$pull: {favorite_courses: {['crn']: courses[chosenCourse].crn}}});
                const favButton = createFavoriteButton();

                const infoMenu = new ActionRowBuilder()
                    .addComponents(favButton)

                return await inter.update({components: [infoMenu]});
            }
            if (inter.customId === "next") i += 25;
            else i -= 25;
            if (i < 0) i = 0;
            let j = i+25;
            if (j > courses.length) j = courses.length;

            const selectNew = new StringSelectMenuBuilder()
                .setCustomId('course')
                .setPlaceholder('Select a course')

            courses.slice(i, j).forEach(course => {
                selectNew.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(course.title)
                        .setDescription(`${subject}${course.crsNum} w/ ${course.instructor}`)
                        .setValue(course.crn)
                );
            });

            const menuNew = new ActionRowBuilder()
                .addComponents(selectNew);

            const prevButtonNew = createPrevButton()
                .setDisabled(i == 0)
            
            const nextButtonNew = createNextButton()
                .setDisabled(j == courses.length)

            const buttonsNew = new ActionRowBuilder()
                .addComponents(prevButtonNew, nextButtonNew, urlButton);
            
            await inter.update({components: [menuNew, buttonsNew]});
        });
	},
};