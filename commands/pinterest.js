import {
  isPinterestUrl,
  downloadPinterest
} from "../services/pinterest.js";
export async function pinterest(sock, message, args) {
  const jid = message.key.remoteJid;
  const url = args[0];
  if (!url || !isPinterestUrl(url)) {
    await sock.sendMessage(jid, {
      text: "Envíame un enlace válido de Pinterest. ✦"
    });
    return;
  }
  await sock.sendMessage(jid, {
    text: "Estoy revisando el Pin... ✦"
  });
  try {
    const result = await downloadPinterest(url);
    if (!result) {
      throw new Error("Sin resultado");
    }
    await sock.sendMessage(jid, {
      text: "Listo. ✦"
    });
  } catch (error) {
    console.error("Pinterest:", error);
    await sock.sendMessage(jid, {
      text: "No pude obtener ese contenido. Inténtalo con otro Pin."
    });
  }
}
