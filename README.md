# ProtoTech 3D – WhatsApp Agent (Text + Voice)

Agent WhatsApp care gestionează conversații (text și audio), poate face **programări**, **prelua comenzi**, **crea evenimente în Google Calendar** și **trimite emailuri**.

## 1. Ce îți trebuie
- **Meta WhatsApp Cloud API**: creează o App în Meta for Developers, atașează un *Phone Number ID*, obține **WHATSAPP_ACCESS_TOKEN**.
- Configurează **Webhook** spre `https://<BASE_URL>/webhook` cu verify token-ul tău.
- **Google Calendar API**: creează un *service account*, partajează calendarul cu adresa service account-ului, setează `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID`.
- **Email SMTP**: SendGrid sau alt provider (host, port, user, pass).

## 2. Configurare
1. `cp .env.example .env` și completează valorile.  
2. `npm install`  
3. `npm start`

Folosește un **tunnel HTTPS** (ex. ngrok) pentru a publica webhook-ul:  
`ngrok http 3000` → pune URL-ul în setările WhatsApp webhook.

## 3. Cum funcționează
- **/webhook (GET)**: verificare webhook Meta (token).  
- **/webhook (POST)**: primește mesaje, detectează intenții simple:
  - `APPOINTMENT` – cere data/ora, creează eveniment în Google Calendar.
  - `ORDER` – solicită fișiere CAD și detalii.
  - `QUOTE` – inițiază flux de ofertare.
- **Audio (voice notes)**: descarcă media prin API → funcție `transcribeAudio()` (de integrat cu serviciu real).

## 4. Voice In & Out
- **STT**: Integrează Whisper/Google STT în `src/services/stt.js`.
- **TTS**: Integrează Google TTS/Polly în `src/services/tts.js`; în `worker.js` poți trimite audio înapoi folosind `sendWhatsAppAudio()`.

## 5. Google Calendar
- `src/services/calendar.js` folosește un service account.  
- Asigură-te că *Calendar ID* este partajat cu service account-ul cu drept de scriere.

## 6. Email
- `src/services/email.js` trimite confirmări către client.
- Poți schimba formatul (HTML) după nevoie.

## 7. Producție
- Rulează pe un server cu HTTPS (ex. Railway, Render, Fly.io, VPS).  
- Stochează cheile în variabile de mediu (nu în repo).

## 8. Extensii posibile
- CRM (Airtable/Notion/HubSpot), baze de date pentru comenzi, integrare preț automat din estimator, fișe client.  
- NLU avansat (Dialogflow/Rasa) pentru intenții mai complexe.
