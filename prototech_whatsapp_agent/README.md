# ProtoTech 3D WhatsApp Agent

This Node.js project implements a simple WhatsApp Cloud API webhook that can:

- Receive text and voice messages from WhatsApp Business
- Transcribe voice messages (stub function)
- Parse intents (order, appointment, general inquiry)
- Create events in Google Calendar (meeting / order pickup) (requires service account)
- Send confirmation emails via SMTP
- Respond to the user via WhatsApp text or audio (stub)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a copy of `.env.example` named `.env` and fill in your credentials:

- **WHATSAPP_ACCESS_TOKEN**: from Meta for Developers → WhatsApp Cloud API
- **WHATSAPP_PHONE_NUMBER_ID**: your WhatsApp Business number ID
- **WHATSAPP_VERIFY_TOKEN**: a random token you choose (also set it in the Meta Webhook configuration)
- **SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS**: SMTP settings for sending confirmation emails
- **FROM_EMAIL**: default sender email (e.g. `orders@prototech3d.eu`)
- **GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID**: service account credentials and calendar id for Google Calendar
- **BASE_URL**: public URL of your webhook (e.g. `https://bot.protech3d.eu`)

3. Deploy the server on a platform like Render.com or Railway. Expose port 3000.

4. In Meta for Developers → Webhooks, configure the callback URL to `https://bot.protech3d.eu/webhook` and set your verify token.

5. Set up your DNS record so that `bot.protech3d.eu` points to the deployed server.

## Endpoints

- `GET /webhook`: verification endpoint for WhatsApp Cloud API. Echoes back the `hub.challenge` parameter if the verify token matches.
- `POST /webhook`: receives messages from WhatsApp. Parses messages and dispatches intents.
- `GET /health`: returns `OK` to indicate the server is running.

## Customization

Modify `src/whatsapp/worker.js` to implement your own intent detection and responses. The current logic is minimal: if the message contains keywords like `order` or `appointment`, it triggers calendar and email workflows.

Voice message support is stubbed via `src/services/stt.js` and `src/services/tts.js`. Integrate your preferred STT/TTS provider (e.g. Whisper, Google Cloud Speech, Amazon Polly).

## Development

Run locally with ngrok for testing:

```bash
cp .env.example .env # edit values
npm install
npm start
```

Expose your local server using ngrok and set the public URL in Meta Webhook config.
