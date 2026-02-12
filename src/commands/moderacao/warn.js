const { PermissionFlagsBits } = require('discord.js');
const { warnings } = require('../../utils/db');
const { createEmbed, addServerFooter, sendLog, replyError, makeKey } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'warn',
    description: 'Avisa um membro',
    options: [
      {
        name: 'usuario',
        description: 'Quem vai receber o aviso',
        type: 6,
        required: true
      },
      {
        name: 'motivo',
        description: 'Motivo do aviso',
        type: 3,
        required: true
      }
    ],
    default_member_permissions: PermissionFlagsBits.ModerateMembers.toString()
  },

  async execute(interaction, client) {
    const target = interaction.options.getMember('usuario');
    const reason = interaction.options.getString('motivo');

    if (!target) {
      return replyError(interaction, 'Usuário não encontrado no servidor.');
    }

    if (target.id === interaction.user.id) {
      return replyError(interaction, 'Você não pode avisar a si mesmo.');
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return replyError(interaction, 'Você não pode avisar esse usuário pois ele tem um cargo igual ou superior ao seu.');
    }

    try {
      const key = makeKey(interaction.guildId, target.id);
      let userWarnings = warnings.get(key) || [];

      userWarnings.push({
        reason: reason,
        moderator: interaction.user.id,
        timestamp: Date.now()
      });

      warnings.set(key, userWarnings);

      // DM para o usuário
      const dmEmbed = createEmbed(
        '⚠️ Você recebeu um aviso',
        `**Servidor:** ${interaction.guild.name}\n` +
        `**Moderador:** ${interaction.user.username}\n` +
        `**Motivo:** ${reason}\n` +
        `**Total de avisos:** ${userWarnings.length}`,
        '#ffaa00'
      );
      
      await target.send({ embeds: [dmEmbed] }).catch(() => {});

      const embed = createEmbed(
        '⚠️ Aviso Aplicado',
        `**Usuário:** ${target.user.username}\n` +
        `**ID:** ${target.id}\n` +
        `**Moderador:** ${interaction.user.username}\n` +
        `**Motivo:** ${reason}\n` +
        `**Total de avisos:** ${userWarnings.length}`,
        '#ffaa00'
      );
      addServerFooter(embed, interaction.guild);

      await interaction.reply({ embeds: [embed] });

      // Log
      const logEmbed = createEmbed(
        'Log: Warn',
        `**Usuário:** ${target.user.tag} (${target.id})\n` +
        `**Moderador:** ${interaction.user.tag}\n` +
        `**Motivo:** ${reason}\n` +
        `**Total:** ${userWarnings.length}`,
        '#ffff00'
      );
      addServerFooter(logEmbed, interaction.guild);
      
      await sendLog(client, interaction.guildId, logEmbed);

    } catch (error) {
      console.error('Erro ao avisar:', error);
      return replyError(interaction, 'Não consegui aplicar o aviso.');
    }
  }
};
