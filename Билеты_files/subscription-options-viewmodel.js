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
	    	self.reservation = value.reservation;
	    	
	    	self.receieveSMSUpdates = ko.observable(self.reservation().receiveSMS);
	    	self.contactInfoEditable = ko.observable(false);
	    	self.isMobile = ko.observable(false);
	    	
	    	
	    	self.eventbus.addSubscriber(function(mobileViewFlag) {
	    		self.isMobile(mobileViewFlag);
	    	}, self, 'mobile_view_flag');

			self.eventbus.addSubscriber(function(contactInformationFields) {
				self.contactInfoEditable(contactInformationFields.contactInfoEditable);
			}, self, 'contact_information_fields');

			self.eventbus.addSubscriber(function(contactInformation) {
				self.contactInfoEditable(contactInformation.contactInfoEditable);
			}, self, 'contact_information_response');
				    	
	    	self.notifySubscribers = function() {
	    		self.eventbus.notifySubscribers(self.receieveSMSUpdates(), 'smsupdates');
	    	}
	    	
	    	self.receieveSMSUpdates.subscribe(function(receieveSmsUpdateValue) {
	    		self.eventbus.notifySubscribers(receieveSmsUpdateValue, 'smsupdates');
	    	});
	    }
	    
	    return ViewModel;
});





