const { MessageEmbed, Permissions } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

module.exports = {
  name: 'removemoney',
  description: 'Trừ tiền của người được chỉ định.',
  options: [
    {
      name: 'target',
      description: 'Người bị trừ tiền',
      required: true,
      type: 'USER'
    },
    {
      name: 'amount',
      description: 'Số tiền (tối đa 1000000000)',
      required: true,
      type: 'NUMBER'
    }
  ],
  category: 'Kinh tế',
  async run({ interaction, options, bot, guild }) {
    const isBotOwner = interaction.user.id === '827533541113069609';

    if (!isBotOwner) {
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('BLURPLE').setDescription('Chỉ chủ sở hữu bot mới có quyền sử dụng lệnh này.')]
      });
    }

    const targetUser = options.getUser('target');
    const amount = options.getNumber('amount');

    const targetProfile = await Profile.findOne({ UserID: targetUser.id, GuildID: guild.id });

    if (!targetProfile) {
      await createProfile(targetUser, guild);
    }

    // Giới hạn số tiền trừ là 1000000000^^
    if (amount <= 0 || amount > 1000000000) {
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('BLURPLE').setDescription('Số tiền không hợp lệ.')]
      });
    }

    if (amount > targetProfile.Wallet) {
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('BLURPLE').setDescription('Người này không có đủ tiền để trừ.')]
      });
    }

    await Profile.updateOne(
      { UserID: targetUser.id, GuildID: guild.id },
      { $inc: { Wallet: -amount } }
    );

    return interaction.reply({
      embeds: [
        new MessageEmbed().setColor('BLURPLE').setDescription(`Đã trừ ${amount} :coin: của ${targetUser.username}.`)
      ]
    });
  }
};
