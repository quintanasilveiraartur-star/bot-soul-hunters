const { economy } = require('../utils/db');
const { createEmbed, formatNumber } = require('../utils/helpers');

// Cobra taxa de custo de vida de todos os usuários às 00:00 de São Paulo
async function chargeDailyTax(client) {
  console.log('🕐 Iniciando cobrança de taxa diária de custo de vida...');
  
  let totalUsers = 0;
  let totalCharged = 0;
  let totalAmount = 0;
  
  for (const [key, userData] of economy.entries()) {
    if (!userData.coins || userData.coins <= 0) continue;
    
    totalUsers++;
    
    // Calcula taxa de 25%
    const taxAmount = Math.floor(userData.coins * 0.25);
    
    if (taxAmount > 0) {
      const oldBalance = userData.coins;
      userData.coins = Math.max(0, userData.coins - taxAmount);
      userData.lastLivingCostDate = Date.now();
      economy.set(key, userData);
      
      totalCharged++;
      totalAmount += taxAmount;
      
      // Envia DM para o usuário
      try {
        const [guildId, userId] = key.split('_');
        const user = await client.users.fetch(userId).catch(() => null);
        
        if (user) {
          const embed = createEmbed(
            '💸 Custo de Vida Diário',
            `> **Atenção!** A taxa diária de custo de vida foi cobrada.\n\n` +
            `# 💰 Detalhes da Cobrança\n\n` +
            `**• Saldo anterior:** \`${formatNumber(oldBalance)}\` coins\n` +
            `**• Taxa cobrada:** \`${formatNumber(taxAmount)}\` coins **(25%)**\n` +
            `**• Saldo atual:** \`${formatNumber(userData.coins)}\` coins\n\n` +
            `> Esta taxa é cobrada **diariamente às 00:00** (horário de São Paulo) para simular custos de vida.\n\n` +
            `**- Mantenha-se ativo para recuperar seus coins!**\n` +
            `**- Use /trabalhar, /daily, /weekly e outros comandos.**`,
            '#FF6B6B'
          );
          
          await user.send({ embeds: [embed] }).catch(err => {
            console.log(`Não foi possível enviar DM para ${user.username}: ${err.message}`);
          });
        }
      } catch (err) {
        console.error(`Erro ao processar usuário ${key}:`, err.message);
      }
    }
  }
  
  console.log(`✅ Taxa diária cobrada de ${totalCharged}/${totalUsers} usuários`);
  console.log(`💰 Total arrecadado: ${formatNumber(totalAmount)} coins`);
}

// Agenda a cobrança diária às 00:00 de São Paulo
function scheduleDailyTax(client) {
  // Calcula próximo horário 00:00 de São Paulo (UTC-3)
  function getNextMidnight() {
    const now = new Date();
    const saoPaulo = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    
    const midnight = new Date(saoPaulo);
    midnight.setHours(24, 0, 0, 0);
    
    const diff = midnight - saoPaulo;
    return diff;
  }
  
  function scheduleNext() {
    const msUntilMidnight = getNextMidnight();
    
    console.log(`⏰ Próxima cobrança de taxa em: ${Math.floor(msUntilMidnight / 1000 / 60)} minutos`);
    
    setTimeout(async () => {
      await chargeDailyTax(client);
      scheduleNext(); // Agenda próxima execução
    }, msUntilMidnight);
  }
  
  scheduleNext();
}

module.exports = {
  chargeDailyTax,
  scheduleDailyTax
};
