console.log("script.js");
let all_from_emails = [];
let all_to_emails = [];
let uniqueFrom = [];
let uniqueTo = [];
let uniqueAll = [];

function fetchContacts() {
  fetch("/fetchContacts")
    .then((response) => response.json())
    .then((contacts) => {
      all_from_emails = extractNamesAndEmails(contacts.from);
      all_to_emails = extractNamesAndEmails(contacts.to);

      all_from_emails.forEach((contact) => {
        if (uniqueAll.indexOf(contact) == -1) {
          uniqueAll.push(contact);
        }
      });

      all_to_emails.forEach((contact) => {
        if (uniqueAll.indexOf(contact) == -1) {
          uniqueAll.push(contact);
        }
      });

      displayContacts(all_from_emails.reverse(), "from");
      displayContacts(all_to_emails.reverse(), "to");
      console.log(uniqueAll.length);
    })
    .catch((error) => console.error("Error:", error));
}

function subscribeToNewEmails() {
  console.log("func called");
  const eventSource = new EventSource("/streamNewEmails");

  eventSource.addEventListener("newEmail", function (event) {
    console.log("new email recieved");
    fetchNewEmail();
  });
}

function displayNewEmail(emailDetails) {
  // Get the container element where the email details will be displayed
  const emailContainer = document.getElementById("newEmailContainer");

  // Create a new paragraph element to display the email details
  const emailParagraph = document.createElement("p");
  emailParagraph.textContent = emailDetails;

  // Append the paragraph element to the container
  emailContainer.appendChild(emailParagraph);
}

function fetchTodaysEmails() {
  fetch("/fetchTodaysEmails")
    .then((response) => response.json())
    .then((emails) => {
      // emails.reverse()
      if (emails.length > 0) {
        emails.forEach((email) => {
          const emailDetails = `From: ${email.from}, Subject: ${email.subject}, Date: ${email.date}`;
          displayNewEmail(emailDetails);
        });
      } else {
        const emailDetails = `From: ${email.from}, Subject: ${email.subject}, Date: ${email.date}`;
        displayNewEmail(emailDetails);
      }
    })
    .catch((error) => console.error("Error:", error));
}

function fetchNewEmail() {
  fetch("/fetchNewEmail")
    .then((response) => response.json())
    .then((emails) => {
      let ul = document.querySelector(".gird-to");
      ul.innerHTML = "";
      console.log(emails);
      if (emails.length > 0) {
        emails.forEach((email) => {
          let nameAndEmail = extractNamesAndEmails([emails.from]);
          // console.log(nameAndEmail);
          let li = document.querySelector("li");
          li.innerHTML = `<li class="card">
        <div class="colors">${nameAndEmail[0].email[0]}</div>
        <div class="user_detials">
          <div class="name">Name : ${nameAndEmail[0].name}</div>
          <div class="email">Email : ${nameAndEmail[0].email}</div>
        </div>
      </li>`;
          ul.appendChild(li);
          // const emailDetails = `New Email is Name: ${nameAndEmail[0].name} => ${nameAndEmail[0].email}<=, Subject: ${email.subject}, Date: ${email.date}`;
          // displayNewEmail(emailDetails);
        });
      } else {
        let nameAndEmail = extractNamesAndEmails([emails.from]);
        let li = document.querySelector("li");
        li.innerHTML = `<li class="card">
        <div class="colors">${nameAndEmail[0].email[0]}</div>
        <div class="user_detials">
          <div class="name">Name : ${nameAndEmail[0].name}</div>
          <div class="email">Email : ${nameAndEmail[0].email}</div>
        </div>
      </li>`;
        ul.appendChild(li);
        // console.log(nameAndEmail);
        // const emailDetails = `New Email is Name: ${nameAndEmail[0].name} => ${nameAndEmail[0].email}<=, Subject: ${emails.subject}, Date: ${emails.date}`;
        // displayNewEmail(emailDetails);
      }
    })
    .catch((error) => console.error("Error:", error));
}

function displayContacts(contacts, type) {
  let contactsList;
  if (type === "from") {
    contactsList = document.getElementById("from");
    contactsList.innerHTML = "";
    contacts.forEach((contact) => {
      if (uniqueFrom.indexOf(contact) === -1) {
        uniqueFrom.push(contact);
        let li = document.createElement("li");
        li.innerHTML = `Name: ${contact.name}<br/> Email: ${contact.email}`;
        contactsList.appendChild(li);
      }
    });
    document.querySelector(".lenght-f").innerHTML = uniqueFrom.length;
    console.log(uniqueFrom.length);
  } else if (type === "to") {
    contactsList = document.getElementById("to");
    contactsList.innerHTML = "";
    contacts.forEach((contact) => {
      if (uniqueTo.indexOf(contact) === -1) {
        uniqueTo.push(contact);
        let li = document.createElement("li");
        li.innerHTML = `Name: ${contact.name}<br/> Email: ${contact.email}`;
        contactsList.appendChild(li);
      }
    });
    document.querySelector(".lenght-t").innerHTML = uniqueTo.length;
    console.log(uniqueTo.length);
  }
}

const emailPattern =
  /"([^"]+)" <([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)>/;

// Function to extract names and email addresses from the array
function extractNamesAndEmails(emailsArray) {
  const extractedData = [];
  for (const item of emailsArray) {
    const match = emailPattern.exec(item);
    if (match) {
      const name = match[1];
      const email = match[2];
      extractedData.push({ name, email });
    }
  }
  return extractedData;
}

// Example usage:
const emailsArray = [
  '"VINOTH.S VINOTH.S" <vinothg0618@gmail.com>',
  '"John Doe" <johndoe@example.com>',
];
const extractedData = extractNamesAndEmails(emailsArray);
console.log(extractedData);

fetchContacts();
