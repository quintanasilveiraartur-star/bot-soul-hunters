const { createEmbed, addServerFooter, random } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'dado',
    description: 'Rola um dado de 6 lados'
  },

  async execute(interaction) {
    const resultado = random(1, 6);

    const embed = createEmbed(
      'Dado',
      `Você tirou **${resultado}**`
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
