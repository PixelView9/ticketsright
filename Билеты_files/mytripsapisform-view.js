define(['jquery',
        'knockout',
        'moment',
        'eteration/eteration',
        'eteration/ui/form-viewmodel',
        'eteration/eteration-ajax',
        'eteration/eteration-i18n',
        'eteration/ui/login-viewmodel',
        'ui-helper/flight-search-helper',
        'ui-helper/flight-list-helper',
        'eteration/ui/validation-helper',
        'eteration/widgets/ui-flight',
        'eteration/widgets/ui-combodate',
        'eteration/widgets/ui-moment',
        'eteration/widgets/ui-spinner',
        'eteration/widgets/ui-common',
        'jquery.uisliderpips',
        'eteration/widgets/ui-etrselect',
        'eteration/widgets/ui-money',
        'eteration/widgets/ui-paxtype-count',
        'eteration/widgets/ui-portselect', 
        'eteration/widgets/ui-datepicker', 
        'eteration/widgets/ui-datelabel',
        'eteration/widgets/ui-closepopup',
        'eteration/widgets/ui-togglepopup',
        'eteration/widgets/ui-timerangepicker',
        'eteration/widgets/ui-timerangegrid',
        'eteration/widgets/ui-timerange',
        'eteration/widgets/ui-name',
        'eteration/widgets/ui-routerestrictionmessage'
        ], 
        
	function($,ko,moment,Eteration,BaseViewModel,etrAjax,i18n, loginView,flightSearchHelper,flightListHelper,validation) {		


		function ApisFormViewModel(data) {
			
			var self = this;
			ko.utils.extend(self, new BaseViewModel.FormViewModel());
			
			self.passenger = data.passenger;
			self.infantPassenger = data.infantPassenger;
			self.index = ko.observable();
			
			self.links = data.links;
			
			self.apisAvailable = ko.observable(data.apisAvailable);
			self.showDetails = ko.observable(false);
			
			self.selectBoxRefresher = ko.observable(true);
			
			self.validationProperties = ko.observableArray();
			
			self.showDetails.subscribe(function(newValue) {
				self.updateValidationContext("#passengerApisForm_0", function() { return self.apisFormValidationContext }, 5000)
			});
			
			self.documentType = ko.observable(self.passenger.apiInfo.documentType ? self.passenger.apiInfo.documentType : "");
			self.passportNumber = ko.observable(self.passenger.apiInfo.passportNumber ? self.passenger.apiInfo.passportNumber : "");
			self.passportExpiry = ko.observable(self.passenger.apiInfo.passportExpiry ? self.passenger.apiInfo.passportExpiry : "");
			self.citizenship = ko.observable(self.passenger.apiInfo.citizenship ? self.passenger.apiInfo.citizenship : "");
			self.passportFrom = ko.observable(self.passenger.apiInfo.passportFrom ? self.passenger.apiInfo.passportFrom : "");
			self.surname = ko.observable(self.passenger.apiInfo.surname ? self.passenger.apiInfo.surname : "");
			self.name = ko.observable(self.passenger.apiInfo.name ? self.passenger.apiInfo.name : "");
			self.gender = ko.observable(self.passenger.apiInfo.gender ? self.passenger.apiInfo.gender : "");
			self.birthday = ko.observable(self.passenger.apiInfo.birthday ? self.passenger.apiInfo.birthday : "");
			
			self.apisAgreement = ko.observable();
			self.newSelectedPaxType = ko.observable();
			self.newBirthdate = ko.observable();
			self.newTcknNo = ko.observable("");
			self.newFfp = ko.observable("");
			self.selectedNewFFPProgram = ko.observable("");
			
			self.docTypes = ko.observableArray();
			self.countries = ko.observableArray();
			self.genders = ko.observableArray();

			if(!self.name()) { 
				self.name = ko.observable(self.passenger.personalInfo.name);
			}
				
			if(self.name().length == 0) {
				self.name = ko.observable(self.passenger.personalInfo.name);
			}
			
			if(!self.surname()) { 
				self.surname = ko.observable(self.passenger.personalInfo.surname);
			}
				
			if(self.surname().length == 0) { 
				self.surname = ko.observable(self.passenger.personalInfo.surname);
			}
			
			self.init = function() {
				
				var docTypesQuery = {
		    		app: 'app.ibs',
		    		service:'/parameters/doctypes',
		    		callback:function(response) {
		    			self.docTypes.removeAll();
		    			self.docTypes(response.data);
		    		}
				};
				
				var countriesQuery = {
					app: 'app.ibs',
			    	service:'/parameters/countries',
			    	callback:function(response) {
			    		self.countries.removeAll();
			    		self.countries(response.data);
			    	}
				};
				
				var gendersQuery = {
			   		app: 'app.ms',
			    	service:'/parameters/genders',
			    	callback:function(response) {
			    		self.genders.removeAll();
			    		
			    		var tempGenders = [];
			    		ko.utils.arrayForEach(response.data, function(item){
			    			if(item.code != "I") {
			    				tempGenders.push(item);
			    			}
			    		});
			    		
			    		self.genders(tempGenders);
			    	}
				};
				
				etrAjax.multiGet([docTypesQuery,gendersQuery,countriesQuery]);
			}
			self.init();
			
			
//			self.isRequiredField = function(fieldName) {
//				
//				if(!self.apisFormMandatoryFields || self.apisFormMandatoryFields.length == 0) return true;
//				
//				for(var i=0; i < self.apisFormMandatoryFields.length; i++) {
//					if(fieldName === self.apisFormMandatoryFields[i]) {
//						return true;
//					}
//				}
//				
//				return false;
//			}
			
			self.apisFormValidationContext = ko.jqValidation({
				
				validationProperties : self.validationProperties,
				
                postValidators:[	
					  {
							name:"apisAgreementCheck",
							id:"apisAgreementLink",
							func:function() {
							if(!self.apisAgreement())
								return i18n.get("Error-REZ-98978");
							},
					  }
               ],
               customValidators : {
					approveContractControl : function(el) {
						var apisAgreement = self.apisAgreement();
						if(typeof(apisAgreement) == "undefined" || apisAgreement == false) {
							return i18n.get("Error-REZ-98978");
						}
					}
			    }
            });
			
			
			
			self.apisFormSavingLock = false;
			
			self.save = function() {
				
				if(self.apisFormSavingLock) {
					return;
				}
				
				var validationResult = self.apisFormValidationContext.Validate();
				
			    if (validationResult.valid) {
			    	
			    	var parentApisInfo = self.convertToApisInfo(self);
			    	
			    	// FILL INFANT PASSENGER INFO
			    	var infantApisInfo = null;
					if(self.infantPassenger) {
						if(self.infantPassenger != null) {
							infantApisInfo = self.convertToApisInfo(self.infantPassenger);
							//passenger.infantInfo.apiInfo = infantApisInfo;
						}
					}
			    	
			    	var pass = {
		    			'uuid': self.passenger.rph,
		    			'personalInfo': self.passenger.personalInfo, 
		    			'apiInfo': parentApisInfo
			    	};
			    	
			    	
			    	if(self.passenger.infantInfo){
			    		pass.infantInfo = { 
						    				'uuid': self.infantPassenger.passenger.rph,
						    				'apiInfo': infantApisInfo,
						    				'personalInfo': self.infantPassenger.passenger.personalInfo
							    		  }
			    	}
			    	
			    	
			    	self.apisFormSavingLock = true;
			    	
			    	var saveAPIInfo ={
			    			app: 'app.ibs',
			    			service:'/booking/apisinfo',
			    			data:pass,
			    			preErrorProperties: function() {
				    			self.apisFormSavingLock = false;
				    		},
			    			callback:function(response) {
			    				
			    				self.apisFormSavingLock = false;
			    				
			    				self.refreshPassengerApisInfo(self.passenger, response.data);
			    				if(self.passenger.infantInfo){
			    					self.refreshPassengerInfantApisInfo(self.infantPassenger, response.data.infantInfo);
			    				}
			    				self.passenger.changeApisFormStatus(self);
			    				self.showDetails(false);
			    				self.apisAgreement(false);
			    			}
			    	};
			    	etrAjax.post(saveAPIInfo);
			    }
			}
			
			self.toggle = function(data,element) {
				self.passenger.changeApisFormStatus(self,element);
			}	
			
			self.refreshPassengerApisInfo = function(passenger, newPassenger) {
				
				self.name(newPassenger.apiInfo.name ? newPassenger.apiInfo.name : "");
				self.surname(newPassenger.apiInfo.surname ? newPassenger.apiInfo.surname : "");
				self.birthday(newPassenger.apiInfo.birthday ? newPassenger.apiInfo.birthday : "");
				self.passportNumber(newPassenger.apiInfo.passportNumber ? newPassenger.apiInfo.passportNumber : "");
				self.citizenship(newPassenger.apiInfo.citizenship ? newPassenger.apiInfo.citizenship : "");
				self.passportFrom(newPassenger.apiInfo.passportFrom ? newPassenger.apiInfo.passportFrom : "");
				self.passportExpiry(newPassenger.apiInfo.passportExpiry ? newPassenger.apiInfo.passportExpiry : "");
				
				passenger.apiInfo.name = newPassenger.apiInfo.name ? newPassenger.apiInfo.name : ""
				passenger.apiInfo.surname = newPassenger.apiInfo.surname ? newPassenger.apiInfo.surname : ""
				passenger.apiInfo.birthday = newPassenger.apiInfo.birthday ? newPassenger.apiInfo.birthday : ""
				passenger.apiInfo.passportNumber = newPassenger.apiInfo.passportNumber ? newPassenger.apiInfo.passportNumber : ""
				passenger.apiInfo.citizenship = newPassenger.apiInfo.citizenship ? newPassenger.apiInfo.citizenship : ""
				passenger.apiInfo.passportFrom = newPassenger.apiInfo.passportFrom ? newPassenger.apiInfo.passportFrom : ""
				passenger.apiInfo.passportExpiry = newPassenger.apiInfo.passportExpiry ? newPassenger.apiInfo.passportExpiry : ""
				
				
				if(newPassenger.apiInfo.gender){
					self.gender(newPassenger.apiInfo.gender);
					passenger.apiInfo.gender = newPassenger.apiInfo.gender;
				}else{
					self.gender("");
					passenger.apiInfo.gender = "";
				}
				
				if(newPassenger.apiInfo.documentType){
					self.documentType(newPassenger.apiInfo.documentType);
					passenger.apiInfo.documentType = newPassenger.apiInfo.documentType;
				}else{
					self.documentType("");
					passenger.apiInfo.documentType = "";
				}
			}
			
			self.refreshPassengerInfantApisInfo = function(infantApisFormViewModel, newPassenger) {
				
				var passenger = infantApisFormViewModel.passenger;
				
				infantApisFormViewModel.name(newPassenger.apiInfo.name ? newPassenger.apiInfo.name : "");
				infantApisFormViewModel.surname(newPassenger.apiInfo.surname ? newPassenger.apiInfo.surname : "");
				infantApisFormViewModel.birthday(newPassenger.apiInfo.birthday ? newPassenger.apiInfo.birthday : "");
				infantApisFormViewModel.passportNumber(newPassenger.apiInfo.passportNumber ? newPassenger.apiInfo.passportNumber : "");
				infantApisFormViewModel.citizenship(newPassenger.apiInfo.citizenship ? newPassenger.apiInfo.citizenship : "");
				infantApisFormViewModel.passportFrom(newPassenger.apiInfo.passportFrom ? newPassenger.apiInfo.passportFrom : "");
				infantApisFormViewModel.passportExpiry(newPassenger.apiInfo.passportExpiry ? newPassenger.apiInfo.passportExpiry : "");
				
				passenger.apiInfo.name = newPassenger.apiInfo.name ? newPassenger.apiInfo.name : ""
				passenger.apiInfo.surname = newPassenger.apiInfo.surname ? newPassenger.apiInfo.surname : ""
				passenger.apiInfo.birthday = newPassenger.apiInfo.birthday ? newPassenger.apiInfo.birthday : ""
				passenger.apiInfo.passportNumber = newPassenger.apiInfo.passportNumber ? newPassenger.apiInfo.passportNumber : ""
				passenger.apiInfo.citizenship = newPassenger.apiInfo.citizenship ? newPassenger.apiInfo.citizenship : ""
				passenger.apiInfo.passportFrom = newPassenger.apiInfo.passportFrom ? newPassenger.apiInfo.passportFrom : ""
				passenger.apiInfo.passportExpiry = newPassenger.apiInfo.passportExpiry ? newPassenger.apiInfo.passportExpiry : ""
				
				
				if(newPassenger.apiInfo.gender){
					infantApisFormViewModel.gender(newPassenger.apiInfo.gender);
					passenger.apiInfo.gender = newPassenger.apiInfo.gender;
				}else{
					infantApisFormViewModel.gender("");
					passenger.apiInfo.gender = "";
				}
				
				if(newPassenger.apiInfo.documentType){
					infantApisFormViewModel.documentType(newPassenger.apiInfo.documentType);
					passenger.apiInfo.documentType = newPassenger.apiInfo.documentType;
				}else{
					infantApisFormViewModel.documentType("");
					passenger.apiInfo.documentType = "";
				}
			}
			
			self.convertToApisInfo = function(apisFormModel) {
				var convertedApiInfo = jQuery.extend(true, {}, apisFormModel.passenger.apiInfo);
				convertedApiInfo.name = apisFormModel.name();
				convertedApiInfo.surname = apisFormModel.surname();
				convertedApiInfo.birthday = apisFormModel.birthday();
				convertedApiInfo.passportNumber = apisFormModel.passportNumber();
				convertedApiInfo.citizenship = apisFormModel.citizenship();
				convertedApiInfo.passportFrom = apisFormModel.passportFrom();
				convertedApiInfo.passportExpiry = apisFormModel.passportExpiry();
		    	convertedApiInfo.gender = apisFormModel.gender();
		    	convertedApiInfo.documentType = apisFormModel.documentType();
		    	return convertedApiInfo;
			}
		}

	return { ViewModel: ApisFormViewModel };

});
	
