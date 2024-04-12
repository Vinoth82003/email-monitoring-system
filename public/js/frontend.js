// const colors = [
//   "#074173",
//   "#003C43",
//   "#49243E",
//   "#2C7865",
//   "#453F78",
//   "#222831",
//   "#5C8374",
//   "#474E68",
//   "#141E61",
//   "#4B5D67",
// ];

// // Function to set random background color for each li element
// function setRandomBackgroundColors() {
//   const lis = document.querySelectorAll(".colors");
//   lis.forEach((li) => {
//     const randomColor = colors[Math.floor(Math.random() * colors.length)];
//     li.style.backgroundColor = randomColor;
//   });
// }

// // Call the function to set random background colors on page load
// setRandomBackgroundColors();

let time_box = document.querySelector(".time_box");
let median = document.getElementById("median");
let title_display = document.querySelector(".head_left .title");
let count_display = document.querySelector(".head_right .total");
let menu_btns = document.querySelectorAll("li .inner_menu");
let all_sections = document.querySelectorAll("section.section");
let currentTable;
let currentIndex = 0;

function menu_click(index) {
  menu_btns.forEach((menu) => {
    let menuIndex = menu.getAttribute("index");
    if (index == menuIndex) {
      // menu.childElementCount;
      menu.classList.add("active");
    } else {
      menu.classList.remove("active");
    }
  });
  all_sections.forEach((section) => {
    if (section) {
      let sectionIndex = section.getAttribute("index");
      if (index == sectionIndex) {
        section.classList.add("active");
        let table = section.querySelector("table");
        currentTable = table ? table : null;
      } else {
        section.classList.remove("active");
      }
    }
  });
  if (currentTable) {
    let count = currentTable.querySelector("tbody").childElementCount;
    count_display.innerHTML = count?(count >= 10 ? count : "0" + count):"no count";
    let title = currentTable.getAttribute("data-title");
    title_display.innerHTML = title ? title : "no title";
  }
}

menu_click(currentIndex);

let i = 0;
let min = 0;
let hrs = 0;

// Function to convert 24-hour format to 12-hour format
function format12Hour(hour) {
  return hour % 12 || 12;
}

let now = new Date();
let currentHour = now.getHours();
let currentMinute = now.getMinutes();
let currentSecond = now.getSeconds();

// Display current time
document.querySelector(".hr.active").innerHTML =
  format12Hour(currentHour) >= 10
    ? format12Hour(currentHour)
    : "0" + format12Hour(currentHour);
document.querySelector(".min.active").innerHTML =
  currentMinute < 10 ? "0" + currentMinute : currentMinute;
document.querySelector(".sec.active").innerHTML =
  currentSecond < 10 ? "0" + currentSecond : currentSecond;
median.innerHTML = currentHour >= 12 ? "PM" : "AM";
setInterval(() => {
  let now = new Date();
  let secs = now.getSeconds();
  let mins = now.getMinutes();
  let hours = now.getHours();
  let p = time_box.children[2];
  let span = document.createElement("span");
  span.className = "active";
  span.innerHTML = secs < 10 ? "0" + secs : secs;
  p.firstElementChild.remove();
  p.appendChild(span);

  if (secs === 0) {
    min = mins;
    let p = time_box.children[1];
    let span = document.createElement("span");
    span.className = "active";
    span.innerHTML = min < 10 ? "0" + min : min;
    p.firstElementChild.remove();
    p.appendChild(span);

    if (min === 0) {
      hrs = hours;
      let p = time_box.children[0];
      let span = document.createElement("span");
      span.className = "active";
      span.innerHTML = format12Hour(hrs);
      p.firstElementChild.remove();
      p.appendChild(span);

      // Update AM/PM indicator
      median.innerHTML = hrs >= 12 ? "PM" : "AM";
    }
  }
}, 1000);

let toggleBtn = document.querySelector(".inner_bar");
let sidemenu = document.querySelector(".sidemenu");
let main = document.querySelector(".main");

toggleBtn.addEventListener("click", () => {
  toggleBtn.classList.toggle("active");
  sidemenu.classList.toggle("active");
  main.classList.toggle("active");
});

menu_btns.forEach((btn) => {
  btn.addEventListener("click", () => {
    let index = btn.getAttribute("index");
    menu_click(index);
  });
});
