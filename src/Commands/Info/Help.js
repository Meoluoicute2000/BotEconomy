const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { pretty } = require('../../Structures/Utils');

module.exports = {
  name: 'help',
  description: 'Nhận trợ giúp của bot!',
  category: 'Thông tin',
  async run({ interaction, bot }) {
    const set = new Set();
    bot.commands.forEach(cmd => set.add(cmd.category));
    const categories = [...set.values()];

    const home = {
      embeds: [
        new MessageEmbed()
          .setTitle(`Trợ giúp cho ${bot.user.username}`)
          .setDescription(
            categories
              .map(
                category =>
                  `**${category}**\n${bot.commands
                    .filter(cmd => cmd.category === category)
                    .map(cmd => `\`/${pretty(cmd.name)}\``)
                    .join(', ')}`
              )
              .join('\n')
          )
          .setColor('BLURPLE')
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setPlaceholder('Menu Chọn Trợ Giúp')
            .setCustomId('Help-Select-Menu')
            .addOptions(
              categories.map(category => {
                return {
                  label: category,
                  value: category,
                  description: `Các lệnh trong danh mục ${category}.`,
                  emoji: '🍒'
                };
              })
            )
        )
      ]
    };

    const homeButton = {
      label: 'Trang chủ',
      value: 'Home',
      description: 'Quay lại menu chính.',
      emoji: '🏠'
    };

    const m = await interaction.reply({
      ...home,
      fetchReply: true
    });

    const collector = m.createMessageComponentCollector({
      time: 1000 * 60 * 3
    });

    const syntax = cmd =>
      `\`/${pretty(cmd.name)}${
        cmd.options
          ? ` ${cmd.options
              .map(option => (option.required ? `<${pretty(option.name)}>` : `[${pretty(option.name)}]`))
              .join(' ')}`
          : ''
      }\``;

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id)
        return await i.reply({
          embeds: [new MessageEmbed().setColor('RED').setDescription(`Điều đó không dành cho bạn!`)],
          ephemeral: true
        });
      const val = i.values[0];
      if (val === 'Home') return await i.update(home);
      if (categories.includes(val))
        return await i.update({
          embeds: [
            new MessageEmbed()
              .setTitle(`Trợ giúp cho ${val}`)
              .setDescription(
                bot.commands
                  .filter(cmd => cmd.category === val)
                  .map(cmd => syntax(cmd))
                  .join(', ')
              )
              .setColor('BLURPLE')
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageSelectMenu()
                .setPlaceholder('Danh sách lệnh và Menu Chọn Trợ Giúp')
                .setCustomId('Commands-and-help-select-menu')
                .addOptions([
                  ...bot.commands
                    .filter(cmd => cmd.category === val)
                    .map(cmd => {
                      return {
                        label: pretty(cmd.name),
                        value: cmd.name,
                        description: cmd.description,
                        emoji: '🔧'
                      };
                    }),
                  homeButton
                ])
            )
          ]
        });

      const cmd = bot.commands.get(val);
      if (!cmd) return;

      await i.update({
        embeds: [
          new MessageEmbed()
            .setTitle(`Trợ giúp cho ${cmd.name}`)
            .setDescription(
              `
**Tên:** ${pretty(cmd.name)}
**Mô tả:** ${cmd.description}
**Danh mục:** ${cmd.category}
**Cú pháp:** ${syntax(cmd)}
        `
            )
            .setColor('BLURPLE')
        ],
        components: [
          new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setPlaceholder('Danh mục và Menu Chọn Trợ Giúp')
              .setCustomId('Category-and-help-command-menu')
              .addOptions([
                homeButton,
                {
                  label: cmd.category,
                  value: cmd.category,
                  description: `Các lệnh trong danh mục ${cmd.category}`,
                  emoji: '⭐'
                }
              ])
          )
        ]
      });
    });
  }
};
