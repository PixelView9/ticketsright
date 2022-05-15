define([
	'knockout',
	'eteration/eteration-i18n',
	'eteration/widgets/ui-name',
	'eteration/widgets/ui-i18n'
	], 

function(ko,i18n){
		
	    var ViewModel = function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();

	    	self.eventbus = value.eventbus;
	    	
	    	var translatedTariffMessage = i18n.get('TextField-REZ-DASH-602');
	    	
	    	self.tariffChangeMessage = ko.observable(translatedTariffMessage);
	    	
	    	self.eventbus.addSubscriber(function(tariffMessageVisibility) {
	    		
	    		if(tariffMessageVisibility) {
	    			$('#tariffChangeModal').modal("show");
	    		}
	    		else {
	    			$('#tariffChangeModal').modal("hide");
	    		}
	    		
	    	}, self, 'tariff_message_visibility');
	    }
	    
	    return ViewModel;
});





