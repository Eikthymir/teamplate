export function registerReceiver() {
	let main = plus.android.runtimeMainActivity();//获取activity  
	
	//创建自定义广播实例  
	
	let receiver = plus.android.implements('io.dcloud.feature.internal.reflect.BroadcastReceiver',{  
	
	    onReceive : function(context,intent){//实现onReceiver回调函数  
	
	    plus.android.importClass(intent);//通过intent实例引入intent类，方便以后的‘.’操作  
	
	    let isSuccess = intent.getExtra("isSuccess");  
	
	    let msg = intent.getExtra("msg");  
	
	    uni.showToast({
	    	title: "isSuccess = "+isSuccess+" , msg = "+msg
	    })
	}});  
	
	
	
	let IntentFilter = plus.android.importClass('android.content.IntentFilter');  
	
	let filter = new IntentFilter();  
	
	
	
	filter.addAction("io.dcloud.printer.printcallback");//监听打印回调，自定义字符串  
	
	
	
	main.registerReceiver(receiver,filter); //注册监听 
}