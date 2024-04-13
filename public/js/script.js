console.log("script.js");
let all_from_emails = [];
let all_to_emails = [];
let uniqueFrom = [];
let uniqueTo = [];
let uniqueAll = [];

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
        if (uniqueAll.indexOf(contact) == -1) {
          uniqueAll.push(contact);
        }
        if (uniqueFrom.indexOf(contact) == -1) {
          uniqueFrom.push(contact);
        }
      });
      let tomails = extractEmailsAndName(contacts.to, "to");
      tomails.forEach((contact) => {
        if (uniqueAll.indexOf(contact) == -1) {
          uniqueAll.push(contact);
        }
        if (uniqueTo.indexOf(contact) == -1) {
          uniqueTo.push(contact);
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
  // allEmails.forEach(async (email, index) => {
  //   // const emailDetails = `From: ${email.from}, Subject: ${email.subject}, Date: ${email.date}`;
  //   // displayNewEmail(emailDetails);
  // });
  document.querySelector(".total").innerHTML =
    tablebody.childElementCount >= 10
      ? tablebody.childElementCount
      : "0" + tablebody.childElementCount;
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
        displayTodayEmails(emails);
      } else {
        // const emailDetails = `From: ${emails.from}, Subject: ${emails.subject}, Date: ${emails.date}`;
        document.querySelector(".todayEmails").innerHTML = ` 
        <tr>
          <td colspan="5" class="no_td">No emails on today</td>
        </tr>`;
      }
    })
    .catch((error) => console.error("Error:", error));
}

function fetchNewEmail() {
  fetch("/fetchNewEmail")
    .then((response) => response.json())
    .then((emails) => {
      displayTodayEmails(emails);
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
  console.log(type);
  if (type == "all") {
    displayAllContacts(uniqueAll);
  } else if (type == "from") {
    displayAllContacts(uniqueFrom);
  } else if (type == "to") {
    displayAllContacts(uniqueTo);
  } else {
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
