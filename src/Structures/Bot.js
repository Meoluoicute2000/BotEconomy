const { Client, Collection } = require('discord.js');
const { connect } = require('mongoose');
const { search } = require('./Utils');
const consola = require('consola');
require('dotenv').config();
const Config = require('./Config');
const { mongoose } = require('mongoose');
const watermark = require('../Models/Watermark');

mongoose.set('strictQuery', false);

module.exports = class Bot extends Client {
  constructor(config) {
    super(config.botOptions);
    this.config = config;
    this.commands = new Collection();
    this.logger = consola;
  }

  async start() {
    console.log('|  🚀 Đang bắt đầu khởi động bot...');

    await this.loadOperations();

    console.log('|  📡 Đang kết nối tới MongoDB...');
    await connect("mongodb+srv://Che12345:Kidtomboy@che1234.qphfxge.mongodb.net/?retryWrites=true&w=majority");

    console.log('|  🔑 Đăng nhập vào Discord...');
    await this.login(`TOKEN`);

    if (Config.guildOnly.enabled == true && Config.guildOnly.guildID != '') {
      const guild = this.guilds.cache.get(Config.guildOnly.guildID);
      if (guild) {
        console.log(`|  🍔 Chế độ chỉ dành cho guild được kích hoạt. Đang đăng ký lệnh trong guild có ID ${Config.guildOnly.guildID}`);
        await guild.commands.set(this.commands);
      } else {
        console.error(`|  ❌ Guild với ID ${Config.guildOnly.guildID} không được tìm thấy.`);
      }
    } else {
      console.log('|  🍔 Đăng ký lệnh toàn cầu...');
      await this.application.commands.set(this.commands);
    }

    console.log('|  ✅ Bot đã sẵn sàng!');
  }

  async loadOperations() {
    console.log('|  🔄 Đang tải các hoạt động...');

    const commands = await search(`${__dirname}/../Commands/**/*.js`);
    commands.forEach(commandName => {
      const command = require(commandName);
      this.commands.set(command.name, command);
    });

    console.log(`|  📦 Đang tải ${commands.length} lệnh.`);

    const events = await search(`${__dirname}/../Events/*.js`);
    events.forEach(eventName => {
      const event = require(eventName);
      this.on(event.event, event.run.bind(null, this));
    });

    console.log(`|  📅 Đã tải ${events.length} sự kiện.`);
  }
};
watermark.printWatermark();
