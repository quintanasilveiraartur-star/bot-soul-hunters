const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey } = require('../../utils/helpers');

const PETS = {
  cachorro: {
    name: 'Cachorro',
    price: 10000,
    bonus: { type: 'coins', value: 0.1 }, // +10% coins
    description: 'Aumenta ganho de coins em 10%'
  },
  gato: {
    name: 'Gato',
    price: 10000,
    bonus: { type: 'xp', value: 0.1 }, // +10% XP
    description: 'Aumenta ganho de XP em 10%'
  },
  papagaio: {
    name: 'Papagaio',
    price: 15000,
    bonus: { type: 'luck', value: 0.05 }, // +5% sorte
    description: 'Aumenta sorte em apostas e roubos em 5%'
  },
  coelho: {
    name: 'Coelho',
    price: 12000,
    bonus: { type: 'cooldown', value: 0.1 }, // -10% cooldown
    description: 'Reduz cooldowns em 10%'
  },
  dragao: {
    name: 'Dragão',
    price: 50000,
    bonus: { type: 'coins', value: 0.25 }, // +25% coins
    description: 'Aumenta ganho de coins em 25%'
  },
  fenix: {
    name: 'Fênix',
    price: 50000,
    bonus: { type: 'xp', value: 0.25 }, // +25% XP
    description: 'Aumenta ganho de XP em 25%'
  },
  unicornio: {
    name: 'Unicórnio',
    price: 75000,
    bonus: { type: 'luck', value: 0.15 }, // +15% sorte
    description: 'Aumenta sorte em apostas e roubos em 15%'
  }
};

module.exports = {
  data: {
    name: 'pet',
    description: 'Gerencie seus pets',
    options: [
      {
        name: 'acao',
        description: 'Ação a realizar',
        type: 3,
        required: true,
        choices: [
          { name: 'Ver Pets', value: 'ver' },
          { name: 'Comprar Pet', value: 'comprar' },
          { name: 'Equipar Pet', value: 'equipar' },
          { name: 'Meus Pets', value: 'meus' }
        ]
      },
      {
        name: 'pet',
        description: 'Nome do pet',
        type: 3,
        required: false,
        choices: [
          { name: 'Cachorro - 10k (+10% coins)', value: 'cachorro' },
          { name: 'Gato - 10k (+10% XP)', value: 'gato' },
          { name: 'Papagaio - 15k (+5% sorte)', value: 'papagaio' },
          { name: 'Coelho - 12k (-10% cooldown)', value: 'coelho' },
          { name: 'Dragão - 50k (+25% coins)', value: 'dragao' },
          { name: 'Fênix - 50k (+25% XP)', value: 'fenix' },
          { name: 'Unicórnio - 75k (+15% sorte)', value: 'unicornio' }
        ]
      }
    ]
  },

  async execute(interaction) {
    const acao = interaction.options.getString('acao');
    const petId = interaction.options.getString('pet');
    
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, pets: [], activePet: null };
    }

    if (!userData.pets) userData.pets = [];
    if (!userData.activePet) userData.activePet = null;

    if (acao === 'ver') {
      let description = '**Pets Disponíveis**\n\n';
      
      for (const [id, pet] of Object.entries(PETS)) {
        const owned = userData.pets.includes(id);
        const status = owned ? '✅ Possui' : '❌ Não possui';
        
        description += `**${pet.name}**\n`;
        description += `- Preço: \`${pet.price.toLocaleString()}\` coins\n`;
        description += `- Bônus: ${pet.description}\n`;
        description += `- Status: ${status}\n\n`;
      }

      description += `> Pets fornecem bônus permanentes quando equipados!`;

      const embed = createEmbed('Loja de Pets', description);
      embed.setColor('#FFD700');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (acao === 'meus') {
      if (userData.pets.length === 0) {
        const embed = createEmbed(
          'Sem Pets',
          `> Você não possui nenhum pet!\n\n` +
          `**- Use:** \`/pet comprar\` para adquirir um`
        );
        embed.setColor('#FF0000');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      let description = '**Seus Pets**\n\n';
      
      for (const id of userData.pets) {
        const pet = PETS[id];
        const isActive = userData.activePet === id;
        const status = isActive ? '🟢 Equipado' : '⚪ Guardado';
        
        description += `**${pet.name}** ${status}\n`;
        description += `- Bônus: ${pet.description}\n\n`;
      }

      if (userData.activePet) {
        description += `> Use \`/pet equipar\` para trocar de pet ativo`;
      } else {
        description += `> Use \`/pet equipar\` para equipar um pet`;
      }

      const embed = createEmbed('Meus Pets', description);
      embed.setColor('#00FF00');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (acao === 'comprar') {
      if (!petId) {
        const embed = createEmbed(
          'Erro',
          `> Você precisa especificar qual pet comprar!\n\n` +
          `**- Use:** \`/pet comprar pet:[nome]\``
        );
        embed.setColor('#FF0000');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const pet = PETS[petId];
      
      if (userData.pets.includes(petId)) {
        const embed = createEmbed(
          'Erro',
          `> Você já possui este pet!\n\n` +
          `**- Pet:** ${pet.name}`
        );
        embed.setColor('#FF0000');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (userData.coins < pet.price) {
        const embed = createEmbed(
          'Saldo Insuficiente',
          `> Você não tem coins suficientes!\n\n` +
          `**- Seu saldo:** \`${userData.coins}\` coins\n` +
          `**- Necessário:** \`${pet.price}\` coins`
        );
        embed.setColor('#FF0000');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      userData.coins -= pet.price;
      userData.pets.push(petId);
      
      // Equipa automaticamente se for o primeiro pet
      if (userData.pets.length === 1) {
        userData.activePet = petId;
      }
      
      economy.set(key, userData);

      const embed = createEmbed(
        'Pet Adquirido',
        `> Parabéns pelo novo companheiro!\n\n` +
        `**- Pet:** ${pet.name}\n` +
        `**- Preço:** \`${pet.price.toLocaleString()}\` coins\n` +
        `**- Bônus:** ${pet.description}\n` +
        `**- Saldo restante:** \`${userData.coins}\` coins\n\n` +
        `${userData.pets.length === 1 ? '> Pet equipado automaticamente!' : '> Use `/pet equipar` para equipá-lo!'}`
      );
      embed.setColor('#00FF00');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (acao === 'equipar') {
      if (!petId) {
        const embed = createEmbed(
          'Erro',
          `> Você precisa especificar qual pet equipar!\n\n` +
          `**- Use:** \`/pet equipar pet:[nome]\``
        );
        embed.setColor('#FF0000');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (!userData.pets.includes(petId)) {
        const embed = createEmbed(
          'Erro',
          `> Você não possui este pet!\n\n` +
          `**- Use:** \`/pet comprar\` para adquiri-lo`
        );
        embed.setColor('#FF0000');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const pet = PETS[petId];
      const oldPet = userData.activePet ? PETS[userData.activePet] : null;
      
      userData.activePet = petId;
      economy.set(key, userData);

      const embed = createEmbed(
        'Pet Equipado',
        `> Pet ativo alterado com sucesso!\n\n` +
        `**- Pet anterior:** ${oldPet ? oldPet.name : 'Nenhum'}\n` +
        `**- Pet atual:** ${pet.name}\n` +
        `**- Bônus ativo:** ${pet.description}`
      );
      embed.setColor('#00FF00');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
