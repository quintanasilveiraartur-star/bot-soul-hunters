const { createEmbed, addServerFooter, randomChoice } = require('../../utils/helpers');

const RESPOSTAS = [
  // Positivas (20)
  'Sim',
  'Com certeza',
  'Sem dúvida',
  'Óbvio que sim',
  'Pode contar com isso',
  'É certo',
  'Definitivamente sim',
  'Tá com cara boa sim',
  'Provavelmente sim',
  'Tudo indica que sim',
  'As chances são boas',
  'Sim, definitivamente',
  'Pode apostar nisso',
  'Com toda certeza',
  'É bem provável',
  'Acredito que sim',
  'Parece que sim',
  'Tá na cara que sim',
  'Claro que sim',
  'Obviamente',
  
  // Negativas (25)
  'Não',
  'Nem pensar',
  'De jeito nenhum',
  'Não conta com isso',
  'Minha resposta é não',
  'Muito duvidoso',
  'Não tá com cara boa não',
  'Minhas fontes dizem não',
  'Provavelmente não',
  'Acho que não',
  'Melhor não',
  'Nem tenta',
  'Esquece',
  'Não vai rolar',
  'Impossível',
  'Jamais',
  'Negativo',
  'Não mesmo',
  'Nem a pau',
  'Tá louco?',
  'Nem em um milhão de anos',
  'Desiste',
  'Não force a barra',
  'Péssima ideia',
  'Absolutamente não',
  
  // Neutras/Incertas (15)
  'Talvez',
  'Não sei agora',
  'Pergunta de novo mais tarde',
  'Melhor não te falar',
  'Não posso prever agora',
  'Concentre-se e pergunte novamente',
  'Não dá pra saber',
  'Difícil dizer',
  'Incerto',
  'Pode ser',
  'Quem sabe',
  'Vai saber',
  'Depende',
  'Não tenho certeza',
  'Complicado responder',
  'Pergunta difícil',
  'Hmm... talvez',
  'Não sei te dizer',
  'Tá nebuloso',
  'Resposta confusa'
];

module.exports = {
  data: {
    name: '8ball',
    description: 'Pergunta pra bola mágica',
    options: [{
      name: 'pergunta',
      description: 'O que você quer saber?',
      type: 3,
      required: true
    }]
  },

  async execute(interaction) {
    const pergunta = interaction.options.getString('pergunta');
    const resposta = randomChoice(RESPOSTAS);

    const embed = createEmbed(
      'Bola Mágica',
      `**Pergunta:** ${pergunta}\n\n` +
      `**Resposta:** ${resposta}`
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
