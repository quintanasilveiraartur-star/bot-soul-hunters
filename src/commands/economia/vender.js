const { economy, inventory } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError, cleanExpiredItems } = require('../../utils/helpers');

const ITEM_VALUES = {
  'vip_badge': 2500,
  'custom_color': 1000,
  'name_glow': 3000,
  'custom_title': 3500
};

module.exports = {
  data: {
    name: 'vender',
    description: 'Vende um item do seu inventário por coins',
    options: [{
      name: 'item',
      description: 'Número do item no inventário (use /inventario para ver)',
      type: 4,
      required: true,
      minValue: 1
    }]
  },

  async execute(interaction) {
    const itemIndex = interaction.options.getInteger('item') - 1;
    const key = makeKey(interaction.guildId, interaction.user.id);
    
    let userInventory = inventory.get(key) || [];
    userInventory = cleanExpiredItems(userInventory);
    
    if (userInventory.length === 0) {
      return replyError(interaction, 'Seu inventário está vazio');
    }

    if (itemIndex < 0 || itemIndex >= userInventory.length) {
      return replyError(interaction, 'Item não encontrado no inventário');
    }

    const item = userInventory[itemIndex];
    
    // Verifica se o item pode ser vendido
    if (item.expires) {
      return replyError(interaction, 'Itens temporários não podem ser vendidos');
    }

    const sellValue = ITEM_VALUES[item.id] || 100;
    
    // Remove item do inventário
    userInventory.splice(itemIndex, 1);
    inventory.set(key, userInventory);
    
    // Adiciona coins
    let userData = economy.get(key);
    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }
    userData.coins += sellValue;
    economy.set(key, userData);

    const embed = createEmbed(
      'Item Vendido',
      `> Você vendeu **${item.name}** com sucesso!\n\n` +
      `**- Item:** ${item.name}\n` +
      `**- Valor recebido:** \`${sellValue}\` coins\n` +
      `**- Saldo atual:** \`${userData.coins}\` coins`
    );
    embed.setColor('#00FF00');
    addServerFooter(embed, interaction.guild);
    await interaction.reply({ embeds: [embed] });
  }
};
