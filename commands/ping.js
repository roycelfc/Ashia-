export async function ping(sock, message) {
  await sock.sendMessage(message.key.remoteJid, {
    text: "Pong. ✦"
  });
}
