const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/Profile');

module.exports = {
  name: 'userinfo',
  description: 'Hiển thị thông tin đa dạng về người dùng.',
  options: [
    {
      name: 'user',
      description: 'Đề cập đến người dùng.',
      required: false,
      type: 'USER'
    }
  ],
  category: 'Tiện ích',
  async run({ interaction, bot, guild }) {
    const user = interaction.options.getMember('user') || interaction.member;
    await user.user.fetch(true);
    const filter = { owner: guild.ownerId === user.id };
    const profile = await Profile.find({ UserID: user.id, GuildID: guild.id });

    var flags = {
      '': 'Không có',
      DISCORD_EMPLOYEE: 'Nhân viên Discord',
      DISCORD_PARTNER: 'Đối tác Discord',
      BUGHUNTER_LEVEL_1: 'Bug Hunter ( Cấp độ 1 )',
      BUGHUNTER_LEVEL_2: 'Bug Hunter ( Cấp độ 2 )',
      HYPESQUAD_EVENTS: 'Hypesquad Events',
      HOUSE_BRILLIANCE: `HypeSquad Brilliance`,
      HOUSE_BRAVERY: `HypeSquad Bravery`,
      HOUSE_BALANCE: `HypeSquad Balance`,
      EARLY_SUPPORTER: 'Early Supporter',
      TEAM_USER: 'Team User',
      VERIFIED_BOT: 'Bot Đã Xác minh',
      VERIFIED_DEVELOPER: 'Nhà Phát triển Bot Đã Xác minh',
      DISCORD_NITRO: 'Discord Nitro'
    };
    const Flags = flags[user.user.flags.toArray().join(', ')];
    if (user.avatar && user.avatar.startsWith('a_')) Flags.push(Badges['DISCORD_NITRO']);

    let acknowledgement;
    if (filter.owner) acknowledgement = 'Chủ Guild';
    if (user.permissions.has('ADMINISTRATOR') && !filter.owner) acknowledgement = 'Quản trị viên';
    if (
      user.permissions.has(['MANAGE_ROLES', 'MANAGE_MESSAGES']) &&
      !user.permissions.has('ADMINISTRATOR') &&
      !filter.owner
    )
      acknowledgement = 'Người Kiểm duyệt';
    if (
      user.permissions.has(['SEND_MESSAGES']) &&
      !user.permissions.has(['MANAGE_ROLES', 'MANAGE_MESSAGES']) &&
      !filter.owner
    )
      acknowledgement = 'Thành viên';

    const embed = new MessageEmbed()
      .setColor('BLURPLE')
      .setAuthor({
        name: user.user.tag,
        iconURL: user.displayAvatarURL() || 'https://i.pinimg.com/736x/35/79/3b/35793b67607923a68d813a72185284fe.jpg'
      })
      .setThumbnail(
        user.displayAvatarURL() || 'https://i.pinimg.com/736x/35/79/3b/35793b67607923a68d813a72185284fe.jpg'
      )
      .addField('Ngày Tạo Tài khoản', `<t:${Math.round(user.user.createdTimestamp / 1000)}:f>`, false)
      .addField('Nhãn hiệu', `${Flags}`, false)
      .setFooter({text: `ID Người dùng: ${user.id}`});
      
    if (acknowledgement.length > 0) embed.addField('Công nhận', `${acknowledgement}`, false);
    profile.length ? embed.addField('Ví', `${profile[0].Wallet} :coin:`, false) : null;
    profile.length ? embed.addField('Ngân hàng', `${profile[0].Bank} :coin:`, false) : null;

    await interaction.reply({
      embeds: [embed]
    });
  }
};