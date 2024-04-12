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
      all_from_emails = extractEmails(contacts.from);
      all_to_emails = extractEmails(contacts.to);

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

      document.querySelector(".contactEmail").innerHTML = "";

      displayContacts(all_from_emails.reverse(), "from");
      displayContacts(all_to_emails.reverse(), "to");
      console.log(uniqueAll.length);
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

function displayContacts(contacts, type) {
  let tbody = document.querySelector(".contactEmail");
  // tbody.innerHTML = "";
  contacts.map((contact, index) => {
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td class="name">${contact.name}</td>
      <td class="email"> ${contact.email}</td>
      <td>${type}</td>`;
    tbody.appendChild(tr);
  });
  // let contactsList;
  // if (type === "from") {
  //   // contactsList = document.getElementById("from");
  //   // contactsList.innerHTML = "";
  //   contacts.forEach((contact) => {
  //     let tr = document.createElement("tr");
  //     if (uniqueFrom.indexOf(contact) === -1) {
  //       uniqueFrom.push(contact);
  //       tr.innerHTML = `<td>${tbody.childElementCount + 1}</td>
  //                 <td class="name">${contact.name}</td>
  //                 <td class="email"> ${contact.email}</td>
  //                 <td>To</td>`;
  //       let li = document.createElement("li");
  //       li.innerHTML = `Name: ${contact.name}<br/> Email: ${contact.email}`;
  //       contactsList.appendChild(li);
  //     }
  //   });
  //   document.querySelector(".lenght-f").innerHTML = uniqueFrom.length;
  //   console.log(uniqueFrom.length);
  // } else if (type === "to") {
  //   contactsList = document.getElementById("to");
  //   contactsList.innerHTML = "";
  //   contacts.forEach((contact) => {
  //     if (uniqueTo.indexOf(contact) === -1) {
  //       uniqueTo.push(contact);
  //       let li = document.createElement("li");
  //       li.innerHTML = `Name: ${contact.name}<br/> Email: ${contact.email}`;
  //       contactsList.appendChild(li);
  //     }
  //   });
  //   document.querySelector(".lenght-t").innerHTML = uniqueTo.length;
  //   console.log(uniqueTo.length);
  // }
}

// const data = [
//   {
//     from: "Medium <hello@medium.com>",
//     subject: "The Edition: One million members and counting",
//     date: "Fri, 12 Apr 2024 18:01:00 +0000 (UTC)",
//   },
//   {
//     from: '"Vasco @ Journalist" <info@tryjournalist.com>',
//     subject: "You Unlocked: Automatic Link Builder",
//     date: "12 Apr 2024 17:19:14 -0000",
//   },
//   {
//     from: "Google <no-reply@accounts.google.com>",
//     subject: "Critical security alert for vinothg0618@gmail.com",
//     date: "Fri, 12 Apr 2024 14:45:32 GMT",
//   },
//   {
//     from: "Teachnook <noreply@notify.thinkific.com>",
//     subject: "Welcome to Teachnook",
//     date: "Fri, 12 Apr 2024 15:08:52 +0000",
//   },
//   {
//     from: '"Remote Working Opportunities" <info@jfhmails.co.in>',
//     subject:
//       "Vinoth S: Discover WFH Opportunities Tailored to Your Skills! | Explore Remote Job Roles",
//     date: "Fri, 12 Apr 2024 16:50:05 +0530 (IST)",
//   },
//   {
//     from: "Medium Daily Digest <noreply@medium.com>",
//     subject: "9 Best-In-Class New Tools for Software Developers | Alex Omeyer",
//     date: "Fri, 12 Apr 2024 02:10:00 +0000 (UTC)",
//   },
//   {
//     from: "Vercel <ship@info.vercel.com>",
//     subject: "Don’t miss an exclusive first look at Vercel’s newest features",
//     date: "Thu, 11 Apr 2024 14:35:37 -0500 (CDT)",
//   },
// ];

// Function to extract email addresses enclosed within angle brackets
function extractEmails(dataArray) {
  const extractedEmails = [];
  // for (const item of dataArray) {
  let extract = {};
  const email = /<([^>]+)>/.exec(dataArray)[1];
  const name = dataArray.toString().replace(/<([^>]+)>/, "");
  console.log(name);
  extract.email = email;
  extract.name = name;
  extractedEmails.push(extract);
  // }
  return extractedEmails;
}

// const extractedEmails = extractEmails(data);
// console.log(extractedEmails);

// // Example usage:
// const emailsArray = [
//   '"VINOTH.S VINOTH.S" <vinothg0618@gmail.com>',
//   '"John Doe" <johndoe@example.com>',
// ];
// const extractedData = extractEmails(emailsArray);
// console.log(extractedData);

// fetchContacts();
fetchTodaysEmails();
setTimeout(() => {
  subscribeToNewEmails();
}, 5000);
