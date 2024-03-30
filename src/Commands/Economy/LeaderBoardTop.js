const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');

module.exports = {
  name: 'leaderboardtop',
  description: 'Kiểm tra danh sách top 10 người giàu nhất (Tổng tài sản) trên máy chủ.',
  category: 'Kinh tế',
  async run({ interaction, options, bot, guild }) {
    const profiles = await Profile.find({ GuildID: guild.id });
    if (!profiles.length) {
      await interaction.reply({
        embeds: [new MessageEmbed().setColor('BLURPLE').setDescription(`Hiện không có ai có tài sản.`)]
      });
    } else {
      const sortedProfiles = profiles.sort((a, b) => (b.Bank + b.Wallet) - (a.Bank + a.Wallet));
      const top10 = sortedProfiles.slice(0, 10);
      const embed = new MessageEmbed()
        .setColor('BLURPLE')
        .setTitle('Top 10 Người Giàu Nhất (Tổng Tài Sản)')
        .setDescription(`**Tổng tài sản:**\n`);
      
      for (const profile of top10) {
        let user;
        try {
          user = await bot.users.fetch(profile.UserID);
        } catch (error) {
          console.error('Lỗi tìm người dùng:', error);
        }

        const username = user ? user.username : `Không xác định (${profile.UserID})`;
        const totalWealth = profile.Bank + profile.Wallet;
        embed.addField(username, `**${totalWealth}** :coin:`);
      }

      await interaction.reply({
        embeds: [embed]
      });
    }
  }
};
