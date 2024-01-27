const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

module.exports = {
  name: 'daily',
  description: 'Nhận tiền hàng ngày. Hạn chế sử dụng mỗi 24 giờ.',
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
      if (!profile[0].lastDaily) {
        await Profile.updateOne(
          { UserID: interaction.user.id, GuildID: guild.id },
          { $set: { lastDaily: Date.now() } }
        );
        const randomAmount = Math.floor(Math.random() * (100000 - 20000 + 1)) + 20000; // Số tiền ngẫu nhiên từ 2000 đến 10000
        await Profile.updateOne({ UserID: interaction.user.id, GuildID: guild.id }, { $inc: { Wallet: randomAmount } });
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setTitle(`Tiền hàng ngày của **${interaction.user.username}**`)
              .setDescription(`*Bạn đã nhận* **${randomAmount}** :coin: *tiền hàng ngày của mình.*\n*Hãy trở lại vào ngày mai để nhận thêm.*`)
          ]
        });
      } else if (Date.now() - profile[0].lastDaily > 86400000) {
        await Profile.updateOne(
          { UserID: interaction.user.id, GuildID: guild.id },
          { $set: { lastDaily: Date.now() } }
        );
        const randomAmount = Math.floor(Math.random() * (10000 - 2000 + 1)) + 2000; // Số tiền ngẫu nhiên từ 2000 đến 10000
        await Profile.updateOne({ UserID: interaction.user.id, GuildID: guild.id }, { $inc: { Wallet: randomAmount } });
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setTitle(`Tiền hàng ngày của **${interaction.user.username}**`)
              .setDescription(`*Bạn đã nhận* **${randomAmount}** :coin: *tiền hàng ngày của mình.*`)
          ]
        });
      } else {
        const lastDaily = new Date(profile[0].lastDaily);
        const timeLeft = Math.round((lastDaily.getTime() + 86400000 - Date.now()) / 1000);
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft - hours * 3600) / 60);
        const seconds = timeLeft - hours * 3600 - minutes * 60;
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setTitle(`Tiền hàng ngày của **${interaction.user.username}**`)
              .setDescription(
                `*Bạn cần phải đợi* **${hours} giờ** **${minutes} phút** **${seconds} giây** *trước khi có thể nhận tiền hàng ngày của bạn.*`
              )
          ]
        });
      }
    }
  }
};
