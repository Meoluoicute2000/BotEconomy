const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

const keobuabaoCooldowns = new Map();

module.exports = {
  name: 'kbb',
  description: 'Chơi trò chơi kéo búa bao. Hạn chế sử dụng mỗi 5 giây - Rút gọn.',
  category: 'Giải trí',
  options: [
    {
      name: 'bet',
      description: 'Số tiền cược (tối đa 50000 - thấp nhất 1000).',
      required: true,
      type: 'INTEGER',
    },
    {
      name: 'choice',
      description: 'Chọn "Kéo", "Búa" hoặc "Bao".',
      required: true,
      type: 'STRING',
      choices: [
        { name: 'Kéo', value: 'kéo' },
        { name: 'Búa', value: 'búa' },
        { name: 'Bao', value: 'bao' },
      ],
    },
  ],
  async run({ interaction, bot, guild }) {
    const defaultBet = interaction.options.getInteger('bet') || 1000;

    const profile = await Profile.findOne({ UserID: interaction.user.id, GuildID: guild.id });
    if (!profile) {
      await createProfile(interaction.user, guild);
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`*Đang tạo hồ sơ của bạn. . .*\n \n**Sử dụng lệnh này một lần nữa để chơi Kéo Búa Bao.**`),
        ],
      });
    }

    if (keobuabaoCooldowns.has(interaction.user.id)) {
      const cooldownExpiration = keobuabaoCooldowns.get(interaction.user.id);
      if (Date.now() < cooldownExpiration) {
        const timeLeft = Math.ceil((cooldownExpiration - Date.now()) / 1000);
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setDescription(`*Bạn cần phải đợi thêm* **${timeLeft} giây** *trước khi có thể chơi lại.*`),
          ],
        });
      }
    }

    const playerChoice = interaction.options.getString('choice').toLowerCase();

    const botChoice = getRandomChoice();

    const result = determineWinner(playerChoice, botChoice);

    let amountWon = 0;
    let amountLost = 0;
    if (result === 'Thắng') {
      amountWon = defaultBet * 2;
      await updateWallet(interaction.user.id, guild.id, amountWon - defaultBet);
    } else if (result === 'Thua') {
      amountLost = defaultBet;
      await updateWallet(interaction.user.id, guild.id, -amountLost);
    }

    const embed = new MessageEmbed()
      .setColor('BLURPLE')
      .setTitle(`Kết quả trò chơi Kéo Búa Bao của **Nhà Cái**`)
      .setDescription(`**💸 Tiền Cược:** ${defaultBet} :coin:.\n\n**🍒 Bạn Chọn:** ${playerChoice}\n**🏛 Nhà Cái Chọn:** ${botChoice}\n\n**🧩 Kết Quả:** ${result.charAt(0).toUpperCase() + result.slice(1)}`);

    interaction.reply({ embeds: [embed] });

    const cooldownDuration = 5 * 1000; // 5 giây
    keobuabaoCooldowns.set(interaction.user.id, Date.now() + cooldownDuration);
  },
};

async function updateWallet(userID, guildID, amount) {
  const updatedProfile = await Profile.findOneAndUpdate(
    { UserID: userID, GuildID: guildID, Wallet: { $gte: Math.abs(amount) } },
    { $inc: { Wallet: amount } },
    { new: true }
  );

  if (!updatedProfile) {
    throw new Error('**Số dư của bạn không đủ để chơi `Kbb` :coin: :coin: :coin:\n \n Vui lòng sử dụng lệnh `Work` hay nhận tiền hàng ngày để chơi.**');
  }
}

function getRandomChoice() {
  const choices = ['kéo', 'búa', 'bao'];
  return choices[Math.floor(Math.random() * choices.length)];
}

function determineWinner(playerChoice, botChoice) {
  if (
    (playerChoice === 'kéo' && botChoice === 'bao') ||
    (playerChoice === 'búa' && botChoice === 'kéo') ||
    (playerChoice === 'bao' && botChoice === 'búa')
  ) {
    return 'Thắng';
  } else if (playerChoice === botChoice) {
    return 'Hòa';
  } else {
    return 'Thua';
  }
}
