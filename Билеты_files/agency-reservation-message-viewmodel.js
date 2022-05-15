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
	    	
	    	self.agencyMessageAboutReservationPnr = ko.observable();
	    	
	    	self.eventbus.addSubscriber(function(agencyReservationMessageVisibility) {
	    		
	    		if(agencyReservationMessageVisibility) {
	    			$('#agencyWarningMessageAboutPnr').modal("show");
	    		}
	    		else {
	    			$('#agencyWarningMessageAboutPnr').modal("hide");
	    		}
	    		
	    	}, self, 'agency_reservation_message_visibility');
	    	
	    	
	    	self.eventbus.addSubscriber(function(languageTranslationkeyword) {
	    		
	    		var agencyMessageAboutReservationPnr = i18n.get(languageTranslationkeyword);
				self.agencyMessageAboutReservationPnr(agencyMessageAboutReservationPnr);
	    		
	    	}, self, 'agency_reservation_message_keyword');
	    	
	    	
	    }
	    
	    return ViewModel;
});





