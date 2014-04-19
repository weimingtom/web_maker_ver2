enchant();

var DEBUG_MODE = false;			//デバッグモード

var GAME_WIDTH =	640;		//Game width
var GAME_HEIGHT =	800;		//Game height
var GAME_MAIN_HEIGHT = 600;		//Game screen height

var game;						//game object
var DEFAULT_FPS = 30;			//Frame rate
var PRELOAD_MAX = 20;			//Max number of preload.

var event_flag = 0;				//It saves a line number in scenario file.
var user_var = new Array();		//Its are user varibles.
var USER_VAR_MAX = 10;			//Max size of user varibles.
var SEL_MAX = 4;				//Max number of select window.

var read_flag = new Array();	//Read flags
var preload_flag = false;		//画像ロード中にロード発生で失敗するのでロックをかける
var preload_turn_num = 0;		//先行画像ロードの順番

var click_flag = true;			//Click control
var timer_cnt = 0;				//Use wait command
var option_status = 'hidden_all';		//option display control. It has many status.

var data = new Array();

var msg_wnd;
var main_screen;
var sub_screen;
var debug_wnd;
var sel_wnd = new Array();

var bg_load_url = new Array();
var bg_load_flag = new Array();
var bg_current_no = 0;

var char_load_url = new Array();
var char_load_flag = new Array();
var char_current_no = 0;

var se_load_url = new Array();
var se_load_flag = new Array();
var se_current_no = 0;

//現在の表示中のURL
var game_status = {
	char_left : "",
	char_center : "",
	char_right : "",
	bg : "",
	bgm : "",
	sound_mode : true,
	effect_mode : true,
	skip_mode : false
};

/////////////////////////////////////////////////////
//initiation
window.onload = function () {
	game = new Game(GAME_WIDTH, GAME_HEIGHT);
	game.fps = DEFAULT_FPS;
	game.touched = false;


	//Load and fix scenario data
	data = dataLoad();

	//Initiate Read flags
	for(var i = 0; i < data.length; i++){
		read_flag[i]=0;
	}
	//Initiate user varibles
	for(var i = 0; i < USER_VAR_MAX; i++){
		user_var[i] = 0;
	}

	game.preload('data/sys/msg_wnd.png', 'data/sys/select_wnd.png', 'data/sys/setting.png',
		'data/sys/load.png', 'data/sys/save.png', 'data/sys/backlog.png', 
		'data/sys/sound_on.png', 'data/sys/sound_off.png', 'data/sys/effect_on.png', 'data/sys/effect_off.png',
		'data/sys/read_on.png', 'data/sys/read_off.png', 'data/sys/save_base.png', 'data/sys/load_base.png');
	initDataLoad(data);	//先行ロード
	loadOption();

	game.onload = function(){

		main_screen = new MAINSCREEN();
		sub_screen = new SUBSCREEN(main_screen);
		msg_wnd = new MSGWINDOW();
		var setting_icon = new IMGBUTTON(0,0,80,80,'data/sys/setting.png','setting');
		//debagウィンドウ
		if(DEBUG_MODE) debug_wnd = new DEBUGWINDOW();

		game.rootScene.addEventListener(Event.TOUCH_START, function(e) {
				clickSelector();
		});
		//メインを登録
		game.rootScene.addEventListener('enterframe',main);
		clickSelector();
	};

	game.start();
	
	//option_load();
};


//////////////////////////////////////////////
//Game loop
function main(){
	//waitが設定されている場合
	if(timer_cnt > 0){
		var timer_end_flag = t_wait();
		if(timer_end_flag) clickSelector();
	}

}

/////////////////////////////////////////////////クリックロック時は何もしない(クリック実態）
function clickSelector(){
	var repeat_flag = false;
	if(click_flag){
		repeat_flag = mainEvent();
	}
	else{

	}

	//if repeatFlag is true, continue this routine
	if(repeat_flag) clickSelector();
	return;
}
////////////////////////////////////////////////////////////////////////////////
//メインのイベント処理
function mainEvent(){

	var repeat_flag　= false;
	var str_tmp = transrateCommand(data[event_flag]);
	var d_cmd= str_tmp.split(" ");		//スペース区切り

	switch(d_cmd[0]){
		case "bg":
			bgLoad(d_cmd);
		break;
		case "title":
			titleLoad(d_cmd);
		break;
	
		case "char":
			charLoad(d_cmd);
		break;
		
		case "rm":
			charRm(d_cmd);
		break;
		
		case "music":
			bgmStart(d_cmd);
			repeat_flag　=　true;
		break;
		
		case "musicstop":
			bgmStop(d_cmd);
			repeat_flag　=　true;
		break;
		
		case "goto":
			gotoCmd(d_cmd);
			repeat_flag　=　true;
		break;
		
		case "flagset":
			flagSet(d_cmd);
			repeat_flag　=　true;
		break;
		
		case "flagcal":
			flagCal(d_cmd);
			repeat_flag　=　true;
		break;
		
		case "if":
			ifCmd(d_cmd);
			repeat_flag　=　true;
		break;
		
		case "select":
			selectItem(d_cmd);
		break;
		
		case "wait":
			waitTime(parseInt(d_cmd[TIME_NUM]));
		break;
		
		case "se":
			sePlay(d_cmd);
			repeat_flag　=　true;
		break;
		case "shake":
			shake_init(d_cmd, "bg");
		break;
		case "charshake":
			shake_init(d_cmd, "char");
		break;
		
		case "#":
			repeat_flag　=　true;
		break;
		
		case "//":
			repeat_flag　=　true;
		break;

		//コマンドではないならメッセージ表示
		default:
			//msg_wnd.msg = data[event_flag];
			msg_wnd.text(data[event_flag]);
		break;
	}
	

	//if((game_status['skip_mode']) && (read_flag[event_flag] == 0)) game_status['skip_mode'] = false;	//未読だった場合、スキップモードをオフに
	if((game_status['skip_mode']) && (read_flag[event_flag] == 1)){
		repeat_flag = true;
	}
	read_flag[event_flag] = 1;			//既読フラグon

	event_flag++;		//イベントフラグをインクリメント
	
	loadSwitcher();		//先行ロード
	
	//if((skip_switch==1)&&(skip_mode==1)) repeat_flag=1;	//既読スキップモード時
	return repeat_flag;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
//メイン表示クラス
var MAINSCREEN = enchant.Class.create(enchant.Sprite, {
	initialize: function (){
		
		enchant.Sprite.call(this, GAME_WIDTH, GAME_MAIN_HEIGHT);
		this.image = game.assets['data/bg/black.jpg'];
		this.x = 0;
		this.y = 0;
			
		//アニメーション設定
		this.addEventListener('enterframe', function () {
			
		});
		game.rootScene.addChild(this);
	},
	redraw: function (image){
		this.image = image;
	}
});
///////////////////////////////////////////////////////////////////////
//バッファクラス
var SUBSCREEN = enchant.Class.create(enchant.Sprite, {
	initialize: function (main_screen){
		
		enchant.Sprite.call(this, GAME_WIDTH, GAME_MAIN_HEIGHT);
		this.x = 0;
		this.y = 0;
		this.age = 0;
		this.opacity = 0;
		this.wipe_mx = -32;
		this.shake_time = 0;	//シェイクの時に使用
		this.shake_pos = "";	//シェイクの時に使用
		this.animationFlag = "none";
		this.main_screen = main_screen;
		//ワイプ用の画像保存バッファ
		this.buffer = new Surface(GAME_WIDTH, GAME_MAIN_HEIGHT);
		//アニメーション設定
		this.addEventListener('enterframe', function (main_screen) {
			//カット
			if(this.animationFlag == "cut"){
				this.opacity = 1;
				this.end();
			}
			//ワイプ
			else if(this.animationFlag == "wipe"){
				for(var i = 0; i < 32; i++){
					var aa = i * 20;			//x座標の開始位置を計算
					var xx = i + this.wipe_mx;	//幅を計算
					if(xx > 20) xx = -1;
					//1～20ドットのサイズになる時だけコピー		
					if(xx > 0)　this.buffer.draw(game.assets[game_status['bg']],aa,0,xx,GAME_MAIN_HEIGHT,
								aa,0,xx,GAME_MAIN_HEIGHT);
					
				}
				this.image = this.buffer;
				this.wipe_mx++;			//全体のカウンターを+1

				if(this.age >= 60){
					this.end();
				}
			}
			//フェード
			else if(this.animationFlag == "fade"){
				this.opacity += 0.1;
				if(this.opacity >= 1.0) this.end();
			}
			//シェイク
			else if(this.animationFlag == "shake"){
				var r = Math.floor( Math.random() * 100 ) - 50;
				if(this.shake_time < 2) r = 0;	//初期値に戻して描画させる;
				var suf = new Surface(GAME_WIDTH, GAME_MAIN_HEIGHT);
				var bg_left_x = (this.shake_pos == "bg") ? r : 0;
				var char_left_x = (this.shake_pos == "left") ? r : 0;
				var char_center_x = (this.shake_pos == "center") ? r : 0;
				var char_right_x = (this.shake_pos == "right") ? r : 0;

				suf.draw(game.assets[game_status['bg']],0 + bg_left_x, 0);
				if(game_status['char_left'] != ""){
					//20%ずらす。
					var x = 0 - (game.assets[game_status['char_left']].width * 0.2) + char_left_x;
					suf.draw(game.assets[game_status['char_left']], x, 0);
				}

				if(game_status['char_center'] != ""){
					var x = (GAME_WIDTH - game.assets[game_status['char_center']].width) / 2;
					x += char_center_x;
					suf.draw(game.assets[game_status['char_center']], x, 0);
				}

				if(game_status['char_right'] != ""){
					//20%ずらす。
					var x = GAME_WIDTH - game.assets[game_status['char_right']].width + 
						(game.assets[game_status['char_right']].width * 0.2);
					x += char_right_x;
					suf.draw(game.assets[game_status['char_right']], x, 0);
				}
				this.image = suf;
				this.shake_time--;
				if(this.shake_time <= 0){
					this.end();
				}
			}
		});
		game.rootScene.addChild(this);
	},
	end: function(){
		this.main_screen.redraw(this.image);
		this.opacity = 0;
		this.wipe_mx = -32;
		click_flag = true;
		this.animationFlag = "none";
		if((game_status['skip_mode']) && (read_flag[event_flag] == 1)) repeat_flag = true;
		clickSelector();
	},
	setShake: function (s_pos, s_time){
		//シェイク時の初期化
		this.animationFlag = "shake";
		this.shake_time = s_time;
		this.shake_pos = s_pos;
		this.opacity = 1;
	},
	redraw: function (howto){
		this.x = 0;
		this.y = 0;
		this.age = 0;
		var suf = new Surface(GAME_WIDTH, GAME_MAIN_HEIGHT);
		suf.draw(game.assets[game_status['bg']]);
		
		if(game_status['char_left'] != ""){
			//20%ずらす。
			try{
				var x = 0 - (game.assets[game_status['char_left']].width * 0.2);
				suf.draw(game.assets[game_status['char_left']], x, 0);
			}catch(e){
				if(DEBUG_MODE) alert("Alert : " + game_status['char_left']);
			}
			
		}

		if(game_status['char_center'] != ""){
			try {
				var x = (GAME_WIDTH - game.assets[game_status['char_center']].width) / 2;
				suf.draw(game.assets[game_status['char_center']], x, 0);
			}catch(e){
				if(DEBUG_MODE) alert("Alert : " + game_status['char_center']);
			}
			
			
		}

		if(game_status['char_right'] != ""){
			//20%ずらす。
			try {
				var x = GAME_WIDTH - game.assets[game_status['char_right']].width + 
					(game.assets[game_status['char_right']].width * 0.2);
				suf.draw(game.assets[game_status['char_right']], x, 0);
			}catch(e){
				if(DEBUG_MODE) alert("Alert : " + game_status['char_right']);
			}
			
		}
		
		if(howto == "wipe"){
			//this.image = this.main_screen.image;
			this.buffer = this.main_screen.image;
		}
		else{
			this.image = suf;
		}
		this.animationFlag = howto;
		
	}
});

///////////////////////////////////////////////////////////////////////
//メイン表示クラス
var TITLESCREEN = enchant.Class.create(enchant.Sprite, {
	initialize: function (path){
		
		enchant.Sprite.call(this, GAME_WIDTH, GAME_HEIGHT);
		this.image = game.assets[path];
		this.opacity = 0;
		this.x = 0;
		this.y = 0;
		this.animationFlag = "start";

		//表示時にタッチされたら
		this.addEventListener('touchstart', function(e) {
				if(this.animationFlag == "stop") this.end();
		});
			
		//アニメーション設定
		this.addEventListener('enterframe', function () {
			if(this.animationFlag == "start"){
				if(this.opacity < 1) this.opacity += 0.1;
				if(this.opacity >= 1) this.animationFlag = "stop";
			}
			if(this.animationFlag == "end"){
				if(this.opacity > 0) this.opacity -= 0.1;
				if(this.opacity <= 0) this.remove();
			}
			
		});
		game.rootScene.addChild(this);
	},
	end: function(){
		this.animationFlag = "end";
	},
	remove: function (){
		click_flag = true;
		game.rootScene.removeChild(this);
		delete this;
		clickSelector();
	}
});

///////////////////////////////////////////////////////////////////////
//メッセージ表示クラス
var MSGWINDOW = enchant.Class.create(enchant.Sprite, {
	initialize: function (){
		
		enchant.Sprite.call(this, GAME_WIDTH, 200);
		this.image = game.assets['data/sys/msg_wnd.png'];
		this.x = 0;
		this.y = GAME_MAIN_HEIGHT;
		this.f_size = 24;
		this.msg = "";
			
		//アニメーション設定
		this.addEventListener('enterframe', function () {
			this.m_label.text = this.msg;
		});
		game.rootScene.addChild(this);
		//game.rootScene.insertBefore(this);

		this.m_label= new Label();
		this.m_label.color = 'white';
		this.m_label.font = "" + this.f_size + "px 'ＭＳ ゴシック'"
		this.m_label.x = this.x + 5;
		this.m_label.y = this.y + 12;
		this.m_label.width = this.width - 60;
		this.m_label.text = "";
		game.rootScene.addChild(this.m_label);
	},
	text: function (msg){
		
		this.msg = replaceCaractor(msg);
	}
});

///////////////////////////////////////////////////////////////////////
//選択肢表示クラス
var SELWINDOW = enchant.Class.create(enchant.Sprite, {
	initialize: function (x, y, msg, hata){
		
		enchant.Sprite.call(this, 500, 40);
		this.image = game.assets['data/sys/select_wnd.png'];
		this.x = x;
		this.y = y;
		this.f_size = 24;
		this.msg = msg;
		this.hata = hata;

		//アニメーション設定
		this.addEventListener('enterframe', function () {
			this.sel_label.text = this.msg;
		});
		this.addEventListener('touchstart', function(e) {
				execSelect(this.hata);
		});
		game.rootScene.addChild(this);

		this.sel_label= new Label();
		this.sel_label.color = 'white';
		this.sel_label.font = "" + this.f_size + "px 'ＭＳ ゴシック'"
		this.sel_label.x = this.x + 10;
		this.sel_label.y = this.y + 5;
		this.sel_label.width = this.width;
		this.sel_label.text = "";
		this.sel_label.hata = this.hata;
		//ラベルにもイベントリスナー追加（ラベル上をクリックしても反応しないため
		this.sel_label.addEventListener('touchstart', function(e) {
				execSelect(hata);
		});
		game.rootScene.addChild(this.sel_label);
	},
	text: function (msg){	
		this.msg = msg;
	},
	remove: function (){
		game.rootScene.removeChild(this.sel_label);
		game.rootScene.removeChild(this);
		delete this;
	}
});
///////////////////////////////////////////////////////////////////////
//画像ボタンクラス
var IMGBUTTON = enchant.Class.create(enchant.Sprite, {
	initialize: function (x, y, w, h, path, mode){
		
		enchant.Sprite.call(this, w, h);
		this.image = game.assets[path];
		this.x = x;
		this.y = y;

		this.mode = mode;
			
		//タッチされた時の処理
		this.addEventListener('touchstart', function(e) {
			if(this.mode == "setting"){
				displayOption();
			}	
		});
		game.rootScene.addChild(this);
	},
	remove: function (){
		game.rootScene.removeChild(this);
		delete this;
	}
});

///////////////////////////////////////////////////////////////////////
//オプションボタンクラス
var OPTIONBUTTON = enchant.Class.create(enchant.Sprite, {
	initialize: function (init_x, init_y, x, y, w, h, move_mode, path, mode){
		
		enchant.Sprite.call(this, w, h);
		this.p_path = path;
		this.image = game.assets[getOptionPath(path, mode)];
		this.move_mode = move_mode;	//移動モード
		this.toX = x;				//到着予定場所
		this.toY = y;				//到着予定場所
		this.mode = mode;			//load,saveなどのモード
		this.move_flag = 0;			//移動制御フラグ
		//横からくるモード
		if(this.move_mode == "vx"){
			this.x = init_x;
			this.y = y;
			this.vx = 60;
			this.vy = 0;
		}
		//縦からアニメーションするモード
		else{
			this.x = x;
			this.y = init_y;
			this.vx = 0;
			this.vy = 70;
		}
		
			
		//タッチされた時の処理
		this.addEventListener('touchstart', function(e) {
			switch(this.mode){
				case "save":
					option_status = 'hidden';
					displaySaveArea(this.mode);
				break;
				case "load":
					option_status = 'hidden';
					displaySaveArea(this.mode);
				break;
				case "sound_mode":
					switchingSound();
					this.image = game.assets[getOptionPath(this.p_path, this.mode)];
				break;
				case "effect_mode":
					switchingEffect();
					this.image = game.assets[getOptionPath(this.p_path, this.mode)];
				break;
				case "read_mode":
					switchingRead();
					this.image = game.assets[getOptionPath(this.p_path, this.mode)];
				break;
			}
		});

		//アニメーション設定
		this.addEventListener('enterframe', function () {
			if(this.move_flag == 0) {
				this.x += this.vx;
				this.y += this.vy;
			}
			//消すときの動作
			if(this.move_flag == 2) {
				this.x -= 70;
			}

			//目的地に到着したらモードを変更する。
			if((this.move_mode == "vx") && (this.x >= this.toX)){
				this.x = this.toX;
				this.move_flag = 1;
			}
			else if((this.move_mode == "vy") && (this.y >= this.toY)){
				this.y = this.toY;
				this.move_flag = 1;
			}

			//消す時
			if((this.move_flag == 2) && (this.x <= -100)){
				this.remove();
			}

			//もし終了だったら
			if((option_status == 'hidden') && (this.mode != 'save_wnd') && (this.mode != 'load_wnd')){
				this.move_flag = 2;
			}
			//もし終了だったら
			if(option_status == 'hidden_all'){
				this.move_flag = 2;
			}
		});


		game.rootScene.addChild(this);
	},
	remove: function (){
		game.rootScene.removeChild(this);
		delete this;
	}
});
////////////////////////////////////////////////////////////////////////
//オプションクラスを継承して作成
var SAVEWINDOW = enchant.Class.create(OPTIONBUTTON, {
    initialize: function (init_x, init_y, x, y, w, h, move_mode, path, mode, msg, save_name) {
        OPTIONBUTTON.call(this, init_x, init_y, x, y, w, h, move_mode, path, mode);

        this.msg = msg;
        this.save_name = save_name;
        this.f_size = 20;
        this.close_flag = 0;

        this.sel_label= new Label();
		this.sel_label.color = 'white';
		this.sel_label.font = "bold " + this.f_size + "px 'ＭＳ ゴシック'"
		this.sel_label.x = this.x + 5;
		this.sel_label.y = this.y + 5;
		this.sel_label.width = w - this.f_size;
		this.sel_label.text = msg;


        this.addEventListener('enterframe', function () {
        	this.sel_label.x = this.x + 5;
			this.sel_label.y = this.y + 5;
			this.sel_label.text = msg;

			//セーブウィンドウのみのアニメーションスイッチ
			if(option_status == 'close_save'){
				this.move_flag = 2;
				this.sel_label.text = "";
			}
        });
        //ラベルにもイベントリスナー追加（ラベル上をクリックしても反応しないため
		this.addEventListener('touchstart', function(e) {
			if(this.mode == 'save_wnd') save(save_name);
			if(this.mode == 'load_wnd') {
				saveDataLoad(save_name);
			}
		});

		this.sel_label.addEventListener('touchstart', function(e) {
			if(this.mode == 'save_wnd') save(save_name);
			if(this.mode == 'load_wnd') {
				saveDataLoad(save_name);
			}
		});
        game.rootScene.addChild(this.sel_label);

    },
    remove: function (){
		game.rootScene.removeChild(this.sel_label);
		game.rootScene.removeChild(this);
		delete this;
	}
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////画像先行ロード
function initDataLoad(data){
	var max;
	var array_tmp = new Array();
	
	dataUrlGet(data);		//まず全体のＵＲＬ取得
	
	////////BG先行読み込み
	if(bg_load_url.length > PRELOAD_MAX){	//最大１０個読み込み
		max = PRELOAD_MAX;
	}
	else{
		max = bg_load_url.length;
	}
	for(var i = 0; i < max; i++){
		array_tmp.push(bg_load_url[i]);
		bg_load_flag[i] = true;
	}
	bg_current_no = max;
	
	////////キャラ先行読み込み
	if(char_load_url.length > PRELOAD_MAX){	//最大１０個読み込み
		max = PRELOAD_MAX;
	}
	else{
		max = char_load_url.length;
	}
	for(var i = 0; i < max; i++){
		array_tmp.push(char_load_url[i]);
		char_load_flag[i] = true;
	}
	char_current_no = max;

	////////SE先行読み込み
	if(se_load_url.length > PRELOAD_MAX){	//最大１０個読み込み
		max = PRELOAD_MAX;
	}
	else{
		max = se_load_url.length;
	}
	for(var i = 0; i < max; i++){
		array_tmp.push(se_load_url[i]);
		se_load_flag[i] = true;
	}
	se_current_no = max;
	game.preload(array_tmp);
	return;
}

////////////////////////////////////スクリプト内のＵＲＬ取得
function dataUrlGet(data){
	var int_f = 0;
	
	for(var i = 0; i < data.length; i++){
		//Transrate
		var str_tmp = transrateCommand(data[i]);
		var d_cmd= str_tmp.split(" ");		//スペース区切り

		switch(d_cmd[0]){
			case "bg":
				int_f = 0;
				//もし配列に何も入っていなかったら
				if(bg_load_url.length == 0){
					bg_load_url.push(d_cmd[BG_PATH]);
				}
				else{
					for(var j = 0; j < bg_load_url.length; j++){
						if(bg_load_url[j] == d_cmd[BG_PATH]) int_f = 1;		//データが既にあったらダブらせない
					}
					if(int_f == 0){
						bg_load_url.push(d_cmd[BG_PATH]);
					}
				}
			break;
			
			case "title":
				int_f = 0;
				//もし配列に何も入っていなかったら
				if(bg_load_url.length == 0){
					bg_load_url.push(d_cmd[BG_PATH]);
				}
				else{
					for(var j = 0; j < bg_load_url.length; j++){
						if(bg_load_url[j] == d_cmd[BG_PATH]) int_f = 1;		//データが既にあったらダブらせない
					}
					if(int_f == 0){
						bg_load_url.push(d_cmd[BG_PATH]);
					}
				}
			break;
	
			case "char":
				int_f=0;
				if(char_load_url.length == 0){
					char_load_url.push(d_cmd[CHAR_PATH]);
				}
				else{
					for(var j = 0; j < char_load_url.length; j++){
						if(char_load_url[j]==d_cmd[CHAR_PATH]) int_f = 1;	//データが既にあったらダブらせない
					}
					if(int_f == 0){
						char_load_url.push(d_cmd[CHAR_PATH]);
					}
				}
			break;
			
			case "se":
				int_f=0;
				if(se_load_url.length == 0){
					se_load_url.push(d_cmd[SE_PATH]);
				}
				else{
					for(var j = 0; j < se_load_url.length; j++){
						if(se_load_url[j] == d_cmd[SE_PATH]) int_f = 1;	//データが既にあったらダブらせない
					}
					if(int_f == 0){
						se_load_url.push(d_cmd[SE_PATH]);
					}
				}
			break;
		}
		
	}
	return;
}

///////////////////////////////////////////////
//Transrate Japanese Commands to English ones
function transrateCommand(command){
	var array_tmp = command.split("、");	
	var str_tmp = "";
	switch(array_tmp[0]){
			case "■背景":
				str_tmp = "bg";
			break;
		
			case "■タイトル":
				str_tmp = "title";
			break;
			
			case "■キャラ":
				str_tmp = "char";
			break;
			
			case "■キャラ消し":
				str_tmp = "rm";
			break;
			
			case "■音楽":
				str_tmp = "music";
			break;
			
			case "■音楽ストップ":
				str_tmp = "musicstop";
			break;
			
			case "■ジャンプ":
				str_tmp = "goto";
			break;
			
			case "■フラグセット":
				str_tmp = "flagset";
			break;
			
			case "■フラグ計算":
				str_tmp = "flagcal";
			break;
			
			case "■もし":
				str_tmp = "if";
			break;
			
			case "■選択肢":
				str_tmp = "select";
			break;
			
			case "■ウェイト":
				str_tmp = "wait";
			break;
			
			case "■ＳＥ":
				str_tmp = "se";
			break;
			
			case "■シェイク":
				str_tmp = "shake";
			break;
			case "■キャラシェイク":
				str_tmp = "charshake";
			break;
			
			case "■＃":
				str_tmp = "#";
			break;
			
			case "//":
				str_tmp = "//";
			break;
		}

		//もし置き換えが発生していたら変換
		if(str_tmp != ""){
			command = command.replace(/、/g, " ");
			command = command.replace(array_tmp[0], str_tmp);
		}
		return command;
}

///////////////////////////////////////////////////////////////////////
//メッセージ表示クラス
var DEBUGWINDOW = enchant.Class.create(enchant.Sprite, {
	initialize: function (){
		
		enchant.Sprite.call(this, GAME_WIDTH, 200);
		this.x = 20;
		this.y = 20;
		this.f_size = 12;
		this.msg = "";
			
		//アニメーション設定
		this.addEventListener('enterframe', function () {
			this.msg = "";
			this.msg += "char_left : " + game_status['char_left'] + "<br>";
			this.msg += "char_center : " + game_status['char_center'] + "<br>";
			this.msg += "char_right : " + game_status['char_right'] + "<br>";
			this.msg += "bg : " + game_status['bg'] + "<br>";
			this.msg += "bgm : " + game_status['bgm'] + "<br>";
			this.msg += "timer_cnt : " + timer_cnt + "<br>";
			for(var i = 0; i < user_var.length; i++){
				this.msg += i + " = " + user_var[i] + "<br>";
			}
			label.text = this.msg;
		});
		game.rootScene.addChild(this);

		var label= new Label();
		//label.color = 'white';
		label.font = "" + this.f_size + "px 'ＭＳ ゴシック'"
		label.x = this.x;
		label.y = this.y;
		label.width = this.width;
		label.text = "";
		game.rootScene.addChild(label);
	},
	text: function (msg){
		this.msg = msg;
	}
});