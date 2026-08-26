initSettings('hopscotch', ['#speed']);
document.querySelector('.speed_value').textContent = document.querySelector('#speed').value + 's';

let timer_start, timer_finish, timer_hide, timer_win, timer_time, good_positions, best_route, blinking_pos, last_pos, wrong, speed, timerStart;
let game_started = false;
let streak = 0;
let max_streak = 0;
let best_time = 99.999;

// Font Awesome 5 codepoints: ethernet (source) and network-wired (goal)
const GLYPH_SOURCE = '';
const GLYPH_GOAL = '';

function getMaxStreakFromStorage(){
    const str = localStorage.getItem('max-streak_hopscotch');
    return str !== null ? parseInt(str, 10) : 0;
}
function getBestTimeFromStorage(){
    const str = localStorage.getItem('best-time_hopscotch');
    return str !== null ? parseFloat(str) : 99.999;
}
max_streak = getMaxStreakFromStorage();
best_time = getBestTimeFromStorage();

const random = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Options
document.querySelector('#speed').addEventListener('input', function(ev){
    document.querySelector('.speed_value').textContent = ev.target.value + 's';
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

    let pos_clicked = parseInt(ev.target.dataset.position);
    if(pos_clicked === 0) return;

    if(last_pos === 0){
        document.querySelectorAll('.group.breathing')
            .forEach(el => { el.classList.remove('breathing') });
        document.querySelector('.groups').classList.add('transparent');

        if(pos_clicked === blinking_pos || pos_clicked === blinking_pos * 7){
            last_pos = pos_clicked;
            ev.target.classList.add('good');
        }else{
            wrong++;
            ev.target.classList.add('bad');
        }
    }else{
        let pos_jumps = parseInt(document.querySelectorAll('.group')[last_pos].innerText, 10);
        let maxV = maxVertical(last_pos);
        let maxH = maxHorizontal(last_pos);

        if(pos_jumps <= maxH && pos_clicked === last_pos + pos_jumps){
            last_pos = pos_clicked;
            ev.target.classList.add('good');
        }else if(pos_jumps <= maxV && pos_clicked === last_pos + (pos_jumps * 7)){
            last_pos = pos_clicked;
            ev.target.classList.add('good');
        }else{
            wrong++;
            ev.target.classList.add('bad');
        }
    }

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

        document.querySelector('.groups').classList.remove('transparent');
        let blocks = document.querySelectorAll('.group');
        good_positions.push(48);
        good_positions.forEach( pos => {
            blocks[pos].classList.add('proper');
        });
        return;
    }
    if(last_pos === 48){
        stopTimer();
        // Freeze the round: no further clicks count, and neither the digit-hide nor the
        // round-timeout may fire while the solved board is being shown.
        game_started = false;
        clearTimeout(timer_hide);
        clearTimeout(timer_finish);

        streak++;
        if(streak > max_streak){
            max_streak = streak;
            localStorage.setItem('max-streak_hopscotch', max_streak);
        }
        let time = document.querySelector('.streaks .time').textContent;
        if(parseFloat(time) < best_time){
            best_time = parseFloat(time);
            localStorage.setItem('best-time_hopscotch', best_time);
        }

        // Hold the completed route on screen so it stays readable, with the digits revealed
        // and the new stats shown, then move on to the next round.
        document.querySelector('.groups').classList.remove('transparent');
        document.querySelector('.streak').textContent = streak;
        document.querySelector('.max_streak').textContent = max_streak;
        document.querySelector('.best_time').textContent = best_time;
        timer_win = setTimeout(reset, 2000);
    }
}

function maxVertical(pos){
    return Math.floor((48-pos)/7);
}
function maxHorizontal(pos){
    let max = (pos+1) % 7;
    if(max > 0) return 7-max;
        else return 0;
}
function generateNextPosition(pos){
    let maxV = maxVertical(pos);
    let maxH = maxHorizontal(pos);
    if( maxV === 0 ){
        let new_pos = random(random(1, maxH), maxH);
        return [new_pos, pos+new_pos];
    }
    if( maxH === 0 ){
        let new_pos = random(random(1, maxV), maxV);
        return [new_pos, pos+(new_pos*7)];
    }
    if( random(1,1000) % 2 === 0 ){
        let new_pos = random(random(1, maxH), maxH);
        return [new_pos, pos+new_pos];
    }else{
        let new_pos = random(random(1, maxV), maxV);
        return [new_pos, pos+(new_pos*7)];
    }
}

function generateBestRoute(start_pos){
    let route = [];
    if( random(1,1000) % 2 === 0 ){
        start_pos *= 7;
    }
    while(start_pos < 48){
        let new_pos = generateNextPosition(start_pos);
        route[start_pos] = new_pos[0];
        start_pos = new_pos[1];
    }

    return route;
}

function reset(){
    game_started = false;
    last_pos = 0;

    resetTimer();
    clearTimeout(timer_start);
    clearTimeout(timer_hide);
    clearTimeout(timer_finish);
    clearTimeout(timer_win);

    max_streak = getMaxStreakFromStorage();
    best_time = getBestTimeFromStorage();

    document.querySelector('.splash').classList.remove('hidden');
    document.querySelector('.groups').classList.add('hidden');
    document.querySelector('.groups').classList.remove('transparent');

    document.querySelectorAll('.group').forEach(el => { el.remove(); });

    start();
}

function start(){
    wrong = 0;
    last_pos = 0;

    blinking_pos = random(1,4);
    best_route = generateBestRoute(blinking_pos);
    good_positions = Object.keys(best_route);

    let div = document.createElement('div');
    div.classList.add('group');
    const groups = document.querySelector('.groups');
    for(let i=0; i < 49; i++){
        let group = div.cloneNode();
        group.dataset.position = i.toString();
        let text;
        switch(i){
            case 0:
                text = GLYPH_SOURCE;break;
            case 48:
                text = GLYPH_GOAL;break;
            case blinking_pos:
            case (blinking_pos*7):
                group.classList.add('breathing');
                text = random(1,4);
                break;
            default:
                // Upstream quirk, kept as-is: filler digits land in 1-4 while a route cell can be
                // stamped with a 5, so a visible 5 always marks a cell on the solution path.
                text = random(1,5);
        }
        if( good_positions.includes( i.toString() ) ){
            text = best_route[i];
        }
        group.textContent = text;
        groups.appendChild(group);
    }

    addListeners();

    document.querySelector('.streak').textContent = streak;
    document.querySelector('.max_streak').textContent = max_streak;
    document.querySelector('.best_time').textContent = best_time;

    // Upstream quirk, kept as-is: both blinking cells are accepted as a start, but only one is the
    // generated route's true origin. Starting from the other one can strand you on a dead-end cell.
    timer_start = setTimeout(function(){
        document.querySelector('.splash').classList.add('hidden');
        document.querySelector('.groups').classList.remove('hidden');

        game_started = true;
        timer_hide = setTimeout(function(){
            document.querySelector('.groups').classList.add('transparent');
        }, 6000);

        startTimer();
        speed = parseInt(document.querySelector('#speed').value, 10);
        timer_finish = setTimeout(function(){
            game_started = false;
            wrong = 3;
            check();
        }, speed * 1000);
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
