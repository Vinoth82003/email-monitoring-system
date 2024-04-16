require("dotenv").config({ path: "../.env" });
const { Vonage } = require("@vonage/server-sdk");

const API = process.env.VONAGE_SECRET;
const SECRET = process.env.VONAGE_API;

console.log(API, SECRET);

if (API && SECRET) {
  const vonage = new Vonage({
    apiKey: "9a268c0c",
    apiSecret: "B8nbLlmGWEreFVyA",
  });

  const from = "Alert Message";

  // Function to send SMS
  async function sendSMS(to, text) {
    try {
      const resp = await vonage.sms.send({ to, from, text });
      console.log("Message sent successfully");
      return resp;
    } catch (err) {
      console.error("There was an error sending the message.");
      console.error(err);
    }
  }

  // Export the sendSMS function
  module.exports = sendSMS;
} else {
  console.log("ENVIRONMENT VARIABLE ERROR: NO API & SECRET key is set");
}
