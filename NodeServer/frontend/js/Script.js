document.getElementById('weatherForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent page refresh on form submit

    const city = document.getElementById('city').value;

    fetch(`/weather?city=${encodeURIComponent(city)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`An error occurred: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.current && data.current.cod === 200) {
                const resultDiv = document.getElementById('weatherResult');
                resultDiv.innerHTML = `
                    <h2>Weather for ${data.current.name}</h2>
                    <p>Temperature: ${data.current.main.temp}°C</p>
                    <p>Conditions: ${data.current.weather[0].description}</p>
                    <p>Wind: ${data.current.wind.speed} m/s</p>
                    <p>Pressure: ${data.current.main.pressure} hPa</p>
                `;

                const temperatureData = {
                    labels: data.forecast.map(entry => entry.date),
                    datasets: [{
                        label: 'Temperature',
                        data: data.forecast.map(entry => entry.temperature),
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                };

                const ctx = document.getElementById('temperatureChart').getContext('2d');
                if (window.myChart) window.myChart.destroy(); // Clear the previous chart if exists
                window.myChart = new Chart(ctx, {
                    type: 'line',
                    data: temperatureData,
                });
            } else {
                document.getElementById('weatherResult').textContent = 'Data for the specified city could not be found.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('weatherResult').textContent = 'An error occurred while searching for the weather.';
        });
});
