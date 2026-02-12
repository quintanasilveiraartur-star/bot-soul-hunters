const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, random } = require('../../utils/helpers');
const { getTrabalho } = require('../../utils/contentData');

module.exports = {
  data: {
    name: 'trabalhar',
    description: 'Trabalha para ganhar coins (cooldown: 10 minutos)'
  },

  async execute(interaction) {
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0, lastWork: 0 };
    }

    // Verifica cooldown de 10 minutos
    const now = Date.now();
    const cooldown = 10 * 60 * 1000; // 10 minutos em milissegundos
    const lastWork = userData.lastWork || 0;
    const timeLeft = cooldown - (now - lastWork);

    if (timeLeft > 0) {
      const minutosRestantes = Math.ceil(timeLeft / 60000);
      const segundosRestantes = Math.ceil((timeLeft % 60000) / 1000);
      
      const embed = createEmbed(
        'Cooldown Ativo',
        `> Você está cansado! Descanse um pouco.\n\n` +
        `- **Tempo restante:** \`${minutosRestantes}m ${segundosRestantes}s\``,
        '#ff9900'
      );
      addServerFooter(embed, interaction.guild);
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const trabalho = getTrabalho();
    const ganho = random(trabalho.min, trabalho.max);
    
    userData.coins += ganho;
    userData.lastWork = now;
    economy.set(key, userData);

    const embed = createEmbed(
      'Trabalho Realizado',
      `Você trabalhou como **${trabalho.nome}** ${trabalho.emoji}\n\n` +
      '```yaml\n' +
      `Ganhou: ${ganho} coins\n` +
      `Saldo Total: ${userData.coins} coins\n` +
      '```'
    );
    embed.setThumbnail(interaction.user.displayAvatarURL());
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
