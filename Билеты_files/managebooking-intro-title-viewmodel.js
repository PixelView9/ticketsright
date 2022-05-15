define([
	'knockout',
	'eteration/eteration-i18n',
	'eteration/widgets/ui-i18n'
	], 

function(ko,i18n){
		
	    var ViewModel = function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	self.visibility = ko.observable(true);
	    }
	    
	    return ViewModel;
});





