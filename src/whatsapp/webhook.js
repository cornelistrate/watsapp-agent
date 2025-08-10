import dotenv from "dotenv";
import { handleIncomingMessage } from "./worker.js";
dotenv.config();

export function verifyWebhook(req, res) {
  const verify_token = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode && token && mode === "subscribe" && token === verify_token) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

export async function receiveWebhook(req, res) {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    if (messages && messages.length) {
      for (const msg of messages) {
        await handleIncomingMessage(value, msg);
      }
    }
    res.sendStatus(200);
  } catch (e) {
    console.error("Webhook processing error", e);
    res.sendStatus(200);
  }
}
