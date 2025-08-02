// 💡 Construction de table HTML
function construtTable(tableName, data) {
  if (!data || data.length === 0)
    return document.createTextNode("Aucune donnée.");

  const columns = Object.keys(data[0]);
  const tableEl = document.createElement("table");
  const caption = document.createElement("caption");
  caption.textContent = tableName;
  tableEl.appendChild(caption);

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (let col of columns) {
    const th = document.createElement("th");
    th.textContent = col;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  tableEl.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (let row of data) {
    const tr = document.createElement("tr");
    for (let col of columns) {
      const td = document.createElement("td");
      td.textContent = row[col] ?? "Aucun";
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  tableEl.appendChild(tbody);
  return tableEl;
}

// 🔄 Charger toutes les tables (Transactions, Categorie)
async function loadDatabase() {
  const container = document.getElementById("tables");
  container.innerHTML = "";

  const tables = ["Transactions", "Categorie"];
  for (let tableName of tables) {
    const data = await db[tableName].toArray();
    const tableEl = construtTable(tableName, data);
    container.appendChild(tableEl);
  }
}

// 📋 Charger les dernières transactions avec jointure
async function loadLastTransactions() {
  const container = document.getElementById("lastTransactions");
  container.innerHTML = "";

  const transactions = await db.Transactions.where("compte_id")
    .equals(1)
    .reverse()
    .sortBy("date_transac");

  const limited = transactions.slice(0, 50);

  const withCategorie = await Promise.all(
    limited.map(async (t) => {
      const cat = await db.Categorie.get(t.categorie_id);
      return {
        Nom: t.nom,
        Date: t.date_transac,
        Montant: `${t.montant} €`,
        Catégorie: cat ? cat.nom : "Aucune",
      };
    })
  );

  const tableEl = construtTable(
    "Dernières transactions courantes",
    withCategorie
  );
  container.appendChild(tableEl);
}

// ➕ Ajouter une transaction
async function test() {
  await db.Transactions.add({
    nom: "test ajout",
    date_transac: "2025-07-26",
    montant: -50,
    compte_id: 1,
    categorie_id: 1,
  });

  await loadLastTransactions();
}

// 🔘 Bouton ajout
async function addTransaction() {
  try {
    await test();
  } catch (err) {
    document.getElementById("add-button").textContent =
      "Erreur d'ajout : " + err;
    console.error(err);
  }
}

// 🏁 Initialisation
loadLastTransactions().catch((err) => {
  document.getElementById("lastTransactions").textContent =
    "Erreur de chargement : " + err;
});
loadDatabase().catch((err) => {
  document.getElementById("tables").textContent =
    "Erreur de chargement : " + err;
});

async function importSQLiteToDexie() {
  const SQL = await initSqlJs({
    locateFile: (file) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`,
  });

  const response = await fetch("../BDD/finances.db");
  const buffer = await response.arrayBuffer();
  const sqliteDB = new SQL.Database(new Uint8Array(buffer));

  // Charger les données de Categorie
  const catRes = sqliteDB.exec("SELECT * FROM Categorie");
  const catCols = catRes[0]?.columns || [];
  const catRows = catRes[0]?.values || [];
  const categories = catRows.map((row) =>
    Object.fromEntries(catCols.map((col, i) => [col, row[i]]))
  );

  // Charger les données de Transactions
  const transRes = sqliteDB.exec("SELECT * FROM Transactions");
  const transCols = transRes[0]?.columns || [];
  const transRows = transRes[0]?.values || [];
  const transactions = transRows.map((row) =>
    Object.fromEntries(transCols.map((col, i) => [col, row[i]]))
  );

  // Vider Dexie (au cas où)
  await db.Categorie.clear();
  await db.Transactions.clear();

  // Injecter dans IndexedDB
  await db.Categorie.bulkAdd(categories);
  await db.Transactions.bulkAdd(transactions);

  console.log("✅ Données importées depuis finances.db dans IndexedDB");
}

(async () => {
  // Une seule fois au démarrage si la base est vide
  const isEmpty = (await db.Transactions.count()) === 0;
  if (isEmpty) {
    await importSQLiteToDexie();
  }

  await loadLastTransactions();
  await loadDatabase();
})();
