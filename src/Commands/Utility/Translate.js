const { MessageEmbed } = require('discord.js');
const translate = require('@iamtraction/google-translate');
module.exports = {
  name: 'translate',
  description: 'Dịch văn bản.',
  options: [
    {
      name: 'input',
      description: 'Cung cấp văn bản.',
      type: 'STRING',
      required: true
    },
    {
      name: 'inputlanguage',
      type: 'STRING',
      description: 'Chọn ngôn ngữ nhập vào - Mặc định "Auto". ',
      required: false,
      choices: [
        {
          name: 'Auto-Detect',
          value: 'auto'
        },
        {
          name: 'English',
          value: 'en'
        },
        {
          name: 'Mandarin Chinese',
          value: 'zh-cn'
        },
        {
          name: 'Spanish',
          value: 'es'
        },
        {
          name: 'Hindi',
          value: 'hi'
        },
        {
          name: 'Arabic',
          value: 'ar'
        },
        {
          name: 'Malay',
          value: 'ms'
        },
        {
          name: 'Russian',
          value: 'ru'
        },
        {
          name: 'Bengali',
          value: 'bn'
        },
        {
          name: 'Portuguese',
          value: 'pt'
        },
        {
          name: 'French',
          value: 'fr'
        },
        {
          name: 'Hausa',
          value: 'ha'
        },
        {
          name: 'Punjabi',
          value: 'pa'
        },
        {
          name: 'German',
          value: 'de'
        },
        {
          name: 'Japanese',
          value: 'ja'
        },
        {
          name: 'Persian',
          value: 'fa'
        },
        {
          name: 'Swahili',
          value: 'sw'
        },
        {
          name: 'Vietnamese',
          value: 'vi'
        },
        {
          name: 'Telugu',
          value: 'te'
        },
        {
          name: 'Italian',
          value: 'it'
        },
        {
          name: 'Javanese',
          value: 'jw'
        },
        {
          name: 'Chinese Traditional',
          value: 'zh-tw'
        },
        {
          name: 'Korean',
          value: 'ko'
        },
        {
          name: 'Tamil',
          value: 'ta'
        },
        {
          name: 'Marathi',
          value: 'mr'
        }
      ]
    },
    {
      name: 'outputlanguage',
      type: 'STRING',
      description: 'Chọn ngôn ngũ cần dịch sang - Mặc định là "Tiếng Việt". ',
      required: false,
      choices: [
        {
          name: 'English',
          value: 'en'
        },
        {
          name: 'Mandarin Chinese',
          value: 'zh-cn'
        },
        {
          name: 'Spanish',
          value: 'es'
        },
        {
          name: 'Hindi',
          value: 'hi'
        },
        {
          name: 'Arabic',
          value: 'ar'
        },
        {
          name: 'Malay',
          value: 'ms'
        },
        {
          name: 'Russian',
          value: 'ru'
        },
        {
          name: 'Bengali',
          value: 'bn'
        },
        {
          name: 'Portuguese',
          value: 'pt'
        },
        {
          name: 'French',
          value: 'fr'
        },
        {
          name: 'Hausa',
          value: 'ha'
        },
        {
          name: 'Punjabi',
          value: 'pa'
        },
        {
          name: 'German',
          value: 'de'
        },
        {
          name: 'Japanese',
          value: 'ja'
        },
        {
          name: 'Persian',
          value: 'fa'
        },
        {
          name: 'Swahili',
          value: 'sw'
        },
        {
          name: 'Vietnamese',
          value: 'vi'
        },
        {
          name: 'Telugu',
          value: 'te'
        },
        {
          name: 'Italian',
          value: 'it'
        },
        {
          name: 'Javanese',
          value: 'jw'
        },
        {
          name: 'Chinese Traditional',
          value: 'zh-tw'
        },
        {
          name: 'Korean',
          value: 'ko'
        },
        {
          name: 'Tamil',
          value: 'ta'
        },
        {
          name: 'Marathi',
          value: 'mr'
        },
        {
          name: 'Urdu',
          value: 'ur'
        }
      ]
    }
  ],
  category: 'Tiện ích',
  async run({ interaction, bot }) {
    const input = interaction.options.getString('input');
    const translateFrom = interaction.options.get('inputlanguage')?.value || 'auto';
    const translateTo = interaction.options.get('outputlanguage')?.value || 'vi';

    translate(input, { from: translateFrom, to: translateTo }).then(res => {
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor('BLURPLE')
            .addField(`Từ cần dịch`, input)
            .addField(`Từ đã được dịch`, res.text)
            .setFooter({ text: `${translateFrom} ➜ ${translateTo}` })
        ]
      });
    });
  }
};