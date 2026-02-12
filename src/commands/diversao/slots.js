const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError } = require('../../utils/helpers');

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
const PAYOUTS = {
  '🍒🍒🍒': 2,
  '🍋🍋🍋': 3,
  '🍊🍊🍊': 4,
  '🍇🍇🍇': 5,
  '🔔🔔🔔': 10,
  '💎💎💎': 20,
  '7️⃣7️⃣7️⃣': 50
};

module.exports = {
  data: {
    name: 'slots',
    description: 'Joga no caça-níqueis',
    options: [{
      name: 'aposta',
      description: 'Quantia para apostar',
      type: 4,
      required: true,
      min_value: 10
    }]
  },

  async execute(interaction) {
    const aposta = interaction.options.getInteger('aposta');
    const key = makeKey(interaction.guildId, interaction.user.id);

    let userData = economy.get(key);
    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    if (userData.coins < aposta) {
      return replyError(interaction, 'Você não tem coins suficientes');
    }

    // Gira os slots
    const slot1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const slot2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const slot3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

    const result = `${slot1}${slot2}${slot3}`;
    const payout = PAYOUTS[result];

    let message = '';
    let color = '#ff0000';
    let ganho = -aposta;

    if (payout) {
      ganho = aposta * payout;
      userData.coins += ganho;
      message = `**GANHOU!** Multiplicador: **${payout}x**\n\n` +
        `- **Ganho:** \`${ganho} coins\``;
      color = '#00ff00';
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      ganho = Math.floor(aposta * 0.5);
      userData.coins += ganho - aposta;
      message = `**Quase!** Você recuperou metade\n\n` +
        `- **Ganho:** \`${ganho - aposta} coins\``;
      color = '#ffaa00';
    } else {
      userData.coins -= aposta;
      message = `**Perdeu!** Tente novamente\n\n` +
        `- **Perda:** \`-${aposta} coins\``;
    }

    economy.set(key, userData);

    const embed = createEmbed(
      'Caça-Níqueis',
      `- **Aposta:** \`${aposta} coins\`\n\n` +
      `╔═══════════╗\n` +
      `║  ${slot1}  ${slot2}  ${slot3}  ║\n` +
      `╚═══════════╝\n\n` +
      `${message}\n\n` +
      `- **Saldo atual:** \`${userData.coins} coins\``,
      color
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
