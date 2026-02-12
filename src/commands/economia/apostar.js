const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'apostar',
    description: 'Aposta coins',
    options: [{
      name: 'quantia',
      description: 'Quantia para apostar',
      type: 4,
      required: true
    }]
  },

  async execute(interaction) {
    const quantia = interaction.options.getInteger('quantia');
    
    if (quantia < 10) {
      return replyError(interaction, 'Aposta mínima: 10 coins');
    }

    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    if (userData.coins < quantia) {
      return replyError(interaction, 'Você não tem coins suficientes');
    }

    const chance = Math.random();
    let resultado, ganho;
    
    if (chance < 0.45) {
      ganho = quantia;
      resultado = 'Você ganhou';
    } else if (chance < 0.90) {
      ganho = -quantia;
      resultado = 'Você perdeu';
    } else {
      ganho = quantia * 2;
      resultado = 'JACKPOT! Você ganhou o dobro';
    }
    
    userData.coins += ganho;
    economy.set(key, userData);

    const embed = createEmbed(
      'Aposta',
      `**Apostou:** \`${quantia} coins\`\n\n` +
      '```diff\n' +
      `${ganho > 0 ? '+' : '-'} ${resultado}\n` +
      `${ganho > 0 ? '+' : '-'} ${Math.abs(ganho)} coins\n` +
      '```\n' +
      `**Saldo atual:** \`${userData.coins} coins\``
    );
    embed.setThumbnail(interaction.user.displayAvatarURL());
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
