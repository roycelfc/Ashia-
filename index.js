import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { handleMessage } from "./handlers/messageHandler.js";
const AUTH_FOLDER = "./auth";
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
  sock.ev.on("connection.update", (update) => {
    const {
      connection,
      lastDisconnect,
      qr
    } = update;
    if (qr) {
      console.log("\n✦ Escanea el código QR:\n");
      qrcode.generate(qr, {
        small: true
      });
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
        await handleMessage(sock, message);
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
