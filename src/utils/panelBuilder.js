const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function showMainPanel(interaction, config, isUpdate = false) {
  const embed = new EmbedBuilder()
    .setColor('#2b2d31')
    .setTitle('# Painel de Gerenciamento - Souls Hunter')
    .setDescription(
      '> Olá! Seja **Bem-Vindo(a)** ao nosso painel de gerenciamento,\n' +
      '> desenvolvido para você que quer **melhorar** seu sistema de\n' +
      '> atendimento, oferecer mais **qualidade** e **segurança**.\n' +
      '> Configure o bot de acordo com suas necessidades.\n\n' +
      '```yaml\n' +
      'Status: Online\n' +
      'Versão: 1.0.0\n' +
      '```'
    )
    .addFields(
      { 
        name: '### Informações do Sistema', 
        value: 
          '> **Nome:** `Souls Hunter Bot`\n' +
          '> **Desenvolvido por:** `Souls Hunter Team`\n' +
          '> **Uptime:** Online', 
        inline: false 
      },
      { 
        name: '### Sistema de Segurança', 
        value: 
          `> **Anti-Raid:** \`${config.antiraid_enabled ? '✓ Ativado' : '✗ Desativado'}\`\n` +
          `> **Anti-Link:** \`${config.antilink_enabled ? '✓ Ativado' : '✗ Desativado'}\`\n` +
          `> **Anti-Flood:** \`${config.antiflood_enabled ? '✓ Ativado' : '✗ Desativado'}\`\n` +
          `> **Anti-Palavrão:** \`${config.antiswear_enabled ? '✓ Ativado' : '✗ Desativado'}\`\n` +
          `> **Anti-Spam:** \`${config.antispam_enabled ? '✓ Ativado' : '✗ Desativado'}\`\n` +
          `> **Anti-Bot:** \`${config.antibot_enabled ? '✓ Ativado' : '✗ Desativado'}\``, 
        inline: false 
      },
      { 
        name: '### Canais Configurados', 
        value: 
          `> **Logs:** ${config.log_channel ? `<#${config.log_channel}>` : '`Não configurado`'}\n` +
          `> **Boas-vindas:** ${config.welcome_channel ? `<#${config.welcome_channel}>` : '`Não configurado`'}`, 
        inline: false 
      }
    )
    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
    .setFooter({ 
      text: `${interaction.guild.name} • Painel de Controle`, 
      iconURL: interaction.guild.iconURL() 
    })
    .setTimestamp();
  
  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('painel_logs')
        .setLabel('Logs')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('painel_security')
        .setLabel('Security')
        .setStyle(ButtonStyle.Danger)
    );
  
  if (isUpdate) {
    interaction.update({ embeds: [embed], components: [buttons] });
  } else {
    interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
  }
}

function showSecurityPanel(interaction, config, isUpdate = false) {
  const embed = new EmbedBuilder()
    .setColor('#2b2d31')
    .setTitle('# Painel de Segurança')
    .setDescription(
      '> Configure os **sistemas de segurança** do servidor.\n' +
      '> Clique nos botões abaixo para **ativar/desativar** cada sistema.\n\n' +
      '```diff\n' +
      '+ Sistemas de Proteção Avançados\n' +
      '```'
    )
    .addFields(
      {
        name: '### Anti-Raid',
        value: `> **Status:** \`${config.antiraid_enabled ? '✓ Ativado' : '✗ Desativado'}\`\n> Protege contra **entrada massiva** de membros suspeitos.`,
        inline: true
      },
      {
        name: '### Anti-Link',
        value: `> **Status:** \`${config.antilink_enabled ? '✓ Ativado' : '✗ Desativado'}\`\n> Deleta mensagens com **links** automaticamente.`,
        inline: true
      },
      {
        name: '### Anti-Flood',
        value: `> **Status:** \`${config.antiflood_enabled ? '✓ Ativado' : '✗ Desativado'}\`\n> Silencia membros que **floodam** mensagens.`,
        inline: true
      },
      {
        name: '### Anti-Palavrão',
        value: `> **Status:** \`${config.antiswear_enabled ? '✓ Ativado' : '✗ Desativado'}\`\n> Deleta mensagens com **palavras ofensivas**.`,
        inline: true
      },
      {
        name: '### Anti-Spam',
        value: `> **Status:** \`${config.antispam_enabled ? '✓ Ativado' : '✗ Desativado'}\`\n> Deleta mensagens **repetidas** em sequência.`,
        inline: true
      },
      {
        name: '### Anti-Bot',
        value: `> **Status:** \`${config.antibot_enabled ? '✓ Ativado' : '✗ Desativado'}\`\n> Expulsa bots adicionados **sem permissão**.`,
        inline: true
      },
      {
        name: '### Configuração de Mute',
        value: `> **Duração padrão:** \`${config.mute_duration || 5} minutos\`\n> Tempo de silenciamento automático.`,
        inline: false
      }
    )
    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
    .setFooter({ 
      text: `${interaction.guild.name} • Sistema de Segurança`, 
      iconURL: interaction.guild.iconURL() 
    })
    .setTimestamp();
  
  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('toggle_antiraid_enabled')
        .setLabel(`Anti-Raid: ${config.antiraid_enabled ? 'ON' : 'OFF'}`)
        .setStyle(config.antiraid_enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('toggle_antilink_enabled')
        .setLabel(`Anti-Link: ${config.antilink_enabled ? 'ON' : 'OFF'}`)
        .setStyle(config.antilink_enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('toggle_antiflood_enabled')
        .setLabel(`Anti-Flood: ${config.antiflood_enabled ? 'ON' : 'OFF'}`)
        .setStyle(config.antiflood_enabled ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
  
  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('toggle_antiswear_enabled')
        .setLabel(`Anti-Palavrão: ${config.antiswear_enabled ? 'ON' : 'OFF'}`)
        .setStyle(config.antiswear_enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('toggle_antispam_enabled')
        .setLabel(`Anti-Spam: ${config.antispam_enabled ? 'ON' : 'OFF'}`)
        .setStyle(config.antispam_enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('toggle_antibot_enabled')
        .setLabel(`Anti-Bot: ${config.antibot_enabled ? 'ON' : 'OFF'}`)
        .setStyle(config.antibot_enabled ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
  
  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('config_mute_duration')
        .setLabel('Configurar Duração do Mute')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('back_to_painel')
        .setLabel('Voltar')
        .setStyle(ButtonStyle.Secondary)
    );
  
  if (isUpdate) {
    interaction.update({ embeds: [embed], components: [row1, row2, row3] });
  } else {
    interaction.reply({ embeds: [embed], components: [row1, row2, row3], ephemeral: true });
  }
}

module.exports = { showMainPanel, showSecurityPanel };
