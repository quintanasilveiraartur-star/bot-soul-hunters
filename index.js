require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Cliente com as intents necessárias
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration
  ]
});

client.commands = new Collection();

// Carrega comandos de todas as pastas
const commandFolders = fs.readdirSync('./src/commands');
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(f => f.endsWith('.js'));
  
  for (const file of commandFiles) {
    const command = require(`./src/commands/${folder}/${file}`);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }
}

// Carrega eventos
const eventFiles = fs.readdirSync('./src/events').filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./src/events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Inicia sistema de taxa diária
const { scheduleDailyTax } = require('./src/handlers/dailyTaxHandler');
client.once('ready', () => {
  scheduleDailyTax(client);
  console.log('💸 Sistema de taxa diária de custo de vida ativado!');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', error => {
  console.error('Erro não tratado:', error);
});

process.on('uncaughtException', error => {
  console.error('Exceção não capturada:', error);
  process.exit(1);
});

const token = process.env.TOKEN || require('./config.json').token;
client.login(token).catch(err => {
  console.error('Falha ao fazer login:', err);
  process.exit(1);
});
