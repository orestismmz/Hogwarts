"use strict";

window.addEventListener("DOMContentLoaded", () => start());

const table = document.querySelector("#studentsTable");
const tableBody = document.querySelector("#studentsTable tbody");

// ------------------------- One function to RULL THEM ALL! ----------------------
async function start() {
  let [studentsData, bloodData] = await fetchData();
  let students = generateStudents(studentsData, bloodData);
  displayList(students);
}

// ---------------------------------- DATA FETCH ---------------------------------

async function fetchData() {
  return await Promise.all([
    fetch("https://petlatkea.dk/2021/hogwarts/students.json").then((response) => response.json()),
    fetch("https://petlatkea.dk/2021/hogwarts/families.json").then((response) => response.json()),
  ]);
}

// ---------------------------------- DATA CLEANING ------------------------------

function generateStudents(studentsData, bloodData) {
  return studentsData
    .map((jsonObject) => {
      // -------- cleaning data process ---------

      const nameParts = jsonObject.fullname
        .trim()
        .split(" ")
        .filter((str) => str);

      if (!nameParts || nameParts.length === 0) {
        return null;
      }

      // New properties and values
      jsonObject.firstName = capitalizeFirstLetter(nameParts[0]);
      jsonObject.house = capitalizeFirstLetter(jsonObject.house.trim());
      jsonObject.gender = capitalizeFirstLetter(jsonObject.gender.trim());
      if (nameParts.length === 2) {
        jsonObject.lastName = capitalizeFirstLetter(nameParts[1]);
      } else if (nameParts.length === 3) {
        if (nameParts[1].startsWith('"') && nameParts[1].endsWith('"')) {
          jsonObject.nickName = capitalizeFirstLetter(nameParts[1].slice(1, -1)); // remove the quotes
        } else {
          jsonObject.middleName = capitalizeFirstLetter(nameParts[1]);
        }
        jsonObject.lastName = capitalizeFirstLetter(nameParts[nameParts.length - 1]);
      }
      jsonObject.image = `img/${
        jsonObject.lastName
          ? jsonObject.lastName.slice(jsonObject.lastName.indexOf("-") + 1).toLowerCase()
          : ""
      }_${jsonObject.firstName ? jsonObject.firstName[0].toLowerCase() : ""}.png`;

      const halfBloods = bloodData.half;
      const pureBloods = bloodData.pure;

      if (halfBloods.includes(jsonObject.lastName)) {
        jsonObject.bloodStatus = "Half";
      } else if (pureBloods.includes(jsonObject.lastName)) {
        jsonObject.bloodStatus = "Pure";
      } else {
        jsonObject.bloodStatus = "Muggle";
      }

      return jsonObject;
    })
    .filter((jsonObject) => jsonObject);
}

// ---------------------------------- DATA DISPLAY ---------------------------------

function displayList(students) {
  // clear the list
  tableBody.innerHTML = "";

  // build a new list
  students.forEach((student) => {
    // create a row for each student
    let studentRow = document.createElement("tr");

    // create cells (td) for each property
    let imageCell = document.createElement("td");
    let firstNameCell = document.createElement("td");
    let middleNameCell = document.createElement("td");
    let lastNameCell = document.createElement("td");
    let nickNameCell = document.createElement("td");
    let genderCell = document.createElement("td");
    let bloodStatusCell = document.createElement("td");
    let houseCell = document.createElement("td");

    // fill in the properties to the cells
    let studentImage = document.createElement("img");
    studentImage.src = student.image;
    studentImage.alt = "";
    imageCell.appendChild(studentImage);

    firstNameCell.textContent = student.firstName;
    middleNameCell.textContent = student.middleName;
    lastNameCell.textContent = student.lastName;
    nickNameCell.textContent = student.nickName;
    genderCell.textContent = student.gender;
    bloodStatusCell.textContent = student.bloodStatus;
    houseCell.textContent = student.house;

    // append cells to the student row
    studentRow.appendChild(imageCell);
    studentRow.appendChild(firstNameCell);
    studentRow.appendChild(middleNameCell);
    studentRow.appendChild(lastNameCell);
    studentRow.appendChild(nickNameCell);
    studentRow.appendChild(genderCell);
    studentRow.appendChild(houseCell);
    studentRow.appendChild(bloodStatusCell);

    // append the student row to the table
    tableBody.appendChild(studentRow);
  });
}

// ---------------------------------- STRINGIFIERS ---------------------------------

function capitalizeFirstLetter(str) {
  if (!str) {
    // check if the string is not true
    return null;
  }
  return str[0].toUpperCase() + str.substring(1).toLowerCase();
}
