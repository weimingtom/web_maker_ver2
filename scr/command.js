var VERSION="ver2.0";		//バージョン情報
	

var FPS = 20;					//20msおきに描画
var GAME_WIDTH = 640;			//ゲーム横サイズ
var GAME_HEIGHT = 800;		//ゲームたてサイズ
var FILL_COLOR="#FFFFFF";	//文字の色
var ST_COLOR="#5588aa";		//文字の周りの色

var split_word="#end#";		//文章の終了文字
var buf_pre_max=10;			//先行ロード枚数

var buf_img_max=100;		//キャラは１００枚まで
var buf_bg_max=50;			//背景は５０枚まで
var se_max=50;				//SEも５０個まで

var bgm_volume=0.5;			//ＢＧＭボリューム(0.0 ~ 1.0)
var se_volume=0.5;			//ＳＥボリューム(0.0 ~ 1.0)

var timer_cnt=600;			//起動時の待ち時間・先行ロード待ち（20ms*600=12000ms）

var back_log_x=100;			//バックログの横文字の数
var back_log_y=20;			//バックログの表示行数

//ここまで


var BG_HOWTO=1;			//コマンドＢＧの方法
var BG_PATH=2;			//コマンドＢＧのパス

var CHAR_HOWTO=2;
var CHAR_PATH=3;
var CHAR_POS=1;

var CHAR_L_F=0;
var CHAR_C_F=1;
var CHAR_R_F=2;

var FADE_SPEED = 500;

var MSG_X=20;
var MSG_Y=510;
var MSG_W=750;

var LETTER_W=24;

var BGM_PATH=1;

var VAR_LETTER=1;
var VAR_NUM=2;

var VAR_C_F=2;
var VAR_C_NUM=3;
var VAR_IF_HATA=4;

var SEL_MSG=0;
var SEL_HATA=1;

var SEL_X=150;
var SEL_Y=140;
var SEL_H=40;
var SEL_PADDING=10;

var TIME_NUM=1;

var SAVE_MAX = 5;			//セーブ領域最大値
var SAVE_EVENTFLAG=0;
var SAVE_CHAR_L=1;
var SAVE_CHAR_C=2;
var SAVE_CHAR_R=3;
var SAVE_BG=4;
var SAVE_BGM=5;
var SAVE_USER_VAL=6;
var SAVE_DATE=16;
var SAVE_SENTENSE=17;

var SE_PATH=1;

var OPT_BGM_VOL=0;
var OPT_SE_VOL=1;
var OPT_KIDOKU=2;

var KIDOKU_check="";

var c_save_char = ","



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////オプション

//////////////////////////////////////////////////////オプション決定

function option_save(){
	var bg_v=document.getElementById("bgm_vol").value;
	var se_v=document.getElementById("se_vol").value;
	var s="";

	if(bg_v.match(/^[0-9]+$/)!=false){	//数字か確認
		bg_v=parseInt(bg_v);
		if(bg_v>10) bg_v=10;
		bg_v=bg_v/10;
	}else{
		bg_v=0.5;
	}
	bgm_volume=bg_v;
	document.getElementById("bgm").volume=bgm_volume;	//BGMのボリューム設定

	if(se_v.match(/^[0-9]+$/)!=false){	//数字か確認
		se_v=parseInt(se_v);
		if(se_v>10) se_v=10;
		se_v=se_v/10;
	}else{
		se_v=0.5;
	}
	se_volume=se_v;

	if(document.getElementById("kidoku_checkbox").checked){
		skip_switch=1;
		skip_mode=1;
	}else{
		skip_switch=0;
		skip_mode=0;
	}

	s=""+bg_v+c_save_char+se_v+c_save_char+skip_switch;

	setCookie("option",s);	//クッキーを更新
	alert("設定を保存しました。");
	scrollbar_y=getScrollPosition();	//スクロールバーの位置を取得しておく
	footer_redraw();	//下のアイコンを描画
	returnCancel();		//オプションを消す
	return;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////バックログ出力
function draw_back_log(){
	var t;

	if(back_log_f==0){
		back_log_f=1;	//バックログ表示フラグを１に
		t='<textarea cols='+back_log_x+' rows='+back_log_y+'>';
		t+=back_log;
		t+='</textarea>';
		document.getElementById("back_log").innerHTML=t;
		
	}else{
		back_log_f=0;
		document.getElementById("back_log").innerHTML="";
	}
	scrollbar_y=getScrollPosition();	//スクロールバーの位置を取得しておく
	footer_redraw();
	return;
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////
//表示領域作成。type = save or load
function makeSaveList(no, type){
	var str_tmp = "";
	var str_msg = "";
	str_tmp = "save_data" + no;

	try{
		var array_tmp = JSON.parse(localStorage.getItem(str_tmp));
	} catch(e) {
		storageError();
		return;
	}
	//str_msg += '<div onClick="' + type + '(\''+str_tmp+'\')">';
	if(array_tmp == null){
		str_msg += "なし";
	}else{
		str_msg += str_tmp + "<br>" + array_tmp['timestamp'] + "<br>" + array_tmp['msg'];
	}


	return str_msg;
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////画像先行ロード
/////////////////////////
//Count onLoad
function imgInitOnload(msg){
	switch(msg){
		case "char":
			buf_img_loaded_cnt++;
		break;
		case "bg":
			buf_bg_loaded_cnt++;
		break;
	}
	return;
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////選択肢選択モード
//選択肢
function selectItem(){
	var i;
	var c = 0;
	var ok_flag = 0;
	var x = 70;
	var y = 0;

	click_flag = false;
	select_flag = event_flag;	//セレクトフラグに今の行を入れる
	game_status['skip_mode'] = false;	//スキップ一旦ストップ
	
	event_flag++;

	for(i = 0; i < SEL_MAX + 1; i++){
		d_cmd = data[event_flag].split(" ");		//スペース区切り
		if((d_cmd[SEL_MSG] == "selectend")||(d_cmd[SEL_MSG] == "■選択肢終わり")){
			ok_flag = 1;
			break;
		}
		y = (i * 80) + 50;
		sel_wnd[i] = new SELWINDOW(x, y, d_cmd[SEL_MSG], d_cmd[SEL_HATA]);
		event_flag++;
	}

	if(ok_flag == 0){		//エラーメッセージ
		var s = event_flag+"選択肢終了コマンド「selectend」または「■選択肢終わり」がありません。";
		alert(s);
		return;
	}

	event_flag = select_flag;	//セレクトの最初の行に戻す。（セーブ用）
	return;
}
////////////////////////////////////////////////
//選択肢実行
function execSelect(hata){
	click_flag = true;

	for(var i = 0; i < sel_wnd.length; i++){
		sel_wnd[i].remove();
	}
	sel_wnd = new Array();

	var ok_flag = goto_return(hata);
	clickSelector();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////wait
/////////////////////////////////////////////////////waitコマンド登録
function waitTime(cnt){
	timer_cnt = parseInt(cnt / DEFAULT_FPS);
	//char_cut_anime();
	return;
}
function t_wait(){
	var f = false;
	click_flag = false;
	timer_cnt--;
	if(timer_cnt <= 0){
		timer_cnt = 0;
		click_flag = true;
		f = true;
	}
	else{
		
	}
	return f;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//ifコマンド
function ifCmd(d_cmd){
	var if_flag=0;
	var n,h_n;
	
	//被数が変数だった場合
	if(d_cmd[VAR_C_NUM].match(/[ABCDEFGHIJ]/)){
		h_n = user_L_to_N(d_cmd[VAR_C_NUM]);
		n = user_var[h_n];
	}else{
		n = parseInt(d_cmd[VAR_C_NUM]);
	}
	
	var l = user_L_to_N(d_cmd[VAR_LETTER]);
	
	if(l == -1){	//変数が間違っている場合。
		var s;
		s = event_flag+"行目--変数："+d_cmd[VAR_LETTER]+"\n変数が正しくありません。変数はAからJまでです。";
		alert(s);
		return;
	}
	
	switch(d_cmd[VAR_C_F]){
		case ">":
			if(user_var[l]>n) if_flag=1;
		break;
		case "<":
			if(user_var[l]<n) if_flag=1;
			break;
		case "=":
			if(user_var[l]==n) if_flag=1;
			break;
		case "!=":
			if(user_var[l]!=n) if_flag=1;
			break;
		case ">=":
			if(user_var[l]>=n) if_flag=1;
			break;
		case "<=":
			if(user_var[l]<=n) if_flag=1;
		break;
	}
	
	//条件に合っていたら
	if(if_flag == 1){
		var goto_flag = d_cmd[VAR_IF_HATA];		//探す旗を退避
		var ok_f = goto_return(goto_flag);		//ジャンプ
		
		return;
	}
	
	return;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////フラグ計算
function flagCal(d_cmd){
	var n,h_n;
	
	//被数が変数だった場合
	if(d_cmd[VAR_C_NUM].match(/[ABCDEFGHIJ]/)){
		h_n = user_L_to_N(d_cmd[VAR_C_NUM]);
		n = user_var[h_n];
	}else{
		n = parseInt(d_cmd[VAR_C_NUM]);
	}
	
	var l = user_L_to_N(d_cmd[VAR_LETTER]);
	
	if(l == -1){	//変数が間違っている場合。
		var s;
		s = event_flag+"行目--変数："+d_cmd[VAR_LETTER]+"\n変数が正しくありません。変数はAからJまでです。";
		alert(s);
		return;
	}
	
	switch(d_cmd[VAR_C_F]){
		case "+":
			user_var[l] = user_var[l]+n;
		break;
		case "-":
			user_var[l] = user_var[l]-n;
		break;
		case "*":
			user_var[l] = user_var[l]*n;
		break;
		case "/":
			user_var[l] = user_var[l]/n;
			parseInt(user_var[l]);
		break;
		case "%":
			user_var[l] = user_var[l]%n;
		break;
	
	}
	return;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////ユーザ変数に値代入
function flagSet(d_cmd){
	var n,h_n;
	
	//被数が変数だった場合
	if(d_cmd[VAR_NUM].match(/[ABCDEFGHIJ]/)){
		h_n = user_L_to_N(d_cmd[VAR_NUM]);
		n = user_var[h_n];
	}else{
		n = parseInt(d_cmd[VAR_NUM]);
	}
	
	var l = user_L_to_N(d_cmd[VAR_LETTER]);
	
	if(l == -1){	//変数が間違っている場合。
		var s;
		s = event_flag+"行目--変数："+d_cmd[VAR_LETTER]+"\n変数が正しくありません。変数はAからJまでです。";
		alert(s);
		return;
	}
	
	user_var[l] = n;
	return;
}

//////////////////////////////////////////変数の文字を数字に置き換え
function user_L_to_N(c){
	var n=-1;
	
	switch(c){
	case "A":
		n=0;
	break;
	case "B":
		n=1;
	break;
	case "C":
		n=2;
	break;
	case "D":
		n=3;
	break;
	case "E":
		n=4;
	break;
	case "F":
		n=5;
	break;
	case "G":
		n=6;
	break;
	case "H":
		n=7;
	break;
	case "I":
		n=8;
	break;
	case "J":
		n=9;
	break;
	}
	
	return n;
	
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////














////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////gotoコマンド
function gotoCmd(d_cmd){
	var ok_f=0;
	
	var goto_flag = d_cmd[1];		//探す旗を退避
	ok_f = goto_return(goto_flag);
	
	
	return;
}

///////////////////////////////////////////goto実体
function goto_return(goto_f){
	var ok_f = 0;
	var no = 0;
	for(var i = 0; i < data.length; i++){
		
		var d_cmd = data[i].split(" ");		//スペース区切り
		if((d_cmd[0] == "#") && (goto_f == d_cmd[1])){
			event_flag = i;				//進行フラグ書き換え
			ok_f = 1;
			break;
		}else{
			d_cmd = data[i].split("、");		//句読点区切り
			if((d_cmd[0] == "■＃") && (goto_f == d_cmd[1])){
				event_flag = i;				//進行フラグ書き換え
				ok_f = 1;
				break;
			}	
		}
	}
	
	if(ok_f == 0){		//エラーのとき
		var s;
		s = "ハタ：" + goto_f + "\nハタが見つかりません";
		alert(s);
	}
	else{
		loadPreload(event_flag);
	}
	
	return ok_f;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////










///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////SEプレイ
function sePlay(d_cmd){
	var se_num;
	if(!game_status['sound_mode']) return;

	//se_src[se_num].loop=false;
	//se_src[se_num].volume=se_volume;
	game.assets[d_cmd[SE_PATH]].play();
	
	return;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////BGMコマンド
function bgmStart(d_cmd){
	var s=new Array();
	s = d_cmd[BGM_PATH].split(".");	//拡張子前で切る。
		
	if(game_status['sound_mode']){
		document.getElementById("bgm").autoplay = true;
	}
	else{
		return;
	}
	document.getElementById("bgm").volume = bgm_volume;
	document.getElementById("bgm").loop = true;

	var canPlayOgg = ("" != document.getElementById("bgm").canPlayType("audio/ogg"));
	var canPlayMp3 = ("" != document.getElementById("bgm").canPlayType("audio/mpeg"));

	switch(s[1]){
	case "ogg" :
		if(canPlayOgg){		// oggをサポートしている
			document.getElementById("bgm").src = d_cmd[BGM_PATH];
			game_status['bgm'] = d_cmd[BGM_PATH];
		}
		else{				// mp3をサポートしている
			var p = s[0] + ".mp3";
			document.getElementById("bgm").src = p;
			game_status['bgm'] = p;
		}
	break;
	
	case "mp3" :
		if(canPlayMp3){		// mp3をサポートしている
			document.getElementById("bgm").src = d_cmd[BGM_PATH];
			game_status['bgm'] = d_cmd[BGM_PATH];
		}else{				// oggをサポートしている
			var p = s[0] + ".ogg";
			document.getElementById("bgm").src=p;
			game_status['bgm'] = p;
		}
	break;
	}
    
	return;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////再生を停止
function bgmStop(d_cmd){
	document.getElementById("bgm").pause();
	return;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////











/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////キャラ消しコマンド
function charRm(d_cmd){
	var mode = "";

	charFlagReset(d_cmd[CHAR_POS]);
			
	///////////////////////////////////////////

	if((d_cmd['CHAR_HOWTO'] == 'c') || (d_cmd['CHAR_HOWTO'] == 'cut') || (d_cmd['CHAR_HOWTO'] == 'カット')){
		mode = "cut";
	}
	else if((d_cmd['CHAR_HOWTO'] == 'f') || (d_cmd['CHAR_HOWTO'] == 'fade') || (d_cmd['CHAR_HOWTO'] == 'フェード')){
		mode = "fade";
	}
	else{
		mode = "fade";
	}
	////////////////////////////////////////////
	if(!game_status['effect_mode']) mode = "cut";		//エフェクトモードが０のときは強制的にカット
	if((game_status['skip_mode']) && (read_flag[event_flag]) == 1) mode = "cut";		//エフェクトモードが０のときは強制的にカット

	sub_screen.redraw(mode);
	
	return;
}
/////////////////////////////////////
//



/////////////////////////////////////キャラフラグリセット
function charFlagReset(pos){

	if((pos == "l") || (pos == "left") || (pos == "左")){
		game_status['char_left'] = "";
	}
	else if((pos == "c") || (pos == "center") || (pos == "中央")){
		game_status['char_center'] = "";
	}
	else if((pos == "r") || (pos == "right") || (pos == "右")){
		game_status['char_right'] = "";
	}
	else if((pos == "a") || (pos == "all") || (pos == "全員")){
		game_status['char_left'] = "";
		game_status['char_right'] = "";
		game_status['char_center'] = "";
	}
	else{
		game_status['char_left'] = "";
		game_status['char_right'] = "";
		game_status['char_center'] = "";
	}
	
	
	return;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////









/////////////////////////////////////////////////////ＵＲＬ検索
function urlSearch(array_tmp, path){
	var s_f = -1;
	
	for(var i = 0; i < array_tmp.length; i++){
		if(path == array_tmp[i]){
			s_f = i;
			break;
		}
	}
	return s_f;
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////shakeアニメ
function shake_init(d_cmd, mode){
	click_flag = false;
	var shake_time = "";
	var shake_pos = "";
	var shake_flag = 0;

	if(mode == "char"){
		shake_time = d_cmd[2];
		if((d_cmd[1] == "left") || (d_cmd[1] == "左")){
			shake_pos ="left";
		}
		else if((d_cmd[1] == "center") || (d_cmd[1] == "中央")){
			shake_pos ="center";
		}
		else if((d_cmd[1] == "right") || (d_cmd[1] == "右")){
			shake_pos ="right";
		}

	}
	else {
		shake_time = d_cmd[1];
		shake_pos = "bg";
	}


	switch(shake_time){
	case "一瞬":
		shake_flag=10;
	break;
	case "普通":
		shake_flag=50;
	break;
	case "長い":
		shake_flag=100;
	break;
	case "instant":
		shake_flag=10;
	break;
	case "nomal":
		shake_flag=50;
	break;
	case "long":
		shake_flag=100;
	break;
	default :
		shake_flag=10;
	break;
	
	}
	
	sub_screen.setShake(shake_pos, shake_flag);
	
	return;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////キャラコマンド
function charLoad(d_cmd){

	var img_num;
	var mode = "";
	click_flag = false;
	//var img_data=new Image();
	//img_data.src=d_cmd[CHAR_PATH];
	img_num = urlSearch(char_load_url, d_cmd[CHAR_PATH]);
	
	
	//	例外
	if((!char_load_flag[img_num]) && (!preload_flag)) {	//なかった場合
		game.load(char_load_url[img_num], function() {
			//ロードが終わった時の処理
			char_load_flag[img_num] = true;
			char_current_no = img_num;
			sub_screen.redraw("cut");
		});
	}
	

	

	if((d_cmd[CHAR_POS] == "l") || (d_cmd[CHAR_POS] == "left") || (d_cmd[CHAR_POS] == "左")){
		game_status['char_left'] = d_cmd[CHAR_PATH];
	}
	else if((d_cmd[CHAR_POS] == "c") || (d_cmd[CHAR_POS] == "center") || (d_cmd[CHAR_POS] == "中央")){
		game_status['char_center'] = d_cmd[CHAR_PATH];
	}
	else if((d_cmd[CHAR_POS] == "r") || (d_cmd[CHAR_POS] == "right") || (d_cmd[CHAR_POS] == "右")){
		game_status['char_right'] = d_cmd[CHAR_PATH];
	}
	else{
		game_status['char_center'] = d_cmd[CHAR_PATH];
	}
		
		
	///////////////////////////////////////////

	if((d_cmd['CHAR_HOWTO'] == 'c') || (d_cmd['CHAR_HOWTO'] == 'cut') || (d_cmd['CHAR_HOWTO'] == 'カット')){
		mode = "cut";
	}
	else if((d_cmd['CHAR_HOWTO'] == 'f') || (d_cmd['CHAR_HOWTO'] == 'fade') || (d_cmd['CHAR_HOWTO'] == 'フェード')){
		mode = "fade";
	}
	else{
		mode = "fade";
	}
	////////////////////////////////////////////
	if(!game_status['effect_mode']) mode = "cut";		//エフェクトモードが０のときは強制的にカット
	if((game_status['skip_mode']) && (read_flag[event_flag]) == 1) mode = "cut";		//エフェクトモードが０のときは強制的にカット
	
	sub_screen.redraw(mode);
	
	return;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////ＢＧコマンド
function bgLoad(d_cmd){
	var mode = "";
	click_flag = false;
	charFlagReset("all");
	
	var img_num = urlSearch(bg_load_url, d_cmd[BG_PATH]);

	//	例外
	if((!bg_load_flag[img_num]) && (!preload_flag) ){	//なかった場合
		game.load(bg_load_url[img_num], function() {
			//ロードが終わった時の処理
			bg_load_flag[img_num] = true;
			bg_current_no = img_num;
		});
	}
	

	game_status['bg'] = d_cmd[BG_PATH];			//現在のURLを保持
	
	if((d_cmd[BG_HOWTO] == "c") || (d_cmd[BG_HOWTO] == "cut") || (d_cmd[BG_HOWTO] == "カット")){
		mode = "cut";
	}
	else if((d_cmd[BG_HOWTO] == "w") || (d_cmd[BG_HOWTO] == "wipe") || (d_cmd[BG_HOWTO] == "ワイプ")){
		mode = "wipe";
	}
	else if((d_cmd[BG_HOWTO] == "f") || (d_cmd[BG_HOWTO] == "fade") || (d_cmd[BG_HOWTO] == "フェード")){
		mode = "fade";
	}
	else{
		mode = "fade";
	}
	if(!game_status['effect_mode']) mode = "cut";		//エフェクトモードが０のときは強制的にカット
	if((game_status['skip_mode']) && (read_flag[event_flag]) == 1) mode = "cut";		//エフェクトモードが０のときは強制的にカット

	sub_screen.redraw(mode);
	
	return;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////タイトルコマンド
function titleLoad(d_cmd){
	var mode = "";
	click_flag = false;
	
	var img_num = urlSearch(bg_load_url, d_cmd[BG_PATH]);

	//	例外
	if((!bg_load_flag[img_num]) && (!preload_flag) ){	//なかった場合
		game.load(bg_load_url[img_num], function() {
			//ロードが終わった時の処理
			bg_load_flag[img_num] = true;
			bg_current_no = img_num;
		});
	}

	if((d_cmd[BG_HOWTO] == "c") || (d_cmd[BG_HOWTO] == "cut") || (d_cmd[BG_HOWTO] == "カット")){
		mode = "cut";
	}
	else if((d_cmd[BG_HOWTO] == "w") || (d_cmd[BG_HOWTO] == "wipe") || (d_cmd[BG_HOWTO] == "ワイプ")){
		mode = "wipe";
	}
	else if((d_cmd[BG_HOWTO] == "f") || (d_cmd[BG_HOWTO] == "fade") || (d_cmd[BG_HOWTO] == "フェード")){
		mode = "fade";
	}
	else{
		mode = "fade";
	}
	if(!game_status['effect_mode']) mode = "cut";		//エフェクトモードが０のときは強制的にカット
	if((game_status['skip_mode']) && (read_flag[event_flag]) == 1) mode = "cut";		//エフェクトモードが０のときは強制的にカット

	var titlebuff = new TITLESCREEN(d_cmd[BG_PATH]);
	
	return;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////タイトルコマンド
function title_load(){
	var i;
	var img_num;
	char_flag_reset();	//背景ロード時、キャラフラグリセット
	title_mode=1;
	
	//var img_data=new Image();
	//img_data.src=d_cmd[BG_PATH];

	
	img_num=bg_url_search();
	
	//	例外
	if(img_num==-1){	//なかった場合
		for(i=0;i< buf_bg_cnt;i++){
			if(d_cmd[BG_PATH]==buf_bg_url[i]){
				buf_load_bg[i].src=d_cmd[BG_PATH];
				img_num=i;
				break;
			}
		}
	}
	
		current_bg_url=buf_bg_url[img_num];		//現在のURLを保持
		
		if(effect_f==0) d_cmd[BG_HOWTO]="cut";		//エフェクトモードが０のときは強制的にカット
	
		switch(d_cmd[BG_HOWTO]){
			case "c":
				bgFadeSetting(buf_load_bg[img_num].src, 0);
				repeat_flag=0;
				break;
			case "cut":
				bgFadeSetting(buf_load_bg[img_num].src, 0);
				repeat_flag=0;
				break;
			case "カット":
				bgFadeSetting(buf_load_bg[img_num].src, 0);
				repeat_flag=0;
				break;
		
			case "w":
				wipeSetting(buf_load_bg[img_num].src, FADE_SPEED);
				repeat_flag=0;
				break;
			case "wipe":
				wipeSetting(buf_load_bg[img_num].src, FADE_SPEED);
				repeat_flag=0;
				break;
			case "ワイプ":
				wipeSetting(buf_load_bg[img_num].src, FADE_SPEED);
				repeat_flag=0;
				break;
		
			case "f":
				bgFadeSetting(buf_load_bg[img_num].src, FADE_SPEED);
				repeat_flag=0;
				break;
			case "fade":
				bgFadeSetting(buf_load_bg[img_num].src, FADE_SPEED);
				repeat_flag=0;
				break;
			case "フェード":
				bgFadeSetting(buf_load_bg[img_num].src, FADE_SPEED);
				repeat_flag=0;
				break;
		
			default:
				bgFadeSetting(buf_load_bg[img_num].src, FADE_SPEED);
				repeat_flag=0;
				break;
	
		}
	
		bg_init_load(2);	//先読み込み
	return;
}


//////////////////////////////////////////////
//現在の位置から指定枚画像を読み込む
function preloadImg(no, mode, max){
	if(mode == "char"){
		//MAX回の先行読み込み
		char_current_no = no;
		for(var i = no; i < no + max; i++){
			if(i < char_load_url.length){
				//読込されていない場合、読み込む
				if(!char_load_flag[i]){
					game.load(char_load_url[i], function() {
						//ロードが終わった時の処理
						char_load_flag[i] = true;
					});
				}
				char_current_no++;
			}
			else{
				//配列以上になったらブレイク
				break;
			}
		}

	}

	////////////////////////////////
	if(mode == "bg"){
		//MAX回の先行読み込み
		bg_current_no = no;
		for(var i = no; i < no + max; i++){
			if(i < bg_load_url.length){
				//読込されていない場合、読み込む
				if(!bg_load_flag[i]){
					game.load(bg_load_url[i], function() {
						//ロードが終わった時の処理
						bg_load_flag[i] = true;
					});
				}
				bg_current_no++;
			}
			else{
				//配列以上になったらブレイク
				break;
			}
		}

	}

	////////////////////////////////
	if(mode == "se"){
		//MAX回の先行読み込み
		se_current_no = no;
		for(var i = no; i < no + max; i++){
			if(i < se_load_url.length){
				//読込されていない場合、読み込む
				if(!se_load_flag[i]){
					game.load(se_load_url[i], function() {
						//ロードが終わった時の処理
						se_load_flag[i] = true;
					});
				}
				se_current_no++;
			}
			else{
				//配列以上になったらブレイク
				break;
			}
		}

	}

	return;
}
///////////////////////////////////
//先読み
function nextCharLoad(){
	if(char_current_no < char_load_url.length){
		//読み込まれていない場所なら
		if(!char_load_flag[char_current_no]){
			preload_flag = true;
			game.load(char_load_url[char_current_no], function() {
				//ロードが終わった時の処理
				char_load_flag[char_current_no] = true;
				char_current_no++;
				preload_flag = false;
			});
		}
		else{
			//もし読み込み場所がTrueならFalseの場所を探す
			for(var i = 0; i < char_load_url.length; i++){
				if(!char_load_flag[i]){
					preload_flag = true;
					game.load(char_load_url[i], function() {
						//ロードが終わった時の処理
						char_load_flag[i] = true;
						char_current_no = i + 1;
						preload_flag = false;
					});
					break;
				}
			}
		}
	}
	return;
}
///////////////////////////////////
//先読み
function nextBgLoad(){
	if(bg_current_no < bg_load_url.length){
		//読み込まれていない場所なら
		if(!bg_load_flag[bg_current_no]){
			preload_flag = true;
			game.load(bg_load_url[bg_current_no], function() {
				//ロードが終わった時の処理
				bg_load_flag[bg_current_no] = true;
				bg_current_no++;
				preload_flag = false;
			});
		}
		else{
			//もし読み込み場所がTrueならFalseの場所を探す
			for(var i = 0; i < bg_load_url.length; i++){
				if(!bg_load_flag[i]){
					preload_flag = true;
					game.load(bg_load_url[i], function() {
						//ロードが終わった時の処理
						bg_load_flag[i] = true;
						bg_current_no = i + 1;
						preload_flag = false;
					});
					break;
				}
			}
		}
		
	}
	return;
}
///////////////////////////////////
//先読み
function nextSeLoad(){
	if(se_current_no < se_load_url.length){
		//読み込まれていない場所なら
		if(!se_load_flag[se_current_no]){
			preload_flag = true;
			game.load(se_load_url[se_current_no], function() {
				//ロードが終わった時の処理
				se_load_flag[se_current_no] = true;
				se_current_no++;
				preload_flag = false;
			});
		}
		else{
			//もし読み込み場所がTrueならFalseの場所を探す
			for(var i = 0; i < se_load_url.length; i++){
				if(!se_load_flag[i]){
					preload_flag = true;
					game.load(se_load_url[i], function() {
						//ロードが終わった時の処理
						se_load_flag[i] = true;
						se_current_no = i + 1;
						preload_flag = false;
					});
					break;
				}
			}
		}
		
	}
	return;
}

