
const { MessageEmbed } = require('discord.js');
const math = require('mathjs');

module.exports = {
  name: 'calculate',
  description: 'Tính toán và giải kết quả.',
  options: [
    {
      name: 'equation',
      description: 'Chỉ định một phép tính.',
      required: true,
      type: 'STRING'
    }
  ],
  category: 'Tiện ích',
  async run({ interaction }) {
    const equation = interaction.options.getString('equation', true);
    const embed = new MessageEmbed();
    try {
      embed.setColor('BLURPLE').addFields([
        { name: 'Phép tính của bạn', value: equation },
        { name: 'Kết quả là', value: String(math.evaluate(equation)) }
      ]);
    } catch (err) {
      embed.setColor('RED').setDescription('Phép tính không hợp lệ');
    }
    await interaction.reply({ embeds: [embed] });
  }
}