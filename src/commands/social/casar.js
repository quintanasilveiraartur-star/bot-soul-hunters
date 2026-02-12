const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { marriages } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'casar',
    description: 'Pede alguém em casamento',
    options: [{
      name: 'usuario',
      description: 'Pessoa para casar',
      type: 6,
      required: true
    }]
  },

  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    
    if (target.id === interaction.user.id) {
      return replyError(interaction, 'Você não pode casar consigo mesmo');
    }
    
    if (target.bot) {
      return replyError(interaction, 'Você não pode casar com um bot');
    }

    const userKey = makeKey(interaction.guildId, interaction.user.id);
    const targetKey = makeKey(interaction.guildId, target.id);
    
    if (marriages.has(userKey)) {
      return replyError(interaction, 'Você já está casado(a)');
    }
    
    if (marriages.has(targetKey)) {
      return replyError(interaction, 'Esta pessoa já está casada');
    }

    const embed = createEmbed(
      'Pedido de Casamento',
      `${target}, **${interaction.user.username}** está te pedindo em **casamento**!\n\n` +
      '```\n' +
      'Esta é uma decisão importante...\n' +
      '```\n' +
      'Use os botões abaixo para **aceitar** ou **recusar**'
    );
    embed.setThumbnail(interaction.user.displayAvatarURL());
    addServerFooter(embed, interaction.guild);

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`accept_marriage_${interaction.user.id}`)
          .setLabel('Aceitar')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`decline_marriage_${interaction.user.id}`)
          .setLabel('Recusar')
          .setStyle(ButtonStyle.Danger)
      );

    const response = await interaction.reply({ content: `${target}`, embeds: [embed], components: [buttons] });
    
    const collector = response.createMessageComponentCollector({ time: 60000 });
    
    collector.on('collect', async i => {
      if (i.user.id !== target.id) {
        return i.reply({ content: 'Apenas a pessoa mencionada pode responder', ephemeral: true });
      }
      
      if (i.customId.startsWith('accept_marriage')) {
        marriages.set(userKey, target.id);
        marriages.set(targetKey, interaction.user.id);

        const acceptEmbed = createEmbed(
          'Casamento Realizado',
          `**${interaction.user.username}** e **${target.username}** agora são **casados**!\n\n` +
          '```diff\n' +
          '+ Parabéns pelo casamento!\n' +
          '```\n' +
          'Que sejam muito felizes juntos!'
        );
        embed.setThumbnail(interaction.guild.iconURL());
        addServerFooter(acceptEmbed, interaction.guild);

        await i.update({ embeds: [acceptEmbed], components: [] });
      } else {
        const declineEmbed = createEmbed(
          'Pedido Recusado',
          `**${target.username}** recusou o pedido de casamento`
        );

        await i.update({ embeds: [declineEmbed], components: [] });
      }
      
      collector.stop();
    });
    
    collector.on('end', (collected) => {
      if (collected.size === 0) {
        interaction.editReply({ content: 'Tempo esgotado', embeds: [], components: [] });
      }
    });
  }
};
