const commands = {
  menu: "../commands/menu.js",
  ping: "../commands/ping.js",
  perfil: "../commands/perfil.js",
  reputacion: "../commands/reputacion.js",
  pareja: "../commands/pareja.js",
  cita: "../commands/cita.js",
  besar: "../commands/besar.js",
  abrazo: "../commands/abrazo.js",
  pinterest: "../commands/pinterest.js"
};

export async function handleCommand(sock, message, text) {
  const parts = text.trim().split(/\s+/);
  const commandName = parts[0].toLowerCase().replace("/", "");
  const args = parts.slice(1);

  if (!commands[commandName]) {
    return;
  }

  try {
    const module = await import(commands[commandName]);

    if (typeof module.default === "function") {
      await module.default(sock, message, args);
      return;
    }

    if (typeof module.execute === "function") {
      await module.execute(sock, message, args);
      return;
    }

    if (typeof module[commandName] === "function") {
      await module[commandName](sock, message, args);
    }
  } catch (error) {
    console.error(`✦ Error en /${commandName}:`, error);
  }
}
