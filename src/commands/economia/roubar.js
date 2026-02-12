const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'roubar',
    description: 'Tenta roubar coins de alguém',
    options: [{
      name: 'usuario',
      description: 'Usuário para roubar',
      type: 6,
      required: true
    }]
  },

  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    
    if (target.id === interaction.user.id) {
      return replyError(interaction, 'Você não pode roubar de si mesmo');
    }
    
    if (target.bot) {
      return replyError(interaction, 'Você não pode roubar de bots');
    }

    const userKey = makeKey(interaction.guildId, interaction.user.id);
    const targetKey = makeKey(interaction.guildId, target.id);
    
    let userData = economy.get(userKey);
    let targetData = economy.get(targetKey);

    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    if (!targetData) {
      targetData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    if (targetData.coins < 100) {
      return replyError(interaction, 'Este usuário não tem coins suficientes para roubar (mínimo: 100)');
    }

    const chance = Math.random();
    
    if (chance < 0.4) {
      // Sucesso
      const roubado = Math.floor(targetData.coins * 0.2);
      
      userData.coins += roubado;
      targetData.coins -= roubado;
      
      economy.set(userKey, userData);
      economy.set(targetKey, targetData);

      const embed = createEmbed(
        'Roubo Bem-Sucedido',
        `Você roubou **${roubado} coins** de ${target.username}\n\n` +
        `**Seu saldo:** ${userData.coins} coins`
      );
      addServerFooter(embed, interaction.guild);

      await interaction.reply({ embeds: [embed] });
    } else {
      // Falha
      const multa = Math.floor(userData.coins * 0.15);
      
      userData.coins = Math.max(0, userData.coins - multa);
      economy.set(userKey, userData);

      const embed = createEmbed(
        'Roubo Fracassado',
        `Você foi pego tentando roubar!\n` +
        `**Multa:** ${multa} coins\n\n` +
        `**Seu saldo:** ${userData.coins} coins`
      );
      addServerFooter(embed, interaction.guild);

      await interaction.reply({ embeds: [embed] });
    }
  }
};
