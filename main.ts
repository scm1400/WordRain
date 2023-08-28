/**
 * Copyright (c) 2022 ZEP Co., LTD
 */

import "zep-script";
import {ScriptDynamicResource, ScriptPlayer} from "zep-script";

declare global {
    namespace Time {
        function GetTime(): number;

        function GetUtcTime(): number;

        function GetTimeInterval(lastTime: number, nowTime: number, AppDateType: any);

    }

    namespace DateType {
        const SECONDS;

    }
}

const [_mapWidth, _mapHeight] = [ScriptMap.width, ScriptMap.height];

const EFFECT_SPECIAL = {
    sprite: ScriptApp.loadSpritesheet("effect_base.png", 142, 123, {
        //@ts-ignore
        play: [0, 1, 2, 3, 4, 5],
    }, 6),
    offsetX: -71,
    offsetY: -123 + 32
}

const EFFECT_COIN = {
    sprite: ScriptApp.loadSpritesheet("effect_1.png", 73, 69, {
        //@ts-ignore
        play: [0, 1, 2, 3, 4, 5, 6],
    }, 7),
    offsetX: -36,
    offsetY: -69 + 32
}

const EFFECT_RAINBOW_COIN = {
    sprite: ScriptApp.loadSpritesheet("effect_2.png", 129, 123, {
        //@ts-ignore
        play: [0, 1, 2, 3, 4, 5, 6],
    }, 7),
    offsetX: -64,
    offsetY: -123 + 32
}

const CSV_COLUM_INFO = {
    word: 0,
    special: 1
}

//@ts-ignore
const WORD_CSV = ScriptApp.loadCSV("words.csv");
type WORD_INFO = {
    sprite: ScriptDynamicResource,
    score: number,
    jamoCount: number,
    isSpecial: boolean
}

const WORD_DB: {
    [text: string]: WORD_INFO
} = {};

const SPECIAL_WORD_DB: {
    [text: string]: WORD_INFO
} = {};

let UsePhaserGo = true;
const TILE_SIZE = 32;
const FONT_FAMILY =
    "'Pretendard Std', 'Pretendard', 'Pretendard JP', -apple-system, " +
    "blinkmacsystemfont, system-ui, roboto, 'Helvetica Neue', 'Segoe UI', " +
    "'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif";

WORD_CSV.trim().split(/\r?\n/).forEach((row: string) => {
    let colums = row.split(",");
    const word = colums[CSV_COLUM_INFO.word];
    const score = Math.floor(word.length / 2);
    const jamoCount = countJamos(word);
    const isSpecial = score >= 4;
    // if (score < 10) {
    WORD_DB[word] = {
        sprite: UsePhaserGo ? null : ScriptApp.loadSpritesheet(`${word}.png`),
        score: score ?? 1,
        jamoCount: jamoCount ?? 1,
        isSpecial: isSpecial
    }
    // } else {
    //     SPECIAL_WORD_DB[word] = {
    //         sprite: UsePhaserGo ? null : ScriptApp.loadSpritesheet(`${word}.png`),
    //         score: score,
    //         jamoCount: jamoCount,
    //         isSpecial: isSpecial
    //     }
    // }
    //
})


class PlayerScoreData {
    name: string;
    score: number
    typingSpeed: number;

    constructor(player: ScriptPlayer) {
        this.name = player.name;
        this.score = player.tag.score;
        this.typingSpeed = player.tag.typingSpeed;
    }

    updateScore(player: ScriptPlayer) {
        this.score = player.tag.score;
        this.typingSpeed = player.tag.typingSpeed;
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
            showAppLabel(`☔ ${Math.floor(game._gameWaitingTime)}초 후 단어 소나기 게임이 시작됩니다.`);
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
            showAppLabel(`☔ ${Math.floor(game._gameTime)}초 후 단어 소나기가 멈춥니다..`);
            game._genTime -= dt;
            if (game._genTime <= 0) {
                game._genTime = Math.random() * (30 / _mapWidth - game._level * 0.03 / _mapWidth * 30);
                if (UsePhaserGo) {
                    if (Math.random() <= 0.025) {
                        createRandomWord(Math.floor(_mapWidth * Math.random()), true);
                    } else {
                        createRandomWord(Math.floor(_mapWidth * Math.random()), false);
                    }
                } else {
                    if (Math.random() <= 0.05) {
                        createRandomWord(Math.floor(_mapWidth * Math.random()), true);
                    } else {
                        createRandomWord(Math.floor(_mapWidth * Math.random()));
                    }
                }

            }

            if (UsePhaserGo) {
                for (let wordArray of Object.values(game.wordStacker)) {
                    wordArray.forEach((wordObject) => {
                        const key = wordObject.key;
                        wordObject.y += 3.5 * TILE_SIZE / 60;
                        for (const player of ScriptApp.players) {
                            //@ts-ignore
                            player.callPhaserFunc(key, 'setY', [wordObject.y]);
                        }
                    });
                }
            }

            game._flushTime += dt;
            if (game._flushTime >= 3) {
                game._flushTime = 0;
                for (let wordArray of Object.values(game.wordStacker)) {
                    wordArray.forEach((wordObject) => {
                        if (UsePhaserGo) {
                            if (Math.floor(wordObject.y / 32) >= _mapHeight - 1) {
                                wordObject.destroy(false);
                            }
                        } else {
                            if (wordObject.tileY() == _mapHeight - 1) {
                                wordObject.destroy(false);
                            }
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

const GAME_TIME = 70;
const GAME_WAITING_TIME = 60;
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
        if (!this.wordStacker) this.wordStacker = {};

        for (const player of ScriptApp.players) {
            player.tag.score = 0;
            player.tag.jamoCount = 0;
            player.tag.typeingSpeed = 0;
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
            player.tag.startTime = Time.GetUtcTime();
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
        if (UsePhaserGo) {
            for (let word in this.wordStacker) {
                this.wordStacker[word] = this.wordStacker[word].filter((wordObject) => {
                    for (const player of ScriptApp.players) {
                        //@ts-ignore                                                                               
                        player.removePhaserGo(wordObject.key);
                    }
                })
            }
            return false;
        } else {
            for (let word in this.wordStacker) {
                this.wordStacker[word] = this.wordStacker[word].filter((wordObject) => {
                        const objectExists = ScriptMap.getObjectWithKey(wordObject.key);

                        // ScriptMap에서 해당 객체가 있으면 destroy() 호출
                        if (objectExists) {
                            wordObject.destroy();

                            // destroy() 후에도 객체가 남아있는지 확인
                            const objectStillExists = ScriptMap.getObjectWithKey(wordObject.key);

                            // destroy() 후에도 객체가 남아있다면 배열에 남기기
                            return objectStillExists;
                        } else {
                            return false;
                        }
                    }
                );
            }
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
            this._playerScoreMap[player.id].updateScore(player);
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
    public key: string;
    public score: number;
    public jamoCount: number;
    public isSpecial: boolean;
    public x: number;
    public y: number;
    public playerId: string;
    public lucky: boolean;

    constructor(x: number, word: string) {
        const wordInfo: WORD_INFO = WORD_DB[word] || SPECIAL_WORD_DB[word];
        if (!wordInfo) return;

        _game.addWordObject(word, this);
        const key = _game.generateWordObjectKey(word);
        this.key = key;
        this.text = word;
        this.score = wordInfo.score ?? 0;
        this.jamoCount = wordInfo.jamoCount;
        this.isSpecial = wordInfo.isSpecial;
        this.y = 0;
        this.x = x * TILE_SIZE;

        let moveSpeedValue = 30;

        // wordInfo가 SPECIAL_WORD_DB에서 가져온 경우 movespeed를 10으로 설정
        if (SPECIAL_WORD_DB[word] === wordInfo) {
            moveSpeedValue = 10;
        }

        if (UsePhaserGo) {
            for (const player of ScriptApp.players) {
                //@ts-ignore
                player.addPhaserGo({
                    text: {
                        name: key, x: x * TILE_SIZE, y: 0,
                        text: word,
                        style: {
                            fontSize: '24px',
                            fontFamily: FONT_FAMILY,
                            fontWeight: 'bold',
                            color: this.lucky ? '#00FF00' : this.isSpecial ? '#D0312D' : '#FFFFFF',
                            strokeThickness: 4,
                            stroke: '#333333',
                            shadow: {
                                offsetY: 2,
                                color: '#333333',
                                fill: true,
                                blur: 2,
                                offsetX: 2,
                                stroke: true,
                            },
                            resolution: 2,
                        },
                        origin: [0.5, 1]
                    }
                });
            }
            // player.callPhaserFunc(key, 'setDepth', [10]);
        } else {
            const sprite = wordInfo.sprite;
            ScriptMap.putObjectWithKey(x, 0, sprite, {
                key: this.key,
                movespeed: moveSpeedValue
            });
            this.object = ScriptMap.getObjectWithKey(this.key);
            ScriptMap.moveObjectWithKey(this.key, x, _mapHeight - 1, false);
            ScriptApp.runLater(() => {
                let object = ScriptMap.getObjectWithKey(key);
                if (object) {
                    //@ts-ignore
                    ScriptMap.putObjectWithKey(object.tileX, object.tileY, null, {
                        key: this.key,
                    });
                }
            }, 60)
        }
    }

    public tileX(): number {
        if (UsePhaserGo) return Math.floor(this.x / 32);
        return this.object.tileX;
    }

    public tileY(): number {
        if (UsePhaserGo) return Math.floor(this.y / 32);
        return this.object.tileY;
    }

    destroy(effect = true) {
        const [x, y] = [this.tileX(), this.tileY()];
        if (UsePhaserGo) {
            for (const player of ScriptApp.players) {
                //@ts-ignore                      
                player.removePhaserGo(this.key);
            }
        } else {
            ScriptMap.putObjectWithKey(x, y, null, {
                key: this.key
            });
        }

        if (effect) {
            const mainAnimationKey = this.key + "_effect";
            let effectSprite;
            let offsetX = 0;
            let offsetY = 0;
            if (this.isSpecial) {
                effectSprite = EFFECT_SPECIAL.sprite;
                offsetX = EFFECT_SPECIAL.offsetX;
                offsetY = EFFECT_SPECIAL.offsetY;
            } else if (this.lucky) {
                effectSprite = EFFECT_RAINBOW_COIN.sprite;
                offsetX = EFFECT_SPECIAL.offsetX;
                offsetY = EFFECT_SPECIAL.offsetY;
            } else {
                effectSprite = EFFECT_COIN.sprite;
                offsetX = EFFECT_SPECIAL.offsetX;
                offsetY = EFFECT_SPECIAL.offsetY;
            }

            ScriptMap.putObjectWithKey(x, y, effectSprite, {
                key: mainAnimationKey,
                offsetX: 0,
                offsetY: 0
            })
            ScriptMap.playObjectAnimationWithKey(mainAnimationKey, "play", 0);
            ScriptApp.runLater(() => {
                ScriptMap.putObjectWithKey(x, y, null, {
                    key: mainAnimationKey
                })
            }, 1);
            _game.removeWordObject(this.text, this);
        }
    }
}

let _game: Game;

ScriptApp.onStart.Add(() => {
    _game = new Game();
})

ScriptApp.onJoinPlayer.Add(function (player) {
    player.tag = {};
    if (_game && _game.isStarted()) {
        player.tag.startTime = Time.GetUtcTime();
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
            incrementScore(player, wordObjects[0]);
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
    } else if (text == "!clearObjects") {
        _game.clearAllObjects();
    }
})

function createRandomWord(x, lucky = false) {
    let wordArray;
    let randomWord;
    wordArray = Object.keys(WORD_DB)
    randomWord = wordArray[Math.floor(Math.random() * wordArray.length)];
    // ScriptApp.sayToAll(randomWord);
    const wordObject = new WordObject(x, randomWord);
    if (!wordObject.isSpecial && lucky) wordObject.lucky = true;
}

function incrementScore(player, wordInfo: WordObject) {
    player.tag.score = (player.tag.score || 0) + (wordInfo.isSpecial ? Math.floor(wordInfo.score * 1.5) : wordInfo.lucky ? wordInfo.score * 2 : wordInfo.score);
    player.tag.jamoCount = (player.tag.jamoCount || 0) + wordInfo.jamoCount;
    player.tag.typingSpeed = calculateTypingSpeed(player.tag.startTime, player.tag.jamoCount);
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
    player.tag.rankWidget = player.showWidget("rankingBoard.html", "middleleft", 260, 400);
    player.tag.rankWidget.sendMessage({
        type: "init",
        rankArray: _game._sortedRankings
    })
}

function showAppLabel(str, time = 1500) {
    let message = `<span
		style="
		color: #00775b;
			position: absolute;
			margin: auto;
			display: flex;
			align-items: center;
			justify-content: center;
			height: max-content;
			padding: 12px 24px;
			width: max-content;
			background-color: rgba(191,242,234,0.8);
			border-radius: 5px;
			border-style: solid;
			border-color: rgba(6,241,241,0.46);
			border-width: 1px;
			box-shadow: 0px 0px 2px #089c9c;
			left: 50%;
			transform: translate(-50%,0);
			top: 210px;
		"
	>${str}</span>`;
    ScriptApp.showCustomLabel(message, 0xffffff, 0x000000, -250, 100, 1, time);
}

function countJamos(s) {
    let totalJamos = 0;

    for (let i = 0; i < s.length; i++) {
        const charCode = s.charCodeAt(i);

        if (charCode >= 0xAC00 && charCode <= 0xD7A3) { // 한글 영역
            // 자음과 모음 개수를 더함 (기본적으로 2개로 가정하고, 받침이 있는 경우 3개로 계산)
            totalJamos += (charCode - 0xAC00) % 28 === 0 ? 2 : 3;
        } else {
            // 한글이 아닌 문자는 그대로 1개로 계산
            totalJamos += 1;
        }
    }

    return totalJamos;
}

function calculateTypingSpeed(startTime, count) {
    const endTime = Time.GetUtcTime();

    const elapsedTimeInMinutes = (endTime - startTime) / 60000;

    const wordsPerMinute = count / elapsedTimeInMinutes;

    return Math.floor(wordsPerMinute);
}















