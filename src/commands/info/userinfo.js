const { createEmbed, addServerFooter } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'userinfo',
    description: 'Mostra informações de um usuário',
    options: [{
      name: 'usuario',
      description: 'Usuário para ver informações',
      type: 6,
      required: false
    }]
  },

  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    let desc = `**Nome:** ${user.username}\n` +
      `**ID:** ${user.id}\n` +
      `**Conta criada:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>\n`;

    if (member) {
      desc += `**Entrou no servidor:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>\n` +
        `**Cargos:** ${member.roles.cache.size - 1}`;
    }

    const embed = createEmbed(
      'Informações do Usuário',
      desc
    );
    embed.setThumbnail(user.displayAvatarURL({ size: 256 }));
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
