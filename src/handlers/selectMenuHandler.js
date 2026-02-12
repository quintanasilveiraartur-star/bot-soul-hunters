const { guilds } = require('../utils/db');
const { createEmbed, addServerFooter } = require('../utils/helpers');

module.exports = {
  async handleSelectMenu(interaction) {
    const { customId, values } = interaction;

    // Configurar canal de logs
    if (customId === 'set_log_channel') {
      const channelId = values[0];
      const channel = interaction.guild.channels.cache.get(channelId);

      let config = guilds.get(interaction.guildId) || {};
      config.logChannel = channelId;
      guilds.set(interaction.guildId, config);

      const embed = createEmbed(
        'Canal de Logs Configurado',
        `Canal de logs definido para ${channel}`
      );
      addServerFooter(embed, interaction.guild);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Configurar canal de boas-vindas
    if (customId === 'set_welcome_channel') {
      const channelId = values[0];
      const channel = interaction.guild.channels.cache.get(channelId);

      let config = guilds.get(interaction.guildId) || {};
      config.welcomeChannel = channelId;
      guilds.set(interaction.guildId, config);

      const embed = createEmbed(
        'Canal de Boas-vindas Configurado',
        `Canal de boas-vindas definido para ${channel}`
      );
      addServerFooter(embed, interaction.guild);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Toggle sistema de segurança
    if (customId === 'toggle_security') {
      const system = values[0];
      
      let config = guilds.get(interaction.guildId) || {};
      config[system] = !config[system];
      guilds.set(interaction.guildId, config);

      const systemNames = {
        antiRaid: 'Anti-Raid',
        antiLink: 'Anti-Link',
        antiFlood: 'Anti-Flood',
        antiSwear: 'Anti-Palavrão',
        antiSpam: 'Anti-Spam',
        antiBot: 'Anti-Bot'
      };

      const embed = createEmbed(
        'Sistema Atualizado',
        `**${systemNames[system]}** foi ${config[system] ? 'ativado' : 'desativado'}`
      );
      addServerFooter(embed, interaction.guild);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
