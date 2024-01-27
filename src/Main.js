const config = require('./Structures/Config');
const Bot = require('./Structures/Bot');
const figlet = require('figlet');
const express = require('express');
const path = require('path');

const bot = new Bot(config);

//Discord.js 13.6.0

//Hosting Web
const app = express();
const port = 3000;
app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});
app.listen(port, () => console.log(`|  🔗 Cherry đang mở cổng : ${port}`));

bot.start();

/* Xử lý lỗi (Rất không khuyến khích). Để sử dụng nó, hãy xóa nhận xét khỏi dòng bên dưới.^^ */
// process.on('uncaughtException', console.error);
// process.on('unhandledRejection', console.error);
