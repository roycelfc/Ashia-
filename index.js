import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import express from "express";
import fs from "fs";
import path from "path";
import { handleMessage } from "./handlers/messageHandler.js";
const AUTH_FOLDER = "./auth";
// ─────────────────────────────
// QR
// ─────────────────────────────
const QR_FOLDER = path.join(
  process.cwd(),
  "Code QR"
);
const QR_FILE = path.join(
  QR_FOLDER,
  "ashia-qr.png"
);
async function saveQR(qr) {
  try {
    if (!fs.existsSync(QR_FOLDER)) {
      fs.mkdirSync(QR_FOLDER, {
        recursive: true
      });
    }
    await QRCode.toFile(
      QR_FILE,
      qr,
      {
        width: 300,
        margin: 4,
        type: "png"
      }
    );
    console.log(
      "✦ QR guardado como imagen:"
    );
    console.log(QR_FILE);
  } catch (error) {
    console.error(
      "✦ Error guardando el QR:",
      error
    );
  }
}
// ─────────────────────────────
// SERVIDOR WEB
// ─────────────────────────────
const app = express();
const PORT =
  process.env.PORT || 3000;
app.get("/", (req, res) => {
  const qrExists =
    fs.existsSync(QR_FILE);
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >
  <title>Ashia ✦</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #111;
      color: white;
      font-family: Arial, sans-serif;
      text-align: center;
    }
    .box {
      padding: 30px;
    }
    h1 {
      margin-bottom: 10px;
    }
    p {
      color: #bbb;
    }
    img {
      width: 300px;
      max-width: 85vw;
      background: white;
      padding: 10px;
      border-radius: 12px;
    }
  </style>
</head>
<body>
  <div class="box">
    <h1>Ashia ✦</h1>
    ${
      qrExists
        ? `
          <p>
            Escanea este código QR
            con WhatsApp
          </p>
          <img
            src="/qr-image?t=${Date.now()}"
            alt="Código QR de Ashia"
          >
        `
        : `
          <p>
            Esperando el código QR...
          </p>
        `
    }
  </div>
</body>
</html>
  `);
});
// Ruta /qr
app.get("/qr", (req, res) => {
  res.redirect("/");
});
// Imagen del QR
app.get("/qr-image", (req, res) => {
  if (!fs.existsSync(QR_FILE)) {
    return res
      .status(404)
      .send("QR todavía no disponible.");
  }
  res.sendFile(QR_FILE);
});
app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `✦ Servidor web iniciado en el puerto ${PORT}`
    );
  }
);
// ─────────────────────────────
// WHATSAPP
// ─────────────────────────────
async function startAshia() {
  console.log(
    "✦ Iniciando Ashia..."
  );
  const {
    state,
    saveCreds
  } = await useMultiFileAuthState(
    AUTH_FOLDER
  );
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
      // ─────────────────────
      // QR
      // ─────────────────────
      if (qr) {
        console.log(
          "\n✦ Nuevo código QR:\n"
        );
        // QR pequeño en terminal
        qrcode.generate(
          qr,
          {
            small: true
          }
        );
        // QR como imagen PNG
        await saveQR(qr);
      }
      // ─────────────────────
      // CONECTADO
      // ─────────────────────
      if (
        connection === "open"
      ) {
        console.log(
          "\n✦ Ashia está conectada.\n"
        );
      }
      // ─────────────────────
      // DESCONECTADO
      // ─────────────────────
      if (
        connection === "close"
      ) {
        const statusCode =
          lastDisconnect
            ?.error
            ?.output
            ?.statusCode;
        const shouldReconnect =
          statusCode !==
          DisconnectReason.loggedOut;
        console.log(
          "✦ Conexión cerrada."
        );
        if (
          shouldReconnect
        ) {
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
  // ─────────────────────
  // MENSAJES
  // ─────────────────────
  sock.ev.on(
    "messages.upsert",
    async ({
      messages
    }) => {
      for (
        const message
        of messages
      ) {
        await handleMessage(
          sock,
          message
        );
      }
    }
  );
}
// ─────────────────────────────
// INICIO
// ─────────────────────────────
startAshia().catch(
  (error) => {
    console.error(
      "✦ Error crítico:",
      error
    );
  }
);
