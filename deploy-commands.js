require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];

// Carrega comandos de todas as pastas
const commandFolders = fs.readdirSync('./src/commands');
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(f => f.endsWith('.js'));
  
  for (const file of commandFiles) {
    const command = require(`./src/commands/${folder}/${file}`);
    if (command.data) {
      commands.push(command.data);
      console.log(`✓ Carregado: ${command.data.name}`);
    }
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN || require('./config.json').token);

(async () => {
  try {
    console.log(`\nRegistrando ${commands.length} comandos...`);

    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID || require('./config.json').clientId),
      { body: commands }
    );

    console.log(`✓ ${data.length} comandos registrados com sucesso!\n`);
  } catch (error) {
    console.error('Erro ao registrar comandos:', error);
  }
})();
