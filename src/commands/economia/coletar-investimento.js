const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError, random } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'coletar-investimento',
    description: 'Coleta o retorno do seu investimento'
  },

  async execute(interaction) {
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    // Verifica se tem investimento
    if (!userData.investment) {
      return replyError(interaction, 'Você não tem nenhum investimento ativo');
    }

    // Verifica se o tempo passou
    if (userData.investment.endTime > Date.now()) {
      const timeLeft = userData.investment.endTime - Date.now();
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      const embed = createEmbed(
        'Investimento em Andamento',
        `> Seu investimento ainda não está pronto!\n\n` +
        `**- Valor investido:** \`${userData.investment.amount}\` coins\n` +
        `**- Tempo restante:** \`${hoursLeft}h ${minutesLeft}m\`\n\n` +
        `> Aguarde mais um pouco para coletar.`
      );
      embed.setColor('#FFA500');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Calcula retorno (50% a 100% de lucro, ou 20% de chance de perder 30%)
    const investedAmount = userData.investment.amount;
    const chance = Math.random();
    let returnAmount, profit, result;

    if (chance < 0.2) {
      // Perdeu 30%
      returnAmount = Math.floor(investedAmount * 0.7);
      profit = returnAmount - investedAmount;
      result = 'perdeu';
    } else {
      // Ganhou entre 50% e 100%
      const multiplier = 1.5 + (Math.random() * 0.5);
      returnAmount = Math.floor(investedAmount * multiplier);
      profit = returnAmount - investedAmount;
      result = 'ganhou';
    }

    userData.coins += returnAmount;
    delete userData.investment;
    economy.set(key, userData);

    const embed = createEmbed(
      'Investimento Coletado',
      `> Seu investimento foi resgatado!\n\n` +
      `**- Valor investido:** \`${investedAmount}\` coins\n` +
      `**- Retorno:** \`${returnAmount}\` coins\n` +
      `**- ${result === 'ganhou' ? 'Lucro' : 'Prejuízo'}:** \`${Math.abs(profit)}\` coins\n` +
      `**- Saldo atual:** \`${userData.coins}\` coins`
    );
    embed.setColor(result === 'ganhou' ? '#00FF00' : '#FF0000');
    addServerFooter(embed, interaction.guild);
    await interaction.reply({ embeds: [embed] });
  }
};
