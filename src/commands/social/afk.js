const { afk } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'afk',
    description: 'Marca como ausente',
    options: [{
      name: 'motivo',
      description: 'Motivo da ausência',
      type: 3,
      required: false
    }]
  },

  async execute(interaction) {
    const motivo = interaction.options.getString('motivo') || 'Sem motivo';
    const key = makeKey(interaction.guildId, interaction.user.id);

    afk.set(key, {
      reason: motivo,
      timestamp: Date.now()
    });

    const embed = createEmbed(
      'Modo AFK Ativado',
      `> Você está ausente agora.\n\n` +
      `- **Motivo:** ${motivo}\n\n` +
      `Quando você enviar uma mensagem, o modo AFK será desativado automaticamente.`
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
