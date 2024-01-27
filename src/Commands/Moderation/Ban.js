const { confirm } = require('../../Structures/Utils');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { time } = require('@discordjs/builders');

module.exports = {
  name: 'ban',
  description: 'Ban thành viên được chỉ định.',
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
      description: 'Chỉ định lý do ban',
      required: true,
      type: 'STRING',
    },
  ],
  async run({ interaction, bot, guild }) {
    const isAdmin = interaction.member.permissions.has('ADMINISTRATOR');
    const isBotOwner = interaction.user.id === '827533541113069609';

    if (!isAdmin && !isBotOwner) {
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('RED').setDescription(`Bạn không có quyền thực hiện lệnh này.`)],
      });
    }

    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');

    if (!member.bannable) {
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('RED').setDescription(`Tôi không có quyền ban ${member}.`)],
      });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('RED').setDescription(`Bạn không thể tự ban chính mình.`)],
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
            .setDescription(`Bạn có chắc chắn muốn ban ${member} với lý do: \`${reason}\`?`)
            .setFooter({text : 'Bạn có 60 giây để xác nhận.'}),
        ],
        components: [confirmationRow],
      });
    } catch (error) {
      console.error(`Error sending confirmation message: ${error}`);
      return;
    }

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
          .setDescription(`**${member.user.tag}** đã bị ban với lý do \`${reason}\`.`);

        try {
          await member.send({
            embeds: [
              new MessageEmbed()
                .setTitle('Bạn đã bị ban')
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

        await member.ban({ reason });
      } else {
        responseEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('Hủy Bỏ Thành Công')
          .setDescription(`Hành động ban đã bị hủy bỏ. ${member} không bị ban.`);

        try {
          const followUpMessage = await interaction.followUp({
            embeds: [
              new MessageEmbed()
                .setTitle('Hành Động Ban Đã Bị Hủy Bỏ')
                .setColor('BLURPLE')
                .setDescription(`Hành động ban ${member} đã bị hủy bỏ.`),
            ],
          });
          confirmationMessage = followUpMessage.first();
        } catch (err) {
        }
      }

      if (confirmationMessage) {
        await confirmationMessage.edit({
          embeds: [responseEmbed],
          components: [],
        });
      } else {
        console.error('Đã thực hiện lệnh `Ban` gần đây');
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        const timeoutEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('Quá Trình Hủy Bỏ')
          .setDescription(`Quá thời gian xác nhận. ${member} không bị ban.`);

        if (confirmationMessage) {
          confirmationMessage.edit({
            embeds: [timeoutEmbed],
            components: [],
          });
        } else {
          console.error('confirmationMessage is undefined. Unable to edit message.');
        }
      }
    });
  },
};