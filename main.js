const expenseForm = document.querySelector("#expenseForm");

// Buttons
const addExpenseBtn = document.querySelector("#addExpense");
const saveChangesBtn = document.querySelector("#saveChanges");
const cancelBtn = document.querySelector("#cancel");
const resetBtn = document.querySelector("#reset");

// Inputs
const titleInput = document.querySelector("#titleInput");
const amountInput = document.querySelector("#amountInput");
const dateInput = document.querySelector("#dateInput");
const categoryInput = document.querySelector("#categoryInput");

// Table for expense list
const expenseTableBody = document.querySelector("#expenseTableBody");

// Expense Chart Container
const expenseChartContainer = document.querySelector("#expenseChartContainer");
const expenseChart = document.querySelector("#expenseChart");

let expenses = [];
let editingIndex = null;
let chartData = null;

const expenseCategories = {
  food: {
    label: "Food",
  },
  transport: {
    label: "Transport",
  },
  medicine: {
    label: "Medicine",
  },
  entertainment: {
    label: "Entertainment",
  },
  electronics: {
    label: "Electronics",
  },
  other: {
    label: "Other",
  },
};

function resetForm() {
  titleInput.value = "";
  amountInput.value = "";
  dateInput.value = "";
  categoryInput.value = "";
}

function addExpense() {
  const newExpense = {
    id: crypto.randomUUID(),
    title: titleInput.value,
    amount: +amountInput.value,
    date: dateInput.value,
    category: categoryInput.value,
  };

  expenses.push(newExpense);

  renderExpenses();
  renderChart();
  saveToLocalStorage();
  resetForm();
}

function deleteExpense(index) {
  if (confirm("Are you sure you want to delete this expense?")) {
    expenses.splice(index, 1);
    renderExpenses();
    renderChart();
    saveToLocalStorage();
  }
}

function enableEditing(index) {
  editingIndex = index;
  const expense = expenses[index];

  titleInput.value = expense.title;
  amountInput.value = expense.amount;
  dateInput.value = expense.date;
  categoryInput.value = expense.category;

  addExpenseBtn.classList.add("d-none");
  saveChangesBtn.classList.remove("d-none");
  cancelBtn.classList.remove("d-none");
}

function cancelEditing() {
  editingIndex = null;

  titleInput.value = "";
  amountInput.value = "";
  dateInput.value = "";
  categoryInput.value = "";

  addExpenseBtn.classList.remove("d-none");
  saveChangesBtn.classList.add("d-none");
  cancelBtn.classList.add("d-none");
}

function saveChange() {
  if (
    typeof editingIndex !== "number" ||
    editingIndex < 0 ||
    editingIndex >= expenses.length
  ) {
    console.error("Invalid editingIndex value.", editingIndex);
    return;
  }
  const existingExpense = expenses[editingIndex];

  const newExpense = {
    ...existingExpense,
    title: titleInput.value,
    amount: amountInput.value,
    date: dateInput.value,
    category: categoryInput.value,
  };

  expenses[editingIndex] = newExpense;

  cancelEditing();
  renderExpenses();
  renderChart();
  saveToLocalStorage();
}

function generateRandomHSLColors(n) {
  const colors = [];
  for (let i = 0; i < n; i++) {
    const hue = Math.floor(Math.random() * 361); // 0-360
    const saturation = Math.floor(Math.random() * 101); // 0-100
    const lightness = Math.floor(Math.random() * 101); // 0-100
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
}

function groupExpensesByCategory() {
  const groupedExpenses = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + +expense.amount;
    return acc;
  }, {});

  return {
    labels: Object.keys(groupedExpenses),
    amounts: Object.values(groupedExpenses),
  };
}

function renderExpenses() {
  expenseTableBody.innerHTML = "";

  if (expenses.length === 0) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td colspan="5" class="text-center">
        No expenses found
      </td>
    `;

    expenseTableBody.appendChild(row);
    return;
  }

  expenses.forEach((expense, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${expense.title}</td>
      <td>${expense.amount}</td>
      <td>${expense.date}</td>
      <td>${expense.category}</td>
      <td>
        <button class="btn btn-primary" onclick="enableEditing(${index})">Edit</button>
        <button class="btn btn-danger" onclick="deleteExpense(${index})">Delete</button>
      </td>
    `;

    expenseTableBody.appendChild(row);
  });
}

function renderChart() {
  if (chartData) {
    chartData.destroy();
  }

  if (expenses.length === 0) {
    expenseChartContainer.innerHTML = `
      <h5 class="text-center">No expenses found</h5>
    `;
    expenseChartContainer.classList.add("d-flex");
    expenseChartContainer.classList.add("align-items-center");
    expenseChartContainer.classList.add("justify-content-center");

    return;
  }

  expenseChartContainer.innerHTML = "";
  expenseChartContainer.classList.add("d-flex");
  expenseChartContainer.classList.add("align-items-center");
  expenseChartContainer.classList.add("justify-content-center");
  expenseChartContainer.appendChild(expenseChart);

  const { labels, amounts } = groupExpensesByCategory();

  chartData = new Chart(expenseChart, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Expense Dataset",
          data: amounts,
          backgroundColor: [...generateRandomHSLColors(labels.length)],
        },
      ],
      hoverOffset: 4,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function saveToLocalStorage() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function loadFromLocalStorage() {
  const storedExpenses = localStorage.getItem("expenses");
  if (storedExpenses) {
    expenses = JSON.parse(storedExpenses);
  }
}

function populateCategoryOptions() {
  categoryInput.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select Category";
  categoryInput.appendChild(defaultOption);

  Object.keys(expenseCategories).forEach((categoryKey) => {
    const option = document.createElement("option");
    const label = expenseCategories[categoryKey].label;

    option.value = categoryKey;
    option.textContent = label;

    categoryInput.appendChild(option);
  });
}

addExpenseBtn.addEventListener("click", (event) => {
  addExpense();
});

function init() {
  populateCategoryOptions();
  loadFromLocalStorage();
  renderExpenses();
  renderChart();
}

saveChangesBtn.addEventListener("click", (event) => {});

cancelBtn.addEventListener("click", (event) => {});

// resetBtn.addEventListener("click", (event) => {});
document.addEventListener("DOMContentLoaded", (event) => {
  init();
});
