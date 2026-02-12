const { economy, inventory } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError } = require('../../utils/helpers');
const { getLojaItens } = require('../../utils/contentData');

module.exports = {
  data: {
    name: 'comprar',
    description: 'Compra um item da loja',
    options: [{
      name: 'item',
      description: 'Número do item (1-8)',
      type: 4,
      required: true,
      min_value: 1,
      max_value: 8
    }]
  },

  async execute(interaction) {
    const itemIndex = interaction.options.getInteger('item') - 1;
    const itens = getLojaItens();
    
    if (itemIndex < 0 || itemIndex >= itens.length) {
      return replyError(interaction, 'Item não encontrado na loja');
    }

    const item = itens[itemIndex];
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    if (userData.coins < item.price) {
      return replyError(interaction, `Você precisa de ${item.price} coins para comprar este item`);
    }

    let userInventory = inventory.get(key) || [];

    const existingItem = userInventory.find(i => i.id === item.id);
    if (existingItem && !item.duration) {
      return replyError(interaction, 'Você já possui este item');
    }

    userData.coins -= item.price;
    economy.set(key, userData);

    if (item.duration) {
      userInventory.push({
        id: item.id,
        name: item.name,
        expires: Date.now() + item.duration
      });
    } else {
      userInventory.push({
        id: item.id,
        name: item.name
      });
    }

    inventory.set(key, userInventory);

    const embed = createEmbed(
      'Compra Realizada',
      `${item.emoji} **Item:** ${item.name}\n` +
      `**Preço:** ${item.price} coins\n\n` +
      `**Saldo restante:** ${userData.coins} coins`
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
