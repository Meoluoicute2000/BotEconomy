const { confirm } = require('../../Structures/Utils');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const Warning = require('../../Models/Warning');
const { time } = require('@discordjs/builders');

module.exports = {
  name: 'warn',
  description: 'Cảnh báo ai đó.',
  category: 'Quản lý',
  options: [
    {
      name: 'user',
      description: 'Đề cập đến một người dùng',
      required: true,
      type: 'USER'
    },
    {
      name: 'reason',
      description: 'Chỉ định lý do cảnh báo',
      required: true,
      type: 'STRING'
    }
  ],
  async run({ interaction, bot }) {
    const isAdmin = interaction.member.permissions.has('KICK_MEMBERS');
    const isBotOwner = interaction.user.id === '827533541113069609';

    if (!isAdmin && !isBotOwner) {
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('RED').setDescription(`Bạn không có quyền thực hiện lệnh này.`)]
      });
    }

    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');

    if (member.id === interaction.user.id) {
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('RED').setDescription(`Bạn không thể cảnh báo chính mình.`)]
      });
    }

    const confirmationRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('confirm').setLabel('Confirm').setStyle('SUCCESS'),
      new MessageButton().setCustomId('cancel').setLabel('Cancel').setStyle('DANGER')
    );

    const confirmationMessage = await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle('Xác nhận')
          .setColor('BLURPLE')
          .setDescription(`Bạn có chắc chắn muốn cảnh báo ${member} với lý do: \`${reason}\` không?`)
          .setFooter({ text: 'Bạn có 60 giây để xác nhận.' })
      ],
      components: [confirmationRow]
    });

    const filter = (interaction) => interaction.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000
    });

    collector.on('collect', async (interaction) => {
      collector.stop();
      await interaction.deferUpdate();

      let responseEmbed;

      if (interaction.customId === 'confirm') {
        const warnID = getRandomString(5);
        await new Warning({
          GuildID: interaction.guild.id,
          WarnID: warnID,
          UserID: member.id,
          Reason: reason,
          Moderator: interaction.user.id
        }).save();

        responseEmbed = new MessageEmbed()
          .setColor('BLURPLE')
          .setDescription(`**${member.user.tag}** đã bị cảnh báo với lý do: \`${reason}\`.`);

        try {
          await member.send({
            embeds: [
              new MessageEmbed()
                .setTitle('Bạn đã bị cảnh báo')
                .setColor('BLURPLE')
                .addField('Lý do', reason, false)
                .addField('ID cảnh báo', warnID, false)
                .addField('Ngày', time(new Date(), 'F'), false)
                .addField('Guild', interaction.guild.name, false)
            ]
          });
        } catch (err) {
          responseEmbed.setFooter({
            text: `Tôi không thể gửi tin nhắn thông báo cho họ`
          });
        }
      } else {
        responseEmbed = new MessageEmbed()
          .setTitle('Quá Trình Hủy Bỏ')
          .setColor('BLURPLE')
          .setDescription(`${member} không bị cảnh báo.`);
      }

      await confirmationMessage.edit({
        embeds: [responseEmbed],
        components: []
      });
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        const timeoutEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('Quá Trình Hủy Bỏ')
          .setDescription(`Quá thời gian xác nhận. ${member} không bị cảnh báo.`);

        confirmationMessage.edit({
          embeds: [timeoutEmbed],
          components: []
        });
      }
    });
  }
};

