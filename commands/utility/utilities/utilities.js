import { ButtonBuilder, ButtonStyle } from "discord.js";
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

export function createFavoriteButton() {
  new ButtonBuilder()
    .setCustomId('fav')
    .setLabel('Favorite')
    .setStyle(ButtonStyle.Success)
    .setEmoji(constants.EMOJIS.STAR)
}

export function createUnfavoriteButton() {
  new ButtonBuilder()
    .setCustomId('unfav')
    .setLabel('Unfavorite')
    .setStyle(ButtonStyle.Success)
    .setEmoji(constants.EMOJIS.STAR)
}

