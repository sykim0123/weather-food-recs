const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const port = 3000;

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const GPT_API_KEY = process.env.GPT_API_KEY;

if (!OPENWEATHER_API_KEY || !GPT_API_KEY) {
    console.error("Missing API keys! Please check your .env file.");
    process.exit(1);
}

app.use(express.static('public'));

app.get('/weather-recommendation', async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    try {
        // 날씨 API 호출
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                lat: lat,
                lon: lon,
                units: 'metric',
                appid: OPENWEATHER_API_KEY
            }
        });

        const weatherData = weatherResponse.data;

        if (!weatherData || !weatherData.weather || weatherData.weather.length === 0) {
            throw new Error('Invalid weather data');
        }

        // 날씨와 기온 정보 추출
        const weatherDescription = weatherData.weather[0].description;
        const temperature = weatherData.main.temp;

        // GPT-3.5 API 호출
        const gptResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that provides recommendations based on the weather and temperature."
                },
                {
                    role: "user",
                    content: `The current weather is ${weatherDescription} with a temperature of ${temperature}°C. What would you recommend doing or eating in this weather?
                    language: korean`
                }
            ],
            max_tokens: 100
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GPT_API_KEY}`
            }
        });

        const gptData = gptResponse.data;

        if (!gptData || !gptData.choices || gptData.choices.length === 0) {
            throw new Error('Invalid GPT response');
        }

        const recommendation = gptData.choices[0].message?.content?.trim() || gptData.choices[0].text?.trim();

        // 결과 반환
        res.json({ 
            weather: weatherDescription, 
            temperature: temperature, 
            recommendation 
        });
    } catch (error) {
        console.error('Error fetching recommendation:', error);
        res.status(500).json({ error: 'Unable to retrieve recommendation' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
