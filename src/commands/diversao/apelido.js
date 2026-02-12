const { createEmbed, addServerFooter, random } = require('../../utils/helpers');
const { getApelido } = require('../../utils/contentData');

module.exports = {
  data: {
    name: 'apelido',
    description: 'Gera um apelido aleatório (atualizado a cada 10 min)',
    options: [{
      name: 'usuario',
      description: 'Usuário para gerar apelido',
      type: 6,
      required: false
    }]
  },

  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const apelidoGerado = getApelido();

    const embed = createEmbed(
      'Gerador de Apelidos',
      `**Usuário:** \`${user.username}\`\n\n` +
      '```yaml\n' +
      `Novo Apelido: ${apelidoGerado}\n` +
      '```\n' +
      'Use este apelido com orgulho!'
    );
    embed.setThumbnail(user.displayAvatarURL());
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
