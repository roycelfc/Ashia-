export async function handleMessage(update, env) {
  if (!update?.message?.text) {
    return;
  }

  const message = update.message;
  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text === "/ping") {
    await sendMessage(
      env.TELEGRAM_BOT_TOKEN,
      chatId,
      "✦ Pong. Ashia está viva."
    );
  }
}

async function sendMessage(token, chatId, text) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text
      })
    }
  );

  const result = await response.text();

  console.log("Telegram:", result);

  if (!response.ok) {
    throw new Error(result);
  }
}
