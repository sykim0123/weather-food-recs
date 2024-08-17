const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const GPT_API_KEY = process.env.GPT_API_KEY;

app.use(express.static('public'));
app.use(express.json()); // This allows your server to parse JSON in incoming requests

app.get('/weather', async (req, res) => {
    const lat = req.query.lat;
    const lon = req.query.lon;

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Unable to retrieve weather data' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.post('/gpt-recommendation', async (req, res) => {
    console.log('Received body:', req.body); // Log the entire body to check if it's coming in correctly

    const weatherData = req.body.weather;

    if (!weatherData) {
        return res.status(400).json({ error: 'No weather data provided' });
    }

    const prompt = `
        Given the current weather condition: ${weatherData.weather[0].description} with a temperature of ${weatherData.main.temp}°C,
        what would be a good food recommendation? Please provide a detailed suggestion.
    `;

    console.log('Prompt sent to GPT:', prompt);

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GPT_API_KEY}`
            },
            body: JSON.stringify({
                model: 'text-davinci-003', // NOTE: use the correct model for your billing plan
                prompt: prompt,
                max_tokens: 100
            })
        });

        console.log('GPT API Response Status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('GPT API Response Data:', data);

        res.json({ recommendation: data.choices[0].text.trim() });
    } catch (error) {
        console.error('Error fetching GPT recommendation:', error);
        res.status(500).json({ error: 'Unable to retrieve GPT recommendation' });
    }
});
