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

const Language = {
    ko: "ko",
    en: "en",
    ja: "ja",
}

let _language = Language.ko;

const LocalizeContainer = {
    [Language.ko]: {
        wordrain_label_waiting: "((number))초 후 단어 소나기 게임이 시작됩니다.",
        wordrain_label_playing: "((number))초 후 단어 소나기가 멈춥니다..",
        wordrain_text_result: " 🏆 게임 결과 ",
        wordrain_text_rank: "((rank))등: ((name))(((score))점)",
        wordrain_wran_not_admin: "관리자만 게임을 실행할 수 있습니다.",
        wordrain_normal_mode: "노멀게임 모드가 적용되었습니다.",
        wordrain_text_score: "[ 점수: ((score))점 ]",
        wordrain_warn_file: "🚫 잘못된 파일을 업로드했습니다.",
        wordrain_select_list: "단어 목록 선택",
        wordrain_upload_word: "소나기게임 단어 업로드",
        wordrain_upload_desc: '쉼표(,)로 구분된 단어를 포함한 txt나 csv 파일을 업로드할 수 있습니다.\n단어에 쉼표(,)가 포함된 경우 해당 단어를 큰따옴표("")로 둘러싸야 합니다.',
        wordrain_warn_file_format: "정확한 형식의 파일을 첨부해 주세요",
        wordrain_button_add_file: "파일 추가",
        wordrain_file_uploaded: "업로드된 단어",
        wordrain_button_game_start: "게임 시작",
        wordrain_key_per_minutes: "((number))타",
        wordrain_score: "((score))점",
        wordrain_number_participating: "(((number))명 참가중)",
        wordrain_app_name: "단어 소나기",
        wordrain_desc: "소나기에 사용될 단어 목록을 업로드 할 수 있습니다.",
        wordrain_update_note: "업데이트 소식",
    },
    [Language.en]: {
        wordrain_label_waiting: "After ((number)) seconds, the Word Showers game starts.",
        wordrain_label_playing: "After ((number)) seconds, the word showers stop...",
        wordrain_text_result: "[ ☔ Game results ]",
        wordrain_text_rank: "rank ((rank)): ((name))(((score))points)",
        wordrain_wran_not_admin: "Only administrators can run the game.",
        wordrain_normal_mode: "Normal game mode applied.",
        wordrain_text_score: "[ Score: ((score))points ]",
        wordrain_warn_file: "🚫 You uploaded an invalid file.",
        wordrain_select_list: "Selecting a Word List",
        wordrain_upload_word: "Upload Showers Game Words",
        wordrain_upload_desc: 'You can upload a TXT or CSV file containing words separated by commas (,).\nIf a word contains commas (,), you must enclose it in double quotes ("").',
        wordrain_warn_file_format: "Please attach the file in the correct format",
        wordrain_button_add_file: "Add file",
        wordrain_file_uploaded: "Uploaded words",
        wordrain_button_game_start: "Start game",
        wordrain_key_per_minutes: "((number)) KPM",
        wordrain_score: "((score)) pts",
        wordrain_number_participating: "(((number)) people participating)",
        wordrain_app_name: "Word showers",
        wordrain_desc: "Allows you to upload a list of words to be used in showers.",
        wordrain_update_note: "Updates Note",
    },
    [Language.ja]: {
        wordrain_label_waiting: "((number)) 秒後、Word Rain ゲームが始まります。",
        wordrain_label_playing: "((number)) 秒後、雨が止むという文字が表示されます...",
        wordrain_text_result: "[ ☔ 試合結果 ]",
        wordrain_text_rank: "ランク ((rank)): ((name))(((score))点)",
        wordrain_wran_not_admin: "管理者のみがゲームを実行できます。",
        wordrain_normal_mode: "通常のゲームモードが適用されます。",
        wordrain_text_score: "[ スコア: ((score)) 点 ]",
        wordrain_warn_file: "🚫 無効なファイルをアップロードしました。",
        wordrain_select_list: "単語リストの選択",
        wordrain_upload_word: "シャワーゲームの単語をアップロードする",
        wordrain_upload_desc: 'カンマ (,) で区切られた単語を含む TXT または CSV ファイルをアップロードできます。\n単語にカンマ (,) が含まれる場合は、二重引用符 ("") で囲む必要があります。',
        wordrain_warn_file_format: "正しい形式でファイルを添付してください",
        wordrain_button_add_file: "ファイルを追加",
        wordrain_file_uploaded: "アップロードされた単語",
        wordrain_button_game_start: "ゲームをスタート",
        wordrain_key_per_minutes: "((number)) KPM",
        wordrain_score: "((score))点",
        wordrain_number_participating: "(((number))人が参加しています)",
        wordrain_app_name: "ワードシャワー",
        wordrain_desc: "シャワーで使用する単語のリストをアップロードできます。",
        wordrain_update_note: "アップデートノート",
    }
}

const [_mapWidth, _mapHeight] = [ScriptMap.width, ScriptMap.height];

const EFFECT_SPECIAL = {
    sprite: ScriptApp.loadSpritesheet(
        "effect_base.png",
        142,
        123,
        {
            //@ts-ignore
            play: [0, 1, 2, 3, 4, 5],
        },
        6
    ),
    offsetX: -71,
    offsetY: -61,
};

const EFFECT_COIN = {
    sprite: ScriptApp.loadSpritesheet(
        "effect_1.png",
        73,
        69,
        {
            //@ts-ignore
            play: [0, 1, 2, 3, 4, 5, 6],
        },
        7
    ),
    offsetX: -36,
    offsetY: -34,
};

const EFFECT_RAINBOW_COIN = {
    sprite: ScriptApp.loadSpritesheet(
        "effect_2.png",
        129,
        123,
        {
            //@ts-ignore
            play: [0, 1, 2, 3, 4, 5, 6],
        },
        7
    ),
    offsetX: -64,
    offsetY: -61,
};

const CSV_COLUM_INFO = {
    word: 0,
    special: 1,
};

//@ts-ignore
const DEFAULT_WORD_CSV = ScriptApp.loadCSV("words.csv");
type WORD_INFO = {
    sprite: ScriptDynamicResource;
    score: number;
    jamoCount: number;
    isSpecial: boolean;
};

const WORD_DB: {
    [text: string]: WORD_INFO;
} = {};

const CUSTOM_WORD_DB: {
    [text: string]: WORD_INFO;
} = {};

const SPECIAL_WORD_DB: {
    [text: string]: WORD_INFO;
} = {};

let UsePhaserGo = true;
const TILE_SIZE = 32;
const FONT_FAMILY = "'Pretendard Std', 'Pretendard', 'Pretendard JP', -apple-system, " + "blinkmacsystemfont, system-ui, roboto, 'Helvetica Neue', 'Segoe UI', " + "'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif";

class PlayerScoreData {
    name: string;
    score: number;
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
        if (game.isMiniGame) return;
        if (game._gameWaitingTime < 0) {
            game.start();
        } else {
            actionToAllPlayers(player => showLabelTypeG(player, "main", "⏰ " + LocalizeContainer[player.language].wordrain_label_waiting.replace("((number))", String(Math.floor(game._gameWaitingTime)))));
        }
        game._gameWaitingTime -= dt;
    }
}

function actionToAllPlayers(action, ...args) {
    for (const player of ScriptApp.players) {
        action(player, ...args)
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
            actionToAllPlayers(player => showLabelTypeG(player, "main","☔ " + LocalizeContainer[player.language].wordrain_label_playing.replace("((number))", String(Math.floor(game._gameTime)))));
            game._gameTime -= dt;
            if (game._freeze) {
                game._freezeTimer -= dt;
                if (game._freezeTimer <= 0) {
                    game._freeze = false;
                }
                return;
            }
            game._genTime -= dt;
            if (game._genTime <= 0) {
                game._genTime = Math.random() * (30 / _mapWidth - ((game._level * 0.03) / _mapWidth) * 30);
                if (UsePhaserGo) {
                    if (Math.random() <= 0.04) {
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
                        wordObject.y += (3.5 * TILE_SIZE) / 60;
                        for (const player of ScriptApp.players) {
                            //@ts-ignore
                            player.callPhaserFunc(key, "setY", [wordObject.y]);
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
            for (const player of ScriptApp.players) {
                //@ts-ignore
                player.playSound("victory.wav", false, true, "victory", 0.4);
            }

            for (const player of ScriptApp.players) {
                //@ts-ignore
                let gameResultMessage: string = LocalizeContainer[player.language].wordrain_text_result;
                game._sortedRankings.forEach((playerScoreData, index) => {
                    if (index < 3) {
                        gameResultMessage += `\n`;
                        //@ts-ignore
                        gameResultMessage += LocalizeContainer[player.language].wordrain_text_rank.replace("((rank))", String(index + 1)).replace("((name))", playerScoreData.name).replace("((score))", playerScoreData.score);
                    } else {
                        return;
                    }
                });
                showLabelTypeG(player, "main", gameResultMessage, 8000);
            }

            if (game.isMiniGame) {
                ScriptApp.forceDestroy();
            } else {
                game.init();
            }
        } else if (this.stateTime < 0) {
            game.setState(new ReadyState());
        }
        this.stateTime -= dt;
    }
}

const GAME_TIME = 70;
const GAME_WAITING_TIME = 20;
const GAME_END_WAITING_TIME = 10;

class Game {
    private state: GameState;

    private _start: boolean;
    private _playerScoreMap: {
        [id: string]: PlayerScoreData;
    };

    _genTime: number;
    _flushTime: number;
    _level: number;
    _levelTimer: number;
    _levelAddTimer: number;

    _gameWaitingTime: number;
    _gameTime: number;

    _sortedRankings: PlayerScoreData[];
    _freeze: boolean; // 빨간 단어를 맞추면 모든 단어를 멈추게 할 변수
    _freezeTimer: number;

    wordObjectCounter: number;
    wordStacker: {
        [text: string]: WordObject[];
    };

    isMiniGame: boolean;

    constructor() {
        this.state = new ReadyState();
        this.isMiniGame = false;
        this._freeze = false;
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
        this._freeze = false;

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
            showRankWidget(player);
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
        }, 2);
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
                });
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
                });
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
                    rankArray: this._sortedRankings,
                });
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

    constructor(x: number, word: string, lucky = false) {
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
        this.lucky = lucky;

        let moveSpeedValue = 30;

        if (UsePhaserGo) {
            for (const player of ScriptApp.players) {
                //@ts-ignore
                player.addPhaserGo({
                    text: {
                        name: key,
                        x: x * TILE_SIZE,
                        y: 0,
                        text: word,
                        style: {
                            fontSize: "24px",
                            fontFamily: FONT_FAMILY,
                            fontStyle: "bold",
                            color: this.lucky ? "#00FF00" : this.isSpecial ? "#D0312D" : "#FFFFFF",
                            strokeThickness: 4,
                            stroke: "#333333",
                            shadow: {
                                offsetY: 2,
                                color: "#333333",
                                fill: true,
                                blur: 2,
                                offsetX: 2,
                                stroke: true,
                            },
                            resolution: 2,
                        },
                    },
                });
                //@ts-ignore
                player.callPhaserFunc(key, "setOrigin", [0.5, 0.5]);
            }
        } else {
            const sprite = wordInfo.sprite;
            ScriptMap.putObjectWithKey(x, 0, sprite, {
                key: this.key,
                movespeed: moveSpeedValue,
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
            }, 60);
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
                key: this.key,
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
                offsetX = EFFECT_RAINBOW_COIN.offsetX;
                offsetY = EFFECT_RAINBOW_COIN.offsetY;
            } else {
                effectSprite = EFFECT_COIN.sprite;
                offsetX = EFFECT_COIN.offsetX;
                offsetY = EFFECT_COIN.offsetY;
            }

            ScriptMap.putObjectWithKey(x, y, effectSprite, {
                key: mainAnimationKey,
                offsetX,
                offsetY: offsetY + (this.y - y * 32),
            });
            ScriptMap.playObjectAnimationWithKey(mainAnimationKey, "play", 0);
            ScriptApp.runLater(() => {
                ScriptMap.putObjectWithKey(x, y, null, {
                    key: mainAnimationKey,
                });
            }, 1);
            _game.removeWordObject(this.text, this);
        }
    }
}

let _game: Game;

ScriptApp.onInit.Add(() => {
    const array = parseCSV(DEFAULT_WORD_CSV, false);
    array.forEach((word) => {
        setWordDB(word);
    });
    _game = new Game();
});

ScriptApp.onStart.Add(() => {
});

ScriptApp.onJoinPlayer.Add(function (player) {
	//@ts-ignore
	player.playSound("bgm.mp3", true, true, "bgm", 0.6);
	player.tag = {};
	if (_game && _game.isStarted()) {
		player.tag.startTime = Time.GetUtcTime();
		showRankWidget(player);
	}
	if (!_game.isStarted() && ScriptApp.creatorID && player.id === ScriptApp.creatorID) {
		_game.isMiniGame = true;
		// if (!isAdmin(player)) {
		// 	player.showCustomLabel("관리자만 실행할 수 있습니다.");
		// 	ScriptApp.forceDestroy();
		// 	return;
		// }

        if (player.isMobile) {
            _game.start();
        } else {
            showUploadWidget(player);
        }
    }
});

ScriptApp.onUpdate.Add((dt) => {
    _game?.update(dt);
});

ScriptApp.onSay.Add((player, text) => {
    if (_game.isStarted()) {
        const wordObjects = _game.getWordObjectsForText(text);
        if (wordObjects && wordObjects.length > 0) {
            let firstWordObject = wordObjects[0];
            incrementScore(player, firstWordObject);
            if (firstWordObject.lucky) {
                //@ts-ignore
                player.playSound("rainbow.wav", false, true, 0.7);
            } else if (firstWordObject.isSpecial) {
                _game._freeze = true;
                _game._freezeTimer = 3;
                //@ts-ignore
                player.playSound("boom.wav", false, true, 0.7);
            } else {
                //@ts-ignore
                player.playSound("correct.mp3", false, true, 0.7);
            }
            firstWordObject.destroy();
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
    } else if (text == "!storage") {
        //@ts-ignore
        ScriptApp.sayToStaffs(App.storage);
    } else if (text == "!normal") {
        //@ts-ignore
        showLabelTypeG(player, "main", LocalizeContainer[player.language].wordrain_normal_mode);
        _game.isMiniGame = false;
    }
});

function createRandomWord(x, lucky = false) {
    let wordArray;
    let randomWord;
    wordArray = Object.keys(WORD_DB);
    randomWord = wordArray[Math.floor(Math.random() * wordArray.length)];
    // ScriptApp.sayToAll(randomWord);
    const wordObject = new WordObject(x, randomWord, lucky);
}

function incrementScore(player, wordInfo: WordObject) {
    player.tag.score = (player.tag.score || 0) + (wordInfo.isSpecial ? Math.floor(wordInfo.score * 1.5) : wordInfo.lucky ? wordInfo.score * 2 : wordInfo.score);
    player.tag.jamoCount = (player.tag.jamoCount || 0) + wordInfo.jamoCount;
    player.tag.typingSpeed = calculateTypingSpeed(player.tag.startTime, player.tag.jamoCount);
    player.title = LocalizeContainer[player.language].wordrain_text_score.replace("((score))", player.tag.score);
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
        rankArray: _game._sortedRankings,
    });
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

function showLabelTypeG(player, key, text, time = 4000, textColor = 0xffffff, bgColor = 0x27262e) {
    const isMobile = player.isMobile;
    const topGap = isMobile ? 10 : -2; // 모바일은 상단으로 부터 60px, pc는 48px이 되도록 설정한 값
    /**
     * 사이즈에 따른 @labelPercentWidth
     * XL: isMobile ? 90 : 50;
     * L: isMobile ? 80 : 40;
     * M: isMobile ? 70 : 28;
     * S: isMobile ? 60 : 20
     */
    const labelPercentWidth = isMobile ? 60 : 20;
    const labelDisplayTime = time;

    const parentStyle = `
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    text-align: center;
    `;

    const firstRowStyle = `
    font-size: ${isMobile ? "14px" : "18px"};
    font-weight: 700; 
    color: white;`;

    const customLabelOption = {
        key: key,
        borderRadius: '12px',
        fontOpacity: false,
        padding: '8px',
    }

    let htmlStr = `<span style="${parentStyle}">
        <span style="${firstRowStyle}">${text}</span>
    </span>`;

    player.showCustomLabel(htmlStr, textColor, bgColor, topGap, labelPercentWidth, 0.64, labelDisplayTime, customLabelOption);
}

function countJamos(s) {
    let totalJamos = 0;

    for (let i = 0; i < s.length; i++) {
        const charCode = s.charCodeAt(i);

        if (charCode >= 0xac00 && charCode <= 0xd7a3) {
            // 한글 영역
            // 자음과 모음 개수를 더함 (기본적으로 2개로 가정하고, 받침이 있는 경우 3개로 계산)
            totalJamos += (charCode - 0xac00) % 28 === 0 ? 2 : 3;
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

function showUploadWidget(player) {
    ScriptApp.getStorage(() => {
        ScriptApp.storage = ScriptApp.storage || "{}";
        const appStorage = JSON.parse(ScriptApp.storage);
        const dbData = appStorage.uploadedWordsDB || {};

        dbData["default"] = Object.keys(WORD_DB);

        player.tag.uploadWidget = player.showWidget("upload.html", "middle", 0, 0);
        player.tag.uploadWidget.sendMessage({
            type: "init",
            quizData: dbData,
            localizeContainer: player.tag.localizeContainer,
        });

        player.tag.uploadWidget.onMessage.Add(function (sender, data) {
            const type = data.type;
            switch (type) {
                case "back": {
                    if (sender.tag.uploadWidget) {
                        sender.tag.uploadWidget.destroy();
                        sender.tag.uploadWidget = null;
                    }
                    if (sender.tag.widget) {
                        sender.tag.widget.sendMessage({
                            type: "show",
                        });
                    }
                    break;
                }
                case "close": {
                    if (sender.tag.uploadWidget) {
                        sender.tag.uploadWidget.destroy();
                        sender.tag.uploadWidget = null;
                    }
                    if (sender.tag.widget) {
                        sender.tag.widget.sendMessage({
                            type: "miniMode",
                        });
                    }
                    break;
                }
                case "uploadCsv": {
                    // if (!isAdmin(sender)) return;
                    // _tempFileName = data.fileName;
                    ScriptApp.getStorage(() => {
                        const uploadedWordsArray = parseCSV(data.csvContent, true);
                        const fileName = data.fileName;
                        if (!fileName || uploadedWordsArray.length === 0) {
                            sender.showAlert(LocalizeContainer[sender.language].wordrain_warn_file);
                            return;
                        }

                        const appStorage = JSON.parse(ScriptApp.storage);

                        for (let key in WORD_DB) {
                            delete WORD_DB[key];
                        }
                        uploadedWordsArray.forEach((word) => {
                            setWordDB(word);
                        });

                        if (!appStorage.uploadedWordsDB) {
                            appStorage.uploadedWordsDB = {};
                        }
                        appStorage.uploadedWordsDB[fileName] = uploadedWordsArray;
                        ScriptApp.setStorage(JSON.stringify(appStorage));
                    });
                    break;
                }
                case "requestStartGame": {
                    // if (!isAdmin(sender)) return;
                    if (sender.tag.uploadWidget) {
                        sender.tag.uploadWidget.destroy();
                        sender.tag.uploadWidget = null;
                    }
                    // if (data.fileName === "default") {
                    _game.start();
                    // } else {
                    //     ScriptApp.getStorage(() => {
                    //         const appStorage = JSON.parse(ScriptApp.storage);
                    //         if (appStorage.uploadedWordsDB && appStorage.uploadedWordsDB[data.fileName]) {
                    //
                    //         }
                    //     })
                    // }

                    break;
                }
            }
        });
    });
}

function parseCSV(csvContent, custom = false) {
    let parsedDataArray = [];
    let lines = csvContent.trim().split(/\r?\n/);

    for (let index = 0; index < lines.length; index++) {
        let line = lines[index];
        let wordDataArray = [];
        let cursor = 0;
        let inQuote = false;
        let buffer = "";

        while (cursor < line.length) {
            const currentChar = line[cursor];
            if (currentChar === '"') {
                if (inQuote) {
                    if (cursor + 1 < line.length && line[cursor + 1] === '"') {
                        buffer += currentChar;
                        cursor++;
                    } else {
                        inQuote = false;
                    }
                } else {
                    inQuote = true;
                }
            } else if (currentChar === "," && !inQuote) {
                wordDataArray.push(buffer.trim());
                buffer = "";
            } else {
                buffer += currentChar;
            }
            cursor++;
        }
        if (buffer) {
            wordDataArray.push(buffer.trim());
        }
        parsedDataArray.push(...wordDataArray);
    }
    return parsedDataArray;
}

function setWordDB(word, custom = false) {
    const score = Math.floor(word.length / 2);
    const jamoCount = countJamos(word);
    const isSpecial = Math.random() >= 0.95;
    if (!custom) {
        WORD_DB[word] = {
            sprite: UsePhaserGo ? null : ScriptApp.loadSpritesheet(`${word}.png`),
            score: score ?? 1,
            jamoCount: jamoCount ?? 1,
            isSpecial: isSpecial,
        };
    } else {
        CUSTOM_WORD_DB[word] = {
            sprite: UsePhaserGo ? null : ScriptApp.loadSpritesheet(`${word}.png`),
            score: score ?? 1,
            jamoCount: jamoCount ?? 1,
            isSpecial: isSpecial,
        };
    }
}

function isAdmin(player) {
    return player.role >= 3000;
}
