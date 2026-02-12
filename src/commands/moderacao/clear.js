const { PermissionFlagsBits } = require('discord.js');
const { createEmbed, addServerFooter, sendLog, replyError } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'clear',
    description: 'Limpa mensagens do canal',
    options: [{
      name: 'quantidade',
      description: 'Quantidade de mensagens (1-100)',
      type: 4,
      required: true
    }],
    default_member_permissions: PermissionFlagsBits.ManageMessages.toString()
  },

  async execute(interaction, client) {
    const amount = interaction.options.getInteger('quantidade');

    if (amount < 1 || amount > 100) {
      return replyError(interaction, 'Quantidade deve ser entre 1 e 100.');
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);

      const embed = createEmbed(
        'Mensagens Limpas',
        `**${deleted.size}** mensagens foram deletadas\n` +
        `**Moderador:** ${interaction.user.tag}`
      );
      addServerFooter(embed, interaction.guild);

      await interaction.reply({ embeds: [embed], ephemeral: true });

      // Log
      const logEmbed = createEmbed(
        'Log: Clear',
        `**Canal:** ${interaction.channel.name}\n` +
        `**Mensagens deletadas:** ${deleted.size}\n` +
        `**Moderador:** ${interaction.user.tag}`,
        '#0099ff'
      );
      addServerFooter(logEmbed, interaction.guild);
      
      await sendLog(client, interaction.guildId, logEmbed);

    } catch (error) {
      console.error('Erro ao limpar mensagens:', error);
      return replyError(interaction, 'Não consegui limpar as mensagens. Elas podem ser muito antigas.');
    }
  }
};
