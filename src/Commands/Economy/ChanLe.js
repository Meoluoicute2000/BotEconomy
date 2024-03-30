const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

const chanleCooldowns = new Map();

module.exports = {
  name: 'chanle',
  description: 'Chơi trò chơi Chẵn Lẻ với 4 đồng xu 2 mặt. Hạn chế sử dụng mỗi 30 giây.',
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
      description: 'Chọn "Chẵn" hoặc "Lẻ".',
      required: true,
      type: 'STRING',
      choices: [
        { name: 'Chẵn', value: 'Chẵn' },
        { name: 'Lẻ', value: 'Lẻ' },
      ],
    },
  ],
  async run({ interaction, bot, guild }) {
    if (chanleCooldowns.has(interaction.user.id)) {
      const cooldownExpiration = chanleCooldowns.get(interaction.user.id);
      if (Date.now() < cooldownExpiration) {
        const timeLeft = Math.ceil((cooldownExpiration - Date.now()) / 1000);
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setTitle(`Trò chơi Chẵn Lẻ của **${interaction.user.username}**`)
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

    const cooldownDuration = 30 * 1000;
    chanleCooldowns.set(interaction.user.id, Date.now() + cooldownDuration);

    const coin1 = coinFlip();
    const coin2 = coinFlip();
    const coin3 = coinFlip();
    const coin4 = coinFlip();

    const totalHeads = [coin1, coin2, coin3, coin4].filter(side => side === 'Ngửa').length;

    let evenOrOdd;
    if (totalHeads % 2 === 0) {
      evenOrOdd = 'Chẵn';
    } else {
      evenOrOdd = 'Lẻ';
    }

    let payoutMultiplier;
    if (evenOrOdd === interaction.options.getString('choice')) {
      payoutMultiplier = 5;
    } else {
      payoutMultiplier = 0;
    }

    const winnings = bet * payoutMultiplier;
    const losses = (evenOrOdd === interaction.options.getString('choice')) ? 0 : bet;

    try {
      if (evenOrOdd === interaction.options.getString('choice')) {
        await updateWallet(interaction.user.id, guild.id, winnings - bet); 
      } else {
        await updateWallet(interaction.user.id, guild.id, -losses);
      }
    } catch (error) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription('**Số dư của bạn không đủ để chơi `Chanle` :coin: :coin: :coin: :coin:\n \n Vui lòng sử dụng lệnh `Work` hay nhận tiền hàng ngày để chơi.**'),
        ],
      });
    }

    const embed = new MessageEmbed()
      .setColor('BLURPLE')
      .setTitle(`Trò chơi Chẵn Lẻ của **${interaction.user.username}**`)
      .setDescription(`**💰 Kết quả:** ${coin1} | ${coin2} | ${coin3} | ${coin4}\n \n**🏛 Kết Quả Chẵn Lẻ:** ${evenOrOdd}\n**🍒 Bạn Lựa Chọn:** ${interaction.options.getString('choice')}\n \n**💵 Tiền Cược:** ${bet} :coin:\n**💰 Số Tiền Thắng:** ${winnings} :coin:\n**💸 Số Tiền Thua:** ${losses} :coin:`);

    interaction.reply({ embeds: [embed] });
  },
};

function coinFlip() {
  return Math.random() < 0.5 ? 'Sấp' : 'Ngửa';
}

async function updateWallet(userID, guildID, amount) {
  const updatedProfile = await Profile.findOneAndUpdate(
    { UserID: userID, GuildID: guildID, Wallet: { $gte: Math.abs(amount) } },
    { $inc: { Wallet: amount } },
    { new: true }
  );

  if (!updatedProfile) {
    throw new Error('**Số dư của bạn không đủ để chơi `Chanle`. Vui lòng sử dụng lệnh `Work` hay nhận tiền hàng ngày để chơi.**');
  }
}
