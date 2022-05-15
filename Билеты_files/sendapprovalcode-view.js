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
		'eteration/widgets/common/ui-event-bus'
        ], 
        
	function($, ko, moment, Eteration, BaseViewModel, etrAjax, i18n, loginView, validationHelper, urlParser, eventbus) {		

	
		function ApprovalCodeViewModel(approvalObject, callback) {

			var self = this;
			ko.utils.extend(self, new BaseViewModel.FormViewModel());

			self.eventbus = eventbus;
			self.approvalCallback = callback;
			self.modalHeaderLabel = ko.observable(approvalObject.modalHeaderLabel || "");
			self.reservation = ko.observable(approvalObject.reservation || {});
			self.reason = ko.observable(approvalObject.reason || "");
			self.contactEmail = ko.observable(approvalObject.contactEmail || "");
			self.contactPhone = ko.observable(approvalObject.contactPhone ? approvalObject.contactPhone.replace("+", "") : "");
			self.approvalCode = ko.observable("");
			self.timeLeftToSendAgain = ko.observable();
			self.enableSendAgain = ko.observable(false);
			self.validationContext = ko.jqValidation();


			$('#approvalCodeModal').modal("show");
			self.approvalModalClose = function() {
				$("#approvalCodeModal").modal("hide");
			}

			$('#approvalCodeModal').on('hidden.bs.modal', function (event) {
				$('#approvalCodeModal').remove();
			});

			self.startTimer = function () {
				self.enableSendAgain(false);
				var timeLeft = 30;
				var sendAgainTimer = setInterval(function function1(){
					timeLeft -= 1;
					self.timeLeftToSendAgain("(" + timeLeft + "s)");
					if(timeLeft <= 0){
						clearInterval(sendAgainTimer);
						self.timeLeftToSendAgain("");
						self.enableSendAgain(true);
					}
				}, 1000);
			}
					
			self.retrieveApprovalCode = function (data, event) {
				self.startTimer();
				var docCodeDetails = {
					reason: self.reason() ? self.reason().substr(0, 10) : "OTHER"
				}
				var retrieveApprovalCode = {
						app: 'app.ibs',
						service:'/booking/retrieveapprovalcode',
						data: docCodeDetails,
						callback:function(response) {
							//show modal on start & if not send again
							//if(!event && !data) { $('#approvalCodeModal').modal("show"); }
						}
				};
				etrAjax.post(retrieveApprovalCode);
			}
			self.retrieveApprovalCode();

			self.isCodeValid = function () {
				var validationResult = self.validationContext.Validate();
				if(validationResult.valid){
					var docCodeDetails = {
						approvalCode: self.approvalCode()
					}
					var isCodeValid = {
							app: 'app.ibs',
							service:'/booking/isapprovalcodevalid',
							data: docCodeDetails,
							callback:function(response) {
								if(response.data){ 
									self.approvalModalClose();
									self.approvalCallback();
								}
							}
					};
					etrAjax.post(isCodeValid);
				}
			}
		}

	return { ViewModel: ApprovalCodeViewModel };
});
	
