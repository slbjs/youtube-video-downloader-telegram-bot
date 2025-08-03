/*CMD
  command: *
  help: 
  need_reply: true
  auto_retry_time: 
  folder: 
  answer: Please send a valid YouTube URL.

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

HTTP.get({
  url: "https://yt-down.sl-bjs.workers.dev/?down=" + encodeURIComponent(message),
  success: "/onYoutubeApiResult",
  error: "/onYoutubeApiError"
});
