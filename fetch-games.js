const API_KEY = "ac669b002b534781818c488babf5aae4";

const today = new Date().toISOString().split("T")[0];

const url = `https://api.rawg.io/api/games?dates=${today},${today}&ordering=-released&key=${API_KEY}`;

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    console.log("Games released today:");
    if (!data.results || data.results.length
