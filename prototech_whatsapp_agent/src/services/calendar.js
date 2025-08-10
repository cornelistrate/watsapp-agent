require('dotenv').config();
const {google} = require('@googleapis/calendar');

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/calendar']
);
const calendar = google.calendar({version:'v3', auth});

exports.createEvent = async (summary, description, startISO) => {
  const event = {
    summary,
    description,
    start: { dateTime: startISO },
    end: { dateTime: new Date(new Date(startISO).getTime() + 30*60*1000).toISOString() },
  };
  const res = await calendar.events.insert({ calendarId: process.env.GOOGLE_CALENDAR_ID, requestBody: event });
  return res.data;
};
