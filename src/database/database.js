const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../../databases');

// Garantir que a pasta databases existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Funções auxiliares para ler e escrever JSON
function readJSON(filename) {
  const filepath = path.join(DB_DIR, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, '{}');
    return {};
  }
  try {
    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler ${filename}:`, error);
    return {};
  }
}

function writeJSON(filename, data) {
  const filepath = path.join(DB_DIR, filename);
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Erro ao escrever ${filename}:`, error);
  }
}

// Guild Config
const getGuildConfig = (guildId) => {
  const data = readJSON('guild_config.json');
  return data[guildId] || null;
};

const initGuildConfig = (guildId) => {
  const data = readJSON('guild_config.json');
  if (!data[guildId]) {
    data[guildId] = {
      log_channel: null,
      welcome_channel: null,
      antiraid_enabled: 0,
      antilink_enabled: 0,
      antiflood_enabled: 0,
      antiswear_enabled: 0,
      antispam_enabled: 0,
      antibot_enabled: 0,
      verification_enabled: 0,
      mute_duration: 5
    };
    writeJSON('guild_config.json', data);
  }
  return data[guildId];
};

const updateGuildConfig = (guildId, updates) => {
  const data = readJSON('guild_config.json');
  if (!data[guildId]) {
    initGuildConfig(guildId);
  }
  data[guildId] = { ...data[guildId], ...updates };
  writeJSON('guild_config.json', data);
};

// Warnings
const getWarnings = (guildId, userId) => {
  const data = readJSON('warnings.json');
  const key = `${guildId}_${userId}`;
  return data[key] || [];
};

const addWarning = (guildId, userId, moderatorId, reason) => {
  const data = readJSON('warnings.json');
  const key = `${guildId}_${userId}`;
  if (!data[key]) {
    data[key] = [];
  }
  data[key].push({
    moderator_id: moderatorId,
    reason: reason,
    timestamp: Date.now()
  });
  writeJSON('warnings.json', data);
};

const clearWarnings = (guildId, userId) => {
  const data = readJSON('warnings.json');
  const key = `${guildId}_${userId}`;
  delete data[key];
  writeJSON('warnings.json', data);
};

// Mutes
const getMute = (guildId, userId) => {
  const data = readJSON('mutes.json');
  const key = `${guildId}_${userId}`;
  return data[key] || null;
};

const addMute = (guildId, userId, endTime) => {
  const data = readJSON('mutes.json');
  const key = `${guildId}_${userId}`;
  data[key] = { end_time: endTime };
  writeJSON('mutes.json', data);
};

const removeMute = (guildId, userId) => {
  const data = readJSON('mutes.json');
  const key = `${guildId}_${userId}`;
  delete data[key];
  writeJSON('mutes.json', data);
};

const getExpiredMutes = () => {
  const data = readJSON('mutes.json');
  const now = Date.now();
  const expired = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (value.end_time <= now) {
      const [guildId, userId] = key.split('_');
      expired.push({ guild_id: guildId, user_id: userId });
    }
  }
  
  return expired;
};

// Economy
const getEconomy = (guildId, userId) => {
  const data = readJSON('economy.json');
  const key = `${guildId}_${userId}`;
  return data[key] || null;
};

const initEconomy = (guildId, userId) => {
  const data = readJSON('economy.json');
  const key = `${guildId}_${userId}`;
  if (!data[key]) {
    data[key] = {
      coins: 0,
      daily_last: 0,
      weekly_last: 0
    };
    writeJSON('economy.json', data);
  }
  return data[key];
};

const updateCoins = (guildId, userId, coins) => {
  const data = readJSON('economy.json');
  const key = `${guildId}_${userId}`;
  if (!data[key]) {
    initEconomy(guildId, userId);
  }
  data[key].coins = coins;
  writeJSON('economy.json', data);
};

const updateDaily = (guildId, userId, timestamp) => {
  const data = readJSON('economy.json');
  const key = `${guildId}_${userId}`;
  if (data[key]) {
    data[key].daily_last = timestamp;
    writeJSON('economy.json', data);
  }
};

const updateWeekly = (guildId, userId, timestamp) => {
  const data = readJSON('economy.json');
  const key = `${guildId}_${userId}`;
  if (data[key]) {
    data[key].weekly_last = timestamp;
    writeJSON('economy.json', data);
  }
};

const getTopCoins = (guildId) => {
  const data = readJSON('economy.json');
  const guildUsers = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith(guildId + '_')) {
      const userId = key.split('_')[1];
      guildUsers.push({ user_id: userId, coins: value.coins });
    }
  }
  
  return guildUsers.sort((a, b) => b.coins - a.coins).slice(0, 10);
};

// XP
const getXP = (guildId, userId) => {
  const data = readJSON('xp.json');
  const key = `${guildId}_${userId}`;
  return data[key] || null;
};

const initXP = (guildId, userId) => {
  const data = readJSON('xp.json');
  const key = `${guildId}_${userId}`;
  if (!data[key]) {
    data[key] = {
      xp: 0,
      level: 1,
      last_message: 0
    };
    writeJSON('xp.json', data);
  }
  return data[key];
};

const updateXP = (guildId, userId, xp, level, lastMessage) => {
  const data = readJSON('xp.json');
  const key = `${guildId}_${userId}`;
  if (!data[key]) {
    initXP(guildId, userId);
  }
  data[key] = {
    xp: xp,
    level: level,
    last_message: lastMessage
  };
  writeJSON('xp.json', data);
};

const getTopXP = (guildId) => {
  const data = readJSON('xp.json');
  const guildUsers = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith(guildId + '_')) {
      const userId = key.split('_')[1];
      guildUsers.push({ user_id: userId, xp: value.xp, level: value.level });
    }
  }
  
  return guildUsers.sort((a, b) => b.xp - a.xp).slice(0, 10);
};

module.exports = {
  readJSON,
  writeJSON,
  getGuildConfig,
  initGuildConfig,
  updateGuildConfig,
  getWarnings,
  addWarning,
  clearWarnings,
  getMute,
  addMute,
  removeMute,
  getExpiredMutes,
  getEconomy,
  initEconomy,
  updateCoins,
  updateDaily,
  updateWeekly,
  getTopCoins,
  getXP,
  initXP,
  updateXP,
  getTopXP
};
