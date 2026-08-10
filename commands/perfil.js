import { getUser } from "../services/database.js";
export async function perfil(sock, message) {
  const jid = message.key.remoteJid;
  const userJid =
    message.key.participant ||
    jid;
  const user = getUser(userJid);
  const date = new Date(user.joinedAt)
    .toLocaleDateString("es-ES");
  const text = `✦ Perfil
Nombre: ${user.name}
Reputación: ${user.reputation}
Pareja: ${user.partner || "Ninguna"}
Miembro desde: ${date}`;
  await sock.sendMessage(jid, {
    text
  });
}
