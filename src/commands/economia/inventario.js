const { inventory } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'inventario',
    description: 'Ver seus itens'
  },

  async execute(interaction) {
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userInventory = inventory.get(key) || [];

    if (userInventory.length === 0) {
      const embed = createEmbed(
        'Inventário',
        'Seu inventário está vazio'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    let desc = '**Seus Itens:**\n\n';
    const now = Date.now();

    userInventory.forEach((item, i) => {
      if (item.expires) {
        if (item.expires > now) {
          const timeLeft = item.expires - now;
          const daysLeft = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
          const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
          desc += `**${i + 1}.** ${item.name} - Expira em ${daysLeft}d ${hoursLeft}h\n`;
        }
      } else {
        desc += `**${i + 1}.** ${item.name}\n`;
      }
    });

    const embed = createEmbed(
      'Inventário',
      desc
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
