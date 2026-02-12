const { xp } = require('../../utils/db');
const { createEmbed, addServerFooter } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'leaderboard',
    description: 'Ver ranking de XP do servidor'
  },

  async execute(interaction) {
    const allData = xp.read();
    const guildPrefix = `${interaction.guildId}_`;
    
    // Filtra e ordena usuários deste servidor
    const topUsers = Object.entries(allData)
      .filter(([key]) => key.startsWith(guildPrefix))
      .map(([key, data]) => ({
        userId: key.replace(guildPrefix, ''),
        level: data.level,
        xp: data.xp
      }))
      .sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        return b.xp - a.xp;
      })
      .slice(0, 10);

    if (topUsers.length === 0) {
      const embed = createEmbed(
        'Leaderboard',
        'Nenhum usuário no ranking ainda'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    let desc = '**Top 10 Níveis**\n\n';
    
    for (let i = 0; i < topUsers.length; i++) {
      const user = await interaction.client.users.fetch(topUsers[i].userId).catch(() => null);
      if (user) {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
        desc += `${medal} ${user.username} - **Nível ${topUsers[i].level}** (${topUsers[i].xp} XP)\n`;
      }
    }

    const embed = createEmbed(
      'Leaderboard de XP',
      desc + '\n```\nTop 10 Níveis do Servidor\n```'
    );
    embed.setThumbnail(interaction.guild.iconURL());
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
