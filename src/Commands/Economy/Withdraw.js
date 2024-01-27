const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

module.exports = {
  name: 'withdraw',
  description: 'Rút tiền của bạn từ ngân hàng vào ví.',
  options: [
    {
      name: 'amount',
      description: 'Số tiền',
      required: true,
      type: 'NUMBER'
    }
  ],
  category: 'Kinh tế',
  async run({ interaction, options, bot, guild }) {
    const profile = await Profile.find({ UserID: interaction.user.id, GuildID: guild.id });
    if (!profile.length) {
      await createProfile(interaction.user, guild);
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`*Đang tạo hồ sơ của bạn. . .*\n \n**Sử dụng lệnh này một lần nữa để kiểm tra số dư của bạn.**`)
        ]
      });
    } else {
      const amount = options.getNumber('amount');
      if (amount > profile[0].Bank) {
        await interaction.reply({
          embeds: [new MessageEmbed().setColor('BLURPLE').setDescription(`Bạn không có đủ tiền để rút!`)]
        });
      } else {
        await Profile.updateOne(
          { UserID: interaction.user.id, GuildID: guild.id },
          { $inc: { Wallet: amount, Bank: -amount } }
        );
        await interaction.reply({
          embeds: [new MessageEmbed().setColor('BLURPLE').setDescription(`Đã rút ${amount} :coin: từ ngân hàng`)]
        });
      }
    }
  }
};
