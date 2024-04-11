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

let i = 0;
setInterval(() => {
  i++;
  let all_p = time_box.querySelectorAll("p");
  all_p.forEach((p) => {
    let span = document.createElement("span");
    span.className = "active";
    span.innerHTML = i;
    p.firstElementChild.remove();
    p.appendChild(span);
    if (i == 60) {
      i = 0;
    }
    // p.children[1].classList.toggle("active");
  });
}, 1000);
