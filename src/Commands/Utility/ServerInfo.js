const { MessageEmbed } = require('discord.js');
module.exports = {
  name: 'serverinfo',
  description: 'Hiển thị thông tin về máy chủ.',
  category: 'Tiện ích',
  async run({ interaction, bot, guild }) {
    const owner = await guild.fetchOwner();
    const channels = await guild.channels.fetch();
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor('BLURPLE')
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL() || 'https://i.pinimg.com/736x/35/79/3b/35793b67607923a68d813a72185284fe.jpg'
          })
          .setThumbnail(guild.iconURL() || 'https://i.pinimg.com/736x/35/79/3b/35793b67607923a68d813a72185284fe.jpg')
          .addField('Tạo máy chủ', `<t:${Math.round(guild.createdTimestamp / 1000)}:f>`, false)
          .addField('Sở hữu bởi', `${owner}`, false)
          .addField('Tổng số thành viên', `${guild.memberCount}`, false)
          .addField('Tổng số kênh', `${channels.size}`, false)
          .setFooter({
            text: `ID của server đó là: ${guild.id}`
          })
      ]
    });
  }
};