// Wczytanie konfiguracji �rodowiskowej z pliku .env
require('dotenv').config();

// Import modu��w potrzebnych do dzia�ania aplikacji
const express = require('express'); // Framework Express.js
const app = express(); // Tworzenie instancji aplikacji Express
const path = require('path'); // Modu� do manipulacji �cie�kami plik�w
// Import modu�u fetch z obs�ug� ESM
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Ustawienie folderu publicznego dla statycznych plik�w (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route dla strony g��wnej, zwraca plik UI.html jako interfejs u�ytkownika
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'UI.html'));
});

// Route dla zapytania o pogod�, obs�uguje asynchroniczne zapytania do API pogodowego
app.get('/weather', async (req, res) => {
    // Pobranie nazwy miasta z parametr�w zapytania
    const city = req.query.city;
    // Pobranie klucza API z zmiennych �rodowiskowych
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    // Skonstruowanie URL dla aktualnej pogody i prognozy
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        // Wykonanie r�wnoleg�ych zapyta� do API pogodowego
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl),
        ]);

        // Przetworzenie odpowiedzi na format JSON
        const currentWeatherData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();

        // Sprawdzenie, czy dane prognozy s� dost�pne
        if (forecastData && forecastData.list) {
            // Przetworzenie danych prognozy do u�ytecznego formatu
            const forecastTemperatures = forecastData.list.map(point => ({
                date: point.dt_txt,
                temperature: point.main.temp,
            }));

            // Zwr�cenie danych pogodowych i prognozy jako odpowied� JSON
            res.json({
                current: currentWeatherData,
                forecast: forecastTemperatures,
            });
        } else {
            // Rzucenie b��du, je�li dane prognozy s� niedost�pne
            throw new Error('Forecast data is unavailable');
        }
    } catch (error) {
        // Obs�uga b��d�w podczas zapyta� do API
        console.error('Error fetching weather data:', error);
        // Zwr�cenie b��du serwera
        res.status(500).send('Server error');
    }
});

// Okre�lenie portu na kt�rym serwer b�dzie nas�uchiwa�
const port = process.env.PORT || 3000;
// Uruchomienie serwera i logowanie informacji o jego dzia�aniu
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
