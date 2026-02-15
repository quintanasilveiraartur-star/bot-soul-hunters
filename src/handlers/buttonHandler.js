const { ChannelType, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { guilds, economy, notifications } = require('../utils/db');
const { createEmbed, addServerFooter, makeKey } = require('../utils/helpers');
const { handleInvest, handleCollectAll, handleViewCharts, handleViewSpecificChart, handleBackToInvest, handleBackToCollect } = require('./cryptoHandler');

const tictactoe = require('../commands/diversao/tictactoe');
const blackjack = require('../commands/diversao/blackjack');

module.exports = {
  async handleButton(interaction) {
    const { customId } = interaction;

    // Handler de quiz
    if (customId.startsWith('quiz_')) {
      const quizCommand = require('../commands/diversao/quiz');
      const parts = customId.split('_');
      const userId = parts[1];
      const opcaoIndex = parseInt(parts[2]);
      
      if (interaction.user.id !== userId) {
        return interaction.reply({ content: 'Este quiz não é seu!', ephemeral: true });
      }
      
      const quizData = quizCommand.activeQuizzes.get(userId);
      if (!quizData) {
        return interaction.reply({ content: 'Quiz expirado! Use `/quiz` novamente.', ephemeral: true });
      }
      
      const respostaEscolhida = quizData.opcoes[opcaoIndex];
      const acertou = respostaEscolhida === quizData.resposta;
      
      // Remove o quiz ativo
      quizCommand.activeQuizzes.delete(userId);
      
      if (acertou) {
        const embed = createEmbed(
          '✅ Resposta Correta!',
          `> **Parabéns!** Você acertou a resposta!\n\n` +
          `### 🎯 Resposta Certa\n\n` +
          `**- Sua resposta:** \`${respostaEscolhida}\`\n` +
          `**- Status:** Correto ✅\n\n` +
          `> Continue jogando para testar seus conhecimentos!`,
          '#00FF00'
        );
        addServerFooter(embed, interaction.guild);
        return interaction.update({ embeds: [embed], components: [] });
      } else {
        const embed = createEmbed(
          '❌ Resposta Errada',
          `> **Ops!** Você errou a resposta.\n\n` +
          `### 📝 Detalhes\n\n` +
          `**- Sua resposta:** \`${respostaEscolhida}\`\n` +
          `**- Resposta correta:** \`${quizData.resposta}\`\n` +
          `**- Status:** Incorreto ❌\n\n` +
          `> Tente novamente com \`/quiz\`!`,
          '#FF0000'
        );
        addServerFooter(embed, interaction.guild);
        return interaction.update({ embeds: [embed], components: [] });
      }
    }

    // Handlers de investimento em cripto
    if (customId.startsWith('invest_')) {
      const parts = customId.split('_');
      const symbol = parts[1];
      const amount = parseInt(parts[2]);
      return handleInvest(interaction, symbol, amount);
    }

    if (customId.startsWith('collect_all_')) {
      return handleCollectAll(interaction);
    }

    if (customId.startsWith('view_charts_')) {
      return handleViewCharts(interaction);
    }

    if (customId.startsWith('view_chart_')) {
      const parts = customId.split('_');
      const symbol = parts[2];
      return handleViewSpecificChart(interaction, symbol);
    }

    if (customId.startsWith('view_charts_back_')) {
      return handleViewCharts(interaction);
    }

    if (customId.startsWith('crypto_back_')) {
      return handleBackToInvest(interaction);
    }

    if (customId.startsWith('crypto_back_collect_')) {
      return handleBackToCollect(interaction);
    }

    // Handler de notificações
    if (customId.startsWith('notify_')) {
      const parts = customId.split('_');
      const command = parts[1]; // 'trabalhar' ou 'apostar'
      
      const key = makeKey(interaction.guildId, interaction.user.id);
      const notifKey = `${key}_${command}`;
      let notifData = notifications.get(notifKey) || { active: false };
      
      // Toggle notificação
      notifData.active = !notifData.active;
      notifData.channelId = interaction.channelId;
      notifData.command = command;
      notifications.set(notifKey, notifData);
      
      const embed = createEmbed(
        notifData.active ? '🔔 Notificação Ativada' : '🔕 Notificação Desativada',
        notifData.active 
          ? `> Você receberá uma mensagem na DM quando o comando **/${command}** estiver disponível novamente!\n\n**• Canal:** <#${interaction.channelId}>\n**• Comando:** \`/${command}\`\n\n> Clique no botão novamente para desativar.`
          : `> As notificações do comando **/${command}** foram desativadas.\n\n> Clique no botão novamente para reativar.`
      );
      embed.setColor(notifData.active ? '#00FF00' : '#FF0000');
      addServerFooter(embed, interaction.guild);
      
      // Agenda notificação se ativada
      if (notifData.active) {
        const cooldown = command === 'apostar' ? 5 * 60 * 1000 : 10 * 60 * 1000;
        setTimeout(async () => {
          const currentNotif = notifications.get(notifKey);
          if (currentNotif && currentNotif.active) {
            try {
              const user = await interaction.client.users.fetch(interaction.user.id);
              const dmEmbed = createEmbed(
                '⏰ Comando Disponível',
                `> Seu comando **/${command}** está disponível novamente!\n\n` +
                `**• Canal:** <#${currentNotif.channelId}>\n**• Comando:** \`/${command}\`\n\n` +
                `> Volte ao servidor e use o comando!`
              );
              dmEmbed.setColor('#00FF00');
              await user.send({ embeds: [dmEmbed] });
              
              // Desativa após enviar
              currentNotif.active = false;
              notifications.set(notifKey, currentNotif);
            } catch (err) {
              console.error('Erro ao enviar notificação DM:', err);
            }
          }
        }, cooldown);
      }
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (customId.startsWith('rank_')) {
      const { rankingCache, generateRankingImage } = require('../commands/info/rank');
      const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
      
      const cached = rankingCache.get(interaction.user.id);
      if (!cached) {
        return interaction.reply({ content: 'Ranking expirado. Use `/rank` novamente.', ephemeral: true });
      }

      const parts = customId.split('_');
      const action = parts[1];
      let currentPage = parseInt(parts[2]);

      if (action === 'next') currentPage++;
      else if (action === 'prev') currentPage--;

      const totalPages = Math.ceil(cached.users.length / 5);
      
      // Gera nova imagem
      const imageBuffer = await generateRankingImage(cached.guild, cached.users, currentPage);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'ranking.png' });

      // Botões atualizados
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`rank_prev_${currentPage}`)
            .setLabel('◀️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setCustomId(`rank_next_${currentPage}`)
            .setLabel('▶️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage >= totalPages - 1)
        );

      await interaction.update({
        content: `📊 **Ranking de XP** - Página ${currentPage + 1}/${totalPages}`,
        files: [attachment],
        components: [row]
      });
    }

    if (customId.startsWith('ttt_')) {
      const parts = customId.split('_');
      const gameId = parts[1];
      const row = parseInt(parts[2]);
      const col = parseInt(parts[3]);

      const game = tictactoe.games.get(gameId);
      if (!game) return interaction.reply({ content: 'Este jogo expirou', ephemeral: true });
      if (interaction.user.id !== game.currentPlayer) return interaction.reply({ content: 'Não é sua vez!', ephemeral: true });

      game.board[row][col] = game.symbol[interaction.user.id];
      const winner = tictactoe.checkWinner(game.board);

      if (winner) {
        tictactoe.games.delete(gameId);
        let message = winner === 'draw' ? '**Empate!** Ninguém ganhou' : `**${(await interaction.client.users.fetch(Object.keys(game.symbol).find(id => game.symbol[id] === winner))).username}** venceu!`;
        const embed = createEmbed('Jogo da Velha - Fim', message);
        addServerFooter(embed, interaction.guild);
        return interaction.update({ embeds: [embed], components: tictactoe.createButtons(game.board, gameId, true) });
      }

      game.currentPlayer = game.currentPlayer === game.player1 ? game.player2 : game.player1;
      const currentUser = await interaction.client.users.fetch(game.currentPlayer);
      const embed = createEmbed('Jogo da Velha', `- Vez de: **${currentUser.username}**`);
      addServerFooter(embed, interaction.guild);
      return interaction.update({ embeds: [embed], components: tictactoe.createButtons(game.board, gameId) });
    }

    if (customId === 'bj_hit') {
      const game = blackjack.games.get(interaction.user.id);
      if (!game) return interaction.reply({ content: 'Jogo não encontrado', ephemeral: true });

      game.playerHand.push(game.deck.pop());
      const playerValue = blackjack.calculateHand(game.playerHand);

      if (playerValue > 21) {
        blackjack.games.delete(interaction.user.id);
        let userData = economy.get(game.key);
        userData.coins -= game.aposta;
        economy.set(game.key, userData);

        const embed = createEmbed('Blackjack - Bust', `- **Suas cartas:** ${blackjack.formatHand(game.playerHand)} = **${playerValue}**\n- **Dealer:** ${blackjack.formatHand(game.dealerHand)}\n\n**BUST!** Você perdeu **${game.aposta} coins**\n\n- **Saldo:** \`${userData.coins} coins\``, '#ff0000');
        addServerFooter(embed, interaction.guild);
        return interaction.update({ embeds: [embed], components: [] });
      }

      const dealerValue = blackjack.calculateHand([game.dealerHand[0]]);
      const embed = createEmbed('Blackjack', `- **Aposta:** \`${game.aposta} coins\`\n\n> **Suas cartas:** ${blackjack.formatHand(game.playerHand)} = **${playerValue}**\n> **Dealer:** ${blackjack.formatHand(game.dealerHand, true)} = **${dealerValue}+**\n\nEscolha sua ação:`);
      addServerFooter(embed, interaction.guild);

      const buttons = new ActionRowBuilder().addComponents(interaction.message.components[0].components[0], interaction.message.components[0].components[1], interaction.message.components[0].components[2].setDisabled(true));
      return interaction.update({ embeds: [embed], components: [buttons] });
    }

    if (customId === 'bj_stand') {
      const game = blackjack.games.get(interaction.user.id);
      if (!game) return interaction.reply({ content: 'Jogo não encontrado', ephemeral: true });

      blackjack.games.delete(interaction.user.id);
      let dealerValue = blackjack.calculateHand(game.dealerHand);
      while (dealerValue < 17) {
        game.dealerHand.push(game.deck.pop());
        dealerValue = blackjack.calculateHand(game.dealerHand);
      }

      const playerValue = blackjack.calculateHand(game.playerHand);
      let userData = economy.get(game.key);
      let message = '', color = '';

      if (dealerValue > 21) {
        userData.coins += game.aposta;
        message = `**Dealer BUST!** Você ganhou **${game.aposta} coins**`;
        color = '#00ff00';
      } else if (playerValue > dealerValue) {
        userData.coins += game.aposta;
        message = `**Você venceu!** Ganhou **${game.aposta} coins**`;
        color = '#00ff00';
      } else if (playerValue < dealerValue) {
        userData.coins -= game.aposta;
        message = `**Dealer venceu!** Você perdeu **${game.aposta} coins**`;
        color = '#ff0000';
      } else {
        message = `**Empate!** Aposta devolvida`;
        color = '#ffaa00';
      }

      economy.set(game.key, userData);
      const embed = createEmbed('Blackjack - Resultado', `- **Suas cartas:** ${blackjack.formatHand(game.playerHand)} = **${playerValue}**\n- **Dealer:** ${blackjack.formatHand(game.dealerHand)} = **${dealerValue}**\n\n${message}\n\n- **Saldo:** \`${userData.coins} coins\``, color);
      addServerFooter(embed, interaction.guild);
      return interaction.update({ embeds: [embed], components: [] });
    }

    if (customId === 'bj_double') {
      const game = blackjack.games.get(interaction.user.id);
      if (!game) return interaction.reply({ content: 'Jogo não encontrado', ephemeral: true });

      blackjack.games.delete(interaction.user.id);
      game.aposta *= 2;
      game.playerHand.push(game.deck.pop());
      const playerValue = blackjack.calculateHand(game.playerHand);

      if (playerValue > 21) {
        let userData = economy.get(game.key);
        userData.coins -= game.aposta;
        economy.set(game.key, userData);

        const embed = createEmbed('Blackjack - Bust', `- **Suas cartas:** ${blackjack.formatHand(game.playerHand)} = **${playerValue}**\n\n**BUST!** Você perdeu **${game.aposta} coins**\n\n- **Saldo:** \`${userData.coins} coins\``, '#ff0000');
        addServerFooter(embed, interaction.guild);
        return interaction.update({ embeds: [embed], components: [] });
      }

      let dealerValue = blackjack.calculateHand(game.dealerHand);
      while (dealerValue < 17) {
        game.dealerHand.push(game.deck.pop());
        dealerValue = blackjack.calculateHand(game.dealerHand);
      }

      let userData = economy.get(game.key);
      let message = '', color = '';

      if (dealerValue > 21 || playerValue > dealerValue) {
        userData.coins += game.aposta;
        message = `**Você venceu!** Ganhou **${game.aposta} coins**`;
        color = '#00ff00';
      } else if (playerValue < dealerValue) {
        userData.coins -= game.aposta;
        message = `**Dealer venceu!** Você perdeu **${game.aposta} coins**`;
        color = '#ff0000';
      } else {
        message = `**Empate!** Aposta devolvida`;
        color = '#ffaa00';
      }

      economy.set(game.key, userData);
      const embed = createEmbed('Blackjack - Resultado', `- **Suas cartas:** ${blackjack.formatHand(game.playerHand)} = **${playerValue}**\n- **Dealer:** ${blackjack.formatHand(game.dealerHand)} = **${dealerValue}**\n\n${message}\n\n- **Saldo:** \`${userData.coins} coins\``, color);
      addServerFooter(embed, interaction.guild);
      return interaction.update({ embeds: [embed], components: [] });
    }

    if (customId === 'panel_logs') {
      const config = guilds.get(interaction.guildId) || {};
      const logChannel = config.logChannel ? `<#${config.logChannel}>` : '`Não configurado`';
      const welcomeChannel = config.welcomeChannel ? `<#${config.welcomeChannel}>` : '`Não configurado`';
      
      const embed = createEmbed(
        'Configuração de Logs',
        `**Configure os canais de registro do servidor:**\n\n` +
        `**Status Atual:**\n` +
        `- **Canal de Logs:** ${logChannel}\n` +
        `- **Canal de Boas-vindas:** ${welcomeChannel}\n\n` +
        `> Selecione abaixo o tipo de canal que deseja configurar:`
      );
      addServerFooter(embed, interaction.guild);

      const channels = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildText).map(c => ({ label: c.name, value: c.id })).slice(0, 25);
      const row1 = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('set_log_channel').setPlaceholder('📝 Selecione o Canal de Logs').addOptions(channels));
      const row2 = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('set_welcome_channel').setPlaceholder('👋 Selecione o Canal de Boas-vindas').addOptions(channels));
      
      const { ButtonBuilder, ButtonStyle } = require('discord.js');
      const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('panel_logs_manual')
          .setLabel('✏️ Digitar Nome do Canal')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('panel_back')
          .setLabel('⬅️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.update({ embeds: [embed], components: [row1, row2, row3] });
    }

    if (customId === 'panel_logs_manual') {
      const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
      
      const modal = new ModalBuilder()
        .setCustomId('modal_logs_manual')
        .setTitle('Configurar Canais Manualmente');

      const logChannelInput = new TextInputBuilder()
        .setCustomId('log_channel_input')
        .setLabel('Canal de Logs (nome ou ID)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: logs ou 1234567890')
        .setRequired(false);

      const welcomeChannelInput = new TextInputBuilder()
        .setCustomId('welcome_channel_input')
        .setLabel('Canal de Boas-vindas (nome ou ID)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: boas-vindas ou 1234567890')
        .setRequired(false);

      const row1 = new ActionRowBuilder().addComponents(logChannelInput);
      const row2 = new ActionRowBuilder().addComponents(welcomeChannelInput);

      modal.addComponents(row1, row2);

      await interaction.showModal(modal);
    }

    if (customId === 'panel_security') {
      const config = guilds.get(interaction.guildId) || {};
      const getStatus = (status) => status ? 'Ativo' : 'Inativo';
      
      const embed = createEmbed(
        'Configuração de Segurança',
        `**Sistemas de proteção do servidor:**\n\n` +
        `**Status dos Sistemas:**\n` +
        `- **Anti-Raid:** ${getStatus(config.antiRaid)}\n` +
        `- **Anti-Link:** ${getStatus(config.antiLink)}\n` +
        `- **Anti-Flood:** ${getStatus(config.antiFlood)}\n` +
        `- **Anti-Palavrão:** ${getStatus(config.antiSwear)}\n` +
        `- **Anti-Spam:** ${getStatus(config.antiSpam)}\n` +
        `- **Anti-Bot:** ${getStatus(config.antiBot)}\n\n` +
        `> Selecione um sistema abaixo para ativar/desativar:`
      );
      addServerFooter(embed, interaction.guild);

      const row1 = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('toggle_security').setPlaceholder('🔒 Selecione um sistema de segurança').addOptions([
        { label: '🛡️ Anti-Raid', value: 'antiRaid', description: 'Protege contra raids de usuários' },
        { label: '🔗 Anti-Link', value: 'antiLink', description: 'Bloqueia links suspeitos' },
        { label: '💬 Anti-Flood', value: 'antiFlood', description: 'Previne flood de mensagens' },
        { label: '🤬 Anti-Palavrão', value: 'antiSwear', description: 'Filtra palavras impróprias' },
        { label: '📢 Anti-Spam', value: 'antiSpam', description: 'Detecta mensagens repetidas' },
        { label: '🤖 Anti-Bot', value: 'antiBot', description: 'Bloqueia bots não autorizados' }
      ]));

      const { ButtonBuilder, ButtonStyle } = require('discord.js');
      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('panel_back')
          .setLabel('⬅️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.update({ embeds: [embed], components: [row1, row2] });
    }

    if (customId === 'panel_back') {
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      
      const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`${interaction.user.username}`)
        .setDescription(
          `**Seja Bem-Vindo(a) ${interaction.user.username}!**\n\n` +
          `> Olá! Seja Bem-Vindo(a) ao nosso painel de gerenciamento,\n` +
          `> desenvolvido para você que quer melhorar seu sistema de\n` +
          `> gerenciamento, oferecer mais qualidade e segurança. Configure o\n` +
          `> bot de acordo com suas necessidades.\n\n` +
          `**Informações:**\n\n` +
          `- **Nome da Aplicação:** \`Soul Hunters Bot\`\n` +
          `- **Tempo em funcionamento:** há ${days > 0 ? `${days} dias` : `${hours} horas`}\n` +
          `- **Desenvolvido por:** Soul Hunters Technology\n\n` +
          `**Sistema:**\n\n` +
          `- **Status:** Online\n` +
          `- **Servidores:** \`${interaction.client.guilds.cache.size}\`\n` +
          `- **Usuários:** \`${interaction.client.users.cache.size}\`\n` +
          `- **Comandos:** \`${interaction.client.commands.size}\``
        )
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({
          text: `${interaction.guild.name}`,
          iconURL: interaction.guild.iconURL() || undefined
        });

      const row1 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('panel_logs')
            .setLabel('📋 Logs')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('panel_security')
            .setLabel('🛡️ Security')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('panel_config')
            .setLabel('⚙️ Configurações')
            .setStyle(ButtonStyle.Secondary)
        );

      const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('panel_status')
            .setLabel('📊 Status do Sistema')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('panel_help')
            .setLabel('❓ Ajuda')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('panel_info')
            .setLabel('ℹ️ Informações')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.update({ embeds: [embed], components: [row1, row2] });
    }

    if (customId === 'panel_config') {
      const config = guilds.get(interaction.guildId) || {};
      const embed = createEmbed(
        'Configurações Gerais',
        `**Configurações do servidor:**\n\n` +
        `- **Prefix:** \`/\` (Slash Commands)\n` +
        `- **Idioma:** \`Português (BR)\`\n` +
        `- **Timezone:** \`America/Sao_Paulo\`\n` +
        `- **XP por mensagem:** \`15-25 XP\`\n` +
        `- **Cooldown XP:** \`60 segundos\`\n\n` +
        `> Use os outros botões para configurações específicas.`
      );
      addServerFooter(embed, interaction.guild);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (customId === 'panel_status') {
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      
      const embed = createEmbed(
        'Status do Sistema',
        `**Informações do bot:**\n\n` +
        `- **Status:** Online\n` +
        `- **Uptime:** \`${days}d ${hours}h ${minutes}m\`\n` +
        `- **Memória:** \`${memUsage} MB\`\n` +
        `- **Ping:** \`${interaction.client.ws.ping}ms\`\n` +
        `- **Servidores:** \`${interaction.client.guilds.cache.size}\`\n` +
        `- **Usuários:** \`${interaction.client.users.cache.size}\`\n` +
        `- **Comandos:** \`${interaction.client.commands.size}\`\n` +
        `- **Node.js:** \`${process.version}\`\n` +
        `- **Discord.js:** \`v14.14.1\``
      );
      addServerFooter(embed, interaction.guild);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (customId === 'panel_help') {
      const embed = createEmbed(
        'Ajuda',
        `**Como usar o painel:**\n\n` +
        `**📋 Logs**\n` +
        `Configure onde o bot enviará registros de ações e mensagens de boas-vindas.\n\n` +
        `**🛡️ Security**\n` +
        `Ative sistemas de proteção contra raids, spam, links e outros.\n\n` +
        `**⚙️ Configurações**\n` +
        `Veja as configurações gerais do bot no servidor.\n\n` +
        `**📊 Status**\n` +
        `Visualize informações técnicas e estatísticas do bot.\n\n` +
        `**ℹ️ Informações**\n` +
        `Veja detalhes sobre o bot e a equipe de desenvolvimento.`
      );
      addServerFooter(embed, interaction.guild);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (customId === 'panel_info') {
      const embed = createEmbed(
        'Informações do Bot',
        `**Soul Hunters Bot**\n\n` +
        `> Bot completo de gerenciamento, moderação, diversão e economia\n` +
        `> desenvolvido especialmente para o servidor Soul Hunters.\n\n` +
        `**Recursos:**\n` +
        `- 60 comandos disponíveis\n` +
        `- Sistema de economia e XP\n` +
        `- Mini-games interativos\n` +
        `- Moderação avançada\n` +
        `- Sistemas de segurança\n` +
        `- Conteúdo dinâmico\n\n` +
        `**Desenvolvido por:** Soul Hunters Technology\n` +
        `**Versão:** 2.0.0\n` +
        `**Licença:** Proprietário`
      );
      addServerFooter(embed, interaction.guild);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (customId === 'approve_suggestion') {
      if (!interaction.member.permissions.has('Administrator')) return interaction.reply({ content: 'Apenas administradores podem aprovar sugestões', ephemeral: true });
      const embed = interaction.message.embeds[0];
      embed.data.color = 0x00ff00;
      embed.data.fields = [{ name: 'Status', value: 'Aprovada', inline: false }];
      await interaction.update({ embeds: [embed], components: [] });
    }

    if (customId === 'reject_suggestion') {
      if (!interaction.member.permissions.has('Administrator')) return interaction.reply({ content: 'Apenas administradores podem rejeitar sugestões', ephemeral: true });
      const embed = interaction.message.embeds[0];
      embed.data.color = 0xff0000;
      embed.data.fields = [{ name: 'Status', value: 'Rejeitada', inline: false }];
      await interaction.update({ embeds: [embed], components: [] });
    }
  }
};
