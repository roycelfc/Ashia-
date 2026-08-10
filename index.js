import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
const AUTH_FOLDER = "./auth";
async function startAshia() {
  console.log("✦ Iniciando Ashia...");
  const { state, saveCreds } =
    await useMultiFileAuthState(AUTH_FOLDER);
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" })
  });
  // Guardar la sesión de WhatsApp
  sock.ev.on("creds.update", saveCreds);
  // Estado de conexión
  sock.ev.on("connection.update", (update) => {
    const {
      connection,
      lastDisconnect,
      qr
    } = update;
    // Mostrar QR
    if (qr) {
      console.log("\n✦ Escanea este QR desde WhatsApp:\n");
      qrcode.generate(qr, {
        small: true
      });
    }
    // Conectado
    if (connection === "open") {
      console.log("\n✦ Ashia está conectada a WhatsApp.\n");
    }
    // Desconectado
    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect =
        statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log("✦ Reconectando...");
        startAshia();
      } else {
        console.log(
          "✦ Sesión cerrada. Vuelve a vincular WhatsApp."
        );
      }
    }
  });
  // Recibir mensajes
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const message of messages) {
      if (!message?.message) continue;
      if (message.key?.fromMe) continue;
      const jid = message.key.remoteJid;
      const text =
        message.message.conversation ||
        message.message.extendedTextMessage?.text ||
        "";
      if (!text.trim()) continue;
      const command = text.trim().toLowerCase();
      // Primer comando de prueba
      if (command === "/ping") {
        await sock.sendMessage(jid, {
          text: "Pong. ✦"
        });
      }
      // Menú inicial
      if (command === "/menu") {
        await sock.sendMessage(jid, {
          text:
`✦ Ashia
/ping
/menu
Estoy comenzando a conocerte.`
        });
      }
    }
  });
}
startAshia().catch((error) => {
  console.error("✦ Error al iniciar Ashia:", error);
});
