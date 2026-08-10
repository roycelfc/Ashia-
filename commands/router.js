import { ping } from "./ping.js";
import { menu } from "./menu.js";
import { perfil } from "./perfil.js";
import { reputacion } from "./reputacion.js";
import { pareja } from "./pareja.js";
import { cita } from "./cita.js";
import { besar } from "./besar.js";
import { abrazo } from "./abrazo.js";
import { pinterest } from "./pinterest.js";
const commands = {
  "/ping": ping,
  "/menu": menu,
  "/perfil": perfil,
  "/reputacion": reputacion,
  "/rep": reputacion,
  "/pareja": pareja,
  "/cita": cita,
  "/besar": besar,
  "/besar": besar,
  "/abrazo": abrazo,
  "/pinterest": pinterest
};
export async function handleCommand(sock, message, text) {
  if (!text.startsWith("/")) return;
  const parts = text.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  const handler = commands[command];
  if (!handler) {
    await sock.sendMessage(message.key.remoteJid, {
      text: "No conozco ese comando todavía. ✦"
    });
    return;
  }
  await handler(sock, message, args);
}
