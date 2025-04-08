const OPENWEATHER_API_KEY = '815fbb06782bb6c9f36fd4a8ca6dc311';
const UNSPLASH_ACCESS_KEY = 'KZQd2EHu-veoSnHonHuDP1rRq1YOIp66TnlXuskROjw';

// Elementos del DOM
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const infoSection = document.querySelector(".info-section");
const weatherSection = document.querySelector(".weather-section");
const gallerySection = document.querySelector(".image-gallery");
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const favoritesSection = document.getElementById('favorites-section');
const favoritesList = document.getElementById('favorites-list');

const darkModeClass = 'dark-mode-body';
const localStorageDarkModeKey = 'darkMode';
const localStorageFavoritesKey = 'favorites';

// --- Funcionalidad Dark Mode ---
function enableDarkMode() {
    body.classList.add(darkModeClass);
    localStorage.setItem(localStorageDarkModeKey, 'enabled');
}

function disableDarkMode() {
    body.classList.remove(darkModeClass);
    localStorage.setItem(localStorageDarkModeKey, 'disabled');
}

// Comprobar la preferencia guardada para el modo oscuro
if (localStorage.getItem(localStorageDarkModeKey) === 'enabled') {
    enableDarkMode();
}

darkModeToggle.addEventListener('click', () => {
    if (body.classList.contains(darkModeClass)) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
});

// --- Funcionalidad Favoritos ---
function getFavorites() {
    const favorites = localStorage.getItem(localStorageFavoritesKey);
    return favorites ? JSON.parse(favorites) : [];
}

function saveFavorite(countryName) {
    let favorites = getFavorites();
    if (!favorites.includes(countryName)) {
        favorites.push(countryName);
        localStorage.setItem(localStorageFavoritesKey, JSON.stringify(favorites));
        displayFavorites(); // Actualizar la lista visual
        alert(`${countryName} added to favorites!`);
    } else {
        alert(`${countryName} is already in favorites.`);
    }
}

function removeFavorite(countryName) {
    let favorites = getFavorites();
    favorites = favorites.filter(fav => fav !== countryName);
    localStorage.setItem(localStorageFavoritesKey, JSON.stringify(favorites));
    displayFavorites(); // Actualizar la lista visual
    alert(`${countryName} removed from favorites.`);
}

function displayFavorites() {
    favoritesList.innerHTML = '';
    const favorites = getFavorites();
    if (favorites.length > 0) {
        favorites.forEach(fav => {
            const listItem = document.createElement('li');
            listItem.textContent = fav;
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.classList.add('btn');
            removeButton.addEventListener('click', () => removeFavorite(fav));
            listItem.appendChild(removeButton);
            favoritesList.appendChild(listItem);
        });
        favoritesSection.style.display = 'block';
    } else {
        favoritesSection.style.display = 'none';
    }
}

// Mostrar favoritos al cargar la página (si la sección está en la misma página)
displayFavorites();

// --- Funciones para Fetch de Datos ---
async function fetchCountryData(country) {
    const url = `https://restcountries.com/v3.1/name/${country}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Country not found");

        const data = await response.json();
        return data[0]; // Tomamos el primer resultado
    } catch (error) {
        console.error("Error fetching country data:", error);
        infoSection.innerHTML = `<p style="color: red;">⚠️ Country not found. Try again.</p>`;
        weatherSection.innerHTML = "";
        gallerySection.innerHTML = "";
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
        weatherSection.innerHTML = `<p style="color: red;">⚠️ Weather data not available for ${city}.</p>`;
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
        gallerySection.innerHTML = `<p style="color: red;">⚠️ No images found for ${query}.</p>`;
        return [];
    }
}

// --- Evento del Botón de Búsqueda ---
searchButton.addEventListener("click", async () => {
    const input = searchInput.value.trim();

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
                    <p><strong>Currency:</strong> ${Object.values(countryData.currencies)[0]?.name} (${Object.keys(countryData.currencies)[0]})</p>
                    <p><strong>Languages:</strong> ${Object.values(countryData.languages).join(", ")}</p>
                    <button class="fav-btn" data-country="${countryData.name.common}">Add to Favorites</button>
                </div>
            `;

            // Event listener para el botón de favoritos (se añade dinámicamente)
            const favButton = infoSection.querySelector('.fav-btn');
            if (favButton) {
                favButton.addEventListener('click', function() {
                    const countryName = this.dataset.country;
                    saveFavorite(countryName);
                });
            }

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
            } else {
                weatherSection.innerHTML = `<p style="color: orange;">⚠️ Could not fetch weather for ${capital || input}.</p>`;
            }

            if (images.length > 0) {
                gallerySection.innerHTML = images.map(img => `
                    <img src="${img.urls.small}" alt="${img.alt_description}" loading="lazy" onload="this.classList.add('loaded')" />
                `).join('');
            } else {
                gallerySection.innerHTML = `<p style="color: orange;">⚠️ No images found for ${countryData.name.common}.</p>`;
            }

        }
    }
});