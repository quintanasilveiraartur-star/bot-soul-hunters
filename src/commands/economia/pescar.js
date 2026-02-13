const { economy, inventory } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, random } = require('../../utils/helpers');

const PEIXES = [
  { name: 'Sardinha', value: 50, rarity: 0.4 },
  { name: 'Atum', value: 150, rarity: 0.3 },
  { name: 'Salmão', value: 250, rarity: 0.15 },
  { name: 'Peixe Dourado', value: 500, rarity: 0.1 },
  { name: 'Peixe Lendário', value: 1000, rarity: 0.04 },
  { name: 'Lixo', value: 10, rarity: 0.01 }
];

module.exports = {
  data: {
    name: 'pescar',
    description: 'Pesca e vende o peixe por coins (cooldown: 15 minutos)'
  },

  async execute(interaction) {
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0, lastFish: 0 };
    }

    // Verifica cooldown de 15 minutos
    const now = Date.now();
    const cooldown = 15 * 60 * 1000;
    const lastFish = userData.lastFish || 0;
    const timeLeft = cooldown - (now - lastFish);

    if (timeLeft > 0) {
      const minutosRestantes = Math.ceil(timeLeft / 60000);
      
      const embed = createEmbed(
        'Cooldown Ativo',
        `> Você está descansando da pescaria!\n\n` +
        `**- Tempo restante:** \`${minutosRestantes} minutos\`\n\n` +
        `> Aguarde antes de pescar novamente.`
      );
      embed.setColor('#FF9900');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Escolhe peixe baseado na raridade
    const roll = Math.random();
    let cumulativeChance = 0;
    let peixe = PEIXES[0];

    for (const fish of PEIXES) {
      cumulativeChance += fish.rarity;
      if (roll <= cumulativeChance) {
        peixe = fish;
        break;
      }
    }

    userData.coins += peixe.value;
    userData.lastFish = now;
    economy.set(key, userData);

    let rarityText = '';
    if (peixe.value >= 500) rarityText = 'Lendário';
    else if (peixe.value >= 250) rarityText = 'Raro';
    else if (peixe.value >= 150) rarityText = 'Incomum';
    else rarityText = 'Comum';

    const embed = createEmbed(
      'Pescaria',
      `> Você pescou um **${peixe.name}**!\n\n` +
      `**- Peixe:** ${peixe.name}\n` +
      `**- Raridade:** ${rarityText}\n` +
      `**- Valor:** \`${peixe.value}\` coins\n` +
      `**- Saldo atual:** \`${userData.coins}\` coins`
    );
    
    if (peixe.value >= 500) embed.setColor('#FFD700');
    else if (peixe.value >= 250) embed.setColor('#9B59B6');
    else if (peixe.value >= 150) embed.setColor('#3498DB');
    else embed.setColor('#95A5A6');
    
    addServerFooter(embed, interaction.guild);
    await interaction.reply({ embeds: [embed] });
  }
};
