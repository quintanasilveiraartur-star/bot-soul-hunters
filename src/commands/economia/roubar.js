const { economy, inventory } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError, getLuckBoost, hasActiveItem, cleanExpiredItems } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'roubar',
    description: 'Tenta roubar coins de alguém',
    options: [{
      name: 'usuario',
      description: 'Usuário para roubar',
      type: 6,
      required: true
    }]
  },

  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    
    if (target.id === interaction.user.id) {
      return replyError(interaction, 'Você não pode roubar de si mesmo');
    }
    
    if (target.bot) {
      return replyError(interaction, 'Você não pode roubar de bots');
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

    // Verifica se o ladrão tem coins suficientes
    if (userData.coins < 500) {
      const embed = createEmbed(
        'Saldo Insuficiente',
        `> Você precisa ter no mínimo **500 coins** para roubar!\n\n` +
        `**• Seu saldo:** \`${userData.coins}\` coins\n` +
        `**• Necessário:** \`500\` coins\n` +
        `**• Faltam:** \`${500 - userData.coins}\` coins`
      );
      embed.setColor('#FF0000');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (targetData.coins < 100) {
      return replyError(interaction, 'Este usuário não tem coins suficientes para roubar (mínimo: 100)');
    }

    // Verifica proteção anti-roubo do alvo
    let targetInventory = inventory.get(targetKey) || [];
    targetInventory = cleanExpiredItems(targetInventory);
    inventory.set(targetKey, targetInventory);
    
    if (hasActiveItem(targetInventory, 'anti_theft')) {
      const embed = createEmbed(
        '🛡️ Proteção Ativa',
        `> **${target.username}** está protegido contra roubos!\n\n` +
        `**• Item:** Proteção Anti-Roubo\n` +
        `**• Status:** Ativo\n\n` +
        `> Você não pode roubar este usuário enquanto a proteção estiver ativa.`
      );
      embed.setColor('#FF0000');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Verifica boost de sorte do ladrão
    let userInventory = inventory.get(userKey) || [];
    userInventory = cleanExpiredItems(userInventory);
    inventory.set(userKey, userInventory);
    
    const luckBoost = getLuckBoost(userInventory);
    const baseChance = 0.4;
    const chance = Math.random();
    const successChance = baseChance + luckBoost;
    
    if (chance < successChance) {
      // Sucesso
      const roubado = Math.floor(targetData.coins * 0.2);
      
      userData.coins += roubado;
      targetData.coins -= roubado;
      
      economy.set(userKey, userData);
      economy.set(targetKey, targetData);

      const embed = createEmbed(
        'Roubo Bem-Sucedido',
        `Você roubou **${roubado} coins** de ${target.username} 💰\n\n` +
        `**Seu saldo:** ${userData.coins} coins` +
        (luckBoost > 0 ? '\n\n🍀 *Amuleto da Sorte ativo!*' : '')
      );
      addServerFooter(embed, interaction.guild);

      await interaction.reply({ embeds: [embed] });
    } else {
      // Falha
      const multa = Math.floor(userData.coins * 0.15);
      
      userData.coins = Math.max(0, userData.coins - multa);
      economy.set(userKey, userData);

      const embed = createEmbed(
        'Roubo Fracassado',
        `Você foi pego tentando roubar!\n` +
        `**Multa:** ${multa} coins\n\n` +
        `**Seu saldo:** ${userData.coins} coins`
      );
      addServerFooter(embed, interaction.guild);

      await interaction.reply({ embeds: [embed] });
    }
  }
};
