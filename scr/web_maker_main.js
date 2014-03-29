enchant();

var DEBUG_MODE = 1;			//デバッグモード

var GAME_WIDTH =	640;		//Game width
var GAME_HEIGHT =	800;		//Game height
var GAME_MAIN_HEIGHT = 600;		//Game screen height

var game;						//game object
var DEFAULT_FPS = 30;			//Frame rate
var PRELOAD_MAX = 10;			//Max number of preload.

var event_flag = 0;				//It saves a line number in scenario file.
var user_var = new Array();		//Its are user varibles.
var USER_VAR_MAX = 10;			//Max size of user varibles.

var read_flag = new Array();	//Read flags

var click_flag = true;			//Click control

var data = new Array();

var msg_wnd;
var sub_screen;

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

		var main_screen = new MAINSCREEN();
		sub_screen = new SUBSCREEN(main_screen);
		msg_wnd = new MSGWINDOW();


		game.rootScene.addEventListener(Event.TOUCH_START, function(e) {
				clickSelector(main_screen);
		});
		//メインを登録
		game.rootScene.addEventListener('enterframe',main);
		clickSelector(main_screen);
	};

	game.start();
	
	//option_load();
};


//////////////////////////////////////////////
//Game loop
function main(){

}

/////////////////////////////////////////////////クリックロック時は何もしない(クリック実態）
function clickSelector(main_screen){
	if(click_flag){

		mainEvent(main_screen);
	}
	else{

	}
	return;
}
////////////////////////////////////////////////////////////////////////////////
//メインのイベント処理
function mainEvent(main_screen, sub_screen){

	if((game_status['skip_mode']) && (read_flag[event_flag] == 0)) skip_mode = false;	//未読だった場合、スキップモードをオフに
	
	var str_tmp = transrateCommand(data[event_flag]);
	var d_cmd= str_tmp.split(" ");		//スペース区切り
	read_flag[event_flag] = 1;			//既読フラグon

	switch(d_cmd[0]){
		case "bg":
			//char_cut_anime();
			bgLoad(d_cmd);
		break;
		case "title":
			//char_cut_anime();
			title_load(d_cmd);
		break;
	
		case "char":
			//char_cut_anime();
			charLoad(d_cmd);
		break;
		
		case "rm":
			//char_cut_anime();
			charRm(d_cmd);
		break;
		
		case "music":
			bgm_start(d_cmd);
		break;
		
		case "musicstop":
			bgm_stop(d_cmd);
		break;
		
		case "goto":
			goto_cmd(d_cmd);
		break;
		
		case "flagset":
			flag_set(d_cmd);
		break;
		
		case "flagcal":
			flag_cal(d_cmd);
		break;
		
		case "if":
			if_cmd(d_cmd);
		break;
		
		case "select":
			select_item(d_cmd);
		break;
		
		case "wait":
			wait_time(parseInt(d_cmd[TIME_NUM]));
			click_flag=-1;
		break;
		
		case "se":
			se_play(d_cmd);
		break;
		case "shake":
			shake_init(d_cmd);
		break;
		case "charshake":
			char_shake_init(d_cmd);
		break;
		
		case "#":
			repeat_flag　=　1;
		break;
		
		case "//":
			repeat_flag　=　1;
		break;

		//コマンドではないならメッセージ表示
		default:
			msg_wnd.msg = data[event_flag];
		break;
	}
	

	
	event_flag++;		//イベントフラグをインクリメント
	
	//if((skip_switch==1)&&(skip_mode==1)) repeat_flag=1;	//既読スキップモード時
	return;
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
		this.opacity = 0;
		this.animationFlag = "none";
		this.main_screen = main_screen;
		//アニメーション設定
		this.addEventListener('enterframe', function (main_screen) {
			//フェード
			if(this.animationFlag == "fade"){
				this.opacity += 0.1;
				if(this.opacity >= 1.0) this.end();
			}
			else if(this.animationFlag == "cut"){
				this.opacity = 1;
				this.end();
			}
		});
		game.rootScene.addChild(this);
	},
	end: function(){
		this.main_screen.redraw(this.image);
		this.opacity = 0;
		click_flag = true;
		this.animationFlag = "none";
		clickSelector();
	},
	redraw: function (howto){
		var suf = new Surface(GAME_WIDTH, GAME_MAIN_HEIGHT);
		suf.draw(game.assets[game_status['bg']]);
		
		if(game_status['char_left'] != ""){
			//20%ずらす。
			var x = 0 - (game.assets[game_status['char_left']].width * 0.2);
			suf.draw(game.assets[game_status['char_left']], x, 0);
		}

		if(game_status['char_center'] != ""){
			var x = (GAME_WIDTH - game.assets[game_status['char_center']].width) / 2;
			
			suf.draw(game.assets[game_status['char_center']], x, 0);
		}

		if(game_status['char_right'] != ""){
			//20%ずらす。
			var x = GAME_WIDTH - game.assets[game_status['char_right']].width + 
				(game.assets[game_status['char_right']].width * 0.2);
			
			suf.draw(game.assets[game_status['char_right']], x, 0);
		}
		
		this.image = suf;
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
		label.text = "aaaaaaaaa";
		game.rootScene.addChild(label);
	},
	txt: function (msg){
		//this.label = msg;
	}
});

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