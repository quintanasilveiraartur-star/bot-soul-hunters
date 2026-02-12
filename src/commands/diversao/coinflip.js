const { createEmbed, addServerFooter, randomChoice } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'coinflip',
    description: 'Cara ou coroa',
    options: [{
      name: 'escolha',
      description: 'Sua aposta',
      type: 3,
      required: true,
      choices: [
        { name: 'Cara', value: 'cara' },
        { name: 'Coroa', value: 'coroa' }
      ]
    }]
  },

  async execute(interaction) {
    const escolha = interaction.options.getString('escolha');
    const resultado = randomChoice(['cara', 'coroa']);
    const ganhou = escolha === resultado;

    const embed = createEmbed(
      'Cara ou Coroa',
      `**Sua escolha:** ${escolha}\n` +
      `**Resultado:** ${resultado}\n\n` +
      `${ganhou ? 'Você ganhou!' : 'Você perdeu!'}`
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
