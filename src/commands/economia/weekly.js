const { economy, inventory } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, formatTimeLeft, random, getCoinMultiplier, cleanExpiredItems, applyDailyTax } = require('../../utils/helpers');

const WEEKLY_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 dias
const MIN_REWARD = 2000;
const MAX_REWARD = 3500;

module.exports = {
  data: {
    name: 'weekly',
    description: 'Pega sua recompensa semanal'
  },

  async execute(interaction) {
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = {
        coins: 0,
        lastDaily: 0,
        lastWeekly: 0
      };
    }

    const now = Date.now();
    const timeSinceWeekly = now - userData.lastWeekly;

    if (timeSinceWeekly < WEEKLY_COOLDOWN) {
      const timeLeft = WEEKLY_COOLDOWN - timeSinceWeekly;
      
      const embed = createEmbed(
        'Calma lá',
        `Você já pegou seu weekly essa semana!\n` +
        `Volta daqui **${formatTimeLeft(timeLeft)}**`
      );
      addServerFooter(embed, interaction.guild);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const reward = random(MIN_REWARD, MAX_REWARD);
    
    // Verifica boost de coins
    let userInventory = inventory.get(key) || [];
    userInventory = cleanExpiredItems(userInventory);
    inventory.set(key, userInventory);
    
    const multiplier = getCoinMultiplier(userInventory);
    const rewardBase = reward;
    const boostedReward = Math.floor(reward * multiplier);
    
    // Aplica taxa diária progressiva
    const taxResult = applyDailyTax(userData, boostedReward);
    const finalReward = taxResult.finalGanho;
    
    userData.coins += finalReward;
    userData.lastWeekly = now;

    economy.set(key, userData);

    let description = `Você ganhou **${boostedReward} coins**!\n\n`;
    
    if (multiplier > 1) {
      description += `💰 *Bonus: +${Math.floor(rewardBase * (multiplier - 1))} coins (${Math.floor((multiplier - 1) * 100)}%)*\n\n`;
    }
    
    if (taxResult.taxAmount > 0) {
      description += `📊 *Taxa: -${taxResult.taxAmount} coins (${Math.floor(taxResult.taxPercent * 100)}%)*\n`;
      description += `✅ *Recebido: ${finalReward} coins*\n\n`;
    }
    
    description += `**Saldo total:** ${userData.coins} coins\n\n` +
      'Volte semana que vem pra pegar mais!';
    
    if (taxResult.taxPercent > 0) {
      description += `\n\n💰 *Ganhos diários: ${userData.dailyEarnings.toLocaleString()} coins*`;
    }

    const embed = createEmbed('Weekly Coletado', description);
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
