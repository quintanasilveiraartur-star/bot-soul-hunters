const { economy } = require('../../utils/db');
const { createEmbed, addServerFooter, makeKey } = require('../../utils/helpers');

module.exports = {
  data: {
    name: 'doar',
    description: 'Doar coins para outro usuário',
    options: [
      {
        name: 'usuario',
        description: 'Usuário que receberá as coins',
        type: 6,
        required: true
      },
      {
        name: 'quantidade',
        description: 'Quantidade de coins para doar',
        type: 4,
        required: true,
        minValue: 1
      }
    ]
  },

  async execute(interaction) {
    const recipient = interaction.options.getUser('usuario');
    const amount = interaction.options.getInteger('quantidade');
    const donor = interaction.user;

    // Verifica se está tentando doar para si mesmo
    if (recipient.id === donor.id) {
      const errorEmbed = createEmbed(
        'Erro',
        '> Você não pode doar coins para si mesmo!'
      );
      addServerFooter(errorEmbed, interaction.guild);
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Verifica se está tentando doar para um bot
    if (recipient.bot) {
      const errorEmbed = createEmbed(
        'Erro',
        '> Você não pode doar coins para bots!'
      );
      addServerFooter(errorEmbed, interaction.guild);
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const donorKey = makeKey(interaction.guildId, donor.id);
    const recipientKey = makeKey(interaction.guildId, recipient.id);

    // Pega dados do doador
    let donorData = economy.get(donorKey);
    if (!donorData) {
      donorData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    // Verifica se o doador tem coins suficientes
    if (donorData.coins < amount) {
      const errorEmbed = createEmbed(
        'Saldo Insuficiente',
        `> Você não tem coins suficientes para doar!\n\n` +
        `**• Seu saldo:** \`${donorData.coins}\` coins\n` +
        `**• Tentou doar:** \`${amount}\` coins\n` +
        `**• Faltam:** \`${amount - donorData.coins}\` coins`
      );
      addServerFooter(errorEmbed, interaction.guild);
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Pega dados do receptor
    let recipientData = economy.get(recipientKey);
    if (!recipientData) {
      recipientData = { coins: 0, lastDaily: 0, lastWeekly: 0 };
    }

    // Salva saldos anteriores
    const donorOldBalance = donorData.coins;
    const recipientOldBalance = recipientData.coins;

    // Realiza a transação
    donorData.coins -= amount;
    recipientData.coins += amount;

    // Salva no banco de dados
    economy.set(donorKey, donorData);
    economy.set(recipientKey, recipientData);

    // Mensagem de sucesso
    const successEmbed = createEmbed(
      'Doação Realizada',
      `**${donor.username}** doou **${amount}** coins para **${recipient.username}**!\n\n` +
      `**Doador: ${donor.username}**\n` +
      `> • Tinha: \`${donorOldBalance}\` coins\n` +
      `> • Tem agora: \`${donorData.coins}\` coins\n\n` +
      `**Receptor: ${recipient.username}**\n` +
      `> • Tinha: \`${recipientOldBalance}\` coins\n` +
      `> • Tem agora: \`${recipientData.coins}\` coins`
    );
    successEmbed.setColor('#00FF00');
    addServerFooter(successEmbed, interaction.guild);

    await interaction.reply({ embeds: [successEmbed] });
  }
};
