const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

const workCooldowns = new Map();

module.exports = {
  name: 'working',
  description: 'Chỉ có làm thì mới có ăn. Hạn chế sử dụng mỗi 5 phút.',
  category: 'Kinh tế',
  async run({ interaction, options, bot, guild }) {
    const profile = await Profile.find({ UserID: interaction.user.id, GuildID: guild.id });
    if (!profile.length) {
      await createProfile(interaction.user, guild);
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`*Đang tạo hồ sơ của bạn. . .*\n \n**Sử dụng lệnh này một lần nữa để làm việc.**`)
        ]
      });
    } else {
      if (workCooldowns.has(interaction.user.id)) {
        const cooldownExpiration = workCooldowns.get(interaction.user.id);
        if (Date.now() < cooldownExpiration) {
          const timeLeft = Math.ceil((cooldownExpiration - Date.now()) / 1000);
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
          return interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor('BLURPLE')
                .setTitle(`Tiền Làm Việc của **${interaction.user.username}**`)
                .setDescription(`*Bạn cần phải đợi thêm* **${minutes} phút** **${seconds} giây** *trước khi có thể nhận tiền khi lao động của bạn.*`)
            ],
          });
        }
      }

      const cooldownDuration = 5 * 60 * 1000; // 5 phút
      workCooldowns.set(interaction.user.id, Date.now() + cooldownDuration);

      const dailyAmount = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
      await Profile.updateOne({ UserID: interaction.user.id, GuildID: guild.id }, { $inc: { Wallet: dailyAmount } });

      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setTitle(`Tiền Làm Việc của **${interaction.user.username}**`)
            .setDescription(`*Bạn đã nhận* **${dailyAmount}** :coin: *tiền lao động.*\n*Hãy đợi trong **5 phút** để có thể lao động lại.*`)
        ]
      });
    }
  }
};
