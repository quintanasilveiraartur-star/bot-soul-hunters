const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'banco',
    description: 'Gerencie suas coins no banco',
    options: [
      {
        name: 'acao',
        description: 'Ação a realizar',
        type: 3,
        required: true,
        choices: [
          { name: 'Ver Saldo', value: 'saldo' },
          { name: 'Depositar', value: 'depositar' },
          { name: 'Sacar', value: 'sacar' }
        ]
      },
      {
        name: 'quantia',
        description: 'Quantia (use "tudo" para depositar/sacar tudo)',
        type: 3,
        required: false
      }
    ]
  },

  async execute(interaction) {
    const acao = interaction.options.getString('acao');
    const quantiaStr = interaction.options.getString('quantia');
    
    const key = makeKey(interaction.guildId, interaction.user.id);
    let userData = economy.get(key);

    if (!userData) {
      userData = { coins: 0, bank: 0, lastBankInterest: Date.now() };
    }

    if (!userData.bank) userData.bank = 0;
    if (!userData.lastBankInterest) userData.lastBankInterest = Date.now();

    // Calcula juros (0.5% por dia)
    const now = Date.now();
    const daysPassed = Math.floor((now - userData.lastBankInterest) / (24 * 60 * 60 * 1000));
    
    if (daysPassed > 0 && userData.bank > 0) {
      const interest = Math.floor(userData.bank * 0.005 * daysPassed);
      userData.bank += interest;
      userData.lastBankInterest = now;
      economy.set(key, userData);
    }

    if (acao === 'saldo') {
      const embed = createEmbed(
        'Banco',
        `> Suas finanças estão seguras aqui!\n\n` +
        `**- Carteira:** \`${userData.coins}\` coins\n` +
        `**- Banco:** \`${userData.bank}\` coins\n` +
        `**- Total:** \`${userData.coins + userData.bank}\` coins\n\n` +
        `> O banco rende **0.5% ao dia** e protege contra roubos.`
      );
      embed.setColor('#FFD700');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (!quantiaStr) {
      const embed = createEmbed(
        'Erro',
        `> Você precisa especificar uma quantia!\n\n` +
        `**- Use:** \`/banco ${acao} quantia:1000\`\n` +
        `**- Ou:** \`/banco ${acao} quantia:tudo\``
      );
      embed.setColor('#FF0000');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    let quantia;
    if (quantiaStr.toLowerCase() === 'tudo') {
      quantia = acao === 'depositar' ? userData.coins : userData.bank;
    } else {
      quantia = parseInt(quantiaStr);
      if (isNaN(quantia) || quantia <= 0) {
        const embed = createEmbed(
          'Erro',
          `> Quantia inválida!\n\n` +
          `**- Use um número positivo ou "tudo"**`
        );
        embed.setColor('#FF0000');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    if (acao === 'depositar') {
      if (userData.coins < quantia) {
        const embed = createEmbed(
          'Saldo Insuficiente',
          `> Você não tem coins suficientes!\n\n` +
          `**- Seu saldo:** \`${userData.coins}\` coins\n` +
          `**- Necessário:** \`${quantia}\` coins`
        );
        embed.setColor('#FF0000');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      userData.coins -= quantia;
      userData.bank += quantia;
      economy.set(key, userData);

      const embed = createEmbed(
        'Depósito Realizado',
        `> Coins depositadas com sucesso!\n\n` +
        `**- Depositado:** \`${quantia}\` coins\n` +
        `**- Carteira:** \`${userData.coins}\` coins\n` +
        `**- Banco:** \`${userData.bank}\` coins`
      );
      embed.setColor('#00FF00');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (acao === 'sacar') {
      if (userData.bank < quantia) {
        const embed = createEmbed(
          'Saldo Insuficiente',
          `> Você não tem coins suficientes no banco!\n\n` +
          `**- Saldo no banco:** \`${userData.bank}\` coins\n` +
          `**- Necessário:** \`${quantia}\` coins`
        );
        embed.setColor('#FF0000');
        addServerFooter(embed, interaction.guild);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      userData.bank -= quantia;
      userData.coins += quantia;
      economy.set(key, userData);

      const embed = createEmbed(
        'Saque Realizado',
        `> Coins sacadas com sucesso!\n\n` +
        `**- Sacado:** \`${quantia}\` coins\n` +
        `**- Carteira:** \`${userData.coins}\` coins\n` +
        `**- Banco:** \`${userData.bank}\` coins`
      );
      embed.setColor('#00FF00');
      addServerFooter(embed, interaction.guild);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
