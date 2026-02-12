const { createEmbed, addServerFooter } = require('../../utils/helpers');
const { getLojaItens } = require('../../utils/contentData');

module.exports = {
  data: {
    name: 'loja',
    description: 'Ver itens disponíveis na loja (novos itens a cada 10 min)'
  },

  async execute(interaction) {
    const itens = getLojaItens();

    const embed = createEmbed(
      'Loja de Itens',
      'Bem-vindo à **loja oficial** do servidor!\n' +
      'Compre itens exclusivos com seus **coins**.\n\n' +
      '```yaml\n' +
      'Itens Disponíveis:\n' +
      '```'
    );

    // Adiciona até 8 itens (limite de fields do Discord)
    itens.slice(0, 8).forEach((item, index) => {
      embed.addFields({
        name: `${item.emoji} ${item.name}`,
        value: `**Preço:** \`${item.price} coins\`\n${item.description}`,
        inline: true
      });
    });

    embed.setThumbnail(interaction.guild.iconURL());
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
