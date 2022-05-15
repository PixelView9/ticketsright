define([
	'knockout',
	'eteration/eteration-ajax',
	'eteration/eteration-i18n',
	'eteration/eteration',
	'/com.thy.web.online.ibs/ibs/module/sendapprovalcode/viewmodels/sendapprovalcode-view.js',
	'eteration/widgets/ui-name',
	'eteration/widgets/ui-i18n',
	'eteration/widgets/ui-etrselect'
	], 

function(ko,etrAjax,i18n,Eteration,ApprovalCodeLightbox){
		
	    var ViewModel = function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	self.eventbus = value.eventbus;
	    	
	    	self.validationResult = ko.observable(false);
			self.contactInformation = ko.observable({});
			self.reservation = ko.observable(value.reservation);
			self.approvalCode = ko.observable("");
	    	self.isMobile = ko.observable(false);
	    	
	    	
	    	self.eventbus.addSubscriber(function(mobileViewFlag) {
	    		self.isMobile(mobileViewFlag);
	    	}, self, 'mobile_view_flag');
	    	
	    	
	    	self.registerSubscriberTopics = function() {
		    	self.eventbus.addSubscriber(function(contactInformation) {
		    		self.contactInformation(contactInformation);
		    	}, self, 'contact_information');
		    	
		    	
		    	self.eventbus.addSubscriber(function(validationResult) {
		    		self.validationResult(validationResult);
		    	}, self, 'modify_booking_validation_result');
	    	}
	    	
	    	self.registerSubscriberTopics();
	    	self.cancelContactInfoSave = function(){
	    		var contactInformation = {
    					selectedPrimaryContact: self.contactInformation().primaryContactRPH,
    					contactEmail: self.contactInformation().contactEmail,
    					contactPhone: self.contactInformation().contactPhone,
    					contactAreaCode: "",
    			}
    			self.eventbus.notifySubscribers(contactInformation, 'contact_information_response');
	    	}
	    	
	    	self.saveContactInfo = function() {
	    		self.eventbus.notifySubscribers(true, 'modify_booking_validation_result_provider');
				if (self.validationResult()) {
					self.eventbus.notifySubscribers(true, 'contact_information_provider');
                	var saveContactInfo = {
    			    		app: 'app.ibs',
    			    		service:'/booking/contactinfo',
    			    		data: self.contactInformation(),
    			    		callback:function(response) {
								if(response.data){
									var contactInformation = {
											selectedPrimaryContact: response.data.primaryContactRPH,
											contactEmail: response.data.contactEmail,
											contactPhone: response.data.contactPhone,
											contactAreaCode: "",
									}
									self.eventbus.notifySubscribers(contactInformation, 'contact_information_response');
								}
    			    		}
    				};
    				etrAjax.post(saveContactInfo);
                }
			}
			
			self.saveContactController = function () {
				if(self.reservation() && self.reservation().pnrOwner == "ITT" && !self.reservation().awdTicket){
					self.eventbus.notifySubscribers(true, 'modify_booking_validation_result_provider');
					if (self.validationResult()) {
						self.openApprovalCodeModal(self.saveContactInfo);
					}
				}
				else{
					self.saveContactInfo();
				}
			}

			self.openApprovalCodeModal = function(callback) {
				var approvalObject = {
					modalHeaderLabel: "approvalModal.label.infoChange",
					contactEmail: self.contactInformation().contactEmail,
					contactPhone: self.contactInformation().contactPhone,
					reason: "CONTACTUPD"
				}
				Eteration.loadStaticFragment({
					app:'app.ibs',
					module : 'sendapprovalcode',
					el:$('#approvalCodeModalContainer'),
					success : function() {
						ko.applyBindings(new ApprovalCodeLightbox.ViewModel(approvalObject, callback), $("#approvalCodeModalContainer")[0]);
					}
				});
			}
	    }
	    
	    return ViewModel;
});





