const { MessageEmbed } = require('discord.js');
const weather = require('weather-js');
module.exports = {
  name: 'weather',
  description: 'Hiển thị thông tin thời tiết theo thời gian thực',
  options: [
    {
      name: 'location',
      description: 'Cung cấp thông tin về thành phố.',
      required: true,
      type: 'STRING'
    }
  ],
  category: 'Tiện ích',
  async run({ interaction, bot }) {
    const location = interaction.options.getString('location');
    weather.find({ search: location, degreeType: 'C' }, function (err, result) {
      if (err) return;
      if (result.length === 0)
        return interaction.reply({ content: 'Xin vui lòng cung cấp thành phố', ephemeral: true });
      var current = result[0].current;
      var location = result[0].location;
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({ name: `Thời tiết của: ${current.observationpoint}` })
            .setColor('BLURPLE')
            .setThumbnail(current.imageUrl)
            .addField('Múi giờ hiện tại', `UTC ${location.timezone}`, true)
            .addField('Nhiệt độ', `${current.temperature}°`, true)
            .addField('Cảm thấy', `${current.feelslike}°`, true)
            .addField('Tốc độ gió', `${current.winddisplay}`, true)
            .addField('Độ ẩm', `${current.humidity}%`, true)
            .addField('Thứ và ngày', `${current.day} ${current.date}`, true)
            .setFooter({ text: `${current.skytext}` })
        ]
      });
    });
  }
};