document.getElementById('getWeatherButton').addEventListener('click', getWeather);
document.getElementById('getGPTRecommendationButton').addEventListener('click', getGPTRecommendation);

function getWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById('weatherInfo').innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    fetch(`/weather?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
            // makeFoodRecommendation(data);
            getGPTRecommendation(data);
        })
        .catch(error => {
            document.getElementById('weatherInfo').innerHTML = "Unable to retrieve weather data.";
            console.error('Error fetching weather data:', error);
        });
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById('weatherInfo').innerHTML = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById('weatherInfo').innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            document.getElementById('weatherInfo').innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById('weatherInfo').innerHTML = "An unknown error occurred.";
            break;
    }
}

function displayWeather(data) {
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.innerHTML = `Current weather: ${data.weather[0].description}, Temperature: ${data.main.temp}°C`;

    const weatherIcon = document.getElementById('weatherIcon');
    weatherIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather icon">`;
}

function makeFoodRecommendation(weatherData) {
    const temp = weatherData.main.temp;
    let recommendation;

    if (temp > 25) {
        recommendation = "How about a refreshing salad or some ice cream?";
    } else if (temp > 15) {
        recommendation = "Maybe a light pasta or a sandwich?";
    } else {
        recommendation = "How about some hot soup or a warm stew?";
    }

    document.getElementById('weatherMenuDisplay').innerHTML = recommendation;
}

function getGPTRecommendation(weatherData) {
    fetch('/gpt-recommendation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ weather: weatherData }) // Ensure this is sending the data correctly
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('gptRecommendation').innerHTML = data.recommendation;
    })
    .catch(error => {
        document.getElementById('gptRecommendation').innerHTML = "Unable to retrieve GPT recommendation.";
        console.error('Error fetching GPT recommendation:', error);
    });
}
