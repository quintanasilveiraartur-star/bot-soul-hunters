const { createEmbed, addServerFooter, random } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'roll',
    description: 'Rola dados personalizados (ex: 2d6)',
    options: [{
      name: 'dados',
      description: 'Formato: 2d6 (2 dados de 6 lados)',
      type: 3,
      required: true
    }]
  },

  async execute(interaction) {
    const input = interaction.options.getString('dados').toLowerCase();
    const match = input.match(/^(\d+)d(\d+)$/);
    
    if (!match) {
      const embed = createEmbed(
        'Erro',
        'Formato inválido. Use: 2d6 (quantidade + d + lados)',
        '#ff0000'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    const quantidade = parseInt(match[1]);
    const lados = parseInt(match[2]);
    
    if (quantidade < 1 || quantidade > 10) {
      const embed = createEmbed(
        'Erro',
        'Use entre 1 e 10 dados',
        '#ff0000'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    if (lados < 2 || lados > 100) {
      const embed = createEmbed(
        'Erro',
        'Use dados entre 2 e 100 lados',
        '#ff0000'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    const resultados = [];
    let total = 0;
    
    for (let i = 0; i < quantidade; i++) {
      const resultado = random(1, lados);
      resultados.push(resultado);
      total += resultado;
    }

    const embed = createEmbed(
      'Rolagem de Dados',
      `**Dados:** ${quantidade}d${lados}\n` +
      `**Resultados:** ${resultados.join(', ')}\n` +
      `**Total:** ${total}`
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
