
const axios = require("axios");

const BOT_TOKEN = "8400528150:AAGtzfSpSvD6HgauHwg7Nw3sGElQx1Ug4rg";
const CHAT_ID = "@HumanidFi";

async function testBot() {
    console.log("Testing Telegram Bot...");
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
    
    try {
        const me = await axios.get(url);
        console.log("✅ Bot Connected:", me.data.result.username);
        
        console.log("Sending test message to", CHAT_ID);
        const sendUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const res = await axios.post(sendUrl, {
            chat_id: CHAT_ID,
            text: "🔔 <b>SISTEMA REINICIADO</b> | El bot de señales está operativo nuevamente.",
            parse_mode: "HTML"
        });
        
        if (res.data.ok) {
            console.log("✅ Message sent successfully!");
        } else {
            console.error("❌ Message failed:", res.data);
        }

    } catch (e) { // Remove type annotation 'any' for JS/TS mix compatibility if needed, or keep if ts-node handles it
        console.error("❌ Error:", e.response ? e.response.data : e.message);
    }
}

testBot();
