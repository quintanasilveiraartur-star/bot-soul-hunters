const { createEmbed, addServerFooter } = require('../../utils/helpers');
const { getPalavraMimica } = require('../../utils/contentData');

module.exports = {
  data: {
    name: 'mimica',
    description: 'Sorteia uma palavra para mímica (atualizado a cada 10 min)'
  },

  async execute(interaction) {
    const palavra = getPalavraMimica();

    const embed = createEmbed(
      'Mímica',
      `Sua palavra é: ||${palavra}||\n\n` +
      'Faça a mímica sem falar!'
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
