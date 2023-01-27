'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


let mapEvent, 
    map;

class APP{

    constructor() {}

    _getPosition(){

        navigator.geolocation.getCurrentPosition(function(position){
        console.log(position);
        const {latitude} = position.coords;
        const  {longitude} = position.coords;

        const  f_map = `https://map.baidu.com/@${longitude},${latitude},12z`
        console.log(f_map);
        //Leaflet
        const coord = [latitude, longitude]; //经纬度
        //const 
        map = L.map('map').setView(coord, 13);
        
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);//瓦片地图

        // L.marker(coord).addTo(map)
        //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        //     .openPopup();//标记
        
            //点击就标记
        map.on('click',function(mapevent){

            mapEvent = mapevent;
            form.classList.remove('hidden');
            inputDistance.focus();//将距离作为首选输入的位置

            // const { lat, lng } = mapevent.latlng;
            
            // L.marker([lat, lng])
            // .addTo(map)
            // .bindPopup(
            //     L.popup({
            //         maxWidth: 250,
            //         minWidth: 100,
            //         autoClose: false,
            //         closeOnClick: false,
            //         className: '.running-popup'
            // }))
            // .setPopupContent("Wordkout")
            // .openPopup();

    });

},function(){
    alert("无法得到你的位置")
         });
    }
    _loadMap(){}
    _showForm() {}
    _toggleElevationField(){}
    _newWorkout(){}
}
//使用geolocationAPI获得经纬度



form.addEventListener('submit',function( e){
    e.preventDefault();//防止表单提交后自动刷新的默认行为·

    //输入后清空
    inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = "";

    const { lat, lng } = mapEvent.latlng;
        
    L.marker([lat, lng])
        .addTo(map)
        .bindPopup(
            L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: '.running-popup'
        }))
        .setPopupContent("Wordkout")
        .openPopup();

})

inputType.addEventListener('change',function(){

    console.log("inputtype changed");
    //改变输入项形势
    inputElevation.closest('.form__row').classList.toggle('.form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('.form__row--hidden');


})