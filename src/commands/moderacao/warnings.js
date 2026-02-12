const { PermissionFlagsBits } = require('discord.js');
const { warnings } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'warnings',
    description: 'Ver avisos de um membro',
    options: [{
      name: 'usuario',
      description: 'Usuário para ver avisos',
      type: 6,
      required: true
    }],
    default_member_permissions: PermissionFlagsBits.ModerateMembers.toString()
  },

  async execute(interaction, client) {
    const target = interaction.options.getUser('usuario');
    const key = makeKey(interaction.guildId, target.id);
    
    const userWarnings = warnings.get(key) || [];

    if (userWarnings.length === 0) {
      const embed = createEmbed(
        'Avisos',
        `**${target.username}** não tem avisos`
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    let desc = `**Usuário:** ${target.username}\n` +
      `**Total de avisos:** ${userWarnings.length}\n\n`;

    for (let i = 0; i < userWarnings.length; i++) {
      const warn = userWarnings[i];
      const moderator = await client.users.fetch(warn.moderator).catch(() => null);
      const modName = moderator ? moderator.tag : 'Desconhecido';
      
      desc += `**${i + 1}.** ${warn.reason}\n` +
        `> Moderador: ${modName}\n` +
        `> Data: <t:${Math.floor(warn.timestamp / 1000)}:R>\n\n`;
    }

    const embed = createEmbed(
      'Lista de Avisos',
      desc
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
