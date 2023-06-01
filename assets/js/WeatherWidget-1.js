import React, { useEffect, useState } from 'react';
import './WeatherWidget.css';
import 'weather-icons/css/weather-icons.css';

const WeatherWidget = () => {
    const [currentWeather, setCurrentWeather] = useState(null);
    const [dailyForecast, setDailyForecast] = useState(null);
    const [location, setLocation] = useState(null);
    const [isMinimized, setIsMinimized] = useState(true); // Widget minimized/maximized

    useEffect(() => {
        const fetchCurrentWeather = async (lat, lon) => {
            try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`
            )
            const data = await response.json();
            setCurrentWeather(data);
            setLocation(data.name);
            } catch (error) {
            console.error('Error fetching current weather data:', error);
            }
        };

        const fetchDailyForecast = async (lat, lon) => {
            try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`
            );
            const data = await response.json();
            setDailyForecast(data.daily);
            } catch (error) {
            console.error('Error fetching daily forecast data:', error);
            }
        };

        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
    
            await fetchCurrentWeather(lat, lon);
            await fetchDailyForecast(lat, lon);
        });
    }, []);

    if (!currentWeather || !dailyForecast) {
        return <div className="loading-container">Weather Loading...</div>;
    }    

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    const getWeatherIconClass = (iconCode, id) => {
        const prefix = 'wi wi-';
        const code = parseInt(id, 10);
        let icon = '';
      
        if (iconCode.slice(-1) === 'n') {
          icon = 'night-';
        } else {
          icon = 'day-';
        }
      
        switch (code) {
          case 200:
          case 201:
          case 202:
          case 210:
          case 211:
          case 212:
          case 221:
          case 230:
          case 231:
          case 232:
            icon += 'thunderstorm';
            break;
          case 300:
          case 301:
          case 302:
          case 310:
          case 311:
          case 312:
          case 313:
          case 314:
          case 321:
            icon += 'showers';
            break;
          case 500:
          case 501:
          case 502:
          case 503:
          case 504:
            icon += 'rain';
            break;
          case 511:
            icon += 'rain-mix';
            break;
          case 520:
          case 521:
          case 522:
          case 531:
            icon += 'showers';
            break;
          case 600:
          case 601:
          case 602:
          case 611:
          case 612:
          case 615:
          case 616:
          case 620:
          case 621:
          case 622:
            icon += 'snow';
            break;
          case 701:
          case 711:
          case 721:
          case 731:
          case 741:
          case 751:
          case 761:
          case 762:
          case 771:
          case 781:
            icon += 'fog';
            break;
          case 800:
            icon += 'sunny';
            break;
          case 801:
            icon += 'cloudy';
            break;
          case 802:
          case 803:
          case 804:
            icon += 'cloudy';
            break;
          default:
            icon = '';
            break;
        }
      
        return prefix + icon;
      };      

    return (
        <div className="weather-widget-container">
            <div className="ow-widget">
                <div className="ow-row header">
                    <span className="ow-city-name">{location}</span>
                    {isMinimized && currentWeather && (
                        <div className="ow-temp-current minimized">
                            {Math.round(currentWeather.main.temp)}&deg;C
                        </div>
                    )}
                    <div className="current-date">
                        {new Date().toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </div>
                    <button onClick={toggleMinimize} className="min-max-btn">
                        {isMinimized ? '▼' : '▲'}
                    </button>
                </div>
                {!isMinimized && (
                <>
                    <div className="ow-row">
                        <div className="wi ow-ico ow-ico-current pull-left">
                            <i className={getWeatherIconClass(currentWeather.weather[0].icon, currentWeather.weather[0].id)} />
                        </div>
                        {currentWeather && (
                            <div className="ow-temp-current pull-left">
                            {Math.round(currentWeather.main.temp)}&deg;C
                            </div>
                        )}
                        <div className="ow-current-desc pull-left">
                            <div>Pressure: <span className="ow-pressure">{currentWeather.main.pressure} hPa</span></div>
                            <div>Humidity: <span className="ow-humidity">{currentWeather.main.humidity}%</span></div>
                            <div>Wind: <span className="ow-wind">{currentWeather.wind.speed} m/s</span></div>
                        </div>
                    </div>

                    <div className="ow-row ow-forecast">
                        {dailyForecast.slice(1, 5).map((day) => (
                            <div key={day.dt} className="ow-forecast-item">
                                <div className="ow-day">{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                <div className="wi ow-ico ow-ico-forecast">
                                    <i className={getWeatherIconClass(day.weather[0].icon, day.weather[0].id)} />
                                    {console.log(getWeatherIconClass(day.weather[0].icon, day.weather[0].id))}
                                </div>
                                <div className="ow-forecast-temp">
                                    <span className="max">{Math.round(day.temp.max)}°C</span>
                                    <span className="max">{Math.round(day.temp.min)}°C</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
                )}
            </div>
        </div>
    );
};

export default WeatherWidget;

