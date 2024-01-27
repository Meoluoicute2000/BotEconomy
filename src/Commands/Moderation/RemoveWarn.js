const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const Warning = require('../../Models/Warning');
const { confirm } = require('../../Structures/Utils');
const { time } = require('@discordjs/builders');

module.exports = {
  name: 'removewarn',
  description: 'Xóa một cảnh báo từ ai đó.',
  category: 'Quản lý',
  options: [
    {
      name: 'warnid',
      description: 'Nhập ID cảnh báo',
      required: true,
      type: 'STRING',
    },
  ],
  permissions: 'MODERATE_MEMBERS',
  async run({ interaction, bot }) {
    const warnID = interaction.options.getString('warnid');
    const warning = await Warning.findOne({ GuildID: interaction.guild.id, WarnID: warnID });

    if (!warning) {
      return await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('RED')
            .setDescription(`Không thể tìm thấy cảnh báo với ID: ${warnID} trong cơ sở dữ liệu của tôi.`),
        ],
        ephemeral: true,
      });
    }

    const isAdmin = interaction.member.permissions.has('KICK_MEMBERS');
    const isBotOwner = interaction.user.id === '827533541113069609';

    if (!isAdmin && !isBotOwner) {
      return interaction.reply({
        embeds: [new MessageEmbed().setColor('RED').setDescription(`Bạn không có quyền thực hiện lệnh này.`)],
      });
    }

    const confirmationRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('confirm').setLabel('Confirm').setStyle('SUCCESS'),
      new MessageButton().setCustomId('cancel').setLabel('Cancel').setStyle('DANGER')
    );

    const confirmationMessage = await confirm(interaction, {
      title: 'Xác nhận',
      description: `Bạn có chắc chắn muốn xóa cảnh báo của <@${warning.UserID}> với lý do: \`${warning.Reason}\` không?`,
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
        await warning.delete();

        responseEmbed = new MessageEmbed()
          .setColor('BLURPLE')
          .setDescription(`Cảnh báo cho **<@${warning.UserID}>** với lý do \`${warning.Reason}\` đã bị xóa.`);

        await confirmationMessage.i.followUp({
          embeds: [responseEmbed],
          components: [],
        });
      } else {
        responseEmbed = new MessageEmbed()
          .setTitle('Quá Trình Hủy Bỏ')
          .setColor('BLURPLE')
          .setDescription(`Cảnh báo của **${warning.UserID}** không được xóa.`);

        await confirmationMessage.i.followUp({
          embeds: [responseEmbed],
          components: [],
        });
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        const timeoutEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('Quá Trình Hủy Bỏ')
          .setDescription(`Quá thời gian xác nhận. <@${warning.UserID}> không bị cảnh báo.`);

        confirmationMessage.i.followUp({
          embeds: [timeoutEmbed],
          components: [],
        });
      }
    });
  },
};