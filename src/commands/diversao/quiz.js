const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, addServerFooter } = require('../../utils/helpers');
const { getRandomQuiz, getCategories } = require('../../utils/quizData');

// Armazena quizzes ativos
const activeQuizzes = new Map();

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

    // Cria botões para as opções
    const buttons = opcoesEmbaralhadas.map((opcao, i) => 
      new ButtonBuilder()
        .setCustomId(`quiz_${interaction.user.id}_${i}`)
        .setLabel(`${i + 1}`)
        .setStyle(ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder().addComponents(buttons);

    const embed = createEmbed(
      `Quiz - ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`,
      `**Pergunta:**\n\`${quiz.pergunta}\`\n\n` +
      '**Opções:**\n' +
      `${opcoesTexto}\n\n` +
      '> Clique no botão com o número da resposta correta!'
    );
    addServerFooter(embed, interaction.guild);

    // Armazena o quiz ativo
    activeQuizzes.set(interaction.user.id, {
      resposta: quiz.resposta,
      opcoes: opcoesEmbaralhadas,
      categoria: categoria
    });

    // Remove após 60 segundos
    setTimeout(() => {
      activeQuizzes.delete(interaction.user.id);
    }, 60000);

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};

// Exporta o Map para uso no buttonHandler
module.exports.activeQuizzes = activeQuizzes;
