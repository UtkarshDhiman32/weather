document.addEventListener("DOMContentLoaded", () => {
  const cityInput = document.querySelector(".city-input");
  const searchButton = document.querySelector(".search-btn");
  const API_key = "0a52546543b98531e13f7869070e7dd2";
  const weathercarddiv = document.querySelector(".weather-cards");
  const currentweathercarddiv = document.querySelector(".current-weather");
  const locationbutton = document.querySelector(".location-btn");

  //html for main card
  const createweathercard = (cityName, weatherItem, index) => {
    if (index === 0) {
      return ` <div class="details">
        <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
        <h4>Temperature:${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>Wind:${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity:${weatherItem.main.humidity}%</h4>
      </div>
      <div class="icon">
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
        <h4>${weatherItem.weather[0].description}</h4>
      </div>`;
    } else { // html for 5 days forecast card
      return ` <li class="card">
        <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
        <h4>Temp:${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>Wind:${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity:${weatherItem.main.humidity}%</h4>
      </li>`;
    }
  };

  const getWeatherDetails = (cityName, lat, lon) => {
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}`;
    fetch(weatherApiUrl)
      .then((res) => res.json())
      .then((data) => {
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter((forecast) => {
          const forecastDate = new Date(forecast.dt_txt).getDate();
          if (!uniqueForecastDays.includes(forecastDate)) {
            return uniqueForecastDays.push(forecastDate);
          }
        });

        // Clearing previous data
        cityInput.value = "";
        currentweathercarddiv.innerHTML = "";
        weathercarddiv.innerHTML = ""; // Clear previous weather cards

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
          if (index === 0) {
            currentweathercarddiv.insertAdjacentHTML(
              "beforeend",
              createweathercard(cityName, weatherItem, index)
            );
          } else {
            weathercarddiv.insertAdjacentHTML(
              "beforeend",
              createweathercard(cityName, weatherItem, index)
            );
          }
        });
      })
      .catch(() => {
        alert("An error occurred while fetching the weather forecast.");
      });
  };

  const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_key}`;
    fetch(geoApiUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
      })
      .catch(() => {
        alert("An error occurred while fetching the city coordinates.");
      });
  };

  const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;
        fetch(REVERSE_GEOCODING_URL)
          .then((res) => res.json())
          .then((data) => {
            const { name } = data[0];
            getWeatherDetails(name, latitude, longitude);
          })
          .catch(() => {
            alert("An error occurred while fetching the city!");
          });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          alert("Please turn on location");
        }
      }
    );
  };

  // Event listeners
  searchButton.addEventListener("click", getCityCoordinates);
  locationbutton.addEventListener("click", getUserCoordinates);
  cityInput.addEventListener("keyup", (e) => e.key === "Enter" && getCityCoordinates());
});
