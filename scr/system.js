

/////////////////////////////////
//オプション画像のパスを取得する。
function getOptionPath(p_path, mode){
	var path;
	switch(mode){
			case "sound_mode":
				path = (game_status['sound_mode']) ? 'data/sys/sound_on.png' :  'data/sys/sound_off.png';
			break;
			case "effect_mode":
				path = (game_status['effect_mode']) ? 'data/sys/effect_on.png' :  'data/sys/effect_off.png';
			break;
			case "read_mode":
				path = (game_status['skip_mode']) ? 'data/sys/read_on.png' :  'data/sys/read_off.png';
			break;
			default:
				path = p_path;
			break;
	}


	return path;
}

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
////////////////////////////////////////////////////
//現在位置から一番近い画像ロードの位置を取得
//返り値は、URLをまとめた配列の該当番号
function searchNearImgUrl(current_no, mode){
	var check_data = new Array();
	var check_flag = new Array();
	var path = "";
	var int_f = 0;


	if(mode == "bg"){
		check_data = bg_load_url;
		check_flag = bg_load_flag;
		path = BG_PATH;
	}
	else if(mode == "char"){
		check_data = char_load_url;
		check_flag = char_load_flag;
		path = CHAR_PATH;
	}
	else if(mode == "se"){
		check_data = se_load_url;
		check_flag = se_load_flag;
		path = SE_PATH;
	}
	for(var i = current_no; i < data.length; i++){
		var str_tmp = transrateCommand(data[i]);
		var d_cmd= str_tmp.split(" ");		//スペース区切り

		if(d_cmd[0] == mode){
			for(var j = 0; j < check_data.length; j++){
				if(check_data[j] == d_cmd[path]){
					//もしその画像が読み込まれていないのならそれを返す
					if(!check_flag[j]){
						int_f = j;
						break;
					}
					
				} 
			}
			if(int_f != 0) break;
		}
	}
	return int_f;
}

//////////////////////////////////////////////////////////音声モード変更
function switchingSound(){
	if(game_status['sound_mode']){	
		game_status['sound_mode'] = false;
		document.getElementById("bgm").pause();
	}else{
		game_status['sound_mode'] = true;
		document.getElementById("bgm").play();
	}
	saveOption();
	return;
}

//////////////////////////////////////////////////////////エフェクトモード変更
function switchingEffect(){

	game_status['effect_mode'] = (game_status['effect_mode']) ? false : true;
	saveOption();
	return;
}
//////////////////////////////////////////////////////////既読モード変更
function switchingRead(){
	game_status['skip_mode'] = (game_status['skip_mode']) ? false : true;
	saveOption();
	return;
}


///////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////
//オプションを表示
function displayOption(){
	
	if((option_status == 'hidden_all') || (option_status == 'close_save')){
		click_flag = false;
		option_status = 'display';
		var w = 200;
		var x = 95;
		var y = 50;
		var option_item = new Array();
		option_item['load'] = new OPTIONBUTTON(x,-100,x,y,w,w,'vy','data/sys/load.png','load');
		option_item['save'] = new OPTIONBUTTON(-100, y, x + w + 50, y, w, w,'vx','data/sys/save.png','save');
		option_item['backlog'] = new OPTIONBUTTON(x,-100,x, y + w + 50, w, w, 'vy','data/sys/backlog.png','backlog');
		option_item['sound'] = new OPTIONBUTTON(-200, y + w + 50, x + w + 50, y + w + 50, w, w,'vx','data/sys/sound_on.png','sound_mode');
		option_item['effect'] = new OPTIONBUTTON(x, -100, x, y + (w + 50) * 2, w, w,'vy','data/sys/effect_on.png','effect_mode');
		option_item['read'] = new OPTIONBUTTON(-300, y + (w + 50) * 2, x + w + 50, y + (w + 50) * 2, w, w,'vx','data/sys/read_on.png','read_mode');

	}
	else{
		click_flag = true;
		option_status = 'hidden_all';
	}
}

///////////////////////////////////////
/////////////////////////////////////
//セーブ領域を書き込む
function displaySaveArea(mode){
	var w = 200;
	var x = 95;
	var y = 50;
	var save_item = new Array();
	var type = "";
	var path;

	if(mode == "save"){
		type = "save_wnd";
		path = 'data/sys/save_base.png';
	}
	else if(mode == "load"){
		type = "load_wnd";
		path = 'data/sys/load_base.png';
	}
	
	for(var i = 0; i < 6; i++){
		var init_x = (i % 2 == 0) ? x : x + w + 50;
		var str_msg = makeSaveList(i, type);
		var save_name = "save_data" + i;
		save_item[i] = new SAVEWINDOW(init_x,-100,init_x,y,w,w,'vy', path, type, str_msg, save_name);

		//２段目の処理
		if(i % 2 == 1){
			y += w + 50;
		}
		
	}
	
	return;
}
/////////////////////////////////localに保存
function save(save_name){
	if(!confirm(save_name + "にセーブをします。よろしいですか？")) return;
	var s;
	var str_tmp="";

	s = save_len_make(save_name);

	
	alert("ゲームのデータを保存しました。\n");
	option_status = 'close_save';	//セーブウィンドウをクローズ
	displayOption();				//オプションを表示
	//document.getElementById("test_view").innerHTML=s;
	
	return;
}

///////////////////////////coockieに保存するときの文字列を作成
function save_len_make(save_name){
	var s="";
	var tmp_event_flag = event_flag - 1;
	var date_nowdate = new Date();				//日付取得
	var date_year = date_nowdate.getFullYear();
	var date_month = date_nowdate.getMonth()+1;
	var date_date = date_nowdate.getDate();
	var date_hour = date_nowdate.getHours();
	var date_min = date_nowdate.getMinutes();
	var str_timestamp = date_year+"/"+date_month+"/"+date_date+" "+date_hour+":"+date_min;	//日付の文字列作成
	
	var val = "";
	for(var i=0;i<USER_VAR_MAX;i++){
		val += user_var[i];
		val += c_save_char;
	}

	//オブジェクトを作り、JSON形式で保存
	var obj = {
		timestamp: 		str_timestamp,
		event_flag: 	tmp_event_flag,
		char_left: 		game_status['char_left'],
		char_center: 	game_status['char_center'],
		char_right: 	game_status['char_right'],
		bg: 		game_status['bg'],
		bgm: 		game_status['bgm'],
		user_val: 		val,
		msg: 			data[tmp_event_flag].substr(0,20)+"…",	//そのときの読んでいる文章データを登録
		kidoku: 		KIDOKU_check = readMake()
	}

	localStorage.setItem(save_name, JSON.stringify(obj));
	return s;
}

/////////////////////////////////////既読フラグ保存時の文字列作成
function readMake(){
	var i;
	var start=0;
	var end=0;
	var start_f = read_flag[0];		//一番最初の行のフラグ
	var return_s = "";

	for(i=0;i<data.length;i++){

		if(start_f != read_flag[i]){
			end = i-1;	//フラグが変わる手前だから-1
			return_s += start + ":" + end + ":" + start_f + ",";
			
			start_f = read_flag[i];
			start = i;
		}
	}

	//最後の処理。最後のブロックはそのまま抜けるので描きこまれない。それを防ぐ
	end = i;	//フラグが変わる手前だから-1
	return_s+=""+start+":"+end+":"+start_f+",";

	return return_s;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////ロード

function saveDataLoad(save_name){
	var cnt=0;
	var d = new Array();

	try{
		var s = JSON.parse(localStorage.getItem(save_name));
	} catch(e) {
		storageError();
		return;
	}
	
	if(s == null){
		alert("保存されたセーブデータはありません。");
		return;
	}
	
	event_flag = parseInt(s['event_flag']);		//イベントフラグロード
	loadPreload(event_flag);	//先行ロード
	
	////////////////////////////////////////////BGロード
	if(s['bg'] != ""){
		game_status['bg'] = s['bg'];		//現在のURLを保持
	}else{
		game_status['bg'] = "";		//現在のURLを保持
	}

	/////////////////////////////////////人物ロード
	//左
	if(s['char_left'] != ""){
		game_status['char_left'] = s['char_left'];
	}else{
		game_status['char_left']="";
	}
	
	//中央
	if(s['char_center'] != ""){
		game_status['char_center'] = s['char_center'];
	}else{
		game_status['char_center'] = "";
	}
	
	//右
	if(s['char_right'] != ""){
		game_status['char_right'] =s['char_right'];
	}else{
		game_status['char_right'] = "";
	}
	
	////////////////////////////////////////////BGMロード
	if(s['bgm'] != ""){
		var d_cmd = new Array();
		d_cmd[BGM_PATH] = s['bgm'];
		bgmStart(d_cmd);
		game_status['bgm'] = s['bgm'];
	}else{
		game_status['bgm'] = "";
	}
	
	////////////////////////////////////////////変数ロード
	d = s['user_val'].split(c_save_char);	//データ切り分け
	cnt = 0;
	for(var i = 0; i < USER_VAR_MAX; i++){
		user_var[i] = parseInt(d[i]);
	}

	kidoku_load(s['kidoku']);
	option_status = 'hidden_all';
	clickSelector();
	sub_screen.redraw("fade");
	return;
}
//////////////////////////////既読部分ロード
function kidoku_load(kidoku_str){
	var section = new Array();
	var line_data = new Array();
	section = kidoku_str.split(",");	
	
	for(var i = 0; i < section.length; i++){
		line_data = section[i].split(":");
		for(var j = parseInt(line_data[0]); j <= parseInt(line_data[1]); j++){
			read_flag[j] = parseInt(line_data[2]);
		}
		
	}
	
	return;
}

///////////////////////////////
//イベントフラグの次から途中先行ロード
function loadPreload(flag){
	var array_tmp = new Array();
	var index;
	var cnt = 0;

	//BG
	index = searchNearImgUrl(flag, 'bg');
	if(index != 0) bg_current_no = index;

	//Char
	index = searchNearImgUrl(flag, 'char');
	if(index != 0) char_current_no = index;

	//SE
	index = searchNearImgUrl(flag, 'se');
	if(index != 0) se_current_no = index;

	if(!preload_flag) nextCharLoad();
	if(!preload_flag) nextBgLoad();
	if(!preload_flag) nextSeLoad();
}

//////////////////////////////////
//均等にロードするスイッチャー
function loadSwitcher(){
	if(preload_turn_num == 0){
		if(!preload_flag) nextCharLoad();
		if(!preload_flag) nextBgLoad();		//もしキャラがないならBG読み込み
		if(!preload_flag) nextSeLoad();		//もしキャラもBGもないならBG読み込み
		preload_turn_num = 1;
	}
	else if(preload_turn_num == 1){
		if(!preload_flag) nextBgLoad();
		if(!preload_flag) nextSeLoad();
		if(!preload_flag) nextCharLoad();
		preload_turn_num = 2;
	}
	else if(preload_turn_num == 2){
		if(!preload_flag) nextSeLoad();
		if(!preload_flag) nextCharLoad();
		if(!preload_flag) nextBgLoad();
		preload_turn_num = 0;
	}

}

/////////////////////////////////////////////////////////////////////////////////////////////
//オプションセーブ(ゲームステータスをそのまま保存)
function saveOption(){
	var save_name = "tj_option";
	localStorage.setItem(save_name, JSON.stringify(game_status));
}

/////////////////////////////////////////////////////////////////////////////////////////////
//オプションロード
function loadOption(){
	var save_name = "tj_option";
	try{
		var s = JSON.parse(localStorage.getItem(save_name));
		//データがなかったら戻る
		if(s == null) return;

		game_status['sound_mode'] = s['sound_mode'];
		game_status['effect_mode'] = s['effect_mode'];
		game_status['skip_mode'] = s['skip_mode'];
	}catch(e){
		storageError();
	}

	
}
//////////////////////////////////////////////////////////////////////////
function storageError(){
	var browser = judge_browser();
	var str = "";
	if(browser == "IE"){
		str = "オプションロードに失敗しました。IEの場合、インターネットオプション＞詳細設定＞セキュリティの「DOMストレージを有効にする」にチェックをお願い致します。";
	}
	else{
		str = "オプションロードに失敗しました";
	}
	str = "オプションロードに失敗しました。IEの場合、インターネットオプション＞詳細設定＞セキュリティの「DOMストレージを有効にする」にチェックをお願い致します。\nまたローカル環境ではIEは使用できませんのでChromeかFirefoxなどのブラウザをご使用ください。";


	alert(str);
	return;
}

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
	
	return browser_type;
}