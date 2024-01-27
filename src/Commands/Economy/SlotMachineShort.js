const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile } = require('../../Structures/Utils');

const slotmachineCooldowns = new Map();

module.exports = {
  name: 'slot',
  description: 'Quay máy đánh bạc Slot Machine. Hạn chế sử dụng mỗi 5 giây - Rút gọn.',
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
    const profile = await Profile.findOne({ UserID: interaction.user.id, GuildID: guild.id });
    if (!profile) {
      await createProfile(interaction.user, guild);
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`*Đang tạo hồ sơ của bạn. . .*\n \n**Sử dụng lệnh này một lần nữa để quay máy đánh bạc.**`)
        ]
      });
    } else {
      if (slotmachineCooldowns.has(interaction.user.id)) {
        const cooldownExpiration = slotmachineCooldowns.get(interaction.user.id);
        if (Date.now() < cooldownExpiration) {
          const timeLeft = Math.ceil((cooldownExpiration - Date.now()) / 1000);
          return interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor('BLURPLE')
                .setTitle(`Máy Đánh Bạc Slot Machine của **${interaction.user.username}**`)
                .setDescription(`*Bạn cần phải đợi thêm* **${timeLeft} giây** *trước khi có thể quay máy đánh bạc của bạn.*`)
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
              .setDescription('**Giới hạn của lượt quay là 50000 :coin:.**')
          ],
        });
      }

      const cooldownDuration = 5 * 1000; // 5 giây
      slotmachineCooldowns.set(interaction.user.id, Date.now() + cooldownDuration);

      const fruits = ['🍒', '🍋', '🍓', '🍇', '🍉', '🍍', '🍎', '🥒', '🍐', '🌶', '🥕', '🍆', '🍌', '🍊', '🍈', '🥝', '🍀', '☘', '💣']; //16 loại quả , 3 loại quả đặc biệt^^.
      const result = [fruits[Math.floor(Math.random() * fruits.length)], fruits[Math.floor(Math.random() * fruits.length)], fruits[Math.floor(Math.random() * fruits.length)]];

      let winnings = -bet;

      if (new Set(result).size === 3 && !['💣', '🍀', '☘'].some(icon => result.includes(icon))) {
        winnings = -bet * 1;
      } else if (new Set(result).size === 2) {
        winnings = bet * 2;
      } else if (new Set(result).size === 1) {
        winnings = bet * 10;
      }

      const specialIcons = ['☘', '🍀', '💣'];

      for (const icon of specialIcons) {
        const iconCount = result.filter(element => element === icon).length;

        switch (icon) {
          case '☘':
            if (iconCount === 1) {
              winnings += 1000;
            } else if (iconCount === 2) {
              winnings += 3000;
            } else if (iconCount === 3) {
              winnings += 5000;
            }
            break;
          case '🍀':
            if (iconCount === 1) {
              winnings *= -3;
            } else if (iconCount === 2) {
              winnings *= -6;
            } else if (iconCount === 3) {
              winnings *= -9;
            }
            break;
          case '💣':
            if (iconCount === 1) {
              winnings -= 1000;
            } else if (iconCount === 2) {
              winnings -= 3000;
            } else if (iconCount === 3) {
              winnings -= 5000;
            }
            break;
          default:
            break;
        }
      }

      const doubleFruitIcons = ['☘', '🍀', '💣'];
      const doubleFruitBonus = 2000;

      for (const doubleFruit of doubleFruitIcons) {
        const doubleFruitCount = result.filter(element => element === doubleFruit).length;

        if (doubleFruitCount === 2) {
          switch (doubleFruit) {
            case '☘':
              winnings += -2000;
              break;
            case '🍀':
              winnings += -3000;
              break;
            case '💣':
              winnings -= -1000;
              break;
            default:
              break;
          }
        }
      }

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
              .setDescription('**Số dư của bạn không đủ để chơi `Slot`. Vui lòng sử dụng lệnh `Work` hay nhận tiền hàng ngày để chơi.**')
          ],
        });
      }

      const embed = new MessageEmbed()
        .setColor('BLURPLE')
        .setTitle(`Máy Đánh Bạc Slot Machine của **${interaction.user.username}**`)
        .setDescription(`**🎰 Kết Quả:**\n*${result[0]}* | *${result[1]}* | *${result[2]}* \n\n**💰 Tiền Nhận Được:** ${winnings} :coin:`);

      await interaction.reply({ embeds: [embed] });
    }
  }
};
