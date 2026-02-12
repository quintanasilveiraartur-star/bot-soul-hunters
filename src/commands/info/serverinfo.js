const { createEmbed, addServerFooter } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'serverinfo',
    description: 'Mostra informações do servidor'
  },

  async execute(interaction) {
    const guild = interaction.guild;

    const embed = createEmbed(
      'Informações do Servidor',
      `**Nome:** ${guild.name}\n` +
      `**ID:** ${guild.id}\n` +
      `**Dono:** <@${guild.ownerId}>\n` +
      `**Membros:** ${guild.memberCount}\n` +
      `**Canais:** ${guild.channels.cache.size}\n` +
      `**Cargos:** ${guild.roles.cache.size}\n` +
      `**Criado em:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>`
    );
    
    if (guild.iconURL()) {
      embed.setThumbnail(guild.iconURL({ size: 1024 }));
    }
    
    addServerFooter(embed, guild);

    await interaction.reply({ embeds: [embed] });
  }
};
