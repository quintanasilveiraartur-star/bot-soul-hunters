const { PermissionFlagsBits } = require('discord.js');
const { warnings } = require('../../utils/db');
const { createEmbed, addServerFooter, sendLog, replyError, makeKey } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'clearwarns',
    description: 'Limpa os avisos de um membro',
    options: [{
      name: 'usuario',
      description: 'Usuário para limpar avisos',
      type: 6,
      required: true
    }],
    default_member_permissions: PermissionFlagsBits.Administrator.toString()
  },

  async execute(interaction, client) {
    const target = interaction.options.getUser('usuario');
    const key = makeKey(interaction.guildId, target.id);
    
    const userWarnings = warnings.get(key) || [];

    if (userWarnings.length === 0) {
      return replyError(interaction, 'Este usuário não tem avisos para limpar.');
    }

    warnings.delete(key);

    const embed = createEmbed(
      'Avisos Limpos',
      `**Usuário:** ${target.username}\n` +
      `**Avisos removidos:** ${userWarnings.length}\n` +
      `**Moderador:** ${interaction.user.tag}`
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });

    // Log
    const logEmbed = createEmbed(
      'Log: Clear Warns',
      `**Usuário:** ${target.tag} (${target.id})\n` +
      `**Avisos removidos:** ${userWarnings.length}\n` +
      `**Moderador:** ${interaction.user.tag}`,
      '#00ffff'
    );
    addServerFooter(logEmbed, interaction.guild);
    
    await sendLog(client, interaction.guildId, logEmbed);
  }
};
