function deconnexion() {
  window.location.href = "/index.html";
}

function construtTable(tableName, data) {
  if (!data || data.length === 0)
    return document.createTextNode("Aucune donnée.");

  const columns = Object.keys(data[0]);
  const visibleColumns = columns.slice(1, -1);
  const tableEl = document.createElement("table");
  const caption = document.createElement("caption");
  caption.textContent = tableName;
  tableEl.appendChild(caption);

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (let col of visibleColumns) {
    const th = document.createElement("th");
    th.textContent =
      col === "categorieNom"
        ? "Catégorie"
        : col === "dateTransac"
        ? "Date de la transaction"
        : col === "montant"
        ? "Montant"
        : col === "nom"
        ? "Nom"
        : col;

    headRow.appendChild(th);
  }

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

      tbody.appendChild(tr);
    }
  }

  tableEl.appendChild(tbody);
  return tableEl;
}

async function loadLastTransactionsCommuns(data) {
  const container = document.getElementById("lastTransactionsCommuns");
  container.innerHTML = "";

  const limited = data.slice(0, 50);
  const tableEl = construtTable("Dernières transactions communes", limited);
  container.appendChild(tableEl);
}

getTransactionsCommunService();

const urlParams = new URLSearchParams(window.location.search);
const user = urlParams.get("user");

if (user) {
  document.querySelectorAll(".menu-item, .back-button").forEach((link) => {
    const linkUrl = new URL(link.href, window.location.origin);
    linkUrl.searchParams.set("user", user);
    link.href = linkUrl.toString();
  });
}
