const { ActionRowBuilder, ButtonBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
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
            .addChoices(
                { name: 'Any Status', value: '%'},
                { name: 'Canceled', value: 'X'},
                { name: 'Closed', value: 'C'},
                { name: 'Completed', value: 'P'},
                { name: 'In Progress', value: 'I'},
                { name: 'Open', value: 'O'},
                { name: 'Restricted', value: 'R'},
                { name: 'Waitlisted', value: 'W'}))
        .addStringOption(option => 
            option
            .setName('section')
            .setDescription('Select section')
            .setRequired(true)
            .addChoices(
                { name: 'Any Section', value: '%'},
                { name: 'Full-online', value: '%E'},
                { name: 'Hybrid', value: '%Y'},
                { name: 'Web-enhanced', value: '%D'},
                { name: '8 Week', value: '%G'},
                { name: 'Sequential', value: '%S'},
                { name: 'Weekend', value: '%W'},
                { name: 'Day', value: '0'},
                { name: 'Night', value: '9'},
                { name: 'Independent Study', value: '%A'},
                { name: 'Block', value: '%B'},
                { name: 'Honors', value: '%H'},
                { name: 'Intersession/Maymester/Special', value: '%Z'}))
        .addStringOption(option => 
            option
            .setName('crs')
            .setDescription('Enter course number')),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        let choices;
        const data = await axios.get('https://slbanformsp1-oc.uafs.edu:8888/banprod/hxskschd.FS_P_Schedule');
        const $ = cheerio.load(data.data);
        if (focusedOption.name === 'term') {
            choices = $('select[name="term"] option').map((index, element) => {
                return {
                    name: $(element).text(),
                    value: $(element).val()
                }
            }).get();
        } else if (focusedOption.name === 'subject') {
            choices = $('select[name="sel_subj"] option').map((index, element) => {
                return {
                    name: $(element).text(),
                    value: $(element).val()
                }
            }).get();
        }

		const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedOption.value.toLowerCase()));
        if (filtered.length > 25) options = filtered.slice(0, 25);
        else options = filtered;
    
		await interaction.respond(options);
    },

	async run(interaction, db) {
        let user = await db.collection("users").findOne({_id: interaction.user.id});
        if (!user) await db.collection("users").insertOne({_id: interaction.user.id, favorite_courses: []});
        user = await db.collection("users").findOne({_id: interaction.user.id});
        const term = interaction.options.getString('term');
        const subject = interaction.options.getString('subject');
        let status = interaction.options.getString('status');
        if (status == "%") status = "";
        const section = interaction.options.getString('section');
        const crs = interaction.options.getString('cts') ?? '';
        let data = await axios.get('https://slbanformsp1-oc.uafs.edu:8888/banprod/hxskschd.FS_P_Schedule');
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

        data = await axios.get(`https://slbanformsp1-oc.uafs.edu:8888/banprod/hxskschd.P_ListSchClassSimple?sel_subj=abcde&sel_day=abcde&sel_status=abcde&term=${term}&sel_status=%25${status}&sel_subj=${subject}&sel_sec=%25${section}&sel_crse=${crs}&begin_hh=00&begin_mi=00&end_hh=00&end_mi=00`);
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

        const urlButton = new ButtonBuilder()
            .setLabel('View in browser')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://slbanformsp1-oc.uafs.edu:8888/banprod/hxskschd.P_ListSchClassSimple?sel_subj=abcde&sel_day=abcde&sel_status=abcde&term=${term}&sel_status=%25${status}&sel_subj=${subject}&sel_sec=%25${section}&sel_crse=${crs}&begin_hh=00&begin_mi=00&end_hh=00&end_mi=00`)
        
        const prevButton = new ButtonBuilder()
            .setDisabled(true)
            .setCustomId('prev')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('1251027880935297126');

        const nextButton = new ButtonBuilder()
            .setDisabled(courses.length <= 25)
            .setCustomId('next')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('1251027909347508247');

        const menu = new ActionRowBuilder()
			.addComponents(select);
        
        const buttons = new ActionRowBuilder()
            .addComponents(prevButton, nextButton, urlButton);

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
                .setURL(`https://slbanformsp1-oc.uafs.edu:8888/banprod/hxskschd.P_ListSchClassSimple?sel_subj=abcde&sel_day=abcde&sel_status=abcde&term=${term}&sel_status=%25${status}&sel_subj=${subject}&sel_sec=%25${section}&sel_crse=${crs}&begin_hh=00&begin_mi=00&end_hh=00&end_mi=00`)
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

            let favId = 'fav';
            let favLabel = "Favorite";
            let favStyle = ButtonStyle.Success;

            let favoredCourse = await db.collection("users").findOne({_id: interaction.user.id, 'favorite_courses.crn': courses[chosenCourse].crn});
            if (favoredCourse) {
                favId = 'unfav';
                favLabel = "Unfavorite";
                favStyle = ButtonStyle.Danger;
            }
            const favButton = new ButtonBuilder()
                .setCustomId(favId)
                .setLabel(favLabel)
                .setStyle(favStyle)
                .setEmoji('⭐');
        
            const infoMenu = new ActionRowBuilder()
                .addComponents(favButton);

            await i.update({components: [infoMenu], embeds: [embed]});
        });

        const buttonCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 })

        var i = 0;

        buttonCollector.on('collect', async inter => {
            if (inter.customId === "fav") {
                db.collection("users").findOneAndUpdate({_id: interaction.user.id}, {$push: {favorite_courses: {...courses[chosenCourse], term: term, subject: subject}}});
                const favButton = new ButtonBuilder()
                    .setCustomId('unfav')
                    .setLabel('Unfavorite')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⭐');

                const infoMenu = new ActionRowBuilder()
                    .addComponents(favButton);
                
                return await inter.update({components: [infoMenu]});
            }
            if (inter.customId === "unfav") {
                db.collection("users").findOneAndUpdate({_id: interaction.user.id}, {$pull: {favorite_courses: {['crn']: courses[chosenCourse].crn}}});
                const favButton = new ButtonBuilder()
                    .setCustomId('fav')
                    .setLabel('Favorite')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('⭐');

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
            const prevButtonNew = new ButtonBuilder()
                .setDisabled(i == 0)
                .setCustomId('prev')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('1251027880935297126');
            
            const nextButtonNew = new ButtonBuilder()
                .setDisabled(j == courses.length)
                .setCustomId('next')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('1251027909347508247');

            const buttonsNew = new ActionRowBuilder()
                .addComponents(prevButtonNew, nextButtonNew, urlButton);
            
            await inter.update({components: [menuNew, buttonsNew]});
        });
	},
};