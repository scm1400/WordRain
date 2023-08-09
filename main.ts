/**
 * Copyright (c) 2022 ZEP Co., LTD
 */

import "zep-script";
import {ScriptDynamicResource} from "zep-script";

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


class Game {
    private _start: boolean;
    private _genTime: number;
    private _flushTime: number;
    private _level: number;
    private _levelTimer: number;
    private _levelAddTimer: number;
    wordObjectCounter: number;

    private wordStacker: {
        [text: string]: WordObject[];
    };

    constructor() {
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

        for (let word in this.wordStacker) {
            this.wordStacker[word].forEach(wordObject => wordObject.destroy());
        }
        this.wordStacker = {};
    }

    restart() {
        this.init();
        // 다른 필요한 초기화 로직 추가
    }

    addWordObject(text: string, wordObject: WordObject) {
        if (!this.wordStacker[text]) {
            this.wordStacker[text] = [];
        }
        this.wordStacker[text].push(wordObject);
    }

    getWordObjects(text: string): WordObject[] {
        return this.wordStacker[text] || [];
    }

    getWordObjectsForText(text: string): WordObject[] | undefined {
        return this.wordStacker[text];
    }

    start() {
        ScriptApp.sayToAll("시작");
        this._start = true;
    }

    isStarted(): boolean {
        return this._start;
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

    update(dt: number) {
        if (!this._start) return;

        this._genTime -= dt;
        if (this._genTime <= 0) {
            this._genTime = Math.random() * (0.5 - this._level * 0.05);
            createRandomWord(Math.floor(_mapWidth * Math.random()));
        }

        this._flushTime += dt;
        if (this._flushTime >= 3) {
            this._flushTime = 0;
            for (let wordArray of Object.values(this.wordStacker)) {
                wordArray.forEach((wordObject) => {
                    if (wordObject.tileY() == _mapHeight - 1) {
                        wordObject.destroy();
                    }
                });
            }
        }

        this._levelAddTimer += dt;
        if (this._levelAddTimer >= this._levelTimer) {
            this._level++;
            this._levelAddTimer = 0;

            if (this._level > 8) {
                this._level = 8;
            }
        }
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


function createRandomWord(x) {
    let wordArray = Object.keys(WORD_DB);
    const randomWord = wordArray[Math.floor(Math.random() * wordArray.length)];
    // ScriptApp.sayToAll(randomWord);

    new WordObject(x, WORD_DB[randomWord].sprite, randomWord);
}

let _game: Game;

ScriptApp.onStart.Add(() => {
    _game = new Game();
})

ScriptApp.onJoinPlayer.Add(function (player) {
    player.tag = {};
})

ScriptApp.addOnKeyDown(81, function (player) {
    if (_game && !_game.isStarted()) {
        _game.start();
    }
})


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
})

function incrementScore(player) {
    player.tag.score = (player.tag.score || 0) + 1;
    player.title = `[ 점수: ${player.tag.score}점 ]`;
    player.sendUpdated();
}