const { createEmbed, addServerFooter, randomChoice } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'ppt',
    description: 'Pedra, papel ou tesoura',
    options: [{
      name: 'escolha',
      description: 'Sua jogada',
      type: 3,
      required: true,
      choices: [
        { name: 'Pedra', value: 'pedra' },
        { name: 'Papel', value: 'papel' },
        { name: 'Tesoura', value: 'tesoura' }
      ]
    }]
  },

  async execute(interaction) {
    const userChoice = interaction.options.getString('escolha');
    const botChoice = randomChoice(['pedra', 'papel', 'tesoura']);
    
    let resultado;
    if (userChoice === botChoice) {
      resultado = 'Empate';
    } else if (
      (userChoice === 'pedra' && botChoice === 'tesoura') ||
      (userChoice === 'papel' && botChoice === 'pedra') ||
      (userChoice === 'tesoura' && botChoice === 'papel')
    ) {
      resultado = 'Você venceu';
    } else {
      resultado = 'Você perdeu';
    }

    const embed = createEmbed(
      'Pedra, Papel, Tesoura',
      `**Sua escolha:** ${userChoice}\n` +
      `**Minha escolha:** ${botChoice}\n\n` +
      `**Resultado:** ${resultado}`
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
