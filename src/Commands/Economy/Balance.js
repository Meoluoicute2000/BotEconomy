const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

module.exports = {
  name: 'balance',
  description: "Kiểm tra số tiền của người dùng.",
  options: [
    {
      name: 'user',
      description: 'Đề cập đến người dùng.',
      required: false,
      type: 'USER'
    }
  ],
  category: 'Kinh tế',
  async run({ interaction, options, bot, guild }) {
    const user = options.getUser('user') || interaction.user;

    const profile = await Profile.find({ UserID: user.id, GuildID: guild.id });
    if (!profile.length) {
      if (user !== interaction.user) return interaction.reply(`${user} không có hồ sơ.`); // Ngăn chặn người khác tạo hồ sơ cho người dùng khác.

      await createProfile(interaction.user, guild);
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`*Đang tạo hồ sơ của bạn. . .*\n \n**Sử dụng lệnh này một lần nữa để kiểm tra số dư của bạn.**`)
        ]
      });
    } else {
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setTitle(`Số dư của ${user.username}`)
            .setDescription(`**Ví:** ${profile[0].Wallet} :coin:\n \n**Ngân hàng:** ${profile[0].Bank} :coin:`)
        ]
      });
    }
  }
};
