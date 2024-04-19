console.log("script.js");
let all_from_emails = [];
let all_to_emails = [];
let uniqueFrom = [];
let uniqueTo = [];
let uniqueAll = [];
let loader = document.querySelector(".loader");
function updateUser(userid) {
  loader.classList.add("active");
  let name = document.getElementById("nameinput").value.trim();
  let email = document.getElementById("emailinput").value.trim();
  console.log(name, email);
  // let id = document.getElementById(".hidden").innerHTML.trim();
  fetch(`/updateUser/${userid}/${name}/${email}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((user) => {
      console.log("Inserted user:", user);
      // Do something with the inserted user data, if needed
      document.querySelector(".form").classList.remove("active");
      let add_button = document
        .querySelector(".form")
        .querySelector("button.confirm");
      // displayImportEmails([user]);
      add_button.textContent = "+ Add";
      add_button.setAttribute("onclick", `addImportantMail()`);
      displayImportEmails(user);
      loader.classList.remove("loader");
    })
    .catch((error) => {
      console.error("Error:", error);
      // Handle error gracefully, display error message to user, etc.
    });
}

function editImportant(id) {
  loader.classList.add("active");
  fetch(`/editImportant/${id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((user) => {
      console.log("Inserted user:", user);
      // Do something with the inserted user data, if needed
      document.querySelector(".form").classList.add("active");
      let add_button = document
        .querySelector(".form")
        .querySelector("button.confirm");
      // displayImportEmails([user]);
      let name = document.getElementById("nameinput");
      let email = document.getElementById("emailinput");
      let hidden = document.querySelector(".hidden");
      name.value = user.username;
      email.value = user.email;
      hidden.value = user._id;
      add_button.textContent = "Update";
      add_button.setAttribute("onclick", `updateUser('${user._id}')`);
      loader.classList.remove("active");
    })
    .catch((error) => {
      console.error("Error:", error);
      // Handle error gracefully, display error message to user, etc.
    });
}

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
        `;
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
  loader.classList.add("active");
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
      loader.classList.remove("active");
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

function displayImportEmails(allEmails) {
  // console.log(emails);
  let tablebody = document.querySelector(
    ".all_mails_table.importantemail tbody"
  );
  tablebody.innerHTML = "";
  console.log(allEmails.length);
  console.log(allEmails);
  allEmails.map((email, index) => {
    let tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${index + 1}</td>
            <td class="name">${email.username}</td>
            <td class="email">${email.email}</td>
            <td class="date"> ${email.date}</td>
            <td class="date"> 
              <div class="buttons">
                <button class="edit" onclick="editImportant('${email._id}')">
                  <i class="fas fa-eye"></i> edit
                </button>
                <button class="remove" onclick="removeImportant('${
                  email._id
                }')">
                  <i class="fas fa-trash-alt"></i> remove
                </button>
              </div>
            </td>
          `;
    tablebody.appendChild(tr);
  });
  // let tr = document.createElement("tr");
  allEmails.length > 0
    ? console.log("lenght > 0")
    : ((tablebody.innerHTML = `<tr><td colspan="4">No Important mails Yet</td></tr>`),
      console.log("lenght < 0"));

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
    fetchTodaysEmails();
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
  loader.classList.add("active");
  fetch("/fetchTodaysEmails")
    .then((response) => response.json())
    .then((emails) => {
      console.log(emails);
      if (emails.length > 0) {
        displayTodayEmails(emails);
      } else {
        document.querySelector(".todayEmails").innerHTML = ` 
        <tr>
          <td colspan="5" class="no_td">No emails on today</td>
        </tr>`;
      }
      loader.classList.remove("active");
    })
    .catch((error) => console.error("Error:", error));
}

function removeImportant(id) {
  const confirmMsg = confirm("are you sure..?");
  if (confirmMsg) {
    loader.classList.add("active");
    fetch(`/removeImportant/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((user) => {
        console.log("Removed users:", user);
        // Do something with the inserted user data, if needed
        displayImportEmails(user);
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error gracefully, display error message to user, etc.
      });
    loader.classList.remove("active");
  } else {
    console.log("Canceled");
  }
}

function fetchImportantmails() {
  loader.classList.add("active");
  fetch(`/getImportantMails`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((user) => {
      console.log("Inserted user:", user);
      // Do something with the inserted user data, if needed
      document.querySelector(".form").classList.remove("active");
      displayImportEmails(user);
    })
    .catch((error) => {
      console.error("Error:", error);
      // Handle error gracefully, display error message to user, etc.
    });
  loader.classList.remove("active");
}

function addImportantMail() {
  let name = document.getElementById("nameinput").value.trim();
  let email = document.getElementById("emailinput").value.trim();
  console.log(name, email);
  // Check if both name and email are not empty
  if (name && email) {
    loader.classList.add("active");
    fetch(`/addImportantMail/${name}/${email}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((user) => {
        console.log("Inserted user:", user);
        // Do something with the inserted user data, if needed
        document.querySelector(".form").classList.remove("active");
        displayImportEmails(user);
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error gracefully, display error message to user, etc.
      });
    loader.classList.remove("active");
  } else {
    console.error("Name and email cannot be empty");
    // Handle the case where name or email is empty
  }
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

document
  .getElementById("emailForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    try {
      loader.classList.add("active");
      const response = await fetch("/sendEmail", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // alert("Email sent successfully!");
        console.log("email send");
        // Optionally, clear the form after successful submission
        this.reset();
        loader.classList.remove("active");
      } else {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error sending email:", error.message);
      alert("Error sending email: " + error.message);
    }
  });

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    subscribeToNewEmails();
  }, 5000);
});
