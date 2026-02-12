const { PermissionFlagsBits } = require('discord.js');
const { mutes } = require('../../utils/db');
const { createEmbed, addServerFooter, sendLog, replyError, makeKey } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'unmute',
    description: 'Remove o silenciamento de um membro',
    options: [{
      name: 'usuario',
      description: 'Quem vai ser dessilenciado',
      type: 6,
      required: true
    }],
    default_member_permissions: PermissionFlagsBits.ModerateMembers.toString()
  },

  async execute(interaction, client) {
    const target = interaction.options.getMember('usuario');

    if (!target) {
      return replyError(interaction, 'Usuário não encontrado no servidor.');
    }

    if (!target.isCommunicationDisabled()) {
      return replyError(interaction, 'Este usuário não está silenciado.');
    }

    try {
      await target.timeout(null, `Dessilenciado por ${interaction.user.tag}`);

      // Remove do database
      const key = makeKey(interaction.guildId, target.id);
      mutes.delete(key);

      const embed = createEmbed(
        '✅ Membro Dessilenciado',
        `**Usuário:** ${target.user.username}\n` +
        `**ID:** ${target.id}\n` +
        `**Moderador:** ${interaction.user.username}`,
        '#00ff00'
      );
      addServerFooter(embed, interaction.guild);

      await interaction.reply({ embeds: [embed] });

      // Log
      const logEmbed = createEmbed(
        'Log: Unmute',
        `**Usuário:** ${target.user.tag} (${target.id})\n` +
        `**Moderador:** ${interaction.user.tag}`,
        '#00ff00'
      );
      addServerFooter(logEmbed, interaction.guild);
      
      await sendLog(client, interaction.guildId, logEmbed);

    } catch (error) {
      console.error('Erro ao dessilenciar:', error);
      return replyError(interaction, 'Não consegui dessilenciar esse usuário.');
    }
  }
};
