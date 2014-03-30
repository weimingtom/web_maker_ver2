enchant();

var DEBUG_MODE = true;			//デバッグモード

var GAME_WIDTH =	640;		//Game width
var GAME_HEIGHT =	800;		//Game height
var GAME_MAIN_HEIGHT = 600;		//Game screen height

var game;						//game object
var DEFAULT_FPS = 30;			//Frame rate
var PRELOAD_MAX = 20;			//Max number of preload.

var event_flag = 0;				//It saves a line number in scenario file.
var user_var = new Array();		//Its are user varibles.
var USER_VAR_MAX = 10;			//Max size of user varibles.

var read_flag = new Array();	//Read flags

var click_flag = true;			//Click control
var timer_cnt = 0;				//Use wait command

var data = new Array();

var msg_wnd;
var main_screen;
var sub_screen;
var debug_wnd;

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

	game.preload('data/sys/msg_wnd.png');
	initDataLoad(data);	//先行ロード

	game.onload = function(){

		main_screen = new MAINSCREEN();
		sub_screen = new SUBSCREEN(main_screen);
		msg_wnd = new MSGWINDOW();
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

	if((game_status['skip_mode']) && (read_flag[event_flag] == 0)) skip_mode = false;	//未読だった場合、スキップモードをオフに
	read_flag[event_flag] = 1;			//既読フラグon

	switch(d_cmd[0]){
		case "bg":
			bgLoad(d_cmd);
		break;
		case "title":
			title_load(d_cmd);
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
			select_item(d_cmd);
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
	

	
	event_flag++;		//イベントフラグをインクリメント
	
	//if((skip_switch==1)&&(skip_mode==1)) repeat_flag=1;	//既読スキップモード時
	return repeat_flag;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
			label.text = this.msg;
		});
		game.rootScene.addChild(this);

		var label= new Label();
		label.color = 'white';
		label.font = "" + this.f_size + "px 'ＭＳ ゴシック'"
		label.x = this.x + 5;
		label.y = this.y + 12;
		label.width = this.width - 60;
		label.text = "";
		game.rootScene.addChild(label);
	},
	text: function (msg){
		
		this.msg = replaceCaractor(msg);
	}
});
/////////////////////////////////
//Replace charactors
function replaceCaractor(msg){
	msg = msg.replace("】","】<br>");
	msg = msg.replace(/＠/g,"<br>");
	return msg;
}

//////////////////////////////////ストーリーデータをｊｓで運用するときのコード
function dataLoad(){
	var data = file_data;	//シナリオデータ読み込み

	//データの余計な部分を削除
	//data.splice(0,2);
	for(var i = 0; i < data.length; i++){
		data[i] = data[i].replace(/\r/g,"");	//改行削除
		data[i] = data[i].replace(/\n/g,"");
		//data[i] = exchangeStr(data[i]);
		
		if(data[i] == ""){
			data.splice(i,1);	//空白行削除
			i--;				//文字も次も空白の場合に飛ばされるのを防ぐ
		}
	}

	return data;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////画像先行ロード
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