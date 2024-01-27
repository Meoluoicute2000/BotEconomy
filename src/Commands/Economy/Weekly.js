const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

module.exports = {
  name: 'weekly',
  description: 'Nhận lợi nhuận hàng tuần. Có thời gian chờ 7 ngày.',
  category: 'Kinh tế',
  async run({ interaction, options, bot, guild }) {
    const profile = await Profile.find({ UserID: interaction.user.id, GuildID: guild.id });
    if (!profile.length) {
      await createProfile(interaction.user, guild);
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`*Đang tạo hồ sơ của bạn. . .*\n \n**Sử dụng lệnh này một lần nữa để nhận lợi nhuận hàng tuần.**`)
        ]
      });
    } else {
      if (!profile[0].lastWeekly) {
        await Profile.updateOne(
          { UserID: interaction.user.id, GuildID: guild.id },
          { $set: { lastWeekly: Date.now() } }
        );
        const weeklyAmount = Math.floor(Math.random() * (50000 - 10000 + 1)) + 10000; // Random từ 10000 đến 50000
        await Profile.updateOne({ UserID: interaction.user.id, GuildID: guild.id }, { $inc: { Wallet: weeklyAmount } });
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setTitle(`Lợi Nhuận Hàng Tuần của **${interaction.user.username}**`)
              .setDescription(`*Bạn đã nhận* **${weeklyAmount}** :coin: *tiền lợi nhuận hàng tuần của mình.*\n*Hãy đợi đến tuần sau để nhận thêm.*`)
          ]
        });
      } else {
        const lastWeekly = new Date(profile[0].lastWeekly);
        const cooldownDuration = 7 * 24 * 60 * 60 * 1000; // 7 ngày
        const timeLeft = cooldownDuration - (Date.now() - lastWeekly.getTime());

        if (timeLeft <= 0) {
          await Profile.updateOne(
            { UserID: interaction.user.id, GuildID: guild.id },
            { $set: { lastWeekly: Date.now() } }
          );
          const weeklyAmount = Math.floor(Math.random() * (50000 - 10000 + 1)) + 10000; // Random từ 10000 đến 50000
          await Profile.updateOne({ UserID: interaction.user.id, GuildID: guild.id }, { $inc: { Wallet: weeklyAmount } });
          await interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor('BLURPLE')
                .setTitle(`Lợi Nhuận Hàng Tuần của **${interaction.user.username}**`)
                .setDescription(`*Bạn đã nhận* **${weeklyAmount}** :coin: *tiền lợi nhuận hàng tuần của mình.*`)
            ]
          });
        } else {
          const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
          const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
          const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
          await interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor('BLURPLE')
                .setTitle(`Lợi Nhuận Hàng Tuần của **${interaction.user.username}**`)
                .setDescription(
                  `*Bạn cần phải đợi thêm* **${days} ngày** **${hours} giờ** **${minutes} phút** *trước khi có thể nhận lợi nhuận hàng tuần của bạn.*`
                )
            ]
          });
        }
      }
    }
  }
};
