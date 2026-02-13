const fs = require('fs');
const path = require('path');

const MARKET_FILE = path.join(__dirname, '../../databases/crypto_market.json');

// Criptomoedas disponíveis
const CRYPTOS = {
  BTC: { name: 'Bitcoin', basePrice: 50000, volatility: 0.05, symbol: '₿' },
  ETH: { name: 'Ethereum', basePrice: 3000, volatility: 0.08, symbol: 'Ξ' },
  DOGE: { name: 'Dogecoin', basePrice: 50, volatility: 0.15, symbol: 'Ð' },
  SHIB: { name: 'Shiba Inu', basePrice: 10, volatility: 0.20, symbol: '🐕' },
  ADA: { name: 'Cardano', basePrice: 500, volatility: 0.10, symbol: '₳' },
  SOL: { name: 'Solana', basePrice: 1500, volatility: 0.12, symbol: '◎' }
};

// Carrega ou cria mercado
function loadMarket() {
  try {
    if (fs.existsSync(MARKET_FILE)) {
      const data = fs.readFileSync(MARKET_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erro ao carregar mercado:', err);
  }
  
  // Cria mercado inicial
  const market = {
    lastUpdate: Date.now(),
    prices: {},
    history: {}
  };
  
  for (const [symbol, crypto] of Object.entries(CRYPTOS)) {
    market.prices[symbol] = crypto.basePrice;
    market.history[symbol] = [crypto.basePrice];
  }
  
  saveMarket(market);
  return market;
}

// Salva mercado
function saveMarket(market) {
  try {
    const dir = path.dirname(MARKET_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MARKET_FILE, JSON.stringify(market, null, 2));
  } catch (err) {
    console.error('Erro ao salvar mercado:', err);
  }
}

// Atualiza preços (a cada 5 minutos)
function updatePrices() {
  const market = loadMarket();
  const now = Date.now();
  
  // Atualiza apenas se passou 5 minutos
  if (now - market.lastUpdate < 5 * 60 * 1000) {
    return market;
  }
  
  for (const [symbol, crypto] of Object.entries(CRYPTOS)) {
    const currentPrice = market.prices[symbol];
    
    // Variação aleatória baseada na volatilidade
    const change = (Math.random() - 0.5) * 2 * crypto.volatility;
    let newPrice = currentPrice * (1 + change);
    
    // Limita variação extrema (não pode cair abaixo de 10% do base ou subir acima de 300%)
    const minPrice = crypto.basePrice * 0.1;
    const maxPrice = crypto.basePrice * 3;
    newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
    
    market.prices[symbol] = Math.floor(newPrice);
    
    // Adiciona ao histórico (mantém últimos 24 pontos = 2 horas)
    if (!market.history[symbol]) market.history[symbol] = [];
    market.history[symbol].push(market.prices[symbol]);
    if (market.history[symbol].length > 24) {
      market.history[symbol].shift();
    }
  }
  
  market.lastUpdate = now;
  saveMarket(market);
  return market;
}

// Pega preços atuais
function getCurrentPrices() {
  const market = updatePrices();
  return market.prices;
}

// Pega histórico de uma moeda
function getCryptoHistory(symbol) {
  const market = loadMarket();
  return market.history[symbol] || [];
}

// Calcula variação percentual
function getPriceChange(symbol) {
  const history = getCryptoHistory(symbol);
  if (history.length < 2) return 0;
  
  const current = history[history.length - 1];
  const previous = history[0];
  return ((current - previous) / previous) * 100;
}

module.exports = {
  CRYPTOS,
  loadMarket,
  updatePrices,
  getCurrentPrices,
  getCryptoHistory,
  getPriceChange
};
