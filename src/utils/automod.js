const { guilds } = require('./db');
const { createEmbed } = require('./helpers');

// Lista expandida de palavrões brasileiros (200+ palavras e variações)
const PALAVROES = [
  // Palavrões mais comuns do Brasil
  'porra', 'caralho', 'cacete', 'merda', 'bosta', 'puta', 'puto', 'cu',
  'buceta', 'xoxota', 'xereca', 'xana', 'piroca', 'pica', 'pau', 'rola',
  'penis', 'vagina', 'ppk', 'xxt', 'xoxo', 'boceta', 'xota',
  
  // Variações e gírias
  'foda', 'fode', 'foder', 'fodido', 'fodao', 'fudido', 'fuder', 'fudeu',
  'pqp', 'vsf', 'vtnc', 'fdp', 'filho da puta', 'filha da puta',
  'vai tomar no cu', 'vai se foder', 'va se fuder', 'se fude',
  
  // Ofensas sexuais
  'viado', 'bicha', 'baitola', 'boiola', 'gay', 'sapatao', 'traveco', 'travesti',
  'puta que pariu', 'putaria', 'putinha', 'putinho', 'prostituta', 'puto',
  'vadia', 'vagabunda', 'vagabundo', 'piranha', 'galinha', 'rapariga', 'safada', 'safado',
  
  // Ofensas gerais
  'arrombado', 'arrombada', 'corno', 'cornudo', 'chifrudo', 'chifre',
  'desgraçado', 'desgraçada', 'desgraca', 'desgracado', 'desgraça',
  'idiota', 'imbecil', 'retardado', 'mongoloide', 'mongol', 'debil', 'débil',
  'burro', 'burra', 'jumento', 'asno', 'animal', 'besta',
  'otario', 'otaria', 'babaca', 'babacao', 'trouxa', 'otário', 'otária',
  'escroto', 'escrota', 'nojento', 'nojenta', 'escrota',
  
  // VARIAÇÕES ABREVIADAS E GÍRIAS DA INTERNET
  // Variações de "porra"
  'prr', 'porr', 'porraa', 'porraaa', 'prra', 'prrr', 'porrah',
  'poha', 'poh', 'po', 'pô', 'poorra', 'porr@', 'p0rra', 'p0rr@',
  
  // Variações de "caralho"
  'crlh', 'krlh', 'krl', 'crl', 'crh', 'krh', 'carai', 'krai',
  'karai', 'caraio', 'karaio', 'karalho', 'caralha', 'caraleo',
  'c4ralho', 'c@ralho', 'kar@lho', 'k@ralho', 'crlho', 'krlho',
  
  // Variações de "merda"
  'mrda', 'mrd', 'merdaa', 'merdaaa', 'm3rda', 'm€rda', 'mierda',
  'merdinha', 'merdao', 'merdão',
  
  // Variações de "bosta"
  'bst', 'bosta', 'b0sta', 'b0st@', 'bostinha', 'bostao', 'bostão',
  
  // Variações de "foda"
  'fda', 'fd', 'fod@', 'f0da', 'f0d@', 'fud@', 'fud3',
  'fodase', 'foda-se', 'fodaci', 'fds', 'fdc',
  
  // Variações de "puta"
  'pt', 'pta', 'put@', 'pút@', 'p*ta', 'puta', 'putaa',
  'putaaa', 'putinha', 'putao', 'putão',
  
  // Variações de "cacete"
  'kct', 'kcte', 'cacet', 'c@cete', 'c4cete', 'kacete',
  
  // Variações de "cu"
  'kuu', 'cuu', 'cuuu', 'c*', 'c u',
  
  // Variações de buceta/xoxota
  'bct', 'bcta', 'buc3ta', 'buc€ta', 'xxt', 'xxta',
  'xox0ta', 'x0x0ta', 'xoxotinha', 'bucetinha',
  
  // Variações de piroca/pica
  'prc', 'prca', 'p1roca', 'p1ca', 'picao', 'picão',
  'pirocao', 'pirocão', 'piroquinha',
  
  // Palavrões regionais e variações
  'caramba', 'caraia', 'carajo', 'caceta', 'caralha',
  
  // Variações com números e símbolos
  'p1roca', 'p1ca', 'buc3ta', 'buc€ta', 'xox0ta',
  
  // Expressões ofensivas
  'toma no cu', 'tmnc', 'tnc', 'se fode', 'se foda', 'foda-se',
  'vai pro inferno', 'vai morrer', 'te mato', 'morra',
  'cala boca', 'cala a boca', 'se mata', 'mata', 'cale-se',
  'vai tomar', 'tomar no', 'no cu', 'pro inferno',
  
  // Palavrões com espaços
  'filho da puta', 'filha da puta', 'puta que pariu', 'puta merda',
  'vai tomar no cu', 'vai se foder', 'va se foder',
  'que merda', 'que porra', 'pra caralho', 'puta que',
  'toma no cu', 'vai pro', 'se fode', 'cala a',
  
  // Abreviações e gírias da internet
  'fdp', 'vsf', 'vtnc', 'pqp', 'tnc', 'tmnc', 'tmb', 'ctg',
  'vsc', 'vtmnc', 'pdc', 'pdp', 'tmj', 'tnc',
  'vqv', 'vlw', 'fdp', 'hdp', 'sdds',
  
  // Variações de "viado"
  'viad', 'viadao', 'viadão', 'viadinho', 'v1ado', 'vi@do',
  
  // Variações de "bicha"
  'bich', 'bichinha', 'bichona', 'b1cha', 'bich@',
  
  // Variações de "arrombado"
  'arromba', 'arromb', 'arrombad', 'arromba', 'arrombd',
  
  // Variações de "corno"
  'corn', 'cornao', 'cornão', 'corninho', 'c0rno',
  
  // Variações de "babaca"
  'bbca', 'babac', 'babak', 'b@baca', 'bab@ca',
  
  // Palavrões menos comuns mas ofensivos
  'caceta', 'caralha', 'caraleo', 'carai', 'carajo',
  'porcaria', 'droga', 'diabo', 'inferno', 'demonio',
  'lazarento', 'leproso', 'peste', 'praga', 'maldito',
  'amaldiçoado', 'desgraçado', 'infeliz', 'miseravel',
  
  // Variações regionais do Brasil
  'capeta', 'credo', 'cruz', 'peste', 'praga',
  'raios', 'diabos', 'diacho', 'diaxo',
  
  // Gírias ofensivas
  'lixo', 'merda', 'bosta', 'cocô', 'coco', 'fezes',
  'mijao', 'mijo', 'xixi', 'urina',
  
  // Variações criativas e com leetspeak
  'p0rr4', 'c4r4lh0', 'm3rd4', 'b0st4', 'f0d4',
  'put4', 'c4c3t3', 'buc3t4', 'x0x0t4', 'p1r0c4'
];

// Controle de flood e spam
const messageHistory = new Map(); // userId -> [timestamps]
const spamDetection = new Map(); // userId -> { content, count, timestamp }

// Detecta palavrões na mensagem
function detectarPalavroes(mensagem) {
  // Normaliza o texto removendo acentos e caracteres especiais
  const texto = mensagem.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, ' '); // Substitui caracteres especiais por espaço

  const palavrasEncontradas = [];
  
  // Verifica cada palavrão
  for (const palavrao of PALAVROES) {
    // Cria regex que aceita espaços e caracteres especiais entre letras
    const palavraoNormalizado = palavrao
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    
    // Verifica se a palavra está presente (com ou sem espaços/caracteres especiais)
    const regex = new RegExp(`\\b${palavraoNormalizado}\\b`, 'i');
    
    if (regex.test(texto)) {
      palavrasEncontradas.push(palavrao);
    }
  }

  // Log de debug (remover em produção)
  if (palavrasEncontradas.length > 0) {
    console.log(`[AUTOMOD] Palavrões detectados: ${palavrasEncontradas.join(', ')}`);
    console.log(`[AUTOMOD] Mensagem original: ${mensagem}`);
    console.log(`[AUTOMOD] Texto normalizado: ${texto}`);
  }

  return palavrasEncontradas;
}

// Detecta links
function detectarLinks(mensagem) {
  const linkRegex = /(https?:\/\/[^\s]+)|(discord\.gg\/[^\s]+)|(discord\.com\/invite\/[^\s]+)/gi;
  return linkRegex.test(mensagem);
}

// Detecta flood (muitas mensagens em pouco tempo)
function detectarFlood(userId) {
  const now = Date.now();
  const history = messageHistory.get(userId) || [];
  
  // Remove mensagens antigas (mais de 5 segundos)
  const recentMessages = history.filter(timestamp => now - timestamp < 5000);
  
  // Adiciona mensagem atual
  recentMessages.push(now);
  messageHistory.set(userId, recentMessages);
  
  // Se enviou 5+ mensagens em 5 segundos = flood
  return recentMessages.length >= 5;
}

// Detecta spam (mesma mensagem repetida)
function detectarSpam(userId, content) {
  const now = Date.now();
  const spamData = spamDetection.get(userId);
  
  if (!spamData) {
    spamDetection.set(userId, { content, count: 1, timestamp: now });
    return false;
  }
  
  // Se passou mais de 30 segundos, reseta
  if (now - spamData.timestamp > 30000) {
    spamDetection.set(userId, { content, count: 1, timestamp: now });
    return false;
  }
  
  // Se é a mesma mensagem
  if (spamData.content === content) {
    spamData.count++;
    spamData.timestamp = now;
    
    // 3+ mensagens iguais em 30 segundos = spam
    if (spamData.count >= 3) {
      spamDetection.delete(userId);
      return true;
    }
  } else {
    // Mensagem diferente, reseta
    spamDetection.set(userId, { content, count: 1, timestamp: now });
  }
  
  return false;
}

// Aplica mute automático
async function aplicarMuteAutomatico(message, motivo, palavroesDetectados = []) {
  try {
    console.log('[AUTOMOD] Iniciando aplicação de mute automático...');
    console.log('[AUTOMOD] Motivo:', motivo);
    console.log('[AUTOMOD] Palavrões:', palavroesDetectados);
    
    const member = message.member;
    if (!member) {
      console.log('[AUTOMOD] Membro não encontrado');
      return false;
    }

    // Verifica se o bot tem permissão para moderar
    const botMember = message.guild.members.me;
    
    console.log('[AUTOMOD] Verificando permissões...');
    console.log('[AUTOMOD] Bot tem ModerateMembers?', botMember.permissions.has('ModerateMembers'));
    console.log('[AUTOMOD] Bot tem Administrator?', botMember.permissions.has('Administrator'));
    console.log('[AUTOMOD] Cargo do bot:', botMember.roles.highest.name, '- Posição:', botMember.roles.highest.position);
    console.log('[AUTOMOD] Cargo do membro:', member.roles.highest.name, '- Posição:', member.roles.highest.position);
    console.log('[AUTOMOD] Membro é moderável?', member.moderatable);
    console.log('[AUTOMOD] Membro é o dono?', member.id === message.guild.ownerId);
    console.log('[AUTOMOD] Permissões do bot no canal:', botMember.permissionsIn(message.channel).toArray());
    
    if (!botMember.permissions.has('ModerateMembers') && !botMember.permissions.has('Administrator')) {
      console.log('[AUTOMOD] Bot não tem permissão "ModerateMembers" ou "Administrator"');
      return false;
    }

    // Verifica se o membro pode ser moderado
    if (!member.moderatable) {
      console.log('[AUTOMOD] Membro não pode ser moderado (cargo superior ou dono)');
      return false;
    }

    // Verifica hierarquia de cargos
    if (member.roles.highest.position >= botMember.roles.highest.position) {
      console.log('[AUTOMOD] Membro tem cargo igual ou superior ao bot');
      return false;
    }

    console.log('[AUTOMOD] Aplicando timeout de 1 minuto...');
    
    let timeoutAplicado = false;
    
    // Tenta aplicar timeout de 1 minuto
    try {
      await member.timeout(60 * 1000, `Auto-moderação: ${motivo}`);
      console.log('[AUTOMOD] Timeout aplicado com sucesso');
      timeoutAplicado = true;
    } catch (timeoutError) {
      console.log('[AUTOMOD] Erro ao aplicar timeout:', timeoutError.message);
      console.log('[AUTOMOD] Código do erro:', timeoutError.code);
      
      // Tenta método alternativo: editar o membro diretamente
      try {
        console.log('[AUTOMOD] Tentando método alternativo...');
        await message.guild.members.edit(member.id, {
          communicationDisabledUntil: new Date(Date.now() + 60 * 1000),
        }, `Auto-moderação: ${motivo}`);
        console.log('[AUTOMOD] Timeout aplicado com método alternativo');
        timeoutAplicado = true;
      } catch (altError) {
        console.log('[AUTOMOD] Método alternativo também falhou:', altError.message);
        console.log('[AUTOMOD] Código do erro alternativo:', altError.code);
      }
    }
    
    // Se não conseguiu aplicar timeout, pelo menos deleta e avisa
    if (!timeoutAplicado) {
      console.log('[AUTOMOD] Timeout não foi possível, usando fallback...');
      
      await message.delete().catch((err) => {
        console.log('[AUTOMOD] Erro ao deletar mensagem:', err.message);
      });
      
      const warningMsg = await message.channel.send({
        content: `⚠️ ${member}, linguagem imprópria detectada! Evite usar palavrões no servidor.`
      }).catch((err) => {
        console.log('[AUTOMOD] Erro ao enviar aviso:', err.message);
      });
      
      if (warningMsg) {
        setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
      }
      
      // Log no canal mesmo sem timeout
      const config = guilds.get(message.guildId);
      if (config && config.logChannel) {
        const logChannel = message.guild.channels.cache.get(config.logChannel);
        if (logChannel) {
          let detalhes = '';
          if (palavroesDetectados.length > 0) {
            detalhes = `\n**Palavras detectadas:** ||${palavroesDetectados.join(', ')}||`;
          }
          
          const logEmbed = createEmbed(
            '🤖 Auto-Moderação: Aviso Enviado',
            `**Usuário:** ${member.user.username} (${member.id})\n` +
            `**Canal:** <#${message.channelId}>\n` +
            `**Motivo:** ${motivo}\n` +
            `**Ação:** Mensagem deletada e aviso enviado (timeout não disponível)${detalhes}`,
            '#ffaa00'
          )
          .setTimestamp()
          .setFooter({
            text: message.guild.name,
            iconURL: message.guild.iconURL() || undefined
          });

          await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
        }
      }
      
      console.log('[AUTOMOD] Fallback executado com sucesso');
      return true;
    }

    console.log('[AUTOMOD] Timeout aplicado com sucesso');

    // Deleta a mensagem
    await message.delete().catch((err) => {
      console.log('[AUTOMOD] Erro ao deletar mensagem:', err.message);
    });

    console.log('[AUTOMOD] Mensagem deletada');

    // Envia DM para o usuário
    const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
    
    const dmEmbed = createEmbed(
      'Você foi silenciado automaticamente',
      `**Servidor:** ${message.guild.name}\n` +
      `**Motivo:** ${motivo}\n` +
      `**Duração:** 1 minuto\n\n` +
      `Evite comportamentos que violem a segurança do servidor.`,
      '#ff0000'
    );

    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('system_message')
          .setLabel('⚠️ Mensagem do Sistema')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

    await member.send({ embeds: [dmEmbed], components: [button] }).catch((err) => {
      console.log('[AUTOMOD] Não foi possível enviar DM:', err.message);
    });

    console.log('[AUTOMOD] DM enviada');

    // Log no canal (se configurado)
    const config = guilds.get(message.guildId);
    if (config && config.logChannel) {
      const logChannel = message.guild.channels.cache.get(config.logChannel);
      if (logChannel) {
        let detalhes = '';
        if (palavroesDetectados.length > 0) {
          detalhes = `\n**Palavras detectadas:** ||${palavroesDetectados.join(', ')}||`;
        }
        
        const logEmbed = createEmbed(
          '🤖 Auto-Moderação: Mute Aplicado',
          `**Usuário:** ${member.user.username} (${member.id})\n` +
          `**Canal:** <#${message.channelId}>\n` +
          `**Motivo:** ${motivo}\n` +
          `**Duração:** 1 minuto${detalhes}`,
          '#ff9900'
        )
        .setTimestamp()
        .setFooter({
          text: message.guild.name,
          iconURL: message.guild.iconURL() || undefined
        });

        await logChannel.send({ embeds: [logEmbed] }).catch((err) => {
          console.log('[AUTOMOD] Erro ao enviar log:', err.message);
        });

        console.log('[AUTOMOD] Log enviado ao canal');
      }
    }

    console.log('[AUTOMOD] Mute automático aplicado com sucesso!');
    return true;
  } catch (error) {
    console.error('[AUTOMOD] Erro ao aplicar mute automático:', error);
    return false;
  }
}

// Limpa históricos antigos periodicamente
setInterval(() => {
  const now = Date.now();
  
  // Limpa flood history
  for (const [userId, history] of messageHistory.entries()) {
    const recent = history.filter(timestamp => now - timestamp < 5000);
    if (recent.length === 0) {
      messageHistory.delete(userId);
    } else {
      messageHistory.set(userId, recent);
    }
  }
  
  // Limpa spam detection
  for (const [userId, data] of spamDetection.entries()) {
    if (now - data.timestamp > 30000) {
      spamDetection.delete(userId);
    }
  }
}, 60000); // A cada 1 minuto

module.exports = {
  detectarPalavroes,
  detectarLinks,
  detectarFlood,
  detectarSpam,
  aplicarMuteAutomatico
};
