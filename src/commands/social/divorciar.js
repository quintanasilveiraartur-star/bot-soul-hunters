const { marriages } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'divorciar',
    description: 'Divorcia-se'
  },

  async execute(interaction) {
    const userKey = makeKey(interaction.guildId, interaction.user.id);
    
    if (!marriages.has(userKey)) {
      return replyError(interaction, 'Você não está casado(a)');
    }

    const partnerId = marriages.get(userKey);
    const partnerKey = makeKey(interaction.guildId, partnerId);
    
    marriages.delete(userKey);
    marriages.delete(partnerKey);

    const embed = createEmbed(
      'Divórcio',
      'Você se divorciou'
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
