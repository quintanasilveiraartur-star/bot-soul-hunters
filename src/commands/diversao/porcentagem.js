const { createEmbed, addServerFooter, random } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'porcentagem',
    description: 'Quanto % você é algo',
    options: [{
      name: 'caracteristica',
      description: 'O que medir',
      type: 3,
      required: true,
      choices: [
        { name: 'Gamer', value: 'gamer' },
        { name: 'Sortudo', value: 'sortudo' },
        { name: 'Inteligente', value: 'inteligente' },
        { name: 'Engraçado', value: 'engraçado' },
        { name: 'Bonito', value: 'bonito' },
        { name: 'Carismático', value: 'carismatico' },
        { name: 'Preguiçoso', value: 'preguicoso' },
        { name: 'Corajoso', value: 'corajoso' }
      ]
    }]
  },

  async execute(interaction) {
    const caracteristica = interaction.options.getString('caracteristica');
    const valor = random(0, 100);
    
    const barraCheia = Math.floor(valor / 10);
    const barraVazia = 10 - barraCheia;
    const barra = '█'.repeat(barraCheia) + '░'.repeat(barraVazia);

    const embed = createEmbed(
      'Medidor de Porcentagem',
      `**${interaction.user.username}** é **${valor}%** ${caracteristica}\n\n` +
      `${barra}\n\n` +
      '```diff\n' +
      `${valor >= 70 ? '+ Nível Alto' : valor >= 40 ? '~ Nível Médio' : '- Nível Baixo'}\n` +
      '```'
    );
    embed.setThumbnail(interaction.user.displayAvatarURL());
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
