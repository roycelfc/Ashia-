import fs from "node:fs";
import path from "node:path";
const MEDIA_DIR = "./media/hug";
export async function abrazo(sock, message) {
  const jid = message.key.remoteJid;
  if (!fs.existsSync(MEDIA_DIR)) {
    await sock.sendMessage(jid, {
      text: "Todavía no tengo contenido para eso. ✦"
    });
    return;
  }
  const files = fs.readdirSync(MEDIA_DIR)
    .filter(file =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
  if (!files.length) {
    await sock.sendMessage(jid, {
      text: "Todavía no tengo contenido para eso. ✦"
    });
    return;
  }
  const selected =
    files[Math.floor(Math.random() * files.length)];
  await sock.sendMessage(jid, {
    image: {
      url: path.join(MEDIA_DIR, selected)
    }
  });
}
