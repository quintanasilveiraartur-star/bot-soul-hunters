const { createEmbed, addServerFooter } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'avatar',
    description: 'Mostra o avatar de um usuário',
    options: [{
      name: 'usuario',
      description: 'Usuário para ver avatar',
      type: 6,
      required: false
    }]
  },

  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const avatarURL = user.displayAvatarURL({ size: 4096 });

    const embed = createEmbed(
      `Avatar de ${user.username}`,
      `[Link do Avatar](${avatarURL})`
    );
    embed.setImage(avatarURL);
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
