const Warning = require('../../Models/Warning');
const { MessageEmbed } = require('discord.js');
const Menu = require('../../Structures/Menu');

module.exports = {
  name: 'warnings',
  description: 'Xem các cảnh báo của một người dùng.',
  category: 'Quản lý',
  options: [
    {
      name: 'user',
      description: 'Người dùng để xem các cảnh báo',
      type: 'USER',
      required: false
    }
  ],
  permissions: 'MANAGE_MESSAGES',
  async run({ interaction, options, bot, guild }) {
    const user = options.getUser('user') || interaction.user;

    const warnings = await Warning.find({ UserID: user.id, GuildID: guild.id });
    if (!warnings.length)
      return await interaction.reply({
        embeds: [new MessageEmbed().setColor('RED').setDescription(`${user} không có bất kỳ cảnh báo nào.`)]
      });

    const menu = new Menu(bot, interaction, {
      embed: new MessageEmbed()
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .setColor('BLURPLE')
        .setFooter({ text: guild.name, iconURL: guild.iconURL() }),
      pages: warnings.map(warning => {
        return `
        **Người Quản lý:** <@${warning.Moderator}> [\`${warning.Moderator}\`]
        **ID Cảnh báo:** ${warning.WarnID}
        **Lý do:** ${warning.Reason}
        `;
      })
    });

    await menu.start();
  }
};

