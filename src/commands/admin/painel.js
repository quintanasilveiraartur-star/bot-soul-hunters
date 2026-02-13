const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { guilds } = require('../../utils/db');

module.exports = {
  data: {
    name: 'painel',
    description: 'Abre o painel de configuração do servidor',
    default_member_permissions: PermissionFlagsBits.Administrator.toString()
  },

  async execute(interaction) {
    const config = guilds.get(interaction.guildId) || {};
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`${interaction.user.username}`)
      .setDescription(
        `**Seja Bem-Vindo(a) ${interaction.user.username}!**\n\n` +
        `> Olá! Seja Bem-Vindo(a) ao nosso painel de gerenciamento,\n` +
        `> desenvolvido para você que quer melhorar seu sistema de\n` +
        `> gerenciamento, oferecer mais qualidade e segurança. Configure o\n` +
        `> bot de acordo com suas necessidades.\n\n` +
        `**Informações:**\n\n` +
        `- **Nome da Aplicação:** \`Soul Hunters Bot\`\n` +
        `- **Tempo em funcionamento:** há ${days > 0 ? `${days} dias` : `${hours} horas`}\n` +
        `- **Desenvolvido por:** Soul Hunters Technology\n\n` +
        `**Sistema:**\n\n` +
        `- **Status:** Online\n` +
        `- **Servidores:** \`${interaction.client.guilds.cache.size}\`\n` +
        `- **Usuários:** \`${interaction.client.users.cache.size}\`\n` +
        `- **Comandos:** \`${interaction.client.commands.size}\``
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({
        text: `${interaction.guild.name}`,
        iconURL: interaction.guild.iconURL() || undefined
      });

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_logs')
          .setLabel('📋 Logs')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('panel_security')
          .setLabel('🛡️ Security')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('panel_config')
          .setLabel('⚙️ Configurações')
          .setStyle(ButtonStyle.Secondary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_status')
          .setLabel('📊 Status do Sistema')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('panel_help')
          .setLabel('❓ Ajuda')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('panel_info')
          .setLabel('ℹ️ Informações')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row1, row2], ephemeral: true });
  }
};
