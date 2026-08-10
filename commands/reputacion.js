import { getUser, updateUser } from "../services/database.js";
export async function reputacion(sock, message, args) {
  const jid = message.key.remoteJid;
  const target =
    message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!target) {
    const userJid =
      message.key.participant ||
      jid;
    const user = getUser(userJid);
    await sock.sendMessage(jid, {
      text: `✦ Tu reputación es ${user.reputation}.`
    });
    return;
  }
  const user = getUser(target);
  await sock.sendMessage(jid, {
    text: `✦ Reputación de @${target.split("@")[0]}
${user.reputation} puntos.`,
    mentions: [target]
  });
}
