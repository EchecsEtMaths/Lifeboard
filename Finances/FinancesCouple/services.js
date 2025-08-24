async function getTransactionsCommunService() {
  (async () => {
    fetch(url + "Transactions/commun")
      .then((response) => response.json())
      .then((data) => {
        loadLastTransactionsCommuns(data);
      })
      .catch((error) => {
        document.getElementById("lastTransactionsCommuns").innerHTML =
          "Erreur lors de la récupération des transactions communes";
        console.error("Erreur:", error);
      });
  })();
}
