import { ButtonBuilder } from "discord.js";
import { constants } from "../constants/constants.js"

export function createNextButton() {
  new ButtonBuilder()
    .setCustomId('next')
    .setStyle(ButtonStyle.Primary)
    .setEmoji(constants.EMOJIS.NEXT)
}

export function createPrevButton() {
  new ButtonBuilder()
    .setCustomId('prev')
    .setStyle(ButtonStyle.Primary)
    .setEmoji(constants.EMOJIS.PREV)
}