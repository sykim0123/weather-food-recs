document.getElementById('getRecommendationButton').addEventListener('click', getWeatherRecommendation);

function getWeatherRecommendation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById('weatherInfo').innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // 로딩 오버레이 표시
    document.getElementById('loadingOverlay').classList.remove('hidden');

    fetch(`/weather-recommendation?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            displayWeatherAndRecommendation(data);
            // 로딩 오버레이 숨기기
            document.getElementById('loadingOverlay').classList.add('hidden');
        })
        .catch(error => {
            document.getElementById('weatherInfo').innerHTML = "Unable to retrieve recommendation.";
            console.error('Error fetching recommendation:', error);
            // 로딩 오버레이 숨기기
            document.getElementById('loadingOverlay').classList.add('hidden');
        });
}

function showError(error) {
    document.getElementById('loadingOverlay').classList.add('hidden'); // 오류 시 로딩 오버레이 숨기기

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

function displayWeatherAndRecommendation(data) {
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.innerHTML = `Current weather: ${data.weather}, Temperature: ${data.temperature}°C`;

    const weatherIcon = document.getElementById('weatherIcon');
    weatherIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${data.icon}.png" alt="Weather icon">`;

    const recommendation = document.getElementById('recommendation');
    recommendation.innerHTML = `Recommendation: ${data.recommendation}`;
}
