const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey, replyError } = require('../../utils/helpers');
const { CRYPTOS, getCurrentPrices, getCryptoHistory } = require('../../utils/cryptoMarket');
const { generateCryptoChart } = require('../../utils/cryptoChart');

module.exports = {
  data: {
    name: 'coletar-investimento',
    description: 'Analisa e coleta seus investimentos em criptomoedas'
  },

  async execute(interaction) {
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    if (!userData.cryptoInvestments || userData.cryptoInvestments.length === 0) {
      return replyError(interaction, 'Você não tem investimentos ativos');
    }

    const prices = getCurrentPrices();
    let totalInvested = 0;
    let totalCurrent = 0;
    let investmentInfo = '';

    for (const inv of userData.cryptoInvestments) {
      const crypto = CRYPTOS[inv.symbol];
      const currentPrice = prices[inv.symbol];
      const currentValue = (inv.amount / inv.buyPrice) * currentPrice;
      const profit = currentValue - inv.amount;
      const profitPercent = ((currentValue - inv.amount) / inv.amount) * 100;

      totalInvested += inv.amount;
      totalCurrent += currentValue;

      const profitSign = profit >= 0 ? '+' : '';
      const profitColor = profit >= 0 ? '📈' : '📉';

      investmentInfo += `**${crypto.name} (${inv.symbol})**\n`;
      investmentInfo += `> Investido: \`${inv.amount}\` coins\n`;
      investmentInfo += `> Valor atual: \`${Math.floor(currentValue)}\` coins\n`;
      investmentInfo += `> Lucro: ${profitSign}\`${Math.floor(profit)}\` coins (${profitSign}${profitPercent.toFixed(2)}%) ${profitColor}\n\n`;
    }

    const totalProfit = totalCurrent - totalInvested;
    const totalProfitPercent = ((totalCurrent - totalInvested) / totalInvested) * 100;

    const embed = createEmbed(
      'Seus Investimentos',
      investmentInfo +
      `**Total**\n` +
      `> Investido: \`${Math.floor(totalInvested)}\` coins\n` +
      `> Valor atual: \`${Math.floor(totalCurrent)}\` coins\n` +
      `> Lucro total: \`${Math.floor(totalProfit)}\` coins (${totalProfitPercent.toFixed(2)}%)\n\n` +
      `> Use os botões abaixo para coletar tudo ou ver gráficos.`
    );
    embed.setColor(totalProfit >= 0 ? '#00FF00' : '#FF0000');
    addServerFooter(embed, interaction.guild);

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`collect_all_${interaction.user.id}`)
          .setLabel('Coletar Tudo')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`view_charts_${interaction.user.id}`)
          .setLabel('Ver Gráficos')
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({ embeds: [embed], components: [buttons] });
  }
};
