import axios from "axios";
import fs from "fs";
import path from "path";

const BOT_TOKEN = "8400528150:AAGtzfSpSvD6HgauHwg7Nw3sGElQx1Ug4rg";
const TARGET_CHAT_ID = "@HumanidFi"; 
const TOPIC_ID = 1367;

async function sendUpdate() {
  const updatePath = path.join("C:/Users/admin/.gemini/antigravity/brain/1024aa47-33e0-4581-8783-a72a4f7bb8ab/telegram_update.md");
  const content = fs.readFileSync(updatePath, "utf-8");

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const res = await axios.post(url, {
      chat_id: TARGET_CHAT_ID,
      text: content,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      message_thread_id: TOPIC_ID
    });
    console.log(" Update sent to Telegram:", res.data.ok);
  } catch (e: any) {
    console.error(" Error sending to Telegram:", e.response?.data || e.message);
  }
}

sendUpdate();
