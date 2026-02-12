const { economy, inventory } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, formatTimeLeft, random, getCoinMultiplier, cleanExpiredItems } = require('../../utils/helpers');

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 horas
const MIN_REWARD = 500;
const MAX_REWARD = 1000;

module.exports = {
  data: {
    name: 'daily',
    description: 'Pega sua recompensa diária'
  },

  async execute(interaction) {
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    // Inicializa se não existir
    if (!userData) {
      userData = {
        coins: 0,
        lastDaily: 0,
        lastWeekly: 0
      };
    }

    const now = Date.now();
    const timeSinceDaily = now - userData.lastDaily;

    // Verifica cooldown
    if (timeSinceDaily < DAILY_COOLDOWN) {
      const timeLeft = DAILY_COOLDOWN - timeSinceDaily;
      
      const embed = createEmbed(
        'Calma lá',
        `Você já pegou seu daily hoje!\n` +
        `Volta daqui **${formatTimeLeft(timeLeft)}**`
      );
      addServerFooter(embed, interaction.guild);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Dá a recompensa
    let reward = random(MIN_REWARD, MAX_REWARD);
    
    // Verifica boost de coins
    let userInventory = inventory.get(key) || [];
    userInventory = cleanExpiredItems(userInventory);
    inventory.set(key, userInventory);
    
    const multiplier = getCoinMultiplier(userInventory);
    const rewardBase = reward;
    reward = Math.floor(reward * multiplier);
    
    userData.coins += reward;
    userData.lastDaily = now;

    economy.set(key, userData);

    let description = `Você ganhou **${reward} coins**!\n\n`;
    
    if (multiplier > 1) {
      description += `💰 *Bonus: +${Math.floor(rewardBase * (multiplier - 1))} coins (${Math.floor((multiplier - 1) * 100)}%)*\n\n`;
    }
    
    description += `**Saldo total:** ${userData.coins} coins\n\n` +
      'Volte amanhã pra pegar mais!';

    const embed = createEmbed('Daily Coletado', description);
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
