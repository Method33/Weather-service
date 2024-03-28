// Dodanie obsługi zdarzenia 'submit' do formularza o id 'weatherForm'
document.getElementById('weatherForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Zapobieganie domyślnej akcji przeglądarki (odświeżanie strony/formularza)

    // Pobranie wartości z pola tekstowego o id 'city'
    const city = document.getElementById('city').value;

    // Rozpoczęcie żądania fetch do serwera z użyciem dynamicznie utworzonego URL zawierającego miasto
    fetch(`/weather?city=${encodeURIComponent(city)}`)
        .then(response => {
            // Sprawdzenie, czy odpowiedź z serwera jest poprawna (status 200-299)
            if (!response.ok) {
                // Jeśli odpowiedź jest niepoprawna, wyrzucony zostaje błąd przechwycony później w bloku catch
                throw new Error(`An error occurred: ${response.statusText}`);
            }
            return response.json(); // Konwersja odpowiedzi na format JSON
        })
        .then(data => {
            // Sprawdzenie, czy otrzymane dane zawierają informacje pogodowe
            if (data.current && data.current.cod === 200) {
                // Znalezienie elementu na stronie, w którym wyświetlone zostaną wyniki
                const resultDiv = document.getElementById('weatherResult');
                // Ustawienie zawartości HTML elementu wynikowego z danymi pogodowymi
                resultDiv.innerHTML = `
                    <h2>Pogoda dla ${data.current.name}</h2>
                    <p>Temperatura: ${data.current.main.temp}°C</p>
                    <p>Warunki: ${data.current.weather[0].description}</p>
                    <p>Wiatr: ${data.current.wind.speed} m/s</p>
                    <p>Ciśnienie: ${data.current.main.pressure} hPa</p>
                `;

                // Przygotowanie danych do wykresu temperatury
                const temperatureData = {
                    labels: data.forecast.map(entry => entry.date),
                    datasets: [{
                        label: 'Temperatura',
                        data: data.forecast.map(entry => entry.temperature),
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                };

                // Pobranie kontekstu canvas, gdzie wyświetlony zostanie wykres
                const ctx = document.getElementById('temperatureChart').getContext('2d');
                // Zniszczenie istniejącego wykresu, jeśli istnieje, aby uniknąć nakładania się danych
                if (window.myChart) {
                    window.myChart.destroy();
                }
                // Utworzenie nowego wykresu z pobranymi danymi
                window.myChart = new Chart(ctx, {
                    type: 'line',
                    data: temperatureData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: true
                    }
                });
            } else {
                // Wyświetlenie komunikatu o błędzie, jeśli nie udało się znaleźć danych dla miasta
                document.getElementById('weatherResult').textContent = 'Nie udało się znaleźć danych dla podanego miasta.';
            }
        })
        .catch(error => {
            // Obsługa błędów - wyświetlenie komunikatu o błędzie
            console.error('Error:', error);
            document.getElementById('weatherResult').textContent = 'Wystąpił błąd podczas wyszukiwania pogody.';
        });
});
