const { createEmbed, addServerFooter } = require('../../utils/helpers');
const { getFrases } = require('../../utils/contentData');

module.exports = {
  data: {
    name: 'frase',
    description: 'Recebe uma frase aleatória (atualizado a cada 10 min)',
    options: [{
      name: 'tipo',
      description: 'Tipo de frase',
      type: 3,
      required: false,
      choices: [
        { name: 'Motivacional', value: 'motivacional' },
        { name: 'Engraçada', value: 'engracada' },
        { name: 'Reflexão', value: 'reflexao' }
      ]
    }]
  },

  async execute(interaction) {
    const tipo = interaction.options.getString('tipo') || 'motivacional';
    const frases = getFrases(tipo);
    const frase = frases[Math.floor(Math.random() * frases.length)];

    const embed = createEmbed(
      `Frase ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
      '```\n' + frase + '\n```'
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
