const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

const blackjackCooldowns = new Map();

module.exports = {
  name: 'blackjack',
  description: 'Chơi trò chơi Blackjack. Hạn chế sử dụng mỗi 10 giây - Rút gọn.',
  category: 'Kinh tế',
  options: [
    {
      name: 'bet',
      description: 'Số tiền cược (tối đa 50000 - mặc định là 1000).',
      required: false,
      type: 'INTEGER',
    },
  ],
  async run({ interaction, bot, guild }) {
    const profile = await Profile.findOne({ UserID: interaction.user.id, GuildID: guild.id });
    if (!profile) {
      await createProfile(interaction.user, guild);
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`*Đang tạo hồ sơ của bạn. . .*\n \n**Sử dụng lệnh này một lần nữa để chơi Blackjack.**`),
        ],
      });
    } else {
      if (blackjackCooldowns.has(interaction.user.id)) {
        const cooldownExpiration = blackjackCooldowns.get(interaction.user.id);
        if (Date.now() < cooldownExpiration) {
          const timeLeft = Math.ceil((cooldownExpiration - Date.now()) / 1000);
          return interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor('BLURPLE')
                .setTitle(`Trò chơi Blackjack của **${interaction.user.username}**`)
                .setDescription(`*Bạn cần phải đợi thêm* **${timeLeft} giây** *trước khi có thể chơi lại.*`),
            ],
          });
        }
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
            .setDescription('**Giới hạn của lượt chơi là 50000 :coin:.**')
        ],
      });
    }

    const cooldownDuration = 10 * 1000; // 10 giây
    blackjackCooldowns.set(interaction.user.id, Date.now() + cooldownDuration);

    const playerHand = [drawCard(), drawCard()];
    const dealerHand = [drawCard()];

    let playerPoints = calculatePoints(playerHand);
    let dealerPoints = calculatePoints(dealerHand);

    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor('BLURPLE')
          .setTitle(`Bắt đầu trò chơi Blackjack của **${interaction.user.username}**`)
          .setDescription(`**🍒 Bài Của Bạn:** ${playerHand.join(' | ')}\n**🍒 Điểm Của Bạn:** ${playerPoints}\n\n**🃏 Bài Nhà Cái:** ${dealerHand[0]} | ?\n**🃏 Điểm Nhà Cái:** ?\n\n**💸 Tiền Cược:** ${bet} :coin:.`)
          .setFooter({ text: 'Chat "rút" hoặc "không rút" để thực hiện lệnh rút bài nhé!'})
      ],
    });

    let hit = true;
    while (hit) {
      if (playerPoints >= 21) {
        break;
      }

      const filter = (response) => response.author.id === interaction.user.id && ['rút', 'không rút'].includes(response.content.toLowerCase());
      await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
        .then((collected) => {
          const choice = collected.first().content.toLowerCase();
          if (choice === 'rút') {
            const newCard = drawCard();
            playerHand.push(newCard);
            playerPoints = calculatePoints(playerHand);
            interaction.followUp({
              embeds: [
                new MessageEmbed()
                  .setColor('BLURPLE')
                  .setTitle(`Tính điểm trò chơi Blackjack của **${interaction.user.username}**`)
                  .setDescription(`**✨ Bạn rút thêm lá bài:** ${newCard}\n**🍒 Bài Của Bạn:** ${playerHand.join(' | ')}\n**🍒 Điểm Của Bạn:** ${playerPoints}\n\n**🃏 Bài Nhà Cái:** ${dealerHand[0]} | ?\n**🃏 Điểm Nhà Cái:** ?\n\n**💸 Tiền Cược:** ${bet} :coin:.`)
                  .setFooter({ text: 'Chat "rút" hoặc "không rút" để thực hiện lệnh rút bài nhé!'})
              ],
            });
          } else if (choice === 'không rút') {
            hit = false;
          }
        })
        .catch(() => {
          interaction.followUp({
            embeds: [
              new MessageEmbed()
                .setColor('BLURPLE')
                .setDescription('Hết thời gian, tự động dừng.')
            ],
          });
          hit = false;
        });
    }

    while (dealerPoints < 17) {
      const newCard = drawCard();
      dealerHand.push(newCard);
      dealerPoints = calculatePoints(dealerHand);
    }

    interaction.followUp({
      embeds: [
        new MessageEmbed()
          .setColor('BLURPLE')
          .setTitle(`Xem lại kết quả trò chơi Blackjack của **${interaction.user.username}**`)
          .setDescription(`**🍒 Bài Của Bạn:** ${playerHand.join(' | ')}\n**🍒 Điểm Của Bạn:** ${playerPoints}\n\n**🃏 Bài Nhà Cái:** ${dealerHand.join(' | ')}\n**🃏 Điểm Nhà Cái:** ${dealerPoints}\n\n**💸 Tiền Cược:** ${bet} :coin:.`)
          .setFooter({ text: 'Chat "rút" hoặc "không rút" để thực hiện lệnh rút bài nhé!'})
      ],
    });

    let result;
    if (playerPoints > 21 || (dealerPoints <= 21 && dealerPoints > playerPoints)) {
      result = 'Bạn thua!';
      updateWallet(interaction.user.id, guild.id, -bet);
    } else if (dealerPoints > 21 || playerPoints > dealerPoints) {
      result = 'Bạn thắng!';
      updateWallet(interaction.user.id, guild.id, bet);
    } else {
      result = 'Hòa!';
    }

    interaction.followUp({
      embeds: [
        new MessageEmbed()
          .setColor('BLURPLE')
          .setTitle(`Kết quả trò chơi Blackjack của **${interaction.user.username}**`)
          .setDescription(`**🍒 Bài Của Bạn:** ${playerHand.join(' | ')}\n**🍒 Điểm Của Bạn:** ${playerPoints}\n\n**🃏 Bài Nhà Cái:** ${dealerHand.join(' | ')}\n**🃏 Điểm Nhà Cái:** ${dealerPoints}\n\n**💵 Kết Quả:** ${result}\n**💸 Tiền Cược:** ${bet} :coin:.`)
          .setFooter({ text: 'Chat "rút" hoặc "không rút" để thực hiện lệnh rút bài nhé!'})
      ],
    });
  }
};

async function updateWallet(userID, guildID, amount) {
  const updatedProfile = await Profile.findOneAndUpdate(
    { UserID: userID, GuildID: guildID, Wallet: { $gte: Math.abs(amount) } },
    { $inc: { Wallet: amount } },
    { new: true }
  );

  if (!updatedProfile) {
    throw new Error('**Số dư của bạn không đủ để chơi `Blackjack` :coin: :coin: :coin:\n \n Vui lòng sử dụng lệnh `Work` hay nhận tiền hàng ngày để chơi.**');
  }
}

function drawCard() {
  const cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  return cards[Math.floor(Math.random() * cards.length)];
}

function calculatePoints(hand) {
  let points = 0;
  let numberOfAces = 0;

  for (const card of hand) {
    if (card === 'A') {
      points += 11;
      numberOfAces++;
    } else if (['K', 'Q', 'J'].includes(card)) {
      points += 10;
    } else {
      points += parseInt(card);
    }
  }

  while (points > 21 && numberOfAces > 0) {
    points -= 10;
    numberOfAces--;
  }

  return points;
}
