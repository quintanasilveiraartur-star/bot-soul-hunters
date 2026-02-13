const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey } = require('../../utils/helpers');

const EMPRESAS = {
  banca_jornal: {
    name: 'Banca de Jornal',
    price: 5000,
    income: 50,
    cooldown: 2 * 60 * 60 * 1000 // 2 horas
  },
  lanchonete: {
    name: 'Lanchonete',
    price: 15000,
    income: 200,
    cooldown: 4 * 60 * 60 * 1000 // 4 horas
  },
  loja_roupas: {
    name: 'Loja de Roupas',
    price: 35000,
    income: 500,
    cooldown: 6 * 60 * 60 * 1000 // 6 horas
  },
  restaurante: {
    name: 'Restaurante',
    price: 75000,
    income: 1200,
    cooldown: 8 * 60 * 60 * 1000 // 8 horas
  },
  academia: {
    name: 'Academia',
    price: 150000,
    income: 2500,
    cooldown: 12 * 60 * 60 * 1000 // 12 horas
  },
  hotel: {
    name: 'Hotel',
    price: 300000,
    income: 5500,
    cooldown: 24 * 60 * 60 * 1000 // 24 horas
  }
};

module.exports = {
  data: {
    name: 'empresa',
    description: 'Gerencie suas empresas',
    options: [
      {
        name: 'acao',
        description: 'Ação a realizar',
        type: 3,
        required: true,
        choices: [
          { name: 'Ver Empresas', value: 'ver' },
          { name: 'Comprar Empresa', value: 'comprar' },
          { name: 'Coletar Lucros', value: 'coletar' }
        ]
      },
      {
        name: 'empresa',
        description: 'Nome da empresa',
        type: 3,
        required: false,
        choices: [
          { name: 'Banca de Jornal - 5k (50 coins/2h)', value: 'banca_jornal' },
          { name: 'Lanchonete - 15k (200 coins/4h)', value: 'lanchonete' },
          { name: 'Loja de Roupas - 35k (500 coins/6h)', value: 'loja_roupas' },
          { name: 'Restaurante - 75k (1.2k coins/8h)', value: 'restaurante' },
          { name: 'Academia - 150k (2.5k coins/12h)', value: 'academia' },
          { name: 'Hotel - 300k (5.5k coins/24h)', value: 'hotel' }
        ]
      }
    ]
  },

  async execute(interaction) {
    const acao = interaction.options.getString('acao');
    const empresaId = interaction.options.getString('empresa');
    
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, businesses: {} };
    }

    if (!userData.businesses) userData.businesses = {};

    if (acao === 'ver') {
      let description = '**Empresas Disponíveis**\n\n';
      
      for (const [id, empresa] of Object.entries(EMPRESAS)) {
        const owned = userData.businesses[id];
        const status = owned ? '✅ Possui' : '❌ Não possui';
        const hours = empresa.cooldown / (60 * 60 * 1000);
        
        description += `**${empresa.name}**\n`;
        description += `- Preço: \`${empresa.price.toLocaleString()}\` coins\n`;
        description += `- Renda: \`${empresa.income}\` coins a cada ${hours}h\n`;
        description += `- Status: ${status}\n\n`;
      }

      description += `> Compre empresas para gerar renda passiva!`;

      const embed = createEmbed('Empresas', description);
      embed.setColor('#FFD700');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (acao === 'comprar') {
      if (!empresaId) {
        const embed = createEmbed(
          'Erro',
          `> Você precisa especificar qual empresa comprar!\n\n` +
          `**- Use:** \`/empresa comprar empresa:[nome]\``
        );
        embed.setColor('#FF0000');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const empresa = EMPRESAS[empresaId];
      
      if (userData.businesses[empresaId]) {
        const embed = createEmbed(
          'Erro',
          `> Você já possui esta empresa!\n\n` +
          `**- Empresa:** ${empresa.name}`
        );
        embed.setColor('#FF0000');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (userData.coins < empresa.price) {
        const embed = createEmbed(
          'Saldo Insuficiente',
          `> Você não tem coins suficientes!\n\n` +
          `**- Seu saldo:** \`${userData.coins}\` coins\n` +
          `**- Necessário:** \`${empresa.price}\` coins`
        );
        embed.setColor('#FF0000');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      userData.coins -= empresa.price;
      userData.businesses[empresaId] = {
        lastCollect: Date.now()
      };
      economy.set(key, userData);

      const hours = empresa.cooldown / (60 * 60 * 1000);
      const embed = createEmbed(
        'Empresa Comprada',
        `> Parabéns pela aquisição!\n\n` +
        `**- Empresa:** ${empresa.name}\n` +
        `**- Investimento:** \`${empresa.price.toLocaleString()}\` coins\n` +
        `**- Renda:** \`${empresa.income}\` coins a cada ${hours}h\n` +
        `**- Saldo restante:** \`${userData.coins}\` coins\n\n` +
        `> Use \`/empresa coletar\` para coletar os lucros!`
      );
      embed.setColor('#00FF00');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (acao === 'coletar') {
      const ownedBusinesses = Object.keys(userData.businesses);
      
      if (ownedBusinesses.length === 0) {
        const embed = createEmbed(
          'Sem Empresas',
          `> Você não possui nenhuma empresa!\n\n` +
          `**- Use:** \`/empresa comprar\` para adquirir uma`
        );
        embed.setColor('#FF0000');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      let totalCollected = 0;
      let details = '';
      const now = Date.now();

      for (const id of ownedBusinesses) {
        const empresa = EMPRESAS[id];
        const business = userData.businesses[id];
        const timePassed = now - business.lastCollect;
        
        if (timePassed >= empresa.cooldown) {
          const multiplier = Math.floor(timePassed / empresa.cooldown);
          const collected = empresa.income * multiplier;
          totalCollected += collected;
          business.lastCollect = now;
          
          details += `**- ${empresa.name}:** \`${collected}\` coins\n`;
        } else {
          const timeLeft = empresa.cooldown - timePassed;
          const hours = Math.floor(timeLeft / (60 * 60 * 1000));
          const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
          details += `**- ${empresa.name}:** Disponível em ${hours}h ${minutes}m\n`;
        }
      }

      if (totalCollected === 0) {
        const embed = createEmbed(
          'Nenhum Lucro Disponível',
          `> Aguarde para coletar os lucros!\n\n${details}`
        );
        embed.setColor('#FF9900');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      userData.coins += totalCollected;
      economy.set(key, userData);

      const embed = createEmbed(
        'Lucros Coletados',
        `> Seus negócios estão prosperando!\n\n` +
        `${details}\n` +
        `**- Total coletado:** \`${totalCollected}\` coins\n` +
        `**- Saldo atual:** \`${userData.coins}\` coins`
      );
      embed.setColor('#00FF00');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
