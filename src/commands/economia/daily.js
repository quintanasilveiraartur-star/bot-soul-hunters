const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, formatTimeLeft, random } = require('../../utils/helpers');

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 horas
const MIN_REWARD = 500;
const MAX_REWARD = 1000;

module.exports = {
  data: {
    name: 'daily',
    description: 'Pega sua recompensa diária'
  },

  async execute(interaction) {
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    // Inicializa se não existir
    if (!userData) {
      userData = {
        coins: 0,
        lastDaily: 0,
        lastWeekly: 0
      };
    }

    const now = Date.now();
    const timeSinceDaily = now - userData.lastDaily;

    // Verifica cooldown
    if (timeSinceDaily < DAILY_COOLDOWN) {
      const timeLeft = DAILY_COOLDOWN - timeSinceDaily;
      
      const embed = createEmbed(
        'Calma lá',
        `Você já pegou seu daily hoje!\n` +
        `Volta daqui **${formatTimeLeft(timeLeft)}**`
      );
      addServerFooter(embed, interaction.guild);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Dá a recompensa
    const reward = random(MIN_REWARD, MAX_REWARD);
    userData.coins += reward;
    userData.lastDaily = now;

    economy.set(key, userData);

    const embed = createEmbed(
      'Daily Coletado',
      `Você ganhou **${reward} coins**!\n\n` +
      `**Saldo total:** ${userData.coins} coins\n\n` +
      'Volte amanhã pra pegar mais!'
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
