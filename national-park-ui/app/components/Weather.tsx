import { useEffect, useState } from "react";
import axios from "axios";
import { SunIcon, CloudIcon, CloudRainIcon } from 'lucide-react';

interface WeatherData {
    dt_txt: string;
    main: {
        temp: number;
    };
    weather: {
        main: string;
        description: string;
    }[];
    wind: {
        speed: number;
    };
}

interface Props {
    location: string;
}

export default function Weather({ location }: Props) {
    const [weeklyForecast, setWeeklyForecast] = useState<WeatherData[]>([]);

    useEffect(() => {
        const fetchWeather = async () => {
            let lat = 0;
            let lon = 0;

            if (location.includes("Yosemite")) {
                lat = 37.8651;
                lon = -119.5383;
            } else {
                lat = 44.5979;
                lon = -110.5612;
            }

            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_WEATHER_API_KEY}`;
            try {
                const response = await axios.get(url);
                const data = response.data.list;

                // Filter to get daily forecasts at noon
                const dailyForecast = data.filter((entry: any) => entry.dt_txt.includes("12:00:00"));
                setWeeklyForecast(dailyForecast);
            } catch (error) {
                console.log("Error fetching weather data", error);
            }
        };

        fetchWeather();
    }, [location]);

    const kelvinToFahrenheit = (temp: number) => ((temp - 273.15) * 9/5 + 32).toFixed(1);

    const getWeatherIcon = (main: string) => {
        switch (main) {
            case "Clear":
                return <SunIcon className="h-10 w-10 text-yellow-500" />;
            case "Clouds":
                return <CloudIcon className="h-10 w-10 text-gray-500" />;
            case "Rain":
                return <CloudRainIcon className="h-10 w-10 text-blue-500" />;
            default:
                return <CloudIcon className="h-10 w-10 text-gray-400" />;
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Weekly Weather Forecast</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {weeklyForecast.map((day, index) => {
                    const date = new Date(day.dt_txt + ' UTC');
                    const pstDate = date.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'long', month: 'long', day: 'numeric' });

                    return (
                        <div key={index} className="bg-gradient-to-r from-blue-50 to-gray-50 shadow-md rounded-2xl p-4 flex flex-col items-center">
                            <h2 className="text-xl font-semibold mb-2">{pstDate}</h2>
                            {getWeatherIcon(day.weather[0].main)}
                            <p className="text-lg font-medium mt-2">{day.weather[0].main}</p>
                            <p className="text-sm text-gray-600">{day.weather[0].description}</p>
                            <p className="text-lg mt-2">Temp: {kelvinToFahrenheit(day.main.temp)}°F</p>
                            <p className="text-sm text-gray-600">Wind Speed: {day.wind.speed} m/s</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}