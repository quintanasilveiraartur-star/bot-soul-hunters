const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, addServerFooter, replyError } = require('../../utils/helpers');

const games = new Map();

function createBoard() {
  return [
    ['⬜', '⬜', '⬜'],
    ['⬜', '⬜', '⬜'],
    ['⬜', '⬜', '⬜']
  ];
}

function checkWinner(board) {
  // Linhas
  for (let i = 0; i < 3; i++) {
    if (board[i][0] !== '⬜' && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
      return board[i][0];
    }
  }

  // Colunas
  for (let i = 0; i < 3; i++) {
    if (board[0][i] !== '⬜' && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
      return board[0][i];
    }
  }

  // Diagonais
  if (board[0][0] !== '⬜' && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    return board[0][0];
  }
  if (board[0][2] !== '⬜' && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    return board[0][2];
  }

  // Empate
  if (board.every(row => row.every(cell => cell !== '⬜'))) {
    return 'draw';
  }

  return null;
}

function createButtons(board, gameId, disabled = false) {
  const rows = [];
  for (let i = 0; i < 3; i++) {
    const row = new ActionRowBuilder();
    for (let j = 0; j < 3; j++) {
      const cell = board[i][j];
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ttt_${gameId}_${i}_${j}`)
          .setLabel(cell === '⬜' ? '　' : cell)
          .setStyle(cell === '❌' ? ButtonStyle.Danger : cell === '⭕' ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(disabled || cell !== '⬜')
      );
    }
    rows.push(row);
  }
  return rows;
}

module.exports = {
  data: {
    name: 'tictactoe',
    description: 'Joga jogo da velha com alguém',
    options: [{
      name: 'oponente',
      description: 'Quem você quer desafiar',
      type: 6,
      required: true
    }]
  },

  async execute(interaction) {
    const opponent = interaction.options.getUser('oponente');

    if (opponent.id === interaction.user.id) {
      return replyError(interaction, 'Você não pode jogar contra si mesmo');
    }

    if (opponent.bot) {
      return replyError(interaction, 'Você não pode jogar contra bots');
    }

    const gameId = `${interaction.user.id}_${opponent.id}_${Date.now()}`;
    const board = createBoard();

    const game = {
      board,
      player1: interaction.user.id,
      player2: opponent.id,
      currentPlayer: interaction.user.id,
      symbol: { [interaction.user.id]: '❌', [opponent.id]: '⭕' }
    };

    games.set(gameId, game);

    const embed = createEmbed(
      'Jogo da Velha',
      `**${interaction.user.username}** (❌) vs **${opponent.username}** (⭕)\n\n` +
      `Vez de: **${interaction.user.username}**`
    );
    addServerFooter(embed, interaction.guild);

    const buttons = createButtons(board, gameId);

    await interaction.reply({ 
      content: `${opponent}`, 
      embeds: [embed], 
      components: buttons 
    });

    // Timeout de 5 minutos
    setTimeout(() => {
      if (games.has(gameId)) {
        games.delete(gameId);
        interaction.editReply({ 
          content: 'Tempo esgotado! Jogo cancelado.', 
          components: [] 
        });
      }
    }, 5 * 60 * 1000);
  }
};

module.exports.games = games;
module.exports.checkWinner = checkWinner;
module.exports.createButtons = createButtons;
