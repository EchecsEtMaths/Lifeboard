// 💡 Construction de table HTML
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
    tbody.appendChild(tr);
  }

  tableEl.appendChild(tbody);
  return tableEl;
}

/* Transactions */
async function loadLastTransactions(data) {
  const container = document.getElementById("lastTransactions");
  container.innerHTML = "";

  const limited = data.slice(0, 50);

  const tableEl = construtTable("Dernières transactions courantes", limited);

  container.appendChild(tableEl);
}

(async () => {
  fetch("https://localhost:7040/Transactions")
    .then((response) => response.json())
    .then((data) => {
      loadLastTransactions(data);
    })
    .catch((error) => {
      document.getElementById("lastTransactions").innerHTML =
        "Erreur lors de la récupération des transactions";
      console.error("Erreur:", error);
    });
})();

/* Total courant */

async function loadTotalCourant(data) {
  const container = document.getElementById("totalCourant");
  container.innerHTML = "";

  container.innerHTML = "<h2>Total : " + data.total + " €<h2>";
}

(async () => {
  fetch("https://localhost:7040/Transactions/total-courant")
    .then((response) => response.json())
    .then((data) => {
      loadTotalCourant(data);
    })
    .catch((error) => {
      document.getElementById("totalCourant").innerHTML =
        "Erreur lors de la récupération du total";
      console.error("Erreur:", error);
    });
})();
