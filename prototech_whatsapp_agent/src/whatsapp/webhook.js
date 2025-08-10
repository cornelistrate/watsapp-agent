require('dotenv').config();
const worker = require('./worker');

// Verify endpoint for WhatsApp Cloud API
exports.verifyToken = (req, res) => {
  try {
    const verify_token = process.env.WHATSAPP_VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token) {
      if (mode === 'subscribe' && token === verify_token) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        res.status(403).send('Forbidden');
      }
    } else {
      res.status(400).send('Missing params');
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

// Receive messages
exports.receiveMessage = async (req, res) => {
  try {
    const body = req.body;
    if (body.object) {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const { value } = change;
          if (value && value.messages) {
            for (const message of value.messages) {
              await worker.processMessage(message, value);
            }
          }
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Error handling webhook message:', err);
    res.sendStatus(500);
  }
};
