const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

const BaibacayCooldowns = new Map();

module.exports = {
  name: 'bbc',
  description: 'Rút 3 cây bài và tính điểm cao nhất. Hạn chế sử dụng mỗi 5 giây - Rút gọn.',
  category: 'Kinh tế',
  options: [
    {
      name: 'bet',
      description: 'Số tiền cược (tối đa 50000 - mặc định là 1000).',
      required: false,
      type: 'INTEGER'
    }
  ],
  async run({ interaction, bot, guild }) {
    if (BaibacayCooldowns.has(interaction.user.id)) {
      const cooldownExpiration = BaibacayCooldowns.get(interaction.user.id);
      if (Date.now() < cooldownExpiration) {
        const timeLeft = Math.ceil((cooldownExpiration - Date.now()) / 1000);
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setTitle(`Rút Ba Lá Bài của **${interaction.user.username}**`)
              .setDescription(`*Bạn cần phải đợi thêm* **${timeLeft} giây** *trước khi có thể rút lại 3 bài.*`)
          ],
        });
      }
    }

    const inputBet = interaction.options.getInteger('bet');
    const defaultBet = 1000;
    const bet = (inputBet && inputBet >= 1000 && inputBet <= 50000) ? inputBet : defaultBet;

    if (bet < 1000 || bet > 50000) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription('**Giới hạn của lượt rút bài là 50000 :coin:.**')
        ],
      });
    }

    const cooldownDuration = 5 * 1000; // 5 giây
    BaibacayCooldowns.set(interaction.user.id, Date.now() + cooldownDuration);

    const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const hand = Array.from({ length: 3 }, () => cards[Math.floor(Math.random() * cards.length)]);

    const points = hand.reduce((total, card) => {
      if (card === 'A') {
        return total + 11; //A là 11 điểm
      } else if (['K', 'Q', 'J'].includes(card)) {
        return total + 10;
      } else {
        return total + parseInt(card);
      }
    }, 0);

    const houseHand = Array.from({ length: 3 }, () => cards[Math.floor(Math.random() * cards.length)]);
    const housePoints = houseHand.reduce((total, card) => {
      if (card === 'A') {
        return total + 11; // Giả sử A là 11 điểm
      } else if (['K', 'Q', 'J'].includes(card)) {
        return total + 10;
      } else {
        return total + parseInt(card);
      }
    }, 0);

    let result;
    if (points % 10 > housePoints % 10) {
      result = 'Bạn Thắng!';
      const updatedProfile = await Profile.findOneAndUpdate(
        { UserID: interaction.user.id, GuildID: guild.id },
        { $inc: { Wallet: bet } },
        { new: true }
      );
    } else if (points % 10 < housePoints % 10) {
      result = 'Bạn Thua!';
      const updatedProfile = await Profile.findOneAndUpdate(
        { UserID: interaction.user.id, GuildID: guild.id, Wallet: { $gte: bet } },
        { $inc: { Wallet: -bet } },
        { new: true }
      );
      if (!updatedProfile) {
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setDescription('**Số dư của bạn không đủ để chơi `Bbc` :coin: :coin: :coin:\n \n Vui lòng sử dụng lệnh `Work` hay nhận tiền hàng ngày để chơi.**')
          ],
        });
      }
    } else {
      result = 'Hòa!';
    }

    const embed = new MessageEmbed()
      .setColor('BLURPLE')
      .setTitle(`Rút 3 Lá Bài của **${interaction.user.username}**`)
      .setDescription(`**🍒Bài Của Bạn:** ${hand.join(' | ')}\n**🍒 Điểm Của Bạn:** ${points % 10}\n\n**🏛 Bài Nhà Cái:** ${houseHand.join(' | ')}\n**🏛 Điểm Nhà Cái:** ${housePoints % 10}\n\n**🃏 Kết Quả:** ${result}\n**💵 Tiền Đã Cược:** ${bet} :coin:.`);

    await interaction.reply({ embeds: [embed] });
  }
};
