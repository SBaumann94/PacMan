var KEYDOWN = false;
var PAUSE = false;
var LOCK = false;

var HIGHSCORE = getHighestScore() || 1001;
var SCORE = 0;
var SCORE_BUBBLE = 1;
var SCORE_SUPER_BUBBLE = 5;
var SCORE_GHOST_COMBO = 100;

var LIFES = 2;
var GAMEOVER = false;

var LEVEL = 1;
var LEVEL_NEXT_TIMER = -1;
var LEVEL_NEXT_STATE = 0;

var TIME_GENERAL_TIMER = -1;
var TIME_GAME = 0;
var TIME_LEVEL = 0;
var TIME_LIFE = 0;
var TIME_FRUITS = 0;

var HELP_DELAY = 1500;
var HELP_TIMER = -1;

function blinkHelp() {
	if ($('.help-button').attr("class").indexOf("yo") > -1) {
		$('.help-button').removeClass("yo");
	} else {
		$('.help-button').addClass("yo");
	}
}

function initGame(newgame) {
	if (newgame) {
		stopPresentation();
		stopTrailer();

		HOME = false;
		GAMEOVER = false;

		$('#help').fadeOut("slow");

		score(0);
		clearMessage();
		$("#home").hide();
		$("#panel").show();

		var ctx = null;
		var canvas = document.getElementById('canvas-panel-title-pacman');
		canvas.setAttribute('width', '38');
		canvas.setAttribute('height', '32');
		if (canvas.getContext) {
			ctx = canvas.getContext('2d');
		}

		var x = 15;
		var y = 16;

		ctx.fillStyle = "#fff200";
		ctx.beginPath();
		ctx.arc(x, y, 14, (0.35 - (3 * 0.05)) * Math.PI, (1.65 + (3 * 0.05)) * Math.PI, false);
		ctx.lineTo(x - 5, y);
		ctx.fill();
		ctx.closePath();

		x = 32;
		y = 16;

		ctx.fillStyle = "#dca5be";
		ctx.beginPath();
		ctx.arc(x, y, 4, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.closePath();
	}

	initBoard();
	drawBoard();
	drawBoardDoor();

	initPaths();
	drawPaths();

	initBubbles();
	drawBubbles();

	initFruits();

	initPacman();
	drawPacman();

	initGhosts();
	drawGhosts();

	lifes();

	ready();
}

function win() {
	stopAllSound();

	LOCK = true;
	stopPacman();
	stopGhosts();
	stopBlinkSuperBubbles();
	stopTimes();

	eraseGhosts();

	setTimeout("prepareNextLevel()", 1000);

}
function prepareNextLevel(i) {
	if (LEVEL_NEXT_TIMER === -1) {
		eraseBoardDoor();
		LEVEL_NEXT_TIMER = setInterval("prepareNextLevel()", 250);
	} else {
		LEVEL_NEXT_STATE++;
		drawBoard(((LEVEL_NEXT_STATE % 2) === 0));

		if (LEVEL_NEXT_STATE > 6) {
			LEVEL_NEXT_STATE = 0;
			clearInterval(LEVEL_NEXT_TIMER);
			LEVEL_NEXT_TIMER = -1;
			nextLevel();
		}
	}
}
function nextLevel() {
	LOCK = false;

	LEVEL++;

	erasePacman();
	eraseGhosts();

	if (LEVEL > 5) {
		gameover()
	} else {

		resetPacman();
		resetGhosts();

		initGame();

		TIME_LEVEL = 0;
		TIME_LIFE = 0;
		TIME_FRUITS = 0;
	}
}


function retry() {
	stopTimes();

	erasePacman();
	eraseGhosts();

	resetPacman();
	resetGhosts();

	drawPacman();
	drawGhosts();

	TIME_LIFE = 0;
	TIME_FRUITS = 0;

	ready();
}

function ready() {
	LOCK = true;
	message("Készülj!");

	playReadySound();
	setTimeout("go()", "4100");
}
function go() {
	playSirenSound();

	LOCK = false;

	startTimes();

	clearMessage();
	blinkSuperBubbles();

	movePacman();

	moveGhosts();
}
function startTimes() {
	if (TIME_GENERAL_TIMER === -1) {
		TIME_GENERAL_TIMER = setInterval("times()", 1000);
	}
}
function times() {
	TIME_GAME++;
	TIME_LEVEL++;
	TIME_LIFE++;
	TIME_FRUITS++;

	fruit();
}
function pauseTimes() {
	if (TIME_GENERAL_TIMER != -1) {
		clearInterval(TIME_GENERAL_TIMER);
		TIME_GENERAL_TIMER = -1;
	}
	if (FRUIT_CANCEL_TIMER != null) FRUIT_CANCEL_TIMER.pause();
}
function resumeTimes() {
	startTimes();
	if (FRUIT_CANCEL_TIMER != null) FRUIT_CANCEL_TIMER.resume();
}
function stopTimes() {
	if (TIME_GENERAL_TIMER != -1) {
		clearInterval(TIME_GENERAL_TIMER);
		TIME_GENERAL_TIMER = -1;
	}
	if (FRUIT_CANCEL_TIMER != null) {
		FRUIT_CANCEL_TIMER.cancel();
		FRUIT_CANCEL_TIMER = null;
		eraseFruit();
	}
}

function pauseGame() {

	if (!PAUSE) {
		stopAllSound();
		PAUSE = true;

		message("szünet");

		pauseTimes();
		pausePacman();
		pauseGhosts();
		stopBlinkSuperBubbles();
	}
}
function resumeGame() {
	if (PAUSE) {
		testStateGhosts();

		PAUSE = false;

		clearMessage();

		resumeTimes();
		resumePacman();
		resumeGhosts();
		blinkSuperBubbles();
	}
}

function lifes(l) {
	if (l) {
		if (l > 0) {
			playExtraLifeSound();
		}
		LIFES += l;
	}

	var canvas = document.getElementById('canvas-lifes');
	canvas.setAttribute('width', '120');
	canvas.setAttribute('height', '30');
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');

		ctx.clearRect(0, 0, 120, 30);
		ctx.fillStyle = "#fff200";
		for (var i = 0, imax = LIFES; (i < imax && i < 4); i++) {
			ctx.beginPath();

			var lineToX = 13;
			var lineToY = 15;

			ctx.arc(lineToX + (i * 30), lineToY, 13, (1.35 - (3 * 0.05)) * Math.PI, (0.65 + (3 * 0.05)) * Math.PI, false);
			ctx.lineTo(lineToX + (i * 30) + 4, lineToY);
			ctx.fill();
			ctx.closePath();
		}
	}
}

function gameover() {
	GAMEOVER = true;
	message("game over");
	stopTimes();

	erasePacman();
	eraseGhosts();

	resetPacman();
	resetGhosts();
	if (false) {//new highscore

		//Getting the e-mail of the new top player
		const congratsText = "Gratulálunk, megdöntötted a rekordot!\nAdd meg az e-mail címed és ha december 24.ig te maradsz a toplista élén megajádnékozunk egy általad választott 32 centis pizzával!"
		var person = prompt(congratsText);
		while (person == null || person.trim().length < 5) {
			person = prompt(congratsText);
		}
		alert("Köszönjük! A nyertest még idén értesítjük az eredményről");
	}

	if (LEVEL > 4) {
		const congratsText = "Gratulálunk, nyertél egy 10%-os kupont!\n(A kódot a vágólapra másoltuk neked, Ctrl + V-vel beillesztheted)\nA kupon egyszer felhasználható és nem vonható össze több kuponnal.\nLegyen szép napod és boldog karácsonyt! :)"
		alert(congratsText);
		var code = "oyBQnzg8R";
		//kuponkód lekérése a szerverről
		copyToClipboard(code);
	}
	TIME_GAME = 0;
	TIME_LEVEL = 0;
	TIME_LIFE = 0;
	TIME_FRUITS = 0;

	LIFES = 2;
	LEVEL = 1;

	SCORE = 0;
}
const copyToClipboard = str => {
	const el = document.createElement('textarea');
	el.value = str;
	el.setAttribute('readonly', '');
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
};


function message(m) {
	$("#message").html(m);
	if (m === "game over") $("#message").addClass("red");
}
function clearMessage() {
	$("#message").html("");
	$("#message").removeClass("red");
}

function score(s, type) {

	var scoreBefore = (SCORE / 5000) | 0;

	SCORE += s;
	if (SCORE === 0) {
		$('#score span').html("00");
	} else {
		$('#score span').html(SCORE);
	}

	var scoreAfter = (SCORE / 5000) | 0;
	if (scoreAfter > scoreBefore) {
		lifes(+1);
	}


	if (SCORE > HIGHSCORE) {
		HIGHSCORE = SCORE;
		if (HIGHSCORE === 0) {
			$('#highscore span').html("00");
		} else {
			$('#highscore span').html(HIGHSCORE);
		}
	} else {
		$('#highscore span').html(HIGHSCORE)
	}

	if (type && (type === "clyde" || type === "pinky" || type === "inky" || type === "blinky")) {
		erasePacman();
		eraseGhost(type);
		$("#board").append('<span class="combo">' + SCORE_GHOST_COMBO + '</span>');
		$("#board span.combo").css('top', eval('GHOST_' + type.toUpperCase() + '_POSITION_Y - 10') + 'px');
		$("#board span.combo").css('left', eval('GHOST_' + type.toUpperCase() + '_POSITION_X - 10') + 'px');
		SCORE_GHOST_COMBO = SCORE_GHOST_COMBO * 2;
	} else if (type && type === "fruit") {
		$("#board").append('<span class="fruits">' + s + '</span>');
		$("#board span.fruits").css('top', (FRUITS_POSITION_Y - 14) + 'px');
		$("#board span.fruits").css('left', (FRUITS_POSITION_X - 14) + 'px');
	}
}

const URL = 'https://desolate-citadel-62473.herokuapp.com/'

function getHighestScore() {
	fetch('https://desolate-citadel-62473.herokuapp.com/getScore', {
		method: 'get',
		mode: 'cors',
		headers: { 'Content-Type': 'application/json' }
	})
		.then(response => response.json())
		.then(s => {
			console.log(s)
			if (s.id) {
				return s.score
			}else{
				alert(s)
			}
		})
		.catch(console.log("sajt"))
}
function updateHighscore(s, e) {
	fetch('https://desolate-citadel-62473.herokuapp.com/setScore', {
		method: 'post',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			score: s,
			email: e
		})
	})
}