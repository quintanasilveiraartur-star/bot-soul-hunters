const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { economy, inventory } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError, cleanExpiredItems } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'negociar',
    description: 'Negocia coins ou itens com outro usuário',
    options: [
      {
        name: 'usuario',
        description: 'Usuário para negociar',
        type: 6,
        required: true
      },
      {
        name: 'suas-coins',
        description: 'Quantidade de coins que você oferece',
        type: 4,
        required: false,
        minValue: 0
      },
      {
        name: 'coins-pedidas',
        description: 'Quantidade de coins que você pede',
        type: 4,
        required: false,
        minValue: 0
      }
    ]
  },

  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const offerCoins = interaction.options.getInteger('suas-coins') || 0;
    const requestCoins = interaction.options.getInteger('coins-pedidas') || 0;
    const sender = interaction.user;

    if (target.id === sender.id) {
      return replyError(interaction, 'Você não pode negociar consigo mesmo');
    }

    if (target.bot) {
      return replyError(interaction, 'Você não pode negociar com bots');
    }

    if (offerCoins === 0 && requestCoins === 0) {
      return replyError(interaction, 'Você precisa oferecer ou pedir algo');
    }

    const senderKey = makeKey(interaction.guildId, sender.id);
    const targetKey = makeKey(interaction.guildId, target.id);

    let senderData = economy.get(senderKey);
    let targetData = economy.get(targetKey);

    if (!senderData) {
      senderData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    if (!targetData) {
      targetData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    // Verifica se o sender tem coins suficientes
    if (senderData.coins < offerCoins) {
      return replyError(interaction, `Você não tem ${offerCoins} coins para oferecer`);
    }

    // Verifica se o target tem coins suficientes
    if (targetData.coins < requestCoins) {
      return replyError(interaction, `${target.username} não tem ${requestCoins} coins`);
    }

    let offerText = '';
    if (offerCoins > 0) offerText += `**- Oferece:** \`${offerCoins}\` coins\n`;
    if (requestCoins > 0) offerText += `**- Pede:** \`${requestCoins}\` coins\n`;

    const embed = createEmbed(
      'Proposta de Negociação',
      `${target}, **${sender.username}** quer negociar com você!\n\n` +
      offerText + '\n' +
      `> Use os botões abaixo para aceitar ou recusar.`
    );
    addServerFooter(embed, interaction.guild);

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`trade_accept_${sender.id}_${offerCoins}_${requestCoins}`)
          .setLabel('Aceitar')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`trade_decline_${sender.id}`)
          .setLabel('Recusar')
          .setStyle(ButtonStyle.Danger)
      );

    const response = await interaction.reply({ 
      content: `${target}`, 
      embeds: [embed], 
      components: [buttons] 
    });

    const collector = response.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== target.id) {
        return i.reply({ content: 'Apenas a pessoa convidada pode responder', ephemeral: true });
      }

      if (i.customId.startsWith('trade_accept')) {
        // Recarrega dados
        senderData = economy.get(senderKey);
        targetData = economy.get(targetKey);

        // Verifica novamente
        if (senderData.coins < offerCoins) {
          const errorEmbed = createEmbed('Negociação Cancelada', `${sender.username} não tem mais coins suficientes`);
          return i.update({ embeds: [errorEmbed], components: [] });
        }

        if (targetData.coins < requestCoins) {
          const errorEmbed = createEmbed('Negociação Cancelada', `${target.username} não tem mais coins suficientes`);
          return i.update({ embeds: [errorEmbed], components: [] });
        }

        // Realiza a troca
        senderData.coins -= offerCoins;
        senderData.coins += requestCoins;
        targetData.coins += offerCoins;
        targetData.coins -= requestCoins;

        economy.set(senderKey, senderData);
        economy.set(targetKey, targetData);

        const successEmbed = createEmbed(
          'Negociação Concluída',
          `> A negociação foi realizada com sucesso!\n\n` +
          `**${sender.username}:**\n` +
          `**- Deu:** \`${offerCoins}\` coins\n` +
          `**- Recebeu:** \`${requestCoins}\` coins\n` +
          `**- Saldo:** \`${senderData.coins}\` coins\n\n` +
          `**${target.username}:**\n` +
          `**- Deu:** \`${requestCoins}\` coins\n` +
          `**- Recebeu:** \`${offerCoins}\` coins\n` +
          `**- Saldo:** \`${targetData.coins}\` coins`
        );
        successEmbed.setColor('#00FF00');
        addServerFooter(successEmbed, interaction.guild);
        await i.update({ embeds: [successEmbed], components: [] });
      } else {
        const declineEmbed = createEmbed(
          'Negociação Recusada',
          `**${target.username}** recusou a negociação`
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
