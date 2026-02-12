const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { guilds } = require('../../utils/db');
const { createEmbed, addServerFooter, replyError, replySuccess } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'sugerir',
    description: 'Envia uma sugestão',
    options: [{
      name: 'sugestao',
      description: 'Sua sugestão',
      type: 3,
      required: true
    }]
  },

  async execute(interaction) {
    const sugestao = interaction.options.getString('sugestao');
    const config = guilds.get(interaction.guildId);

    if (!config || !config.logChannel) {
      return replyError(interaction, 'Canal de sugestões não configurado. Use /painel para configurar');
    }

    const channel = interaction.guild.channels.cache.get(config.logChannel);
    if (!channel) {
      return replyError(interaction, 'Canal de sugestões não encontrado');
    }

    const embed = createEmbed(
      'Nova Sugestão',
      sugestao
    );
    embed.setFooter({ text: `Sugerido por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('approve_suggestion')
          .setLabel('Aprovar')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('reject_suggestion')
          .setLabel('Rejeitar')
          .setStyle(ButtonStyle.Danger)
      );

    const message = await channel.send({ embeds: [embed], components: [buttons] });
    await message.react('👍');
    await message.react('👎');

    await replySuccess(interaction, 'Sugestão enviada com sucesso');
  }
};
