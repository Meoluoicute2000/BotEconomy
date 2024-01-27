const { confirm } = require('../../Structures/Utils');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Lệnh xóa dọn tin nhắn.',
  category: 'Quản lý',
  permissions: 'MANAGE_MESSAGES',
  options: [
    {
      name: 'messages',
      description: 'Số lượng tin nhắn cần xóa',
      required: true,
      type: 'NUMBER'
    }
  ],
  async run({ interaction, bot }) {
    const isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
    const isBotOwner = interaction.user.id === '827533541113069609';

    if (!isAdmin && !isBotOwner) {
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('RED').setDescription(`Bạn không có quyền thực hiện lệnh này.`)],
      });
    }

    const messages = interaction.options.getNumber('messages');

    if (messages > 100 || messages < 1) {
      return await interaction.reply({
        embeds: [new MessageEmbed().setColor('RED').setDescription('Vui lòng chỉ định một số từ 1 - 100.')],
      });
    }

    try {
      const fetchedMessages = await interaction.channel.messages.fetch({ limit: messages });
      const deletedMessages = await interaction.channel.bulkDelete(fetchedMessages, true);

      let purgeMessagesNumber = deletedMessages.size.toString();
      if (purgeMessagesNumber === '0') {
        purgeMessagesNumber = '1';
      }

      const msg = await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setDescription(`Đã xóa ${purgeMessagesNumber} tin nhắn từ ${interaction.channel}`)
        ],
        fetchReply: true
      });

      await sleep(5000);

      if (msg?.deletable) {
        await msg.delete();
      }
    } catch (error) {
      console.error('Error clearing messages:', error);
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('RED').setDescription('Đã có lỗi xảy ra khi xóa tin nhắn.')]
      });
    }
  }
};
