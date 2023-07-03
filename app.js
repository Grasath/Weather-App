const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const { setInterval } = require('timers');
const moment = require('moment-timezone');
const dotenv = require('dotenv')
dotenv.config()



const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

app.set('view engine','ejs');
app.set('views',`${__dirname}/views`);

const appKey = process.env.APPKEY;
let query = 'Tokyo';

app.get('/',(req,res)=>{
    
    url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=${appKey}`
    https.get(url,(response)=>{
        response.on('data',(data)=>{
            const weatherData = JSON.parse(data);
            const statusCode = weatherData.cod;
            
            if (statusCode != 200){
                query = 'Tokyo';
                if(statusCode == 404){
                    const errMsg = weatherData.message;
                    const btnTxt = 'Go Home ⇾';
                    res.render('failure',{error_code :statusCode, error_msg : errMsg, btn_txt : btnTxt});
                }
                else{
                    const errMsg = 'Server Error';
                    const btnTxt = 'Try Again';
                    res.render('failure',{error_code :statusCode, error_msg : errMsg, btn_txt : btnTxt});
                }
            }
            else{
                const cityName = weatherData.name;
                const temp = Math.round(weatherData.main.temp);
                const icon = weatherData.weather[0].icon;
                const weatherIcon = `https://openweathermap.org/img/wn/${icon}@2x.png`;
                const weatherMain = weatherData.weather[0].main;
                const weatherDescription = weatherData.weather[0].description;
                const minTmp = Math.round(weatherData.main.temp_min);
                const maxTmp = Math.round(weatherData.main.temp_max);
                const feelsLike = Math.round(weatherData.main.feels_like);
                const wind = Math.round(weatherData.wind.speed * 3.6);
                const humidity = weatherData.main.humidity;
                const cloudiness = weatherData.clouds.all;
                const visibility = weatherData.visibility / 1000;
                const airPressure = weatherData.main.pressure;
                const offsetInSeconds = weatherData.timezone;
                const timezones = moment.tz.names();
                const timezone = timezones.find((tz)=>{
                    const offset = moment.tz(tz).utcOffset()*60;
                    return offset === offsetInSeconds;
                });
                const currentDay = moment().tz(timezone).format('dddd');
                res.render('index',{
                    city_name : cityName,
                    weather_description : weatherDescription,
                    weather_icon : weatherIcon, 
                    tmp: temp, 
                    tmp_min : minTmp, 
                    tmp_max : maxTmp,
                    feels_like : feelsLike, 
                    wind_speed : wind, 
                    humidity_percent : humidity,
                    cloudy : cloudiness, 
                    visible : visibility, 
                    air_pressure : airPressure,
                    time_zone : timezone,
                    day : currentDay.slice(0,3)
                });
            }
            
        })
    });
        
    
    
})

app.post('/',(req,res)=>{
    const cityName = req.body.cityName;
    query = cityName
    res.redirect('/');
});



app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
})