const { EmbedBuilder } = require('discord.js');

// Cria embed padrão com footer e timestamp
function createEmbed(title, description, color = '#2b2d31') {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

// Adiciona footer com logo do servidor
function addServerFooter(embed, guild) {
  if (guild) {
    embed.setFooter({
      text: guild.name,
      iconURL: guild.iconURL() || undefined
    });
  }
  return embed;
}

// Formata tempo restante
function formatTimeLeft(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

// Gera chave única para guild + user
function makeKey(guildId, userId) {
  return `${guildId}_${userId}`;
}

// Valida se usuário pode ser moderado
function canModerate(executor, target) {
  if (!target.moderatable) return false;
  if (target.id === executor.id) return false;
  if (target.roles.highest.position >= executor.roles.highest.position) return false;
  return true;
}

// Envia log para canal configurado
async function sendLog(client, guildId, embed) {
  try {
    const { guilds } = require('./db');
    const config = guilds.get(guildId);
    
    if (!config || !config.logChannel) return;
    
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;
    
    const channel = guild.channels.cache.get(config.logChannel);
    if (!channel) return;
    
    await channel.send({ embeds: [embed] });
  } catch (err) {
    // Falha silenciosa em logs pra não quebrar o comando principal
    console.error('Erro ao enviar log:', err.message);
  }
}

// Responde com erro de forma consistente
async function replyError(interaction, message) {
  const embed = createEmbed('Erro', `> ${message}`, '#ff0000');
  
  const options = { embeds: [embed], ephemeral: true };
  
  if (interaction.replied || interaction.deferred) {
    return interaction.followUp(options);
  }
  return interaction.reply(options);
}

// Responde com sucesso
async function replySuccess(interaction, message) {
  const embed = createEmbed('Sucesso', `> ${message}`, '#00ff00');
  
  const options = { embeds: [embed] };
  
  if (interaction.replied || interaction.deferred) {
    return interaction.followUp(options);
  }
  return interaction.reply(options);
}

// Gera número aleatório entre min e max
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Escolhe item aleatório de array
function randomChoice(array) {
  return array[random(0, array.length - 1)];
}

// Formata números grandes (1000 = 1k, 1000000 = 1m, etc)
function formatNumber(num) {
  if (num >= 1000000000000) {
    return (num / 1000000000000).toFixed(1).replace(/\.0$/, '') + 't'; // trilhão
  }
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'b'; // bilhão
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm'; // milhão
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'; // mil
  }
  return num.toString();
}

// Aguarda tempo em ms
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Verifica se usuário tem item ativo no inventário
function hasActiveItem(inventory, itemId) {
  if (!inventory || !Array.isArray(inventory)) return false;
  
  const now = Date.now();
  const item = inventory.find(i => i.id === itemId);
  
  if (!item) return false;
  
  // Se tem duração, verifica se ainda está válido
  if (item.expires) {
    return item.expires > now;
  }
  
  // Item permanente
  return true;
}

// Remove itens expirados do inventário
function cleanExpiredItems(inventory) {
  if (!inventory || !Array.isArray(inventory)) return [];
  
  const now = Date.now();
  return inventory.filter(item => {
    if (!item.expires) return true;
    return item.expires > now;
  });
}

// Calcula multiplicador de coins baseado nos itens
function getCoinMultiplier(inventory) {
  let multiplier = 1.0;
  
  if (hasActiveItem(inventory, 'coin_boost')) {
    multiplier += 0.5; // +50%
  }
  
  return multiplier;
}

// Calcula multiplicador de XP baseado nos itens
function getXPMultiplier(inventory) {
  let multiplier = 1.0;
  
  if (hasActiveItem(inventory, 'xp_boost')) {
    multiplier += 1.0; // +100% (2x)
  }
  
  return multiplier;
}

// Calcula boost de sorte baseado nos itens
function getLuckBoost(inventory) {
  let boost = 0;
  
  if (hasActiveItem(inventory, 'lucky_charm')) {
    boost += 0.10; // +10% de chance (reduzido de 15%)
  }
  
  return boost;
}

// Calcula taxa progressiva baseada em ganhos diários
function getDailyTax(dailyEarnings) {
  if (dailyEarnings > 1000000) return 0.60; // 60% de taxa acima de 1M
  if (dailyEarnings > 500000) return 0.50;  // 50% de taxa acima de 500k
  if (dailyEarnings > 250000) return 0.40;  // 40% de taxa acima de 250k
  if (dailyEarnings > 100000) return 0.30;  // 30% de taxa acima de 100k
  if (dailyEarnings > 50000) return 0.20;   // 20% de taxa acima de 50k
  if (dailyEarnings > 25000) return 0.10;   // 10% de taxa acima de 25k
  return 0; // Sem taxa para iniciantes
}

// Aplica taxa e atualiza ganhos diários
function applyDailyTax(userData, ganho) {
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  // Reseta ganhos diários se passou 24h
  if (!userData.dailyEarningsReset || userData.dailyEarningsReset < oneDayAgo) {
    userData.dailyEarnings = 0;
    userData.dailyEarningsReset = now;
  }
  
  // Calcula taxa baseada nos ganhos atuais
  const tax = getDailyTax(userData.dailyEarnings || 0);
  const taxAmount = Math.floor(ganho * tax);
  const finalGanho = ganho - taxAmount;
  
  // Atualiza ganhos diários
  userData.dailyEarnings = (userData.dailyEarnings || 0) + finalGanho;
  
  return { finalGanho, taxAmount, taxPercent: tax };
}

// Reseta ganhos diários se necessário
function checkDailyReset(userData) {
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  if (!userData.dailyEarningsReset || userData.dailyEarningsReset < oneDayAgo) {
    userData.dailyEarnings = 0;
    userData.dailyEarningsReset = now;
  }
}

// Cobra taxa diária de custo de vida (25% do saldo)
function applyDailyLivingCost(userData) {
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  // Verifica se já cobrou hoje
  if (!userData.lastLivingCostDate || userData.lastLivingCostDate < oneDayAgo) {
    const livingCost = Math.floor(userData.coins * 0.25); // 25% do saldo
    
    if (livingCost > 0) {
      userData.coins = Math.max(0, userData.coins - livingCost);
      userData.lastLivingCostDate = now;
      return { charged: true, amount: livingCost };
    }
    
    userData.lastLivingCostDate = now;
  }
  
  return { charged: false, amount: 0 };
}

module.exports = {
  createEmbed,
  addServerFooter,
  formatTimeLeft,
  makeKey,
  canModerate,
  sendLog,
  replyError,
  replySuccess,
  random,
  randomChoice,
  formatNumber,
  sleep,
  hasActiveItem,
  cleanExpiredItems,
  getCoinMultiplier,
  getXPMultiplier,
  getLuckBoost,
  getDailyTax,
  applyDailyTax,
  checkDailyReset,
  applyDailyLivingCost
};
