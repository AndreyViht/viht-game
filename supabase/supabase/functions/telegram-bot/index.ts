// Setup: npm install -g supabase
// Login: supabase login
// Deploy: supabase functions deploy telegram-bot --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BOT_TOKEN = "8547341094:AAFgpWs1qXvUfdXq8w_39W1P_71DUwh4tZQ";

// !!! ВНИМАНИЕ !!!
// Сюда нужно вставить ссылку, которую ты получил на Netlify
const WEB_APP_URL = "https://helpful-manatee-cf042c.netlify.app/"; 

console.log(`Bot Function Started. Current WebApp URL: ${WEB_APP_URL}`);

serve(async (req) => {
  try {
    if (req.method === 'POST') {
      const update = await req.json();

      // 1. Обработка команды /start
      if (update.message && update.message.text === '/start') {
        const chatId = update.message.chat.id;
        await sendAuthRequest(chatId);
      } 
      // 2. Обработка нажатия на кнопку "Авторизоваться"
      else if (update.callback_query) {
        const cb = update.callback_query;
        if (cb.data === 'auth_me') {
          const userId = cb.from.id;
          const firstName = cb.from.first_name;
          const chatId = cb.message.chat.id;

          // Отвечаем на callback (чтобы убрать часики загрузки)
          await answerCallback(cb.id, "Авторизация успешна!");

          // Отправляем сообщение с ID, Secret Key и кнопкой ИГРАТЬ
          await sendAuthorizedMessage(chatId, userId, firstName);
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

// Шаг 1: Запрос авторизации
async function sendAuthRequest(chatId: number) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: "🔒 *Требуется авторизация*\n\nДля доступа к играм и личному кошельку, пожалуйста, подтвердите вход.",
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { 
              text: "✅ Авторизоваться", 
              callback_data: "auth_me" 
            }
          ]
        ]
      }
    })
  });
}

// Генерация псевдо-ключа (визуальная фича для красоты)
function generateSecretKey(userId: number) {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `VIHT-${userId.toString().slice(-4)}-${randomPart}`;
}

// Шаг 2: Уведомление об успехе и кнопка Игры
async function sendAuthorizedMessage(chatId: number, userId: number, name: string) {
  const secretKey = generateSecretKey(userId);

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `✅ *Вы успешно авторизованы!*\n\n👤 Имя: ${name}\n🆔 ID: \`${userId}\`\n🔑 Secret Key: \`${secretKey}\`\n\nВаш личный счет готов к работе.`,
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