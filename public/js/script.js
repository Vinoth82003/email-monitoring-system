console.log("script.js");
let all_from_emails = [];
let all_to_emails = [];
let uniqueFrom = [];
let uniqueTo = [];
let uniqueAll = [];

function alertMail(allEmails) {
  console.log(allEmails);
  let bellCount = document.querySelector(".bellCount");
  document.querySelector(".colspan")
    ? document.querySelector(".colspan").remove()
    : "";
  let tbody = document.querySelector(".newEmails");
  bellCount.innerHTML = tbody.childElementCount;
  // tbody.innerHTML = "";
  allEmails.map((email) => {
    let tr = document.createElement("tr");
    let nameAndEmail = extractEmails([email.from]);
    console.log([email.from]);
    console.log(nameAndEmail);
    tr.innerHTML = `
      <td>${tbody.childElementCount + 1}</td>
      <td class="name">${nameAndEmail[0].name}</td>
      <td class="email">${nameAndEmail[0].email}</td>
      <td class="subject">${email.subject}</td>
      <td class="date">${email.date}</td>
    `;
    tbody.appendChild(tr);
  });
  bellCount.innerHTML = tbody.childElementCount;
}
// alertMail("email");
function displayAllContacts(emails) {
  let tbody = document.querySelector(".contactEmail");
  tbody.innerHTML = "";
  if (emails.length > 0) {
    emails.map((mail, index) => {
      let tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td class="name">${mail.name}</td>
        <td class="email">${mail.email}</td>
        <td class="type">${mail.type}</td>`;
      tbody.appendChild(tr);
    });
  } else {
    let tr = document.createElement("tr");
    tr.innerHTML = ` <td colspan="4">No Contact Yet</td>`;
  }

  document.querySelector(".total").innerHTML =
    emails.length >= 10 ? emails.length : "0" + emails.length;
}

function fetchContacts() {
  fetch("/fetchContacts")
    .then((response) => response.json())
    .then((contacts) => {
      let frommails = extractEmailsAndName(contacts.from, "from");
      frommails.forEach((contact) => {
        if (all_from_emails.indexOf(contact.email) == -1) {
          all_from_emails.push(contact.email);
          uniqueFrom.push(contact);
          uniqueAll.push(contact);
        }
      });
      let tomails = extractEmailsAndName(contacts.to, "to");
      tomails.forEach((contact) => {
        if (all_to_emails.indexOf(contact.email) == -1) {
          all_to_emails.push(contact.email);
          uniqueTo.push(contact);
          uniqueAll.push(contact);
        }
      });

      document.querySelector(".contactEmail").innerHTML = "";
      displayAllContacts(uniqueAll);
    })
    .catch((error) => console.error("Error:", error));
}

function displayTodayEmails(allEmails) {
  // console.log(emails);
  let tablebody = document.querySelector(".todayEmails");
  tablebody.innerHTML = "";
  console.log(allEmails.length);
  console.log(allEmails);
  allEmails.map((email, index) => {
    // console.log(index);
    let Ex_name;
    let Ex_email;

    let nameAndEmail = extractEmails([email.from]);
    // console.log(nameAndEmail);
    Ex_name = nameAndEmail.length > 0 ? nameAndEmail[0].name : "N/A";
    Ex_email = nameAndEmail.length > 0 ? nameAndEmail[0].email : "N/A";
    let tr = document.createElement("tr");
    tr.innerHTML = `
          
            <td>${index + 1}</td>
            <td class="name">${Ex_name}</td>
            <td class="email">${Ex_email}</td>
            <td>${email.subject}</td>
            <td class="date"> ${email.date}</td>
          `;
    tablebody.appendChild(tr);
  });

  document.querySelector(".total").innerHTML =
    tablebody.childElementCount >= 10
      ? tablebody.childElementCount
      : "0" + tablebody.childElementCount;
}

function subscribeToNewEmails() {
  console.log("func called");
  const eventSource = new EventSource("/streamNewEmails");

  eventSource.addEventListener("message", function (event) {
    let newdata = JSON.parse(event.data);
    alertMail([newdata]);
    console.log("new email received:", JSON.parse(event.data));
    // You can perform further actions with the received email data here
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
      if (emails.length > 0) {
        displayTodayEmails(emails);
      } else {
        document.querySelector(".todayEmails").innerHTML = ` 
        <tr>
          <td colspan="5" class="no_td">No emails on today</td>
        </tr>`;
      }
    })
    .catch((error) => console.error("Error:", error));
}

function fetchNewEmail() {
  console.log("fetching ... emails from backend");
  fetch("/fetchNewEmail")
    .then((response) => response.json())
    .then((emails) => {
      alertMail(emails);
    })
    .catch((error) => console.error("Error:", error));
}

// Function to extract email addresses enclosed within angle brackets
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

function extractEmailsAndName(dataArray, type) {
  const extractedEmails = [];
  let index = 0;
  for (const item of dataArray) {
    index++;
    let extract = {};
    const emailMatch = /[\w.-]+@[\w.-]+\.[\w_-]+/.exec(item);
    if (emailMatch) {
      const email = emailMatch[0];
      let name = item.replace(email, "").replace(/<|>/g, "").trim();
      // Replace double quotes in the name
      name = name.replace(/"/g, "");
      extract.email = email;
      extract.name = name || "N/A";
      extract.type = type;
      extractedEmails.push(extract);
    } else {
      console.log("index:" + index, item);
    }
  }
  return extractedEmails;
}

function filter(type) {
  if (type == "all") {
    document.querySelector("tbody.contactEmail").innerHTML = "";
    displayAllContacts(uniqueAll);
  } else if (type == "from") {
    document.querySelector("tbody.contactEmail").innerHTML = "";
    displayAllContacts(uniqueFrom);
  } else if (type == "to") {
    console.log(uniqueTo);
    document.querySelector("tbody.contactEmail").innerHTML = "";
    displayAllContacts(uniqueTo);
  } else {
    document.querySelector("tbody.contactEmail").innerHTML = "";
    displayAllContacts(uniqueAll);
  }
}
// fetchContacts();
fetchTodaysEmails();

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    subscribeToNewEmails();
  }, 5000);
});
