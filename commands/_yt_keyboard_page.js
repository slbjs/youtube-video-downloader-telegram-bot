/*CMD
  command: /yt_keyboard_page
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

let links = User.getProperty("yt_links");

if (!links || links.length === 0) {
  Api.answerCallbackQuery({
    callback_query_id: request.id,
    text: "❌ No data found"
  });
  return;
}

let parts = message.split(" ");
let page = parseInt(parts[1] || "0");
if (isNaN(page)) page = 0;

let perPage = 6;
let total = links.length;
let totalPages = Math.ceil(total / perPage);

if (page < 0) page = 0;
if (page >= totalPages) page = totalPages - 1;

let start = page * perPage;
let end = start + perPage;

let buttons = [];
let row = [];

for (let i = start; i < end && i < links.length; i++) {
  let b = links[i];
  row.push({ text: b.text, url: b.url });

  if (row.length === 3) {
    buttons.push(row);
    row = [];
  }
}
if (row.length > 0) buttons.push(row);

let nav = [];
if (page > 0) {
  nav.push({ text: "⬅️ Back", callback_data: "/yt_keyboard_page " + (page - 1) });
}
if (end < links.length) {
  nav.push({ text: "➡️ Next", callback_data: "/yt_keyboard_page " + (page + 1) });
}
if (nav.length > 0) buttons.push(nav);

Api.editMessageReplyMarkup({
  chat_id: user.telegramid,
  message_id: request.message.message_id,
  reply_markup: {
    inline_keyboard: buttons
  }
});
