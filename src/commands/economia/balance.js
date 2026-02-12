const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'balance',
    description: 'Ver saldo de coins',
    options: [{
      name: 'usuario',
      description: 'Usuário para ver saldo',
      type: 6,
      required: false
    }]
  },

  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const key = makeKey(interaction.guildId, user.id);
    
    let userData = economy.get(key);
    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    const embed = createEmbed(
      'Saldo',
      `**Usuário:** \`${user.username}\`\n\n` +
      '```yaml\n' +
      `Coins: ${userData.coins}\n` +
      '```'
    );
    embed.setThumbnail(user.displayAvatarURL());
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
