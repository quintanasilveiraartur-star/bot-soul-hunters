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

// Aguarda tempo em ms
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  sleep
};
