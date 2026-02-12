const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { xp } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey } = require('../../utils/helpers');

const TITLES = [
  'Novato', 'Iniciante', 'Aprendiz', 'Experiente', 'Veterano',
  'Elite', 'Mestre', 'Lendário', 'Mítico', 'Divino'
];

// Cache de rankings por servidor
const rankingCache = new Map();

async function generateRankingImage(guild, users, page = 0) {
  const USERS_PER_PAGE = 5;
  const startIndex = page * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const pageUsers = users.slice(startIndex, endIndex);

  // Canvas 900x700
  const canvas = createCanvas(900, 700);
  const ctx = canvas.getContext('2d');

  // Fundo gradiente azul escuro
  const gradient = ctx.createLinearGradient(0, 0, 0, 700);
  gradient.addColorStop(0, '#1a1d29');
  gradient.addColorStop(1, '#0f1419');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 900, 700);

  // Padrão de fundo sutil
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 900, Math.random() * 700, Math.random() * 50, 0, Math.PI * 2);
    ctx.fill();
  }

  // Título
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Arial';
  ctx.fillText('Ranking de XP', 50, 60);

  // Ícone do servidor no canto superior direito
  try {
    const serverIconURL = guild.iconURL({ extension: 'png', size: 128 });
    if (serverIconURL) {
      const serverIcon = await loadImage(serverIconURL);
      
      // Desenha o ícone como um quadrado arredondado
      ctx.save();
      const iconSize = 60;
      const iconX = 820;
      const iconY = 20;
      const radius = 12;
      
      // Cria path com cantos arredondados
      ctx.beginPath();
      ctx.moveTo(iconX + radius, iconY);
      ctx.lineTo(iconX + iconSize - radius, iconY);
      ctx.quadraticCurveTo(iconX + iconSize, iconY, iconX + iconSize, iconY + radius);
      ctx.lineTo(iconX + iconSize, iconY + iconSize - radius);
      ctx.quadraticCurveTo(iconX + iconSize, iconY + iconSize, iconX + iconSize - radius, iconY + iconSize);
      ctx.lineTo(iconX + radius, iconY + iconSize);
      ctx.quadraticCurveTo(iconX, iconY + iconSize, iconX, iconY + iconSize - radius);
      ctx.lineTo(iconX, iconY + radius);
      ctx.quadraticCurveTo(iconX, iconY, iconX + radius, iconY);
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(serverIcon, iconX, iconY, iconSize, iconSize);
      ctx.restore();
      
      // Borda do ícone
      ctx.strokeStyle = '#5865F2';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(iconX + radius, iconY);
      ctx.lineTo(iconX + iconSize - radius, iconY);
      ctx.quadraticCurveTo(iconX + iconSize, iconY, iconX + iconSize, iconY + radius);
      ctx.lineTo(iconX + iconSize, iconY + iconSize - radius);
      ctx.quadraticCurveTo(iconX + iconSize, iconY + iconSize, iconX + iconSize - radius, iconY + iconSize);
      ctx.lineTo(iconX + radius, iconY + iconSize);
      ctx.quadraticCurveTo(iconX, iconY + iconSize, iconX, iconY + iconSize - radius);
      ctx.lineTo(iconX, iconY + radius);
      ctx.quadraticCurveTo(iconX, iconY, iconX + radius, iconY);
      ctx.closePath();
      ctx.stroke();
    }
  } catch (err) {
    console.error('Erro ao carregar ícone do servidor:', err);
  }

  // Página (abaixo do título)
  ctx.font = '18px Arial';
  ctx.fillStyle = '#888888';
  ctx.fillText(`Página ${page + 1}`, 50, 90);

  // Desenha cada usuário
  let yPos = 130;
  for (let i = 0; i < pageUsers.length; i++) {
    const userData = pageUsers[i];
    const position = startIndex + i + 1;
    
    // Card do usuário
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(40, yPos - 10, 820, 100);
    
    // Borda colorida baseada na posição
    let borderColor = '#888888';
    if (position === 1) borderColor = '#FFD700'; // Ouro
    else if (position === 2) borderColor = '#C0C0C0'; // Prata
    else if (position === 3) borderColor = '#CD7F32'; // Bronze
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(40, yPos - 10, 820, 100);

    // Posição
    ctx.fillStyle = borderColor;
    ctx.font = 'bold 35px Arial';
    ctx.fillText(`#${position}`, 70, yPos + 45);

    // Avatar (círculo)
    try {
      const member = await guild.members.fetch(userData.userId).catch(() => null);
      if (member) {
        const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 128 });
        const avatar = await loadImage(avatarURL);
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(180, yPos + 40, 35, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 145, yPos + 5, 70, 70);
        ctx.restore();
        
        // Borda do avatar
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(180, yPos + 40, 35, 0, Math.PI * 2);
        ctx.stroke();
      }
    } catch (err) {
      // Avatar padrão se falhar
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      ctx.arc(180, yPos + 40, 35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nome do usuário
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    const member = await guild.members.fetch(userData.userId).catch(() => null);
    const username = member ? member.user.username : 'Usuário Desconhecido';
    ctx.fillText(username.substring(0, 20), 240, yPos + 35);

    // ID (menor)
    ctx.fillStyle = '#888888';
    ctx.font = '14px Arial';
    ctx.fillText(`ID: ${userData.userId}`, 240, yPos + 55);

    // XP e Nível
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`XP Total: ${userData.xp.toLocaleString()}`, 550, yPos + 35);
    ctx.fillText(`Nível: ${userData.level}`, 550, yPos + 60);

    yPos += 110;
  }

  return canvas.toBuffer();
}

module.exports = {
  data: {
    name: 'rank',
    description: 'Ver ranking de XP do servidor ou seu rank individual',
    options: [{
      name: 'usuario',
      description: 'Usuário para ver rank individual',
      type: 6,
      required: false
    }]
  },

  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuario');
    
    // Se especificou um usuário, mostra rank individual
    if (targetUser) {
      const key = makeKey(interaction.guildId, targetUser.id);
      let userData = xp.get(key);
      if (!userData) {
        userData = { xp: 0, level: 0 };
      }

      const xpNeeded = (userData.level + 1) * 100;
      const progress = Math.floor((userData.xp / xpNeeded) * 100);
      const barraCheia = Math.floor(progress / 10);
      const barraVazia = 10 - barraCheia;
      const barra = '█'.repeat(barraCheia) + '░'.repeat(barraVazia);

      const titleIndex = Math.min(Math.floor(userData.level / 5), TITLES.length - 1);
      const title = TITLES[titleIndex];

      const embed = createEmbed(
        'Rank de XP',
        `**Usuário:** \`${targetUser.username}\`\n` +
        `**Título:** \`${title}\`\n\n` +
        '```yaml\n' +
        `Nível: ${userData.level}\n` +
        `XP: ${userData.xp}/${xpNeeded}\n` +
        `Progresso: ${progress}%\n` +
        '```\n' +
        `${barra}`
      );
      embed.setThumbnail(targetUser.displayAvatarURL());
      addServerFooter(embed, interaction.guild);

      return interaction.reply({ embeds: [embed] });
    }

    // Mostra ranking geral com imagem
    await interaction.deferReply();

    // Pega todos os usuários do servidor
    const allData = xp.read();
    const guildUsers = [];
    
    for (const [key, data] of Object.entries(allData)) {
      if (key.startsWith(interaction.guildId)) {
        const userId = key.split('_')[1];
        guildUsers.push({
          userId,
          xp: data.xp || 0,
          level: data.level || 0
        });
      }
    }

    // Ordena por XP
    guildUsers.sort((a, b) => b.xp - a.xp);

    if (guildUsers.length === 0) {
      return interaction.editReply({ content: 'Nenhum usuário com XP registrado ainda.' });
    }

    const totalPages = Math.ceil(guildUsers.length / 5);
    const currentPage = 0;

    // Gera imagem
    const imageBuffer = await generateRankingImage(interaction.guild, guildUsers, currentPage);
    const attachment = new AttachmentBuilder(imageBuffer, { name: 'ranking.png' });

    // Botões de navegação
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`rank_prev_${currentPage}`)
          .setLabel('◀️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId(`rank_next_${currentPage}`)
          .setLabel('▶️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage >= totalPages - 1)
      );

    // Salva no cache
    rankingCache.set(interaction.user.id, { users: guildUsers, guild: interaction.guild });

    await interaction.editReply({
      content: `📊 **Ranking de XP** - Página ${currentPage + 1}/${totalPages}`,
      files: [attachment],
      components: [row]
    });
  }
};

// Exporta cache para uso no buttonHandler
module.exports.rankingCache = rankingCache;
module.exports.generateRankingImage = generateRankingImage;
