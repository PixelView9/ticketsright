define(['jquery',
        'knockout',
        'eteration/eteration',
        'eteration/eteration-ajax',
        'eteration/widgets/common/ui-event-bus',
        '../../mytrips/viewmodels/manageyourbooking-view.js',
        '../../businessupgrade/viewmodels/businessupgrade-view.js'
        ], 
        
	function($, ko, Eteration, etrAjax, eventbus, ManageYourBookingViewModel, BUP) {


		function MytripsDashboardViewModel(mytripsdashboardLinks) {
			
			var self = this;
			
			self.initiliazeManageBookingDashboard = function(urlPnr, urlSurname, thankType,tccManageBooking,username,systemType) {
				
				if(urlPnr && urlSurname){
					
					etrAjax.post({
						app : 'app.ibs',
						service : '/booking/searchreservation',
                        data: { pnr: urlPnr, surname: urlSurname, tccManageBooking: tccManageBooking , allowRedirect: true ,username:username,systemtype:systemType},
        				captchaCheck: true
					});
					
				}
				else {
					
					var request = {
						app : 'app.ibs',
						service : '/booking/reservation/',
						callback : function(response) {

							Eteration.loadStaticFragment({
										module : "mytrips",
										app : 'app.ibs',
										tmpl : 'manageyourbooking',
										el : $("#mytripsdashboard"),
										success : function() {
											
											var vm = new ManageYourBookingViewModel.ViewModel(response.data.surname, response.data, mytripsdashboardLinks, undefined, eventbus);
											vm.initFragmentsViaTemplate(vm, 'mytrips', 'manageyourbooking', 'app.ibs');

										}
							});

						}
					}
					
					if (thankType && thankType != null && thankType == "addbaby") {
						request.data = { "pagetype": thankType};
					} else {
						request.data = { "pagetype": "mytrips"};
					}

					etrAjax.get(request);
					
				}
			}
			
	}
		
	return { ViewModel: MytripsDashboardViewModel };

});
	

