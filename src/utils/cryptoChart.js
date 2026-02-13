const { createCanvas } = require('canvas');

function generateCryptoChart(symbol, history, currentPrice, cryptoName) {
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fundo
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);
  
  // Título
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`${cryptoName} (${symbol})`, 20, 40);
  
  // Preço atual
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#00ff00';
  ctx.fillText(`${currentPrice} coins`, 20, 80);
  
  // Calcula variação
  const firstPrice = history[0];
  const change = ((currentPrice - firstPrice) / firstPrice) * 100;
  const changeColor = change >= 0 ? '#00ff00' : '#ff0000';
  const changeSign = change >= 0 ? '+' : '';
  
  ctx.font = '20px Arial';
  ctx.fillStyle = changeColor;
  ctx.fillText(`${changeSign}${change.toFixed(2)}%`, 20, 110);
  
  // Área do gráfico
  const chartX = 50;
  const chartY = 140;
  const chartWidth = width - 100;
  const chartHeight = height - 180;
  
  // Grade
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = chartY + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(chartX, y);
    ctx.lineTo(chartX + chartWidth, y);
    ctx.stroke();
  }
  
  // Encontra min e max
  const minPrice = Math.min(...history);
  const maxPrice = Math.max(...history);
  const priceRange = maxPrice - minPrice || 1;
  
  // Desenha linha do gráfico
  ctx.strokeStyle = '#00aaff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  
  history.forEach((price, index) => {
    const x = chartX + (chartWidth / (history.length - 1)) * index;
    const y = chartY + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
  
  // Área sob a linha (gradiente)
  const gradient = ctx.createLinearGradient(0, chartY, 0, chartY + chartHeight);
  gradient.addColorStop(0, 'rgba(0, 170, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 170, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(chartX, chartY + chartHeight);
  
  history.forEach((price, index) => {
    const x = chartX + (chartWidth / (history.length - 1)) * index;
    const y = chartY + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    ctx.lineTo(x, y);
  });
  
  ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
  ctx.closePath();
  ctx.fill();
  
  // Labels de preço
  ctx.fillStyle = '#888888';
  ctx.font = '14px Arial';
  ctx.textAlign = 'right';
  
  for (let i = 0; i <= 5; i++) {
    const price = maxPrice - (priceRange / 5) * i;
    const y = chartY + (chartHeight / 5) * i + 5;
    ctx.fillText(Math.floor(price).toString(), chartX - 10, y);
  }
  
  // Tempo
  ctx.textAlign = 'center';
  ctx.fillText('2h atrás', chartX, height - 10);
  ctx.fillText('Agora', chartX + chartWidth, height - 10);
  
  return canvas.toBuffer();
}

module.exports = { generateCryptoChart };
