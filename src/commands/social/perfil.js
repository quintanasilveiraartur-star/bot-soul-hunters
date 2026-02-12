const { economy, xp, marriages, inventory } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey } = require('../../utils/helpers');

const TITLES = [
  'Novato', 'Iniciante', 'Aprendiz', 'Experiente', 'Veterano',
  'Elite', 'Mestre', 'Lendário', 'Mítico', 'Divino'
];

module.exports = {
  data: {
    name: 'perfil',
    description: 'Ver perfil completo de um usuário',
    options: [{
      name: 'usuario',
      description: 'Usuário para ver perfil',
      type: 6,
      required: false
    }]
  },

  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const key = makeKey(interaction.guildId, user.id);

    let economyData = economy.get(key);
    let xpData = xp.get(key);
    
    if (!economyData) {
      economyData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    if (!xpData) {
      xpData = { xp: 0, level: 1 };
    }

    const partnerId = marriages.get(key);
    let partnerText = 'Solteiro(a)';
    
    if (partnerId) {
      const partner = await interaction.client.users.fetch(partnerId).catch(() => null);
      if (partner) {
        partnerText = partner.username;
      }
    }

    const userInventory = inventory.get(key) || [];
    const titleIndex = Math.min(Math.floor(xpData.level / 5), TITLES.length - 1);
    const title = TITLES[titleIndex];

    const embed = createEmbed(
      'Perfil de Usuário',
      `**${user.username}**\n\n` +
      '```yaml\n' +
      `Título: ${title}\n` +
      `Nível: ${xpData.level}\n` +
      `XP: ${xpData.xp}\n` +
      `Coins: ${economyData.coins}\n` +
      `Status: ${partnerText}\n` +
      `Itens: ${userInventory.length}\n` +
      '```\n' +
      `**Conta criada:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>`
    );
    embed.setThumbnail(user.displayAvatarURL({ size: 256 }));
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
