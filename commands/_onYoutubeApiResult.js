/*CMD
  command: /onYoutubeApiResult
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

let data = JSON.parse(content);

if (!data.success || !data.downloads || !data.thumbnail) {
  Api.sendMessage({
    chat_id: user.telegramid,
    text: "❌ Failed to fetch valid video data."
  });
  return;
}

let seen = {};
let filtered = [];

for (let i = 0; i < data.downloads.length; i++) {
  let d = data.downloads[i];
  if (!d || !d.url || !d.quality || !d.format) continue;

  let format = d.format.toLowerCase();
  let quality = d.quality.toLowerCase();
  let label = d.quality.trim();

  if (
    (format.includes("mp4") || format.includes("mp3") || quality.includes("mp4") || quality.includes("mp3")) &&
    !quality.includes("webm") &&
    d.url.startsWith("https://") &&
    !seen[label]
  ) {
    seen[label] = true;
    filtered.push({ text: label, url: d.url });
  }
}

function extractQualityNumber(text) {
  if (!text) return 0;
  let match = text.match(/(\d{3,4})p/);
  return match ? parseInt(match[1]) : (text.toLowerCase().includes("audio") || text.toLowerCase().includes("mp3") ? 1 : 0);
}

for (let i = 0; i < filtered.length; i++) {
  filtered[i].qualityNum = extractQualityNumber(filtered[i].text);
}

filtered.sort(function(a, b) {
  return b.qualityNum - a.qualityNum;
});

if (filtered.length === 0) {
  Api.sendMessage({
    chat_id: user.telegramid,
    text: "❌ No MP4 or MP3 formats found."
  });
  return;
}

User.setProperty("yt_links", filtered, "json");
User.setProperty("yt_thumb", data.thumbnail, "string");
User.setProperty("yt_title", data.title, "string");

let page = 0;
let perPage = 6;
let start = page * perPage;
let end = start + perPage;

let buttons = [];
let row = [];

for (let i = start; i < end && i < filtered.length; i++) {
  let b = filtered[i];
  row.push({ text: b.text, url: b.url });

  if (row.length === 3) {
    buttons.push(row);
    row = [];
  }
}
if (row.length > 0) buttons.push(row);

if (filtered.length > perPage) {
  buttons.push([
    { text: "➡️ Next", callback_data: "/yt_keyboard_page 1" }
  ]);
}

Api.sendPhoto({
  chat_id: user.telegramid,
  photo: data.thumbnail,
  caption: "🎬 *" + data.title + "*\n\nSelect a format to download:",
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: buttons
  }
});
