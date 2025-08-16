function getActualUser() {
  const urlParams = new URLSearchParams(window.location.search);
  const user = urlParams.get("user");

  if (user) {
    return "?user=" + user;
  }
}

function addTransactionService() {
  (async () => {
    fetch("https://localhost:7040/Transactions" + getActualUser(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nom: document.getElementById("nom-add").value,
        date: document.getElementById("date-add").value,
        montant: document.getElementById("montant-add").value,
        categorie: document.getElementById("categorie-add").value,
      }),
    })
      .then(async () => {
        await getTransactionsService();
        await getTotalCourantService();
      })
      .catch((error) => {
        document.getElementById("lastTransactions").innerHTML =
          "Erreur lors de l'ajout d'une transaction'";
        console.error("Erreur:", error);
      });
  })();
}

async function getTransactionsService() {
  (async () => {
    fetch("https://localhost:7040/Transactions" + getActualUser())
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
}

async function getTotalCourantService() {
  (async () => {
    fetch("https://localhost:7040/Transactions/total-courant" + getActualUser())
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
}

async function getCategoriesService() {
  (async () => {
    fetch("https://localhost:7040/Categories" + getActualUser())
      .then((response) => response.json())
      .then((categories) => {
        let htmlCategorieToDisplay = "";
        htmlCategorieToDisplay += "<option value=''>- - -</option>";
        categories.forEach((categorie) => {
          htmlCategorieToDisplay += "<option>" + categorie.nom + "</option>";
        });
        document.getElementById("categorie-add").innerHTML =
          htmlCategorieToDisplay;
      })
      .catch((error) => {
        document.getElementById("totalCourant").innerHTML =
          "Erreur lors de la récupération des catégories";
        console.error("Erreur:", error);
      });
  })();
}

function suppressionService(id) {
  (async () => {
    fetch("https://localhost:7040/Transactions/" + id, {
      method: "DELETE",
    })
      .then(async () => {
        await getTransactionsService();
        await getTotalCourantService();
      })
      .catch((error) => {
        document.getElementById("lastTransactions").innerHTML =
          "Erreur lors de la suppression d'une transaction";
        console.error("Erreur:", error);
      });
  })();
}
