const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { economy, inventory, notifications } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError, getLuckBoost, cleanExpiredItems } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'apostar',
    description: 'Aposta coins (cooldown: 5 minutos)',
    options: [{
      name: 'quantia',
      description: 'Quantia para apostar',
      type: 4,
      required: true
    }]
  },

  async execute(interaction) {
    const quantia = interaction.options.getInteger('quantia');
    
    if (quantia < 10) {
      return replyError(interaction, 'Aposta mínima: 10 coins');
    }

    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0, lastBet: 0 };
    }

    // Verifica cooldown de 5 minutos
    const now = Date.now();
    const cooldown = 5 * 60 * 1000; // 5 minutos
    const lastBet = userData.lastBet || 0;
    const timeLeft = cooldown - (now - lastBet);

    if (timeLeft > 0) {
      const minutosRestantes = Math.ceil(timeLeft / 60000);
      const segundosRestantes = Math.ceil((timeLeft % 60000) / 1000);
      
      const embed = createEmbed(
        'Cooldown Ativo',
        `> Aguarde um pouco antes de apostar novamente!\n\n` +
        `**• Tempo restante:** \`${minutosRestantes}m ${segundosRestantes}s\``,
        '#ff9900'
      );
      
      // Botão de notificação
      const notifKey = `${key}_apostar`;
      const notifData = notifications.get(notifKey);
      const isActive = notifData && notifData.active;
      
      const button = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`notify_apostar_${interaction.user.id}`)
            .setLabel(isActive ? '🔔 Notificação Ativa' : '🔕 Ativar Notificação')
            .setStyle(isActive ? ButtonStyle.Success : ButtonStyle.Secondary)
        );
      
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], components: [button], ephemeral: true });
    }

    if (userData.coins < quantia) {
      return replyError(interaction, 'Você não tem coins suficientes');
    }

    // Verifica boost de sorte
    let userInventory = inventory.get(key) || [];
    userInventory = cleanExpiredItems(userInventory);
    inventory.set(key, userInventory);
    
    const luckBoost = getLuckBoost(userInventory);
    const chance = Math.random();
    let resultado, ganho;
    
    // Chances base: 45% ganhar, 45% perder, 10% jackpot
    // Com sorte: 60% ganhar, 30% perder, 10% jackpot
    const winChance = 0.45 + luckBoost;
    const loseChance = 0.90 - luckBoost;
    
    if (chance < winChance) {
      ganho = quantia;
      resultado = 'Você ganhou';
    } else if (chance < loseChance) {
      ganho = -quantia;
      resultado = 'Você perdeu';
    } else {
      ganho = quantia * 2;
      resultado = 'JACKPOT! Você ganhou o dobro';
    }
    
    userData.coins += ganho;
    userData.lastBet = now;
    economy.set(key, userData);

    const embed = createEmbed(
      'Aposta',
      `**Apostou:** \`${quantia} coins\`\n\n` +
      '```diff\n' +
      `${ganho > 0 ? '+' : '-'} ${resultado}\n` +
      `${ganho > 0 ? '+' : '-'} ${Math.abs(ganho)} coins\n` +
      '```\n' +
      `**Saldo atual:** \`${userData.coins} coins\`` +
      (luckBoost > 0 ? '\n\n🍀 *Amuleto da Sorte ativo!*' : '')
    );
    embed.setThumbnail(interaction.user.displayAvatarURL());
    
    // Botão de notificação
    const notifKey = `${key}_apostar`;
    const notifData = notifications.get(notifKey);
    const isActive = notifData && notifData.active;
    
    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`notify_apostar_${interaction.user.id}`)
          .setLabel(isActive ? '🔔 Notificação Ativa' : '🔕 Ativar Notificação')
          .setStyle(isActive ? ButtonStyle.Success : ButtonStyle.Secondary)
      );
    
    addServerFooter(embed, interaction.guild);
    await interaction.reply({ embeds: [embed], components: [button] });
  }
};
