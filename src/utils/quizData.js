// Sistema de quiz com auto-atualização
const fs = require('fs');
const path = require('path');

const QUIZ_FILE = path.join(__dirname, '../../databases/quiz_cache.json');

// Quiz base (sempre disponível)
const BASE_QUIZZES = {
  geral: [
    { pergunta: 'Qual o maior planeta do sistema solar?', resposta: 'Júpiter', opcoes: ['Terra', 'Júpiter', 'Saturno', 'Marte'] },
    { pergunta: 'Quantos continentes existem?', resposta: '6', opcoes: ['5', '6', '7', '8'] },
    { pergunta: 'Qual o oceano mais profundo?', resposta: 'Pacífico', opcoes: ['Atlântico', 'Índico', 'Pacífico', 'Ártico'] },
    { pergunta: 'Qual a capital do Brasil?', resposta: 'Brasília', opcoes: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'] },
    { pergunta: 'Quantos estados tem o Brasil?', resposta: '26', opcoes: ['24', '25', '26', '27'] },
    { pergunta: 'Qual o maior país do mundo?', resposta: 'Rússia', opcoes: ['China', 'Canadá', 'Rússia', 'EUA'] },
    { pergunta: 'Qual a montanha mais alta do mundo?', resposta: 'Everest', opcoes: ['K2', 'Everest', 'Kilimanjaro', 'Aconcágua'] },
    { pergunta: 'Quantos ossos tem o corpo humano adulto?', resposta: '206', opcoes: ['198', '206', '215', '220'] },
    { pergunta: 'Qual o metal mais caro do mundo?', resposta: 'Ródio', opcoes: ['Ouro', 'Platina', 'Ródio', 'Paládio'] },
    { pergunta: 'Qual a velocidade da luz?', resposta: '300.000 km/s', opcoes: ['150.000 km/s', '300.000 km/s', '450.000 km/s', '600.000 km/s'] },
    { pergunta: 'Quem pintou a Mona Lisa?', resposta: 'Leonardo da Vinci', opcoes: ['Michelangelo', 'Leonardo da Vinci', 'Rafael', 'Donatello'] },
    { pergunta: 'Qual o rio mais longo do mundo?', resposta: 'Amazonas', opcoes: ['Nilo', 'Amazonas', 'Yangtzé', 'Mississippi'] },
    { pergunta: 'Quantos planetas tem o sistema solar?', resposta: '8', opcoes: ['7', '8', '9', '10'] },
    { pergunta: 'Qual o animal terrestre mais rápido?', resposta: 'Guepardo', opcoes: ['Leão', 'Guepardo', 'Cavalo', 'Antílope'] },
    { pergunta: 'Qual a língua mais falada do mundo?', resposta: 'Mandarim', opcoes: ['Inglês', 'Espanhol', 'Mandarim', 'Hindi'] }
  ],
  
  games: [
    { pergunta: 'Qual o jogo mais vendido de todos os tempos?', resposta: 'Minecraft', opcoes: ['GTA V', 'Minecraft', 'Tetris', 'Fortnite'] },
    { pergunta: 'Em que ano foi lançado o primeiro Pokémon?', resposta: '1996', opcoes: ['1994', '1996', '1998', '2000'] },
    { pergunta: 'Qual empresa criou o Fortnite?', resposta: 'Epic Games', opcoes: ['Riot Games', 'Epic Games', 'Valve', 'Blizzard'] },
    { pergunta: 'Qual o nome do protagonista de The Legend of Zelda?', resposta: 'Link', opcoes: ['Zelda', 'Link', 'Ganon', 'Epona'] },
    { pergunta: 'Quantos jogadores tem um time de CS:GO?', resposta: '5', opcoes: ['4', '5', '6', '7'] },
    { pergunta: 'Qual empresa criou o League of Legends?', resposta: 'Riot Games', opcoes: ['Blizzard', 'Riot Games', 'Valve', 'Epic Games'] },
    { pergunta: 'Em que ano foi lançado o primeiro GTA?', resposta: '1997', opcoes: ['1995', '1997', '1999', '2001'] },
    { pergunta: 'Qual o nome do criador do Minecraft?', resposta: 'Notch', opcoes: ['Jeb', 'Notch', 'Dinnerbone', 'Grumm'] },
    { pergunta: 'Quantas gerações de Pokémon existem?', resposta: '9', opcoes: ['7', '8', '9', '10'] },
    { pergunta: 'Qual console vendeu mais unidades?', resposta: 'PlayStation 2', opcoes: ['PlayStation 2', 'Nintendo DS', 'Game Boy', 'PlayStation 4'] },
    { pergunta: 'Qual o jogo mais jogado no Steam?', resposta: 'Counter-Strike 2', opcoes: ['Dota 2', 'Counter-Strike 2', 'PUBG', 'Apex Legends'] },
    { pergunta: 'Em que ano foi lançado o Roblox?', resposta: '2006', opcoes: ['2004', '2006', '2008', '2010'] },
    { pergunta: 'Qual empresa criou o Valorant?', resposta: 'Riot Games', opcoes: ['Valve', 'Riot Games', 'Blizzard', 'Epic Games'] },
    { pergunta: 'Quantos campeões tem o League of Legends?', resposta: 'Mais de 160', opcoes: ['100-120', '120-140', '140-160', 'Mais de 160'] },
    { pergunta: 'Qual o nome do battle royale do Apex Legends?', resposta: 'Kings Canyon', opcoes: ['Erangel', 'Kings Canyon', 'Verdansk', 'Olympus'] }
  ],
  
  futebol: [
    { pergunta: 'Quantas Copas do Mundo o Brasil ganhou?', resposta: '5', opcoes: ['3', '4', '5', '6'] },
    { pergunta: 'Qual jogador tem mais Bolas de Ouro?', resposta: 'Messi', opcoes: ['Cristiano Ronaldo', 'Messi', 'Pelé', 'Neymar'] },
    { pergunta: 'Em que país foi a primeira Copa do Mundo?', resposta: 'Uruguai', opcoes: ['Brasil', 'Argentina', 'Uruguai', 'Inglaterra'] },
    { pergunta: 'Qual time tem mais Libertadores?', resposta: 'Independiente', opcoes: ['Boca Juniors', 'River Plate', 'Independiente', 'Peñarol'] },
    { pergunta: 'Quantos jogadores tem em campo no futebol?', resposta: '22', opcoes: ['20', '22', '24', '26'] },
    { pergunta: 'Qual o maior artilheiro da história da Champions?', resposta: 'Cristiano Ronaldo', opcoes: ['Messi', 'Cristiano Ronaldo', 'Lewandowski', 'Benzema'] },
    { pergunta: 'Em que ano o Brasil ganhou sua primeira Copa?', resposta: '1958', opcoes: ['1950', '1958', '1962', '1970'] },
    { pergunta: 'Qual time brasileiro tem mais Brasileirões?', resposta: 'Palmeiras', opcoes: ['Flamengo', 'Palmeiras', 'Santos', 'Corinthians'] },
    { pergunta: 'Quantos minutos tem uma partida de futebol?', resposta: '90', opcoes: ['80', '90', '100', '120'] },
    { pergunta: 'Qual seleção tem mais Copas do Mundo?', resposta: 'Brasil', opcoes: ['Alemanha', 'Brasil', 'Itália', 'Argentina'] },
    { pergunta: 'Qual o estádio com maior capacidade do Brasil?', resposta: 'Maracanã', opcoes: ['Morumbi', 'Maracanã', 'Mineirão', 'Castelão'] },
    { pergunta: 'Quantos cartões vermelhos resultam em suspensão?', resposta: '1', opcoes: ['1', '2', '3', '4'] },
    { pergunta: 'Qual país sediou a Copa de 2014?', resposta: 'Brasil', opcoes: ['África do Sul', 'Brasil', 'Rússia', 'Catar'] },
    { pergunta: 'Qual o maior goleador da história do futebol?', resposta: 'Cristiano Ronaldo', opcoes: ['Pelé', 'Messi', 'Cristiano Ronaldo', 'Romário'] },
    { pergunta: 'Quantos times jogam a Série A do Brasileirão?', resposta: '20', opcoes: ['16', '18', '20', '22'] }
  ],

  anime: [
    { pergunta: 'Qual o anime mais longo em exibição?', resposta: 'Sazae-san', opcoes: ['One Piece', 'Naruto', 'Sazae-san', 'Detective Conan'] },
    { pergunta: 'Quem é o criador de Dragon Ball?', resposta: 'Akira Toriyama', opcoes: ['Masashi Kishimoto', 'Akira Toriyama', 'Eiichiro Oda', 'Tite Kubo'] },
    { pergunta: 'Qual o nome do protagonista de Naruto?', resposta: 'Naruto Uzumaki', opcoes: ['Sasuke Uchiha', 'Naruto Uzumaki', 'Kakashi Hatake', 'Itachi Uchiha'] },
    { pergunta: 'Quantas esferas do dragão existem?', resposta: '7', opcoes: ['5', '6', '7', '8'] },
    { pergunta: 'Qual o anime com mais episódios?', resposta: 'Sazae-san', opcoes: ['One Piece', 'Sazae-san', 'Doraemon', 'Pokémon'] },
    { pergunta: 'Quem é o Rei dos Piratas em One Piece?', resposta: 'Gol D. Roger', opcoes: ['Luffy', 'Gol D. Roger', 'Barba Branca', 'Shanks'] },
    { pergunta: 'Qual o nome do Death Note?', resposta: 'Caderno da Morte', opcoes: ['Livro Negro', 'Caderno da Morte', 'Diário Mortal', 'Nota Fatal'] },
    { pergunta: 'Quantos Hokages teve Konoha até Naruto?', resposta: '7', opcoes: ['5', '6', '7', '8'] },
    { pergunta: 'Qual o nome do protagonista de Attack on Titan?', resposta: 'Eren Yeager', opcoes: ['Levi Ackerman', 'Eren Yeager', 'Armin Arlert', 'Mikasa Ackerman'] },
    { pergunta: 'Qual estúdio produziu Demon Slayer?', resposta: 'Ufotable', opcoes: ['Bones', 'Ufotable', 'Madhouse', 'Wit Studio'] },
    { pergunta: 'Quantos Saiyajins sobreviveram?', resposta: '4', opcoes: ['2', '3', '4', '5'] },
    { pergunta: 'Qual o nome do protagonista de Death Note?', resposta: 'Light Yagami', opcoes: ['L', 'Light Yagami', 'Near', 'Mello'] },
    { pergunta: 'Em que ano foi lançado o primeiro episódio de One Piece?', resposta: '1999', opcoes: ['1997', '1999', '2001', '2003'] },
    { pergunta: 'Qual o nome do pai de Goku?', resposta: 'Bardock', opcoes: ['Raditz', 'Bardock', 'Vegeta', 'Nappa'] },
    { pergunta: 'Quantos titãs existem em Attack on Titan?', resposta: '9', opcoes: ['7', '8', '9', '10'] }
  ],

  tecnologia: [
    { pergunta: 'Quem fundou a Microsoft?', resposta: 'Bill Gates', opcoes: ['Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Elon Musk'] },
    { pergunta: 'Em que ano foi criado o Facebook?', resposta: '2004', opcoes: ['2002', '2004', '2006', '2008'] },
    { pergunta: 'Qual a linguagem de programação mais usada?', resposta: 'JavaScript', opcoes: ['Python', 'JavaScript', 'Java', 'C++'] },
    { pergunta: 'Quem criou o Linux?', resposta: 'Linus Torvalds', opcoes: ['Bill Gates', 'Steve Jobs', 'Linus Torvalds', 'Dennis Ritchie'] },
    { pergunta: 'Qual empresa criou o Android?', resposta: 'Google', opcoes: ['Apple', 'Google', 'Microsoft', 'Samsung'] },
    { pergunta: 'Em que ano foi lançado o primeiro iPhone?', resposta: '2007', opcoes: ['2005', '2007', '2009', '2011'] },
    { pergunta: 'Qual a capacidade de um DVD comum?', resposta: '4.7 GB', opcoes: ['2.5 GB', '4.7 GB', '8.5 GB', '16 GB'] },
    { pergunta: 'Quem fundou a Apple?', resposta: 'Steve Jobs', opcoes: ['Bill Gates', 'Steve Jobs', 'Steve Wozniak', 'Tim Cook'] },
    { pergunta: 'Qual o navegador mais usado do mundo?', resposta: 'Chrome', opcoes: ['Firefox', 'Chrome', 'Safari', 'Edge'] },
    { pergunta: 'Em que ano foi criado o YouTube?', resposta: '2005', opcoes: ['2003', '2005', '2007', '2009'] },
    { pergunta: 'Qual empresa criou o Windows?', resposta: 'Microsoft', opcoes: ['Apple', 'Microsoft', 'Google', 'IBM'] },
    { pergunta: 'Quantos bits tem um byte?', resposta: '8', opcoes: ['4', '8', '16', '32'] },
    { pergunta: 'Qual a resolução do 4K?', resposta: '3840x2160', opcoes: ['1920x1080', '2560x1440', '3840x2160', '7680x4320'] },
    { pergunta: 'Quem criou o Python?', resposta: 'Guido van Rossum', opcoes: ['James Gosling', 'Guido van Rossum', 'Bjarne Stroustrup', 'Dennis Ritchie'] },
    { pergunta: 'Qual o primeiro computador pessoal?', resposta: 'Altair 8800', opcoes: ['Apple I', 'Altair 8800', 'IBM PC', 'Commodore 64'] }
  ],

  historia: [
    { pergunta: 'Em que ano foi descoberto o Brasil?', resposta: '1500', opcoes: ['1492', '1500', '1510', '1520'] },
    { pergunta: 'Quem descobriu o Brasil?', resposta: 'Pedro Álvares Cabral', opcoes: ['Cristóvão Colombo', 'Pedro Álvares Cabral', 'Vasco da Gama', 'Fernão de Magalhães'] },
    { pergunta: 'Em que ano acabou a Segunda Guerra Mundial?', resposta: '1945', opcoes: ['1943', '1944', '1945', '1946'] },
    { pergunta: 'Quem foi o primeiro presidente do Brasil?', resposta: 'Deodoro da Fonseca', opcoes: ['Dom Pedro II', 'Deodoro da Fonseca', 'Floriano Peixoto', 'Getúlio Vargas'] },
    { pergunta: 'Em que ano caiu o Muro de Berlim?', resposta: '1989', opcoes: ['1985', '1987', '1989', '1991'] },
    { pergunta: 'Quantas pirâmides tem em Gizé?', resposta: '3', opcoes: ['2', '3', '4', '5'] },
    { pergunta: 'Quem foi o primeiro homem na Lua?', resposta: 'Neil Armstrong', opcoes: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'Alan Shepard'] },
    { pergunta: 'Em que ano foi proclamada a República no Brasil?', resposta: '1889', opcoes: ['1822', '1850', '1889', '1900'] },
    { pergunta: 'Quantos anos durou a ditadura militar no Brasil?', resposta: '21', opcoes: ['15', '18', '21', '25'] },
    { pergunta: 'Quem pintou o teto da Capela Sistina?', resposta: 'Michelangelo', opcoes: ['Leonardo da Vinci', 'Michelangelo', 'Rafael', 'Donatello'] },
    { pergunta: 'Em que ano começou a Primeira Guerra Mundial?', resposta: '1914', opcoes: ['1910', '1912', '1914', '1916'] },
    { pergunta: 'Quem foi o líder da Revolução Francesa?', resposta: 'Robespierre', opcoes: ['Napoleão', 'Robespierre', 'Luís XVI', 'Danton'] },
    { pergunta: 'Em que ano foi assinada a Lei Áurea?', resposta: '1888', opcoes: ['1850', '1871', '1888', '1889'] },
    { pergunta: 'Quantos anos durou o Império Romano?', resposta: 'Mais de 1000', opcoes: ['500', '750', 'Mais de 1000', '1500'] },
    { pergunta: 'Quem foi Cleópatra?', resposta: 'Rainha do Egito', opcoes: ['Rainha da Grécia', 'Rainha do Egito', 'Imperatriz Romana', 'Rainha da Pérsia'] }
  ]
};

// Carrega quiz cache
function loadQuizCache() {
  try {
    if (fs.existsSync(QUIZ_FILE)) {
      const data = fs.readFileSync(QUIZ_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erro ao carregar quiz cache:', err);
  }
  return { ...BASE_QUIZZES, lastUpdate: Date.now() };
}

// Salva quiz cache
function saveQuizCache(data) {
  try {
    const dir = path.dirname(QUIZ_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(QUIZ_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Erro ao salvar quiz cache:', err);
  }
}

// Gera novos quizzes (simulação de busca)
function generateNewQuizzes() {
  const newQuizzes = { ...BASE_QUIZZES };
  
  // Adiciona variações aos quizzes existentes
  // Em produção, aqui você faria uma chamada a uma API de quizzes
  
  newQuizzes.lastUpdate = Date.now();
  return newQuizzes;
}

// Atualiza quizzes se necessário
function updateQuizzesIfNeeded() {
  const cache = loadQuizCache();
  const TEN_MINUTES = 10 * 60 * 1000;
  
  if (!cache.lastUpdate || (Date.now() - cache.lastUpdate) > TEN_MINUTES) {
    console.log('Atualizando quizzes...');
    const newQuizzes = generateNewQuizzes();
    saveQuizCache(newQuizzes);
    return newQuizzes;
  }
  
  return cache;
}

// Pega quiz aleatório de uma categoria
function getRandomQuiz(categoria) {
  const quizzes = updateQuizzesIfNeeded();
  const categoriaQuizzes = quizzes[categoria] || quizzes.geral;
  return categoriaQuizzes[Math.floor(Math.random() * categoriaQuizzes.length)];
}

// Pega todas as categorias disponíveis
function getCategories() {
  const quizzes = updateQuizzesIfNeeded();
  return Object.keys(quizzes).filter(k => k !== 'lastUpdate');
}

module.exports = {
  getRandomQuiz,
  getCategories,
  updateQuizzesIfNeeded,
  BASE_QUIZZES
};
