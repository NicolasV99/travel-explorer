const OPENWEATHER_API_KEY = '815fbb06782bb6c9f36fd4a8ca6dc311';
const UNSPLASH_ACCESS_KEY = 'KZQd2EHu-veoSnHonHuDP1rRq1YOIp66TnlXuskROjw';


async function fetchCountryData(country) {
  const url = `https://restcountries.com/v3.1/name/${country}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Country not found");

    const data = await response.json();
    return data[0]; // Tomamos el primer resultado
  } catch (error) {
    console.error("Error fetching country data:", error);
    return null;
  }
}

async function fetchWeatherData(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather not found");
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}

async function fetchCountryImages(query) {
  const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=5&client_id=${UNSPLASH_ACCESS_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("No images found");
    
    const data = await response.json();
    return data.results; // lista de imágenes
  } catch (error) {
    console.error("Error fetching images:", error);
    return [];
  }
}

document.getElementById("searchButton").addEventListener("click", async () => {
  const input = document.getElementById("searchInput").value.trim();
  const infoSection = document.querySelector(".info-section");
  const weatherSection = document.querySelector(".weather-section");
  const gallerySection = document.querySelector(".image-gallery");

  if (input) {
    infoSection.innerHTML = `<p>Loading info for <strong>${input}</strong>...</p>`;
    weatherSection.innerHTML = "";
    gallerySection.innerHTML = "";

    const countryData = await fetchCountryData(input);

    if (countryData) {
      const capital = countryData.capital ? countryData.capital[0] : null;
      const weatherData = capital ? await fetchWeatherData(capital) : null;
      const images = await fetchCountryImages(countryData.name.common);

      infoSection.innerHTML = `
        <div class="country-card">
          <img src="${countryData.flags.svg}" alt="Flag of ${countryData.name.common}" class="flag">
          <h2>${countryData.name.common}</h2>
          <p><strong>Capital:</strong> ${capital || "N/A"}</p>
          <p><strong>Population:</strong> ${countryData.population.toLocaleString()}</p>
          <p><strong>Currency:</strong> ${Object.values(countryData.currencies)[0].name} (${Object.keys(countryData.currencies)[0]})</p>
          <p><strong>Languages:</strong> ${Object.values(countryData.languages).join(", ")}</p>
        </div>
      `;

      if (weatherData) {
        const icon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
        weatherSection.innerHTML = `
          <div class="weather-card">
            <h3>Weather in ${capital}</h3>
            <img src="${icon}" alt="${weatherData.weather[0].description}">
            <p><strong>${weatherData.weather[0].main}</strong> - ${weatherData.weather[0].description}</p>
            <p>🌡️ ${weatherData.main.temp} °C | 💧 ${weatherData.main.humidity}% | 🌬️ ${weatherData.wind.speed} m/s</p>
          </div>
        `;
      }

      if (images.length > 0) {
        gallerySection.innerHTML = `
          ${images.map(img => `
            <img src="${img.urls.small}" alt="${img.alt_description}" loading="lazy" />
          `).join('')}
        `;
      }

    } else {
      infoSection.innerHTML = `<p style="color: red;">⚠️ Country not found. Try again.</p>`;
    }
  }
});