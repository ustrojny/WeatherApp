import { sortBy, uniqBy } from 'lodash';
import * as moment from 'moment';
import 'moment/locale/pl';
import { WeatherData } from './weather-data';

// get current date
moment().locale('pl');
let currentDate = moment().format('LL');

// Set current date div
const dateDiv = document.getElementById('date');
dateDiv.innerHTML = `${currentDate}`;
dateDiv.classList.add('uk-animation-fade');

// get polish cities from json file, sort, remove duplicates
const allCities: { country: string; name: string; id: number }[] = require('./city.list.json');
const polishCities = allCities.filter(x => x.country === 'PL' && !(x.name.match(/powiat/gi)) && !(x.name.match(/Republic/gi)));
const sortedCities = sortBy(polishCities, 'name');
const cities = uniqBy(sortedCities,(x => x.name));

// get weather data by city name
async function getWeather(location: string): Promise<WeatherData> {
try {
    const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=39544be17cca6159f6a15f96ee121005`);
    const responseJson = await response.json();

    return {
        temperature: responseJson.main.temp,
        humidity: responseJson.main.humidity,
        pressure: responseJson.main.pressure,
        iconCode: responseJson.weather[0].icon
    }
} catch (err) {
    console.log(err);
    alert('Nie udało się pobrać pogody dla tego miasta!');}    
}

// get weather data by coordinates
async function getWeatherByLocation(lat: number, lon: number): Promise<WeatherData> {
    try {
        const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=39544be17cca6159f6a15f96ee121005`);
        const responseJson = await response.json();

        return {
            temperature: responseJson.main.temp,
            humidity: responseJson.main.humidity,
            pressure: responseJson.main.pressure,
            iconCode: responseJson.weather[0].icon
        }
    } catch (err) {
        alert('Nie udało się pobrać pogody dla tej lokalizacji!')
    }
}

// generating Icon Image based on the given icon code
function generateIconImage(iconCode: string) {
    const image = document.createElement('img');
    image.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    image.alt = "icon image";
    return image;
}

// rendering weather information
async function render(weatherData: WeatherData) {
    let iconContainer = document.getElementById('icon');
    const weatherImage = generateIconImage(weatherData.iconCode);
    iconContainer.innerHTML = '';
    iconContainer.appendChild(weatherImage);

    let temperature = document.getElementById('temperature');
    temperature.innerHTML = `<h4>Temperatura:</h4> ${weatherData.temperature} °C`;

    let humidity = document.getElementById('humidity');
    humidity.innerHTML = `<h4>Wilgotność:</h4> ${weatherData.humidity} %`;

    let pressure = document.getElementById('pressure');
    pressure.innerHTML = `<h4>Ciśnienie:</h4>${weatherData.pressure} hPa`;

    const weatherInfo = document.querySelector('.weather-data');
    weatherInfo.classList.add('uk-animation-fade');
};

function getLocation(): Promise<{lat: number; lon: number}> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            resolve({ lat, lon });
        }, (error) => {
            reject(error);
        });
    });
}

async function handleLocationClick() {
    const spinner = document.getElementById('loading');
    spinner.innerHTML = 'Pobieranie danych... <i class="fas fa-spinner fa-pulse"></i>';
    const location = await getLocation();
    const weatherData = await getWeatherByLocation(location.lat, location.lon);
    searchInput.value = '';
    spinner.innerHTML = '';
    render(weatherData);
}

const locationBtn = document.getElementById('locationBtn');
locationBtn.addEventListener('click', handleLocationClick);

const searchInput = document.getElementById('city-search') as HTMLInputElement;
const datalist = document.getElementById('cities');

const html = cities.map(town => {
    return `<option value="${town.name}">`;
}).join('\n');
datalist.innerHTML = html;

searchInput.addEventListener('change', async event => {
    const choosenCity = (<HTMLInputElement>event.target).value;
    const weatherData = await getWeather(choosenCity);
    render(weatherData);
});

