/**
 * FingerCatch.js (Фингер Кэтч) - от англ. ловля пальцев.
 * Это объект для облегчения определение жестов кожаного мешка.
 * 
 * Именно здесь:
 * - Включается камера
 * - Подключается модель определения руки
 * - Отображаются пальчики игрока
 * - Происходит таинство логики во время игры
 */

let FingerCatch = {
	config: {
		pause: false,
		video: {
			width: 640,
			height: 480,
			fps: 30
		},
		landmarkColors: {
			thumb: '#f44336',
			indexFinger: '#3f51b5',
			middleFinger: '#2196f3',
			ringFinger: '#009688',
			pinky: '#ff5722',
			palmBase: '#9e9e9e'
		},
		gestures: {
			rock: function(){
				const Gesture = new fp.GestureDescription('rock'); // камень - это:
				Gesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 1.0); // большой палец полностью согнут
				Gesture.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 1.0); // указательный палец полностью согнут
				Gesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0); // средний палец полностью согнут
				Gesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0); // безымянный палец полностью согнут
				Gesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0); // мизинчик полностью согнут
				return Gesture;
			},
			scissors: function(){
				const Gesture = new fp.GestureDescription('scissors'); // ножницы - это:
				Gesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 1.0); // большой палец полностью согнут
				Gesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0); // указательный палец полностью раскрыт
				Gesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0); // средний палец полностью раскрыт
				Gesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0); // безымянный палец полностью согнут
				Gesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0); // мизинчик полностью согнут
				return Gesture;
			},
			paper: function(){
				const Gesture = new fp.GestureDescription('paper'); // бумага - это:
				Gesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0); // большой палец полностью раскрыт
				Gesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0); // указательный палец полностью раскрыт
				Gesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0); // средний палец полностью раскрыт
				Gesture.addCurl(fp.Finger.Ring, fp.FingerCurl.NoCurl, 1.0); // безымянный палец полностью раскрыт
				Gesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0); // мизинчик полностью раскрыт
				return Gesture;
			},
			like: function(){
				const Gesture = new fp.GestureDescription('like'); // лайк - это:
				// Gesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 0.5); // большой палец полностью раскрыт
				Gesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUp, 1.0);
				Gesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalUpLeft, 0.5);
				Gesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalUpRight, 0.5);

				Gesture.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 1.0); // указательный палец полностью согнут
				Gesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0); // средний палец полностью согнут
				Gesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0); // безымянный палец полностью согнут
				Gesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0); // мизинчик полностью согнут
				return Gesture;
			}
		}
	},

	// Инициализация работы скрипта для определения жестов
	init: async function(){
		const video = document.querySelector("#pose-video");
		const canvas = document.querySelector("#pose-canvas");
		const ctx = canvas.getContext("2d");

		// Указываем жесты, которые будем отслеживать, их определения выше в конфиге.
		const useGestures = [
			this.config.gestures.like(),
			this.config.gestures.paper(),
			this.config.gestures.scissors(),
			this.config.gestures.rock(),
		];

		const GE = new fp.GestureEstimator(useGestures);

		// Загружаем модель Handpose для TensorFlow
		// Это заранее подготовленная модель, обученная на руках и пальцах
		UI.messageScreen.loading.changeStatus("Инициализация Handpose модели...");
		const model = await handpose.load();
		console.log(model, video)
		console.log("Модель Handpose загружена (для определения жестов)");

		UI.messageScreen.loading.changeStatus("Запуск определения жестов...");

		// Это функция "оценивания"
		// Она отвечает за то, чтобы раз в какое-то время смотреть на картинку и понимать что на ней за жест.
		const estimateHands = async () => {
			// если игра приостановлена - пропускаем иттерацию
			if(this.config.pause) return setTimeout(() => { estimateHands(); }, 500);

			// очищаем область канваса (отображение видео и обозначений движений)
			ctx.clearRect(0, 0, this.config.video.width, this.config.video.height);
			UI.debug.setGesture("");

			// Получаем данные по положению руки и пальцев
			// Важно: сейчас эта функция может определять только 1 руку в кадре.
			const predictions = await model.estimateHands(video, true);

			// Перебираем все полученные данные о пальцах
			for(let i = 0; i < predictions.length; i++) {
				for(let part in predictions[i].annotations) {
					for(let point of predictions[i].annotations[part]) {
						// Рисуем точки на основе этих данных на нашем канвасе
						this.drawPoint(ctx, point[0], point[1], 10, this.config.landmarkColors[part]);
					}
				}

				// Оцениваем жесты на основе данных о положении
				// используя максимальную достоверность 7.5 из 10 (чтобы понизить уровень ошибки)
				const est = GE.estimate(predictions[i].landmarks, 7.5);

				// Теперь у нас есть массив жестов
				// Мы берем с самым высоким коефициентом достоверности
				if(est.gestures.length > 0) {
					let result = est.gestures.reduce((p, c) => {
						return (p.confidence > c.confidence) ? p : c;
					});
					this.gestureDetected(result.name);
				}
			}

			// И зацикливаем работу функции...
			// Если фпс 25 кадров в секунду, то берем 1000мс (1с) и делим на количество кадров в секунду.
			// Скрипт будет запускаться каждые 40мс (1000/25), то есть 25 раз в секунду.
			// Чем меньше кадров, тем меньше греется комп, но и смена кадров менее быстрая.
			setTimeout(() => { estimateHands(); }, 1000 / this.config.video.fps);
		}

		UI.debug.setFPS(this.config.video.fps);

		// Запускаем функцию по оценке
		console.log("Запуск функции для определения жестов");
		estimateHands();
		UI.messageScreen.loading.changeStatus("Определение жестов готово к работе!");
		UI.messageScreen.loading.hide();
		UI.messageScreen.letsStart.show();
	},

	// Получение стрима с камеры и настройка
	initCamera: async function() {
		const constraints = {
			audio: false,
			video: {
				facingMode: "user",
				width: this.config.video.width,
				height: this.config.video.height,
				frameRate: { max: this.config.video.fps }
			}
		};

		const video = document.querySelector("#pose-video");
		video.width = this.config.video.width;
		video.height = this.config.video.height;

		// получаем видео стрим с камеры
		const stream = await navigator.mediaDevices.getUserMedia(constraints);
		video.srcObject = stream;

		return new Promise(resolve => {
			video.onloadedmetadata = () => { resolve(video) };
		});
	},

	// Просто функция, чтобы рисовать точечки на пальцах
	drawPoint: function(ctx, x, y, r, color) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
	},

	// Обработка логики жестов и работы игры
	gestureDetectedName: '',
	gestureDetectedCount: 0,
	gestureDetected: async function(name){
		// Жесты могут распознаваться иногда ложно, поэтому мы подтверждаем жест только если он есть 10 кадров подряд:
		if(name != this.gestureDetectedName){
			this.gestureDetectedCount = 0;
			this.gestureDetectedName = name;
		}else{
			this.gestureDetectedCount++;
		}
		if(this.gestureDetectedCount < 10) return;

		UI.debug.setGesture(name);

		// Обработка логики жесла Лайк на экране приветствия
		if(UI.step == 'letsstart' || UI.step == 'game-result'){
			if(name == 'like'){
				UI.messageScreen.letsStart.hide();
				UI.game.start();
			}
			return;
		}

		// Обработка логики жестов во время ожидания хода игрока
		if(UI.step == 'game-waiting-human-answer' && ['paper', 'rock', 'scissors'].includes(name)){
			console.log("game-waiting-human-answer:", name);
			if(name == 'rock') await AI.humanInput(1);
			if(name == 'paper') await AI.humanInput(2);
			if(name == 'scissors') await AI.humanInput(3);
			console.log("winner:", AI.winner);
			UI.debug.setScores();
			UI.game.result();
		}
	}
}
