const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('links')
		.setDescription('View popular links'),

	async run(interaction, db) {
        const linkEmbed = new EmbedBuilder()
            .setTitle('Useful Links')
            .setColor('Navy')
            .setDescription(`<:link:1254240852759547924> [Apps Dashboard](https://myapplications.microsoft.com/)
                <:link:1254240852759547924> [Banner Self-Service](https://slbanformsp1-oc.uafs.edu:8888/banprod/twbkwbis.P_WWWLogin?ret_code=SSFA)
                <:link:1254240852759547924> [UAFS Official Website](https://uafs.edu/)
                <:link:1254240852759547924> [Blackboard Learn](https://blackboard.uafs.edu/ultra)
                <:link:1254240852759547924> [Course Schedule](https://slbanformsp1-oc.uafs.edu:8888/banprod/hxskschd.FS_P_Schedule)
                <:link:1254240852759547924> [Lions CareerLink](https://uafortsmith-csm.symplicity.com/students/?signin_tab=0)
                <:link:1254240852759547924> [Online Business Center (Cashnet)](https://commerce.cashnet.com/UAFSpay)
                <:link:1254240852759547924> [Refunds](https://www.refundselection.com/refundselection/#/welcome/continue)
                <:link:1254240852759547924> [MyUAFS](https://my.uafs.edu)
                <:link:1254240852759547924> [Admissions Portal](https://lions.uafs.edu/apply)
                <:link:1254240852759547924> [Dining](https://dineoncampus.com/uafs)
                <:link:1254240852759547924> [Bookstore](https://www.bkstr.com/uafsstore/home)`)
            interaction.reply({embeds: [linkEmbed], ephemeral: true})
	},
};