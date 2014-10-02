document.addEventListener('touchstart',function(){
    return false;
},true);
// 禁止选择
document.oncontextmenu=function(){
	return false;
};
// H5 plus事件处理

function plusReady(){
	
	// 隐藏滚动条
	plus.webview.currentWebview().setStyle({scrollIndicator:'none'});
	
	plus.navigator.setFullscreen( true );
	// Android处理返回键
	plus.key.addEventListener('backbutton',function(){
		if(confirm('确认退出？')){
			plus.runtime.quit();
		}
	},false);
	compatibleAdjust();
}
if(window.plus){
	plusReady();
}else{
	document.addEventListener('plusready',plusReady,false);
}

var _domReady=false;
document.addEventListener('DOMContentLoaded',function(){
	_domReady=true;
	compatibleAdjust();
},false);
// 兼容性样式调整
var _adjust=false;
function compatibleAdjust(){
	if(_adjust||!window.plus||!_domReady){
		return;
	}
	_adjust=true;
	// 关闭启动界面
	setTimeout(function(){
		plus.navigator.closeSplashscreen();
	},500);
}