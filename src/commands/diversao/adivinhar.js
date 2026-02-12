const { createEmbed, addServerFooter, random } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'adivinhar',
    description: 'Tenta adivinhar o número entre 1 e 100',
    options: [{
      name: 'numero',
      description: 'Seu palpite',
      type: 4,
      required: true
    }]
  },

  async execute(interaction) {
    const palpite = interaction.options.getInteger('numero');
    const numeroSecreto = random(1, 100);
    const diferenca = Math.abs(palpite - numeroSecreto);
    
    let dica;
    if (palpite === numeroSecreto) {
      dica = 'Acertou em cheio!';
    } else if (diferenca <= 5) {
      dica = 'Muito quente! Quase lá';
    } else if (diferenca <= 15) {
      dica = 'Quente! Tá perto';
    } else if (diferenca <= 30) {
      dica = 'Morno! Pode melhorar';
    } else {
      dica = 'Frio! Tá longe';
    }

    const embed = createEmbed(
      'Adivinhe o Número',
      `**Seu palpite:** ${palpite}\n` +
      `**Número secreto:** ${numeroSecreto}\n` +
      `**Diferença:** ${diferenca}\n\n` +
      `${dica}`
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
