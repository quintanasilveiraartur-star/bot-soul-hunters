const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'investir',
    description: 'Investe coins e recebe retorno após 2 horas',
    options: [{
      name: 'quantia',
      description: 'Quantia para investir (mínimo: 100)',
      type: 4,
      required: true,
      minValue: 100
    }]
  },

  async execute(interaction) {
    const quantia = interaction.options.getInteger('quantia');
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    // Verifica se já tem investimento ativo
    if (userData.investment && userData.investment.endTime > Date.now()) {
      const timeLeft = userData.investment.endTime - Date.now();
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      const embed = createEmbed(
        'Investimento Ativo',
        `> Você já tem um investimento em andamento!\n\n` +
        `**- Valor investido:** \`${userData.investment.amount}\` coins\n` +
        `**- Tempo restante:** \`${hoursLeft}h ${minutesLeft}m\`\n\n` +
        `> Aguarde o investimento terminar para fazer outro.`
      );
      embed.setColor('#FFA500');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (userData.coins < quantia) {
      return replyError(interaction, 'Você não tem coins suficientes para investir');
    }

    // Desconta o valor
    userData.coins -= quantia;
    
    // Cria o investimento (2 horas)
    const endTime = Date.now() + (2 * 60 * 60 * 1000);
    userData.investment = {
      amount: quantia,
      endTime: endTime
    };
    
    economy.set(key, userData);

    const embed = createEmbed(
      'Investimento Realizado',
      `> Você investiu **${quantia} coins** com sucesso!\n\n` +
      `**- Valor investido:** \`${quantia}\` coins\n` +
      `**- Retorno em:** \`2 horas\`\n` +
      `**- Retorno esperado:** \`${Math.floor(quantia * 1.5)}\` a \`${Math.floor(quantia * 2)}\` coins\n\n` +
      `> Use \`/coletar-investimento\` após 2 horas para resgatar!`
    );
    embed.setColor('#00FF00');
    addServerFooter(embed, interaction.guild);
    await interaction.reply({ embeds: [embed] });
  }
};
