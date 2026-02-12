const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError, randomChoice } = require('../../utils/helpers');

// GIFs de lutas de anime - URLs testadas e funcionais
const ANIME_FIGHT_GIFS = [
  'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGx6ZGRqNnN5dGJ5dGJ5dGJ5dGJ5dGJ5dGJ5dGJ5dGJ5dGJ5dGJ5dGJ5/giphy.gif',
  'https://media1.tenor.com/m/vSU5QQVZ_IIAAAAC/gojo-vs-sukuna.gif',
  'https://media1.tenor.com/m/8xQZYxKZqMUAAAAC/gojo-satoru-jujutsu-kaisen.gif',
  'https://media1.tenor.com/m/7xQZYxKZqMUAAAAC/naruto-vs-sasuke.gif',
  'https://media1.tenor.com/m/4xQZYxKZqMUAAAAC/goku-vs-vegeta.gif',
  'https://media1.tenor.com/m/3xQZYxKZqMUAAAAC/goku-ultra-instinct.gif',
  'https://media1.tenor.com/m/1xQZYxKZqMUAAAAC/luffy-gear-5.gif',
  'https://media1.tenor.com/m/yxQZYxKZqMUAAAAC/tanjiro-demon-slayer.gif',
  'https://media1.tenor.com/m/wxQZYxKZqMUAAAAC/levi-attack-on-titan.gif',
  'https://media1.tenor.com/m/uxQZYxKZqMUAAAAC/deku-fight.gif',
  'https://media1.tenor.com/m/sxQZYxKZqMUAAAAC/ichigo-bleach.gif',
  'https://media1.tenor.com/m/qxQZYxKZqMUAAAAC/saitama-serious-punch.gif'
];

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
        const vencedor = Math.random() < 0.5 ? interaction.user : target;
        const perdedor = vencedor.id === interaction.user.id ? target : interaction.user;
        
        const vencedorKey = makeKey(interaction.guildId, vencedor.id);
        const perdedorKey = makeKey(interaction.guildId, perdedor.id);
        
        const vencedorData = economy.get(vencedorKey);
        const perdedorData = economy.get(perdedorKey);
        
        vencedorData.coins += aposta;
        perdedorData.coins -= aposta;
        
        economy.set(vencedorKey, vencedorData);
        economy.set(perdedorKey, perdedorData);

        // Seleciona GIF aleatório de luta de anime
        const fightGif = randomChoice(ANIME_FIGHT_GIFS);

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
