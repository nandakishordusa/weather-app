import axios from 'axios'

export function getWeather(lat, lon, timezone) {
    return axios.get(
        "https://api.open-meteo.com/v1/forecast?current=temperature_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min&timeformat=unixtime" ,{
            params : {
                latitude : lat,
                longitude : lon,
                timezone,
            },
        }
    ).then(({data}) => {
        return {
            current : parseCurrentWeather(data),
            daily : parseDailyWeather(data),
            hourly : parseHourlyWeather(data),
        }
    })
}

function parseCurrentWeather({current,daily}){
    const {
        temperature_2m : currentTemp, 
        wind_speed_10m : windSpeed,
        precipitation : precip,
        weather_code : iconCode,} = current
    const {
        temperature_2m_max : [highTemp],
        temperature_2m_min : [lowTemp],
        apparent_temperature_max : [highFeelsLike],
        apparent_temperature_min : [lowFeelsLike], } = daily
    
    return {
        currentTemp : currentTemp,
        highTemp : Math.round(highTemp), 
        lowTemp : Math.round(lowTemp),
        highFeelsLike : Math.round(highFeelsLike),
        lowFeelsLike : Math.round(lowFeelsLike),
        windSpeed : Math.round(windSpeed),
        precip : Math.round(precip), 
        iconCode,
    }
}

function parseDailyWeather({daily}){
    return daily.time.map((time,index) => {
        return{
            timeStamp : time * 1000,
            iconCode : daily.weather_code[index],
            maxTemp : Math.round(daily.temperature_2m_max[index])
        }
    })
}

function parseHourlyWeather({hourly, current}){
    return hourly.time.map((time,index) => {
        return {
            timeStamp : time * 1000,
            iconCode : hourly.weather_code[index],
            maxTemp : Math.round(hourly.temperature_2m[index]),
            feelsLike : Math.round(hourly.apparent_temperature[index]),
            windSpeed : Math.round(hourly.wind_speed_10m[index]),
            precip : Math.round(hourly.precipitation[index]),
        }
    }).filter(({timeStamp}) => timeStamp >= current.time * 1000)
}