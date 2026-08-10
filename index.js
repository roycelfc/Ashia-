import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { handleMessage } from "./handlers/messageHandler.js";
const AUTH_FOLDER = "./auth";
const QR_FOLDER = path.join(process.cwd(), "Code QR");
const QR_FILE = path.join(QR_FOLDER, "ashia-qr.png");
async function saveQR(qr) {
  try {
    if (!fs.existsSync(QR_FOLDER)) {
      fs.mkdirSync(QR_FOLDER, {
        recursive: true
      });
    }
    await QRCode.toFile(QR_FILE, qr, {
      width: 300,
      margin: 4,
      type: "png"
    });
    console.log("✦ QR creado como imagen:");
    console.log(QR_FILE);
  } catch (error) {
    console.error(
      "✦ Error creando la imagen QR:",
      error
    );
  }
}
async function startAshia() {
  console.log("✦ Iniciando Ashia...");
  const { state, saveCreds } =
    await useMultiFileAuthState(AUTH_FOLDER);
  const sock = makeWASocket({
    auth: state,
    logger: pino({
      level: "silent"
    }),
    printQRInTerminal: false
  });
  sock.ev.on(
    "creds.update",
    saveCreds
  );
  sock.ev.on(
    "connection.update",
    async (update) => {
      const {
        connection,
        lastDisconnect,
        qr
      } = update;
      if (qr) {
        console.log(
          "\n✦ Nuevo código QR:\n"
        );
        // Mantiene el QR en la terminal
        qrcode.generate(qr, {
          small: true
        });
        // Guarda el mismo QR como imagen
        await saveQR(qr);
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
          statusCode !==
          DisconnectReason.loggedOut;
        console.log(
          "✦ Conexión cerrada."
        );
        if (shouldReconnect) {
          console.log(
            "✦ Reconectando..."
          );
          startAshia();
        } else {
          console.log(
            "✦ La sesión fue cerrada."
          );
        }
      }
    }
  );
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
