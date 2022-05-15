define(['jquery',
		'knockout',
		'underscore',
		'moment',
		'eteration/eteration',
		'eteration/ui/form-viewmodel',
		'eteration/eteration-ajax',
		'eteration/eteration-i18n',
		'eteration/ui/login-viewmodel',
		'eteration/ui/validation-helper',
		'eteration/eteration-urlparser',
		'../../nonittlightbox/viewmodels/nonittlightbox-view.js',
		'../../mytripsapisform/viewmodels/mytripsapisform-view.js',
		'ui-helper/externalapp-helper',
		'../../businessupgrade/businessupgradeutil.js',
		'../../mytrips/viewmodels/util.js',
		'ui-helper/cookie-helper',
		'ui-helper/gtm-helper',
		'eteration/widgets/ui-flight',
		'eteration/widgets/ui-combodate',
		'eteration/widgets/ui-moment',
		'eteration/widgets/ui-spinner',
		'eteration/widgets/ui-common',
		'eteration/widgets/ui-etrselect',
		'eteration/widgets/ui-money',
		'eteration/widgets/ui-paxtype-count',
		'eteration/widgets/ui-name',
		'eteration/widgets/ui-sociallinks',
		'eteration/widgets/ui-timerange',
		'eteration/widgets/ui-emailpopover',
		'eteration/widgets/common/ui-flight-details',
		'jquery.printthis',
		'eteration/widgets/ui-cms',
		'eteration/widgets/ui-cms-smarttarget',
		'eteration/widgets/managebooking/ui-farerules',
		'eteration/widgets/managebooking/ui-totalpax',
		'eteration/widgets/managebooking/ui-totalprice',
		'eteration/widgets/managebooking/ui-res-pricebreakdowns',
		'eteration/widgets/managebooking/ui-res-passengerpaneltag',
		'eteration/widgets/managebooking/ui-res-mytripsunaccompaniedform',
		'mobile/mytrips-flight-panel',
		'mobile/ui-passengerlogo',
		'mobile/ui-passengerdetails',
		'common/ko-modal',
		'eteration/widgets/managebooking/ui-assistance-selector',
		'eteration/widgets/ui-selected-item-flight',
		'eteration/widgets/ui-flight-detail',
		'eteration/widgets/ui-layover',
		'eteration/widgets/ui-paymenttype-information',
		'eteration/widgets/common/ui-flight-type-title',
		'eteration/widgets/common/ui-flight-short-information-title',
		'eteration/widgets/booking/bookhotelnew/ui-bookhotelnew',
		'eteration/widgets/booking/carrentforthankyou/ui-carrentforthankyou',
		'eteration/widgets/booking/travelguardapp/ui-travelguardapp',
		'eteration/widgets/booking/touristanbul/ui-touristanbul',
		'eteration/widgets/managebooking/ui-awardticket-ms-information',
		'eteration/widgets/managebooking/ui-refund-card-information',
		'eteration/widgets/managebooking/ui-refund-card-owner-information',
		'eteration/widgets/managebooking/ui-refund-payment-owner-information',
		'eteration/widgets/managebooking/ui-refund-pricebreakdown-information',
		'eteration/widgets/managebooking/ui-managebooking-intro-title',
		'eteration/widgets/managebooking/ui-managebooking-route-information-title',
		'eteration/widgets/managebooking/ui-managebooking-route-datetime-information',
		'eteration/widgets/managebooking/ui-managebooking-pnr-information',
		'eteration/widgets/managebooking/ui-reservation-timelimit-section',
		'eteration/widgets/managebooking/ui-reissue-completion-message',
		'eteration/widgets/managebooking/ui-print-tool',
		'eteration/widgets/managebooking/ui-email-tool',
		'eteration/widgets/managebooking/ui-export-calendar-tool',
		'eteration/widgets/managebooking/ui-social-share-tool',
		'eteration/widgets/managebooking/ui-pnr-operation-tool',
		'eteration/widgets/managebooking/ui-business-upgrade-option',
		'eteration/widgets/booking/baggagerule/ui-baggagerule',
		'eteration/widgets/managebooking/ui-duration-information',
		'eteration/widgets/managebooking/ui-modify-booking-section-title',
		'eteration/widgets/managebooking/ui-add-flight-tool',
		'eteration/widgets/managebooking/ui-add-infant-tool',
		'eteration/widgets/managebooking/ui-change-flights-tool',
		'eteration/widgets/managebooking/ui-cancel-flight-tool',
		'eteration/widgets/managebooking/ui-modify-booking-tool',
		'eteration/widgets/managebooking/ui-subscription-options',
		'eteration/widgets/managebooking/ui-modify-booking-edit-button',
		'eteration/widgets/managebooking/ui-manage-booking-backbutton',
		'eteration/widgets/managebooking/ui-infant-spinner',
		'eteration/widgets/managebooking/ui-infant-form-list',
		'eteration/widgets/managebooking/ui-infant-savebutton',
		'eteration/widgets/managebooking/ui-agency-reservation-message',
		'eteration/widgets/managebooking/ui-tariff-change-message',
		'eteration/widgets/managebooking/chat-thy',
		'eteration/widgets/managebooking/ui-additionalservices-all-banner',
		'eteration/widgets/booking/gulfinsurance/ui-gulfinsurance',
		'eteration/widgets/common/ui-additional-services-tys',
		'eteration/widgets/common/ui-carbon-offset',
	],

	function($, ko, underscore, moment, Eteration, BaseViewModel, etrAjax, i18n, loginView, validationHelper, urlParser, NonIttlightBox,MytripsApisForm,ExternalAppHelper,BupUtil,Util,cookieHelper,gtmUtil) {

		function ManageYourBookingViewModel(surname, data, links, sortPassengers, eventbus) {

			var self = this;

			var i;
			var j;
			var k;

			ko.utils.extend(self, new BaseViewModel.FormViewModel());
			ko.utils.extend(self, new Util.ViewModel());
			self.isMobile = ko.observable(window.isPhoneOrTablet);
			sessionStorage.removeItem("tabSessionId");
			sessionStorage.removeItem("currentPageId");
			sessionStorage.removeItem("previousPageId");
			sessionStorage.removeItem("completeBooking");
			sessionStorage.removeItem("setTimerToClearTerminal");
			sessionStorage.setItem("managedByBooking", "managedByBooking");
			self.eventbus = eventbus;
			self.initialized = ko.observable(false);
			self.infantContentVisibility = ko.observable();
			self.manageBookingContentVisibility = ko.observable(true);
			self.seatMapContentUpdated = ko.observable(false);
			self.showExcessBaggageButton = ko.observable(data.excessBaggageAvailable);
			self.pureDomestic = ko.observable(false);
			self.mealActive = ko.observable(data.mealActive);
			self.totalMealPrice = ko.observable();
			self.tysOfferingActive = ko.observable(data.tysOfferingActive);
			self.eVisaSelectionAvailable = ko.observable(data.eVisaSelectionAvailable);
			self.additionalServicesPaneActive = ko.observable(data.additionalCardAvailable);
			self.isTkHolidayPnr = ko.observable(false);
			self.ydusActive = ko.observable(data.ydusActiveForReissue);
			self.carbonOffsetBaseLink = window.mytripsdashboardLinks && window.mytripsdashboardLinks.carbonOffsetBaseLink;

			self.isTkHolidayPnr = function () {
				if (data.tkholidayPnr) {
					$('#fareRulesDropdownWeb').remove();
					$('.fareRulesDropdownMobile').remove();
					$('#tkHolidayPnrModalWeb').modal("show");
					$('#tkHolidayPnrModalMobile').modal("show");
					return true;
				}
			}

			self.redirectCarbonOffset =function(){
				
				var queryString  = "?";
				var segmentCount = 0;
				for(var i=0; i < data.trips.length; i++) {
					var passengerCount = 0;
					for(var k=0; k < data.trips[i].flightInfo.passengers.length; k++) {
						var passengerCode = data.trips[i].flightInfo.passengers[k].personalInfo.passengerTypeCode;
						if(passengerCode != "INFANT") {
							passengerCount += 1;
						}
					}
					
					for(var j=0; j < data.trips[i].flightInfo.segments.length; j++) {
						queryString += "f["+segmentCount+"].d=" + data.trips[i].flightInfo.segments[j].originAirport.code + "&";
						queryString += "f["+segmentCount+"].a=" + data.trips[i].flightInfo.segments[j].destinationAirport.code + "&";
						queryString += "f["+segmentCount+"].p=" + passengerCount + "&";
						queryString += "f["+segmentCount+"].c=" + data.trips[i].flightInfo.cabinCode + "&";
						queryString += "f["+segmentCount+"].dt=" + moment(data.trips[i].flightInfo.firstSegment.departureDateTimeDisplayYearMonthDay).format('DDMMYYYY') + "&";
						queryString += "f["+segmentCount+"].f=" + data.trips[i].flightInfo.segments[j].flightNumber + "&";
						segmentCount += 1;
					}

					if(i == data.trips.length -1 ) {
						queryString += "s=W";
						break;
					}
					if(segmentCount > 4) {
						queryString += "s=W";
						break;
					}
				}
				
				return self.carbonOffsetBaseLink + queryString;
			}

			self.redirectHesPage = function() {
				etrAjax.get({
					app : 'app.ibs',
					service : '/booking/reservationredirecthes',
					disableLoader: true,
					callback : function(response) { }
				});
			}

			var openHelpDesk  = function(chatData, landingUrl){
				var element = document.createElement("chat-thy");
				$('body').append(element);
				var params = document.createAttribute("params");
				params.value = JSON.stringify({value: chatData, url: landingUrl});
				element.setAttributeNode(params);
				ko.applyBindings(null, element);
			};
			self.isCheckinVisible = ko.observable(false);
			self.ohalFlight = ko.observable(false);
			self.stopoverFlag = data.stopOverRightList && data.stopOverRightList.length > 0 ? true : false;
			self.stopoverLink = window.mytripsdashboardLinks && window.mytripsdashboardLinks.stopover;
			if(window.cId){
				self.salesOfficeCancelFormLink = window.mytripsdashboardLinks && window.mytripsdashboardLinks.salesOfficeCancelForm + "?cId=" + window.cId;
			} else {
				self.salesOfficeCancelFormLink = window.mytripsdashboardLinks && window.mytripsdashboardLinks.salesOfficeCancelForm;
			}
			if(!data.wkOrScStatus && data.hasWkOrScStatus) {
				self.eventbus.notifySubscribers(true, 'tariff_message_visibility');
			}
			var referrerUrl = document.referrer;
			if (urlParser.getUrlVarsLinkParam(referrerUrl)["meal"] != undefined && urlParser.getUrlVarsLinkParam(referrerUrl)["meal"] == "true") {
				setTimeout(function(){
					scrollToEl($('#passengersTabs'));
					$('[href="#mbmeals"]').trigger("click");
				},1500);
			}

			self.registerSubscriberTopics = function() {

				self.eventbus.addSubscriber(function(manageBookingContentVisibility) {
					self.manageBookingContentVisibility(manageBookingContentVisibility);
				}, self, 'managebooking_content_visibility');

				self.eventbus.addSubscriber(function(infantContentVisibility) {

					if(infantContentVisibility){
						$('#businessupgrade').hide();
					}
					else{
						$('#businessupgrade').show();
					}

					self.infantContentVisibility(infantContentVisibility);

				}, self, 'infant_content_visibility');

			}


			// INFO: When an independent component needs any data,
			//       The component uses these providers to obtain data.
			self.registerDataProviderSubscriberTopics = function() {

				self.eventbus.addSubscriber(function(notifyReservationProvider) {

					if(notifyReservationProvider) {
						self.notifyReservationChannel();
					}

				}, self, 'reservation_provider');


				self.eventbus.addSubscriber(function(nonittModalProvider) {

					if(nonittModalProvider) {
						self.eventbus.notifySubscribers(self.openNonIttModal, 'nonitt_modal');
					}

				}, self, 'notify_nonitt_modal_provider');


				self.eventbus.addSubscriber(function(thankyouPageTypeProvider) {

					if(thankyouPageTypeProvider) {
						self.eventbus.notifySubscribers(self.thnkpage(), 'thankyou_page_type');
					}

				}, self, 'thankyou_page_type_provider');


				self.eventbus.addSubscriber(function(thankyouPageOperationTypeProvider) {

					if(thankyouPageOperationTypeProvider) {
						self.eventbus.notifySubscribers(self.operationType(), 'thankyou_page_operation_type');
					}

				}, self, 'thankyou_page_operation_type_provider');


				self.eventbus.addSubscriber(function(mobileViewFlagProvider) {

					if(mobileViewFlagProvider) {
						self.eventbus.notifySubscribers(self.isMobile(), 'mobile_view_flag');
					}

				}, self, 'mobile_view_flag_provider');


				self.eventbus.addSubscriber(function(dateFormatProvider) {

					if(dateFormatProvider) {
						self.eventbus.notifySubscribers(self.dateFormat(), 'date_format');
					}

				}, self, 'date_format_provider');


				self.eventbus.addSubscriber(function(transactionDateFieldsProvider) {

					if(transactionDateFieldsProvider) {

						var transactionDateFields = {
							transactionDateLimit: self.transactionDateLimit(),
							transactionTimeLimit: self.transactionTimeLimit()
						}

						self.eventbus.notifySubscribers(transactionDateFields, 'transaction_date_fields');
					}

				}, self, 'transaction_date_fields_provider');


				self.eventbus.addSubscriber(function(icsUrlProvider) {

					if(icsUrlProvider) {
						self.eventbus.notifySubscribers(self.icsURL(), 'ics_url');
					}

				}, self, 'ics_url_provider');

				self.eventbus.addSubscriber(function(checkinButtonVisibility) {

					self.isCheckinVisible(checkinButtonVisibility);

				}, self, 'checkin_button_visibility');

			}

			self.registerSubscriberTopics();
			self.registerDataProviderSubscriberTopics();

			self.eventbus.notifySubscribers(false, 'infant_content_visibility');


			self.sortPassengers = (sortPassengers !== undefined) ? sortPassengers : true;

			self.links = null;

			self.isAssistanceSelectionSaved = ko.observable(false);

			self.textNone = ko.observable(i18n.get('Label-OCI-3007'));
			self.thnkpage = ko.observable("dashboard");
			self.refundtype = ko.observable();
			self.operationType = ko.observable();
			self.isPreOrderActive = ko.observable(false);

			self.agencyMessageAboutReservationPnr = ko.observable();

			self.validationProperties = ko.observableArray();

			self.ffpValidationContext = ko.jqValidation({});

			self.mbmealsValidationContext = ko.jqValidation({});

			self.mbassistanceValidationContext = ko.jqValidation({});

			var ticketDetailData= ExternalAppHelper.getTicketDetailForApps(data);
			self.ticketDetails = ko.observable(ticketDetailData);

			self.showOnlyBookHotel = ko.observable(false);
			self.destinationAirportCodeForShowingCarrent = ko.observable();

			if(self.ticketDetails()){
				self.destinationAirportCodeForShowingCarrent(self.ticketDetails().destinationAirport && self.ticketDetails().destinationAirport.code);
				var showCarRentOrNot = {
					app: 'app.additionalservices',
					service: '/carrental/searchStation?q=' + self.destinationAirportCodeForShowingCarrent(),
					disableLoader: true,
					callback: function(response) {
						if(response.data.airports.length > 0) {
							self.showOnlyBookHotel(false);
						}else {
							self.showOnlyBookHotel(true);
						}
					}
				}
				etrAjax.get(showCarRentOrNot);
			}
			self.preOrderActive = function(){
				etrAjax.get({
					app: 'app.ibs',
					service:'/booking/preorderactive',
					disableLoader : true,
					callback : function(response) {
						self.isPreOrderActive(response.data);
						if (self.isPreOrderActive() && self.reservation().preorderAvailable){
							self.totalMealPrice(self.reservation().totalMealPrice);
						}
					}
				});
			}
			self.preOrderActive();
			self.preferredMealLink = window.mytripsdashboardLinks ? window.mytripsdashboardLinks.preferredMealPage : "";


			self.openPreferredMealPage = function(){
				window.location.href = self.preferredMealLink + "?cId=" + getUrlVars()["cId"] + "&mytrips=true";
			}

			setTimeout(function () {
				if ($('#selectSeatTab').length && window.localStorage.getItem('seatSelected') == cId) {
					$("#selectSeatTab").click();
					if (navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)) {
						window.scrollTo(null,$('#selectSeatTab').offset().top - 100);
					} else {
						$('html, body').animate({
							scrollTop : $('#selectSeatTab').offset().top - 100
						}, 1000);
					}
				}
			},4000);

			etrAjax.get({
				app: 'app.ibs',
				service:'/parameters/validationpropertiesfromadmin',
				disableLoader : true,
				callback : function(response) {
					self.validationProperties(response.data);
				}
			});

			var refundType = urlParser.getUrlVar("refundtype");
			self.refundtype(refundType);


			var thankType = urlParser.getUrlVar("thanktype");
			if(typeof thankType != 'undefined') {
				if(thankType != null) {
					self.thnkpage(thankType);
				}
			}

			var operationType = urlParser.getUrlVar("operationType");
			if(typeof operationType != 'undefined' && operationType != null) {
				self.operationType(operationType);
			}


			if (typeof thankType != 'undefined') {
				if (thankType != null) {
					self.thnkpage(thankType);
					try {
						sessionStorage.setItem("previousPageId", sessionStorage
							.getItem("currentPageId"));
						sessionStorage.setItem("currentPageId", "6"); // thankyou=reissue
						sessionStorage.setItem("completeBooking", true);
					} catch (e) {

					}
				}
			}

			try {
				gtmUtil.pushMBPageInfo(data);
			}
			catch(e){
				console.log(e);
			}


			$(document).ready(function(){

				//ismobile scrollTop
				if(self.isMobile()){
					if($(document).height(0)){
						$("html, body").animate({ scrollTop: 0 }, "slow");
					}
				}

			});

			self.checkcIdForUrl = function(url){
				if (url != undefined || url != null){
					if (urlParser.getUrlVarsLinkParam(url).indexOf("cId") != -1){
						return url;
					}else{
						return url + "?cId=" + window.cId;
					}
				}
			}

			self.pnrLink = "";
			if(links) {
				self.links = links;
				if(window.cId) {
					self.pnrLink = self.checkcIdForUrl(links.myTripsDashboard);
					self.links.seatSelectionYUS = self.checkcIdForUrl(links.seatSelectionYUS);
					self.links.excessBaggageBannerLink = self.checkcIdForUrl(links.excessBaggageBannerLink);
					self.links.excessBaggage = self.checkcIdForUrl(links.excessBaggage);
					self.links.myTripsSeatSelection = self.checkcIdForUrl(links.myTripsSeatSelection);
					self.links.myTripsPaidSeatSelection = self.checkcIdForUrl(links.myTripsPaidSeatSelection);
					self.links.seatSelectionBannerLink = self.checkcIdForUrl(links.seatSelectionBannerLink);
					self.links.preferredMeal = self.checkcIdForUrl(links.preferredMeal);
				}
				else {
					self.pnrLink = links.myTripsDashboard;
				}
			}

			self.selectedMeal = ko.observable();
			self.mealChangedFlag = ko.observable(false);

			self.mealChangeFunction = function(passenger) {
				self.mealChangedFlag(true);
				self.mealSaved(false);
				self.clearAsYouWishMealForPassenger(passenger);
				passenger.mealInfo.valueHasMutated();
				$('.dropdownselect').selectpicker('refresh');
			}


			if(data.hasSpecialServiceChangedWarning){
				setTimeout(function(){
					$("#specialServiceChangedModal").modal("show");
				},500);
			}

			self.clearAsYouWishMealForPassenger = function(passenger) {
				passenger.asYouWishFirstMealCode("");
				passenger.asYouWishSecondMealCode("");

			}

			self.asyouwishMealChangeFunction = function() {
				//image icin cmsten yukleme kodlari eklenecek, alttakileri silersin sonra,gerek yok.
				self.mealChangedFlag(true);
				self.mealSaved(false);
			}


			self.selectedMealChange = function(passenger) {
				if(self.selectedMeal() == undefined){
					return true;
				}
				passenger.mealInfo.troyaCode = self.selectedMeal().troyaCode;
				passenger.mealInfo.desc = self.selectedMeal().desc;
				passenger.mealInfo.name = self.selectedMeal().name;
			}

			// START: SPEQ & LOUNGE DATA

			self.maxNumberOfSpeqColumns = ko.observable(2);
			if (data.purchasedAdditionalServices != null) {
				self.purchasedSportsEquipment = ko.observableArray(data.purchasedAdditionalServices.purchasedSpeqEquipmentList);
				self.purchasedLoungeInfo = ko.observableArray(data.purchasedAdditionalServices.purchasedLoungeInfoList);
			} else {
				self.purchasedSportsEquipment = ko.observable(null);
				self.purchasedLoungeInfo = ko.observable(null);
			}

			// FINISH: SPEQ & LOUNGE DATA

			self.textNoAssistanceNeeded = ko.observable(i18n.get('Label-REZ-DASH-31.default'));

			self.reissueWarningMsg = ko.observable();
			self.acceptOrChangeFlightProcessWarningMsg = ko.observable();

			self.hasExcessBaggage = function(){
				for (var i=0; i<self.reservation().passengers.length; i++) {
					var passenger = self.reservation().passengers[i];
					for (var j=0; j<passenger.specialServices.length; j++) {
						var specialService = passenger.specialServices[j];
						if(specialService != null && specialService.type != null && specialService.type.valueOf() == new String("XBAG").valueOf()){
							return true;
						}
					}
				}

				return false;
			}

			self.hasSeat = function(){
				for (var i=0; i<self.reservation().passengers.length; i++) {
					var passenger = self.reservation().passengers[i];
					for (var j=0; j<passenger.specialServices.length; j++) {
						var specialService = passenger.specialServices[j];
						if(specialService != null && specialService.type != null && specialService.type.valueOf() == new String("SEAT").valueOf()){
							return true;
						}
					}
				}

				return false;
			}

			self.hasMeal = function(){
				for (var i=0; i<self.reservation().passengers.length; i++) {
					var passenger = self.reservation().passengers[i];
					for (var j=0; j<passenger.specialServices.length; j++) {
						var specialService = passenger.specialServices[j];
						if(specialService != null && specialService.type != null && specialService.type.slice(-2) == 'ML'){
							return true;
						}
					}
				}
				return false;
			}

			self.hasSpecialService = function(){
				if(self.hasExcessBaggage() == true || self.hasSeat() == true || self.hasMeal()){
					return true;
				}
				return false;
			}

			self.isChangeFlightToolSelected = ko.observable();
			self.isCancelFlightToolSelected = ko.observable();
			self.isAddFlightToolSelected = ko.observable();

			self.selectChangeFlightTool = function(){
				self.isChangeFlightToolSelected(true);
				self.isCancelFlightToolSelected(false);
				self.isAddFlightToolSelected(false);
			}

			self.selectCancelFlightTool = function(){
				self.isChangeFlightToolSelected(false);
				self.isCancelFlightToolSelected(true);
				self.isAddFlightToolSelected(false);
			}

			self.selectAddFlightTool = function(){
				self.isChangeFlightToolSelected(false);
				self.isCancelFlightToolSelected(false);
				self.isAddFlightToolSelected(true);
			}

			self.showSpecialServicesRefundInfoModalForChangeFlightProcess = function(){
				$('#specialServicesRefundInfoModalForInvol').modal("show");
			}

			self.showSpecialServicesConfirmInfoModal = function(){
				$('#specialServicesConfirmInfoModalForInvol').modal("show");
			}

			self.specialServicesInvoluntaryInfoMsgStr = ko.observable();

			self.feedback = window.mytripsdashboardLinks ? window.mytripsdashboardLinks.feedback : "";
			self.mealtermsandconditions = window.mytripsdashboardLinks ? window.mytripsdashboardLinks.mealtermsandconditions : "";

			self.specialServicesInvoluntaryInfoMsg = function(){
				var eb = self.hasExcessBaggage();
				var es = self.hasSeat();
				var ml = self.hasMeal();

				if(es == true && eb == false && ml == false) { return 'mytrips.seatEMDinvol1' }
				if(eb == true && es == false && ml == false) { return 'mytrips.bgEMDinvol2' }
				if(eb == true && es == true && ml == false) { return 'mytrips.seatbgEMDinvol3' }
				if(eb == false && es == false && ml == true) { return 'mytrips.mealEMDinvol4' }
				if(ml == true && (es == true || eb == true)) { return 'mytrips.mealEMDinvol5' }

				return "";
			}

			self.specialServicesVoluntaryInfoMsgStr = ko.observable();

			self.specialServicesVoluntaryInfoMsg = function(){
				var eb = self.hasExcessBaggage();
				var es = self.hasSeat();
				var ml = self.hasMeal();

				if(es == true && eb == false && ml == false) { return 'mytrips.seatEMDvol1' }
				if(eb == true && es == false && ml == false) { return 'mytrips.bgEMDvol2' }
				if(eb == true && es == true && ml == false) { return 'mytrips.seatbgEMDvol3' }
				if(eb == false && es == false && ml == true) { return 'mytrips.mealEMDvol4' }
				if(ml == true && (es == true || eb == true)) { return 'mytrips.mealEMDvol5' }

				return "";
			}

			self.isPreOrderActive.subscribe(function(value) {
				if(value) {
					self.specialServicesInvoluntaryInfoMsgStr(self.specialServicesInvoluntaryInfoMsg());
					self.specialServicesVoluntaryInfoMsgStr(self.specialServicesVoluntaryInfoMsg());
				}
			});

			self.showMoreFlag = ko.observable(false);

			self.showMore = function(){
				self.showMoreFlag(!self.showMoreFlag());
			}

			self.icsURL = ko.observable(etrAjax.getAppURL("app.ibs")+"/booking/reservation/ics/" + i18n.getUserLocale() +"/" + etrAjax.getConversationId());
			if(urlParser.getUrlVar("thanktype") != "reissue" && data.wkOrScStatus && !(data.purgePnr || data.canceled)){
				var flightId = "";
				var indextForLast = 0;
				for(i = 0; i < data.trips.length; i++) {
					data.trips[i].flightInfo.tempAdd = false;
					if(data.paid) {
						if(flightId == data.trips[i].flightInfo.id) {
							data.trips[indextForLast].flightInfo.segments[0].wkSegment = undefined;
							if(data.trips.length > 3 ){
								data.trips.splice((i-1),1);
							}else{
								data.trips.splice(i,1);
							}
							i--;

						} else {
							flightId = data.trips[i].flightInfo.id;
							indextForLast = i;
						}
					}
				}

				if(data.paid && data.trips.length > 1) {
					var selectedFlightIndex = -1;
					var selectedFlightSegmentIndex = -1;
					var allCount = data.trips.length * data.trips[0].flightInfo.segments.length;
					for(i = 0; i < data.trips.length; i++) {
						for(j = 0; j < (data.trips[i] != null && data.trips[i].flightInfo != null && data.trips[i].flightInfo.segments.length); j++) {
							if(data.trips[i].flightInfo.segments[j].wkSegment != undefined && data.trips[i].flightInfo.segments[j].wkSegment == true) {
								selectedFlightIndex = i;
								selectedFlightSegmentIndex = j;
							} else if(selectedFlightIndex > -1 && selectedFlightSegmentIndex > -1 && selectedFlightIndex != i && data.trips[i].flightInfo.segments[j].wkSegment == false && data.trips[i].flightInfo.segments[j].scSegment == true) {
								data.trips[selectedFlightIndex].flightInfo.segments.push(data.trips[i].flightInfo.segments[j]);
								if(i > 0) {
									if(data.trips.length > 2) {
										data.trips.splice(i,1);
									} else {
										data.trips[i].flightInfo.tempAdd = true;
										if(allCount > 2) {
											data.trips[i].flightInfo.segments = data.trips[i-1].flightInfo.segments;
										}
									}
								}

								selectedFlightIndex = -1;
								selectedFlightSegmentIndex = -1;
							}
						}
					}
				}

				if(data.indicator != null && data.segmentInvoluntaryIndicatorListRph.length>0){
					setTimeout(function(){
						if(data.awdTicket || data.tccPortalPnr){
							$('#irrTccOrAwdTicketInfoModal').modal("show");
						}else{
							$('#irrInfoModal').modal("show");
						}
					},500);
				}else if(!data.paid && data.reservationOptionPaymentInfo){
					//ucretli rhs irr durumunda iade bilgisi icin popup
					setTimeout(function(){
						$('#rhsRefundInfoModal').modal("show");
					},500);
				}
			}

			if(data.awdTicket && !data.awardTicketPaidWithMiles && urlParser.getUrlVar("thanktype") != null && urlParser.getUrlVar("thanktype") == "addbaby") {
				if(data.trips[0].flightInfo.passengers[0].passengerType = "INFANT") {
					data.grandTotalFare = data.trips[0].flightInfo.passengers[0].priceDetail.totalPrice;
				}
			}

			self.reservation = ko.observable(data);

			self.specialServicesInvoluntaryInfoMsgStr(self.specialServicesInvoluntaryInfoMsg());
			self.specialServicesVoluntaryInfoMsgStr(self.specialServicesVoluntaryInfoMsg());

			var reservationOption = self.reservation().reservationOption;
			var hasReservationOptionFare = self.reservation().hasReservationOptionFare;

			self.checkReservationOption = function() {
				if(reservationOption && !hasReservationOptionFare) {
					$('#reservationOptionRefundInformation').modal('show');
				}
			}

			self.hasVaccDiscount = ko.observable(false);
			if(self.reservation().hasVaccDiscount) {
				self.hasVaccDiscount = ko.observable(true);
			}

			self.reservationOptionRefundInformationLabel = ko.observable(i18n.get('Label-OB-327'));
			self.reservationOptionRefund = function() {
				var refundRequest = {
					app: 'app.ibs',
					service: '/booking/reservationOptionRefund',
					disableLoader: false,
					callback: function(response) {
						console.log(response);
						self.reservationOptionRefundInformationLabel(i18n.get('Label-OB-327'));
					},
					preErrorProperties: {
						preErrorFunction : function() {
							self.reservationOptionRefundInformationLabel(i18n.get('Label-OB-328'));
						}
					},
					complete: function() {
						$('.modal').modal('hide');
						$('#reservationOptionRefund').modal('show');
					}
				}
				etrAjax.get(refundRequest);
			}


			$(document).ready(function(){
				if(self.reservation().wkOrScStatus && !self.reservation().ohalFlight && self.reservation().paid){ //ohalpopup ile icerik karisikligini engelleme
					setTimeout(function(){
						self.changeFlightPopup();
					},500);
				}
			});



			self.refactorMobileView = function(){
//				var tdCount = self.totalSegmentSize() + 1;
//				$("table#seatSettingsMobile1 tr td #seatSettingsMobile tr td").css({width: (($(window).width()-30)/tdCount)})
			}

			self.paymentLogoName = (self.reservation().paymentInfo && $.inArray(self.reservation().paymentInfo.paymentType, window.paymentTypes) > -1) ? self.reservation().paymentInfo.paymentType : '';

			self.findPassengerInPnr = function(passenger) {

				var currentPassenger = passenger;
				var pnrPassengers = self.passengers();

				for(var i = 0; i < pnrPassengers.length; i++) {

					var pnrPassenger = pnrPassengers[i];

					if(passenger.rph == pnrPassenger.rph) {
						currentPassenger = pnrPassenger;
						break;
					}
				}

				return currentPassenger;
			}


			self.createBaggageInformationMessagesForFlights = function(reservation) {

				var trips = reservation.trips;
				var passengers = reservation.passengers;
				for(var i = 0; i < passengers.length; i++) {
					var passenger = passengers[i];
					reservation.baggageData[i] = { 'baggages': [], 'passenger': passenger };

					var baggageCounter = 0;
					for(k = 0; k < trips.length; k++) {
						var segments = trips[k].flightInfo.segments;
						for(var j = 0; j < segments.length; j++) {
							var baggageItem = {
								"baggageNotFoundmessage": "#Baggage not found!#"
							}
							reservation.baggageData[i].baggages[baggageCounter] = baggageItem;
							baggageCounter++;
						}
					}
				}
			}

			self.findInvalidBaggages = function(baggageDataList) {
				for(var i = 0; i < baggageDataList.length; i++) {
					var baggageData = baggageDataList[i];
					for(var k = 0; k < baggageData.baggages.length; k++) {
						var baggage = baggageData.baggages[k];
						if (!baggage || (baggage.piece && baggage.piece <= 0) || (baggage.weight && baggage.weight <= 0)) {
							baggage.baggageNotFoundmessage = "#Baggage not found!#";
						}

					}
				}
			}

			self.changePassengers = function(reservation) {

				var baggageData = reservation.baggageData;

				var sortedBaggageData = new Array();
				for(var i = 0; i < baggageData.length; i++) {
					var passenger = baggageData[i].passenger;
					if(passenger.passengerType != 'INFANT') {
						sortedBaggageData.push(baggageData[i]);
						if(passenger.infantInfo != null) {
							var infantBaggageData = self.findInfantBaggageData(passenger.infantInfo, baggageData);
							if(infantBaggageData != null) {
								sortedBaggageData.push(infantBaggageData);
							}
						}
					}
				}

				self.reservation().baggageData = sortedBaggageData;

			}


			for(i = 0; i < self.reservation().trips.length; i++) {
				self.reservation().trips[i].flightInfo.isUpgradeAvailable = ko.observable(false);
				self.reservation().trips[i].flightInfo.bupCheckboxVisibility = ko.observable(false);
			}


			self.paxTypeKeys = function (paxTypesObject) {
				var keys = [];
				for(var field in paxTypesObject) {
					if (paxTypesObject.hasOwnProperty(field))
						keys.push(field);
				}
				return keys;
			}

			self.calculatePaxCount = function(paxTypeAndCount) {

				var thankType = urlParser.getUrlVar("thanktype");
				var removeOtherPaxTypes = thankType && thankType == "addbaby";

				var paxCount = 0;
				var keys = self.paxTypeKeys(paxTypeAndCount);
				for(var i = 0; i < keys.length; i++) {
					var key = keys[i];
					if(removeOtherPaxTypes) {
						if(key == "INFANT") {
							paxCount += paxTypeAndCount[key];
						}
					}
					else {
						paxCount += paxTypeAndCount[key];
					}
				}
				return paxCount;
			}


			self.updateContactListFullNames = function(passengers) {

				if(!passengers) return;

				for(var i = 0; i < passengers.length; i++) {
					var passenger = passengers[i];

					var personalInformationTranslationArgs = {
						"titlelookup": (("empty" == passenger.personalInfo.title) ? passenger.personalInfo.title : passenger.personalInfo.title.toUpperCase()),
						"displayName": passenger.personalInfo.name + " " + passenger.personalInfo.surname
					}


					var passengerFullName = i18n.getWithArgs("TextField-OB-185", personalInformationTranslationArgs);

					if(!passengerFullName || passengerFullName === "TextField-OB-185") {

						var passengerTitle = i18n.get("titlelookup." + (("empty" == passenger.personalInfo.title) ? passenger.personalInfo.title : passenger.personalInfo.title.toUpperCase())) || "";

						if(passengerTitle === "titlelookup." + (("empty" == passenger.personalInfo.title) ? passenger.personalInfo.title : passenger.personalInfo.title.toUpperCase())) {
							passengerTitle = "";
						}

						passengerFullName = (passengerTitle + " " + passenger.personalInfo.name + " " + passenger.personalInfo.surname);

					}

					passenger.fullName = passengerFullName;
				}

			}

			self.updateContactListFullNames(data.contactList);
//			self.translatePassengerTitles(data.passengers);

			self.timeLimitOptionHour = self.reservation().ticketTimeLimit== null ? null : ko.observable(moment.utc(self.reservation().ticketTimeLimit));
			self.timeLimitOptionAmPm = self.reservation().ticketTimeLimit== null ? null : ko.observable(self.formatTimeWithEnglishLocalMoment(self.reservation().ticketTimeLimit,"a"));
			self.timeLimitOptionYear = self.reservation().ticketTimeLimit== null ? null : ko.observable(moment.utc(self.reservation().ticketTimeLimit));

			var transactionDate = self.reservation().transactionDate;
			var momentObject = transactionDate ? moment(transactionDate) : moment();
			var transactionDateLimitInStr = momentObject.format(self.dateFormat().fulldate);
			var transactionTimeLimitInStr = momentObject.format("HH:mm");

			self.transactionDateLimit = ko.observable(transactionDateLimitInStr);
			self.transactionTimeLimit = ko.observable(transactionTimeLimitInStr);

			var timeLimit = (self.reservation().tickets != null && self.reservation().tickets.length > 0 && self.reservation().tickets[0]) ? self.reservation().tickets[0].timeLimit : 0;
			var formattedTimeLimit = moment(timeLimit);
			var today = moment();

			var duration = moment.duration(formattedTimeLimit.diff(today));
			var hours = duration.asHours();
			hours = parseInt(hours % 24);
			var days = parseInt(hours / 24);

			self.optionsEndTimeLimitDays = ko.observable(days);
			self.optionsEndTimeLimitHours = ko.observable(hours);

			self.trips = ko.observableArray(self.reservation().trips);
			self.passengers = ko.observableArray();
			self.passengerResidualEmdNum = ko.observable("");
			self.passengerNewTicketNum = ko.observable("");
			self.countSize = ko.observable(data.trips.length);

			for(i = 0; i < self.reservation().trips.length;i++) {
				for(j = 0; j < self.reservation().trips[i].flightInfo.segments.length; j++) {
					if(self.reservation().trips[i].flightInfo.segments[j].originAirport.country == null)
						self.reservation().trips[i].flightInfo.segments[j].originAirport.country = {"code":self.reservation().trips[i].flightInfo.segments[j].originAirport.code};
					if(self.reservation().trips[i].flightInfo.segments[j].destinationAirport.country == null)
						self.reservation().trips[i].flightInfo.segments[j].destinationAirport.country = {"code":self.reservation().trips[i].flightInfo.segments[j].destinationAirport.code};
				}
			}

			for(i = 0; i < data.trips.length;i++) {
				for(j = 0; j < data.trips[i].flightInfo.segments.length; j++) {
					if(data.trips[i].flightInfo.segments[j].originAirport.country == null)
						data.trips[i].flightInfo.segments[j].originAirport.country = {"code":data.trips[i].flightInfo.segments[j].originAirport.code};
					if(data.trips[i].flightInfo.segments[j].destinationAirport.country == null)
						data.trips[i].flightInfo.segments[j].destinationAirport.country = {"code":data.trips[i].flightInfo.segments[j].destinationAirport.code};
				}

				if(data.trips[i].flightInfo.firstSegment.originAirport.country == null)
					data.trips[i].flightInfo.firstSegment.originAirport.country = {"code":data.trips[i].flightInfo.firstSegment.originAirport.code};
				if(data.trips[i].flightInfo.firstSegment.destinationAirport.country == null)
					data.trips[i].flightInfo.firstSegment.destinationAirport.country = {"code":data.trips[i].flightInfo.firstSegment.destinationAirport.code};
			}

			self.firstTrip = ko.observable(data.trips[0]);
			self.lastTrip = ko.observable(data.trips[data.trips.length-1]);


			var firstTripFormattedDepartureDate = undefined;
			var lastTripFormattedDepartureDate = undefined;

			if(self.trips().length > 0) {
				firstTripFormattedDepartureDate = moment.utc(self.firstTrip().flightInfo.firstSegment.departureDateTime + self.firstTrip().flightInfo.firstSegment.departureDateTimeTimeZoneRawOffset).format(self.dateFormat().fulldayfullmonth);
				lastTripFormattedDepartureDate = moment.utc(self.lastTrip().flightInfo.firstSegment.arrivalDateTime + self.lastTrip().flightInfo.firstSegment.arrivalDateTimeTimeZoneRawOffset).format(self.dateFormat().fulldayfullmonth);
			}

			self.firstTripFormattedDepartureDate = ko.observable(firstTripFormattedDepartureDate);
			self.lastTripFormattedDepartureDate = ko.observable(lastTripFormattedDepartureDate);

			self.availablePassengerForAddingBaby = ko.observableArray();

			self.paid =  ko.observable(data.tickets[0] ? (data.tickets[0].timeLimit==null) : false);

			self.isPayAndFlyVisible = ko.observable(!self.paid() && !self.reservation().wkOrScStatus && !self.reservation().eftreservation);

			self.isTimeToCheckinVisible = ko.observable(self.paid() && !self.reservation().allFlightsCheckIn && !self.reservation().purgePnr && !self.reservation().canceled && ( self.reservation().closestFlightToCheckin ? self.reservation().closestFlightToCheckin.timeToCheckinOpen > 0 : false ) );

			self.timeToCheckin = ko.observable();
			self.isVisiblePaidSeat = ko.observable(false);
			self.isVisibleffpPrograms = ko.observable(true);
			if(self.isTimeToCheckinVisible()){
				var daysToCheckin = ko.bindingHandlers.commonconverts.convertToDay(self.reservation().closestFlightToCheckin.timeToCheckinOpen);
				var hoursToCheckin = ko.bindingHandlers.commonconverts.convertToHour(self.reservation().closestFlightToCheckin.timeToCheckinOpen);
				var minutesToCheckin = ko.bindingHandlers.commonconverts.convertToMinute(self.reservation().closestFlightToCheckin.timeToCheckinOpen);
				if(daysToCheckin > 0) {
					var canPaidSeat = true;
					for(i = 0; i < data.trips.length; i++) {
						if(self.reservation().trips[i].flightInfo && self.reservation().trips[i].flightInfo.paidSeatPrice) {
							canPaidSeat = false;
						}
					}
					self.isVisiblePaidSeat = ko.observable((daysToCheckin < 100 || daysToCheckin > 2) && canPaidSeat);
					self.timeToCheckin(i18n.getWithArgs("TextField-REZ-LOGIN-201", {'day': daysToCheckin, 'hour': hoursToCheckin}));
				} else if(hoursToCheckin > 0) {
					self.isVisibleffpPrograms(false);
					self.timeToCheckin(i18n.getWithArgs("TextField-REZ-LOGIN-201.hour", {'hour': hoursToCheckin, 'minute': minutesToCheckin}));
				} else {
					self.isVisibleffpPrograms(false);
					self.timeToCheckin(i18n.getWithArgs("TextField-REZ-LOGIN-201.minute", {'minute': minutesToCheckin}));
				}
			}

			self.isCheckinVisible = ko.observable(!self.isTimeToCheckinVisible() && self.paid() && self.thnkpage() == 'dashboard' && self.reservation().allFlightsCheckIn && !self.reservation().purgePnr && !self.reservation().canceled);
			if(self.isCheckinVisible()){
				self.isVisibleffpPrograms(false);
				self.reservation().chargableSeatAvailable = false;
			}
			self.ohalFlight(self.reservation().ohalFlight);
			self.ffpPrograms = ko.observableArray();
			self.newffpPrograms = ko.observableArray();

			self.selectedFFPProgram = ko.observable();

			self.showBreakdown = ko.observable(false);

			self.isCardSubmitRequired = ko.observable(false);
			self.cardType = ko.observable();

			self.assistanceOptions = ko.observableArray();
			self.meals = ko.observableArray();
			self.docTypes = ko.observableArray();
			self.countries = ko.observableArray();

			self.mailForm = ko.observable("<div class='input-group'>"+
				"<input type='text' style='width:195px' maxlength='50' class='form-control'>"+
				"<span class='input-group-btn'>"+
				"<button class='btn btn-danger' type='button' data-bind=\"i18n-text: { key : 'Label-REZ-DASH-77565' }\"></button>"+
				"</span></div>");

			self.hasOpenedApisForm = function(apisFormModels) {
				var result = false;
				for(var i = 0; i < apisFormModels.length; i++) {
					result = result || apisFormModels[i].showDetails();
				}
				return result;
			}

			self.hideApisInfoForm = function() {
				self.seatMapContentUpdated(false);
				var apisFormModels = self.apisFormModels();
				if(self.hasOpenedApisForm(apisFormModels)) {
					for(var i = 0; i < apisFormModels.length; i++) {
						self.changeApisFormButtonApperance(apisFormModels[i]);
						apisFormModels[i].showDetails(false);
					}
				}
			}

			self.loadSeatMapData = function() {

				self.hideApisInfoForm();

				var reservation = self.reservation();
				for(var i = 0; i < reservation.trips.length; i++) {
					if(reservation.trips[i] != null) {
						var segments = reservation.trips[i].flightInfo.segments;
						for(var j = 0; j < segments.length; j++) {
							if(self.isCheckinVisible()) {
								segments[j].seatMapAvailable = false;
							}
							else if ((segments[j].spa || segments[j].codeShare) && !segments[j].anadoluJet){
								segments[j].seatMapAvailable = false;
							}
							else {
								segments[j].seatMapAvailable = reservation.seatOfferAvailable;
							}
						}
					}
				}

				self.seatMapContentUpdated(true);

//				var seatmapDataRequest ={
//			   		app: 'app.ibs',
//			    	service:'/booking/seatmapdata',
//			    	disableLoader: true,
//			    	callback:function(response) {
//			    		if(response.data){
//			    			var trips = response.data;
//				    		var reservation = self.reservation();
//
//				    		for(var i = 0; i < trips.length; i++) {
//
//				    			var segments = trips[i].flightInfo.segments;
//				    			if(reservation.trips[i] != null) {
//				    				var originalSegments = reservation.trips[i].flightInfo.segments;
//				    				for(var j = 0; j < segments.length; j++) {
//
//					    				var currentSegment = segments[j];
//					    				var currentOriginalSegment = originalSegments[j];
//
//					    				currentOriginalSegment.planeMap = currentSegment.planeMap;
//					    				currentOriginalSegment.seatMapAvailable = currentOriginalSegment.planeMap != null ? true : false;
//
//										if(self.isCheckinVisible()){
//											currentOriginalSegment.seatMapAvailable = false;
//										}
//					    			}
//				    			}
//
//
//
//				    		}
//
//				    		self.seatMapContentUpdated(true);
//			    		}
//		    		}
//				}
//
//				etrAjax.get(seatmapDataRequest);
			}


			self.hasEmptyFields = function(passenger) {

				var name = passenger.apiInfo.name;
				var surname = passenger.apiInfo.surname;
				var birthdate = passenger.apiInfo.birthday;
				var passportNumber = passenger.apiInfo.passportNumber;
				var citizenship = passenger.apiInfo.citizenship;
				var passportFrom = passenger.apiInfo.passportFrom;
				var passportExpiry = passenger.apiInfo.passportExpiry;
				var gender = passenger.apiInfo.gender;
				var documentType = passenger.apiInfo.documentType;

				var hasEmpty = false;
				var apisFields = [ name, surname, birthdate, passportNumber, citizenship, passportFrom, passportExpiry, gender, documentType ];
				for(var  i=0; i < apisFields.length; i++) {
					var fieldVal = apisFields[i];
					if(!fieldVal) {
						hasEmpty = true;
						break;
					}
				}

				return hasEmpty;
			}

			self.getLinkDetails = function(passenger) {
				var hasEmpty = self.hasEmptyFields(passenger);
				var key = hasEmpty ? i18n.get('TextField-REZ-DASH-05.missing') : i18n.get('TextField-REZ-DASH-05.complete');
				var color = hasEmpty ? "red" : "black";

				return {
					'key': key,
					'color': color,
					'hasEmpty': hasEmpty
				};
			}


			self.showPriceBreakDown = function(){
				self.showBreakdown(!self.showBreakdown());
			};

			self.findParentPassenger = function(passenger) {
				var currentPassenger = null;
				var passengers = self.reservation().passengers;
				for(var i = 0; i < passengers.length; i++) {
					if(passengers[i].infantInfo) {
						if(passengers[i].infantInfo != null) {
							if(passengers[i].infantInfo.rph == passenger.rph) {
								currentPassenger = passengers[i];
								break;
							}
						}
					}
				}
				return currentPassenger;
			}


			self.createPassengerApisFormModels = function(passengers) {

				var apisFormModels = [];
				for(var i = 0; i < passengers.length; i++) {

					var passenger = passengers[i];
					var infantPassenger;
					if(passenger.infantInfo) {
						if(passenger.infantInfo != null) {
							infantPassenger = new MytripsApisForm.ViewModel({
								'links' : self.links,
								'passenger' : passenger.infantInfo,
								'apisAvailable' : self.reservation().apisAvailable,
								'validationPropertiesOfApis' : self.reservation().validationPropertiesOfApis
							});
						}
					}

					var data = {
						'links' : self.links,
						'passenger' : passenger,
						'infantPassenger' : infantPassenger,
						'apisAvailable' : self.reservation().apisAvailable,
						'validationPropertiesOfApis' : self.reservation().validationPropertiesOfApis
					}
					var apisFormModel = new MytripsApisForm.ViewModel(data);
					apisFormModel.index(i);
					apisFormModels[i] = apisFormModel;
					passenger.apisFormModel = ko.observable(apisFormModel);
				}
				return apisFormModels;
			}

			self.apisFormModels = ko.observableArray();
			self.changeApisFormButtonApperance = function(apisFormModel) {

				var passenger = apisFormModel.passenger;
				var linkDetails = self.getLinkDetails(passenger);
				var key = linkDetails.key;
				if(linkDetails.hasEmpty) {
					key = i18n.get("TextField-REZ-DASH-05.missing");
				}
				if(linkDetails.hasEmpty && apisFormModel.showDetails()) {
					key = linkDetails.key;
				}

				passenger.linkDetailKey(key);
				passenger.linkcss(linkDetails.color);

				if(passenger.personalInfo.travelingWithInfant) {
					linkDetails = self.getLinkDetails(passenger.infantInfo);
					if(passenger.infantPassenger) {
						if(passenger.infantPassenger != null) {
							passenger.infantPassenger.linkDetailKey(linkDetails.key);
							passenger.infantPassenger.linkcss(linkDetails.color);

							var parentLinkDetails = self.getLinkDetails(passenger);
							if(!linkDetails.hasEmpty) {
								if(linkDetails.hasEmpty) {
									key = i18n.get("TextField-REZ-DASH-05.missing");
									passenger.linkDetailKey(key);
								}
								else {
									passenger.linkDetailKey(parentLinkDetails.key);
								}
								if((linkDetails.hasEmpty || parentLinkDetails.hasEmpty) && apisFormModel.showDetails()) {
									key = parentLinkDetails.key;
									passenger.linkDetailKey(key);
								}
								passenger.linkcss(parentLinkDetails.color);
							}
							else {
								if(linkDetails.hasEmpty) {
									key = i18n.get("TextField-REZ-DASH-05.missing");
									passenger.linkDetailKey(key);
								}
								else {
									passenger.linkDetailKey(linkDetails.key);
								}
								if((linkDetails.hasEmpty || parentLinkDetails.hasEmpty) && apisFormModel.showDetails()) {
									key = linkDetails.key;
									passenger.linkDetailKey(key);
								}
								passenger.linkcss(linkDetails.color);
							}
						}
					}
				}

				var linkButtonText = apisFormModel.showDetails() ? i18n.get('Label-REZ-DASH-28') : i18n.get('Label-REZ-DASH-29');
				passenger.linkButtonText(linkButtonText);
			}

			self.fillPassenger = function(passenger) {

				if(passenger == null)
					return;

				var passengerTitle = i18n.get("titlelookup." + passenger.personalInfo.title);
				passengerTitle = passengerTitle ? passengerTitle : passenger.personalInfo.title;

				passenger.fullName = passengerTitle + " " + passenger.personalInfo.name + " " + passenger.personalInfo.surname;
				passenger.shortName = passenger.personalInfo.name == null || passenger.personalInfo.surname == null ? "":passenger.personalInfo.name.charAt(0)+passenger.personalInfo.surname.charAt(0);
				passenger.fqtvInfo.cardNumber = ko.observable(passenger.fqtvInfo.cardNumber);
				passenger.fqtvInfo.ffpProgram = ko.observable(passenger.fqtvInfo.ffpProgram);
				passenger.fqtvInfo.membershipType = ko.observable(passenger.fqtvInfo.membershipType);
				passenger.fqtvInfo.totalMilesToBeEarned = ko.observable(passenger.fqtvInfo.milesToBeEarned);

				if(passenger.assistance){
					passenger.assistance = ko.observable(passenger.assistance);
					self.assistanceOptions.push(passenger.assistance());
				}else{
					passenger.assistance = ko.observable({name:'',troyaCode:'',description:''});
				}

				if(passenger.mealInfo && passenger.mealInfo.troyaCode){
					passenger.mealInfo = ko.observable(passenger.mealInfo);
				} else {
					passenger.mealInfo = ko.observable({name:'',troyaCode:'',desc:''});
				}

				passenger.asYouWishFirstMealCode = ko.observable(passenger.asYouWishFirstMealCode);
				passenger.asYouWishSecondMealCode = ko.observable(passenger.asYouWishSecondMealCode);

				if(passenger.passengerType == "CHILD") {
					if(!passenger.mealInfo().troyaCode) {
						passenger.mealInfo().troyaCode = "CHML";
					}
				}

				passenger.changeApisFormStatus = function(apisFormModel,element) {

					self.changeApisFormButtonApperance(apisFormModel);

					apisFormModel.showDetails(!apisFormModel.showDetails());

					if(apisFormModel.showDetails()) {

						var apisFormId = '#apisForm_' + apisFormModel.passenger.rph;

						var apisFormElements = $($(element.currentTarget).parents(".table")).find(apisFormId)
						if(apisFormElements) {
							if(apisFormElements.length > 0) {
								var apisFormElement = apisFormElements[0];
								Eteration.loadStaticFragment({
									app:'app.ibs',
									module : 'mytripsapisform',
									el:$(apisFormElement),
									success : function() {
										ko.applyBindings(apisFormModel, $(apisFormElement)[0]);
										apisFormModel.showDetails(true);
										apisFormModel.selectBoxRefresher(false);
										apisFormModel.selectBoxRefresher(true);
										$('.selectpicker').selectpicker('refresh');
//										$('.dropdownselect').selectpicker('setSize');
										setTimeout(function(){
											$('html, body').animate({
												scrollTop: $(document).scrollTop() + 200
											}, 500)
										}, 500);
									}
								});
							}
						}
					}
					else {
						setTimeout(function(){
							$('html, body').animate({
								scrollTop: $(document).scrollTop() - 200
							}, 500)
						}, 500);
					}

				}

				passenger.toggle = function(passenger) {
					passenger.changeApisFormStatus(passenger);
				};

				passenger = self.addFieldsToPassengerForApisForm(passenger);

				return passenger;
			}

			self.addFieldsToPassengerForApisForm = function(passenger) {
				var linkDetails;
				if(typeof passenger.infantInfo != 'undefined') {
					if(passenger.infantInfo != null) {
						linkDetails = self.getLinkDetails(passenger.infantInfo);
						passenger.infantInfo.linkcss = ko.observable(linkDetails.color);
						passenger.infantInfo.linkDetailKey = ko.observable(linkDetails.key);
					}
				}

				if(passenger.passengerType != 'INFANT') {
					linkDetails = self.getLinkDetails(passenger);
					passenger.linkcss = ko.observable(linkDetails.color);
					passenger.linkDetailKey = ko.observable(linkDetails.key);
					passenger.linkButtonText = ko.observable(i18n.get('Label-REZ-DASH-28'));
				}
				else {
					var parentPassenger = self.findParentPassenger(passenger);
					linkDetails = self.getLinkDetails(parentPassenger.infantInfo);
					passenger.apiInfo = parentPassenger.infantInfo.apiInfo;
					passenger.linkcss = ko.observable(linkDetails.color);
					passenger.linkDetailKey = ko.observable(linkDetails.key);


					for(var i = 0; i < parentPassenger.flightStateInfos.length; i++) {
						if(i < passenger.flightStateInfos.length)
							passenger.flightStateInfos[i].seatNumber = parentPassenger.flightStateInfos[i].seatNumber;
					}


					parentPassenger.linkcss(linkDetails.color);
					parentPassenger.linkDetailKey(linkDetails.key);

					parentPassenger.infantPassenger = passenger;
				}

				return passenger;
			}

			self.findInfantPassenger = function(passenger, passengers) {
				var foundPassenger = null;
				for(var i = 0; i < passengers.length; i++) {
					var currentPassenger = passengers[i];
					if(passenger.rph == currentPassenger.rph) {
						foundPassenger = currentPassenger;
						break;
					}
				}
				return foundPassenger;
			}

			self.findInfantBaggageData = function(passenger, baggageData) {

				var foundBaggageData = null;

				for(var i = 0; i < baggageData.length; i++) {
					var currentBaggageData = baggageData[i];
					var currentPassenger = currentBaggageData.passenger;
					if(passenger.rph == currentPassenger.rph) {
						foundBaggageData = currentBaggageData;
						break;
					}
				}

				return foundBaggageData;
			}

			self.sortPassengersByParent = function(passengers) {
				var sortedPassengers = new Array();
				for(var i = 0; i < passengers.length; i++) {
					var passenger = passengers[i];
					if(passenger != null && passenger.passengerType != 'INFANT') {
						sortedPassengers.push(passenger);
						if(passenger.infantInfo != null) {
							var infantPassenger = self.findInfantPassenger(passenger.infantInfo, passengers);
							if(infantPassenger != null) {
								sortedPassengers.push(infantPassenger);
							}
						}
					}
				}
//				self.trips()[0].flightInfo.passengers = sortedPassengers;
				self.reservation().passengers = sortedPassengers;
			}
//			self.sortPassengersByParent(self.trips()[0].flightInfo.passengers);

			if(self.sortPassengers) {
				self.sortPassengersByParent(self.reservation().passengers);
			}


			self.openNonIttModal = function(callback) {

				Eteration.loadStaticFragment({
					app:'app.ibs',
					module : 'nonittlightbox',
					el:$('#nonIttModalContainer'),
					success : function() {
						ko.applyBindings(new NonIttlightBox.ViewModel(self.passengers(), callback), $("#nonIttModalContainer")[0]);
					}
				});

			}

			ko.utils.arrayForEach(self.reservation().passengers, function(passenger){

				self.fillPassenger(passenger);

				passenger.newSelectedPaxType = ko.observable();
				passenger.newBirthdate = ko.observable();
				passenger.newTcknNo = ko.observable("");
				passenger.newFfp = ko.observable("");
				passenger.selectedNewFFPProgram = ko.observable("");
				passenger.ffpValidationContext = ko.jqValidation({});

				self.passengers.push(passenger);
				var givenText = passenger.residualEmdNumber;

				// bebegin emdNumberi bos gelebiliyor, oyuzden bu kontrol koyuldu
				if(givenText){
					if(self.passengerResidualEmdNum() != null && self.passengerResidualEmdNum().length > 0) {
						givenText = self.passengerResidualEmdNum() + "," + passenger.residualEmdNumber;
					}
					self.passengerResidualEmdNum(givenText);
				}

				var givenNewTicketNum = passenger.newTicketNumber;
				if(self.passengerNewTicketNum() != null && self.passengerNewTicketNum().length > 0) {
					if(passenger.newTicketNumber == null || passenger.newTicketNumber == "null") {
						var arrTicketNum = self.passengerNewTicketNum().split(" ");
						passenger.newTicketNumber = Number(arrTicketNum[arrTicketNum.length - 1]) + 1 + "";
					}
					givenNewTicketNum = self.passengerNewTicketNum() + " " + passenger.newTicketNumber;
				}
				if(givenNewTicketNum == null && self.thnkpage() == "reissue")
					givenNewTicketNum = passenger.ticketNumber;
				self.passengerNewTicketNum(givenNewTicketNum);

				self.baggageEMDCSRCodes = ko.observableArray();
				self.seatEMDSSRCodes = ko.observableArray();

				if (passenger.baggageEMDList != null){
					self.baggageEMDCSRCodes(passenger.baggageEMDList);
				}
				if (passenger.seatEMDList  != null){
					self.seatEMDSSRCodes(passenger.seatEMDList);
				}

				passenger.emdNumbers = [{
					"baggageEMDCSRCodes" : self.baggageEMDCSRCodes(),
					"seatEMDSSRCodes" : self.seatEMDSSRCodes()
				}];

			});

			// PASSENGER FOREACH ENDS
			var apisFormModels = self.createPassengerApisFormModels(self.passengers());
			self.apisFormModels(apisFormModels);

			self.showFQTVSave=ko.computed(function() {
				var state = true;
				for (i = 0; i < self.apisFormModels().length; i++) {
					state = state && (!self.apisFormModels()[i].showDetails());
				}
				return state
			}, this);


			self.openSelectSeat = function(segmentRPH,passengerRPH){
				var  seatSelectQuery ={
					app: 'app.ibs',
					service:'/booking/reservation/initselectseat/'+segmentRPH+"/"+passengerRPH,
					callback:function() { }
				};
				seatSelectQuery.largeLoader = true;
				seatSelectQuery.loaderName = 'Passenger Details';
				etrAjax.post(seatSelectQuery);
			}

			self.openPaidSelectSeat = function(segmentRPH,passengerRPH){

				sessionStorage.setItem("previousPageId","4")
				var  seatSelectQuery ={
					app: 'app.ibs',
					service:'/booking/reservation/initpaidselectseat/'+segmentRPH+"/"+passengerRPH,
					callback:function() {
						try{
							self.allowPageChangeWithoutClearTerminal();
							var currentPage = sessionStorage.getItem("currentPageId");
							if(currentPage==null||( "6" == currentPage))
								sessionStorage.setItem("currentPageId", "4");
						} catch (e) {

						}
					}
				};
				seatSelectQuery.largeLoader = true;
				seatSelectQuery.loaderName = 'Passenger Details';
				etrAjax.post(seatSelectQuery);
			};



			self.emailSummary = function(){
				console.log("Email Summary");
			};

//			self.exportToCalendar = function(){
//				alert("export to calendar");
//			};

			self.share = function(){
				console.log("share");
			};


			self.makePayment = function() {
				var paymentQuery ={
					app: 'app.ibs',
					service:'/booking/reservation/payment',
					callback:function() { }
				};
				etrAjax.post(paymentQuery);
			}

			self.payNow = function() {
				var nonIttPnr = self.reservation().nonIttPnr;
				var pnrOwner = self.reservation().pnrOwner;
				if(nonIttPnr && pnrOwner != "CALL  CENTER") {
					self.openNonIttModal(self.makePayment);
				} else {
					self.makePayment();
				}
			};

			self.nonIttPnrEditable = ko.observable(true);

			var passengerInfo;

			if(self.reservation().allFlights[0]){
				passengerInfo = self.reservation().allFlights[0].passengers;
			}

			if(self.reservation().nonIttPnr){
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

			self.validateMealSelection = function() {
				var messageCode, content;
				for(var i = 0; i < self.reservation().trips.length; i++) {
					for(var j = 0; j < self.reservation().trips[i].flightInfo.segments.length; j++) {
						if(self.reservation().trips[i].flightInfo.segments[j].asYouWishOpen) {
							for(var k = 0; k < self.reservation().passengers.length; k++) {
								if(!self.reservation().passengers[k].mealInfo().troyaCode){
									if(!self.reservation().passengers[k].asYouWishFirstMealCode()) {
										$("#erroramountElement").remove();
										messageCode = i18n.get("Error-REZ-98978");
										content = "<p id=\"erroramountElement\" class=\"mt-20\" ><small><i class=\"fa fa-warning red red\"></i><span id=\"errormessage\">"+messageCode+"</span></small></p>"
										$("#asyouWishFirstMeal_" + self.reservation().passengers[k].rph).append(content);
									}
									if(!self.reservation().passengers[k].asYouWishSecondMealCode()) {
										$("#erroramountElementForSecondMeal").remove();
										messageCode = i18n.get("Error-REZ-98978");
										content = "<p id=\"erroramountElementForSecondMeal\" class=\"mt-20\" ><small><i class=\"fa fa-warning red red\"></i><span id=\"errormessage\">"+messageCode+"</span></small></p>"
										$("#asyouWishSecondMeal_" + self.reservation().passengers[k].rph).append(content);

									}
									if(!self.reservation().passengers[k].asYouWishFirstMealCode() || !self.reservation().passengers[k].asYouWishSecondMealCode()) {
										return false;
									}
								}
							}
						}
					}
				}
				return true;
			}



			self.assistanceSaved = ko.observable(false);
			self.mealSaved = ko.observable(false);

			self.mealInfoLock = false;
			self.saveMealInfo = function() {
				if(self.mealInfoLock) {
					return;
				}

				var passengerMealInfo = [];

				var validation = self.validateMealSelection();
				self.validationResult = ko.observable(validation);

				ko.utils.arrayForEach(self.reservation().passengers, function(passenger){
					var p = { rph:passenger.rph, mealInfo:passenger.mealInfo(), asYouWishFirstMealCode:passenger.asYouWishFirstMealCode(), asYouWishSecondMealCode:passenger.asYouWishSecondMealCode() };
					passengerMealInfo.push(p);
				});

				self.mealSaved(false);

				self.mealInfoLock = true;

				if (self.validationResult()) {
					var saveMealInfo ={
						app: 'app.ibs',
						service:'/booking/mealinfo',
						data: passengerMealInfo,
						disableErrorHandling : true,
						preErrorProperties: {
							preErrorFunction :  function() {
								self.mealInfoLock = false;
							}
						},
						callback:function(response) {
							if(response.error && !response.data.hasAsYouWishSegment){
								etrAjax.handleAjaxError(response);
								var checkChat ={
									app: 'app.cms',
									service:'/content/chatavalaible',
									disableLoader: true,
									callback:function(res) {
										if(res.data && res.data.available){
											var data = {
												'c':30,
												'Contact.Name.First':self.reservation().contact.personalInfo.name ,
												'Contact.Name.Last':self.reservation().contact.personalInfo.surname,
												'Contact.Email.0.Address':self.reservation().contactEmail,
												'Incident.CustomFields.c.pnr':self.reservation().pnr,
												'Incident.CustomFields.c.error_code':response.data.error.messages[0].code,
												'Incident.CustomFields.c.error_code_desc': i18n.get(response.data.error.messages[0].code),
												'Incident.CustomFields.c.ticket_no':self.reservation().contact.ticketNumber

											}
											/*if(loggedIn() && self.memberProfile()){
                                                data['Incident.CustomFields.c.ms_no'] = self.memberProfile().milesProgramInfo.ffId;
                                            }*/
											openHelpDesk(data, res.data.landingUrl);
										}
									}
								}
								etrAjax.post(checkChat);

							} else {
								self.mealInfoLock = false;
								$("#erroramountElement").remove();
								$("#erroramountElementForSecondMeal").remove();


								var originalPnrPassengers = self.passengers();
								var modifiedPassengers = response.data.passengers;

								for(var i = 0; i < modifiedPassengers.length; i++) {
									for(var j = 0; j < originalPnrPassengers.length; j++) {
										if(originalPnrPassengers[j].rph == modifiedPassengers[i].rph){
											var modifiedMealInfo = modifiedPassengers[i].mealInfo;
											var asYouWishFirstMealCode = modifiedPassengers[i].asYouWishFirstMealCode;
											var asYouWishSecondMealCode = modifiedPassengers[i].asYouWishSecondMealCode;


											if(typeof originalPnrPassengers[j].mealInfo == "function") {
												originalPnrPassengers[j].mealInfo(modifiedMealInfo);
												originalPnrPassengers[j].asYouWishFirstMealCode(asYouWishFirstMealCode);
												originalPnrPassengers[j].asYouWishSecondMealCode(asYouWishSecondMealCode);
											}
											else {
												originalPnrPassengers[j].mealInfo = modifiedMealInfo;
												originalPnrPassengers[j].asYouWishFirstMealCode = asYouWishFirstMealCode;
												originalPnrPassengers[j].asYouWishSecondMealCode = asYouWishSecondMealCode;
											}
										}

									}
								}

								self.mealSaved(true);
								self.mealChangedFlag(false);

								if(response.data.hasSpaSegment) {
									$('#mealInfoModal').modal("show");
								} else {
									$("#saveMealInfoModal").modal("show");
								}

							}
						}
					};
					etrAjax.post(saveMealInfo);
				} else{
					self.mealInfoLock = false;
				}
			};


			self.saveAssistanceInfo = function() {

				var passengerAssistanceInfo = [];

				ko.utils.arrayForEach(self.reservation().passengers, function(passenger){
					var p = { rph:passenger.rph, assistance:passenger.assistance() };
					passengerAssistanceInfo.push(p);
				});

				self.assistanceSaved(false);

				var saveAssistanceInfo ={
					app: 'app.ibs',
					service:'/booking/assistanceinfo',
					data:passengerAssistanceInfo,
					callback:function() {
						self.assistanceSaved(true);
					}
				};
				etrAjax.post(saveAssistanceInfo);
			};

			self.save = function() {
			};


			self.fqtvInfoLock = false;

			self.saveFQTV = function() {

				if(self.fqtvInfoLock) {
					return;
				}

				var anyFQTVInformationisValid = false;
				var anyFQTVInformationisInvalid = true;
				var passengers = self.passengers();

				var passengersWhoHasValidFQTV = [];

				for(var i = 0; i < passengers.length; i++) {

					var passenger = passengers[i];
					var validationResult = passenger.fqtvInfo.ffpProgram() && passenger.fqtvInfo.cardNumber();

					if (validationResult && (passenger.fqtvInfo.ffpProgram() || !passenger.fqtvInfo.ffpProgram())) {
						anyFQTVInformationisValid = anyFQTVInformationisValid || true;
						passengersWhoHasValidFQTV.push(passenger);
					} else if(!validationResult && passenger.fqtvInfo.ffpProgram()) {
						anyFQTVInformationisInvalid = anyFQTVInformationisInvalid && false;
					}
				}

				if (anyFQTVInformationisValid && anyFQTVInformationisInvalid) {
					var passengerFQTVInfo = [];

					var ffIdErrors = new Array();

					var index = 0;
					ko.utils.arrayForEach(passengersWhoHasValidFQTV, function(passenger){
						var p = {rph:passenger.rph,fqtvInfo:{cardNumber:passenger.fqtvInfo.cardNumber(),ffpProgram:passenger.fqtvInfo.ffpProgram()}};

						if(passenger.fqtvInfo.cardNumber()){
							if((passenger.fqtvInfo.ffpProgram() == "TK" && passenger.fqtvInfo.cardNumber().length!=9)){
								ffIdErrors.push({'id':'ffpProgramId'+index,'el':$("#ffpProgramId"+index)[0],'error':i18n.get("Error-REZ-98978")});
							}
						}
						validationHelper.removeError($('#ffpProgramId'+index));
						$( "#errorffpProgramId"+index).remove();

						index++;
						passengerFQTVInfo.push(p);
					});


					if(ffIdErrors.length>0){

						validationHelper.showClientErrors(ffIdErrors);

					}else{

						self.fqtvInfoLock = true;

						var savePassengerFQTVInfo ={
							app: 'app.ibs',
							service:'/booking/fqtvinfo',
							data: passengerFQTVInfo,
							preErrorProperties: {
								preErrorFunction : function() {
									self.fqtvInfoLock = false;
								}
							},
							callback:function(response) {
								self.fqtvInfoLock = false;

								if(response.data) {
									var updatedPassengers = response.data.passengers
									for(var i = 0; i < updatedPassengers.length; i++) {
										var updatedPassenger = updatedPassengers[i];
										var passenger = self.reservation().passengers[i];
										passenger.fqtvInfo.totalMilesToBeEarned(updatedPassenger.fqtvInfo.milesToBeEarned);
									}

									$("#saveFQTVInfoModal").modal("show");

								}
							}
						};
						etrAjax.post(savePassengerFQTVInfo);
					}
				}else{
					etrAjax.showInfoModal(null,['TextField-REZ-27']);
				}
			};

			self.ohalFlightPopup = function() {
				self.acceptOrChangeFlightProcessWarningMsg(i18n.get('Textfield-REZ-DASH-105'));
				$('#changeFlightProcessWarning').modal("show");
			};

			self.continueForRefundProcess = function() {
				var surnames = [];
				$('#addedPassengerSurnamePopupId input[type="text"]').each(function(){
					surnames.push($(this).val());
				});
				if(surnames.length == self.reservation().trips[0].flightInfo.passengers.length) {
					etrAjax.post({
						app: 'app.ibs',
						service:'/booking/validateSurnameProcess',
						data:surnames,
						callback:function(response) {
							if(response.data != null) {
								if(response.data == false) {
									etrAjax.showErrorModal(['ERR-MS-MILES-1029']);
									return;
								} else {
									self.acceptFlightProcess();
								}
							} else {
								etrAjax.showErrorModal(['ERR-MS-MILES-1029']);
								return;
							}
						}
					});
				}
			}

			self.getOffers = function() {

				self.allowPageChangeWithoutClearTerminal();
				etrAjax.post({
					app : 'app.ibs',
					service : '/booking/reservationWithOffers/',
					callback : function() { }
				});

			};

			self.getOffersAfterMealWarning = function(){
				$("#showMealModalForOffers").modal("hide");
				$("#showMealModalForOffers").modal("show");
			}

			self.acceptFlightProcess = function() {
				etrAjax.get({
					app: 'app.ibs',
					service:'/booking/acceptFlightChangeForIRR/'+self.reservation().pnr+'/'+self.reservation().surname,
					callback:function(response) {
						if(response.data == null) {
							$('#acceptFlightProcessWarning').modal("hide");
							$('#addedPassengerSurnamePopupId').modal("show").on('hidden.bs.modal', function () {
								$('#acceptFlightProcessWarning').modal("show");
							});
							return;
						}
					}
				});
			}
			self.changeToUp = function(id){

				//var sname = self.tempPassengerSurname()[index].trim().turkishtoLatin().toUpperCase().replace(/ /g,'');
				//self.tempPassengerSurname.replace(self.tempPassengerSurname()[index], sname);
				$('#refsurname'+id).val($('#refsurname'+id).val().trim().turkishtoLatin().toUpperCase());
				//$('#surname'+id).focus();
			}
			self.acceptFlightPopup = function() {
				self.acceptOrChangeFlightProcessWarningMsg(i18n.get('Textfield-REZ-DASH-102'));
				$('#acceptFlightProcessWarning').modal("show");
			};

			self.changeFlightPopup = function() {
				self.acceptOrChangeFlightProcessWarningMsg(i18n.get('Textfield-REZ-DASH-110'));
				$('#changeFlightProcessWarning').modal("show");
			};

			self.changeFlightProcess = function() {
				etrAjax.post({
					app : 'app.ibs',
					service : '/booking/initchangeflights/',
					callback : function() { }
				});
			}

			self.salesOfficeFormActive = ko.observable(false);

			var activeRequest = {
				app: 'app.mim',
				service: '/customercommunication/mimrefundsalesformactive',
				callback: function (response) {
					if (response.data) {
						self.salesOfficeFormActive(true);
					}
				}
			};
			etrAjax.get(activeRequest);
			self.cancelFlightProcessWarning = function() {
				if((self.reservation().pnrOwner == "SALES  OFFICE" || self.reservation().pnrOwner == "AIRPORT  OFFICE") && (self.salesOfficeFormActive() && self.reservation().salesOfficeMimFormAvailable)){
					$('#salesOfficeCancelModal').modal("show");
					return;
				}

				$('#changeFlightProcessWarning').modal("hide");
				$('#cancelFlightProcessWarning').modal("show");

			}

			self.cancelFlightProcess = function() {

				if(self.salesOfficeFormActive() && self.reservation().salesOfficeMimFormAvailable){
					$('#salesOfficeCancelModal').modal("show");
					return;
				}

				etrAjax.post({
					app : 'app.ibs',
					service : '/booking/cancellation/',
					loaderName : 'Select Flights',
					callback : function() { }
				});
			}

			self.openSubscription = function(){
				window.open(jQuery('a.header-ms-singup').attr('href'), '_blank');
			};

			self.memberProfile = ko.observable();

			self.mssignupCmsParams = ko.observableArray();
			self.loggedIn = ko.observable(false);


			self.checkMilesAndSmilesLoginStatus = function() {
				self.loggedIn(window.loggedIn == undefined ? false:window.loggedIn());
				if(!self.loggedIn()) {
					if(self.reservation().trips.length > 0) {
						self.mssignupCmsParams.removeAll();
						self.mssignupCmsParams.push({'key':'milesmssignup','value': self.reservation().milesToBeEarned});
						var orginCityCode, destCityCode;
						if(self.reservation().trips[0].flightInfo.firstSegment.originAirport.city == null) {
							orginCityCode = self.reservation().trips[0].flightInfo.firstSegment.originAirport.code;
						} else {
							orginCityCode = self.reservation().trips[0].flightInfo.firstSegment.originAirport.city.code;
						}

						if(self.reservation().trips[0].flightInfo.lastSegment.destinationAirport.city == null) {
							destCityCode = self.reservation().trips[0].flightInfo.lastSegment.destinationAirport.code;
						} else {
							destCityCode = self.reservation().trips[0].flightInfo.lastSegment.destinationAirport.city.code;
						}

						self.mssignupCmsParams.push({'key':'routemssignup','value': orginCityCode + '-' + destCityCode});
					}
				} else {
					var getMemberProfile = {
						app: 'app.ms',
						service:'/miles/memberprofile',
						disableLoader: true,
						callback:function(response) {
							console.log("Member Profile");
							console.log(response.data);

							var memberProfile = response.data;
							self.memberProfile(memberProfile);

							self.cardType(response.data.milesProgramInfo.cardType);

							var pnrPassengers = self.reservation().passengers;
							for(var i = 0; i < pnrPassengers.length; i++) {

								var ffpProgram = pnrPassengers[i].fqtvInfo.ffpProgram();
								var cardNumber = pnrPassengers[i].fqtvInfo.cardNumber();
								var msNo = ffpProgram + cardNumber;

								if(msNo == response.data.milesProgramInfo.ffId) {
									pnrPassengers[i].fqtvInfo.cardTypeCode = response.data.milesProgramInfo.cardType;
									break;
								}
							}

						}
					};
					etrAjax.get(getMemberProfile);
				}
			}


			if(!self.reservation().tccPortalPnr) {
				self.checkMilesAndSmilesLoginStatus();
			}

			self.openLogin = function(callback) {
				Eteration.loadStaticFragment({
					app:'app.ms',
					module : 'login',
					el:$('#siginModalContainer'),
					success : function() {
						$('#signinModal').modal("show");
						ko.applyBindings(new loginView.ViewModel(callback), $("#siginModalContainer")[0]);
					}

				});
			};

			self.seePrivacyPolicy = function(){
				console.log("seePrivacyPolicy");
			};

			self.editApisInfo = function(){
				console.log("edit apis info")
			};

			var ffpProgramQuery = {
				app: 'app.ms',
				service:'/parameters/starallianceffpprograms',
				disableLoader: true,
				callback:function(response) {
					self.ffpPrograms.removeAll();
					self.newffpPrograms.removeAll();
					self.ffpPrograms(response.data);
					self.newffpPrograms(response.data);
				}
			};

			/*var  mealsQuery ={
		    		app: 'app.ibs',
		    		service:'/parameters/meals',
		    		callback:function(response) {

			    		self.meals(response.data);
		    		}
			};*/

			for(i = 0; i < self.reservation().trips.length; i++) {
				for(j = 0; j < self.reservation().trips[i].flightInfo.segments.length; j++) {
					self.reservation().trips[i].flightInfo.segments[j].asYouWishFirstListMeals = ko.observableArray();
					self.reservation().trips[i].flightInfo.segments[j].asYouWishSecondListMeals = ko.observableArray();
				}
			}

			self.loadMealsData = function(data,element) {

				self.hideApisInfoForm(data,element);

				var  mealsQuery ={
					app: 'app.ibs',
					service:'/parameters/meals',
					disableLoader: true,
					callback:function(response) {

						if(self.reservation().hasEconomyClass){
							for(var i = 0; i < response.data.length; i++) {
								if(response.data[i].troyaCode == 'SFML'){
									response.data.splice(i,1);
								}
							}
						}

						self.meals(response.data);
					}
				}


				var  asYouWishMealsQuery ={
					app: 'app.ibs',
					service:'/booking/asyouwishmeals',
					disableLoader: true,
					callback:function(response) {

						if(!response.data){
							return;
						}

						var trips = response.data.trips;
						var reservation = self.reservation();

						for(var i = 0; i < trips.length; i++) {
							for(var j = 0; j < trips[i].flightInfo.segments.length; j++) {
								reservation.trips[i].flightInfo.segments[j].asYouWishFirstListMeals(trips[i].flightInfo.segments[j].asYouWishFirstListMeals);
								reservation.trips[i].flightInfo.segments[j].asYouWishSecondListMeals(trips[i].flightInfo.segments[j].asYouWishSecondListMeals);
							}
						}

					}
				};

				etrAjax.multiGet([mealsQuery,asYouWishMealsQuery]);
			}


			/*var  assistanceOptionsQuery ={
		    		app: 'app.ibs',
		    		service:'/parameters/assistanceoptions',
		    		callback:function(response) {
			    		self.assistanceOptions(response.data);
		    		}
			};*/

			etrAjax.multiGet([ffpProgramQuery]);

			self.babymeals = ko.observableArray();

			var  babyMealsQuery ={
				app: 'app.ibs',
				service:'/parameters/babymeals',
				disableLoader: true,
				callback:function(response) {
					self.babymeals(response.data);
				}
			};

			etrAjax.get(babyMealsQuery);


			self.modifyBookingSectionRendered = function() {
				self.availableForPrimaryContacts(self.reservation().contactList);
			}

			self.msSignupBlockVisibility = ko.observable(false);

			self.afterRendered = function() {


				self.msSignupBlockVisibility(false);

				if(self.reservation().trips.length > 0) {
					self.mssignupCmsParams.removeAll();
					self.mssignupCmsParams.push({'key':'milesmssignup','value': self.reservation().milesToBeEarned});

					var orginCityCode, destCityCode;
					if(self.reservation().trips[0].flightInfo.firstSegment.originAirport.city == null) {
						orginCityCode = self.reservation().trips[0].flightInfo.firstSegment.originAirport.code;
					} else {
						orginCityCode = self.reservation().trips[0].flightInfo.firstSegment.originAirport.city.code;
					}

					if(self.reservation().trips[0].flightInfo.lastSegment.destinationAirport.city == null) {
						destCityCode = self.reservation().trips[0].flightInfo.lastSegment.destinationAirport.code;
					} else {
						destCityCode = self.reservation().trips[0].flightInfo.lastSegment.destinationAirport.city.code;
					}

					self.mssignupCmsParams.push({'key':'routemssignup','value': orginCityCode + '-' + destCityCode});
					self.msSignupBlockVisibility(true);
				}



//				self.travelGuardCallback = function(response) {
//
//	    		}
//				ExternalAppHelper.checkTravelGuardSoldStatus(self.travelGuardCallback);

				/**************************  TRAVEL GUARD **************/

				/*
				self.getTourIstanbul = function(){

					Eteration.loadStaticFragment({
						module : 'touristanbul',
						app:'app.ibs',
						el:$("#touristanbul"),
						success : function() {
							ko.applyBindings(new TourIstanbul.ViewModel(self.reservation()), $("#touristanbul")[0]);

						}
					});
				}

				if(self.thnkpage() == 'reissue') {
					self.getTourIstanbul();
				}
				*/

			}


			/*Access Rail (Yolculugun bir kismi tren ile devam ediyorsa ekranda bilgi mesaji cikarmak icin)*/
			self.accessRail = ko.observable(false);

			self.controlAccessRail = function() {
				var reservation = self.reservation();
				var trips = reservation.trips;
				if (reservation.paid)
				{
					for(var i = 0 ; i < trips.length ; i++) {
						var segments = trips[i].flightInfo.segments;
						for ( var j = 0 ; j < segments.length ; j++ ) {
							if(segments[j].airline.shortName == "9B") {
								self.accessRail(true);
								break;
							}
						}
					}
				}
			}

			self.controlAccessRail();


			self.loadPassengersTabs = function() {
				Eteration.loadStaticFragment({
					app:'app.ibs',
					module:"passengers",
					el:$("#passengersTabs"),
					success:function () {
//			      		ko.applyBindings(self, $("#passengersTabs")[0]);
						if($('#passengersTabs').length) {
							self.initFragmentsViaTemplate(
								self,
								'passengers',
								'passengers',
								'app.ibs', true, "passengersTabs"
							);
						}
					}
				});
			}

			self.loadFareRules = function(elementId,bindObject) {

				var fareRulesElement = $($("#"+elementId).find("#fareRulesBody")[0]);
				if(fareRulesElement) {
					Eteration.loadStaticFragment({
						app:'app.ibs',
						module:'mytrips',
						tmpl: 'farerules',
						el: fareRulesElement,
						success:function () {
							ko.applyBindings(bindObject, fareRulesElement[0]);

						}
					});
				}
			}

			self.itinerrayResponse=ko.observable();
			self.isAvailable=ko.observable(false);
			self.TurkeyEvisaBlockVisibility = ko.observable(false);
			self.OtherEvisaBlockVisibility = ko.observable(false);


			self.checkAndLoadBupApp = function(){
				BupUtil.isBupAvailable(self.reservation());
			}


			self.hasDestinationCountryCode = function(segments, destinationCountryCodes) {

				var hasCountryCode = false;
				for(var j = 0; j < segments.length; j++) {
					var segment = segments[j];
					if(segment) {
						if(segment.destinationAirport) {
							if(segment.destinationAirport.country) {
								var countryCode = segment.destinationAirport.country.code;
								if(countryCode) {
									hasCountryCode = destinationCountryCodes.indexOf(countryCode) > -1; //countryCode == "TR";
									if(hasCountryCode) {
										break;
									}
								}
							}
						}
					}
				}
				return hasCountryCode;
			}


			self.pureDomestic = function() {
				var reservation = self.reservation();
				var trips = reservation.trips;

				var pureDomesticFlag = true;
				for(var i = 0; i < trips.length; i++) {
					var domecticFlight = trips[i].flightInfo.domestic;
					if(!domecticFlight) {
						pureDomesticFlag = false;
						break;
					}
				}
				return pureDomesticFlag;
			}

			self.determineEvisaVisibility = function(destinationCountryCodes) {

				var visibility = false;
				var reservation = self.reservation();
				var trips = reservation.trips;
				var i;
				var allFlightsDomestic = true;
				for(i = 0; i < trips.length; i++) {
					var domecticFlight = trips[i].flightInfo.domestic;
					if(!domecticFlight) {
						allFlightsDomestic = false;
						break;
					}
				}

				if(allFlightsDomestic) return false;

				for(i = 0; i < trips.length; i++) {
					var segments = trips[i].flightInfo.segments;
					var hasArrivalLocationCode = self.hasDestinationCountryCode(segments, destinationCountryCodes);
					if(hasArrivalLocationCode) {
						visibility = hasArrivalLocationCode;
						break;
					}
				}

				return visibility;
			}
			self.TurkeyEvisaBlockVisibility(self.determineEvisaVisibility(["TR"]));
			self.OtherEvisaBlockVisibility(self.determineEvisaVisibility(["AE"]));

			if(self.reservation().baggageData.length == 0) {
				self.createBaggageInformationMessagesForFlights(self.reservation());
			} else {
				self.findInvalidBaggages(self.reservation().baggageData);
			}

			if(self.reservation().baggageData.length > 0) {
				self.changePassengers(self.reservation());
			}

			for(i = 0; i < self.reservation().baggageData.length; i++) {
				for(j = 0; j < self.reservation().baggageData[i].baggages.length;j++) {
					if(self.reservation().baggageData[i].baggages[j].baggageNotFoundmessage) {
						self.reservation().baggageData[i].baggages[j].piece = null;
						self.reservation().baggageData[i].baggages[j].weight = (self.reservation().international ? 30:20);
					}
				}
			}

			self.hesPopup = function() {
				$('#hesWarning').modal("show");
			}

			self.hesCodeControlData = ko.observable();
			self.needHesCode = ko.observable(false);
			self.editHesCode = ko.observable(false);
			self.controlHesCode = ko.observable(false);

			self.goBack = function() {
				window.history.back();
			}

			self.createShowAllFareRules(self.createFlightsFromTrips(self.reservation().trips));
			self.reservation().clonnedTrips = self.cloneTripsForFareRules(self.reservation().trips);


			var trips = self.reservation().trips;
			var totalSegmentSize = 0;
			for(i = 0; i < trips.length; i++) {
				var trip = trips[i];
				for(j = 0; j < trip.flightInfo.segments.length; j++) {
					totalSegmentSize = totalSegmentSize + 1;
				}
			}

			self.totalSegmentSize = ko.observable(totalSegmentSize);


			self.baseFarePaxBreakdownKeys = function (breakDownsObject) {
				var keys = [];
				for(var field in breakDownsObject) {
					if (breakDownsObject.hasOwnProperty(field))
						keys.push(field);
				}
				return keys;
			}

			self.backtoBookingDetails = function(){
				window.history.back();
			};

			self.getCardImageName = function(cardType){
				if(cardType == "Visa")
					return "visa";
				else if(cardType == "Master Card")
					return "mastercard";
				else if(cardType == "Troy")
					return "troy";
				else if(cardType == "American Express (Amex)")
					return "American_Express_Amex";
				else return "";
			}

			self.calculateReissuedAmount = function() {

				self.baseFarePaxTypes = self.baseFarePaxBreakdownKeys(self.reservation().baseFarePaxBreakdown);

				self.baseFarePaxBreakdowns = self.reservation().baseFarePaxBreakdown;

				var totalReissuedAmount = 0;
				var currency = null;
				for(var i = 0; i < self.baseFarePaxTypes.length; i++) {
					var baseFarePaxType = self.baseFarePaxTypes[i];
					if(self.baseFarePaxBreakdowns[baseFarePaxType]) {
						totalReissuedAmount = totalReissuedAmount + self.baseFarePaxBreakdowns[baseFarePaxType].amount;
						if(currency == null) {
							currency = self.baseFarePaxBreakdowns[baseFarePaxType].currency;
						}
					}
				}


				return {
					amount: totalReissuedAmount,
					currency: currency
				}

			}

			self.notifyReservationChannel = function() {
				if(!self.seatMapContentUpdated() && $('#passengersTabs .active')[1] != null && $('#passengersTabs .active')[1].id == "mbseats")
					self.seatMapContentUpdated(true);
				self.eventbus.notifySubscribers(self.reservation(), 'reservation');
				if(!(self.reservation().purgePnr || self.reservation().canceled) && self.reservation().ohalFlight)
					self.ohalFlightPopup();
				if(self.needHesCode() && !self.infantContentVisibility()){
					self.hesPopup();
				}
			}


			self.bookinghoteloperationTypePage = function() {
				if(self.operationType() != null){
					if(self.operationType() == 'REISSUE')
						return "reissue";
					else if(self.operationType() == 'BUP')
						return "upgrade";
					else if(self.operationType() == 'ADD_A_FLIGHT')
						return "addflight";
				}
			}


			//define for um-unaccompanied passenger form
			self.umDocTypes = ko.observable();
			self.languages = ko.observable();
			self.umformRequired = ko.observable(false);
			self.countries = ko.observable();
			self.genders = ko.observable();

			//get page language
			var languagecountry = $('meta[name=languagecountry]').attr("content");
			var languagecountryArray = languagecountry.split("-");
			var countryCode =languagecountryArray[1];
			self.umLanguageCode = ko.observable(languagecountryArray[0].toUpperCase());

			//define query docTypes Codes
			var docTypesQuery = {
				app: 'app.ibs',
				disableLoader : true,
				service:'/parameters/doctypes',
				callback:function(response) {
					self.umDocTypes(response.data);
				}
			};


			//define query languages Codes
			var  languagesQuery = {
				app: 'app.ms',
				service:'/parameters/languages',
				data :{"countryCode" : countryCode},
				disableLoader : true,
				callback:function(response) {
					self.languages(response.data);
				}
			};
			//define query Countries Codes
			var countriesQuery = {
				app: 'app.ibs',
				service:'/parameters/countries',
				disableLoader: true,
				callback:function(response) {
					self.countries(response.data);
				}
			};
			//define query Genders Codes
			var gendersQuery = {
				app: 'app.ms',
				service:'/parameters/genders',
				disableLoader: true,
				callback:function(response) {
					self.genders(response.data);
				}
			};

			//check has Adult
			var checkAdult = false;
			$.each(self.reservation().passengers,function(key, item){
				if(item.passengerType === "ADULT"){
					checkAdult = true;
				}

			});

			//set umformRequired
			self.umformRequired(data.umformRequired);

			//get languages and regionCodes data defined all query
			etrAjax.multiGet([languagesQuery,docTypesQuery,countriesQuery,gendersQuery]);

			self.mytripsWarningMessages = ko.observableArray();
			var warningMessages = {
				app: 'app.ibs',
				service:'/booking/mytripswarningmessages',
				disableErrorHandling: true,
				disableLoader: true,
				callback: function(response) {
					if(response&&response.data){
						response.data.forEach(function(data){
							self.mytripsWarningMessages.push(data);
						});

						self.showAllWarningsButton();
					}
				}
			};
			etrAjax.post(warningMessages);

			self.showAllWarningsButton = function() {
				var count = 0;

				var intervalShowAllWarnings = setInterval(function() {
					count++;
					var warningHeight = $('#myTripsWarningsDiv').height();

					if(warningHeight > 63){
						clearInterval(intervalShowAllWarnings);
						$("#allWarningsButton").removeClass('hidden');
					}

					if(count > 5){
						clearInterval(intervalShowAllWarnings);
					}
				}, 400);
			}

			var checkHesCode = {
				app: 'app.ibs',
				service:'/booking/mytripscheckhescode',
				disableErrorHandling: true,
				disableLoader: true,
				callback: function(response) {
					if(response && response.data){
						self.hesCodeControlData(response.data);
						if(response.data == "EXIST_ALL"){
							self.editHesCode(true);
						} else if(response.data == "MISSING_IDENTITY"){
							self.needHesCode(false);
						} else if(response.data == "MISSING_HESCODE"){
							self.needHesCode(true);
							self.hesPopup();
						} else if(response.data == "NOT_IN_SCOPE"){
							self.controlHesCode(true);
						}
					}
				}

			};
			etrAjax.get(checkHesCode);

			self.initialized(true);

		}

		return { ViewModel: ManageYourBookingViewModel };

	});