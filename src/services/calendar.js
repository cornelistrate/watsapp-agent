import { google } from "googleapis";

export async function createCalendarEvent(entities) {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/calendar"]
  );
  const calendar = google.calendar({ version: "v3", auth });
  // Simplified: set event in 3 days at 10:00 if no datetime parsed
  const start = new Date();
  start.setDate(start.getDate() + 3);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start.getTime() + 60*60*1000);
  const event = {
    summary: "Consultanță/Programare ProtoTech 3D",
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() }
  };
  const res = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: event
  });
  return res.data;
}
