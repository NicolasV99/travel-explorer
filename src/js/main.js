document.getElementById("searchButton").addEventListener("click", () => {
  const input = document.getElementById("searchInput").value.trim();

  if (input) {
    console.log("🔍 Searching for:", input);
    // Aquí luego llamaremos a countryData, weatherData, imageGallery, etc.
    // Por ahora solo mostramos en consola
    const resultsSection = document.getElementById("results");
    resultsSection.innerHTML = `<p>Loading info for <strong>${input}</strong>...</p>`;
  }
});
