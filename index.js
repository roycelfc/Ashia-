import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import pino from "pino";
import { handleMessage } from "./handlers/messageHandler.js";
const AUTH_FOLDER = "./auth";
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
  let pairingCodeRequested = false;
  sock.ev.on("connection.update", async (update) => {
    const {
      connection,
      lastDisconnect
    } = update;
    if (
      !pairingCodeRequested &&
      !state.creds.registered
    ) {
      pairingCodeRequested = true;
      try {
        const code =
          await sock.requestPairingCode(PHONE_NUMBER);
        console.log("\n✦ CÓDIGO DE VINCULACIÓN:");
        console.log(`✦ ${code}`);
        console.log(
          "✦ WhatsApp → Dispositivos vinculados → Vincular con número de teléfono\n"
        );
      } catch (error) {
        pairingCodeRequested = false;
        console.error(
          "✦ Error obteniendo código de vinculación:",
          error
        );
      }
    }
    if (connection === "open") {
      console.log("\n✦ Ashia está conectada.\n");
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
        console.log("✦ La sesión fue cerrada.");
      }
    }
  });
  sock.ev.on(
    "messages.upsert",
    async ({ messages }) => {
      for (const message of messages) {
        await handleMessage(sock, message);
      }
    }
  );
}
startAshia().catch((error) => {
  console.error("✦ Error crítico:", error);
});
