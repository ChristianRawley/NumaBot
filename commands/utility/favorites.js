const { ActionRowBuilder, ButtonBuilder, ComponentType, EmbdedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('favorites')
		.setDescription('View favorited courses'),

	async run(interaction, db) {
        let user = await db.collection("users").findOne({_id: interaction.user.id});
        if (!user) await db.collection("users").insertOne({_id: interaction.user.id, favorite_courses: []});
        user = await db.collection("users").findOne({_id: interaction.user.id});

        if (user.favorite_courses.length == 0) return interaction.reply('You do not have any favorite courses.');
        const favorites = new StringSelectMenuBuilder()
            .setCustomId('favCourse')
            .setPlaceholder('Select a course')

        user.favorite_courses.slice(0, 25).forEach(course => {
            favorites.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(course.title)
                    .setDescription(course.instructor)
                    .setValue(course.crn)
            )
        });
        
        const menu = new ActionRowBuilder()
            .addComponents(favorites)

        const next = new ButtonBuilder()
            .setDisabled(user.favorite_courses.length <= 25)
            .setCustomId('next')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('1251027909347508247')
        
        const prev = new ButtonBuilder()
            .setDisabled(true)
            .setCustomId('prev')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('1251027880935297126')
        
        const navButtons = new ActionRowBuilder()
            .addComponents(prev, next)
        
        const response = await interaction.reply({components: [menu, navButtons], ephemeral: true});

        var j = 0;
        const buttonCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 })
        buttonCollector.on('collect', async i => {
            if (i.customId === 'fav') {
                db.collection("users").findOneAndUpdate({_id: interaction.user.id}, {$push: {favorite_courses: {...user.favorite_courses[chosen], term: user.favorite_courses[chosen].term, subject: user.favorite_courses[chosen].subject}}});
                const favButton = new ButtonBuilder()
                    .setCustomId('unfav')
                    .setLabel('Unfavorite')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⭐');
                
                const infoMenu = new ActionRowBuilder()
                    .addComponents(favButton);

                return await i.update({components: [infoMenu]});
            }
            if (i.customId === "unfav") {
                db.collection("users").findOneAndUpdate({_id: interaction.user.id}, {$pull: {favorite_courses: {['crn']: user.favorite_courses[chosen].crn}}});
                const favButton = new ButtonBuilder()
                    .setCustomId('fav')
                    .setLabel('Favorite')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('⭐');
                    
                const infoMenu = new ActionRowBuilder()
                    .addComponents(favButton)
                
                return await i.update({components: [infoMenu]})
            }
            if (i.customId === 'next') j += 25;
            else j -= 25;
            if (j < 0) j = 0;
            let k = j+25;
            if (k > user.favorite_courses.length) k = user.favorite_courses.length;

            const favoritesNew = new StringSelectMenuBuilder()
                .setCustomId('favCourse')
                .setPlaceholder('Select a course')
            
            user.favorite_courses.slice(j, k).forEach(course => {
                favoritesNew.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(course.title)
                        .setDescription(course.instructor)
                        .setValue(course.crn)
                )
            });

            const menuNew = new ActionRowBuilder()
                .addComponents(favoritesNew)
            
            const prevNew = new ButtonBuilder()
                .setDisabled(j == 0)
                .setCustomId('prev')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('1251027880935297126')

            const nextNew = new ButtonBuilder()
                .setDisabled(k == user.favorite_courses.length)
                .setCustomId('next')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('1251027909347508247')
            
            const navNew = new ActionRowBuilder()
                .addComponents(prevNew, nextNew)
            
            await i.update({components: [menuNew, navNew]});
        } );

        const menuCollector = response.createMessageComponentCollector({componentType: ComponentType.StringSelect, time: 3_600_000 });

        let chosen;
        menuCollector.on('collect', async i => {
            for (let j = 0; j < user.favorite_courses.length; j++) {
                if (user.favorite_courses[j].crn == i.values[0]) {
                    chosen = j;
                    break;
                }
            }
            
            let name = user.favorite_courses[chosen].instructor;
            if (name !== "Staff") name = user.favorite_courses[chosen].instructor.substring(user.favorite_courses[chosen].instructor.indexOf(" ")+1)+" "+user.favorite_courses[chosen].instructor.substring(0, user.favorite_courses[chosen].instructor.indexOf(","));
            const embed = new EmbedBuilder()
                .setTitle(user.favorite_courses[chosen].subject+user.favorite_courses[chosen].crsNum+" "+user.favorite_courses[chosen].title)
                .setColor('Navy')
                .setURL(`https://slbanformsp1-oc.uafs.edu:8888/banprod/hxskschd.P_ListSchClassSimple?sel_subj=abcde&sel_day=abcde&sel_status=abcde&term=${user.favorite_courses[chosen].term}&sel_status=%25${user.favorite_courses[chosen].status}&sel_subj=${user.favorite_courses[chosen].subject}&sel_sec=%25${user.favorite_courses[chosen].section}&sel_crse=${user.favorite_courses[chosen].crs}&begin_hh=00&begin_mi=00&end_hh=00&end_mi=00`)
                .setAuthor({name: "Taught by "+name})
                .setDescription(`Course number (CRN): **${user.favorite_courses[chosen].crn}**
                    Status: **${user.favorite_courses[chosen].status}**
                    Section: **${user.favorite_courses[chosen].secNum}**
                    Credits: **${user.favorite_courses[chosen].crsNum.substring(user.favorite_courses[chosen].crsNum.length-1)}**
                    Students: **${user.favorite_courses[chosen].act}/${user.favorite_courses[chosen].cap}** | **${user.favorite_courses[chosen].rem}** remaining seat(s) left.
                    Meeting time: **${user.favorite_courses[chosen].meetingTime}**
                    Date: **${user.favorite_courses[chosen].date}**
                    Location: **${user.favorite_courses[chosen].location}**
                    Weeks: **${user.favorite_courses[chosen].weeks}**`)

            let favId = 'fav';
            let favLabel = "Favorite";
            let favStyle = ButtonStyle.Success;

            let favoredCourse = await db.collection("users").findOne({_id: interaction.user.id, 'favorite_courses.crn': user.favorite_courses[chosen].crn});
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
        })
	},
};