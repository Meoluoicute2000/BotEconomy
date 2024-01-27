const { MessageEmbed } = require('discord.js');
module.exports = {
  name: 'avatar',
  description: "Hiển thị avatar của người dùng.",
  options: [
    {
      name: 'user',
      description: 'Đề cập đến người dùng.',
      required: false,
      type: 'USER'
    }
  ],
  category: 'Tiện ích',
  async run({ interaction, bot }) {
    const user = interaction.options.getMember('user') || interaction.member;
    await user.user.fetch(true);
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor('#5865F2')
          .setImage(
            user.displayAvatarURL({ dynamic: true }) ||
              'https://i.pinimg.com/736x/35/79/3b/35793b67607923a68d813a72185284fe.jpg'
          )
      ]
    });
  }
};
