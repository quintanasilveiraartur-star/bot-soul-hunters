const { guilds } = require('../utils/db');
const { createEmbed } = require('../utils/helpers');

// Controle de raid (membros entrando rapidamente)
const joinHistory = new Map(); // guildId -> [timestamps]

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const config = guilds.get(member.guild.id) || {};
    
    // Anti-Bot
    if (config.antiBot) {
      if (member.user.bot) {
        // Verifica se quem adicionou tem permissão
        const auditLogs = await member.guild.fetchAuditLogs({
          type: 28, // BOT_ADD
          limit: 1
        }).catch(() => null);
        
        if (auditLogs) {
          const botAddLog = auditLogs.entries.first();
          if (botAddLog && botAddLog.target.id === member.id) {
            const executor = botAddLog.executor;
            
            // Se quem adicionou não é admin, kicka o bot
            const executorMember = await member.guild.members.fetch(executor.id).catch(() => null);
            if (executorMember && !executorMember.permissions.has('Administrator')) {
              // Envia DM para quem adicionou
              const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
              
              const dmEmbed = createEmbed(
                'Bot removido do servidor',
                `**Servidor:** ${member.guild.name}\n` +
                `**Bot:** ${member.user.username}\n` +
                `**Motivo:** Apenas administradores podem adicionar bots\n\n` +
                `O sistema de segurança Anti-Bot está ativo neste servidor.`,
                '#ff0000'
              );

              const button = new ActionRowBuilder()
                .addComponents(
                  new ButtonBuilder()
                    .setCustomId('system_message')
                    .setLabel('⚠️ Mensagem do Sistema')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                );

              await executorMember.send({ embeds: [dmEmbed], components: [button] }).catch(() => {});
              
              await member.kick('Anti-Bot: Bot adicionado sem permissão').catch(() => {});
              
              // Log
              if (config.logChannel) {
                const logChannel = member.guild.channels.cache.get(config.logChannel);
                if (logChannel) {
                  const embed = createEmbed(
                    '🤖 Anti-Bot: Bot Removido',
                    `**Bot:** ${member.user.username} (${member.id})\n` +
                    `**Adicionado por:** ${executor.username}\n` +
                    `**Motivo:** Usuário sem permissão de administrador`,
                    '#ff0000'
                  )
                  .setTimestamp()
                  .setFooter({
                    text: member.guild.name,
                    iconURL: member.guild.iconURL() || undefined
                  });
                  
                  await logChannel.send({ embeds: [embed] }).catch(() => {});
                }
              }
              return;
            }
          }
        }
      }
    }
    
    // Anti-Raid
    if (config.antiRaid) {
      const now = Date.now();
      const history = joinHistory.get(member.guild.id) || [];
      
      // Remove entradas antigas (mais de 10 segundos)
      const recentJoins = history.filter(timestamp => now - timestamp < 10000);
      
      // Adiciona entrada atual
      recentJoins.push(now);
      joinHistory.set(member.guild.id, recentJoins);
      
      // Se 5+ membros entraram em 10 segundos = possível raid
      if (recentJoins.length >= 5) {
        // Envia DM antes de kickar
        const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
        
        const dmEmbed = createEmbed(
          'Você foi removido do servidor',
          `**Servidor:** ${member.guild.name}\n` +
          `**Motivo:** Possível raid detectado\n\n` +
          `O sistema de segurança detectou uma entrada suspeita de múltiplos membros.\n` +
          `Se você acredita que isso foi um erro, entre em contato com a administração.`,
          '#ff0000'
        );

        const button = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('system_message')
              .setLabel('⚠️ Mensagem do Sistema')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true)
          );

        await member.send({ embeds: [dmEmbed], components: [button] }).catch(() => {});
        
        // Kicka o membro
        await member.kick('Anti-Raid: Entrada suspeita detectada').catch(() => {});
        
        // Log
        if (config.logChannel) {
          const logChannel = member.guild.channels.cache.get(config.logChannel);
          if (logChannel) {
            const embed = createEmbed(
              '🛡️ Anti-Raid: Membro Removido',
              `**Usuário:** ${member.user.username} (${member.id})\n` +
              `**Motivo:** Possível raid detectado\n` +
              `**Membros recentes:** ${recentJoins.length} em 10 segundos`,
              '#ff0000'
            )
            .setTimestamp()
            .setFooter({
              text: member.guild.name,
              iconURL: member.guild.iconURL() || undefined
            });
            
            await logChannel.send({ embeds: [embed] }).catch(() => {});
          }
        }
        return;
      }
    }
    
    // Mensagem de boas-vindas (se configurado)
    if (config.welcomeChannel) {
      const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannel);
      if (welcomeChannel) {
        const embed = createEmbed(
          '👋 Bem-vindo!',
          `Olá ${member}! Seja bem-vindo(a) ao **${member.guild.name}**!\n\n` +
          `Você é o membro **#${member.guild.memberCount}**!`,
          '#00ff00'
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({
          text: member.guild.name,
          iconURL: member.guild.iconURL() || undefined
        });
        
        await welcomeChannel.send({ embeds: [embed] }).catch(() => {});
      }
    }
  }
};

// Limpa histórico antigo periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [guildId, history] of joinHistory.entries()) {
    const recent = history.filter(timestamp => now - timestamp < 10000);
    if (recent.length === 0) {
      joinHistory.delete(guildId);
    } else {
      joinHistory.set(guildId, recent);
    }
  }
}, 60000); // A cada 1 minuto
