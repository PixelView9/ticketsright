define(['jquery',
        'knockout',
        'moment',
        'eteration/eteration',
        'eteration/ui/form-viewmodel',
        'eteration/eteration-ajax',
        'eteration/eteration-i18n',
        'eteration/ui/login-viewmodel',
        'eteration/ui/validation-helper',
        'eteration/eteration-urlparser',
        'eteration/widgets/ui-combodate',
        'eteration/widgets/ui-moment',
        'eteration/widgets/ui-spinner',
        'eteration/widgets/ui-common',
        'eteration/widgets/ui-etrselect',
        'eteration/widgets/ui-money',
        'eteration/widgets/ui-paxtype-count',
        'eteration/widgets/ui-name',
        'eteration/widgets/ui-emailpopover'
        ], 
        
	function($, ko, moment, Eteration, BaseViewModel, etrAjax, i18n, loginView, validationHelper, urlParser) {		

	
		function NonITTViewModel(passengers, callback) {
			for(var i= 0;i<passengers.length;i++){
				passengers[i].maxAgeOffset = ko.observable();
				passengers[i].minAgeOffset = ko.observable();
			}
			var self = this;
			ko.utils.extend(self, new BaseViewModel.FormViewModel());

			self.nonIttCallback = callback;
			self.passengers = ko.observableArray(passengers);
			self.newPaxTypes = ko.observableArray();
			self.newffpPrograms = ko.observableArray();
			self.apisAgreement = ko.observable(false);
			self.newSelectedPaxType = ko.observable();
			self.validationContext = ko.jqValidation();
			
			self.refresh = ko.observable(true);
			self.maxLength = ko.observable(0);
		
			
			self.ffpProgramsChange = function(selectedItem) {
				
				var maxLength = selectedItem.selectedNewFFPProgram() == 'TK' ? 9 : 13;
				self.maxLength(maxLength);
			}
			
	         self.paxTypeChange = function(selectedItem) {
	        		 self.refresh(false);
		        	 var paxAgeRange = self.findPaxAgeRange(selectedItem.newSelectedPaxType());
		        	 selectedItem.maxAgeOffset(paxAgeRange.maxAge);
		        	 selectedItem.minAgeOffset(paxAgeRange.minAge);
		        	 self.refresh(true);
			}
	         self.findPaxAgeRange = function(type){
	        	 
				var paxType = { maxAge: 0, minAge: 0 };
				var paxTypes = self.newPaxTypes();
				for(var i=0; i < paxTypes.length; i++) {
					var currentPaxType = paxTypes[i];
					if(currentPaxType.paxCode === type) {
						paxType = currentPaxType;
						break;
					}
				}
				return paxType;
			}
			
			var paxTypesForGet ={
	    			app: 'app.ibs',
	    			service:'/booking/paxtypecodesforreservation',
	    			callback:function(response) {
	    				self.newPaxTypes(response.data);
	    				
	    				var ffpProgramQuery = {
	    						app: 'app.ms',
	    				    	service:'/parameters/starallianceffpprograms',
	    				    	callback:function(response) {
	    				    		self.newffpPrograms.removeAll();
	    			    			self.newffpPrograms(response.data);
	    				    		
	    				    		var maxLength = self.newffpPrograms()[0].code == 'TK' ? 9 : 13;
	    				    		self.maxLength(maxLength);
	    				    		
	    				    		$("#paynowModal111").modal("show");
	    				    	}
	    				};
	    				etrAjax.get(ffpProgramQuery);
	    				for(var i= 0;i<passengers.length;i++){
	    		        	 if(passengers[i].newSelectedPaxType()){
	    		        		 self.paxTypeChange(passengers[i]);
	    		        	 } 
	    				}
	    			}
	    	};
	    	etrAjax.get(paxTypesForGet);
			
			
			self.closeNonIttModal = function() {
				$("#paynowModal111").modal("hide");
			}

			self.apisAgreementValidationContext = ko.jqValidation({
                postValidators:[
                    {
                        name:"apisAgreementCheck",
                        id:"apisAgreementCheck",
                        func:function() {
                            if(!self.apisAgreement())
                                return i18n.get("Error-ODM-02");
                        }
                    }
                ]
            });
			
			
			self.sendNonIttPassengers = function() {

				var validationResult = self.validationContext.Validate();
				var apisAgreementValidation = self.apisAgreementValidationContext.Validate();
			    if (apisAgreementValidation.valid && validationResult.valid) {
			    	
					var passengers = self.passengers();
					var nonIttPassengers = new Array();
					for(var i=0; i < passengers.length; i++) {
						var rph = passengers[i].rph;
						var paxType = passengers[i].newSelectedPaxType();
						var birthDate = passengers[i].newBirthdate();
						var ffpNumber = passengers[i].newFfp();
						var ffpProgram = passengers[i].selectedNewFFPProgram();
						
						var nonIttPassenger = {
							rph: rph,
							birthDate: birthDate,
							paxType: paxType,
							ffpNumber: ffpNumber,
						    ffpProgram: ffpProgram
						};
						nonIttPassengers.push(nonIttPassenger);
					}
					
					var sendNonIttPassengers ={
		    			app: 'app.ibs',
		    			service:'/booking/nonittpassengers',
		    			data: nonIttPassengers,
		    			callback:function(response) {
		    				if(response.data) {
		    					self.nonIttCallback();
		    				}
		    			}
			    	};
			    	etrAjax.post(sendNonIttPassengers);
			    } else {
			    	etrAjax.showErrorModal(['Error-EKH-07']);
			    	return;
			    }
		    	
			}

		}

	return { ViewModel: NonITTViewModel };

});
	
