import { menu } from "./menu.js";
import { ping } from "./ping.js";
import { perfil } from "./perfil.js";
import { reputacion } from "./reputacion.js";
import { pareja } from "./pareja.js";
import { cita } from "./cita.js";
import { besar } from "./besar.js";
import { abrazo } from "./abrazo.js";
import { pinterest } from "./pinterest.js";
const commands = {
  menu,
  ping,
  perfil,
  reputacion,
  rep: reputacion,
  pareja,
  cita,
  besar,
  abrazo,
  pinterest
};
export async function handleCommand(sock, message, text) {
  const parts = text.trim().split(/\s+/);
  const commandName = parts[0]
    .toLowerCase()
    .replace(/^\//, "");
  const args = parts.slice(1);
  const command = commands[commandName];
  if (!command) {
    return;
  }
  try {
    await command(sock, message, args);
  } catch (error) {
    console.error(`✦ Error en /${commandName}:`, error);
    await sock.sendMessage(message.key.remoteJid, {
      text: "✦ Ocurrió un error al ejecutar ese comando."
    });
  }
}
