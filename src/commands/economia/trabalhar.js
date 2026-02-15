const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { economy, inventory, notifications } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, random, getCoinMultiplier, cleanExpiredItems, applyDailyTax } = require('../../utils/helpers');
const { getTrabalho } = require('../../utils/contentData');

module.exports = {
  data: {
    name: 'trabalhar',
    description: 'Trabalha para ganhar coins (cooldown: 10 minutos)'
  },

  async execute(interaction) {
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0, lastWork: 0 };
    }

    // Verifica cooldown de 10 minutos
    const now = Date.now();
    const cooldown = 10 * 60 * 1000; // 10 minutos em milissegundos
    const lastWork = userData.lastWork || 0;
    const timeLeft = cooldown - (now - lastWork);

    if (timeLeft > 0) {
      const minutosRestantes = Math.ceil(timeLeft / 60000);
      const segundosRestantes = Math.ceil((timeLeft % 60000) / 1000);
      
      const embed = createEmbed(
        'Cooldown Ativo',
        `> Você está cansado! Descanse um pouco.\n\n` +
        `**• Tempo restante:** \`${minutosRestantes}m ${segundosRestantes}s\``,
        '#ff9900'
      );
      
      // Botão de notificação
      const notifKey = `${key}_trabalhar`;
      const notifData = notifications.get(notifKey);
      const isActive = notifData && notifData.active;
      
      const button = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`notify_trabalhar_${interaction.user.id}`)
            .setLabel(isActive ? '🔔 Notificação Ativa' : '🔕 Ativar Notificação')
            .setStyle(isActive ? ButtonStyle.Success : ButtonStyle.Secondary)
        );
      
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], components: [button], ephemeral: true });
    }

    const trabalho = getTrabalho();
    let ganho = random(trabalho.min, trabalho.max);
    
    // Verifica boost de coins
    let userInventory = inventory.get(key) || [];
    userInventory = cleanExpiredItems(userInventory);
    inventory.set(key, userInventory);
    
    const multiplier = getCoinMultiplier(userInventory);
    const ganhoBase = ganho;
    ganho = Math.floor(ganho * multiplier);
    
    // Aplica taxa diária progressiva
    const taxResult = applyDailyTax(userData, ganho);
    const ganhoFinal = taxResult.finalGanho;
    
    userData.coins += ganhoFinal;
    userData.lastWork = now;
    economy.set(key, userData);

    let description = `Você trabalhou como **${trabalho.nome}** ${trabalho.emoji}\n\n` +
      '```yaml\n' +
      `Ganhou: ${ganho} coins\n`;
    
    if (multiplier > 1) {
      description += `Bonus: +${Math.floor(ganhoBase * (multiplier - 1))} coins (${Math.floor((multiplier - 1) * 100)}%)\n`;
    }
    
    if (taxResult.taxAmount > 0) {
      description += `Taxa: -${taxResult.taxAmount} coins (${Math.floor(taxResult.taxPercent * 100)}%)\n`;
      description += `Final: ${ganhoFinal} coins\n`;
    }
    
    description += `Saldo Total: ${userData.coins} coins\n` + '```';
    
    if (taxResult.taxPercent > 0) {
      description += `\n💰 *Ganhos diários: ${userData.dailyEarnings.toLocaleString()} coins*`;
    }

    const embed = createEmbed('Trabalho Realizado', description);
    embed.setThumbnail(interaction.user.displayAvatarURL());
    
    // Botão de notificação
    const notifKey = `${key}_trabalhar`;
    const notifData = notifications.get(notifKey);
    const isActive = notifData && notifData.active;
    
    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`notify_trabalhar_${interaction.user.id}`)
          .setLabel(isActive ? '🔔 Notificação Ativa' : '🔕 Ativar Notificação')
          .setStyle(isActive ? ButtonStyle.Success : ButtonStyle.Secondary)
      );
    
    addServerFooter(embed, interaction.guild);
    await interaction.reply({ embeds: [embed], components: [button] });
  }
};
