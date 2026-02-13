const { economy, xp, marriages, inventory } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, hasActiveItem, cleanExpiredItems } = require('../../utils/helpers');

const EMPRESAS = {
  banca_jornal: { name: 'Banca de Jornal' },
  lanchonete: { name: 'Lanchonete' },
  loja_roupas: { name: 'Loja de Roupas' },
  restaurante: { name: 'Restaurante' },
  academia: { name: 'Academia' },
  hotel: { name: 'Hotel' }
};

const TITLES = [
  'Novato', 'Iniciante', 'Aprendiz', 'Experiente', 'Veterano',
  'Elite', 'Mestre', 'Lendário', 'Mítico', 'Divino'
];

module.exports = {
  data: {
    name: 'perfil',
    description: 'Ver perfil completo de um usuário',
    options: [{
      name: 'usuario',
      description: 'Usuário para ver perfil',
      type: 6,
      required: false
    }]
  },

  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const key = makeKey(interaction.guildId, user.id);

    let economyData = economy.get(key);
    let xpData = xp.get(key);
    
    if (!economyData) {
      economyData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    if (!xpData) {
      xpData = { xp: 0, level: 1 };
    }

    const partnerId = marriages.get(key);
    let partnerText = 'Solteiro(a)';
    let statusLabel = 'Status';
    
    if (partnerId) {
      const partner = await interaction.client.users.fetch(partnerId).catch(() => null);
      if (partner) {
        partnerText = partner.username;
        statusLabel = 'Casado(a) com';
      }
    }

    let userInventory = inventory.get(key) || [];
    userInventory = cleanExpiredItems(userInventory);
    inventory.set(key, userInventory);
    
    // Verifica empresas
    let businessText = 'Nenhuma';
    if (economyData.businesses && Object.keys(economyData.businesses).length > 0) {
      const ownedBusinesses = Object.keys(economyData.businesses)
        .map(id => EMPRESAS[id]?.name)
        .filter(Boolean);
      businessText = ownedBusinesses.join(', ');
    }
    
    // Verifica se tem título personalizado
    let title = TITLES[Math.min(Math.floor(xpData.level / 5), TITLES.length - 1)];
    const hasCustomTitle = hasActiveItem(userInventory, 'custom_title');
    
    if (hasCustomTitle) {
      const titleItem = userInventory.find(i => i.id === 'custom_title');
      if (titleItem && titleItem.customTitle) {
        title = `👑 ${titleItem.customTitle}`;
      }
    }
    
    // Verifica badges especiais
    const hasVIP = hasActiveItem(userInventory, 'vip_badge');
    const hasGlow = hasActiveItem(userInventory, 'name_glow');
    
    let badges = '';
    if (hasVIP) badges += '⭐ ';
    if (hasGlow) badges += '✨ ';

    const embed = createEmbed(
      'Perfil de Usuário',
      `**${badges}${user.username}${badges ? '' : ''}**\n\n` +
      '```yaml\n' +
      `Título: ${title}\n` +
      `Nível: ${xpData.level}\n` +
      `XP: ${xpData.xp}\n` +
      `Coins: ${economyData.coins}\n` +
      `${statusLabel}: ${partnerText}\n` +
      `Dono de: ${businessText}\n` +
      `Itens: ${userInventory.length}\n` +
      '```\n' +
      `**Conta criada:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>`
    );
    embed.setThumbnail(user.displayAvatarURL({ size: 256 }));
    
    // Cor especial se tiver custom color
    if (hasActiveItem(userInventory, 'custom_color')) {
      embed.setColor('#FF69B4');
    }
    
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
