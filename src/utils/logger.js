const db = require('../database/database');

async function sendLog(guildId, embed, client) {
  const config = db.getGuildConfig(guildId);
  if (!config || !config.log_channel) return;
  
  if (!client) {
    // Se client não foi passado, pegar do cache global
    const { client: globalClient } = require('../../index');
    client = globalClient;
  }
  
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;
  
  const logChannel = guild.channels.cache.get(config.log_channel);
  if (logChannel) {
    logChannel.send({ embeds: [embed] }).catch(() => {});
  }
}

module.exports = { sendLog };
