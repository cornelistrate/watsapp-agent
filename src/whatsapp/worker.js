import axios from "axios";
import dotenv from "dotenv";
import { detectIntent, extractEntities } from "../nlp/intent.js";
import { createCalendarEvent } from "../services/calendar.js";
import { sendMail } from "../services/email.js";
import { transcribeAudio } from "../services/stt.js";
import { synthesizeReply } from "../services/tts.js";

dotenv.config();

const WA_BASE = "https://graph.facebook.com/v20.0/";

async function sendWhatsAppText(to, text) {
  const url = `${WA_BASE}${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  await axios.post(url, {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text }
  }, {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
    }
  });
}

async function sendWhatsAppAudio(to, audioUrl) {
  // audioUrl must be a publicly accessible URL (e.g., S3); for PoC we stick to text.
  const url = `${WA_BASE}${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  await axios.post(url, {
    messaging_product: "whatsapp",
    to,
    type: "audio",
    audio: { link: audioUrl } // Should be https link to audio file
  }, {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
    }
  });
}

async function fetchMediaUrl(mediaId) {
  const url = `${WA_BASE}${mediaId}`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` }
  });
  return data.url;
}

async function downloadMedia(fileUrl) {
  const { data } = await axios.get(fileUrl, {
    responseType: "arraybuffer",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` }
  });
  return Buffer.from(data);
}

export async function handleIncomingMessage(value, msg) {
  const from = msg.from; // phone number
  let text = "";

  if (msg.type === "text") {
    text = msg.text?.body || "";
  } else if (msg.type === "audio" || msg.type === "voice") {
    try {
      const mediaId = msg.audio?.id || msg.voice?.id;
      const mediaUrl = await fetchMediaUrl(mediaId);
      const bin = await downloadMedia(mediaUrl);
      text = await transcribeAudio(bin); // placeholder -> integrate real STT
    } catch (e) {
      console.error("STT failed", e);
      text = "";
    }
  } else if (msg.type === "document") {
    text = `Am primit documentul: ${msg.document?.filename}. Te rog descrie pe scurt cerințele ca să facem oferta.`;
    await sendWhatsAppText(from, text);
    return;
  } else {
    await sendWhatsAppText(from, "Salut! Spune-mi cu ce te pot ajuta: ofertă, programare, comandă sau informații.");
    return;
  }

  const intent = detectIntent(text);
  const entities = extractEntities(text);

  switch (intent) {
    case "APPOINTMENT":
      if (!entities.datetime) {
        await sendWhatsAppText(from, "Pentru programare, spune data și ora dorită (ex: marți la 14:30 sau 12 septembrie, ora 10).");
        break;
      }
      try {
        const ev = await createCalendarEvent(entities);
        await sendWhatsAppText(from, `Programare creată: ${ev.summary} – ${ev.start.dateTime}. Vei primi email de confirmare.`);
        if (entities.email) {
          await sendMail({
            to: entities.email,
            subject: "Confirmare programare – ProtoTech 3D",
            text: `Programarea ta a fost creată pentru ${ev.start.dateTime} – ${ev.summary}.`
          });
        }
      } catch (e) {
        console.error(e);
        await sendWhatsAppText(from, "Nu am reușit să creez programarea. Încearcă din nou sau oferă o altă oră.");
      }
      break;

    case "ORDER":
      await sendWhatsAppText(from, "Perfect. Te rog să trimiți fișierul CAD (STL/STEP/OBJ) și detaliile: material, cantitate, deadline. Vom reveni cu devizul.");
      break;

    case "QUOTE":
      await sendWhatsAppText(from, "Sigur. Trimite fișierul CAD și cerințele (material, cantitate, toleranțe). Îți facem ofertă în 24h.");
      break;

    default:
      await sendWhatsAppText(from, "Pot ajuta cu: programări, comenzi, oferte, informații despre servicii. Spune-mi ce ai nevoie.");
  }
}
