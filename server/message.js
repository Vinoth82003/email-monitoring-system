const { Vonage } = require("@vonage/server-sdk");

const vonage = new Vonage({
  apiKey: "9a268c0c",
  apiSecret: "B8nbLlmGWEreFVyA",
});

const from = "Vonage APIs";

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
