const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');

module.exports = {
  name: 'leaderboardcoin',
  description: 'Kiểm tra danh sách top 10 người giàu nhất (Tiền trong ví) trên máy chủ.',
  category: 'Kinh tế',
  async run({ interaction, options, bot, guild }) {
    const profiles = await Profile.find({ GuildID: guild.id });
    if (!profiles.length) {
      await interaction.reply({
        embeds: [new MessageEmbed().setColor('BLURPLE').setDescription(`Hiện không có ai có tiền.`)]
      });
    } else {
      const sortedProfiles = profiles.sort((a, b) => b.Wallet - a.Wallet);
      const top10 = sortedProfiles.slice(0, 10);
      const embed = new MessageEmbed()
        .setColor('BLURPLE')
        .setTitle('Top 10 Người Giàu Nhất')
        .setDescription(`**Trong ví:**\n`);
      top10.forEach(profile => {
        embed.addField(`${bot.users.cache.get(profile.UserID).username}`, `**${profile.Wallet}** :coin:`);
      });
      await interaction.reply({
        embeds: [embed]
      });
    }
  }
};
