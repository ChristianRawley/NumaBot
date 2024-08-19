const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
axios.defaults.httpsAgent = httpsAgent;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('calendar')
		.setDescription('View the academic and registration calendar'),

	async run(interaction, db) {

        interaction.reply({content: "Loading", ephemeral: true}).then(async  () => {
            let month = interaction.createdAt.toString().substring(interaction.createdAt.toString().indexOf(" ")+1);
            month = month.substring(0, month.indexOf(" "));
            
            const data = await axios.get('https://uafs.edu/academics/academic-guidance/registrar/calendar/index.php');
            const $ = cheerio.load(data.data);

            var i = 0;
            while (month !== $('.col-12').find('h2').eq(i).text().substring(0, 3)) {
                i++;

            }
            let info = $('.col-12').find('h2').eq(i).next().find('tr').text().split("\n");
            
            var desc = "";
            for (i in info) {
                if (!isNaN(info[i]) && !isNaN(parseFloat(info[i]))) {
                    desc += `**${month+info[i]}:** ${info[parseInt(i, 10)+2]}\n`;
                }
            }

            const calendarEmbed = new EmbedBuilder()
                .setTitle('Calendar')
                .setColor('Navy')
                .setDescription(desc)
            interaction.editReply({content: "Loaded!", embeds: [calendarEmbed]})
        });
    }
};