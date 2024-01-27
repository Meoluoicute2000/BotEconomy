const { MessageEmbed } = require('discord.js');
const Anilist = require('anilist-node');
const anilist = new Anilist();

module.exports = {
  name: 'animesearch',
  description: 'Hiển thị thông tin về anime đã chỉ định.',
  options: [
    {
      name: 'anime',
      description: 'Cung cấp tên của anime.',
      required: true,
      type: 'STRING'
    }
  ],
  category: 'Tiện ích',
  async run({ interaction, bot }) {
    const anime_name = interaction.options.getString('anime');
    if (anime_name == undefined) return interaction.reply('Cú pháp không hợp lệ\nVui lòng cung cấp tên Anime.');

    const search = await anilist.search('anime', anime_name);
    if (typeof search.media[0] == 'undefined') return interaction.reply(`Không thể tìm thấy anime với tên ${anime}`);
    const anime = await anilist.media.anime(search.media[0].id);

    let animeDescription = anime.description.replace(/<[^>]*>?/gm, '');
    if (animeDescription.length > 1024)
      animeDescription = `${anime.description.replace(/<[^>]*>?/gm, '').substring(0, 1020)}...`;

    if (!interaction.channel.nsfw && anime.isAdult) {
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('RED')
            .setDescription(
              'Anime bạn tìm kiếm chứa nội dung dành cho người lớn.\nĐể xem chi tiết về anime, bạn phải sử dụng lệnh này trong các kênh có hạn chế độ tuổi/NSFW.'
            )
            .setImage('https://i.imgur.com/oe4iK5i.gif')
        ],
        ephemeral: true
      });
    } else {
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .setTitle(anime.title.english || anime.title.native || anime.title.romaji)
            .setURL(anime.siteUrl)
            .setImage(`https://img.anili.st/media/${anime.id}`)
            .setThumbnail(anime.coverImage.large)
            .addField('Tên Romaji', `${anime.title.romaji}`, true)
            .addField('Tên Tiếng Anh', `${anime.title.english}`, true)
            .addField('Tên Bản Xứ', `${anime.title.native}`, true)
            .addField('Quốc Gia Xuất Xứ', `${anime.countryOfOrigin}`, true)
            .addField('Tổng Số Tập', `${anime.episodes}`, true)
            .addField('Thời Lượng Mỗi Tập', `${anime.duration}`, true)
            .addField('Chứa Nội Dung Cho Người Lớn', `${anime.isAdult ? 'Có' : 'Không'}`, true)
        ]
      });
    }
  }
};