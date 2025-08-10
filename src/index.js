import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { verifyWebhook, receiveWebhook } from "./whatsapp/webhook.js";

dotenv.config();
const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

// Health
app.get("/", (req, res) => res.send("ProtoTech 3D WhatsApp agent is up."));

// WhatsApp Webhook Verify
app.get("/webhook", verifyWebhook);

// WhatsApp Webhook Receive
app.post("/webhook", receiveWebhook);

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`WhatsApp agent listening on :${PORT}`));
