// Sistema de conteúdo dinâmico para diversos comandos
const fs = require('fs');
const path = require('path');

const CONTENT_FILE = path.join(__dirname, '../../databases/content_cache.json');

// Conteúdo base expandido
const BASE_CONTENT = {
  frases: {
    motivacional: [
      'O sucesso é a soma de pequenos esforços repetidos dia após dia',
      'Acredite em você mesmo e tudo será possível',
      'Não espere por oportunidades, crie-as',
      'O único lugar onde sucesso vem antes de trabalho é no dicionário',
      'Grandes coisas nunca vêm de zonas de conforto',
      'A persistência é o caminho do êxito',
      'Você é mais forte do que pensa',
      'Cada dia é uma nova chance de recomeçar',
      'O fracasso é apenas uma oportunidade para começar de novo',
      'Sonhe grande, comece pequeno, mas acima de tudo, comece',
      'A disciplina é a ponte entre metas e conquistas',
      'Não conte os dias, faça os dias contarem',
      'O impossível é apenas uma opinião',
      'Sua única limitação é você mesmo',
      'Faça hoje o que outros não querem, tenha amanhã o que outros não têm',
      'A diferença entre o possível e o impossível está na determinação',
      'Não desista, o começo é sempre o mais difícil',
      'Você não precisa ser grande para começar, mas precisa começar para ser grande',
      'O sucesso não é final, o fracasso não é fatal',
      'Acredite que você pode e você já está no meio do caminho'
    ],
    engracada: [
      'Eu não sou preguiçoso, estou em modo economia de energia',
      'Minha cama é um lugar mágico onde eu de repente lembro de tudo que tinha que fazer',
      'Eu não erro, eu apenas encontro 10 mil formas que não funcionam',
      'Procrastinar é como um cartão de crédito: muito divertido até chegar a conta',
      'Eu não sou anti-social, sou seletivamente social',
      'Café: porque ódio não é uma emoção aceitável no trabalho',
      'Eu não estou atrasado, todo mundo está adiantado',
      'Meu nível de sarcasmo depende do seu nível de estupidez',
      'Eu não ronco, eu sonho que sou uma moto',
      'Dieta: comer tudo que você quer e torcer para que seja saudável',
      'Eu não sou baixo, sou economicamente viável',
      'Minha paciência tem limite, mas minha preguiça não',
      'Eu não sou desorganizado, tenho um sistema caótico',
      'Dormir é minha droga, minha cama é o dealer e meu despertador é a polícia',
      'Eu não sou viciado em internet, posso parar quando quiser... depois desse vídeo',
      'Meu cérebro tem muitas abas abertas',
      'Eu não sou teimoso, meus fatos são diferentes dos seus',
      'Exercício? Eu achei que você disse extra fries',
      'Eu não sou gordo, sou fofo e abraçável',
      'Minha vida é 50% "o que eu vou comer" e 50% "estou com fome"'
    ],
    reflexao: [
      'A vida é 10% o que acontece com você e 90% como você reage',
      'Não é sobre ter tempo, é sobre fazer tempo',
      'O que você pensa, você se torna',
      'A mudança é a única constante na vida',
      'Seja a mudança que você quer ver no mundo',
      'O silêncio é a resposta mais poderosa',
      'Quem olha para fora, sonha. Quem olha para dentro, desperta',
      'A felicidade não é um destino, é uma jornada',
      'Você não pode controlar o vento, mas pode ajustar as velas',
      'O passado não define você, suas ações presentes sim',
      'A gratidão transforma o que temos em suficiente',
      'Não julgue cada dia pela colheita que você colhe, mas pelas sementes que planta',
      'A vida começa onde sua zona de conforto termina',
      'Você é o autor da sua própria história',
      'O maior risco é não correr risco algum',
      'A simplicidade é o último grau de sofisticação',
      'Não espere por momentos perfeitos, pegue momentos comuns e os torne perfeitos',
      'A vida é curta demais para ser pequena',
      'Você não pode voltar e mudar o início, mas pode começar onde está e mudar o final',
      'O que você faz hoje pode melhorar todos os seus amanhãs'
    ]
  },

  palavrasMimica: [
    // Animais
    'Cachorro', 'Gato', 'Elefante', 'Macaco', 'Pinguim', 'Girafa', 'Leão', 'Tigre',
    'Urso', 'Coelho', 'Tartaruga', 'Peixe', 'Tubarão', 'Golfinho', 'Baleia',
    'Cobra', 'Jacaré', 'Papagaio', 'Águia', 'Coruja', 'Avestruz', 'Flamingo',
    
    // Ações
    'Nadando', 'Dançando', 'Correndo', 'Pulando', 'Dormindo', 'Comendo',
    'Bebendo', 'Cantando', 'Gritando', 'Chorando', 'Rindo', 'Pensando',
    'Escrevendo', 'Lendo', 'Dirigindo', 'Voando', 'Pescando', 'Cozinhando',
    
    // Comidas
    'Pizza', 'Hamburguer', 'Sorvete', 'Café', 'Refrigerante', 'Sushi',
    'Macarrão', 'Arroz', 'Feijão', 'Bolo', 'Chocolate', 'Pipoca',
    'Hot Dog', 'Taco', 'Lasanha', 'Salada', 'Frango', 'Peixe',
    
    // Objetos
    'Carro', 'Avião', 'Bicicleta', 'Trem', 'Barco', 'Helicóptero',
    'Telefone', 'Computador', 'Televisão', 'Relógio', 'Óculos', 'Guarda-chuva',
    'Violão', 'Piano', 'Bateria', 'Bola', 'Livro', 'Cadeira',
    
    // Emoções
    'Feliz', 'Triste', 'Bravo', 'Assustado', 'Surpreso', 'Cansado',
    'Animado', 'Entediado', 'Confuso', 'Apaixonado', 'Nervoso', 'Calmo',
    
    // Profissões
    'Médico', 'Professor', 'Bombeiro', 'Policial', 'Chef', 'Cantor',
    'Ator', 'Jogador', 'Programador', 'Artista', 'Dentista', 'Piloto',
    
    // Esportes
    'Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Natação', 'Boxe',
    'Karatê', 'Surf', 'Skate', 'Ciclismo', 'Corrida', 'Ginástica'
  ],

  apelidos: {
    prefixos: [
      'Super', 'Mega', 'Ultra', 'Master', 'Lord', 'King', 'Queen', 'Dark',
      'Shadow', 'Fire', 'Ice', 'Thunder', 'Storm', 'Night', 'Light', 'Blood',
      'Death', 'Soul', 'Ghost', 'Demon', 'Angel', 'Dragon', 'Phoenix', 'Wolf',
      'Tiger', 'Lion', 'Eagle', 'Hawk', 'Viper', 'Cobra', 'Cyber', 'Neon',
      'Toxic', 'Savage', 'Wild', 'Crazy', 'Mad', 'Epic', 'Legendary', 'Mystic'
    ],
    sufixos: [
      'Gamer', 'Pro', 'Legend', 'Destroyer', 'Hunter', 'Warrior', 'Ninja',
      'Dragon', 'Phoenix', 'Wolf', 'Slayer', 'Killer', 'Master', 'Lord',
      'King', 'Emperor', 'God', 'Demon', 'Angel', 'Beast', 'Monster', 'Hero',
      'Villain', 'Assassin', 'Sniper', 'Soldier', 'Knight', 'Samurai', 'Wizard',
      'Mage', 'Sorcerer', 'Reaper', 'Shadow', 'Ghost', 'Phantom', 'Spirit',
      'Soul', 'Blade', 'Sword', 'Axe', 'Hammer', 'Storm', 'Thunder', 'Lightning'
    ]
  },

  trabalhos: [
    { nome: 'Youtuber', min: 100, max: 500, emoji: '📹' },
    { nome: 'Programador', min: 200, max: 600, emoji: '💻' },
    { nome: 'Designer', min: 150, max: 450, emoji: '🎨' },
    { nome: 'Streamer', min: 100, max: 700, emoji: '🎮' },
    { nome: 'Gamer Profissional', min: 300, max: 800, emoji: '🎯' },
    { nome: 'Entregador', min: 50, max: 200, emoji: '🏍️' },
    { nome: 'Chef de Cozinha', min: 180, max: 550, emoji: '👨‍🍳' },
    { nome: 'Músico', min: 120, max: 480, emoji: '🎵' },
    { nome: 'Fotógrafo', min: 140, max: 520, emoji: '📸' },
    { nome: 'Personal Trainer', min: 160, max: 540, emoji: '💪' },
    { nome: 'Barista', min: 90, max: 350, emoji: '☕' },
    { nome: 'Motorista de Uber', min: 110, max: 420, emoji: '🚗' },
    { nome: 'Vendedor', min: 130, max: 490, emoji: '💼' },
    { nome: 'Mecânico', min: 170, max: 560, emoji: '🔧' },
    { nome: 'Eletricista', min: 190, max: 580, emoji: '⚡' },
    { nome: 'Encanador', min: 180, max: 570, emoji: '🔨' },
    { nome: 'Jardineiro', min: 100, max: 380, emoji: '🌱' },
    { nome: 'Pintor', min: 120, max: 440, emoji: '🎨' },
    { nome: 'Segurança', min: 150, max: 500, emoji: '🛡️' },
    { nome: 'Recepcionista', min: 110, max: 410, emoji: '📋' },
    { nome: 'Garçom', min: 95, max: 370, emoji: '🍽️' },
    { nome: 'Bartender', min: 130, max: 470, emoji: '🍹' },
    { nome: 'DJ', min: 200, max: 650, emoji: '🎧' },
    { nome: 'Tatuador', min: 220, max: 680, emoji: '🎨' },
    { nome: 'Barbeiro', min: 140, max: 510, emoji: '✂️' }
  ],

  lojaItens: [
    { 
      id: 'vip_badge',
      name: 'Crachá VIP', 
      price: 5000,
      description: 'Mostre que você é especial com uma estrela no perfil',
      emoji: '⭐'
    },
    { 
      id: 'anti_theft',
      name: 'Proteção Anti-Roubo', 
      price: 10000,
      description: 'Protege contra roubos por 7 dias',
      duration: 7 * 24 * 60 * 60 * 1000,
      emoji: '🛡️'
    },
    { 
      id: 'xp_boost',
      name: 'Multiplicador 2x XP', 
      price: 12000,
      description: 'Ganhe XP em dobro por 3 dias',
      duration: 3 * 24 * 60 * 60 * 1000,
      emoji: '⚡'
    },
    { 
      id: 'custom_color',
      name: 'Cor Personalizada', 
      price: 2000,
      description: 'Destaque-se no servidor',
      emoji: '🎨'
    },
    { 
      id: 'coin_boost',
      name: 'Multiplicador 1.5x Coins', 
      price: 3500,
      description: 'Ganhe 50% mais coins por 10 dias',
      duration: 10 * 24 * 60 * 60 * 1000,
      emoji: '💰'
    },
    { 
      id: 'lucky_charm',
      name: 'Amuleto da Sorte', 
      price: 50000,
      description: 'Aumenta chances em apostas e roubos por 2 horas',
      duration: 2 * 60 * 60 * 1000,
      emoji: '🍀'
    },
    { 
      id: 'name_glow',
      name: 'Nome Brilhante', 
      price: 6000,
      description: 'Seu nome aparece com efeito especial (permanente)',
      emoji: '✨'
    },
    { 
      id: 'custom_title',
      name: 'Título Personalizado', 
      price: 7000,
      description: 'Crie seu próprio título único (permanente)',
      emoji: '👑'
    }
  ]
};

// Carrega content cache
function loadContentCache() {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const data = fs.readFileSync(CONTENT_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erro ao carregar content cache:', err);
  }
  return { ...BASE_CONTENT, lastUpdate: Date.now() };
}

// Salva content cache
function saveContentCache(data) {
  try {
    const dir = path.dirname(CONTENT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Erro ao salvar content cache:', err);
  }
}

// Atualiza conteúdo se necessário
function updateContentIfNeeded() {
  const cache = loadContentCache();
  const TEN_MINUTES = 10 * 60 * 1000;
  
  if (!cache.lastUpdate || (Date.now() - cache.lastUpdate) > TEN_MINUTES) {
    console.log('Atualizando conteúdo dinâmico...');
    const newContent = { ...BASE_CONTENT, lastUpdate: Date.now() };
    saveContentCache(newContent);
    return newContent;
  }
  
  return cache;
}

// Funções de acesso
function getFrases(tipo) {
  const content = updateContentIfNeeded();
  return content.frases[tipo] || content.frases.motivacional;
}

function getPalavraMimica() {
  const content = updateContentIfNeeded();
  const palavras = content.palavrasMimica;
  return palavras[Math.floor(Math.random() * palavras.length)];
}

function getApelido() {
  const content = updateContentIfNeeded();
  const prefixo = content.apelidos.prefixos[Math.floor(Math.random() * content.apelidos.prefixos.length)];
  const sufixo = content.apelidos.sufixos[Math.floor(Math.random() * content.apelidos.sufixos.length)];
  const numero = Math.floor(Math.random() * 999);
  return `${prefixo}${sufixo}${numero}`;
}

function getTrabalho() {
  const content = updateContentIfNeeded();
  const trabalhos = content.trabalhos;
  return trabalhos[Math.floor(Math.random() * trabalhos.length)];
}

function getLojaItens() {
  const content = updateContentIfNeeded();
  return content.lojaItens;
}

module.exports = {
  getFrases,
  getPalavraMimica,
  getApelido,
  getTrabalho,
  getLojaItens,
  updateContentIfNeeded,
  BASE_CONTENT
};
