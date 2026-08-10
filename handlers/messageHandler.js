import { handleCommand } from "../commands/router.js";
export async function handleMessage(sock, message) {
  try {
    if (!message?.message) return;
    if (message.key?.fromMe) return;
    const jid = message.key.remoteJid;
    if (!jid) return;
    const text =
      message.message.conversation ||
      message.message.extendedTextMessage?.text ||
      message.message.imageMessage?.caption ||
      message.message.videoMessage?.caption ||
      "";
    if (!text.trim()) return;
    await handleCommand(sock, message, text.trim());
  } catch (error) {
    console.error("✦ Error procesando mensaje:", error);
  }
}
