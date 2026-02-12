const { createEmbed, addServerFooter, replySuccess } = require('../../utils/helpers');

const reminders = new Map();

function parseTime(timeStr) {
  const regex = /(\d+)([smhd])/g;
  let totalMs = 0;
  let match;

  while ((match = regex.exec(timeStr)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': totalMs += value * 1000; break;
      case 'm': totalMs += value * 60 * 1000; break;
      case 'h': totalMs += value * 60 * 60 * 1000; break;
      case 'd': totalMs += value * 24 * 60 * 60 * 1000; break;
    }
  }

  return totalMs;
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

module.exports = {
  data: {
    name: 'lembrar',
    description: 'Define um lembrete',
    options: [
      {
        name: 'tempo',
        description: 'Tempo (ex: 1h, 30m, 2d)',
        type: 3,
        required: true
      },
      {
        name: 'mensagem',
        description: 'O que lembrar',
        type: 3,
        required: true
      }
    ]
  },

  async execute(interaction) {
    const timeStr = interaction.options.getString('tempo');
    const message = interaction.options.getString('mensagem');

    const ms = parseTime(timeStr);

    if (ms < 60000) {
      const embed = createEmbed(
        'Erro',
        '- Tempo mínimo: **1 minuto**',
        '#ff0000'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (ms > 30 * 24 * 60 * 60 * 1000) {
      const embed = createEmbed(
        'Erro',
        '- Tempo máximo: **30 dias**',
        '#ff0000'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const reminderId = `${interaction.user.id}_${Date.now()}`;
    
    const timeout = setTimeout(async () => {
      reminders.delete(reminderId);

      const embed = createEmbed(
        'Lembrete',
        `> **Você pediu para lembrar:**\n\n${message}`
      );
      addServerFooter(embed, interaction.guild);

      try {
        await interaction.user.send({ embeds: [embed] });
      } catch (err) {
        // Se não conseguir enviar DM, tenta no canal
        try {
          await interaction.followUp({ 
            content: `${interaction.user}`, 
            embeds: [embed] 
          });
        } catch (e) {
          console.error('Erro ao enviar lembrete:', e);
        }
      }
    }, ms);

    reminders.set(reminderId, {
      timeout,
      userId: interaction.user.id,
      message,
      time: Date.now() + ms
    });

    await replySuccess(
      interaction, 
      `Lembrete definido para daqui **${formatTime(ms)}**`
    );
  }
};

module.exports.reminders = reminders;
