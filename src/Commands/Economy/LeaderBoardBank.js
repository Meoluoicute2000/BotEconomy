const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');

module.exports = {
  name: 'leaderboardbank',
  description: 'Kiểm tra danh sách top 10 người giàu nhất (Tiền trong ngân hàng) trên máy chủ.',
  category: 'Kinh tế',
  async run({ interaction, options, bot, guild }) {
    const profiles = await Profile.find({ GuildID: guild.id });
    if (!profiles.length) {
      await interaction.reply({
        embeds: [new MessageEmbed().setColor('BLURPLE').setDescription(`Hiện không có ai có tiền trong ngân hàng.`)]
      });
    } else {
      const sortedProfiles = profiles.sort((a, b) => b.Bank - a.Bank);
      const top10 = sortedProfiles.slice(0, 10);
      const embed = new MessageEmbed()
        .setColor('BLURPLE')
        .setTitle('Top 10 Người Giàu Nhất (Ngân Hàng)')
        .setDescription(`**Trong ngân hàng:**\n`);
      top10.forEach(profile => {
        embed.addField(`${bot.users.cache.get(profile.UserID).username}`, `**${profile.Bank}** :coin:`);
      });
      await interaction.reply({
        embeds: [embed]
      });
    }
  }
};
