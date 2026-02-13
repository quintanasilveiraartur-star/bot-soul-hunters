const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, random } = require('../../utils/helpers');

const CRIMES = [
  { name: 'Assaltar uma loja', min: 200, max: 800, risk: 0.5 },
  { name: 'Roubar um carro', min: 500, max: 1500, risk: 0.6 },
  { name: 'Invadir uma casa', min: 300, max: 1000, risk: 0.55 },
  { name: 'Hackear um banco', min: 1000, max: 3000, risk: 0.7 },
  { name: 'Contrabandear itens', min: 400, max: 1200, risk: 0.5 },
  { name: 'Falsificar documentos', min: 600, max: 1800, risk: 0.65 }
];

module.exports = {
  data: {
    name: 'crime',
    description: 'Comete um crime arriscado para ganhar coins (cooldown: 30 minutos)'
  },

  async execute(interaction) {
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0, lastCrime: 0 };
    }

    // Verifica cooldown de 30 minutos
    const now = Date.now();
    const cooldown = 30 * 60 * 1000;
    const lastCrime = userData.lastCrime || 0;
    const timeLeft = cooldown - (now - lastCrime);

    if (timeLeft > 0) {
      const minutosRestantes = Math.ceil(timeLeft / 60000);
      
      const embed = createEmbed(
        'Cooldown Ativo',
        `> Você está se escondendo da polícia!\n\n` +
        `**- Tempo restante:** \`${minutosRestantes} minutos\`\n\n` +
        `> Aguarde antes de cometer outro crime.`
      );
      embed.setColor('#FF9900');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Escolhe crime aleatório
    const crime = CRIMES[random(0, CRIMES.length - 1)];
    const chance = Math.random();

    userData.lastCrime = now;

    if (chance > crime.risk) {
      // Sucesso
      const ganho = random(crime.min, crime.max);
      userData.coins += ganho;
      economy.set(key, userData);

      const embed = createEmbed(
        'Crime Bem-Sucedido',
        `> Você conseguiu **${crime.name.toLowerCase()}** com sucesso!\n\n` +
        `**- Crime:** ${crime.name}\n` +
        `**- Ganhou:** \`${ganho}\` coins\n` +
        `**- Saldo atual:** \`${userData.coins}\` coins`
      );
      embed.setColor('#00FF00');
      addServerFooter(embed, interaction.guild);
      await interaction.reply({ embeds: [embed] });
    } else {
      // Falha
      const multa = random(Math.floor(crime.min * 0.5), Math.floor(crime.max * 0.5));
      userData.coins = Math.max(0, userData.coins - multa);
      economy.set(key, userData);

      const embed = createEmbed(
        'Crime Fracassado',
        `> Você foi pego tentando **${crime.name.toLowerCase()}**!\n\n` +
        `**- Crime:** ${crime.name}\n` +
        `**- Multa:** \`${multa}\` coins\n` +
        `**- Saldo atual:** \`${userData.coins}\` coins`
      );
      embed.setColor('#FF0000');
      addServerFooter(embed, interaction.guild);
      await interaction.reply({ embeds: [embed] });
    }
  }
};
