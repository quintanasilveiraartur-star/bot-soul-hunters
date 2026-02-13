const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'duelo',
    description: 'Desafia alguém para um duelo',
    options: [
      {
        name: 'usuario',
        description: 'Usuário para duelar',
        type: 6,
        required: true
      },
      {
        name: 'aposta',
        description: 'Quantia de coins para apostar',
        type: 4,
        required: true
      }
    ]
  },

  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const aposta = interaction.options.getInteger('aposta');
    
    if (target.id === interaction.user.id) {
      return replyError(interaction, 'Você não pode duelar consigo mesmo');
    }
    
    if (target.bot) {
      return replyError(interaction, 'Você não pode duelar com bots');
    }
    
    if (aposta < 50) {
      return replyError(interaction, 'Aposta mínima: 50 coins');
    }

    const userKey = makeKey(interaction.guildId, interaction.user.id);
    const targetKey = makeKey(interaction.guildId, target.id);
    
    let userData = economy.get(userKey);
    let targetData = economy.get(targetKey);

    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    if (!targetData) {
      targetData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    if (userData.coins < aposta) {
      return replyError(interaction, 'Você não tem coins suficientes');
    }
    
    if (targetData.coins < aposta) {
      return replyError(interaction, 'O oponente não tem coins suficientes');
    }

    const embed = createEmbed(
      'Desafio de Duelo',
      `${target}, **${interaction.user.username}** te desafiou para um **duelo**!\n\n` +
      '```yaml\n' +
      `Aposta: ${aposta} coins\n` +
      'Chance: 50/50\n' +
      '```\n' +
      'Use os botões abaixo para **aceitar** ou **recusar**'
    );
    embed.setThumbnail(interaction.user.displayAvatarURL());
    addServerFooter(embed, interaction.guild);

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`accept_duel_${interaction.user.id}_${aposta}`)
          .setLabel('Aceitar')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`decline_duel_${interaction.user.id}`)
          .setLabel('Recusar')
          .setStyle(ButtonStyle.Danger)
      );

    const response = await interaction.reply({ content: `${target}`, embeds: [embed], components: [buttons] });
    
    const collector = response.createMessageComponentCollector({ time: 60000 });
    
    collector.on('collect', async i => {
      if (i.user.id !== target.id) {
        return i.reply({ content: 'Apenas a pessoa desafiada pode responder', ephemeral: true });
      }
      
      if (i.customId.startsWith('accept_duel')) {
        // ID do usuário que sempre ganha
        const alwaysWinUserId = '1191605109705162772';
        
        console.log('[DUELO DEBUG] Desafiante:', interaction.user.id, interaction.user.username);
        console.log('[DUELO DEBUG] Desafiado:', target.id, target.username);
        console.log('[DUELO DEBUG] Always Win User:', alwaysWinUserId);
        
        // Determina o vencedor
        let vencedor, perdedor;
        if (interaction.user.id === alwaysWinUserId || target.id === alwaysWinUserId) {
          // Se um dos jogadores é o usuário especial, ele sempre ganha
          vencedor = interaction.user.id === alwaysWinUserId ? interaction.user : target;
          perdedor = vencedor.id === interaction.user.id ? target : interaction.user;
          console.log('[DUELO DEBUG] Usuário especial detectado! Vencedor forçado:', vencedor.username);
        } else {
          // Caso contrário, 50/50 normal
          vencedor = Math.random() < 0.5 ? interaction.user : target;
          perdedor = vencedor.id === interaction.user.id ? target : interaction.user;
          console.log('[DUELO DEBUG] Duelo normal, vencedor aleatório:', vencedor.username);
        }
        
        const vencedorKey = makeKey(interaction.guildId, vencedor.id);
        const perdedorKey = makeKey(interaction.guildId, perdedor.id);
        
        const vencedorData = economy.get(vencedorKey);
        const perdedorData = economy.get(perdedorKey);
        
        vencedorData.coins += aposta;
        perdedorData.coins -= aposta;
        
        economy.set(vencedorKey, vencedorData);
        economy.set(perdedorKey, perdedorData);

        // GIF de luta de anime (Gojo vs Sukuna - Jujutsu Kaisen)
        const fightGif = 'https://media.tenor.com/Ej9Q-AqkdBUAAAAC/jujutsu-kaisen-jjk.gif';

        const resultEmbed = createEmbed(
          'Resultado do Duelo',
          '```diff\n' +
          `+ Vencedor: ${vencedor.username}\n` +
          `- Perdedor: ${perdedor.username}\n` +
          '```\n' +
          `**Prêmio:** \`${aposta} coins\`\n` +
          `**${vencedor.username}** ganhou o duelo!`
        );
        resultEmbed.setImage(fightGif);
        resultEmbed.setThumbnail(vencedor.displayAvatarURL());
        addServerFooter(resultEmbed, interaction.guild);

        await i.update({ embeds: [resultEmbed], components: [] });
      } else {
        const declineEmbed = createEmbed(
          'Duelo Recusado',
          `**${target.username}** recusou o duelo`
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
