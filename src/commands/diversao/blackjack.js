const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError } = require('../../utils/helpers');

const games = new Map();

const CARDS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠️', '♥️', '♦️', '♣️'];

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const card of CARDS) {
      deck.push({ card, suit });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function getCardValue(card) {
  if (card.card === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.card)) return 10;
  return parseInt(card.card);
}

function calculateHand(hand) {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    value += getCardValue(card);
    if (card.card === 'A') aces++;
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

function formatHand(hand, hideFirst = false) {
  if (hideFirst) {
    return `🎴 ${hand.slice(1).map(c => `${c.card}${c.suit}`).join(' ')}`;
  }
  return hand.map(c => `${c.card}${c.suit}`).join(' ');
}

module.exports = {
  data: {
    name: 'blackjack',
    description: 'Joga blackjack contra o bot',
    options: [{
      name: 'aposta',
      description: 'Quantia para apostar',
      type: 4,
      required: true,
      min_value: 50
    }]
  },

  async execute(interaction) {
    const aposta = interaction.options.getInteger('aposta');
    const key = makeKey(interaction.guildId, interaction.user.id);

    if (games.has(interaction.user.id)) {
      return replyError(interaction, 'Você já tem um jogo em andamento');
    }

    let userData = economy.get(key);
    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    if (userData.coins < aposta) {
      return replyError(interaction, 'Você não tem coins suficientes');
    }

    const deck = createDeck();
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];

    const game = {
      deck,
      playerHand,
      dealerHand,
      aposta,
      key
    };

    games.set(interaction.user.id, game);

    const playerValue = calculateHand(playerHand);
    const dealerValue = calculateHand([dealerHand[0]]);

    // Blackjack natural
    if (playerValue === 21) {
      games.delete(interaction.user.id);
      userData.coins += Math.floor(aposta * 1.5);
      economy.set(key, userData);

      const embed = createEmbed(
        'Blackjack',
        `> **Suas cartas:** ${formatHand(playerHand)} = **21**\n` +
        `> **Dealer:** ${formatHand(dealerHand)} = **${calculateHand(dealerHand)}**\n\n` +
        `**BLACKJACK!** Você ganhou **${Math.floor(aposta * 1.5)} coins**\n\n` +
        `- **Saldo:** \`${userData.coins} coins\``,
        '#00ff00'
      );
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed] });
    }

    const embed = createEmbed(
      'Blackjack',
      `- **Aposta:** \`${aposta} coins\`\n\n` +
      `> **Suas cartas:** ${formatHand(playerHand)} = **${playerValue}**\n` +
      `> **Dealer:** ${formatHand(dealerHand, true)} = **${dealerValue}+**\n\n` +
      'Escolha sua ação:'
    );
    addServerFooter(embed, interaction.guild);

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('bj_hit')
          .setLabel('Hit (Pedir)')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('bj_stand')
          .setLabel('Stand (Parar)')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('bj_double')
          .setLabel('Double (Dobrar)')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(userData.coins < aposta * 2)
      );

    await interaction.reply({ embeds: [embed], components: [buttons] });

    // Timeout de 60 segundos
    setTimeout(() => {
      if (games.has(interaction.user.id)) {
        games.delete(interaction.user.id);
        interaction.editReply({ 
          content: 'Tempo esgotado! Jogo cancelado.', 
          embeds: [], 
          components: [] 
        });
      }
    }, 60000);
  }
};

// Exporta funções para o handler
module.exports.games = games;
module.exports.calculateHand = calculateHand;
module.exports.formatHand = formatHand;
