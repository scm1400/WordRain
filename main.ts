/**
 * Copyright (c) 2022 ZEP Co., LTD
 */

import "zep-script";
import {ScriptDynamicResource, ScriptPlayer} from "zep-script";

const [_mapWidth, _mapHeight] = [ScriptMap.width, ScriptMap.height];
//@ts-ignore
const WORD_CSV = ScriptApp.loadCSV("words.csv");
const WORD_DB: {
    [text: string]: {
        sprite: ScriptDynamicResource,
    }
} = {};

WORD_CSV.trim().split(/\r?\n/).forEach((word: string) => {
    WORD_DB[word] = {
        sprite: ScriptApp.loadSpritesheet(`${word}.png`),
    }
})


class PlayerScoreData {
    name: string;
    score: number;

    constructor(player: ScriptPlayer) {
        this.name = player.name;
        this.score = player.tag.score;
    }

    updateScore(score: number) {
        this.score = score;
    }
}

// State Interface
interface GameState {
    stateTime: number;

    handleInput(game: Game): void;

    update(game: Game, dt: number): void;
}

class ReadyState implements GameState {
    stateTime: number;

    constructor() {
        this.stateTime = GAME_WAITING_TIME;
    }

    handleInput(game: Game) {

    }

    update(game: Game, dt: number) {
        if (game._gameWaitingTime < 0) {
            game.start();
        } else {
            showAppLabel(`☔ ${Math.floor(game._gameWaitingTime)}초 후 소나기 게임이 시작됩니다.`);
        }
        game._gameWaitingTime -= dt;
    }
}

class PlayingState implements GameState {
    stateTime: number;

    constructor() {
        this.stateTime = GAME_TIME;
    }

    handleInput(game: Game) {
    }

    update(game: Game, dt: number) {
        if (game._gameTime < 0) {
            game.setState(new GameEndState());
        } else {
            showAppLabel(`☔ ${Math.floor(game._gameTime)}초 후 소나기가 멈춥니다..`);
            game._genTime -= dt;
            if (game._genTime <= 0) {
                game._genTime = Math.random() * (0.5 - game._level * 0.05);
                createRandomWord(Math.floor(_mapWidth * Math.random()));
            }

            game._flushTime += dt;
            if (game._flushTime >= 3) {
                game._flushTime = 0;
                for (let wordArray of Object.values(game.wordStacker)) {
                    wordArray.forEach((wordObject) => {
                        if (wordObject.tileY() == _mapHeight - 1) {
                            wordObject.destroy();
                        }
                    });
                }
            }

            game._levelAddTimer += dt;
            if (game._levelAddTimer >= game._levelTimer) {
                game._level++;
                game._levelAddTimer = 0;

                if (game._level > 2) {
                    game._level = 2;
                }
            }
        }
        game._gameTime -= dt;
    }
}

class PausedState implements GameState {
    stateTime: number;

    constructor() {
        this.stateTime = GAME_WAITING_TIME;
    }

    handleInput(game: Game) {
    }

    update(game: Game) {
    }
}

class GameEndState implements GameState {
    stateTime: number;

    constructor() {
        this.stateTime = GAME_END_WAITING_TIME;
    }

    handleInput(game: Game) {

    }

    update(game: Game, dt: number) {
        if (this.stateTime === GAME_END_WAITING_TIME) {
            ScriptApp.playSound("victory.wav", false, true);
            let gameResultMessage: string = "[ ☔ 게임 결과 ]";
            game._sortedRankings.forEach((playerScoreData, index) => {
                ScriptApp.sayToAll(index.toString());
                if (index < 3) {
                    gameResultMessage += `\n${index + 1}등: ${playerScoreData.name}(${playerScoreData.score}점)`;
                } else {
                    return;
                }
            })
            showAppLabel(gameResultMessage, 8000);
            game.init();
        } else if (this.stateTime < 0) {
            game.setState(new ReadyState());
        }
        this.stateTime -= dt;
    }
}

const GAME_TIME = 60;
const GAME_WAITING_TIME = 30;
const GAME_END_WAITING_TIME = 10;

class Game {
    private state: GameState;

    private _start: boolean;
    _genTime: number;
    _flushTime: number;
    _level: number;
    _levelTimer: number;
    _levelAddTimer: number;
    private _playerScoreMap: {
        [id: string]: PlayerScoreData
    };

    _gameWaitingTime: number;
    _gameTime: number;

    _sortedRankings: PlayerScoreData[];
    wordObjectCounter: number;

    wordStacker: {
        [text: string]: WordObject[];
    };

    constructor() {
        this.state = new ReadyState();
        this.init();
    }

    init() {
        this._start = false;
        this._genTime = 0;
        this._flushTime = 0;
        this._level = 1;
        this._levelTimer = 15;
        this._levelAddTimer = 0;
        this.wordObjectCounter = 0;
        this._playerScoreMap = {};
        this._sortedRankings = [];
        this._gameTime = GAME_TIME;
        this._gameWaitingTime = GAME_WAITING_TIME;

        this.clearAllObjects();
        this.wordStacker = {};

        for (const player of ScriptApp.players) {
            player.tag.score = 0;
        }
    }

    setState(state: GameState) {
        this.state = state;
    }

    handleInput() {
        this.state.handleInput(this);
    }

    start() {
        this._start = true;
        this.setState(new PlayingState());
        for (const player of ScriptApp.players) {
            showRankWidget(player)
        }
    }

    pause() {
        this.setState(new PausedState());
    }

    gameOver() {
        this.setState(new GameEndState());
    }

    isStarted(): boolean {
        return this._start;
    }

    restart() {
        this.init();
        ScriptApp.runLater(() => {
            this.start();
        }, 2)
    }

    addWordObject(text: string, wordObject: WordObject) {
        if (!this.wordStacker[text]) {
            this.wordStacker[text] = [];
        }
        this.wordStacker[text].push(wordObject);
    }

    clearAllObjects() {
        for (let word in this.wordStacker) {
            this.wordStacker[word].forEach(wordObject => wordObject.destroy());
        }
        for (let word in this.wordStacker) {
            this.wordStacker[word].forEach(wordObject => wordObject.destroy());
        }
    }

    getWordObjects(text: string): WordObject[] {
        return this.wordStacker[text] || [];
    }

    getWordObjectsForText(text: string): WordObject[] | undefined {
        return this.wordStacker[text];
    }


    generateWordObjectKey(text: string): string {
        return `${text}_${this.wordObjectCounter++}`;
    }

    removeWordObject(text: string, wordObject: WordObject) {
        const wordArray = this.wordStacker[text];
        if (wordArray) {
            const index = wordArray.indexOf(wordObject);
            if (index > -1) {
                wordArray.splice(index, 1);
            }
        }
    }

    updateScore(player: ScriptPlayer) {
        if (this._playerScoreMap.hasOwnProperty(player.id)) {
            this._playerScoreMap[player.id].updateScore(player.tag.score);
        } else {
            this._playerScoreMap[player.id] = new PlayerScoreData(player);
        }
        this.updateRankings();
    }

    updateRankings() {
        this._sortedRankings = Object.values(this._playerScoreMap).sort((a, b) => b.score - a.score);
        this._sortedRankings = this._sortedRankings.slice(0, 50);

        for (const player of ScriptApp.players) {
            if (player.tag.rankWidget) {
                player.tag.rankWidget.sendMessage({
                    type: "update",
                    rankArray: this._sortedRankings
                })
            }
        }
    }

    getTop50Rankings(): PlayerScoreData[] {
        return this._sortedRankings;
    }

    destroy() {
        for (const player of ScriptApp.players) {
            if (player.tag.rankWidget) {
                player.tag.rankWidget.destroy();
                player.tag.rankWidget = null;
            }
        }
    }

    update(dt: number) {
        this.state.update(this, dt);
        // if (!this._start) {
        //
        // } else {
        //    
        // }

    }
}

class WordObject {
    public object;
    public text: string;
    private key: string;

    constructor(x: number, sprite: ScriptDynamicResource, text: string) {
        this.key = _game.generateWordObjectKey(text);
        this.key = `${text}_${_game.wordObjectCounter++}`;
        this.text = text;

        ScriptMap.putObjectWithKey(x, 0, sprite, {
            key: this.key,
            movespeed: 60
        });

        this.object = ScriptMap.getObjectWithKey(this.key);
        ScriptMap.moveObjectWithKey(this.key, x, _mapHeight - 1, false);

        _game.addWordObject(text, this);
    }

    public tileX(): number {
        return this.object.tileX;
    }

    public tileY(): number {
        return this.object.tileY;
    }

    destroy() {
        ScriptMap.putObjectWithKey(this.object.tileX, this.object.tileY, null, {
            key: this.key
        });
        _game.removeWordObject(this.text, this);
    }
}

let _game: Game;

ScriptApp.onStart.Add(() => {
    _game = new Game();
})

ScriptApp.onJoinPlayer.Add(function (player) {
    player.tag = {};
    if (_game.isStarted()) {
        showRankWidget(player);
    }
    //@ts-ignore
    // player.setCameraTarget()
})

// ScriptApp.addOnKeyDown(81, function (player) {
//     if (_game && !_game.isStarted()) {
//         _game.start();
//     }
// })


ScriptApp.onUpdate.Add((dt) => {
    _game?.update(dt);
})

ScriptApp.onSay.Add((player, text) => {
    if (_game.isStarted()) {
        const wordObjects = _game.getWordObjectsForText(text);
        if (wordObjects && wordObjects[0]) {
            incrementScore(player);
            player.playSound("correct.mp3");
            wordObjects[0].destroy();
        }
    }

    if (text === "!start") {
        if (_game.isStarted()) {
            _game.restart();
        } else {
            _game.start();
        }
    }
})

function createRandomWord(x) {
    let wordArray = Object.keys(WORD_DB);
    const randomWord = wordArray[Math.floor(Math.random() * wordArray.length)];
    // ScriptApp.sayToAll(randomWord);

    new WordObject(x, WORD_DB[randomWord].sprite, randomWord);
}

function incrementScore(player) {
    player.tag.score = (player.tag.score || 0) + 1;
    player.title = `[ 점수: ${player.tag.score}점 ]`;
    player.sendUpdated();
    _game.updateScore(player);
}

function showRankWidget(player) {
    if (player.isMobile) return;
    if (player.tag.rankWidget) {
        player.tag.rankWidget.destroy();
        player.tag.rankWidget = null;
    }
    player.tag.rankWidget = player.showWidget("rankingBoard.html", "middleleft", 200, 400);
    player.tag.rankWidget.sendMessage({
        type: "init",
        rankArray: _game._sortedRankings
    })
}

function showAppLabel(str, time = 1500) {
    let message = `<span
		style="
		color: #270;
			position: absolute;
			margin: auto;
			display: flex;
			align-items: center;
			justify-content: center;
			height: max-content;
			padding: 12px 0px;
			width: 90%;
			background-color: rgba(223, 242, 191, 0.8);
			border-radius: 5px;
			border-style: solid;
			border-color: rgba(36, 241, 6, 0.46);
			border-width: 1px;
			box-shadow: 0px 0px 2px #259c08;
			left: 50%;
			transform: translate(-50%,0);
		"
	>${str}</span>`;
    ScriptApp.showCustomLabel(message, 0xffffff, 0x000000, 0, 100, 1, time);
}