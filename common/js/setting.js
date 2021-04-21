export class Setting {
	//初始化设置
	constructor(){
		//仅WIFI联网，默认为false
		this.onlyWIFI = uni.getStorageSync('onlyWIFI');
		if(this.onlyWIFI==''){
			this.setOnlyWIFI(false);
		}
	}
	
	//设置仅WIFI联网
	setOnlyWIFI(value){
		this.onlyWIFI = value;
		uni.setStorage({
			key:"onlyWIFI",
			data:this.onlyWIFI
		})
	}
	getOnlyWIFI(){
		return this.onlyWIFI;
	}
}