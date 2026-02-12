const { createEmbed, addServerFooter, random } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'shipar',
    description: 'Shipa duas pessoas',
    options: [
      {
        name: 'pessoa1',
        description: 'Primeira pessoa',
        type: 6,
        required: true
      },
      {
        name: 'pessoa2',
        description: 'Segunda pessoa',
        type: 6,
        required: true
      }
    ]
  },

  async execute(interaction) {
    const pessoa1 = interaction.options.getUser('pessoa1');
    const pessoa2 = interaction.options.getUser('pessoa2');
    
    const porcentagem = random(0, 100);
    
    let mensagem;
    if (porcentagem < 20) {
      mensagem = 'Nem tenta, não vai rolar';
    } else if (porcentagem < 40) {
      mensagem = 'Chances baixas, mas quem sabe';
    } else if (porcentagem < 60) {
      mensagem = 'Pode ser, tem potencial';
    } else if (porcentagem < 80) {
      mensagem = 'Combinação perfeita';
    } else {
      mensagem = 'Casamento confirmado';
    }
    
    const barraCheia = Math.floor(porcentagem / 10);
    const barraVazia = 10 - barraCheia;
    const barra = '█'.repeat(barraCheia) + '░'.repeat(barraVazia);

    const embed = createEmbed(
      'Shipador',
      `**${pessoa1.username}** + **${pessoa2.username}**\n\n` +
      '```yaml\n' +
      `Compatibilidade: ${porcentagem}%\n` +
      '```\n' +
      `${barra}\n\n` +
      `**Resultado:** ${mensagem}`
    );
    embed.setThumbnail(pessoa1.displayAvatarURL());
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
