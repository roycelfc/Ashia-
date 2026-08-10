export async function menu(sock, message) {
  const text = `✦ Ashia
Comandos disponibles:
/ping
/menu
/perfil
/reputacion
/rep
/pareja
/cita
/besar
/abrazo
/pinterest
Algunas funciones todavía están en desarrollo.`;
  await sock.sendMessage(message.key.remoteJid, {
    text
  });
}
