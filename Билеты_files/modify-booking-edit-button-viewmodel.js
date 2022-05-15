define([
	'knockout',
	'eteration/eteration-ajax',
	'eteration/eteration-i18n',
	'eteration/widgets/ui-name',
	'eteration/widgets/ui-i18n',
	'eteration/widgets/ui-etrselect'
	], 

function(ko,etrAjax,i18n){
		
	    var ViewModel = function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	
	    	self.eventbus = value.eventbus;
	    	self.disabledContactBlock = value.disabled;
	    	self.contactInfoEditable = ko.observable();
	    	self.contactPhone = ko.observable();
	    	self.contactAreaCode = ko.observable();
	    	self.isMobile = ko.observable(false);
	    	
	    	self.eventbus.addSubscriber(function(contactInformationFields) {
				
	    		self.contactInfoEditable(contactInformationFields.contactInfoEditable);
		    	self.contactPhone(contactInformationFields.contactPhone);
		    	self.contactAreaCode(contactInformationFields.contactAreaCode);
	    		
	    	}, self, 'contact_information_fields');
	    	
	    	self.eventbus.addSubscriber(function(mobileViewFlag) {
				self.isMobile(mobileViewFlag);
	    	}, self, 'mobile_view_flag');
	    	
	    	self.editContactInfoToggle = function() {
	    		
	    		self.eventbus.notifySubscribers(true, 'contact_information_provider');
	    		
				self.contactInfoEditable(!self.contactInfoEditable());
				
				if(self.contactPhone().length > 0 && self.contactPhone().indexOf("+") == -1) {
					self.contactPhone("+" + self.contactPhone());
				}
				
				if(self.contactPhone()) {
					if(self.contactPhone().indexOf("+") > -1) {
						self.contactAreaCode("");
		    			self.contactPhone("");
					}
					else {
						var contactPhone = self.contactPhone().replace(String(self.contactAreaCode()),"");
						self.contactPhone(contactPhone);
					}
				}
				
				var contactInformationFields = {
						contactPhone: self.contactPhone(),
						contactAreaCode: self.contactAreaCode(),
						contactInfoEditable: self.contactInfoEditable()
				}
				
				self.eventbus.notifySubscribers(contactInformationFields, 'contact_information_fields');
			}
			
	    }
	    
	    return ViewModel;
});





