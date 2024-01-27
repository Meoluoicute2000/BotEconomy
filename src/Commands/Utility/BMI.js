const { MessageEmbed } = require('discord.js');
module.exports = {
  name: 'bmi',
  description: 'Tính chỉ số BMI của bạn.',
  options: [
    {
      name: 'weight',
      description: 'Cung cấp cân nặng của bạn tính bằng kilogram.',
      required: true,
      type: 'INTEGER'
    },
    {
      name: 'height',
      description: 'Cung cấp chiều cao của bạn tính bằng centimet.',
      required: true,
      type: 'INTEGER'
    }
  ],
  category: 'Tiện ích',
  async run({ interaction, bot }) {
    try {
      const weight = interaction.options.getInteger('weight');
      const height = interaction.options.getInteger('height');
      if (weight < 50 || weight > 600)
        return interaction.reply('Cân nặng không thể ít hơn 50 kilogram hoặc vượt quá 600 kilogram.');
      if (height < 50 || height > 275)
        return interaction.reply('Chiều cao không thể ít hơn 50 centimet hoặc lớn hơn 275 mét.');
      const bmi = (weight / ((height * height) / 10000)).toFixed(2);
      let category;
      if (bmi < 18.5) category = 'Thiếu cân';
      if (bmi > 24.9) category = 'Thừa cân';
      if (bmi > 30) category = 'Béo phì';
      if (bmi < 24.9 && bmi > 18.5) category = 'Bình thường';
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .addField('Cân Nặng', `${weight} kg`, true)
            .addField('Chiều Cao', `${height} cm`, true)
            .addField('BMI', `${bmi}`, true)
            .addField('Danh Mục', `${category}`, true)
            .setColor('BLURPLE')
        ]
      });
    } catch (err) {
      interaction.reply('Giá trị không hợp lệ đã được cung cấp.');
    }
  }
};