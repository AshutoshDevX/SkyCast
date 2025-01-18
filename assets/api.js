const input = document.querySelector('.input');
const search = document.querySelector('.input-city');
const cityName = document.querySelector('.city-name');
const currentTime = document.querySelector('.current-time');
const weatherCondition = document.querySelector('.main');
const temp =  document.querySelector('.temp');
const w_icon = document.querySelector('.w-icon')
const minTemp = document.querySelector('.min');
const maxTemp = document.querySelector('.max');
const windSpeed = document.querySelector('.wind');
const pressure = document.querySelector('.pressure');
const humidity = document.querySelector('.humidity');
const feels_like = document.querySelector('.feels-like');
const fiveDayForecast = document.querySelector('.fiveDayForecast');
const dropDown = document.querySelector('.drop-down');
const currentLocation = document.querySelector('.currentLocation');
const airQuality= document.querySelector('.air-quality');
const visible = document.querySelector('.visibility');



//Calling country code api
const getCountryName = (code) => {
    return new Intl.DisplayNames([code],{type:"region"}).of(code)
}

//Api to convert dt into formatted date
const getDateTime = (dt) => {
    const currDate = new Date(dt * 1000);
    const options = {
        weekday : "long",
        month   : "long",
        day     : "numeric",
    };

    const formatter = new Intl.DateTimeFormat("en-UK", options);
   
    return formatter.format(currDate)
}

const searchKey = "searchHistory";

let searchHistory = JSON.parse(localStorage.getItem(searchKey))||[];

let city = "mumbai";

//adding click event on search input.
input.addEventListener('click',()=>{
    searched_city(searchHistory);
})


//displaying the dropDown element and adding click event on search history
function searched_city(items){
    dropDown.innerHTML='';
    if(items.length){
        dropDown.style.display = 'block';
        items.forEach((item)=>{
            const div = document.createElement('div');
            div.textContent = item;
            div.addEventListener('click',(e)=>{
                const targetValue = e.target.innerHTML;
                city = targetValue;
                fiveDayForecast.innerHTML = "";
                fetchData();
                dropDown.style.display = "none";
            });
            dropDown.appendChild(div);
        })
    }
    else{
        dropDown.style.display = 'none';
    }
}

//event to deactivate dropDown element.
document.addEventListener('click',(event)=>{
    if(!event.target.closest(".input-city")){
        dropDown.style.display = 'none';
    }
})

//event to get the current location.
currentLocation.addEventListener('click',getLocation);

//Function to get the current location
function getLocation(){
    console.log(navigator.geolocation)
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition,handleError,{
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
    }
    else{
        console.log("Error occured")
    }
}

//Handling error if unable to fetch current location.
function handleError(error) {
    console.log(`Error occurred. Code: ${error.code}, Message: ${error.message}`);
}

//function to extract latitude and logitude from the api.
async function showPosition(position){
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    try{
        const currentLocation = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=951bc287fe88eae034d0603907e2510e`);
        const currentLocationData = await currentLocation.json();
        console.log(currentLocationData)
        const {name} = currentLocationData;
        city = name;
        fiveDayForecast.innerHTML = "";
        fetchData();
    }catch(err){
        console.error("Error fetching current location weather:", err);
    }
}

//submit event to call weather api to display weather information.
search.addEventListener('submit',(e)=>{
    e.preventDefault();
    city = input.value;
    searchHistory.unshift(city);
    if(searchHistory.length>7){searchHistory.pop()}
    console.log(searchHistory)
    localStorage.setItem(searchKey,JSON.stringify(searchHistory));
    fiveDayForecast.innerHTML = "";
    console.log(localStorage);
    input.value = "";
    dropDown.style.display = "none"
    fetchData();
})


//Fetching the API to get location object.
async function fetchData(){
    try{
        const currentWeather = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=951bc287fe88eae034d0603907e2510e`);
        const currentData = await currentWeather.json();
    
        const {main,weather,wind,sys,name,dt,id,coord,visibility} = currentData;
        console.log(currentData)

        const day = getDateTime(dt);
        cityName.innerHTML = `${name}, ${getCountryName(sys.country)}`;
        currentTime.innerHTML = day;
        weatherCondition.innerHTML = weather[0].main.toLowerCase();
        w_icon.innerHTML = `<img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png"/>`
        temp.innerHTML = `${(main.temp-273.15).toFixed(1)}&#176`;
        minTemp.innerHTML = `Min: ${(main.temp-273.15).toFixed()}&#176`;
        maxTemp.innerHTML = `Max: ${(main.temp-273.15).toFixed()}&#176`;
        windSpeed.innerHTML = `${wind.speed}m/s`;
        pressure.innerHTML = `${main.pressure}hPa`;
        humidity.innerHTML = `${main.humidity}%`;
        feels_like.innerHTML = `${(main.temp-273.15).toFixed()}&#176`;
        visible.innerHTML = `${visibility/1000}km`;



        //Five Day Forecast
        const fiveDayWeather = await fetch(`https://api.openweathermap.org/data/2.5/forecast?id=${id}&appid=951bc287fe88eae034d0603907e2510e`);
        const fiveDayData = await fiveDayWeather.json();

        const{list} = fiveDayData;
        
        let index = 0;
        for(let i=0; i<5;i++){
            const weather_card = document.createElement('div')
            weather_card.innerHTML = `
            <p>${getDateTime(list[index].dt)}</p>
            <div><img src="https://openweathermap.org/img/wn/${list[index].weather[0].icon}@2x.png"/></div>
            <p class="smallcard-temp">${(list[index].main.temp-273.15).toFixed(1)}&#176</p>
            <div class="smallcard">
                <i class="fa-solid fa-wind"></i>
                <p>${(list[index].wind.speed).toFixed(1)}m/s</p>
            </div>
            <div class="smallcard">
                <i class="fa-solid fa-droplet"></i>
                <p>${list[index].main.humidity}%</p>
            </div>
            `
            fiveDayForecast.appendChild(weather_card);
            index += 8;

        }

        //Api to the current location air pollution;
        const airQaulityIndex = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=951bc287fe88eae034d0603907e2510e`)
        const airQaulityData = await airQaulityIndex.json()
        const aqi = airQaulityData.list[0].main.aqi;

        let airPollutionIndex = "";
        switch(aqi){
            case 1:
                airPollutionIndex="Good";
                airQuality.style.backgroundColor = "rgb(77, 187, 62)";
                break;
            case 2:
                airPollutionIndex="Fair";
                airQuality.style.backgroundColor = "rgb(126, 173, 38)";
                break;
            case 3:
                airPollutionIndex="Moderate";
                airQuality.style.backgroundColor = "rgb(158, 173, 21)";
                break;
            case 4:
                airPollutionIndex="Poor";
                airQuality.style.backgroundColor = "rgb(228, 105, 34)";
                break;
            case 5:
                airPollutionIndex="Very Poor";
                airQuality.style.backgroundColor = "rgb(223, 44, 44)";
                break;
            default:
                console.log("Unable to fetch Air Qality Index")
        }

        airQuality.innerHTML = airPollutionIndex;

    }catch(error){
        console.log(error);
    }
}

//Calling fetchData on loading of page.
document.body.addEventListener('load',fetchData());


