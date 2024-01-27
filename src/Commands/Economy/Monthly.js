const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

module.exports = {
  name: 'monthly',
  description: 'Nhận lợi nhuận hàng tháng. Hạn chế sử dụng mỗi 30 ngày.',
  category: 'Kinh tế',
  async run({ interaction, options, bot, guild }) {
    const profile = await Profile.findOneAndUpdate(
      { UserID: interaction.user.id, GuildID: guild.id },
      {},
      { upsert: true, new: true }
    );

    if (!profile.lastMonthly) {
      await Profile.updateOne(
        { UserID: interaction.user.id, GuildID: guild.id },
        { $set: { lastMonthly: Date.now() } }
      );
      const monthlyAmount = 500;
      await Profile.updateOne({ UserID: interaction.user.id, GuildID: guild.id }, { $inc: { Wallet: monthlyAmount } });
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setTitle(`Lợi Nhuận Hàng Tháng của **${interaction.user.username}**`)
            .setDescription(`*Bạn đã nhận* **${monthlyAmount}** :coin: *lợi nhuận hàng tháng của mình.*\n*Hãy trở lại vào tháng sau để nhận thêm.*`)
        ]
      });
    } else {
      const cooldownDuration = 30 * 24 * 60 * 60 * 1000; // 30 ngày
      const timeLeft = cooldownDuration - (Date.now() - profile.lastMonthly);

      if (timeLeft <= 0) {
        await Profile.updateOne(
          { UserID: interaction.user.id, GuildID: guild.id },
          { $set: { lastMonthly: Date.now() } }
        );
        const monthlyAmount = Math.floor(Math.random() * (500000 - 100000 + 1)) + 100000; // Random từ 100000 đến 500000
        await Profile.updateOne({ UserID: interaction.user.id, GuildID: guild.id }, { $inc: { Wallet: monthlyAmount } });
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setTitle(`Lợi Nhuận Hàng Tháng của **${interaction.user.username}**`)
              .setDescription(`*Bạn đã nhận lợi nhuận hàng tháng của mình.*`)
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
              .setTitle(`Lợi Nhuận Hàng Tháng của ${interaction.user.username}`)
              .setDescription(`*Bạn cần phải đợi* **${days} ngày** **${hours} giờ** **${minutes} phút** *trước khi nhạna lợi nhuận hàng tháng của bạn*`)
          ]
        });
      }
    }
  }
};
