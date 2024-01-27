const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');
const { createProfile, sleep } = require('../../Structures/Utils');

const stealCooldowns = new Map();

module.exports = {
  name: 'slut',
  description: 'Ăn cắp tiền từ người khác.',
  options: [
    {
      name: 'target',
      description: 'Người bị ăn cắp',
      required: true,
      type: 'USER'
    }
  ],
  category: 'Kinh tế',
  async run({ interaction, options, bot, guild }) {
    const targetUser = options.getUser('target') || guild.members.cache.random().user;

    // Kiểm tra nếu là bot hoặc tự ăn cắp tiền của chính mình
    if (targetUser.bot) {
      return await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription('🏛 Bạn không thể ăn cắp tiền của Bot khác hoặc Nhà Cái!')
        ]
      });
    }

    if (targetUser.id === interaction.user.id) {
      return await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription('🍒 Bạn không thể tự ăn cắp tiền của chính mình.')
        ]
      });
    }

    const senderProfile = await Profile.findOne({ UserID: interaction.user.id, GuildID: guild.id });
    const targetProfile = await Profile.findOne({ UserID: targetUser.id, GuildID: guild.id });

    if (!senderProfile) {
      await createProfile(interaction.user, guild);
      return await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`*Đang tạo hồ sơ của bạn. . .*\n \n**Sử dụng lệnh này một lần nữa để ăn cắp tiền.**`)
        ]
      });
    }

    if (!targetProfile) {
      return await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`❌ Người này không có hồ sơ. Hãy ăn cắp tiền từ người khác.`)
        ]
      });
    }

    const cooldownTime = 10 * 60 * 1000; // 10 phút
    const unluckyCooldownTime = 5 * 60 * 1000; // 5 phút

    if (stealCooldowns.has(interaction.user.id) && Date.now() - stealCooldowns.get(interaction.user.id) < cooldownTime) {
      const timeLeft = Math.ceil((cooldownTime - (Date.now() - stealCooldowns.get(interaction.user.id))) / 1000);
      const hours = Math.floor(timeLeft / 3600);
      const minutes = Math.floor((timeLeft - hours * 3600) / 60);
      const seconds = timeLeft - hours * 3600 - minutes * 60;

      return await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setTitle(`Thời Gian Chờ`)
            .setDescription(
              `*Bạn cần phải đợi* **${hours} giờ** **${minutes} phút** **${seconds} giây** *trước khi có thể ăn cắp tiếp.*`
            )
        ]
      });
    }

    if (senderProfile.lastUnluckySteal && Date.now() - senderProfile.lastUnluckySteal < unluckyCooldownTime) {
      const timeLeft = Math.ceil((unluckyCooldownTime - (Date.now() - senderProfile.lastUnluckySteal)) / 1000);
      const hours = Math.floor(timeLeft / 3600);
      const minutes = Math.floor((timeLeft - hours * 3600) / 60);
      const seconds = timeLeft - hours * 3600 - minutes * 60;

      return await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setTitle(`Thời Gian Chờ`)
            .setDescription(
              `*Bạn cần phải đợi* **${hours} giờ** **${minutes} phút** **${seconds} giây** *trước khi có thể thực hiện lần ăn cắp không thành công tiếp theo.*`
            )
        ]
      });
    }

    // Giới hạn số tiền ăn cắp không thành công là 20000 đến 50000^^
    const unluckyLossAmount = Math.floor(Math.random() * (50000 - 20000 + 1)) + 20000;
    // Giới hạn số tiền ăn cắp là 100000 đến 500000^^
    const stolenAmount = Math.floor(Math.random() * (500000 - 100000 + 1)) + 100000;
    const stealSuccess = Math.random() < 0.8;

    const unluckyLossMessages = [
        `💸Bạn đã thất bại trong việc ăn cắp tiền từ ${targetUser.tag}. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `🥴Không may mắn! ${targetUser.tag} đã phát hiện và ngăn chặn bạn. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `😿Cố gắng ăn cắp từ ${targetUser.tag} không thành công. Bạn bị phạt mất **${unluckyLossAmount}** :coin:.`,
        `🚫${targetUser.tag} đã đặt một cục gạch trước để ngăn chặn bạn. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `😖Thất bại! ${targetUser.tag} đã bắt gặp hành động của bạn và bạn mất **${unluckyLossAmount}** :coin:.`,
        `❌Bạn đã bị ${targetUser.tag} xem qua camera an ninh. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `😼Không thành công! ${targetUser.tag} đã cảnh báo cộng đồng về bạn. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `🤦🏻‍♂️${targetUser.tag} bắt gặp bạn đang cố gắng ăn cắp. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `🙅🏻‍♂️${targetUser.tag} đã tự vệ thành công và bạn đã mất **${unluckyLossAmount}** :coin:.`,
        `🚨${targetUser.tag} đã gửi cảnh sát về hành vi ăn cắp của bạn. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `👀${targetUser.tag} đã lập tức phát hiện bạn đang ở gần. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `🤡Thật không may! ${targetUser.tag} có đồng đội hỗ trợ. Bạn đã mất **${unluckyLossAmount}** :coin:.`,
        `🔍${targetUser.tag} đã đặt một bẫy tinh vi. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `😾Không thành công! ${targetUser.tag} đã mở cửa ra và bạn mất **${unluckyLossAmount}** :coin:.`,
        `💡${targetUser.tag} đã cài đặt hệ thống báo động cao cấp. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `🏃‍♂️${targetUser.tag} đã nhanh chóng báo cáo vụ ăn cắp của bạn. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `😺${targetUser.tag} đang sở hữu chiếc ví có chứa bom. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `🚓${targetUser.tag} đã phát hiện bạn và đã gọi đội cảnh sát. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `💪🏻${targetUser.tag} đã thuê một vệ sĩ chuyên nghiệp. Bạn mất **${unluckyLossAmount}** :coin:.`,
        `🐕${targetUser.tag} có một con chó săn hung dữ. Bạn mất **${unluckyLossAmount}** :coin:.`,
      ];
      // Thêm các câu thoại khác tùy thích:
    //${targetUser.tag}: Chèn tag của người chơi bị ăn cắp.
    //${stolenAmount}: Chèn số tiền mất khi ăn cắp thành công.
    //${unluckyLossAmount}: Chèn số tiền mất khi ăn cắp không thành công.

    const randomUnluckyLossMessage = unluckyLossMessages[Math.floor(Math.random() * unluckyLossMessages.length)];

    if (stealSuccess) {
      if (targetProfile.Wallet >= stolenAmount) {
        await Profile.updateOne(
          { UserID: interaction.user.id, GuildID: guild.id },
          {
            $set: { lastSteal: Date.now() },
            $inc: { Wallet: stolenAmount }
          }
        );

        await Profile.updateOne(
          { UserID: targetUser.id, GuildID: guild.id },
          {
            $inc: { Wallet: -stolenAmount }
          }
        );

        stealCooldowns.set(interaction.user.id, Date.now());

        return await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setTitle(`Kết Quả Ăn Cắp`)
              .setDescription(`💵 Bạn đã ăn cắp thành công **${stolenAmount}** :coin: từ ${targetUser.tag} 💸.`)
          ]
        });
      } else {
        return await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor('BLURPLE')
              .setTitle(`Kết Quả Ăn Cắp`)
              .setDescription(`🕵🏻‍♂️ ${targetUser.tag} không có đủ tiền để ăn cắp.`)
              .setFooter({ text: 'Tìm người khác để ăn cắp nhé - Số tiền ăn cắp được khoảng 20000 đến 50000!' })
          ]
        });
      }
    } else {
      await Profile.updateOne(
        { UserID: interaction.user.id, GuildID: guild.id },
        {
          $set: { lastUnluckySteal: Date.now() },
          $inc: { Wallet: -unluckyLossAmount }
        }
      );

      return await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setTitle(`Kết Quả Ăn Cắp`)
            .setDescription(randomUnluckyLossMessage)
        ]
      });
    }
  }
};
