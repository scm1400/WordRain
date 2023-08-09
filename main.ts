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

const WordStacker: {
    [text: string]: WordObject[];
} = {}

let wordObjectCounter = 0; 
class WordObject {
    public object;
    public text: string;
    private key: string;

    constructor(x: number, sprite: ScriptDynamicResource, text: string) {
        this.key = `${text}_${wordObjectCounter++}`;
        this.text = text;

        ScriptMap.putObjectWithKey(x, 0, sprite, {
            key: this.key,
            movespeed: 60
        });

        this.object = ScriptMap.getObjectWithKey(this.key);
        ScriptMap.moveObjectWithKey(this.key, x, _mapHeight - 1, false);

        if (!WordStacker[text]) {
            WordStacker[text] = [];
        }
        WordStacker[text].push(this);
    }

    public tileX(): number {
        return this.object.tileX;
    }

    public tileY(): number {
        return this.object.tileY;
    }

    destroy() {
        const wordArray = WordStacker[this.text];
        ScriptMap.putObjectWithKey(this.object.tileX, this.object.tileY, null, {
            key: this.key
        });
        wordArray.splice(wordArray.indexOf(this), 1)
    }
}


function createRandomWord(x) {
    let wordArray = Object.keys(WORD_DB);
    const randomWord = wordArray[Math.floor(Math.random() * wordArray.length)];
    // ScriptApp.sayToAll(randomWord);

    new WordObject(x, WORD_DB[randomWord].sprite, randomWord);
}

let _start = false;
let _genTime = 0;
let _flushTime = 0;

let _level = 1;
let _levelTimer = 15;
let _levelAddTimer = 0;

ScriptApp.onJoinPlayer.Add(function (player) {
    player.tag = {};
})

ScriptApp.addOnKeyDown(81, function (player) {
    // createRandomWord(10);
    _start = true;
})


ScriptApp.onUpdate.Add((dt) => {
    if (!_start) return;

    _genTime -= dt;
    if (_genTime <= 0) {
        _genTime = Math.random() * (0.5 - _level * 0.05);
        createRandomWord(Math.floor(_mapWidth * Math.random()));
    }

    _flushTime += dt;
    if (_flushTime >= 3) {
        _flushTime = 0;
        for (let wordArray of Object.values(WordStacker)) {
            wordArray.forEach((wordObject) => {
                if (wordObject.tileY() == _mapHeight - 1) {
                    wordObject.destroy();
                }
            })

        }
    }

    _levelAddTimer += dt;
    if (_levelAddTimer >= _levelTimer) {
        _level++;
        _levelAddTimer = 0;

        if (_level > 8) {
            _level = 8;
        }
    }
})

ScriptApp.onSay.Add((player, text) => {
    if (_start) {
        if (WordStacker.hasOwnProperty(text)) {
            if (WordStacker[text][0]) {
                incrementScore(player);
                WordStacker[text][0].destroy();
            }
        }
    }
})

function incrementScore(player) {
    player.tag.score = (player.tag.score || 0) + 1;
    player.title = `[ 점수: ${player.tag.score}점 ]`;
    player.sendUpdated();
}