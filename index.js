import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import pino from "pino";
import { handleMessage } from "./handlers/messageHandler.js";
const AUTH_FOLDER = "./auth";
// Número de WhatsApp de Ashia.
// Cuba: +53
const PHONE_NUMBER = "5354671816";
async function startAshia() {
  console.log("✦ Iniciando Ashia...");
  const { state, saveCreds } =
    await useMultiFileAuthState(AUTH_FOLDER);
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false
  });
  sock.ev.on("creds.update", saveCreds);
  let pairingRequested = false;
  sock.ev.on("connection.update", async (update) => {
    const {
      connection,
      lastDisconnect
    } = update;
    // Solicitar código de vinculación
    // solamente si todavía no existe una sesión registrada.
    if (
      connection === "connecting" &&
      !state.creds.registered &&
      !pairingRequested
    ) {
      pairingRequested = true;
      try {
        // Esperamos un poco para que la conexión esté preparada.
        await new Promise((resolve) =>
          setTimeout(resolve, 1500)
        );
        const code =
          await sock.requestPairingCode(
            PHONE_NUMBER
          );
        console.log("\n✦ CÓDIGO DE VINCULACIÓN:\n");
        console.log(code);
        console.log(
          "\n✦ En WhatsApp ve a Dispositivos vinculados."
        );
        console.log(
          "✦ Elige 'Vincular dispositivo con número de teléfono'."
        );
        console.log(
          "✦ Introduce el código mostrado arriba.\n"
        );
      } catch (error) {
        console.error(
          "✦ Error obteniendo código de vinculación:",
          error
        );
        pairingRequested = false;
      }
    }
    if (connection === "open") {
      console.log(
        "\n✦ Ashia está conectada.\n"
      );
    }
    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect =
        statusCode !== DisconnectReason.loggedOut;
      console.log("✦ Conexión cerrada.");
      if (shouldReconnect) {
        console.log("✦ Reconectando...");
        startAshia();
      } else {
        console.log(
          "✦ La sesión fue cerrada."
        );
      }
    }
  });
  sock.ev.on(
    "messages.upsert",
    async ({ messages }) => {
      for (const message of messages) {
        await handleMessage(
          sock,
          message
        );
      }
    }
  );
}
startAshia().catch((error) => {
  console.error(
    "✦ Error crítico:",
    error
  );
});
