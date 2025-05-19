require('dotenv').config(); // Set HEROKU_API=https://generic709.herokuapp.com
                            // npm install dotenv

const readline = require('readline');
const tickers = require('./tickers');

const API_URL = process.env.HEROKU_API;
const columnWidth = 20;
const rowsPerColumn = 30;
const statusLine = 40;
const dataLogLine = 45;
const startTime = Date.now();
const specialChars = ['*', '%', '$', '&', '@', '!', '^', '~', '+', '?', '/', '|', '<', '>'];
let fetchCount = 0;

console.clear();

function drawTickers() {
  for (let i = 0; i < tickers.length; i++) {
    const column = Math.floor(i / rowsPerColumn);
    const row = i % rowsPerColumn;
    const label = tickers[i];
    const padding = '-'.repeat(columnWidth - label.length);
    readline.cursorTo(process.stdout, column * columnWidth, row);
    process.stdout.write(`\x1b[33m${label}${padding}`);
  }
}

function logStats() {
  const elapsed = (Date.now() - startTime) / 1000;
  const minutes = Math.floor(elapsed / 60);
  const seconds = String(Math.floor(elapsed % 60)).padStart(2, '0');
  const rate = Math.floor(fetchCount / elapsed);

  readline.cursorTo(process.stdout, 3, dataLogLine);
  process.stdout.write(`Data Received: ${fetchCount}`);
  readline.cursorTo(process.stdout, 3, dataLogLine + 1);
  process.stdout.write(`Time Elapsed: ${minutes}:${seconds}`);
  readline.cursorTo(process.stdout, 3, dataLogLine + 2);
  process.stdout.write(`Rate: ${rate}x`);
}

async function updatePrices() {
  for (let i = 0; i < tickers.length; i++) {
    const ticker = tickers[i];
    let quote;

    try {
      const response = await fetch(`${API_URL}/stockc/${ticker}`);
      quote = await response.json();
    } catch {
      return;
    }

    if (!quote) return;

    const column = Math.floor(i / rowsPerColumn);
    const row = i % rowsPerColumn;
    const priceText = `${quote.price.toFixed(2)}${specialChars[Math.floor(Math.random() * specialChars.length)]}`;

    readline.cursorTo(process.stdout, (column + 1) * columnWidth - 13, row);
    process.stdout.write(`\x1b[37m${priceText}`);
    
    fetchCount++;

    if (fetchCount % 250 === 0) logStats();
  }
}

drawTickers();
readline.cursorTo(process.stdout, 0, statusLine);
console.log(" ");
setInterval(updatePrices, 500);
