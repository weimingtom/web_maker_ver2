enchant();

var game_start_flag = 1;		//game_start_flag

var browser_type="IE";		//ブラウザの種類



var data=new Array();		//文章データ
var d_cmd=new Array();
var kidoku=new Array();	//既読のフラグ保存
var click_flag=-1;		//クリック制御
var event_flag=0;		//イベント進行フラグ
var repeat_flag=0;		//コマンド実行後に下の一行を自動再生するか
var title_mode=0;		//タイトルモード
var exe_flag=0;			//コマンドを実行したかどうか
var skip_switch=0;		//既読スキップモードフラグ
var skip_mode=0;		//その行が既読かどうか
var back_log="";		//バックログ
var back_log_f=0;		//バックログ表示フラグ
var auto_read_f=0;		//オートリードフラグ
var sound_f=1;			//音楽フラグ
var effect_f=1;			//エフェクトフラグ
var erese_wnd_f=0;		//メッセージウィンドウがきえているか
var msg_save="";		//現在のメッセージを保存

var buf_image;		//イメージファイル


var buf_load_img=new Array();	//キャラ先行ロード用のイメージ作成
var buf_img_url=new Array();	//キャラＵＲＬ保存変数
var buf_img_load_f=new Array();//ロードした画像フラグ	
for(var buf_cnt=0;buf_cnt<buf_img_max;buf_cnt++){
	buf_load_img[buf_cnt]=new Image();
	buf_img_load_f[buf_cnt]=0;
}
var buf_img_width = new Array();	//画像の幅を格納
var buf_img_cnt=0;				//背景画像の枚数
var buf_img_loaded;				//先行ロード最大数
var buf_img_loaded_cnt = 0;		//先行ロードのロード済みカウント
var char_change_flag = new Array();	//Jqueryフェード用
char_change_flag['#charCenterViewer'] = 0;
char_change_flag['#charLeftViewer'] = 0;
char_change_flag['#charRightViewer'] = 0;

var none_image = new Image();
none_image.src = "data/sys/none.png";


var buf_load_bg=new Array();	//BG先行ロード用のイメージ作成
var buf_bg_url=new Array();		//背景ＵＲＬ用
var buf_bg_load_f=new Array();//ロードした画像フラグ	
for(var buf_cnt=0;buf_cnt<buf_bg_max;buf_cnt++){
	buf_load_bg[buf_cnt]=new Image();
	buf_bg_load_f[buf_cnt]=0;
}
var buf_bg_cnt=0;				//背景の枚数
var buf_bg_loaded;				//既にロードした背景の枚数
var buf_bg_loaded_cnt = 0;		//先行ロードのロード済みカウント
var bg_change_flag = 0;			//Jqueryフェード用


var se_src=new Array();		//SE先行ロード用
var se_url=new Array();
var se_load_f=new Array();
for(var buf_cnt=0;buf_cnt<se_max;buf_cnt++){
	se_src[buf_cnt]=new Audio();
	se_load_f[buf_cnt]=0;
}
var se_cnt=0;

var char_flag=new Array();			//キャラ存在フラグ。左、中央、右
var current_char_flag=new Array();	//キャラ現在処理中フラグ。現在使用無し

var current_char_url=new Array();	//キャラ現在のURL
var current_bg_url="";				//背景現在のURL
var current_bgm_url="";				//ＢＧＭ現在のURL


var shake_flag=0;		//シェイクフラグ
var char_shake_flag=0;	//キャラシェイクフラグ
var char_shake_position="center";	//キャラシェイク位置

var bgm=new Audio("");		//音楽構造体
var audioObj;				//サファリ用音楽構造体

var user_var=new Array();	//ユーザー変数。
var user_var_max=10;		//ユーザーが使える変数は１０個

var select_flag=0;				//選択肢モードフラグ
var select_max=4;				//選択肢は４つまで
var select_msg=new Array();		//選択肢に表示するメッセージ
var select_hata=new Array();	//選択肢選択後に飛ぶハタ


var timer_flag=1;				//ウェイトコマンド用（開始時も待つ）
var timer_cnt = 1200;				//ウェイト時間（20ms*300=6000ms）

var scrollbar_y=0;				//スクロールバーの位置
var c_save_char=",";			//Save時の区切り文字
var e;

//ロードのイベントハンドラ追加
window.onload = game_init;



//////////////////////////////////////////////////////////////////初期化
function game_init(){
	var i;
	
	$(function(){
    	var setImg = '#charCenterViewer';
    	$(setImg).children('img').css({opacity:'0'});
   	 	//$(setImg + ' img:first').stop().animate({opacity:'1',zIndex:'20'},fadeSpeed);  
	});
	$(function(){
    	var setImg = '#charLeftViewer';
    	$(setImg).children('img').css({opacity:'0'});
   	 	//$(setImg + ' img:first').stop().animate({opacity:'1',zIndex:'20'},fadeSpeed);  
	});
	$(function(){
    	var setImg = '#charRightViewer';
    	$(setImg).children('img').css({opacity:'0'});
   	 	//$(setImg + ' img:first').stop().animate({opacity:'1',zIndex:'20'},fadeSpeed);  
	});
	
	
	$(function(){
    	var setImg = '#bgViewer';
    	$(setImg).children('img').css({opacity:'0'});
   	 	//$(setImg + ' img:first').stop().animate({opacity:'1',zIndex:'20'},fadeSpeed);  
	});

	judge_browser();	//ブラウザ判別
	
	
	for(i=0;i<3;i++){		//キャラ存在フラグ
		char_flag[i]=0;
		current_char_flag[i]=0;
	}
	
	for(i=0;i<user_var_max;i++){	//ユーザーが使う変数を初期化
		user_var[i]=0;
	}
	
	//document.getElementById("bgViewer").addEventListener('click',click_selector,false);	//クリックハンドラ
	//g_canvas.addEventListener('click',click_selector,false);	//クリックハンドラ
	
	document.getElementById("opt_area").innerHTML='<center><img src="data/sys/arrow33-005.gif"></center>';	//ローディングアイコンの表示

	
	data_load();
	setInterval("req_sel()",FPS);	//タイマー登録（毎時アニメーション可能）
	
}



//////////////////////////////////ストーリーデータをｊｓで運用するときのコード
function data_load(){
	
	data = file_data;	//シナリオデータ読み込み


	//データの余計な部分を削除
	//data.splice(0,2);
	for(var i=0;i<data.length;i++){
		data[i]=data[i].replace(/\r/g,"");	//改行削除
		data[i]=data[i].replace(/\n/g,"");
		data[i]=exchangeStr(data[i]);
		
		if(data[i]==""){
			data.splice(i,1);	//空白行削除
			i--;				//文字も次も空白の場合に飛ばされるのを防ぐ
		}
	}

	for(var i=0;i<data.length;i++){		//既読フラグリセット
		kidoku[i]=0;
	}

	init_img_load();	//先行ロード
	click_flag=0;
	option_load();
	return;
}



//////////////////////////////////////////////////
//オプションロード
function option_load(){
	var s="";
	var kidoku_str="";
	var d=new Array();

	s=getCookie("option");	
	if(s!=""){
		d=s.split(c_save_char);	
		bgm_volume=d[OPT_BGM_VOL];
		se_volume=d[OPT_SE_VOL];
		skip_switch=d[OPT_KIDOKU];
		if(skip_switch==1) skip_mode=1;
	}

	kidoku_str=getCookie("kidoku");
	KIDOKU_check=kidoku_str;
	kidoku_load(kidoku_str);

	return;
}


//////////////////////////////既読部分ロード
function kidoku_load(kidoku_str){
	var section=new Array();
	var line_data=new Array();
	section=kidoku_str.split(",");	
	
	for(var i=0;i<section.length;i++){
		line_data=section[i].split(":");
		for(var j=parseInt(line_data[0]);j<=parseInt(line_data[1]);j++){
			kidoku[j]=parseInt(line_data[2]);
		}
		
	}
	
	
	return;
}







//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////タイマー（アニメ実態）
function req_sel(){
	
	if(shake_flag > 0){			/////////////画面シェイク
		shake_anime();
		if(shake_flag == 0){
			var str_tmp = "bgSrc" + bg_change_flag;
			document.getElementById(str_tmp).style.top = "0px";
			document.getElementById(str_tmp).style.left = "0px";
			click_selector();
		}
	}
	if(char_shake_flag>0){		/////////////キャラシェイク
		char_shake_anime();
		if(char_shake_flag==0){
			fixPosition();
			click_selector();
		}
	}
	if(timer_flag==1){			//wait_mode
		t_wait();
		if(timer_flag==0) click_selector();
	}
	if(skip_mode==1){			//既読スキップ
		click_selector();
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////////クリックロック時は何もしない(クリック実態）
function click_selector(e){
	if(click_flag==0){
		
		if(title_mode==1){	//タイトルモード時
			title_mode=0;
		}
		
		if(select_flag==0){		//選択肢モードじゃないとき。
			while(1){			//コマンドだった場合は次のコマンドを取得する
				main_event();
				if(repeat_flag==0) break;	//メッセージ表示でブレイク
			}	
		}else{					//選択肢モードのとき
			//select_mode(e);
			click_selector();
		}
	}
	return;
}


////////////////////////////////////////////////////////////////////////////////
//メインのイベント処理
function main_event(){
	
	if(skip_switch==1){		//既読スキップ実行時
		if((skip_mode==1)&&(kidoku[event_flag]==0)) skip_mode=0;	//未読だった場合、スキップモードをオフに
		if((skip_mode==0)&&(kidoku[event_flag]==1)) skip_mode=1;	//既読だった場合、スキップモードをオンに
	}
	

	
	click_flag=-1;	//clickをロック
	
	for(var i=0;i<5;i++){	//コマンドリセット
		d_cmd[i]="";
	}
	exe_flag=0;
	
	d_cmd=data[event_flag].split(" ");		//スペース区切り
	kidoku[event_flag]=1;	//既読フラグon
	
	switch(d_cmd[0]){
		case "bg":
			//char_cut_anime();
			bg_load();
			exe_flag=1;
		break;
		case "title":
			//char_cut_anime();
			title_load();
			exe_flag=1;
		break;
	
		case "char":
			//char_cut_anime();
			char_load();
			exe_flag=1;
		break;
		
		case "rm":
			//char_cut_anime();
			char_rm();
			exe_flag=1;
		break;
		
		case "music":
			bgm_start();
			exe_flag=1;
		break;
		
		case "musicstop":
			bgm_stop();
			exe_flag=1;
		break;
		
		case "goto":
			goto_cmd();
			exe_flag=1;
		break;
		
		case "flagset":
			flag_set();
			exe_flag=1;
		break;
		
		case "flagcal":
			flag_cal();
			exe_flag=1;
		break;
		
		case "if":
			if_cmd();
			exe_flag=1;
		break;
		
		case "select":
			select_item();
			exe_flag=1;
		break;
		
		case "wait":
			wait_time(parseInt(d_cmd[TIME_NUM]));
			click_flag=-1;
			exe_flag=1;
		break;
		
		case "se":
			se_play();
			exe_flag=1;
		break;
		case "shake":
			shake_init();
			exe_flag=1;
		break;
		case "charshake":
			char_shake_init();
			exe_flag=1;
		break;
		
		case "#":
			repeat_flag=1;
			exe_flag=1;
		break;
		
		case "//":
			repeat_flag=1;
			exe_flag=1;
		break;
	}
	
	//////////////////////////////日本語コマンド処理
	if(exe_flag==0){
		d_cmd=data[event_flag].split("、");		//スペース区切り
		
		switch(d_cmd[0]){
			case "■背景":
				//char_cut_anime();
				bg_load();
				exe_flag=1;
			break;
		
			case "■タイトル":
				//char_cut_anime();
				title_load();
				exe_flag=1;
			break;
			
			case "■キャラ":
				//char_cut_anime();
				char_load();
				exe_flag=1;
			break;
			
			case "■キャラ消し":
				//char_cut_anime();
				char_rm();
				exe_flag=1;
			break;
			
			case "■音楽":
				bgm_start();
				exe_flag=1;
			break;
			
			case "■音楽ストップ":
				bgm_stop();
				exe_flag=1;
			break;
			
			case "■ジャンプ":
				goto_cmd();
				exe_flag=1;
			break;
			
			case "■フラグセット":
				flag_set();
				exe_flag=1;
			break;
			
			case "■フラグ計算":
				flag_cal();
				exe_flag=1;
			break;
			
			case "■もし":
				if_cmd();
				exe_flag=1;
			break;
			
			case "■選択肢":
				select_item();
				exe_flag=1;
			break;
			
			case "■ウェイト":
				wait_time();
				click_flag=-1;
				exe_flag=1;
			break;
			
			case "■ＳＥ":
				se_play();
				exe_flag=1;
			break;
			
			case "■シェイク":
				shake_init();
				exe_flag=1;
			break;
			case "■キャラシェイク":
				char_shake_init();
				exe_flag=1;
			break;
			
			case "■＃":
				repeat_flag=1;
				exe_flag=1;
			break;
			
			case "//":
				repeat_flag=1;
				exe_flag=1;
			break;
			
			default:
				
				//char_cut_anime();
				message_draw(data[event_flag], MSG_X, MSG_Y, LETTER_W);
			break;
		}
	}
	
	
	
	event_flag++;		//イベントフラグをインクリメント
	
	if(timer_flag!=1){	//ウェイト中以外
		click_flag=0;	//clickをアンロック
	}
	
	//if((skip_switch==1)&&(skip_mode==1)) repeat_flag=1;	//既読スキップモード時
	return;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////メッセージ表示
function message_draw(msg, x, y, letter_height){

	msg_save = msg;		//メッセージをグローバル変数にも保存。erese_wnd用。
	msg = msg.replace(/＠/g, "<br>");
	msg = msg.replace(/】/g, "】<br>");
	document.getElementById("messageArea").innerHTML = msg;

	
	//バックログ出力
	back_log += msg+"\n\n";
	if(back_log_f == 1){		//バックログモードがＯＮのときはリアルタイムでバックログを変更
		var t = '<textarea cols=' + back_log_x + ' rows=' + back_log_y + '>';
		t += back_log;
		t += '</textarea>';
		$("back_log").innerHTML = t;
	}

	if(DEBUG_MODE == 1) document.getElementById("test_view").innerHTML = test_var_draw();
	repeat_flag = 0;
	return;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////ロード

function load(save_name){
	//var save_name="save_data000";
	var cnt=0;
	var d=new Array();
	
	returnCancel();	//ロードウィンドウを消す
	//s = getCookie(save_name);
	var s = JSON.parse(localStorage.getItem(save_name));
	
	if(s == null){
		alert("保存されたセーブデータはありません。");
		return;
	}
	
	title_mode = 0;		//各種モードリセット
	select_flag = 0;
	
	event_flag = parseInt(s['event_flag']);		//イベントフラグロード

	init_img_load();	//先行ロード
	
	////////////////////////////////////////////BGロード
	if(s['bg_url'] != ""){
		//document.getElementById("bg_00").src=d[SAVE_BG];
		//g_bg=document.querySelector('#bg_00');

		char_flag_reset(0);	//背景ロード時、キャラフラグリセット
		bgFadeSetting(s['bg_url'], 0);

		current_bg_url = s['bg_url'];		//現在のURLを保持
	}else{
		//document.getElementById("bg_00").src="";
		//g_bg=document.querySelector('#bg_00');
		char_flag_reset(0);	//背景ロード時、キャラフラグリセット
		bgFadeSetting("", 0);
		current_bg_url = "";		//現在のURLを保持
	}

	/////////////////////////////////////人物ロード
	//左
	if(s['char_left'] != ""){
		//document.getElementById("char_00").src=d[SAVE_CHAR_L];
		//g_char[0]=document.querySelector('#char_00');

		cutSetting(s['char_left'], "#charLeftViewer", "charLeftSrc");

		char_flag[CHAR_L_F]=1;
		current_char_flag[CHAR_L_F]=1;
		current_char_url[CHAR_L_F]=s['char_left'];
	}else{
		char_flag[CHAR_L_F]=0;
		current_char_flag[CHAR_L_F]=0;
		current_char_url[CHAR_L_F]="";
	}
	
	//中央
	if(s['char_center'] != ""){
		//document.getElementById("char_01").src=d[SAVE_CHAR_C];
		//g_char[CHAR_C_F]=document.querySelector('#char_01');

		cutSetting(s['char_center'], "#charCenterViewer", "charCenterSrc");
		char_flag[CHAR_C_F]=1;
		current_char_flag[CHAR_C_F]=1;
		current_char_url[CHAR_C_F]=s['char_center'];
	}else{
		char_flag[CHAR_C_F]=0;
		current_char_flag[CHAR_C_F]=0;
		current_char_url[CHAR_C_F]="";
	}
	
	//右
	if(s['char_right'] != ""){
		//document.getElementById("char_02").src=d[SAVE_CHAR_R];
		//g_char[CHAR_R_F]=document.querySelector('#char_02');

		cutSetting(s['char_right'], "#charRightViewer", "charRightSrc");
		char_flag[CHAR_R_F]=1;
		current_char_flag[CHAR_R_F]=1;
		current_char_url[CHAR_R_F]=s['char_right'];
	}else{
		char_flag[CHAR_R_F]=0;
		current_char_flag[CHAR_R_F]=0;
		current_char_url[CHAR_R_F]="";
	}
	
	////////////////////////////////////////////BGMロード
	if(s['bgm_url'] != ""){
		document.getElementById("bgm").autoplay=true;
		document.getElementById("bgm").src=s['bgm_url'];
		current_bgm_url=s['bgm_url'];
	}else{
		document.getElementById("bgm").src="";
		current_bgm_url="";
	}
	
	////////////////////////////////////////////変数ロード
	d = s['user_val'].split(c_save_char);	//データ切り分け
	cnt = 0;
	for(var i = 0; i < user_var_max; i++){
		user_var[i]=parseInt(d[i]);
	}

	kidoku_load(s['kidoku']);
	
	
		scrollbar_y=getScrollPosition();	//スクロールバーの位置を取得しておく
		footer_redraw();		//フッター再描画
		click_selector();
	return;
}




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ブラウザ判別
function judge_browser(){
	if(navigator.userAgent.indexOf("MSIE") != -1){ // 文字列に「MSIE」が含まれている場合
		 browser_type="IE";
	}
	else if(navigator.userAgent.indexOf("firefox") != -1){ // 文字列に「Firefox」が含まれている場合
		 browser_type="FF";
	}
	else if(navigator.userAgent.indexOf("Chrome") != -1){ // 文字列に「Netscape」が含まれている場合
		browser_type="chrome";
	}
	else if(navigator.userAgent.indexOf("Safari") != -1){ // 文字列に「Safari」が含まれている場合
		browser_type="safari";
	}
	else{
		browser_type="other";
	}
	
	return;
}













//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////デバッグ用

function test_var_draw(){
	var i;
	var l="フラグ：";
	for(i=0;i<user_var_max;i++){
		l+=user_var[i]+"&nbsp;";
	}
	l+="<br><br>先行ロードURL : "+buf_img_cnt+"枚<br>";
	
	for(i=0;i<buf_img_cnt;i++){
		l+=""+i+" : "+buf_img_url[i]+"<br>";
	}
	
	l+="<br>BGM<br>"+current_bgm_url+"<br>";
	l+="skip_switch="+skip_switch+"<br>";
	l+="skip_mode="+skip_mode+"<br>";
	l+="既読文字列<br>"+KIDOKU_check+"<br>";
	
	/*
	for(i=0;i<data.length;i++){
		if(kidoku[i]==1) l+=""+i+":"+kidoku[i]+"<br>";
	}*/
	
	return l;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////