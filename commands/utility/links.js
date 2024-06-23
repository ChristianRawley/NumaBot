const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('links')
		.setDescription('View popular links'),

	async run(interaction, db) {
        const linkEmbed = new EmbedBuilder()
            .setTitle('Useful Links')
            .setColor('Navy')
            .setDescription(`- [Apps Dashboard](https://myapplications.microsoft.com/)<:link:1254240852759547924>
                    - Includes Microsoft 365 apps, LionsCash, NUMA Link, Follett Discover, Navigate, and more.
                \n- [Student Services & Financial Aid](https://slbanformsp1-oc.uafs.edu:8888/banprod/twbkwbis.P_WWWLogin?ret_code=SSFA)<:link:1254240852759547924>
                \n- [UAFS Official Website](https://uafs.edu/)<:link:1254240852759547924>
                \n- [Blackboard Learn](https://blackboard.uafs.edu/ultra)<:link:1254240852759547924>
                \n- [Course Schedule](https://slbanformsp1-oc.uafs.edu:8888/banprod/hxskschd.FS_P_Schedule)<:link:1254240852759547924>
                \n- [Lions CareerLink](https://uafortsmith-csm.symplicity.com/students/?signin_tab=0)<:link:1254240852759547924>`)
            interaction.reply({embeds: [linkEmbed], ephemeral: true})
	},
};