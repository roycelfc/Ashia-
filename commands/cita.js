import { getUser, updateUser } from "../services/database.js";
export async function cita(sock, message) {
  const jid = message.key.remoteJid;
  const target =
    message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!target) {
    await sock.sendMessage(jid, {
      text: "Menciona a la persona con la que quieres tener una cita. ✦"
    });
    return;
  }
  const sender =
    message.key.participant ||
    jid;
  getUser(sender);
  getUser(target);
  updateUser(target, {
    pendingDateRequest: sender
  });
  await sock.sendMessage(jid, {
    text: `He enviado tu invitación a @${target.split("@")[0]}. ✦`,
    mentions: [target]
  });
  await sock.sendMessage(target, {
    text: `@${sender.split("@")[0]} quiere tener una cita contigo. ✦\n\nUsa /aceptar o /rechazar.`,
    mentions: [sender]
  });
}
