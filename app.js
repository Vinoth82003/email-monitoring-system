const express = require("express");
require("dotenv").config();
const path = require("path");
const Imap = require("node-imap");
const bodyParser = require("body-parser");
const { EventEmitter } = require("events");
const sendMessage = require("./server/message");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const imap = new Imap({
  user: process.env.EMAIL,
  password: process.env.PASS,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
});

const emitter = new EventEmitter();

function openInbox(cb) {
  imap.openBox("INBOX", true, cb);
}

function getCurrentDate() {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentDate = new Date();
  const month = months[currentDate.getMonth()];
  const day = currentDate.getDate();
  const year = currentDate.getFullYear();
  return `${month} ${day}, ${year}`;
}

// Function to fetch contacts from messages
app.get("/fetchContacts", (req, res) => {
  openInbox(async function (err, box) {
    if (err) {
      console.error("Error opening INBOX:", err);
      res.status(500).json({ error: "Error opening INBOX" });
      return;
    }

    try {
      imap.search(["ALL"], async function (err, results) {
        if (err) {
          console.error("Error searching for messages:", err);
          res.status(500).json({ error: "Error searching for messages" });
          return;
        }

        const f = imap.fetch(results, {
          bodies: "HEADER.FIELDS (FROM TO)",
          struct: true,
        });

        await processContacts(f, res);
      });
    } catch (err) {
      console.error("Error fetching messages:", err);
      res.status(500).json({ error: "Error fetching messages" });
    }
  });
});

function processContacts(f, res) {
  const fromContacts = new Set();
  const toContacts = new Set();

  f.on("message", function (msg, seqno) {
    msg.on("body", function (stream, info) {
      let buffer = "";
      stream.on("data", function (chunk) {
        buffer += chunk.toString("utf8");
      });
      stream.once("end", function () {
        const headers = Imap.parseHeader(buffer);
        const from = headers.from && headers.from[0];
        const to = headers.to && headers.to[0];
        if (from) {
          fromContacts.add(from);
        }
        if (to) {
          toContacts.add(to);
        }
      });
    });

    msg.once("end", function () {
      // Once the message is processed, add unique contacts to the main sets
      // No need to add to main set here, do it in the 'end' event
    });
  });

  f.once("error", function (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Error fetching messages" });
  });

  f.once("end", function () {
    console.log("Done fetching messages!");
    res.json({ from: Array.from(fromContacts), to: Array.from(toContacts) });
  });
}

imap.once("ready", function () {
  console.log("Connected to IMAP server");

  // Emit a 'newEmail' event whenever a new email is received
  imap.on("mail", () => {
    emitter.emit("newEmail");
  });

  app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
  });
});

imap.once("error", function (err) {
  console.error("IMAP error:", err);
});

imap.once("end", function () {
  console.log("Connection ended");
});

imap.connect();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/streamNewEmails", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendNewEmailEvent = async () => {
    try {
      const latestEmail = await fetchLatestEmail();
      const emailData = await getEmailData(latestEmail);
      res.write("event: newEmail\n");
      res.write(`data: ${JSON.stringify(emailData)}\n\n`);
    } catch (error) {
      console.error("Error sending new email event:", error);
      res.write("event: error\n");
      res.write(`data: ${JSON.stringify(error)}\n\n`);
    }
  };

  const keepAlive = setInterval(() => {
    res.write(":keep-alive\n\n");
  }, 20000);

  res.write(":connected\n\n");

  emitter.on("newEmail", sendNewEmailEvent);

  req.on("close", () => {
    emitter.off("newEmail", sendNewEmailEvent);
    clearInterval(keepAlive);
  });
});

async function fetchLatestEmail() {
  return new Promise((resolve, reject) => {
    openInbox((err, box) => {
      if (err) {
        reject(err);
        return;
      }
      const latestEmail = box.messages.total;
      resolve(latestEmail);
    });
  });
}

async function getEmailData(emailId) {
  return new Promise((resolve, reject) => {
    const f = imap.fetch(emailId, {
      bodies: "",
      struct: true,
    });
    f.on("message", function (msg) {
      const emailData = {};
      msg.on("body", function (stream, info) {
        let buffer = "";
        stream.on("data", function (chunk) {
          buffer += chunk.toString("utf8");
        });
        stream.once("end", function () {
          const headers = Imap.parseHeader(buffer);
          emailData.from = headers.from && headers.from[0];
          emailData.subject = headers.subject && headers.subject[0];
          emailData.date = headers.date && headers.date[0];
        });
      });
      msg.once("end", function () {
        resolve(emailData);
      });
    });
    f.once("error", function (err) {
      reject(err);
    });
  });
}

function fetchTodaysEmails(callback) {
  openInbox((err, box) => {
    if (err) {
      console.error("Error opening INBOX:", err);
      return callback(err);
    }
    // Example usage
    const formattedDate = getCurrentDate();
    console.log(formattedDate); // Output: "Apr 12, 2024"

    imap.search(["UNSEEN", ["SINCE", formattedDate]], async (err, results) => {
      if (err) {
        console.error("Error searching for today's emails:", err);
        return callback(err);
      }

      const f = imap.fetch(results, {
        bodies: "",
        struct: true,
      });

      const emails = [];

      f.on("message", function (msg) {
        const emailData = {};

        msg.on("body", function (stream, info) {
          let buffer = "";
          stream.on("data", function (chunk) {
            buffer += chunk.toString("utf8");
          });
          stream.once("end", function () {
            const headers = Imap.parseHeader(buffer);
            emailData.from = headers.from && headers.from[0];
            emailData.subject = headers.subject && headers.subject[0];
            emailData.date = headers.date && headers.date[0];
            // Add more fields as needed
          });
        });

        msg.once("end", function () {
          emails.push(emailData);
        });
      });

      f.once("error", function (err) {
        console.error("Fetch error:", err);
        return callback(err);
      });

      f.once("end", function () {
        console.log("Done fetching today's emails!");
        callback(null, emails);
      });
    });
  });
}

// Route to fetch today's emails
app.get("/fetchTodaysEmails", (req, res) => {
  fetchTodaysEmails((err, emails) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching today's emails" });
    }
    res.json(emails.reverse());
  });
});

// Route to fetch new email
app.get("/fetchNewEmail", (req, res) => {
  fetchTodaysEmails((err, emails) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching today's emails" });
    }
    let number = "919384460843";
    let message = "New Email\n\n";
    sendMessage(number, message);
    res.json([emails.reverse()[0]]);
  });
});
