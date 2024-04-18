const express = require("express");
require("dotenv").config();
const path = require("path");
const Imap = require("node-imap");
const bodyParser = require("body-parser");
const { EventEmitter } = require("events");
const sendMessage = require("./server/message");
const {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getUsersEmail,
  getUserByID,
} = require("./server/mongo");
const multer = require("multer"); // For handling file uploads
const nodemailer = require("nodemailer"); // For sending emails

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
// extract email and name from the "from"
function extractEmails(dataArray) {
  const extractedEmails = [];
  // for (const item of dataArray) {
  let extract = {};
  const emailMatch = /[\w.-]+@[\w.-]+\.[\w_-]+/.exec(dataArray);
  if (emailMatch) {
    const email = emailMatch[0];
    let name = dataArray
      .toString()
      .replace(email, "")
      .replace(/<|>/g, "")
      .trim();
    // Replace double quotes in the name
    name = name.replace(/"/g, "");
    extract.email = email;
    extract.name = name || "N/A";
    extractedEmails.push(extract);
  } else {
    console.log("Data : ", dataArray);
  }
  return extractedEmails;
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

// Define keepAlive in the outer scope
let keepAlive;

// SSE endpoint to stream new emails to the client
app.get("/streamNewEmails", (req, res) => {
  console.log("reached..!");
  // Set response headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Function to send new email event
  const sendNewEmailEvent = async () => {
    console.log("new email arrived");
    let todayDate = getCurrentDate();
    // Construct the search key to filter emails that arrived after the current moment
    const searchKey = ["UNSEEN", ["SINCE", todayDate]];

    imap.search(searchKey, async (err, results) => {
      if (err) {
        console.error("Error searching for today's emails:", err);
        return res
          .status(500)
          .json({ error: "Error searching for today's emails" });
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
        return res.status(500).json({ error: "Error fetching messages" });
      });

      f.once("end", function () {
        console.log("Done fetching New email!");
        // Send the latest email as SSE data after a delay
        setTimeout(async () => {
          res.write(`data: ${JSON.stringify(emails[emails.length - 1])}\n\n`);
          // Optionally, you can send an event name
          // res.write("event: newEmail\n");
          let importEmails;
          try {
            importEmails = await getUsersEmail();
          } catch (error) {
            console.error("Error getting user:", error);
          }
          let from = emails[emails.length - 1].from;
          let fromEmail = extractEmails(from);
          console.log(from);
          console.log("New email arrived: ", fromEmail[0].email);
          console.log("important Emails List");
          console.log(importEmails);
          const isImportant = importEmails.includes(fromEmail[0].email);

          let number = "919384460843";
          let message =
            "New Email\n\nFROM: " +
            emails[emails.length - 1].from +
            "\nSUBJECT: " +
            emails[emails.length - 1].subject +
            "\nDATE: " +
            emails[emails.length - 1].date;
          +"\nReply to :" + fromEmail[0].email + "\n\nBy SEMS: Thank You...!";
          isImportant
            ? sendMessage(number, message)
            : console.log("no important mail");
          // sendMessage(number, message);
        }, 5000); // 5000 milliseconds delay (adjust as needed)
      });
    });
  };

  // Attach event listener for new email events
  emitter.on("newEmail", sendNewEmailEvent);

  // Start the keep-alive interval
  keepAlive = setInterval(() => {
    res.write(":keep-alive\n\n");
  }, 20000); // Send every 20 seconds

  // Cleanup on client disconnect
  req.on("close", () => {
    emitter.off("newEmail", sendNewEmailEvent);
    if (keepAlive) clearInterval(keepAlive);
    else console.log("no Keepalive");
  });
});

function fetchTodaysEmails(callback) {
  openInbox((err, box) => {
    if (err) {
      console.error("Error opening INBOX:", err);
      return callback(err);
    }
    // Example usage
    const formattedDate = getCurrentDate();
    console.log(formattedDate); // Output: "Apr 12, 2024"

    imap.search(["ALL", ["SINCE", formattedDate]], async (err, results) => {
      if (err) {
        console.error("Error searching for today's emails:", err);
        return callback(err);
      }

      // Check if there are no results
      if (results.length === 0) {
        console.log("No emails found for today.");
        return callback(null, []); // Return an empty array
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

app.get("/addImportantMail/:name/:email", async (req, res) => {
  const name = req.params.name;
  const email = req.params.email;

  try {
    const user = await createUser(name, email);
    console.log("Inserted user:", user);
    res.json(user); // Send the inserted user data as JSON response
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" }); // Handle error
  }
});

app.get("/updateUser/:id/:name/:email", async (req, res) => {
  const username = req.params.name;
  const id = req.params.id;
  const email = req.params.email;
  let newData = { username, email };
  console.log(newData);
  try {
    const user = await updateUser(id, newData);
    console.log("Update user:", user);
    res.json(user); // Send the inserted user data as JSON response
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" }); // Handle error
  }
});

app.get("/getImportantMails", async (req, res) => {
  try {
    const user = await getUsers();
    res.json(user); // Send the inserted user data as JSON response
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" }); // Handle error
  }
});

app.get("/editImportant/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await getUserByID(id);
    res.json(user); // Send the inserted user data as JSON response
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" }); // Handle error
  }
});

app.get("/removeImportant/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await deleteUser(id);
    res.json(user); // Send the inserted user data as JSON response
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" }); // Handle error
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files to the "uploads" directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original file name
  },
});

const upload = multer({ storage: storage });

// POST route to handle form submission with attachment
app.post("/sendEmail", upload.single("attachment"), async (req, res) => {
  // Extract form data from request body
  const { to, cc, bcc, subject, message } = req.body;

  // Create reusable transporter object using SMTP transport
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  // Setup email data with unicode symbols
  let mailOptions = {
    from: process.env.EMAIL, // sender address
    to: to,
    cc: cc,
    bcc: bcc,
    subject: subject,
    text: message,
    attachments: [
      {
        filename: req.file.originalname, // Use the original file name
        path: req.file.path, // Use the path of the uploaded file
      },
    ],
  };

  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent:", info.response);
      res.status(200).send("Email sent successfully");
    }
  });
});

