// Setup: npm install -g supabase
// Login: supabase login
// Deploy: supabase functions deploy telegram-bot --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BOT_TOKEN = "8547341094:AAFgpWs1qXvUfdXq8w_39W1P_71DUwh4tZQ";
const ADMIN_ID = 1464327605;

// Ссылка на WebApp
const WEB_APP_URL = "https://helpful-manatee-cf042c.netlify.app/"; 

console.log(`Bot Function Started. Admin ID: ${ADMIN_ID}`);

serve(async (req) => {
  try {
    if (req.method === 'POST') {
      const update = await req.json();

      // 1. Обработка команды /start
      if (update.message && update.message.text === '/start') {
        const chatId = update.message.chat.id;
        const userId = update.message.from.id;
        await sendMainMenu(chatId, userId);
      } 
      // 2. Обработка кнопок
      else if (update.callback_query) {
        const cb = update.callback_query;
        const userId = cb.from.id;
        const chatId = cb.message.chat.id;

        if (cb.data === 'auth_me') {
          await answerCallback(cb.id, "Авторизация успешна!");
          await sendAuthorizedMessage(chatId, userId, cb.from.first_name);
        } else if (cb.data === 'my_id') {
           const secret = generateSecretKey(userId);
           await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🆔 *Ваш профиль*\n\nID: \`${userId}\`\n🔑 Secret Key: \`${secret}\`\n\nНикому не сообщайте этот ключ!`,
              parse_mode: 'Markdown'
            })
          });
          await answerCallback(cb.id, "");
        }
      }

      return new Response("OK", { status: 200 });
    }
    return new Response("Only POST allowed", { status: 405 });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(error.message, { status: 500 });
  }
})

async function sendMainMenu(chatId: number, userId: number) {
  // Базовые кнопки
  const keyboard: any[] = [
    [ { text: "✅ Авторизоваться", callback_data: "auth_me" } ],
    [ { text: "🆔 Мой ID", callback_data: "my_id" } ]
  ];

  // Кнопка админа УБРАНА по запросу, доступ теперь скрытый внутри WebApp

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: "👋 Добро пожаловать в Viht Casino!",
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: keyboard
      }
    })
  });
}

function generateSecretKey(userId: number) {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `VIHT-${userId.toString().slice(-4)}-${randomPart}`;
}

async function sendAuthorizedMessage(chatId: number, userId: number, name: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `✅ *Вы успешно авторизованы!*\n\n👤 Имя: ${name}\n\nНажмите кнопку ниже, чтобы начать играть.`,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { 
              text: "🚀 ИГРАТЬ", 
              web_app: { url: WEB_APP_URL } 
            }
          ]
        ]
      }
    })
  });
}

async function answerCallback(callbackQueryId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text
    })
  });
}