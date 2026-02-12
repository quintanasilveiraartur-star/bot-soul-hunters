const { createEmbed, addServerFooter, randomChoice } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'escolher',
    description: 'Escolhe entre opções (separe por vírgula)',
    options: [{
      name: 'opcoes',
      description: 'Ex: pizza, hamburguer, sushi',
      type: 3,
      required: true
    }]
  },

  async execute(interaction) {
    const input = interaction.options.getString('opcoes');
    const opcoes = input.split(',').map(o => o.trim()).filter(o => o.length > 0);

    if (opcoes.length < 2) {
      const embed = createEmbed(
        'Erro',
        'Precisa ter pelo menos 2 opções separadas por vírgula',
        '#ff0000'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const escolhida = randomChoice(opcoes);

    const embed = createEmbed(
      'Escolha',
      `Eu escolho: **${escolhida}**`
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
