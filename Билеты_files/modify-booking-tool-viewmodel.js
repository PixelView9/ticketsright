define([
	'knockout',
	'eteration/eteration-ajax',
	'eteration/eteration-i18n',
	'eteration/ui/validation-helper',
	'eteration/widgets/ui-name',
	'eteration/widgets/ui-i18n',
	'eteration/widgets/ui-etrselect',
	'eteration/widgets/managebooking/ui-subscription-options',
	'eteration/widgets/managebooking/ui-modify-booking-edit-button',
	'eteration/widgets/managebooking/ui-modify-booking-save-button',
	'eteration/widgets/ui-dropdownselect'
	], 

function(ko,etrAjax,i18n,validationHelper){
		
	    var ViewModel = function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	self.eventbus = value.eventbus;
	    	
	    	self.reservation = ko.observable();
	    	self.isMobile = ko.observable(false);
	    	self.receieveSMSUpdates = ko.observable(false); //ko.observable(self.reservation().receiveSMS);
	    	self.contactInfoEditable = ko.observable(false);
	    	self.availableForPrimaryContacts = ko.observableArray([]); //ko.observableArray(self.reservation().contactList);
	    	self.selectedPrimaryContact = ko.observable(0);
	    	self.thankyouPageType = ko.observable();
	    	self.nonIttPnrEditable = ko.observable(true);
	    	self.contactAreaCode = ko.observable("");
	    	self.countryCodes = ko.observableArray([]);
	    	
	    	self.contactPhone = ko.observable("");
			self.contactEmail = ko.observable("");
			
			self.contactInfoValidationContext = ko.jqValidation({
				  customValidators : {
					  phoneNumberTRValidator : function() {
							var phoneNumberTR = self.contactPhone().replace(/\D/g, "");				
							if(phoneNumberTR.length != 10 ){
								return i18n.get("Error-OB-43");
							}
							if(phoneNumberTR.charAt(0) != "5"){
								return i18n.get("Error-OB-52");
							}          		
						},
						
						phoneNumberValidator : function() {
							var regionCodeOther = self.contactAreaCode() && self.contactAreaCode().replace(/\D/g, "");
							var phoneNumberOther = self.contactPhone().replace(/\D/g, "");				
							var totalLength = (regionCodeOther && regionCodeOther.length) + phoneNumberOther.length;
							if(totalLength < 7){
								return i18n.get("Error-OB-53");
							}else if(totalLength > 18 ){
								return i18n.get("Error-OB-58");
							}
						},
						
	                	contactPhoneValidator : function(el) {
	                		if(!self.contactPhone() || self.contactPhone() == null || self.contactPhone().length == 0) {
	                			return i18n.get("Error-REZ-98978");
	                		}
	              			if(self.receieveSMSUpdates() && validationHelper.isEmptyValue(self.contactPhone())){
	              				return i18n.get("Error-REZ-98978");
	              			}
	                	},
	                	
	                	phoneAreaCodeValidator : function(el) {
	                		if(!self.contactAreaCode() || self.contactAreaCode() == null || self.contactAreaCode().length == 0) {
	                			return i18n.get("Error-REZ-98978");
	                		}
	                	}
	               }
	        });
			
			self.registerSubscriberTopics = function() {
			
				self.eventbus.addSubscriber(function(receieveSmsUpdateValue) {
					self.receieveSMSUpdates(receieveSmsUpdateValue);
		    	}, self, 'smsupdates');
				
				self.eventbus.addSubscriber(function(mobileViewFlag) {
					self.isMobile(mobileViewFlag);
		    	}, self, 'mobile_view_flag');
				
				self.eventbus.addSubscriber(function(thankyouPageType) {
		    		self.thankyouPageType(thankyouPageType);
		    	}, self, 'thankyou_page_type');
				
				self.eventbus.addSubscriber(function(reservationObject) {
					
					self.reservation(reservationObject);
					
					var selectedPrimaryContact = (reservationObject.primaryContactRPH == -1) ? undefined : reservationObject.primaryContactRPH;
					self.receieveSMSUpdates(reservationObject.receiveSMS);
					
					var contactPhone = reservationObject.contactPhone ? ("+" + reservationObject.contactPhone) : "";
					self.contactPhone(contactPhone);
					
					var contactEmail = reservationObject.contactEmail || ""
					self.contactEmail(contactEmail);
					
					self.selectedPrimaryContact(selectedPrimaryContact);
					self.availableForPrimaryContacts(reservationObject.contactList);

					var passengerInfo;
					
					if(reservationObject.allFlights[0]){
						passengerInfo = reservationObject.allFlights[0].passengers;
					}
					
					if(reservationObject.nonIttPnr){
			    		if(passengerInfo && passengerInfo.length == 1){
			    			self.nonIttPnrEditable(true);
			    		} else if(passengerInfo && passengerInfo.length == 2){
			    			for(var i = 0; i < passengerInfo.length; i++) {
								if(passengerInfo[i].infantInfo != null) {
									self.nonIttPnrEditable(true);
									break;
								} else {
									self.nonIttPnrEditable(false);
								}
							}
			    		} else if(passengerInfo && passengerInfo.length > 2){
			    			self.nonIttPnrEditable(false);
			    		}
			    	} else {
			    		self.nonIttPnrEditable(true);
			    	}
		    		
		    	}, self, 'reservation');
				
				self.eventbus.addSubscriber(function(contactInformatioProvider) {
					
					if(contactInformatioProvider) {
						
						var contactInformationFields = {
								contactPhone: self.contactPhone(),
								contactAreaCode: self.contactAreaCode()
						}
						
						self.eventbus.notifySubscribers(contactInformationFields, 'contact_information_fields');
					}
					
		    	}, self, 'contact_information_provider');
				
				self.eventbus.addSubscriber(function(contactInformationProvider) {
					
					if(contactInformationProvider) {
						
						var selectedPrimaryContactRph = (typeof self.selectedPrimaryContact() === 'object') ? self.selectedPrimaryContact().rph : self.selectedPrimaryContact();
						
				    	var contactInformation = {
			    			'primaryContactPassengerRPH': selectedPrimaryContactRph,
							'contactEmail': self.contactEmail(),
							'contactPhone': self.contactPhone(),
							'contactPhoneAreaCode': self.contactAreaCode(),
							'receieveSMSUpdates': self.receieveSMSUpdates(),
							'mailPromotions': false
				    	}
						
				    	self.eventbus.notifySubscribers(contactInformation, 'contact_information');
					}
					
				}, self, 'contact_information_provider');
				
				self.eventbus.addSubscriber(function(validationResultProvider) {
					
					if(validationResultProvider) {
						
						var validationResult = self.contactInfoValidationContext.Validate();
						var valid = validationResult.valid;
						self.eventbus.notifySubscribers(valid, 'modify_booking_validation_result');
					}
					
				}, self, 'modify_booking_validation_result_provider');
				
				self.eventbus.addSubscriber(function(contactInformationFields) {
					
		    		self.contactInfoEditable(contactInformationFields.contactInfoEditable);
			    	self.contactPhone(contactInformationFields.contactPhone);
			    	self.contactAreaCode(contactInformationFields.contactAreaCode);
		    		
		    	}, self, 'contact_information_fields');
				
				self.eventbus.addSubscriber(function(contactInformation) {
		    		
					self.selectedPrimaryContact(contactInformation.selectedPrimaryContact);
	    			self.contactEmail(contactInformation.contactEmail);
	    			self.contactPhone(contactInformation.contactPhone);
	    			self.contactInfoEditable(contactInformation.contactInfoEditable);
	    			self.contactAreaCode(contactInformation.contactAreaCode);
		    		
		    	}, self, 'contact_information_response');
			
			}

	    	self.loadCountryCodes = function() {
				
				var countryCodesQuery = {
			    		app: 'app.ms',
			    		service:'/parameters/regioncodes',
			    		disableLoader: true,
			    		callback:function(response) {
		    				self.countryCodes(response.data);
		    				self.contactAreaCode(response.data[0].code);
			    		}
				}
				
				etrAjax.get(countryCodesQuery);
			}
	    	
			
			self.loadCountryCodes();
	    	
			self.registerSubscriberTopics();
			
			self.eventbus.notifySubscribers(true, 'reservation_provider');
			self.eventbus.notifySubscribers(true, 'mobile_view_flag_provider');
	    }
	    
	    return ViewModel;
});





