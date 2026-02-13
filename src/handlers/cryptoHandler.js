const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { economy } = require('../utils/db');
const { createEmbed, addServerFooter, makeKey } = require('../utils/helpers');
const { CRYPTOS, getCurrentPrices, getCryptoHistory } = require('../utils/cryptoMarket');
const { generateCryptoChart } = require('../utils/cryptoChart');

async function handleCryptoSelect(interaction, symbol) {
  const userId = interaction.customId.split('_')[2];
  
  if (interaction.user.id !== userId) {
    return interaction.reply({ content: 'Apenas quem usou o comando pode selecionar', ephemeral: true });
  }

  const crypto = CRYPTOS[symbol];
  const prices = getCurrentPrices();
  const price = prices[symbol];
  const history = getCryptoHistory(symbol);
  
  // Gera gráfico
  const chartBuffer = generateCryptoChart(symbol, history, price, crypto.name);
  const attachment = new AttachmentBuilder(chartBuffer, { name: `${symbol}_chart.png` });

  const embed = createEmbed(
    `${crypto.name} (${symbol})`,
    `**Preço atual:** \`${price}\` coins\n\n` +
    `> Digite a quantidade de coins que deseja investir.\n` +
    `> Mínimo: 100 coins`
  );
  embed.setImage(`attachment://${symbol}_chart.png`);
  embed.setColor('#FFD700');
  addServerFooter(embed, interaction.guild);

  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`invest_${symbol}_100_${userId}`)
        .setLabel('100 coins')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`invest_${symbol}_500_${userId}`)
        .setLabel('500 coins')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`invest_${symbol}_1000_${userId}`)
        .setLabel('1000 coins')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`invest_${symbol}_5000_${userId}`)
        .setLabel('5000 coins')
        .setStyle(ButtonStyle.Success)
    );

  const backButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`crypto_back_${userId}`)
        .setLabel('← Voltar')
        .setStyle(ButtonStyle.Danger)
    );

  await interaction.update({ embeds: [embed], files: [attachment], components: [buttons, backButton] });
}

async function handleInvest(interaction, symbol, amount) {
  const userId = interaction.customId.split('_')[3];
  
  if (interaction.user.id !== userId) {
    return interaction.reply({ content: 'Apenas quem usou o comando pode investir', ephemeral: true });
  }

  const key = makeKey(interaction.guildId, interaction.user.id);
  let userData = economy.get(key);

  if (!userData) {
    userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
  }

  if (userData.coins < amount) {
    const embed = createEmbed(
      'Saldo Insuficiente',
      `> Você não tem coins suficientes!\n\n` +
      `**- Seu saldo:** \`${userData.coins}\` coins\n` +
      `**- Necessário:** \`${amount}\` coins`
    );
    embed.setColor('#FF0000');
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  const prices = getCurrentPrices();
  const crypto = CRYPTOS[symbol];

  // Desconta coins
  userData.coins -= amount;

  // Adiciona investimento
  if (!userData.cryptoInvestments) {
    userData.cryptoInvestments = [];
  }

  userData.cryptoInvestments.push({
    symbol: symbol,
    amount: amount,
    buyPrice: prices[symbol],
    timestamp: Date.now()
  });

  economy.set(key, userData);

  const embed = createEmbed(
    'Investimento Realizado',
    `> Você investiu em **${crypto.name}**!\n\n` +
    `**- Criptomoeda:** ${crypto.name} (${symbol})\n` +
    `**- Valor investido:** \`${amount}\` coins\n` +
    `**- Preço de compra:** \`${prices[symbol]}\` coins\n` +
    `**- Saldo restante:** \`${userData.coins}\` coins\n\n` +
    `> Use \`/coletar-investimento\` para acompanhar e coletar.`
  );
  embed.setColor('#00FF00');
  addServerFooter(embed, interaction.guild);

  await interaction.update({ embeds: [embed], components: [], files: [] });
}

async function handleCollectAll(interaction) {
  const userId = interaction.customId.split('_')[2];
  
  if (interaction.user.id !== userId) {
    return interaction.reply({ content: 'Apenas quem usou o comando pode coletar', ephemeral: true });
  }

  const key = makeKey(interaction.guildId, interaction.user.id);
  let userData = economy.get(key);

  if (!userData || !userData.cryptoInvestments || userData.cryptoInvestments.length === 0) {
    return interaction.reply({ content: 'Você não tem investimentos', ephemeral: true });
  }

  const prices = getCurrentPrices();
  let totalCollected = 0;
  let totalProfit = 0;

  for (const inv of userData.cryptoInvestments) {
    const currentPrice = prices[inv.symbol];
    const currentValue = (inv.amount / inv.buyPrice) * currentPrice;
    totalCollected += currentValue;
    totalProfit += (currentValue - inv.amount);
  }

  userData.coins += Math.floor(totalCollected);
  userData.cryptoInvestments = [];
  economy.set(key, userData);

  const embed = createEmbed(
    'Investimentos Coletados',
    `> Todos os seus investimentos foram coletados!\n\n` +
    `**- Total coletado:** \`${Math.floor(totalCollected)}\` coins\n` +
    `**- Lucro total:** \`${Math.floor(totalProfit)}\` coins\n` +
    `**- Saldo atual:** \`${userData.coins}\` coins`
  );
  embed.setColor(totalProfit >= 0 ? '#00FF00' : '#FF0000');
  addServerFooter(embed, interaction.guild);

  await interaction.update({ embeds: [embed], components: [] });
}

async function handleViewCharts(interaction) {
  const userId = interaction.customId.split('_')[2];
  
  if (interaction.user.id !== userId) {
    return interaction.reply({ content: 'Apenas quem usou o comando pode ver', ephemeral: true });
  }

  const key = makeKey(interaction.guildId, interaction.user.id);
  let userData = economy.get(key);

  if (!userData || !userData.cryptoInvestments || userData.cryptoInvestments.length === 0) {
    return interaction.reply({ content: 'Você não tem investimentos', ephemeral: true });
  }

  // Agrupa investimentos por símbolo
  const investmentsBySymbol = {};
  for (const inv of userData.cryptoInvestments) {
    if (!investmentsBySymbol[inv.symbol]) {
      investmentsBySymbol[inv.symbol] = [];
    }
    investmentsBySymbol[inv.symbol].push(inv);
  }

  const prices = getCurrentPrices();
  let description = '**Selecione uma criptomoeda para ver o gráfico:**\n\n';

  for (const [symbol, investments] of Object.entries(investmentsBySymbol)) {
    const crypto = CRYPTOS[symbol];
    let totalInvested = 0;
    let totalValue = 0;

    for (const inv of investments) {
      totalInvested += inv.amount;
      const currentValue = (inv.amount / inv.buyPrice) * prices[symbol];
      totalValue += currentValue;
    }

    const profit = totalValue - totalInvested;
    description += `**${crypto.name} (${symbol})**\n`;
    description += `- Investido: \`${totalInvested}\` coins\n`;
    description += `- Valor atual: \`${Math.floor(totalValue)}\` coins\n`;
    description += `- Lucro: \`${Math.floor(profit)}\` coins\n\n`;
  }

  const embed = createEmbed('Gráficos de Investimento', description);
  embed.setColor('#FFD700');
  addServerFooter(embed, interaction.guild);

  // Cria botões para cada criptomoeda
  const { ButtonBuilder, ButtonStyle } = require('discord.js');
  const buttons = [];
  
  for (const symbol of Object.keys(investmentsBySymbol)) {
    const crypto = CRYPTOS[symbol];
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`view_chart_${symbol}_${userId}`)
        .setLabel(crypto.name)
        .setStyle(ButtonStyle.Primary)
    );
  }

  const rows = [];
  // Divide em linhas de até 5 botões
  for (let i = 0; i < buttons.length; i += 5) {
    rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
  }

  // Adiciona botão de voltar
  const backButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`crypto_back_collect_${userId}`)
        .setLabel('← Voltar')
        .setStyle(ButtonStyle.Danger)
    );
  
  rows.push(backButton);

  await interaction.update({ embeds: [embed], components: rows, files: [] });
}

async function handleViewSpecificChart(interaction, symbol) {
  const userId = interaction.customId.split('_')[3];
  
  if (interaction.user.id !== userId) {
    return interaction.reply({ content: 'Apenas quem usou o comando pode ver', ephemeral: true });
  }

  const key = makeKey(interaction.guildId, interaction.user.id);
  let userData = economy.get(key);

  if (!userData || !userData.cryptoInvestments || userData.cryptoInvestments.length === 0) {
    return interaction.reply({ content: 'Você não tem investimentos', ephemeral: true });
  }

  // Filtra investimentos dessa moeda
  const investments = userData.cryptoInvestments.filter(inv => inv.symbol === symbol);
  
  if (investments.length === 0) {
    return interaction.reply({ content: 'Você não tem investimentos nesta moeda', ephemeral: true });
  }

  const crypto = CRYPTOS[symbol];
  const prices = getCurrentPrices();
  const history = getCryptoHistory(symbol);
  
  const chartBuffer = generateCryptoChart(symbol, history, prices[symbol], crypto.name);
  const attachment = new AttachmentBuilder(chartBuffer, { name: `${symbol}_chart.png` });

  // Calcula totais
  let totalInvested = 0;
  let totalValue = 0;

  for (const inv of investments) {
    totalInvested += inv.amount;
    const currentValue = (inv.amount / inv.buyPrice) * prices[symbol];
    totalValue += currentValue;
  }

  const profit = totalValue - totalInvested;

  const embed = createEmbed(
    `Gráfico - ${crypto.name}`,
    `**- Investido:** \`${totalInvested}\` coins\n` +
    `**- Valor atual:** \`${Math.floor(totalValue)}\` coins\n` +
    `**- Lucro:** \`${Math.floor(profit)}\` coins`
  );
  embed.setImage(`attachment://${symbol}_chart.png`);
  embed.setColor(profit >= 0 ? '#00FF00' : '#FF0000');
  addServerFooter(embed, interaction.guild);

  const { ButtonBuilder, ButtonStyle } = require('discord.js');
  const backButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`view_charts_back_${userId}`)
        .setLabel('← Voltar')
        .setStyle(ButtonStyle.Danger)
    );

  await interaction.update({ embeds: [embed], files: [attachment], components: [backButton] });
}

async function handleBackToInvest(interaction) {
  const userId = interaction.customId.split('_')[2];
  
  if (interaction.user.id !== userId) {
    return interaction.reply({ content: 'Apenas quem usou o comando pode voltar', ephemeral: true });
  }

  // Recarrega o menu de investir
  const { StringSelectMenuBuilder } = require('discord.js');
  const prices = getCurrentPrices();
  
  let description = '**Mercado de Criptomoedas**\n\n';
  
  for (const [symbol, crypto] of Object.entries(CRYPTOS)) {
    description += `**${crypto.name} (${symbol})**\n`;
    description += `- Preço: \`${prices[symbol]}\` coins\n`;
    description += `- Volatilidade: ${crypto.volatility}%\n\n`;
  }
  
  description += '> Selecione uma criptomoeda para ver o gráfico e investir.';

  const embed = createEmbed('Investir em Criptomoedas', description);
  embed.setColor('#FFD700');
  addServerFooter(embed, interaction.guild);

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`crypto_select_${userId}`)
    .setPlaceholder('Selecione uma criptomoeda')
    .addOptions(
      Object.entries(CRYPTOS).map(([symbol, crypto]) => ({
        label: `${crypto.name} (${symbol})`,
        description: `${prices[symbol]} coins - Volatilidade ${crypto.volatility}%`,
        value: symbol
      }))
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.update({ embeds: [embed], components: [row], files: [] });
}

async function handleBackToCollect(interaction) {
  const userId = interaction.customId.split('_')[3];
  
  if (interaction.user.id !== userId) {
    return interaction.reply({ content: 'Apenas quem usou o comando pode voltar', ephemeral: true });
  }

  // Recarrega a lista de investimentos
  const key = makeKey(interaction.guildId, interaction.user.id);
  let userData = economy.get(key);

  if (!userData || !userData.cryptoInvestments || userData.cryptoInvestments.length === 0) {
    return interaction.reply({ content: 'Você não tem investimentos', ephemeral: true });
  }

  const prices = getCurrentPrices();
  let description = '**Seus Investimentos**\n\n';
  let totalValue = 0;
  let totalProfit = 0;

  for (const inv of userData.cryptoInvestments) {
    const crypto = CRYPTOS[inv.symbol];
    const currentPrice = prices[inv.symbol];
    const currentValue = (inv.amount / inv.buyPrice) * currentPrice;
    const profit = currentValue - inv.amount;
    
    totalValue += currentValue;
    totalProfit += profit;

    description += `**${crypto.name} (${inv.symbol})**\n`;
    description += `- Investido: \`${inv.amount}\` coins\n`;
    description += `- Valor atual: \`${Math.floor(currentValue)}\` coins\n`;
    description += `- Lucro: \`${Math.floor(profit)}\` coins\n\n`;
  }

  description += `**Total**\n`;
  description += `- Valor total: \`${Math.floor(totalValue)}\` coins\n`;
  description += `- Lucro total: \`${Math.floor(totalProfit)}\` coins`;

  const embed = createEmbed('Seus Investimentos', description);
  embed.setColor(totalProfit >= 0 ? '#00FF00' : '#FF0000');
  addServerFooter(embed, interaction.guild);

  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`collect_all_${userId}`)
        .setLabel('Coletar Tudo')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`view_charts_${userId}`)
        .setLabel('Ver Gráficos')
        .setStyle(ButtonStyle.Primary)
    );

  await interaction.update({ embeds: [embed], components: [buttons], files: [] });
}

module.exports = {
  handleCryptoSelect,
  handleInvest,
  handleCollectAll,
  handleViewCharts,
  handleViewSpecificChart,
  handleBackToInvest,
  handleBackToCollect
};
