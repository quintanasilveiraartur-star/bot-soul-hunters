const { createEmbed, addServerFooter, makeKey } = require('../../utils/helpers');
const { xp, warnings, mutes } = require('../../utils/db');

module.exports = {
  data: {
    name: 'avaliar',
    description: 'Avalia algo ou alguém',
    options: [{
      name: 'alvo',
      description: 'O que avaliar',
      type: 3,
      required: true
    }]
  },

  async execute(interaction) {
    const alvo = interaction.options.getString('alvo');
    
    // Sistema inteligente: verifica se é menção de usuário
    let nota;
    const userMention = alvo.match(/<@!?(\d+)>/);
    
    if (userMention) {
      const userId = userMention[1];
      const key = makeKey(interaction.guildId, userId);
      
      // Pega dados do usuário
      const userData = xp.get(key) || { xp: 0, level: 0, messages: 0 };
      const userWarnings = warnings.get(key) || [];
      const userMutes = mutes.get(key);
      
      // Calcula pontuação baseada em atividade e comportamento
      let score = 5.0; // Base
      
      // Mensagens enviadas (quanto mais ativo, melhor)
      const messageBonus = Math.min(userData.messages / 1000, 3); // Até +3 pontos
      score += messageBonus;
      
      // Punições (cada warn/mute reduz a nota)
      const warningPenalty = userWarnings.length * 0.8; // -0.8 por warn
      const mutePenalty = userMutes ? 1.5 : 0; // -1.5 se tiver mute ativo
      score -= (warningPenalty + mutePenalty);
      
      // Garante que fique entre 0 e 10
      nota = Math.max(0, Math.min(10, score)).toFixed(1);
    } else {
      // Para coisas normais, nota aleatória
      nota = (Math.random() * 10).toFixed(1);
    }
    
    let comentario;
    if (nota < 2) {
      comentario = 'Terrível, precisa melhorar urgente';
    } else if (nota < 3) {
      comentario = 'Muito ruim, precisa melhorar muito';
    } else if (nota < 4) {
      comentario = 'Ruim, abaixo do esperado';
    } else if (nota < 5) {
      comentario = 'Abaixo da média';
    } else if (nota < 6) {
      comentario = 'Na média, aceitável';
    } else if (nota < 7) {
      comentario = 'Bom, acima da média';
    } else if (nota < 8) {
      comentario = 'Muito bom';
    } else if (nota < 9) {
      comentario = 'Excelente';
    } else if (nota < 9.5) {
      comentario = 'Quase perfeito';
    } else {
      comentario = 'Perfeito, impecável';
    }

    const embed = createEmbed(
      'Avaliação',
      `**Avaliando:** \`${alvo}\`\n\n` +
      '```yaml\n' +
      `Nota: ${nota}/10\n` +
      `Status: ${comentario}\n` +
      '```'
    );
    addServerFooter(embed, interaction.guild);

    await interaction.reply({ embeds: [embed] });
  }
};
