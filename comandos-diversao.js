const { EmbedBuilder } = require('discord.js');

// Comando: Pedra, Papel, Tesoura
const ppt = {
  data: {
    name: 'ppt',
    description: 'Jogar pedra, papel ou tesoura',
    options: [{
      name: 'escolha',
      description: 'Sua escolha',
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
    const escolhas = ['pedra', 'papel', 'tesoura'];
    const userChoice = interaction.options.getString('escolha');
    const botChoice = escolhas[Math.floor(Math.random() * escolhas.length)];
    
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
    
    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle('**# Pedra, Papel, Tesoura**')
      .setDescription(
        `> **Sua escolha:** ${userChoice}\n` +
        `> **Minha escolha:** ${botChoice}\n\n` +
        `> **Resultado:** ${resultado}`
      );
    
    await interaction.reply({ embeds: [embed] });
  }
};

// Comando: Adivinhar Número
const adivinhar = {
  data: {
    name: 'adivinhar',
    description: 'Adivinhe o número entre 1 e 100',
    options: [{
      name: 'numero',
      description: 'Seu palpite',
      type: 4,
      required: true
    }]
  },
  async execute(interaction) {
    const numero = interaction.options.getInteger('numero');
    const numeroSecreto = Math.floor(Math.random() * 100) + 1;
    
    let resultado;
    const diferenca = Math.abs(numero - numeroSecreto);
    
    if (numero === numeroSecreto) {
      resultado = 'Parabéns! Você acertou';
    } else if (diferenca <= 5) {
      resultado = 'Muito quente! Quase lá';
    } else if (diferenca <= 15) {
      resultado = 'Quente! Está perto';
    } else if (diferenca <= 30) {
      resultado = 'Morno! Pode melhorar';
    } else {
      resultado = 'Frio! Está longe';
    }
    
    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle('**# Adivinhe o Número**')
      .setDescription(
        `> **Seu palpite:** ${numero}\n` +
        `> **Número secreto:** ${numeroSecreto}\n` +
        `> **Diferença:** ${diferenca}\n\n` +
        `> **Resultado:** ${resultado}`
      );
    
    await interaction.reply({ embeds: [embed] });
  }
};

// Comando: Shipar
const shipar = {
  data: {
    name: 'shipar',
    description: 'Shipar duas pessoas',
    options: [
      {
        name: 'pessoa1',
        description: 'Primeira pessoa',
        type: 6,
        required: true
      },
      {
        name: 'pessoa2',
        description: 'Segunda pessoa',
        type: 6,
        required: true
      }
    ]
  },
  async execute(interaction) {
    const pessoa1 = interaction.options.getUser('pessoa1');
    const pessoa2 = interaction.options.getUser('pessoa2');
    
    const porcentagem = Math.floor(Math.random() * 101);
    
    let mensagem;
    if (porcentagem < 20) {
      mensagem = 'Nem tenta, não vai rolar';
    } else if (porcentagem < 40) {
      mensagem = 'Chances baixas, mas quem sabe';
    } else if (porcentagem < 60) {
      mensagem = 'Pode ser, tem potencial';
    } else if (porcentagem < 80) {
      mensagem = 'Combinação perfeita';
    } else {
      mensagem = 'Casamento confirmado';
    }
    
    const barraCheia = Math.floor(porcentagem / 10);
    const barraVazia = 10 - barraCheia;
    const barra = '█'.repeat(barraCheia) + '░'.repeat(barraVazia);
    
    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle('# Shipador')
      .setDescription(
        `> **${pessoa1.username}** + **${pessoa2.username}**\n\n` +
        '```yaml\n' +
        `Compatibilidade: ${porcentagem}%\n` +
        '```\n' +
        `> ${barra}\n\n` +
        `> **Resultado:** \`${mensagem}\``
      )
      .setThumbnail(pessoa1.displayAvatarURL({ dynamic: true }))
      .setFooter({ 
        text: `Shipado por ${interaction.user.tag}`, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};

// Comando: Avaliar
const avaliar = {
  data: {
    name: 'avaliar',
    description: 'Avaliar algo ou alguém',
    options: [{
      name: 'alvo',
      description: 'O que avaliar',
      type: 3,
      required: true
    }]
  },
  async execute(interaction) {
    const alvo = interaction.options.getString('alvo');
    const nota = (Math.random() * 10).toFixed(1);
    
    let comentario;
    if (nota < 3) {
      comentario = 'Precisa melhorar muito';
    } else if (nota < 5) {
      comentario = 'Abaixo da média';
    } else if (nota < 7) {
      comentario = 'Na média, aceitável';
    } else if (nota < 9) {
      comentario = 'Muito bom';
    } else {
      comentario = 'Perfeito, impecável';
    }
    
    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle('# Avaliação')
      .setDescription(
        `> **Avaliando:** \`${alvo}\`\n\n` +
        '```yaml\n' +
        `Nota: ${nota}/10\n` +
        `Status: ${comentario}\n` +
        '```'
      )
      .setFooter({ 
        text: `Avaliado por ${interaction.user.tag}`, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};

// Comando: Porcentagem
const porcentagem = {
  data: {
    name: 'porcentagem',
    description: 'Quanto % você é algo',
    options: [{
      name: 'caracteristica',
      description: 'O que medir',
      type: 3,
      required: true,
      choices: [
        { name: 'Gamer', value: 'gamer' },
        { name: 'Sortudo', value: 'sortudo' },
        { name: 'Inteligente', value: 'inteligente' },
        { name: 'Engraçado', value: 'engraçado' },
        { name: 'Bonito', value: 'bonito' },
        { name: 'Carismático', value: 'carismatico' },
        { name: 'Preguiçoso', value: 'preguicoso' },
        { name: 'Corajoso', value: 'corajoso' }
      ]
    }]
  },
  async execute(interaction) {
    const caracteristica = interaction.options.getString('caracteristica');
    const valor = Math.floor(Math.random() * 101);
    
    const barraCheia = Math.floor(valor / 10);
    const barraVazia = 10 - barraCheia;
    const barra = '█'.repeat(barraCheia) + '░'.repeat(barraVazia);
    
    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle('# Medidor de Porcentagem')
      .setDescription(
        `> **${interaction.user.username}** é **\`${valor}%\`** ${caracteristica}\n\n` +
        `> ${barra}\n\n` +
        '```diff\n' +
        `${valor >= 70 ? '+ Nível Alto' : valor >= 40 ? '~ Nível Médio' : '- Nível Baixo'}\n` +
        '```'
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ 
        text: `Medido por ${interaction.user.tag}`, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};

// Comando: Frases Aleatórias
const frase = {
  data: {
    name: 'frase',
    description: 'Receber uma frase aleatória',
    options: [{
      name: 'tipo',
      description: 'Tipo de frase',
      type: 3,
      required: false,
      choices: [
        { name: 'Motivacional', value: 'motivacional' },
        { name: 'Engraçada', value: 'engracada' },
        { name: 'Reflexão', value: 'reflexao' }
      ]
    }]
  },
  async execute(interaction) {
    const tipo = interaction.options.getString('tipo') || 'motivacional';
    
    const frases = {
      motivacional: [
        'O sucesso é a soma de pequenos esforços repetidos dia após dia',
        'Acredite em você mesmo e tudo será possível',
        'Não espere por oportunidades, crie-as',
        'O único lugar onde sucesso vem antes de trabalho é no dicionário',
        'Grandes coisas nunca vêm de zonas de conforto'
      ],
      engracada: [
        'Eu não sou preguiçoso, estou em modo economia de energia',
        'Minha cama é um lugar mágico onde eu de repente lembro de tudo que tinha que fazer',
        'Eu não erro, eu apenas encontro 10 mil formas que não funcionam',
        'Procrastinar é como um cartão de crédito: muito divertido até chegar a conta',
        'Eu não sou anti-social, sou seletivamente social'
      ],
      reflexao: [
        'A vida é 10% o que acontece com você e 90% como você reage',
        'Não é sobre ter tempo, é sobre fazer tempo',
        'O que você pensa, você se torna',
        'A mudança é a única constante na vida',
        'Seja a mudança que você quer ver no mundo'
      ]
    };
    
    const fraseEscolhida = frases[tipo][Math.floor(Math.random() * frases[tipo].length)];
    
    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle(`# Frase ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`)
      .setDescription(
        '```\n' +
        `${fraseEscolhida}\n` +
        '```'
      )
      .setFooter({ 
        text: `Solicitado por ${interaction.user.tag}`, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};

// Comando: Apelido
const apelido = {
  data: {
    name: 'apelido',
    description: 'Gerar um apelido aleatório',
    options: [{
      name: 'usuario',
      description: 'Usuário para gerar apelido',
      type: 6,
      required: false
    }]
  },
  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    
    const prefixos = ['Super', 'Mega', 'Ultra', 'Master', 'Lord', 'King', 'Queen', 'Dark', 'Shadow', 'Fire'];
    const sufixos = ['Gamer', 'Pro', 'Legend', 'Destroyer', 'Hunter', 'Warrior', 'Ninja', 'Dragon', 'Phoenix', 'Wolf'];
    
    const prefixo = prefixos[Math.floor(Math.random() * prefixos.length)];
    const sufixo = sufixos[Math.floor(Math.random() * sufixos.length)];
    const numero = Math.floor(Math.random() * 999);
    
    const apelidoGerado = `${prefixo}${sufixo}${numero}`;
    
    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle('# Gerador de Apelidos')
      .setDescription(
        `> **Usuário:** \`${user.username}\`\n\n` +
        '```yaml\n' +
        `Novo Apelido: ${apelidoGerado}\n` +
        '```\n' +
        '> Use este apelido com **orgulho**!'
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ 
        text: `Gerado por ${interaction.user.tag}`, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};

// Comando: Quiz
const quiz = {
  data: {
    name: 'quiz',
    description: 'Responder uma pergunta de quiz',
    options: [{
      name: 'categoria',
      description: 'Categoria do quiz',
      type: 3,
      required: true,
      choices: [
        { name: 'Geral', value: 'geral' },
        { name: 'Games', value: 'games' },
        { name: 'Futebol', value: 'futebol' }
      ]
    }]
  },
  async execute(interaction) {
    const categoria = interaction.options.getString('categoria');
    
    const quizzes = {
      geral: [
        { pergunta: 'Qual o maior planeta do sistema solar?', resposta: 'Júpiter', opcoes: ['Terra', 'Júpiter', 'Saturno', 'Marte'] },
        { pergunta: 'Quantos continentes existem?', resposta: '6', opcoes: ['5', '6', '7', '8'] },
        { pergunta: 'Qual o oceano mais profundo?', resposta: 'Pacífico', opcoes: ['Atlântico', 'Índico', 'Pacífico', 'Ártico'] }
      ],
      games: [
        { pergunta: 'Qual o jogo mais vendido de todos os tempos?', resposta: 'Minecraft', opcoes: ['GTA V', 'Minecraft', 'Tetris', 'Fortnite'] },
        { pergunta: 'Em que ano foi lançado o primeiro Pokémon?', resposta: '1996', opcoes: ['1994', '1996', '1998', '2000'] },
        { pergunta: 'Qual empresa criou o Fortnite?', resposta: 'Epic Games', opcoes: ['Riot Games', 'Epic Games', 'Valve', 'Blizzard'] }
      ],
      futebol: [
        { pergunta: 'Quantas Copas do Mundo o Brasil ganhou?', resposta: '5', opcoes: ['3', '4', '5', '6'] },
        { pergunta: 'Qual jogador tem mais Bolas de Ouro?', resposta: 'Messi', opcoes: ['Cristiano Ronaldo', 'Messi', 'Pelé', 'Neymar'] },
        { pergunta: 'Em que país foi a primeira Copa do Mundo?', resposta: 'Uruguai', opcoes: ['Brasil', 'Argentina', 'Uruguai', 'Inglaterra'] }
      ]
    };
    
    const perguntasCategoria = quizzes[categoria];
    const quiz = perguntasCategoria[Math.floor(Math.random() * perguntasCategoria.length)];
    
    const opcoesEmbaralhadas = quiz.opcoes.sort(() => Math.random() - 0.5);
    const opcoesTexto = opcoesEmbaralhadas.map((op, i) => `> **${i + 1}.** ${op}`).join('\n');
    
    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle(`# Quiz - ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`)
      .setDescription(
        `> **Pergunta:**\n> \`${quiz.pergunta}\`\n\n` +
        '**Opções:**\n' +
        `${opcoesTexto}\n\n` +
        `> **Resposta:** ||${quiz.resposta}||`
      )
      .setFooter({ 
        text: `Quiz solicitado por ${interaction.user.tag}`, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};

module.exports = { ppt, adivinhar, shipar, avaliar, porcentagem, frase, apelido, quiz };


