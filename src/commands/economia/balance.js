const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, formatTimeLeft } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'balance',
    description: 'Ver saldo de coins',
    options: [{
      name: 'usuario',
      description: 'Usuário para ver saldo',
      type: 6,
      required: false
    }]
  },

  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const key = makeKey(interaction.guildId, user.id);
    
    let userData = economy.get(key);
    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    // Calcula próxima cobrança de custo de vida
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    let nextLivingCostInfo = '';
    
    if (userData.lastLivingCostDate && userData.lastLivingCostDate > oneDayAgo) {
      const timeUntilNext = (userData.lastLivingCostDate + (24 * 60 * 60 * 1000)) - now;
      nextLivingCostInfo = `\n💸 Próximo custo de vida: ${formatTimeLeft(timeUntilNext)}`;
    } else {
      const estimatedCost = Math.floor(userData.coins * 0.25);
      nextLivingCostInfo = `\n💸 Custo de vida pendente: ${estimatedCost} coins (25%)`;
    }

    const embed = createEmbed(
      'Saldo',
      `**Usuário:** \`${user.username}\`\n\n` +
      '```yaml\n' +
      `Coins: ${userData.coins}\n` +
      '```' +
      nextLivingCostInfo
    );
    embed.setThumbnail(user.displayAvatarURL());
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
