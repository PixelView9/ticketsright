define(
		[ 'jquery', 
		  'knockout', 
		  'eteration/eteration',
		  'eteration/eteration-i18n', 
		  'eteration/ui/base-viewmodel',
		  'eteration/eteration-ajax',
		  './viewmodels/mytripsdashboard-viewmodel.js',
		  'eteration/eteration-urlparser','eteration/widgets/ui-frontend-controls'],
		  
		function($, ko, Eteration, i18n, BaseViewModel,etrAjax, MytripsDashboardViewModel, urlParser,fec) {
			$(document).ready(function() {
				   if(fec){
						fec.frontEndControls.setActivePageNumber(99);	
						fec.frontEndControls.applyPageLogic();	
				   }
			});
			i18n.loadMsgs([ 'ibs','timetable', 'common', 'payment', 'bup', 'ms', 'citylookup' , 'thirdparty'], function() {
				Eteration.loadStaticFragment({
					module : "mytripsdashboard",
					tmpl : "preDashboard",
					success : function() {
						
						ko.applyBindings(new BaseViewModel.BaseViewModel(), $("#mytripsdashboard")[0]);
						var urlPnr = urlParser.getUrlVar("pnr");
						var urlSurname = urlParser.getUrlVar("surname");
						var urlUsername = urlParser.getUrlVar("username");
						var urlSystemType = urlParser.getUrlVar("systemtype");
						var thankType = urlParser.getUrlVar("thanktype");
						var token = urlParser.getUrlVar("token");
						if(token){
							var searchReservationRequest = { 
									token:unescape(token)
									}
							etrAjax.post({
								app : 'app.ibs',
								service : '/booking/searchToken',
								data: searchReservationRequest,
								disableLoader:false,
								loaderName:'Select Flights',
								callback : function(response) {
									
									if(!response.data) {
										return;
									}
									urlPnr=response.data.pnr;
									urlSurname=response.data.surname;
									var mytripsDashboardViewModel = new MytripsDashboardViewModel.ViewModel(mytripsdashboardLinks);
									
									mytripsDashboardViewModel.initiliazeManageBookingDashboard(urlPnr, urlSurname, thankType,null,urlUsername,urlSystemType);
									
								}
							});
						}else{
							var mytripsDashboardViewModel = new MytripsDashboardViewModel.ViewModel(mytripsdashboardLinks);
							
							mytripsDashboardViewModel.initiliazeManageBookingDashboard(urlPnr, urlSurname, thankType,null,urlUsername,urlSystemType);
						}
					
						
						
						
					}
				});
			}, "mytripsdashboard");


		});
