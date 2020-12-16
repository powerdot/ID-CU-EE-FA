/**
 * AI.js (Artificial Intelligence) - от англ. искусственный интеллект.
 * Это объект для обучения нейросети Brain.js в игру Камень-Ножницы-Бумага.
 * 
 * Именно здесь:
 * - Функция для обработки хода игрока
 * - Обучение нейронки на предыдущих ходах игрока
 * - Определение победителя
 */

let AI = {
	pattern: [],
	scoreHuman: 0,
	scoreAI: 0,
	chosenByHuman: 0,
	winner: '',
	gameCount: 0,
	patternLength: 10,
	chosenByAI: 0,
	// Функция входа - активирует цепочку работы
	humanInput: function(rockOrPaperOrScissors) {
	  this.chosenByHuman = rockOrPaperOrScissors
	  this.gameCount++
	  this.whatShouldAIAnswer()
	  this.whoIsTheWinner()
	},
	// Функция заполнения предыдущих несуществующих игр (паттерна) случайными значениями
	prepareData: function(){
		if (this.pattern.length < 1) {
			for (let index = 1; index <= this.patternLength; index++) {
				this.pattern.push(Math.floor(Math.random() * 3) + 1)
			}
		}
	},
	// Обновление паттерна последним значением
	updatePattern: function(){
		if (this.gameCount !== 0) {
			this.pattern.shift()
			this.pattern.push(this.chosenByHuman)
		}
	},
	// Функция, которая выдает ответ нейросети во время её хода
	whatShouldAIAnswer: function() {
	  this.prepareData();
	  const net = new brain.recurrent.LSTMTimeStep() // Создаем нейронную сеть
	  net.train([this.pattern], { iterations: 100, log: false }) // Обучаем ее на патерне предыдущих игр
	  const humanWillChose = net.run(this.pattern) // Получаем (из обученной сети) предположение что я мог выкинуть (какой жест? 1 2 или 3)
	  const roundedHumanWillChose = Math.round(humanWillChose) // Нейросеть выдает, допустим, 1.00022393 - это означает, что она думает, что я бы выбрал 1. Округляем.
	  this.chosenByAI = 1 <= roundedHumanWillChose && roundedHumanWillChose <= 3 ? (roundedHumanWillChose % 3) + 1 : 1; // Правила игры. На предполагаемый выбор игрока наклавываем что должна ответить нейро сеть. То есть 2.
	  // - Вот с этого момента нейросеть выдает 2 в качестве своего ответа
	  console.log('Соответственно выбор AI будет:', this.chosenByAI);
	  this.updatePattern() // Вставляем ответ игрока в общий паттерн его действий уже для будущих ответов
	},
	// Функция определения кто выиграл - очень простая
	whoIsTheWinner: function() {
	  if (this.chosenByHuman === this.chosenByAI) {
		this.winner = 'draw'
	  } else if (
		(this.chosenByHuman === 1 && this.chosenByAI === 3) ||
		(this.chosenByHuman === 3 && this.chosenByAI === 2) ||
		(this.chosenByHuman === 2 && this.chosenByAI === 1)
	  ) {
		this.winner = 'human'
		this.scoreHuman++
	  } else {
		this.winner = 'AI'
		this.scoreAI++
	  }
	  console.log("Победитель:", this.winner, "| Счет:", this.scoreHuman, '-', this.scoreAI)
	}
}
