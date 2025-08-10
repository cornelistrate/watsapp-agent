require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const webhook = require('./whatsapp/webhook');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/health', (req,res) => res.send('OK'));

// WhatsApp webhook endpoints
app.get('/webhook', webhook.verifyToken);
app.post('/webhook', webhook.receiveMessage);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ProtoTech 3D WhatsApp agent listening on port ${PORT}`);
});
