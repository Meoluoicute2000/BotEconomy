const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

const coinflipCooldowns = new Map();

module.exports = {
  name: 'cf',
  description: 'Bật đồng xu và đặt cược xem mặt nào sẽ xuất hiện. Hạn chế sử dụng mỗi 5 giây.',
  category: 'Kinh tế',
  options: [
    {
      name: 'bet',
      description: 'Số tiền cược (tối đa 50000 - mặc định là 1000).',
      required: true,
      type: 'INTEGER'
    },
    {
      name: 'guess',
      description: 'Dự đoán: "ngửa" hoặc "sấp".',
      required: true,
      type: 'STRING',
      choices: [
        { name: 'Ngửa', value: 'Ngửa' },
        { name: 'Sấp', value: 'Sấp' }
      ]
    }
  ],
  async run({ interaction, bot, guild }) {
    const profile = await Profile.findOne({ UserID: interaction.user.id, GuildID: guild.id });
    if (!profile) {
      await createProfile(interaction.user, guild);
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`*Đang tạo hồ sơ của bạn. . .*\n \n**Sử dụng lệnh này một lần nữa để chơi Coinflip.**`)
        ]
      });
    }

    if (coinflipCooldowns.has(interaction.user.id)) {
      const cooldownExpiration = coinflipCooldowns.get(interaction.user.id);
      if (Date.now() < cooldownExpiration) {
        const timeLeft = Math.ceil((cooldownExpiration - Date.now()) / 1000);
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setTitle(`Coinflip của **${interaction.user.username}**`)
              .setDescription(`*Bạn cần phải đợi thêm* **${timeLeft} giây** *trước khi có thể chơi Coinflip.*`)
          ],
        });
      }
    }

    const bet = interaction.options.getInteger('bet');

    if (bet < 1000 || bet > 50000) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription('**Giới hạn cược là từ 1000 đến 50000 :coin:.**')
        ],
      });
    }

    const cooldownDuration = 5 * 1000; // 5 giây
    coinflipCooldowns.set(interaction.user.id, Date.now() + cooldownDuration);

    const result = Math.random() < 0.5 ? 'Ngửa' : 'Sấp';

    const winnings = result === interaction.options.getString('guess') ? bet : -bet;

    const updatedProfile = await Profile.findOneAndUpdate(
      { UserID: interaction.user.id, GuildID: guild.id, Wallet: { $gte: bet } },
      { $inc: { Wallet: winnings } },
      { new: true }
    );

    if (!updatedProfile) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')              
            .setDescription('**Số dư của bạn không đủ để chơi `Coinflip` :coin: :coin: :coin:\n \nVui lòng sử dụng lệnh `Work` hay nhận tiềnhàng ngày để chơi.**')
            ],
        });
    }
    const embed = new MessageEmbed()
  .setColor('BLURPLE')
  .setTitle(`Coinflip của **${interaction.user.username}**`)
  .setDescription(`**🍒 Kết Quả Tung Xu:** ${result}\n\n**✨ Dự Đoán:** ${interaction.options.getString('guess')}\n**💰 Tiền Nhận Được:** ${winnings} :coin:`);

await interaction.reply({ embeds: [embed] });
    }
};