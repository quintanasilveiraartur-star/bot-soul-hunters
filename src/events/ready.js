const { ActivityType } = require('discord.js');
const { mutes } = require('../utils/db');
const { updateQuizzesIfNeeded } = require('../utils/quizData');
const { updateContentIfNeeded } = require('../utils/contentData');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`\n[BOT] Logado como ${client.user.tag}`);
    console.log(`[BOT] ${client.guilds.cache.size} servidores`);
    console.log(`[BOT] ${client.users.cache.size} usuários\n`);

    // Atualiza conteúdo dinâmico na inicialização
    updateQuizzesIfNeeded();
    updateContentIfNeeded();
    console.log('[CONTEÚDO] Sistema dinâmico carregado');

    // Atualiza conteúdo a cada 10 minutos
    setInterval(() => {
      updateQuizzesIfNeeded();
      updateContentIfNeeded();
      console.log('[CONTEÚDO] Quizzes e conteúdo atualizados');
    }, 10 * 60 * 1000);

    // Status do bot com rotação
    const statuses = [
      { name: 'Souls Hunter', type: ActivityType.Watching },
      { name: '/painel para configurar', type: ActivityType.Watching },
      { name: `${client.guilds.cache.size} servidores`, type: ActivityType.Watching },
      { name: '/quiz - Novos quizzes!', type: ActivityType.Playing },
      { name: '/trabalhar - Novos empregos!', type: ActivityType.Playing }
    ];

    let currentStatus = 0;
    
    const updateStatus = () => {
      client.user.setActivity(statuses[currentStatus].name, { 
        type: statuses[currentStatus].type 
      });
      currentStatus = (currentStatus + 1) % statuses.length;
    };

    updateStatus();
    setInterval(updateStatus, 30000); // Muda status a cada 30 segundos

    // Verifica mutes expirados a cada minuto
    setInterval(() => checkExpiredMutes(client), 60000);
    
    // Primeira verificação imediata
    checkExpiredMutes(client);
  }
};

async function checkExpiredMutes(client) {
  const data = mutes.read();
  const now = Date.now();
  let removed = 0;

  for (const [key, muteData] of Object.entries(data)) {
    if (muteData.endsAt <= now) {
      const [guildId, userId] = key.split('_');
      
      try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
          mutes.delete(key);
          continue;
        }

        const member = await guild.members.fetch(userId).catch(() => null);
        if (member) {
          await member.timeout(null, 'Mute expirado').catch(() => {});
        }

        mutes.delete(key);
        removed++;
      } catch (err) {
        console.error(`Erro ao remover mute ${key}:`, err.message);
      }
    }
  }

  if (removed > 0) {
    console.log(`[MUTES] ${removed} mutes expirados removidos`);
  }
}
