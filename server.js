const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const GPT_API_KEY = process.env.GPT_API_KEY;

app.use(express.static('public'));

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

app.get('/gpt-recommendation', async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GPT_API_KEY}`
            },
            body: JSON.stringify({
                prompt: "Give me a food recommendation.",
                max_tokens: 50
            })
        });
        const data = await response.json();
        res.json({ recommendation: data.choices[0].text.trim() });
    } catch (error) {
        console.error('Error fetching GPT recommendation:', error);
        res.status(500).json({ error: 'Unable to retrieve GPT recommendation' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
