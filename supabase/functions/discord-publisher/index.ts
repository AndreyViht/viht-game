
// Deploy: npx supabase functions deploy discord-publisher --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ⚠️ ВСТАВЬ СЮДА ТОКЕН БОТА ИЗ DISCORD DEVELOPER PORTAL (Вкладка "Bot" -> "Reset Token")
const DISCORD_BOT_TOKEN = "ВСТАВЬ_СЮДА_ТОКЕН_БОТА"; 

const CLIENT_ID = "1455322242534736076"; // Твой ID приложения
const CHANNEL_ID = "1450486721878954006"; // Твой ID канала

const API_BASE = "https://discord.com/api/v10";

console.log("Discord Publisher Started");

serve(async (req) => {
  try {
    if (!DISCORD_BOT_TOKEN || DISCORD_BOT_TOKEN.includes("ВСТАВЬ")) {
      return new Response("Error: Bot Token not set in code", { status: 500 });
    }

    // 1. Получаем историю сообщений
    const historyResp = await fetch(`${API_BASE}/channels/${CHANNEL_ID}/messages?limit=5`, {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
    });
    
    if (!historyResp.ok) {
      const err = await historyResp.text();
      console.error("Failed to fetch messages", err);
      return new Response("Error fetching messages: " + err, { status: 500 });
    }

    const messages = await historyResp.json();
    const lastBotMessage = messages.find((m: any) => m.author.id === CLIENT_ID);

    // Ссылка на активность
    const activityUrl = `https://discord.com/activities/${CLIENT_ID}`;

    const messageBody = {
      content: "",
      embeds: [
        {
          title: "🎰 VIHT GAME CASINO",
          description: "Жми кнопку **PLAY**, чтобы начать игру!\n\n**Если не работает:**\nУбедись, что в Discord Developer Portal в разделе **Activities -> URL Mappings** добавлена ссылка на сайт.",
          color: 9123062, 
          image: {
            url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop"
          },
          footer: {
             text: "Viht Game • Online"
          }
        }
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: "🚀 PLAY / ИГРАТЬ",
              style: 5, // LINK
              url: activityUrl 
            }
          ]
        }
      ]
    };

    let result;

    if (lastBotMessage) {
      // Обновляем старое сообщение
      console.log(`Updating message ${lastBotMessage.id}...`);
      const updateResp = await fetch(`${API_BASE}/channels/${CHANNEL_ID}/messages/${lastBotMessage.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(messageBody)
      });
      result = await updateResp.json();
    } else {
      // Пишем новое
      console.log("Sending new message...");
      const postResp = await fetch(`${API_BASE}/channels/${CHANNEL_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(messageBody)
      });
      result = await postResp.json();
    }

    return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }
});
