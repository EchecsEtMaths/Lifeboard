const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

/* Functions */

function deconnexion() {
  window.location.href = "/index.html";
}

function construtTable(tableName, data) {
  if (!data || data.length === 0)
    return document.createTextNode("Aucune donnée.");

  const columns = Object.keys(data[0]);
  const visibleColumns = columns.slice(1);
  const tableEl = document.createElement("table");
  const caption = document.createElement("caption");
  caption.textContent = tableName;
  tableEl.appendChild(caption);

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (let col of visibleColumns) {
    const th = document.createElement("th");
    th.textContent = col === "categorieNom" ? "Catégorie" : col;

    headRow.appendChild(th);
  }
  const th = document.createElement("th");
  th.textContent = "Action";
  headRow.appendChild(th);

  thead.appendChild(headRow);
  tableEl.appendChild(thead);

  const categories = [
    ...new Set(data.map((row) => row.categorieNom).filter(Boolean)),
  ];
  const colorPalette = [
    "#e6194b",
    "#3cb44b",
    "#ffe119",
    "#4363d8",
    "#f58231",
    "#911eb4",
    "#46f0f0",
    "#f032e6",
    "#bcf60c",
  ];

  const categoryColors = new Map();
  categories.forEach((cat, index) => {
    categoryColors.set(cat, colorPalette[index % colorPalette.length]);
  });

  const tbody = document.createElement("tbody");
  for (let row of data) {
    const tr = document.createElement("tr");
    for (let col of visibleColumns) {
      const td = document.createElement("td");
      let value = row[col];

      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        const date = new Date(value);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        value = `${day} / ${month} / ${year}`;
      }

      if (col === "categorieNom" && value) {
        td.style.color = categoryColors.get(value);
      }

      if (col.toLowerCase().includes("montant") && typeof value === "number") {
        if (value < 0) {
          td.style.color = "#e6194b";
        } else if (value > 0) {
          td.style.color = "#3cb44b";
        }
        value = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(value);
      }

      td.textContent = value ?? "Aucun";
      tr.appendChild(td);
    }
    const td = document.createElement("td");
    let htmlActions = "";
    htmlActions +=
      "<button class='action' title='Modifier la ligne' onclick='openUpdateModal(" +
      row.id +
      ")'>✏️</button>";
    htmlActions += "<dialog id='update-modal-" + row.id + "'>";
    htmlActions +=
      "<button class='close-btn' aria-label='Fermer'>&times;</button>";
    htmlActions += "<form method='dialog' id='update-form'>";
    htmlActions += "<h3>Modifier la transaction</h3>";
    htmlActions +=
      "<input id='nom-update' type='text' placeholder='Nom' required value='" +
      row.nom +
      "'/>";
    const date = new Date(row.dateTransac);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const dateToDisplay = `${year}-${month}-${day}`;
    htmlActions +=
      "<input id='date-update' type='date' required value='" +
      dateToDisplay +
      "'/>";
    htmlActions +=
      "<input id='montant-update' type='text' class='montant' placeholder='Montant' required value='" +
      row.montant +
      "'/>";
    htmlActions +=
      "<select id='categorie-update' class='categorie-update' required value='" +
      row.categorieNom +
      "'>";
    htmlActions += "</select>";
    htmlActions += "<button type='submit'>Enregistrer</button>";
    htmlActions += "</form>";
    htmlActions += "</dialog>";

    htmlActions += "<span> </span>";

    htmlActions +=
      "<button class='action' title='Supprimer la ligne' popovertarget='supprimer-popover-" +
      row.id +
      "'>🗑️</button>";
    htmlActions +=
      "<div popover class='action-popover' id='supprimer-popover-" +
      row.id +
      "'>";
    htmlActions += "<div>";
    htmlActions +=
      "Confirmer la suppression de la transaction : " + row.nom + " ?";
    htmlActions += "<br>";
    htmlActions +=
      "<button class='suppression' onclick='suppression(" +
      row.id +
      ")'>✅</button>";
    htmlActions +=
      "<button class='annuler' onclick='popoverClose(" +
      row.id +
      ")'>❌</button>";
    htmlActions += "</div>";

    td.innerHTML = htmlActions;
    tr.appendChild(td);

    tbody.appendChild(tr);
  }

  tableEl.appendChild(tbody);
  return tableEl;
}

async function loadLastTransactions(data) {
  const container = document.getElementById("lastTransactions");
  container.innerHTML = "";

  const limited = data.slice(0, 50);

  const tableEl = construtTable("Dernières transactions courantes", limited);

  container.appendChild(tableEl);

  getCategoriesService();

  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dialog = btn.closest("dialog");
      if (dialog) dialog.close();
    });
  });
}

async function loadTotalCourant(data) {
  const container = document.getElementById("totalCourant");
  container.innerHTML = "";

  container.innerHTML = "<h2>Total : " + data.total + " €<h2>";
}

function popoverClose(id) {
  document.getElementById("supprimer-popover-" + id).hidePopover();
}

function openUpdateModal(id) {
  document.getElementById("update-modal-" + id).showModal();
}

async function suppression(id) {
  await suppressionService(id);
  document.getElementById("supprimer-popover-" + id).hidePopover();
}

async function addTransaction() {
  addTransactionService();
}

/* Main */

getTransactionsService();

getTotalCourantService();

const urlParams = new URLSearchParams(window.location.search);
const user = urlParams.get("user");

if (user) {
  document.querySelectorAll(".menu-item, .back-button").forEach((link) => {
    const linkUrl = new URL(link.href, window.location.origin);
    linkUrl.searchParams.set("user", user);
    link.href = linkUrl.toString();
  });
}

/* Events listeners */

document.getElementById("add-button").addEventListener("click", () => {
  document.getElementById("add-modal").showModal();
});

document.getElementById("add-form").addEventListener("submit", (event) => {
  event.preventDefault();
  let isValid = true;

  document
    .getElementById("add-form")
    .querySelectorAll("input, select")
    .forEach((input) => {
      if (!input.checkValidity()) {
        isValid = false;
      }
    });

  if (!isValid) return;

  addTransaction();
  document.getElementById("add-modal").close();
  document.getElementById("nom-add").value = "";
  document.getElementById("date-add").value = "";
  document.getElementById("montant-add").value = formatter.format(0);
  document.getElementById("categorie-add").value = "";
});

document.querySelectorAll(".montant").forEach((input) => {
  input.value = formatter.format(0);

  input.addEventListener("blur", () => {
    let value = parseFloat(input.value.replace(",", "."));
    if (!isNaN(value)) {
      input.value = formatter.format(value);
    }
  });

  input.addEventListener("focus", () => {
    input.value = input.value.replace(/[^\d,.-]/g, "");
  });
});

document.querySelectorAll(".close-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const dialog = btn.closest("dialog");
    if (dialog) dialog.close();
  });
});
