import { getUser } from "../services/database.js";
export async function pareja(sock, message) {
  const jid = message.key.remoteJid;
  const userJid =
    message.key.participant ||
    jid;
  const user = getUser(userJid);
  if (!user.partner) {
    await sock.sendMessage(jid, {
      text: "No tienes pareja registrada. ✦"
    });
    return;
  }
  await sock.sendMessage(jid, {
    text: `✦ Tu pareja es @${user.partner.split("@")[0]}.`,
    mentions: [user.partner]
  });
}
