const { createCanvas } = require('canvas');

function generateCryptoChart(symbol, history, currentPrice, cryptoName) {
  const width = 1000;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fundo escuro profissional
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(0, 0, width, height);
  
  // Header com informações
  const headerHeight = 100;
  ctx.fillStyle = '#141b2d';
  ctx.fillRect(0, 0, width, headerHeight);
  
  // Nome da cripto
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.fillText(`${cryptoName} (${symbol})`, 30, 45);
  
  // Preço atual - grande e destacado
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#00ff88';
  ctx.fillText(`${currentPrice.toLocaleString()} coins`, 30, 90);
  
  // Calcula variação
  const firstPrice = history[0];
  const change = ((currentPrice - firstPrice) / firstPrice) * 100;
  const changeColor = change >= 0 ? '#00ff88' : '#ff4444';
  const changeSign = change >= 0 ? '+' : '';
  
  // Variação percentual
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = changeColor;
  ctx.fillText(`${changeSign}${change.toFixed(2)}%`, 400, 90);
  
  // Indicador visual de alta/baixa
  ctx.fillStyle = changeColor;
  if (change >= 0) {
    // Triângulo para cima
    ctx.beginPath();
    ctx.moveTo(380, 75);
    ctx.lineTo(390, 65);
    ctx.lineTo(370, 65);
    ctx.closePath();
    ctx.fill();
  } else {
    // Triângulo para baixo
    ctx.beginPath();
    ctx.moveTo(380, 65);
    ctx.lineTo(390, 75);
    ctx.lineTo(370, 75);
    ctx.closePath();
    ctx.fill();
  }
  
  // Área do gráfico
  const chartX = 60;
  const chartY = headerHeight + 40;
  const chartWidth = width - 120;
  const chartHeight = height - headerHeight - 80;
  
  // Encontra min e max para escala
  const minPrice = Math.min(...history);
  const maxPrice = Math.max(...history);
  const priceRange = maxPrice - minPrice || 1;
  const padding = priceRange * 0.1;
  
  // Grade horizontal
  ctx.strokeStyle = '#1e2a47';
  ctx.lineWidth = 1;
  const gridLines = 6;
  
  for (let i = 0; i <= gridLines; i++) {
    const y = chartY + (chartHeight / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(chartX, y);
    ctx.lineTo(chartX + chartWidth, y);
    ctx.stroke();
    
    // Labels de preço
    const price = maxPrice - (priceRange / gridLines) * i;
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(Math.floor(price).toLocaleString(), chartX - 10, y + 5);
  }
  
  // Grade vertical
  const timePoints = 5;
  for (let i = 0; i <= timePoints; i++) {
    const x = chartX + (chartWidth / timePoints) * i;
    ctx.strokeStyle = '#1e2a47';
    ctx.beginPath();
    ctx.moveTo(x, chartY);
    ctx.lineTo(x, chartY + chartHeight);
    ctx.stroke();
  }
  
  // Área sob a linha (gradiente)
  const gradient = ctx.createLinearGradient(0, chartY, 0, chartY + chartHeight);
  gradient.addColorStop(0, change >= 0 ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(chartX, chartY + chartHeight);
  
  history.forEach((price, index) => {
    const x = chartX + (chartWidth / (history.length - 1)) * index;
    const normalizedPrice = (price - minPrice + padding) / (priceRange + padding * 2);
    const y = chartY + chartHeight - (normalizedPrice * chartHeight);
    ctx.lineTo(x, y);
  });
  
  ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
  ctx.closePath();
  ctx.fill();
  
  // Linha principal do gráfico - MAIS GROSSA E VISÍVEL
  ctx.strokeStyle = change >= 0 ? '#00ff88' : '#ff4444';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  
  history.forEach((price, index) => {
    const x = chartX + (chartWidth / (history.length - 1)) * index;
    const normalizedPrice = (price - minPrice + padding) / (priceRange + padding * 2);
    const y = chartY + chartHeight - (normalizedPrice * chartHeight);
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
  
  // Ponto atual (último ponto)
  const lastX = chartX + chartWidth;
  const lastNormalizedPrice = (currentPrice - minPrice + padding) / (priceRange + padding * 2);
  const lastY = chartY + chartHeight - (lastNormalizedPrice * chartHeight);
  
  // Círculo externo (brilho)
  ctx.fillStyle = change >= 0 ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)';
  ctx.beginPath();
  ctx.arc(lastX, lastY, 12, 0, Math.PI * 2);
  ctx.fill();
  
  // Círculo principal
  ctx.fillStyle = change >= 0 ? '#00ff88' : '#ff4444';
  ctx.beginPath();
  ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Círculo interno
  ctx.fillStyle = '#0a0e27';
  ctx.beginPath();
  ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Labels de tempo
  ctx.fillStyle = '#6b7280';
  ctx.font = '13px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('2h atrás', chartX, height - 15);
  ctx.fillText('1.5h', chartX + chartWidth * 0.25, height - 15);
  ctx.fillText('1h', chartX + chartWidth * 0.5, height - 15);
  ctx.fillText('30min', chartX + chartWidth * 0.75, height - 15);
  ctx.fillText('Agora', chartX + chartWidth, height - 15);
  
  // Informações adicionais no canto
  ctx.textAlign = 'right';
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px Arial';
  ctx.fillText(`Máx: ${Math.floor(maxPrice).toLocaleString()}`, width - 30, chartY + 20);
  ctx.fillText(`Mín: ${Math.floor(minPrice).toLocaleString()}`, width - 30, chartY + 40);
  
  return canvas.toBuffer();
}

module.exports = { generateCryptoChart };
