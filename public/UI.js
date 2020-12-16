/**
 * UI.js (User Interface) - от англ. пользовательский интерфейс.
 * Это объект для унифицированного и более удобного формата работы с интерфейсом маленькой игрушки.
 * 
 * Именно здесь:
 * - Включить/выключить любой экран
 * - Начать игру
 * - Изменить значения на результирующих экранах
 * - Изменить значения в полоске дебага
 */

let UI = {
    // Управление шагами UI (загрузка/в игре/результат)
    step: '',
    setStep: function(name){
        this.step = name;
        UI.debug.setStep(name);
    },

    // Управление отображения сообщений и данных в сообщениях
    messageScreen: {
        loading: {
            show: function(){
                document.querySelector(".message_screen .loading").classList.remove("hidden");
            },
            hide: function(){
                document.querySelector(".message_screen .loading").classList.add("hidden");
            },
            changeStatus: function(text){
                document.querySelector(".message_screen .loading .status").innerHTML = text;
            }
        },
        letsStart: {
            show: function(){
                document.querySelector(".message_screen .letsstart").classList.remove("hidden");
                UI.setStep("letsstart")
            },
            hide: function(){
                document.querySelector(".message_screen .letsstart").classList.add("hidden");
            }
        },
        gameCounter: {
            show: function(){
                document.querySelector(".message_screen .game_counter").classList.remove("hidden");
            },
            hide: function(){
                document.querySelector(".message_screen .game_counter").classList.add("hidden");
            },
            setTime: function(v){
                document.querySelector(".message_screen .game_counter .timer").innerHTML = v+'...';
            }
        },
        gameResult: {
            show: function(){
                document.querySelector(".message_screen .game_result").classList.remove("hidden");
            },
            hide: function(){
                document.querySelector(".message_screen .game_result").classList.add("hidden");
            },
            setResult: function(title, human_answer, ai_answer, human_score, ai_score){
                document.querySelector(".message_screen .game_result .title").innerHTML = title;
                document.querySelector(".message_screen .game_result .human_answer").innerHTML = human_answer;
                document.querySelector(".message_screen .game_result .ai_answer").innerHTML = ai_answer;
                document.querySelector(".message_screen .game_result .human_score").innerHTML = human_score;
                document.querySelector(".message_screen .game_result .ai_score").innerHTML = ai_score;
            }
        }
    },

    // Часть логики управления UI игры
    game: {
        timer: undefined,
        count: 0,
        start: function(){
            UI.messageScreen.gameCounter.show();
            UI.messageScreen.gameResult.hide();
            UI.setStep("game-counting");
            this.count = 3;
            UI.messageScreen.gameCounter.setTime(this.count);
            this.timer = setInterval(()=>{
                this.count = this.count - 1;
                if(this.count==0) {
                    clearInterval(this.timer);
                    UI.setStep("game-waiting-human-answer");
                    UI.messageScreen.gameCounter.hide();
                    return;
                }
                UI.messageScreen.gameCounter.setTime(this.count);
            }, 1000);
        },
        result: function(){
            UI.setStep("game-result");
            UI.messageScreen.gameResult.show();
            UI.messageScreen.gameResult.setResult(
                AI.winner=='draw'?"Ничья!":(AI.winner=="human"?"Победа!":"Проигрыш"),
                ['Камень', 'Бумагу', 'Ножницы'][AI.chosenByHuman-1],
                ['Камень', 'Бумагу', 'Ножницы'][AI.chosenByAI-1],
                AI.scoreHuman,
                AI.scoreAI
            );
        }
    },

    // Управление строкой дебага
    debug: {
        setGesture: function(v){
            document.querySelector(".debug .gesture").innerHTML = v;
        },
        setFPS: function(v){
            document.querySelector(".debug .fps").innerHTML = v;
        },
        setStep: function(v){
            document.querySelector(".debug .step").innerHTML = v;
        },
        setScores: function(){
            document.querySelector(".debug .human_score").innerHTML = AI.scoreHuman;
            document.querySelector(".debug .ai_score").innerHTML = AI.scoreAI;
            document.querySelector(".debug .games_amount").innerHTML = AI.gameCount;
        }
    }
}
