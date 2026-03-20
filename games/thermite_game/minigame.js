initSettings('thermite', ['#speed', '#grid']);
document.querySelector('.speed_value').textContent = document.querySelector('#speed').value + 's';
const gridVal = document.querySelector('#grid').value;
document.querySelector('.grid_value').textContent = gridVal + 'x' + gridVal;

let timer_start, timer_game, timer_finish, timer_time, good_positions, wrong, right, speed, timerStart, positions;
let game_started = false;
let streak = 0;
let max_streak = 0;
let best_time = 99.999;

let mode = parseInt(document.querySelector('#grid').value, 10) || 7;
let mode_data = {};
mode_data[5] = [10, '92px'];
mode_data[6] = [14, '74px'];
mode_data[7] = [18, '61px'];
mode_data[8] = [20, '51px'];
mode_data[9] = [24, '44px'];
mode_data[10] = [28, '38px'];

// Get max streak from localStorage
const stored_max_streak = localStorage.getItem('max-streak_thermite');
if(stored_max_streak !== null){
    max_streak = parseInt(stored_max_streak, 10);
}
// Get best time from localStorage
const stored_best_time = localStorage.getItem('best-time_thermite');
if(stored_best_time !== null){
    best_time = parseFloat(stored_best_time);
}

const range = (start, end, length = end - start + 1) => {
    return Array.from({length}, (_, i) => start + i)
}

const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

// Options
document.querySelector('#speed').addEventListener('input', function(ev){
    document.querySelector('.speed_value').textContent = ev.target.value + 's';
    streak = 0;
    reset();
});
document.querySelector('#grid').addEventListener('input', function(ev){
    document.querySelector('.grid_value').textContent = ev.target.value + 'x' + ev.target.value;
    mode = parseInt(ev.target.value, 10);
    streak = 0;
    reset();
});

// Resets
document.querySelector('.btn_again').addEventListener('click', function(){
    streak = 0;
    reset();
});

function listener(ev){
    if(!game_started) return;

    if( good_positions.indexOf( parseInt(ev.target.dataset.position) ) === -1 ){
        wrong++;
        ev.target.classList.add('bad');
    }else{
        right++;
        ev.target.classList.add('good');
    }

    ev.target.removeEventListener('pointerdown', listener);

    check();
}

function addListeners(){
    document.querySelectorAll('.group').forEach(el => {
        el.addEventListener('pointerdown', listener);
    });
}

function check(){
    if(wrong === 3){
        resetTimer();
        game_started = false;
        streak = 0;

        let blocks = document.querySelectorAll('.group');
        good_positions.forEach( pos => {
            blocks[pos].classList.add('proper');
        });
        return;
    }
    if(right === mode_data[mode][0]){
        stopTimer();
        streak++;
        if(streak > max_streak){
            max_streak = streak;
            localStorage.setItem('max-streak_thermite', max_streak);
        }
        let time = document.querySelector('.streaks .time').textContent;
        if(parseFloat(time) < best_time){
            best_time = parseFloat(time);
            localStorage.setItem('best-time_thermite', best_time);
        }
        reset();
    }
}

function reset(){
    game_started = false;

    resetTimer();
    clearTimeout(timer_start);
    clearTimeout(timer_game);
    clearTimeout(timer_finish);

    document.querySelector('.splash').classList.remove('hidden');
    document.querySelector('.groups').classList.add('hidden');

    document.querySelectorAll('.group').forEach(el => { el.remove(); });

    start();
}

function start(){
    wrong = 0;
    right = 0;

    positions = range(0, Math.pow(mode, 2) - 1 );
    shuffle(positions);
    good_positions = positions.slice(0, mode_data[mode][0]);

    let div = document.createElement('div');
    div.classList.add('group');
    div.style.width = mode_data[mode][1];
    div.style.height = mode_data[mode][1];
    const groups = document.querySelector('.groups');
    for(let i=0; i < positions.length; i++){
        let group = div.cloneNode();
        group.dataset.position = i.toString();
        groups.appendChild(group);
    }

    addListeners();

    document.querySelector('.streak').textContent = streak;
    document.querySelector('.max_streak').textContent = max_streak;
    document.querySelector('.best_time').textContent = best_time;

    timer_start = setTimeout(function(){
        document.querySelector('.splash').classList.add('hidden');
        document.querySelector('.groups').classList.remove('hidden');

        let blocks = document.querySelectorAll('.group');
        good_positions.forEach( pos => {
            blocks[pos].classList.add('good');
        });

        timer_game = setTimeout(function(){
            document.querySelectorAll('.group.good').forEach(el => { el.classList.remove('good')});
            game_started = true;

            startTimer();
            speed = parseInt(document.querySelector('#speed').value, 10);
            timer_finish = setTimeout(function(){
                game_started = false;
                wrong = 3;
                check();
            }, speed * 1000);
        }, 4000);
    }, 2000);
}

let timerRunning = false;

function startTimer(){
    timerStart = Date.now();
    timerRunning = true;
    function tick() {
        if (!timerRunning) return;
        const elapsed = Date.now() - timerStart;
        const sec = Math.floor(elapsed / 1000);
        const ms = elapsed % 1000;
        const msStr = ms < 10 ? "00" + ms : ms < 100 ? "0" + ms : String(ms);
        document.querySelector('.streaks .time').textContent = sec + "." + msStr;
        timer_time = requestAnimationFrame(tick);
    }
    timer_time = requestAnimationFrame(tick);
}
function stopTimer(){
    timerRunning = false;
    cancelAnimationFrame(timer_time);
}
function resetTimer(){
    timerRunning = false;
    cancelAnimationFrame(timer_time);
    document.querySelector('.streaks .time').textContent = '0.000';
}

start();
