const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { time } = require('@discordjs/builders');

module.exports = {
  name: 'kick',
  description: 'Đá ra khỏi server một thành viên.',
  category: 'Quản lý',
  options: [
    {
      name: 'user',
      description: 'Đề cập đến một thành viên',
      required: true,
      type: 'USER',
    },
    {
      name: 'reason',
      description: 'Chỉ định lý do kick',
      required: true,
      type: 'STRING',
    },
  ],
  async run({ interaction, bot }) {
    const isAdmin = interaction.member.permissions.has('KICK_MEMBERS');
    const isBotOwner = interaction.user.id === '827533541113069609';

    if (!isAdmin && !isBotOwner) {
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('RED').setDescription(`Bạn không có quyền thực hiện lệnh này.`)],
      });
    }

    const user = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');

    if (!user.kickable) {
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('RED').setDescription(`Tôi không có quyền kick ${user}.`)],
      });
    }

    if (user.id === interaction.user.id) {
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('RED').setDescription(`Bạn không thể tự kick chính mình.`)],
      });
    }

    const confirmationRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('confirm').setLabel('Confirm').setStyle('SUCCESS'),
      new MessageButton().setCustomId('cancel').setLabel('Cancel').setStyle('DANGER'),
    );

    let confirmationMessage;
    try {
      confirmationMessage = await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle('Xác Nhận Thực Hiện')
            .setColor('BLURPLE')
            .setDescription(`Bạn có chắc chắn muốn kick ${user} với lý do: \`${reason}\`?`)
            .setFooter({ text: 'Bạn có 60 giây để xác nhận.' }),
        ],
        components: [confirmationRow],
      });

      const filter = (interaction) => interaction.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on('collect', async (interaction) => {
        collector.stop();
        await interaction.deferUpdate();

        let responseEmbed;

        if (interaction.customId === 'confirm') {
          responseEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setDescription(`**${user.user.tag}** đã bị kick với lý do \`${reason}\`.`);

          try {
            await user.send({
              embeds: [
                new MessageEmbed()
                  .setTitle('Bạn đã bị kick')
                  .setColor('BLURPLE')
                  .addField('Lý Do', reason, false)
                  .addField('Server', interaction.guild.name, false)
                  .addField('Ngày', time(new Date(), 'F'), false),
              ],
            });
          } catch (err) {
            responseEmbed.setFooter({
              text: `Tôi không thể gửi thông báo qua tin nhắn riêng.`,
            });
          }

          await user.kick({ reason });
        } else {
          responseEmbed = new MessageEmbed()
            .setColor('RED')
            .setTitle('Quá Trình Hủy Bỏ')
            .setDescription(`${user} không bị kick.`);
        }

        await confirmationMessage.edit({
          embeds: [responseEmbed],
          components: [],
        });
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          const timeoutEmbed = new MessageEmbed()
            .setColor('RED')
            .setTitle('Quá Trình Hủy Bỏ')
            .setDescription(`Quá thời gian xác nhận. ${user} không bị kick.`);

          confirmationMessage.edit({
            embeds: [timeoutEmbed],
            components: [],
          });
        }
      });
    } catch (error) {
      console.error(`Error sending confirmation message: ${error}`);
    }
  },
};

