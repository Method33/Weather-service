require('dotenv').config(); // Load environment configuration from .env file

const express = require('express');
const app = express();
const path = require('path');
// ESM-style import for the fetch API
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

app.use(express.static(path.join(__dirname, '..', 'frontend'))); // Serve static files from 'backend'

// Serve UI.html as the user interface on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..',  'frontend', 'UI.html'));
});

// Handle weather queries, fetching data from a weather API
app.get('/weather', async (req, res) => {
    const city = req.query.city;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl),
        ]);
        const currentWeatherData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();

        if (forecastData && forecastData.list) {
            const forecastTemperatures = forecastData.list.map(point => ({
                date: point.dt_txt,
                temperature: point.main.temp,
            }));

            res.json({
                current: currentWeatherData,
                forecast: forecastTemperatures,
            });
        } else {
            throw new Error('Forecast data is unavailable');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).send('Server error');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
