const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

module.exports = {
  name: 'deposit',
  description: 'Nạp tiền từ ví của bạn vào ngân hàng.',
  options: [
    {
      name: 'amount',
      description: 'Xác định số tiền.',
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
            .setDescription(`*Đang tạo hồ sơ của bạn. . .*\n \n**Sử dụng lệnh này một lần nữa để nạp tiền.**`)
        ]
      });
    } else {
      const amount = options.getNumber('amount');
      if (amount > profile[0].Wallet) {
        await interaction.reply({
          embeds: [new MessageEmbed().setColor('BLURPLE').setDescription(`*Bạn không đủ tiền để nạp.*`)]
        });
      } else {
        await Profile.updateOne(
          { UserID: interaction.user.id, GuildID: guild.id },
          { $inc: { Wallet: -amount, Bank: amount } }
        );
        await interaction.reply({
          embeds: [new MessageEmbed().setColor('BLURPLE').setDescription(`*Nạp thành công* **${amount}** :coin: *vào ngân hàng.*`)]
        });
      }
    }
  }
};
