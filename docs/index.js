// Запускаем работу только после полной загрузки страницы
document.addEventListener("DOMContentLoaded", function(){

	// Показываем загрузку
	UI.messageScreen.loading.show();
	UI.setStep('loading');
	UI.messageScreen.loading.changeStatus("Подкотовка камеры...");
	
	// Тригеримся, когда камера будет готова
	FingerCatch.initCamera().then(video => {
		video.play();
		video.addEventListener("loadeddata", event => {
			console.log("Камера готова!");
			UI.messageScreen.loading.changeStatus("Камера подключена!");
			FingerCatch.init();
		});
	});

	// Настраиваем канвас относительно конфигов
	const canvas = document.querySelector("#pose-canvas");
	canvas.width = FingerCatch.config.video.width;
	canvas.height = FingerCatch.config.video.height;

	// Нажатие на кнопку "Вкл. видео" в строке дебага
	document.querySelector(".debug .show_video").onclick = function(e){
		let videoPlayer = document.querySelector('#pose-video');
		videoPlayer.classList.toggle('invisible');
		e.target.innerHTML = videoPlayer.classList.contains('invisible')?"Вкл. видео":"Выкл. видео";
	}

	// Нажатие на кнопку "Пауза" в строке дебага
	document.querySelector(".debug .start_stop").onclick = function(e){
		e.target.classList.toggle('paused');
		e.target.innerHTML = e.target.classList.contains('paused')?"Продолжить":"Пауза";
		FingerCatch.config.pause = e.target.classList.contains('paused');
	}

});