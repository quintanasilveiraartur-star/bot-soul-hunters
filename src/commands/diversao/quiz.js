const { createEmbed, addServerFooter } = require('../../utils/helpers');
const { getRandomQuiz, getCategories } = require('../../utils/quizData');

module.exports = {
  data: {
    name: 'quiz',
    description: 'Responde uma pergunta de quiz (atualizado a cada 10 min)',
    options: [{
      name: 'categoria',
      description: 'Categoria do quiz',
      type: 3,
      required: true,
      choices: [
        { name: 'Geral', value: 'geral' },
        { name: 'Games', value: 'games' },
        { name: 'Futebol', value: 'futebol' },
        { name: 'Anime', value: 'anime' },
        { name: 'Tecnologia', value: 'tecnologia' },
        { name: 'História', value: 'historia' }
      ]
    }]
  },

  async execute(interaction) {
    const categoria = interaction.options.getString('categoria');
    const quiz = getRandomQuiz(categoria);
    
    const opcoesEmbaralhadas = [...quiz.opcoes].sort(() => Math.random() - 0.5);
    const opcoesTexto = opcoesEmbaralhadas.map((op, i) => `**${i + 1}.** ${op}`).join('\n');

    const embed = createEmbed(
      `Quiz - ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`,
      `**Pergunta:**\n\`${quiz.pergunta}\`\n\n` +
      '**Opções:**\n' +
      `${opcoesTexto}\n\n` +
      `**Resposta:** ||${quiz.resposta}||`
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
