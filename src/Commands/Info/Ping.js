const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'ping',
  description: "Hiển thị độ trễ của Bot lúc này.",
  category: 'Thông tin',
  async run({ interaction, bot }) {
    const message = await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor('BLURPLE')
          .setDescription('Pinging...Độ trễ của Bot.')
      ],
      fetchReply: true
    });

    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setColor('BLURPLE')
          .addField('API Pong', `${Math.round(bot.ws.ping)} ms`)
          .addField('Độ trễ', `${Date.now() - message.createdTimestamp} ms`)
          .addField('Thời gian hoạt động', `<t:${Math.floor((Date.now() - bot.uptime) / 1000)}:R>`, false)
      ]
    });
  }
};
