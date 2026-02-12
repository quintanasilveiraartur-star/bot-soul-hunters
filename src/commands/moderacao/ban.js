const { PermissionFlagsBits } = require('discord.js');
const { createEmbed, addServerFooter, canModerate, sendLog, replyError } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'ban',
    description: 'Bane um membro do servidor',
    options: [
      {
        name: 'usuario',
        description: 'Quem vai tomar ban',
        type: 6,
        required: true
      },
      {
        name: 'motivo',
        description: 'Por que tá banindo?',
        type: 3,
        required: false
      }
    ],
    default_member_permissions: PermissionFlagsBits.BanMembers.toString()
  },

  async execute(interaction, client) {
    const target = interaction.options.getMember('usuario');
    const reason = interaction.options.getString('motivo') || 'Sem motivo especificado';

    if (!target) {
      return replyError(interaction, 'Usuário não encontrado no servidor.');
    }

    if (target.id === interaction.user.id) {
      return replyError(interaction, 'Você não pode se banir.');
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return replyError(interaction, 'Você não pode banir esse usuário pois ele tem um cargo igual ou superior ao seu.');
    }

    if (!canModerate(interaction.member, target)) {
      return replyError(interaction, 'Não consigo banir esse usuário. Verifique as permissões.');
    }

    if (!target.bannable) {
      return replyError(interaction, 'Não consigo banir esse usuário. Ele pode ter um cargo superior ao meu.');
    }

    try {
      // Tenta enviar DM antes de banir
      const dmEmbed = createEmbed(
        '🔨 Você foi banido',
        `**Servidor:** ${interaction.guild.name}\n` +
        `**Moderador:** ${interaction.user.username}\n` +
        `**Motivo:** ${reason}\n\n` +
        `Se acha que foi injusto, entre em contato com a administração.`,
        '#ff0000'
      );
      
      await target.send({ embeds: [dmEmbed] }).catch(() => {
        // Ignora se não conseguir enviar DM
      });

      // Bane o usuário
      await target.ban({ reason: `${interaction.user.tag}: ${reason}` });

      // Responde no canal
      const embed = createEmbed(
        '🔨 Membro Banido',
        `**Usuário:** ${target.user.username}\n` +
        `**ID:** ${target.id}\n` +
        `**Moderador:** ${interaction.user.username}\n` +
        `**Motivo:** ${reason}`,
        '#ff0000'
      );
      addServerFooter(embed, interaction.guild);

      await interaction.reply({ embeds: [embed] });

      // Log
      const logEmbed = createEmbed(
        'Log: Ban',
        `**Usuário:** ${target.user.tag} (${target.id})\n` +
        `**Moderador:** ${interaction.user.tag}\n` +
        `**Motivo:** ${reason}`,
        '#ff0000'
      );
      addServerFooter(logEmbed, interaction.guild);
      
      await sendLog(client, interaction.guildId, logEmbed);

    } catch (error) {
      console.error('Erro ao banir:', error);
      return replyError(interaction, 'Não consegui banir esse usuário. Verifique minhas permissões.');
    }
  }
};
