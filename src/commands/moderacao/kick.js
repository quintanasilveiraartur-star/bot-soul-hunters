const { PermissionFlagsBits } = require('discord.js');
const { createEmbed, addServerFooter, canModerate, sendLog, replyError } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'kick',
    description: 'Expulsa um membro do servidor',
    options: [
      {
        name: 'usuario',
        description: 'Quem vai ser expulso',
        type: 6,
        required: true
      },
      {
        name: 'motivo',
        description: 'Por que tá expulsando?',
        type: 3,
        required: false
      }
    ],
    default_member_permissions: PermissionFlagsBits.KickMembers.toString()
  },

  async execute(interaction, client) {
    const target = interaction.options.getMember('usuario');
    const reason = interaction.options.getString('motivo') || 'Sem motivo especificado';

    if (!target) {
      return replyError(interaction, 'Usuário não encontrado no servidor.');
    }

    if (target.id === interaction.user.id) {
      return replyError(interaction, 'Você não pode se expulsar.');
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return replyError(interaction, 'Você não pode expulsar esse usuário pois ele tem um cargo igual ou superior ao seu.');
    }

    if (!canModerate(interaction.member, target)) {
      return replyError(interaction, 'Não consigo expulsar esse usuário. Verifique as permissões.');
    }

    if (!target.kickable) {
      return replyError(interaction, 'Não consigo expulsar esse usuário. Ele pode ter um cargo superior ao meu.');
    }

    try {
      // Tenta enviar DM antes de expulsar
      const dmEmbed = createEmbed(
        '👢 Você foi expulso',
        `**Servidor:** ${interaction.guild.name}\n` +
        `**Moderador:** ${interaction.user.username}\n` +
        `**Motivo:** ${reason}`,
        '#ff9900'
      );
      
      await target.send({ embeds: [dmEmbed] }).catch(() => {});

      await target.kick(`${interaction.user.tag}: ${reason}`);

      const embed = createEmbed(
        '👢 Membro Expulso',
        `**Usuário:** ${target.user.username}\n` +
        `**ID:** ${target.id}\n` +
        `**Moderador:** ${interaction.user.username}\n` +
        `**Motivo:** ${reason}`,
        '#ff9900'
      );
      addServerFooter(embed, interaction.guild);

      await interaction.reply({ embeds: [embed] });

      // Log
      const logEmbed = createEmbed(
        'Log: Kick',
        `**Usuário:** ${target.user.tag} (${target.id})\n` +
        `**Moderador:** ${interaction.user.tag}\n` +
        `**Motivo:** ${reason}`,
        '#ff9900'
      );
      addServerFooter(logEmbed, interaction.guild);
      
      await sendLog(client, interaction.guildId, logEmbed);

    } catch (error) {
      console.error('Erro ao expulsar:', error);
      return replyError(interaction, 'Não consegui expulsar esse usuário.');
    }
  }
};
