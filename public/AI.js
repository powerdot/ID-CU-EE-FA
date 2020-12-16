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
	humanInput: function(rockOrPaperOrScissors) {
	  this.chosenByHuman = rockOrPaperOrScissors
	  this.gameCount++
	  this.whatShouldAIAnswer()
	  this.whoIsTheWinner()
	},
	prepareData: function(){
		if (this.pattern.length < 1) {
			for (let index = 1; index <= this.patternLength; index++) {
				this.pattern.push(Math.floor(Math.random() * 3) + 1)
			}
		}
	},
	updatePattern: function(){
		if (this.gameCount !== 0) {
			this.pattern.shift()
			this.pattern.push(this.chosenByHuman)
		}
	},
	whatShouldAIAnswer: function() {
	  this.prepareData()
	  const net = new brain.recurrent.LSTMTimeStep()
	  net.train([this.pattern], { iterations: 100, log: false })
	  const humanWillChose = net.run(this.pattern)
	  this.updatePattern()
	  const roundedHumanWillChose = Math.round(humanWillChose)
	  this.chosenByAI = 1 <= roundedHumanWillChose && roundedHumanWillChose <= 3 ? (roundedHumanWillChose % 3) + 1 : 1;
	  console.log('Скорее всего человек выберет следующим: ' + roundedHumanWillChose)
	  console.log('Соответственно выбор AI будет:', this.chosenByAI)
	},
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
