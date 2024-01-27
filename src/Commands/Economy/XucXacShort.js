const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

const xucxacCooldowns = new Map();

module.exports = {
  name: 'xx',
  description: 'Game đoán số điểm trên xúc xắc. Hạn chế sử dụng mỗi 5 giây.',
  category: 'Kinh tế',
  options: [
    {
      name: 'guess',
      description: 'Dự đoán số từ 1 đến 6.',
      required: true,
      type: 'INTEGER',
      choices: [
        { name: '1', value: 1 },
        { name: '2', value: 2 },
        { name: '3', value: 3 },
        { name: '4', value: 4 },
        { name: '5', value: 5 },
        { name: '6', value: 6 },
      ]
    },
    {
      name: 'bet',
      description: 'Số tiền cược (tối đa 50000 - mặc định là 1000).',
      required: false,
      type: 'INTEGER'
    },
  ],
  
  async run({ interaction, bot, guild }) {
    const profile = await Profile.findOne({ UserID: interaction.user.id, GuildID: guild.id });
    if (!profile) {
      await createProfile(interaction.user, guild);
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`*Đang tạo hồ sơ của bạn. . .*\n \n**Sử dụng lệnh này một lần nữa để chơi game đoán số.**`)
        ]
      });
    }

    if (xucxacCooldowns.has(interaction.user.id)) {
      const cooldownExpiration = xucxacCooldowns.get(interaction.user.id);
      if (Date.now() < cooldownExpiration) {
        const timeLeft = Math.ceil((cooldownExpiration - Date.now()) / 1000);
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setTitle(`Game Đoán Số trên Xúc Xắc của **${interaction.user.username}**`)
              .setDescription(`*Bạn cần phải đợi thêm* **${timeLeft} giây** *trước khi có thể chơi game đoán số.*`)
          ],
        });
      }
    }

    const bet = interaction.options.getInteger('bet') || 1000;
    const guess = interaction.options.getInteger('guess');

    if (bet < 1000 || bet > 50000) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription('**Giới hạn của lượt chơi là 50000 :coin:.**')
        ],
      });
    }

    const diceResult = Math.floor(Math.random() * 6) + 1;

    let winnings = 0;

    if (guess === diceResult) {
      winnings = bet * 6;
    } else {
      winnings = -bet;
    }

    // Cập nhật số tiền trong hồ sơ
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
            .setDescription('**Số dư của bạn không đủ để chơi `Xx` :coin: :coin: :coin:\n \n Vui lòng sử dụng lệnh `Work` hay nhận tiền hàng ngày để chơi.**')
        ],
      });
    }

    const embed = new MessageEmbed()
      .setColor('BLURPLE')
      .setTitle(`Game Đoán Số trên Xúc Xắc của **${interaction.user.username}**`)
      .setDescription(`**🎲 Kết Quả:**\n✨ Bạn dự đoán: ${guess}\n🎲 Kết quả xúc xắc: ${diceResult}\n\n**💰 Tiền Nhận Được:** ${winnings} :coin:`);

    const cooldownDuration = 5 * 1000; // 5 giây
    xucxacCooldowns.set(interaction.user.id, Date.now() + cooldownDuration);

    await interaction.reply({ embeds: [embed] });
  }
};
