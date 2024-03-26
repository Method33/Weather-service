// Wczytanie konfiguracji œrodowiskowej z pliku .env
require('dotenv').config();

// Import modu³ów potrzebnych do dzia³ania aplikacji
const express = require('express'); // Framework Express.js
const app = express(); // Tworzenie instancji aplikacji Express
const path = require('path'); // Modu³ do manipulacji œcie¿kami plików
// Import modu³u fetch z obs³ug¹ ESM
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Ustawienie folderu publicznego dla statycznych plików (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route dla strony g³ównej, zwraca plik UI.html jako interfejs u¿ytkownika
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'UI.html'));
});

// Route dla zapytania o pogodê, obs³uguje asynchroniczne zapytania do API pogodowego
app.get('/weather', async (req, res) => {
    // Pobranie nazwy miasta z parametrów zapytania
    const city = req.query.city;
    // Pobranie klucza API z zmiennych œrodowiskowych
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    // Skonstruowanie URL dla aktualnej pogody i prognozy
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        // Wykonanie równoleg³ych zapytañ do API pogodowego
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl),
        ]);

        // Przetworzenie odpowiedzi na format JSON
        const currentWeatherData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();

        // Sprawdzenie, czy dane prognozy s¹ dostêpne
        if (forecastData && forecastData.list) {
            // Przetworzenie danych prognozy do u¿ytecznego formatu
            const forecastTemperatures = forecastData.list.map(point => ({
                date: point.dt_txt,
                temperature: point.main.temp,
            }));

            // Zwrócenie danych pogodowych i prognozy jako odpowiedŸ JSON
            res.json({
                current: currentWeatherData,
                forecast: forecastTemperatures,
            });
        } else {
            // Rzucenie b³êdu, jeœli dane prognozy s¹ niedostêpne
            throw new Error('Forecast data is unavailable');
        }
    } catch (error) {
        // Obs³uga b³êdów podczas zapytañ do API
        console.error('Error fetching weather data:', error);
        // Zwrócenie b³êdu serwera
        res.status(500).send('Server error');
    }
});

// Okreœlenie portu na którym serwer bêdzie nas³uchiwa³
const port = process.env.PORT || 3000;
// Uruchomienie serwera i logowanie informacji o jego dzia³aniu
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
