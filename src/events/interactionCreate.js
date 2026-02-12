module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Comandos slash
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      
      if (!command) {
        console.warn(`Comando ${interaction.commandName} não encontrado`);
        return;
      }

      // Verifica se o comando está sendo usado no canal correto
      const CANAL_COMANDOS = '1242638350146605116';
      
      // Lista de comandos que podem ser usados em qualquer lugar
      const comandosLiberados = [
        'painel',
        'clear',
        'ban',
        'kick',
        'mute',
        'unmute',
        'warn',
        'warnings',
        'clearwarns'
      ];
      
      // Se não for um comando liberado e não estiver no canal correto
      if (!comandosLiberados.includes(interaction.commandName) && interaction.channelId !== CANAL_COMANDOS) {
        const msg = await interaction.reply({
          content: `⚠️ Este comando só pode ser usado em <#${CANAL_COMANDOS}>`,
          fetchReply: true
        }).catch(() => {});
        
        // Deleta a mensagem após 5 segundos
        if (msg) {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        }
        
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Erro no comando ${interaction.commandName}:`, error);
        
        const reply = {
          content: '> Deu ruim ao executar esse comando. Tenta de novo?',
          ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }
    }

    // Botões
    if (interaction.isButton()) {
      try {
        const { handleButton } = require('../handlers/buttonHandler');
        await handleButton(interaction);
      } catch (error) {
        console.error('Erro no botão:', error);
        await interaction.reply({
          content: '> Algo deu errado com esse botão.',
          ephemeral: true
        }).catch(() => {});
      }
    }

    // Select menus
    if (interaction.isStringSelectMenu()) {
      try {
        const { handleSelectMenu } = require('../handlers/selectMenuHandler');
        await handleSelectMenu(interaction);
      } catch (error) {
        console.error('Erro no select menu:', error);
        await interaction.reply({
          content: '> Erro ao processar sua seleção.',
          ephemeral: true
        }).catch(() => {});
      }
    }

    // Modals
    if (interaction.isModalSubmit()) {
      try {
        if (interaction.customId === 'modal_logs_manual') {
          const { guilds } = require('../utils/db');
          const { createEmbed, addServerFooter, replyError } = require('../utils/helpers');
          
          const logChannelInput = interaction.fields.getTextInputValue('log_channel_input');
          const welcomeChannelInput = interaction.fields.getTextInputValue('welcome_channel_input');

          let config = guilds.get(interaction.guildId) || {};
          let messages = [];

          // Processa canal de logs
          if (logChannelInput) {
            let logChannel = null;
            
            // Tenta encontrar por ID
            if (/^\d+$/.test(logChannelInput)) {
              logChannel = interaction.guild.channels.cache.get(logChannelInput);
            }
            
            // Tenta encontrar por nome
            if (!logChannel) {
              logChannel = interaction.guild.channels.cache.find(c => 
                c.name.toLowerCase() === logChannelInput.toLowerCase() && c.isTextBased()
              );
            }

            if (logChannel) {
              config.logChannel = logChannel.id;
              messages.push(`✅ Canal de Logs configurado: ${logChannel}`);
            } else {
              messages.push(`❌ Canal de Logs não encontrado: \`${logChannelInput}\``);
            }
          }

          // Processa canal de boas-vindas
          if (welcomeChannelInput) {
            let welcomeChannel = null;
            
            // Tenta encontrar por ID
            if (/^\d+$/.test(welcomeChannelInput)) {
              welcomeChannel = interaction.guild.channels.cache.get(welcomeChannelInput);
            }
            
            // Tenta encontrar por nome
            if (!welcomeChannel) {
              welcomeChannel = interaction.guild.channels.cache.find(c => 
                c.name.toLowerCase() === welcomeChannelInput.toLowerCase() && c.isTextBased()
              );
            }

            if (welcomeChannel) {
              config.welcomeChannel = welcomeChannel.id;
              messages.push(`✅ Canal de Boas-vindas configurado: ${welcomeChannel}`);
            } else {
              messages.push(`❌ Canal de Boas-vindas não encontrado: \`${welcomeChannelInput}\``);
            }
          }

          if (messages.length === 0) {
            return replyError(interaction, 'Você precisa preencher pelo menos um campo.');
          }

          guilds.set(interaction.guildId, config);

          const embed = createEmbed(
            '📋 Canais Configurados',
            messages.join('\n\n')
          );
          addServerFooter(embed, interaction.guild);

          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      } catch (error) {
        console.error('Erro no modal:', error);
        await interaction.reply({
          content: '> Erro ao processar o formulário.',
          ephemeral: true
        }).catch(() => {});
      }
    }
  }
};
