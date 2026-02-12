const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'ranking',
    description: 'Ver ranking de coins do servidor'
  },

  async execute(interaction) {
    const allData = economy.read();
    const guildPrefix = `${interaction.guildId}_`;
    
    // Filtra e ordena usuários deste servidor
    const topUsers = Object.entries(allData)
      .filter(([key]) => key.startsWith(guildPrefix))
      .map(([key, data]) => ({
        userId: key.replace(guildPrefix, ''),
        coins: data.coins
      }))
      .sort((a, b) => b.coins - a.coins)
      .slice(0, 10);

    if (topUsers.length === 0) {
      const embed = createEmbed(
        'Ranking',
        'Nenhum usuário no ranking ainda'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    let desc = '**Top 10 Mais Ricos**\n\n';
    
    for (let i = 0; i < topUsers.length; i++) {
      const user = await interaction.client.users.fetch(topUsers[i].userId).catch(() => null);
      if (user) {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
        desc += `${medal} ${user.username} - **${topUsers[i].coins}** coins\n`;
      }
    }

    const embed = createEmbed(
      'Ranking de Coins',
      desc + '\n```\nTop 10 Mais Ricos do Servidor\n```'
    );
    embed.setThumbnail(interaction.guild.iconURL());
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
