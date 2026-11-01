const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const rollInput = document.getElementById("roll");
const emailInput = document.getElementById("email");
const courseInput = document.getElementById("course");
const editIdInput = document.getElementById("editId");
const tableBody = document.getElementById("studentTable");
const count = document.getElementById("studentCount");
const searchInput = document.getElementById("search");
const message = document.getElementById("message");
const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelEditButton = document.getElementById("cancelEdit");

let students = JSON.parse(localStorage.getItem("students")) || [];

function saveStudents() {
  localStorage.setItem("students", JSON.stringify(students));
}

function showMessage(text) {
  message.textContent = text;
  window.setTimeout(() => { message.textContent = ""; }, 3000);
}

function renderStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = students.filter(student =>
    [student.name, student.roll, student.email, student.course]
      .some(value => value.toLowerCase().includes(query))
  );

  count.textContent = students.length;

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="empty">${
      students.length ? "No matching students found." : "No students added yet. Add your first student above."
    }</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(student => `
    <tr>
      <td>${escapeHTML(student.name)}</td>
      <td>${escapeHTML(student.roll)}</td>
      <td>${escapeHTML(student.email || "—")}</td>
      <td>${escapeHTML(student.course)}</td>
      <td>
        <div class="actions">
          <button class="small-button edit" data-action="edit" data-id="${student.id}">Edit</button>
          <button class="small-button delete" data-action="delete" data-id="${student.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

// Escape user-entered text before displaying it in the page.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const student = {
    id: editIdInput.value || String(Date.now()),
    name: nameInput.value.trim(),
    roll: rollInput.value.trim(),
    email: emailInput.value.trim(),
    course: courseInput.value.trim()
  };

  const duplicate = students.some(item =>
    item.roll.toLowerCase() === student.roll.toLowerCase() && item.id !== student.id
  );

  if (duplicate) {
    showMessage("That roll number is already registered.");
    return;
  }

  if (editIdInput.value) {
    students = students.map(item => item.id === student.id ? student : item);
    showMessage("Student details updated.");
  } else {
    students.push(student);
    showMessage("Student added successfully.");
  }

  saveStudents();
  renderStudents();
  resetForm();
});

tableBody.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const student = students.find(item => item.id === button.dataset.id);
  if (!student) return;

  if (button.dataset.action === "edit") {
    editIdInput.value = student.id;
    nameInput.value = student.name;
    rollInput.value = student.roll;
    emailInput.value = student.email;
    courseInput.value = student.course;
    formTitle.textContent = "Edit student";
    saveButton.textContent = "Save changes";
    cancelEditButton.classList.remove("hidden");
    nameInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (button.dataset.action === "delete") {
    if (confirm(`Delete ${student.name}'s record?`)) {
      students = students.filter(item => item.id !== student.id);
      saveStudents();
      renderStudents();
      showMessage("Student deleted.");
      if (editIdInput.value === student.id) resetForm();
    }
  }
});

function resetForm() {
  form.reset();
  editIdInput.value = "";
  formTitle.textContent = "Add a student";
  saveButton.textContent = "Add student";
  cancelEditButton.classList.add("hidden");
}

cancelEditButton.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderStudents);

renderStudents();
