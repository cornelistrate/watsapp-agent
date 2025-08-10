require('dotenv').config();
const stt = require('../services/stt');
const tts = require('../services/tts');
const calendar = require('../services/calendar');
const emailService = require('../services/email');

// Helper to send message back via WhatsApp Cloud API
async function sendWhatsAppText(to, text) {
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
  const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text }
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
    },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    console.error('Failed to send message', await resp.text());
  }
}

exports.processMessage = async (message, context) => {
  const from = message.from;
  let text = '';
  if (message.type === 'text') {
    text = message.text.body;
  } else if (message.type === 'audio') {
    // Download and transcribe audio (stub)
    const mediaId = message.audio.id;
    text = await stt.transcribe(mediaId);
  } else {
    // other message types
    await sendWhatsAppText(from, 'Sorry, I can only process text and voice messages for now.');
    return;
  }

  const lower = text.toLowerCase();
  if (lower.includes('appointment') || lower.includes('programare') || lower.includes('meeting')) {
    // create calendar event (stub)
    const summary = 'Meeting with ProtoTech 3D';
    const description = `WhatsApp request: ${text}`;
    const when = new Date(Date.now() + 24*60*60*1000).toISOString();
    try {
      await calendar.createEvent(summary, description, when);
      await sendWhatsAppText(from, 'Am programat întâlnirea ta și ți-am trimis un email de confirmare.');
      await emailService.sendEmail({
        to: context.contacts && context.contacts[0] ? context.contacts[0].profile.name + '<' + from + '@whatsapp.net>' : from + '@whatsapp.net',
        subject: 'Confirmare programare – ProtoTech 3D',
        text: `Confirmăm programarea ta la ProtoTech 3D. Ne vedem la ora și data agreate.\n\nDetalii solicitare: ${text}`
      });
    } catch (err) {
      console.error(err);
      await sendWhatsAppText(from, 'Nu am reușit să fac programarea. Te rugăm să încerci mai târziu.');
    }
  } else if (lower.includes('order') || lower.includes('comandă') || lower.includes('comanda')) {
    await sendWhatsAppText(from, 'Mulțumim pentru interes! Poți plasa o comandă rapidă pe site: https://protech3d.eu/order.html');
  } else {
    await sendWhatsAppText(from, 'Salut! Sunt asistentul ProtoTech 3D. Spune-mi dacă vrei să faci o programare sau o comandă.');
  }
};
