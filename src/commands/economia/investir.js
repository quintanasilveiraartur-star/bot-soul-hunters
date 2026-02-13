const { ActionRowBuilder, StringSelectMenuBuilder, AttachmentBuilder } = require('discord.js');
const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError } = require('../../utils/helpers');
const { CRYPTOS, getCurrentPrices, getCryptoHistory, getPriceChange } = require('../../utils/cryptoMarket');
const { generateCryptoChart } = require('../../utils/cryptoChart');

module.exports = {
  data: {
    name: 'investir',
    description: 'Investe em criptomoedas'
  },

  async execute(interaction) {
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    const prices = getCurrentPrices();
    
    // Cria embed com mercado
    let marketInfo = '**Mercado de Criptomoedas**\n\n';
    
    for (const [symbol, crypto] of Object.entries(CRYPTOS)) {
      const price = prices[symbol];
      const change = getPriceChange(symbol);
      const changeEmoji = change >= 0 ? '📈' : '📉';
      const changeSign = change >= 0 ? '+' : '';
      
      marketInfo += `**${crypto.name} (${symbol})**\n`;
      marketInfo += `> Preço: \`${price}\` coins\n`;
      marketInfo += `> Variação: ${changeSign}${change.toFixed(2)}% ${changeEmoji}\n\n`;
    }

    const embed = createEmbed(
      'Investir em Criptomoedas',
      marketInfo + 
      `**Seu saldo:** \`${userData.coins}\` coins\n\n` +
      `> Selecione uma criptomoeda abaixo para ver o gráfico e investir.`
    );
    embed.setColor('#FFD700');
    addServerFooter(embed, interaction.guild);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`crypto_select_${interaction.user.id}`)
      .setPlaceholder('Selecione uma criptomoeda')
      .addOptions(
        Object.entries(CRYPTOS).map(([symbol, crypto]) => ({
          label: `${crypto.name} (${symbol})`,
          description: `${prices[symbol]} coins - ${getPriceChange(symbol).toFixed(2)}%`,
          value: symbol
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
