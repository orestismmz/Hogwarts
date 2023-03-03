"use strict";

// events cannot listen to async functions so I call start in an anonymous function
window.addEventListener("DOMContentLoaded", () => start());

// ------------------------- One function to RULL THEM ALL! ----------------------
async function start() {
  // The main function of this program.

  // Simultaneous assignment of the two items in the array returned from fetchData() in two variables.
  // The first item will be assigned to studentsData and the second to bloodData.
  // thanks stackoverflow!
  let [studentsData, bloodData] = await fetchData();
  // Now that I have the data I pass it to this function
  generateStudents(studentsData, bloodData);

  let students = generateStudents(studentsData, bloodData);
  displayList(students);
}

// ---------------------------------- DATA FETCH ---------------------------------

async function fetchData() {
  // Multiple fetch request in parallel
  // the Promise.all() will return an array of 2 items, the students data and blood data
  return await Promise.all([
    fetch("https://petlatkea.dk/2021/hogwarts/students.json").then((response) => response.json()),
    fetch("https://petlatkea.dk/2021/hogwarts/families.json").then((response) => response.json()),
  ]);
}

// ---------------------------------- DATA CLEANING ------------------------------

function generateStudents(studentsData, bloodData) {
  // This function takes an data-array and an data-object and and returns an objects-array with clean data
  // It will go like this:
  // return data.map(cleanMyDataFunction).filter(truthyObjects)

  // .map will give me a new array of objects out of the json array.
  // .filter will remove null objects and give me the truthy ones

  return studentsData
    .map((jsonObject) => {
      // -------- cleaning data process ---------

      const nameParts = jsonObject.fullname
        .trim() // remove spaces from ends
        .split(" ") // split to array on spaces so I can grab each word (and only word
        .filter((str) => str); // filter strings only

      // Return null if fullname is empty (I don't trust you, data!)
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
        jsonObject.lastName //check if there is a lastName
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
  let studentList = document.querySelector("#student-list");
  studentList.innerHTML = "";

  // build a new list
  students.forEach((student) => {
    // create a student field
    let studentField = document.createElement("article");
    // create tags for each property
    let studentImage = document.createElement("img");
    let studentName = document.createElement("h2");

    // fill in the student properties to the tags
    studentImage.src = student.image;
    studentImage.alt = "";
    studentName.textContent = `${student.firstName} ${student.lastName ? student.lastName : ""}`;

    // append tags to the student field
    studentField.appendChild(studentImage);
    studentField.appendChild(studentName);

    // add a data set to the student field
    studentField.dataset.name = `${student.firstName} ${
      student.middleName ? student.middleName : ""
    } ${student.lastName ? student.lastName : ""}`;

    // add a click event to the student filed
    studentField.addEventListener("click", (event) => {
      console.log(event.currentTarget.dataset.name);
    });

    // append the student field to the list
    studentList.appendChild(studentField);
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
