const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

const taixiuCooldowns = new Map();

module.exports = {
  name: 'tx',
  description: 'Chơi trò chơi Tài Xỉu với 3 con xúc xắc. Hạn chế sử dụng mỗi 30 giây - Rút gọn.',
  category: 'Kinh tế',
  options: [
    {
      name: 'bet',
      description: 'Số tiền cược (tối đa 50000 - thấp nhất 1000).',
      required: true,
      type: 'INTEGER',
    },
    {
      name: 'choice',
      description: 'Chọn "Tài" hoặc "Xỉu".',
      required: true,
      type: 'STRING',
      choices: [
        { name: 'Tài', value: 'Tài' },
        { name: 'Xỉu', value: 'Xỉu' },
      ],
    },
  ],
  async run({ interaction, bot, guild }) {
    if (taixiuCooldowns.has(interaction.user.id)) {
      const cooldownExpiration = taixiuCooldowns.get(interaction.user.id);
      if (Date.now() < cooldownExpiration) {
        const timeLeft = Math.ceil((cooldownExpiration - Date.now()) / 1000);
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setTitle(`Trò chơi Tài Xỉu của **${interaction.user.username}**`)
              .setDescription(`*Bạn cần phải đợi thêm* **${timeLeft} giây** *trước khi có thể chơi lại.*`),
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
            .setDescription('**Giới hạn của lượt chơi là 50000 :coin:.**'),
        ],
      });
    }

    const cooldownDuration = 30 * 1000; // 30 giây
    taixiuCooldowns.set(interaction.user.id, Date.now() + cooldownDuration);

    const dice1 = rollDice();
    const dice2 = rollDice();
    const dice3 = rollDice();

    const totalPoints = dice1 + dice2 + dice3;

    let result;
    if (totalPoints >= 4 && totalPoints <= 10) {
      result = 'Xỉu';
    } else if (totalPoints >= 11 && totalPoints <= 17) {
      result = 'Tài';
    } else {
      result = 'lose';
    }

    let payoutMultiplier;
    if (result === interaction.options.getString('choice')) {
      payoutMultiplier = 10; 
    } else {
      payoutMultiplier = 0; 
    }

    const winnings = bet * payoutMultiplier;
    const losses = (result === interaction.options.getString('choice')) ? 0 : bet;

    try {
      if (result === interaction.options.getString('choice')) {
        await updateWallet(interaction.user.id, guild.id, winnings - bet); 
        await updateWallet(interaction.user.id, guild.id, -losses); 
      }
    } catch (error) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription('**Số dư của bạn không đủ để chơi `Taixiu` :coin: :coin: :coin:\n \n Vui lòng sử dụng lệnh `Work` hay nhận tiền hàng ngày để chơi.**'),
        ],
      });
    }

    const embed = new MessageEmbed()
      .setColor('BLURPLE')
      .setTitle(`Trò chơi Tài Xỉu của **${interaction.user.username}**`)
      .setDescription(`**🎲 Xúc xắc:** 🎲 ${dice1} | 🎲 ${dice2} | 🎲 ${dice3}\n**🎲Tổng Điểm:** ${totalPoints}\n \n**🏛 Kết Quả Tài Xỉu:** ${result}\n**🍒 Lựa Chọn:** ${interaction.options.getString('choice')}\n \n**💵 Tiền Cược:** ${bet} :coin:\n**💰 Số Tiền Thắng:** ${winnings} :coin:\n**💸 Số Tiền Thua:** ${losses} :coin:`);

    interaction.reply({ embeds: [embed] });
  },
};

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

async function updateWallet(userID, guildID, amount) {
  const updatedProfile = await Profile.findOneAndUpdate(
    { UserID: userID, GuildID: guildID, Wallet: { $gte: Math.abs(amount) } },
    { $inc: { Wallet: amount } },
    { new: true }
  );

  if (!updatedProfile) {
    throw new Error('**Số dư của bạn không đủ để chơi `Tx` :coin: :coin: :coin:\n \n Vui lòng sử dụng lệnh `Work` hay nhận tiền hàng ngày để chơi.**');
  }
}
