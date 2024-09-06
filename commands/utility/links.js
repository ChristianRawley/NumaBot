const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
import { constants } from "./constants/constants.js"

module.exports = {
	data: new SlashCommandBuilder()
		.setName('links')
		.setDescription('View popular links'),

	async run(interaction, db) {
        const linkEmbed = new EmbedBuilder()
            .setTitle('Useful Links')
            .setColor('Navy')
            .setDescription(this.buildDescription())
            interaction.reply({embeds: [linkEmbed], ephemeral: true})
	},

    buildDescription() {
        let description = "";
        for (let i = 0; i < constants.DESCRIPTIONS.length; i++) {
            description += `<:link:1254240852759547924> [${constants.DESCRIPTIONS[i].title}](${constants.DESCRIPTIONS[i].url})\n`
        }
    }
};