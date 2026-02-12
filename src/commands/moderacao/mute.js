const { PermissionFlagsBits } = require('discord.js');
const { mutes } = require('../../utils/db');
const { createEmbed, addServerFooter, canModerate, sendLog, replyError, makeKey } = require('../../utils/helpers');

// Função para parsear tempo (1s, 1m, 1h, 1d)
function parseTime(timeString) {
  const match = timeString.match(/^(\d+)([smhd])$/i);
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  const multipliers = {
    's': 1000,           // segundos
    'm': 60 * 1000,      // minutos
    'h': 60 * 60 * 1000, // horas
    'd': 24 * 60 * 60 * 1000 // dias
  };
  
  return value * multipliers[unit];
}

// Função para formatar tempo legível
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} dia${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return `${seconds} segundo${seconds > 1 ? 's' : ''}`;
}

module.exports = {
  data: {
    name: 'mute',
    description: 'Silencia um membro',
    options: [
      {
        name: 'usuario',
        description: 'Quem vai ser silenciado',
        type: 6,
        required: true
      },
      {
        name: 'duracao',
        description: 'Duração (ex: 30s, 5m, 2h, 1d)',
        type: 3,
        required: true
      },
      {
        name: 'motivo',
        description: 'Por que tá silenciando?',
        type: 3,
        required: false
      }
    ],
    default_member_permissions: PermissionFlagsBits.ModerateMembers.toString()
  },

  async execute(interaction, client) {
    const target = interaction.options.getMember('usuario');
    const durationInput = interaction.options.getString('duracao');
    const reason = interaction.options.getString('motivo') || 'Sem motivo especificado';

    if (!target) {
      return replyError(interaction, 'Usuário não encontrado no servidor.');
    }

    if (target.id === interaction.user.id) {
      return replyError(interaction, 'Você não pode se silenciar.');
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return replyError(interaction, 'Você não pode silenciar esse usuário pois ele tem um cargo igual ou superior ao seu.');
    }

    if (!canModerate(interaction.member, target)) {
      return replyError(interaction, 'Não consigo silenciar esse usuário. Verifique as permissões.');
    }

    // Parse da duração
    const durationMs = parseTime(durationInput);
    
    if (!durationMs) {
      return replyError(interaction, 'Formato de duração inválido. Use: `30s`, `5m`, `2h` ou `1d`');
    }

    // Discord permite no máximo 28 dias
    const maxDuration = 28 * 24 * 60 * 60 * 1000;
    if (durationMs > maxDuration) {
      return replyError(interaction, 'Duração máxima é de 28 dias.');
    }

    if (durationMs < 1000) {
      return replyError(interaction, 'Duração mínima é de 1 segundo.');
    }

    try {
      const muteEnd = Date.now() + durationMs;
      
      await target.timeout(durationMs, `${interaction.user.tag}: ${reason}`);

      // Salva no database
      const key = makeKey(interaction.guildId, target.id);
      mutes.set(key, {
        until: muteEnd,
        reason: reason,
        moderator: interaction.user.id
      });

      const durationFormatted = formatDuration(durationMs);

      // DM para o usuário
      const dmEmbed = createEmbed(
        '🔇 Você foi silenciado',
        `**Servidor:** ${interaction.guild.name}\n` +
        `**Moderador:** ${interaction.user.username}\n` +
        `**Motivo:** ${reason}\n` +
        `**Duração:** ${durationFormatted}\n\n` +
        `Evite comportamentos que violem a segurança do servidor.`,
        '#ff0000'
      );
      
      await target.send({ embeds: [dmEmbed] }).catch(() => {});

      const embed = createEmbed(
        '🔇 Membro Silenciado',
        `**Usuário:** ${target.user.username}\n` +
        `**ID:** ${target.id}\n` +
        `**Moderador:** ${interaction.user.username}\n` +
        `**Duração:** ${durationFormatted}\n` +
        `**Motivo:** ${reason}`,
        '#ff0000'
      );
      addServerFooter(embed, interaction.guild);

      await interaction.reply({ embeds: [embed] });

      // Log
      const logEmbed = createEmbed(
        'Log: Mute',
        `**Usuário:** ${target.user.tag} (${target.id})\n` +
        `**Duração:** ${durationFormatted}\n` +
        `**Moderador:** ${interaction.user.tag}\n` +
        `**Motivo:** ${reason}`,
        '#ffaa00'
      );
      addServerFooter(logEmbed, interaction.guild);
      
      await sendLog(client, interaction.guildId, logEmbed);

    } catch (error) {
      console.error('Erro ao silenciar:', error);
      
      if (error.code === 50013) {
        return replyError(interaction, 'Não tenho permissão para silenciar esse usuário. Verifique se meu cargo está acima do cargo dele.');
      }
      
      return replyError(interaction, 'Não consegui silenciar esse usuário. Erro: ' + error.message);
    }
  }
};
