const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const url = isLocal
  ? "https://localhost:7040/"
  : `${window.location.protocol}//${window.location.hostname}:5000/`;
