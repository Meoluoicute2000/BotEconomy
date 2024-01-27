const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

module.exports = {
  name: 'givemoney',
  description: 'Chuyển tiền từ ví cho người khác.',
  options: [
    {
      name: 'target',
      description: 'Người nhận',
      required: true,
      type: 'USER'
    },
    {
      name: 'amount',
      description: 'Số tiền',
      required: true,
      type: 'NUMBER'
    }
  ],
  category: 'Kinh tế',
  async run({ interaction, options, bot, guild }) {
    const targetUser = options.getUser('target');
    const amount = options.getNumber('amount');

    // Giới hạn số tiền tặng là 1000000000^^
    if (amount > 1000000000) {
      return await interaction.reply({
        embeds: [new MessageEmbed().setColor('BLURPLE').setDescription('Bạn chỉ có thể chuyển tối đa 1000000000 :coin: cho người khác.')]
      });
    }

    const senderProfile = await Profile.findOne({ UserID: interaction.user.id, GuildID: guild.id });
    const targetProfile = await Profile.findOne({ UserID: targetUser.id, GuildID: guild.id });

    if (!senderProfile) {
      await createProfile(interaction.user, guild);
      return await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`*Đang tạo hồ sơ của bạn. . .*\n \n**Sử dụng lệnh này một lần nữa để chuyển tiền.**`)
        ]
      });
    }

    if (!targetProfile) {
      return await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`Người nhận không có hồ sơ. Hãy yêu cầu họ sử dụng lệnh này để tạo hồ sơ.`)
        ]
      });
    }

    if (senderProfile.Wallet < amount) {
      return await interaction.reply({
        embeds: [new MessageEmbed().setColor('BLURPLE').setDescription('Bạn không có đủ tiền để chuyển.')]
      });
    }

    // Cập nhật số tiền cho người gửi và người nhận
    await Profile.updateOne(
      { UserID: interaction.user.id, GuildID: guild.id },
      { $inc: { Wallet: -amount } }
    );
    await Profile.updateOne(
      { UserID: targetUser.id, GuildID: guild.id },
      { $inc: { Wallet: amount } }
    );

    return await interaction.reply({
      embeds: [new MessageEmbed().setColor('BLURPLE').setDescription(`Đã chuyển ${amount} :coin: cho ${targetUser.tag}`)]
    });
  }
};
