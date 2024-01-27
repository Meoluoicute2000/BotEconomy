const { plural } = require('../Structures/Utils');

module.exports = {
  event: 'ready',
  async run(bot) {
    console.log(`|  🌼 Đăng nhập với tư cách ${bot.user.tag}`);
    console.log(`|  🧩 Slash Commands - Tải thành công ${bot.commands.size} lệnh và ở trong ${bot.guilds.cache.size} server khác nhau. ${plural(bot.guilds.cache.size)}`);

    try {
      bot.user.setPresence({
        activities: [{ name: '🍒𝗖𝗵𝗲𝗿𝗿𝘆 𝗬𝗲̂𝘂 🐰𝗦𝗮𝘆𝗼𝗻𝗮𝗿𝗮 - 12/10/2023', type: 'WATCHING' }],
        status: 'online',
        state: "🍒𝗖𝗵𝗲𝗿𝗿𝘆 𝗬𝗲̂𝘂 🐰𝗦𝗮𝘆𝗼𝗻𝗮𝗿𝗮 - 12/10/2023"
      });0

      console.log(`|  🍒 Trạng thái của Bot đã sẵn sàng!`);
    } catch (error) {
      console.error(`|  🍒 Xảy ra lỗi khi cài đặt trạng thái bot: ${error.message}`);
    }
  }
};
