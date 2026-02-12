const { inventory } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError, hasActiveItem, cleanExpiredItems } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'titulo',
    description: 'Define seu título personalizado',
    options: [{
      name: 'texto',
      description: 'Seu novo título (máximo 30 caracteres)',
      type: 3,
      required: true,
      maxLength: 30
    }]
  },

  async execute(interaction) {
    const titulo = interaction.options.getString('texto');
    const key = makeKey(interaction.guildId, interaction.user.id);
    
    // Verifica se tem o item de título personalizado
    let userInventory = inventory.get(key) || [];
    userInventory = cleanExpiredItems(userInventory);
    inventory.set(key, userInventory);
    
    if (!hasActiveItem(userInventory, 'custom_title')) {
      return replyError(interaction, 'Você precisa comprar o item "Título Personalizado" na loja primeiro! Use `/loja` para ver');
    }

    // Valida o título
    if (titulo.length < 3) {
      return replyError(interaction, 'O título deve ter no mínimo 3 caracteres');
    }

    // Atualiza o título no item
    const titleItem = userInventory.find(i => i.id === 'custom_title');
    if (titleItem) {
      titleItem.customTitle = titulo;
      inventory.set(key, userInventory);
    }

    const embed = createEmbed(
      '👑 Título Atualizado',
      `Seu novo título foi definido com sucesso!\n\n` +
      `**Novo título:** \`${titulo}\`\n\n` +
      `> Use \`/perfil\` para ver seu título em ação!`
    );
    embed.setColor('#FFD700');
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
