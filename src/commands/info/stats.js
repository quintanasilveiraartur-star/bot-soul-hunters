const { economy, xp, warnings, marriages, inventory } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'stats',
    description: 'Ver suas estatísticas completas',
    options: [{
      name: 'usuario',
      description: 'Usuário para ver stats',
      type: 6,
      required: false
    }]
  },

  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const key = makeKey(interaction.guildId, user.id);

    // Coleta dados
    let economyData = economy.get(key) || { coins: 0, lastDaily: 0, lastWeekly: 0 };
    let xpData = xp.get(key) || { xp: 0, level: 1 };
    let userWarnings = warnings.get(key) || [];
    let userInventory = inventory.get(key) || [];
    let partnerId = marriages.get(key);

    // Calcula estatísticas
    const totalCoins = economyData.coins;
    const level = xpData.level;
    const totalXp = xpData.xp;
    const totalWarnings = userWarnings.length;
    const totalItems = userInventory.length;

    // Status de relacionamento
    let relationshipStatus = 'Solteiro(a)';
    if (partnerId) {
      const partner = await interaction.client.users.fetch(partnerId).catch(() => null);
      if (partner) {
        relationshipStatus = `Casado(a) com ${partner.username}`;
      }
    }

    // Tempo no servidor
    const member = interaction.guild.members.cache.get(user.id);
    const joinedAt = member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Desconhecido';

    // Conta criada
    const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`;

    const embed = createEmbed(
      `Estatísticas de ${user.username}`,
      '```yaml\n' +
      '=== ECONOMIA ===\n' +
      `Coins: ${totalCoins}\n` +
      `Itens: ${totalItems}\n\n` +
      '=== PROGRESSÃO ===\n' +
      `Nível: ${level}\n` +
      `XP Total: ${totalXp}\n\n` +
      '=== SOCIAL ===\n' +
      `Status: ${relationshipStatus}\n` +
      `Avisos: ${totalWarnings}\n\n` +
      '=== SERVIDOR ===\n' +
      '```\n' +
      `- **Entrou:** ${joinedAt}\n` +
      `- **Conta criada:** ${createdAt}`
    );

    embed.setThumbnail(user.displayAvatarURL({ size: 256 }));
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
