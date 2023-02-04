'use strict';
alert("使用到的绘制地图的API leafet需要科学上网，所以裸连的话地图不会显示")
class Workout{
    date = new Date();
    id = (Date.now()+ '').slice(-10);
    clicks = 0;
    constructor(coords, distance, duration){
        
        this.coords = coords;
        this.distance = distance;// km
        this.duration = duration;
    }
    _setDescription(){
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        this.desciption = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;

    }

    click(){
        this.clicks++;
    }
}
class Running extends Workout{
    type = 'running'
    constructor(coords, distance, duration,cadence){
        super(coords, distance, duration)
        this.cadence =cadence;
        this.calcPace();
        this._setDescription();
    }
    calcPace(){
        this.pace =this.duration / this.distance;
        return this.pace;
    }

}
class Cycling extends Workout{
    type = 'cycling'
    constructor(coords, distance, duration,elevation){
        super(coords, distance, duration)
        this.elevation =elevation;
        this.calcSpeed();
        this._setDescription();
    }    
    calcSpeed(){
        this.speed = this.distance / (this.duration/60);
        return this.speed;
    }
}

const run1 = new Running([39,-12],5,1,1)
console.log(run1);
//----------------------------------
//Application arc 
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App{
    #map;
    #mapZoomLevel = 12;
    #mapEvent;
    #workouts = [];
    constructor(){
        //GET User‘s position
        this._getposition();
        
        //Get Data FROM Local storage
        this._getLocalStorage();

        form.addEventListener('submit',this._newWorkout.bind(this));
        
        //Attack event handlers
        inputType.addEventListener('change',this._toggleElevationField);
        containerWorkouts.addEventListener('click',this._moveToPopup.bind(this));

    }

    _getposition(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),function(){
                alert("无法得到你的位置")
            });
        }
    }

    _loadMap(position){
            console.log(position);
            const {latitude} = position.coords;
            const  {longitude} = position.coords;
        
            const  f_map = `https://map.baidu.com/@${longitude},${latitude},12z`;
            console.log(f_map);
            //Leaflet
            const coord = [latitude, longitude]; //经纬度
            //const 
            this.#map = L.map('map').setView(coord, this.#mapZoomLevel);
            
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);//瓦片地图
        
            // L.marker(coord).addTo(map)
            //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
            //     .openPopup();//标记
            
            //点击就标记
            this.#map.on('click',this._showForm.bind(this)); 

            this.#workouts.forEach(work => {
               // this._renderWorkout(work);
                this._renderWorkoutMarker(work);
            });
    }

    _showForm(mapevent){
        this.#mapEvent = mapevent;
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

    }

    _hideForm(){
        //empty inputs
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ""; 

        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(()=>{form.style.display ='grid'},1000);
    }

    _toggleElevationField(){
        console.log("inputtype changed");
        //改变输入项形势
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }
    _newWorkout(e){
        e.preventDefault();//防止表单提交后自动刷新的默认行为·
        const validInputs = (...inputs) =>
            inputs.every(inp => Number.isFinite(inp));

        const allPositive = (...inputs) =>
            inputs.every(inp => inp > 0);
        
        //从表单得到数据
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng; 
        let workout;
        //if activity running， craete running obj
        if(type === 'running'){ 
            const cadence = +inputCadence.value;
            //检查是否合法
            if (
                // !Number.isFinite(distance) || 
                // !Number.isFinite(duration) || 
                // !Number.isFinite(cadence)
                !validInputs(distance, duration, cadence)|| !allPositive(distance, duration, cadence)
            )
                return alert('输入应为数字');
            
            workout = new Running([lat, lng], distance, duration, cadence);
            
        }
        //if activity cycling， craete cycling obj
        if(type === 'cycling'){
            const elevation = +inputElevation.value;
            //检查是否合法
            if (
                // !Number.isFinite(distance) || 
                // !Number.isFinite(duration) || 
                // !Number.isFinite(cadence)
                !validInputs(distance, duration, elevation)|| !allPositive(distance, duration)
            )
                return alert('输入应为数字');
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }
        //Add new obj to workout array
        this.#workouts.push(workout);

        //render workout on map as marker
        this._renderWorkoutMarker(workout);    
       
        // Render workout on list
       this._renderWorkout(workout);

        //Hide form + clear input fileds
        this._hideForm();

        //Set Locals storage to all workouts
        this._setLocalStorage();
              

    }

    _renderWorkoutMarker(workout){
         L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`
            }))
            .setPopupContent(`${workout.desciption}`)
            .openPopup();
    }

    _renderWorkout(workout){
       let html = `<li class="workout workout--${workout.type}" data-id=${workout.id}>
        <h2 class="workout__title">${workout.desciption}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type ==="running" ?
            '🏃‍♂️':'🚴‍♀️'
        }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
        `;

      if(workout.type === 'running')
      {
        html+=`
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
        </div>
        </li>
        `;
      }

      if(workout.type === 'cycling')
      {
        html+=`
        <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevation}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>
        `;
      }

      form.insertAdjacentHTML('afterend',html);

    }

    _moveToPopup(e){
        const workoutElm = e.target.closest('.workout');
        
        if(!workoutElm) return;

        const workout = this.#workouts.find(work => work.id === workoutElm.dataset.id);
        console.log(workout);

        this.#map.setView(workout.coords,this.#mapZoomLevel,{
            animate: true,
            pan: {
                duration: 1,
            }
        }); 

        //using thie public interface
        //workout.click();
    }

    _setLocalStorage(){
        localStorage.setItem('workouts', JSON.stringify(this.#workouts))
    }
   
    _getLocalStorage(){
        const data  = JSON.parse(localStorage.getItem('workouts'));
        
        if(!data) return ;

        this.#workouts = data;

        this.#workouts.forEach(work => {
            this._renderWorkout(work);
           // this._renderWorkoutMarker(work);
        });
    }

    reset(){
        localStorage.removeItem('workouts');
        location.reload();
    }
}
const app = new App();


//使用geolocationAPI获得经纬度



