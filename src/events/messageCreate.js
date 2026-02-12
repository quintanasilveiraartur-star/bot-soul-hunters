const { xp, afk } = require('../utils/db');
const { makeKey, random } = require('../utils/helpers');
const { guilds } = require('../utils/db');
const { detectarPalavroes, detectarLinks, detectarFlood, detectarSpam, aplicarMuteAutomatico } = require('../utils/automod');
const { createEmbed, addServerFooter } = require('../utils/helpers');

// Cooldown para XP (60 segundos)
const cooldowns = new Map();

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    // Ignora bots e DMs
    if (message.author.bot || !message.guild) return;

    // Verifica se o autor está AFK e remove
    const authorKey = makeKey(message.guildId, message.author.id);
    const authorAfkData = afk.get(authorKey);
    
    if (authorAfkData) {
      afk.delete(authorKey);
      
      const tempoAfk = Date.now() - authorAfkData.timestamp;
      const horas = Math.floor(tempoAfk / (1000 * 60 * 60));
      const minutos = Math.floor((tempoAfk % (1000 * 60 * 60)) / (1000 * 60));
      
      let tempoTexto = '';
      if (horas > 0) {
        tempoTexto = `${horas}h ${minutos}m`;
      } else {
        tempoTexto = `${minutos}m`;
      }
      
      const embed = createEmbed(
        'Bem-vindo de volta',
        `> **${message.author.username}**, você não está mais AFK.\n\n` +
        `- **Tempo ausente:** \`${tempoTexto}\``
      );
      addServerFooter(embed, message.guild);
      
      message.reply({ embeds: [embed] }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      }).catch(() => {});
    }

    // Verifica se alguém mencionou um usuário AFK
    if (message.mentions.users.size > 0) {
      message.mentions.users.forEach(user => {
        if (user.bot) return;
        
        const userKey = makeKey(message.guildId, user.id);
        const userAfkData = afk.get(userKey);
        
        if (userAfkData) {
          const tempoAfk = Date.now() - userAfkData.timestamp;
          const horas = Math.floor(tempoAfk / (1000 * 60 * 60));
          const minutos = Math.floor((tempoAfk % (1000 * 60 * 60)) / (1000 * 60));
          
          let tempoTexto = '';
          if (horas > 0) {
            tempoTexto = `${horas}h ${minutos}m`;
          } else if (minutos > 0) {
            tempoTexto = `${minutos}m`;
          } else {
            tempoTexto = 'menos de 1m';
          }
          
          const embed = createEmbed(
            'Usuário AFK',
            `> **${user.username}** está ausente no momento.\n\n` +
            `- **Motivo:** ${userAfkData.reason}\n` +
            `- **Ausente há:** \`${tempoTexto}\``
          );
          addServerFooter(embed, message.guild);
          
          message.reply({ embeds: [embed] }).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 10000);
          }).catch(() => {});
        }
      });
    }

    // Sistema de auto-moderação
    const config = guilds.get(message.guildId) || {};
    
    // Log de debug para verificar configuração
    if (message.content.toLowerCase().includes('porra')) {
      console.log('[DEBUG] Mensagem com "porra" detectada');
      console.log('[DEBUG] Config antiSwear:', config.antiSwear);
      console.log('[DEBUG] Config completa:', config);
    }
    
    // Anti-Palavrão
    if (config.antiSwear) {
      const palavroesDetectados = detectarPalavroes(message.content);
      
      if (palavroesDetectados.length > 0) {
        console.log('[AUTOMOD] Aplicando mute por palavrão...');
        await aplicarMuteAutomatico(message, 'Uso de linguagem imprópria', palavroesDetectados);
        return;
      }
    }
    
    // Anti-Link
    if (config.antiLink) {
      if (detectarLinks(message.content)) {
        // Permite links para membros com permissão de gerenciar mensagens
        if (!message.member.permissions.has('ManageMessages')) {
          await aplicarMuteAutomatico(message, 'Envio de links não autorizado');
          return;
        }
      }
    }
    
    // Anti-Flood
    if (config.antiFlood) {
      if (detectarFlood(message.author.id)) {
        await aplicarMuteAutomatico(message, 'Flood de mensagens detectado');
        return;
      }
    }
    
    // Anti-Spam
    if (config.antiSpam) {
      if (detectarSpam(message.author.id, message.content)) {
        await aplicarMuteAutomatico(message, 'Spam de mensagens detectado');
        return;
      }
    }

    // Responde quando mencionado (mas não em respostas)
    if (message.mentions.has(client.user.id) && !message.mentions.everyone && !message.reference) {
      const { EmbedBuilder } = require('discord.js');
      
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('👋 Olá! Sou o Soul Hunters Bot')
        .setDescription(
          `Meu prefixo neste servidor é \`/\` (Slash Commands)\n\n` +
          `Para ver todos os comandos disponíveis, digite \`/\` e navegue pelas categorias.\n\n` +
          `**Categorias principais:**\n` +
          `- 🛡️ Moderação\n` +
          `- 🎮 Diversão\n` +
          `- 💰 Economia\n` +
          `- 👥 Social\n` +
          `- ℹ️ Informações\n\n` +
          `-# Soul Hunters Technology © 2026`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({
          text: message.guild.name,
          iconURL: message.guild.iconURL() || undefined
        });

      return message.reply({ embeds: [embed] });
    }

    const key = makeKey(message.guildId, message.author.id);
    
    // Pega ou cria dados do usuário
    let userData = xp.get(key) || {
      xp: 0,
      level: 0,
      messages: 0
    };

    // Incrementa contador de mensagens
    userData.messages = (userData.messages || 0) + 1;

    // Sistema de XP com cooldown
    const now = Date.now();
    const cooldownKey = `${message.guildId}_${message.author.id}`;
    const lastXP = cooldowns.get(cooldownKey) || 0;

    if (now - lastXP > 120000) { // 120 segundos (2 minutos)
      const xpGain = random(5, 15); // Reduzido de 15-25 para 5-15
      userData.xp += xpGain;
      cooldowns.set(cooldownKey, now);

      // Calcula level (150 XP por level) - Aumentado de 100 para 150
      const newLevel = Math.floor(userData.xp / 150);
      
      if (newLevel > userData.level) {
        userData.level = newLevel;
        
        // Mensagem de level up
        await message.reply({
          content: `🎉 Parabéns ${message.author}! Você subiu para o **nível ${newLevel}**!`
        }).catch(() => {});
      }
    }

    // Salva dados
    xp.set(key, userData);
    
    // Sistema de reações aleatórias (5% de chance)
    if (Math.random() < 0.05) {
      const emojis = [
        'emoji_205',
        'Capturadetela20240327193919',
        'catlike',
        'Capturadetela20230921124847',
        'UOS_Cat_mmm'
      ];
      
      const emojiAleatorio = emojis[Math.floor(Math.random() * emojis.length)];
      
      // Aguarda um tempo aleatório entre 1 e 5 segundos antes de reagir
      const delay = Math.floor(Math.random() * 4000) + 1000;
      
      setTimeout(() => {
        message.react(emojiAleatorio).catch(() => {
          console.log('[REAÇÃO] Emoji customizado não encontrado:', emojiAleatorio);
        });
      }, delay);
    }
  }
};
