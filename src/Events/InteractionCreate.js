const { MessageEmbed } = require('discord.js');

module.exports = {
  event: 'interactionCreate',
  async run(bot, interaction) {
    if (!interaction.isCommand()) return;

    const command = bot.commands.get(interaction.commandName);
    if (!command || typeof command.run !== 'function') {
      console.error(`Lệnh "${interaction.commandName}" không hợp lệ.`);
      return;
    }

    if (command.permission && !interaction.member.permissions.has(command.permission)) {
      return await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('RED')
            .setDescription(`Bạn cần quyền \`${command.permission}\` để sử dụng lệnh này.`)
        ]
      });
    } else {
      if (command.category === 'NSFW' && !interaction.channel.nsfw) {
        await interaction[interaction.deferred ? 'editReply' : interaction.replied ? 'followUp' : 'reply']({
          embeds: [
            new MessageEmbed()
              .setColor('RED')
              .setDescription('Bạn chỉ có thể sử dụng lệnh này trong các kênh có tính năng Age-Restricted/NSFW.')
              .setImage('https://i.imgur.com/oe4iK5i.gif')
          ],
          ephemeral: true
        });
      } else {
        try {
          await command.run({ interaction, bot, options: interaction.options, guild: interaction.guild });
        } catch (err) {
          console.log(err);

          await interaction[interaction.deferred ? 'editReply' : interaction.replied ? 'followUp' : 'reply']({
            embeds: [new MessageEmbed().setColor('RED').setDescription(err.message || 'Lỗi không mong muốn')]
          });
        }
      }
    }
  }
};
