define([
	'knockout',
	'eteration/widgets/widget-util',
	'eteration/eteration-i18n'
	], function(ko,widgetUtil,i18n){
		
	    var ViewModel = function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	self.css = value.css === undefined ? "text-left" : value.css;
	    	self.paxCount = value.paxCount;
	    	self.paidSeatProcess = value.paidSeatProcess;
	    }
	
	    return ViewModel;
});





