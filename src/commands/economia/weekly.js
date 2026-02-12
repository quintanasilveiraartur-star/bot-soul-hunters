const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, formatTimeLeft, random } = require('../../utils/helpers');

const WEEKLY_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 dias
const MIN_REWARD = 3000;
const MAX_REWARD = 5000;

module.exports = {
  data: {
    name: 'weekly',
    description: 'Pega sua recompensa semanal'
  },

  async execute(interaction) {
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = {
        coins: 0,
        lastDaily: 0,
        lastWeekly: 0
      };
    }

    const now = Date.now();
    const timeSinceWeekly = now - userData.lastWeekly;

    if (timeSinceWeekly < WEEKLY_COOLDOWN) {
      const timeLeft = WEEKLY_COOLDOWN - timeSinceWeekly;
      
      const embed = createEmbed(
        'Calma lá',
        `Você já pegou seu weekly essa semana!\n` +
        `Volta daqui **${formatTimeLeft(timeLeft)}**`
      );
      addServerFooter(embed, interaction.guild);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const reward = random(MIN_REWARD, MAX_REWARD);
    userData.coins += reward;
    userData.lastWeekly = now;

    economy.set(key, userData);

    const embed = createEmbed(
      'Weekly Coletado',
      `Você ganhou **${reward} coins**!\n\n` +
      `**Saldo total:** ${userData.coins} coins\n\n` +
      'Volte semana que vem pra pegar mais!'
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
