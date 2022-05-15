define(['jquery',
        'knockout',
        'eteration/eteration',
        'eteration/eteration-ajax'
        ], 
        
	function($, ko, Eteration, etrAjax) {		


		function UtilViewModel() {
			
			var self = this;
			
			
			self.createFlightsFromTrips = function(trips) {
				
				var flights = [];
				
				for(var i=0; i < trips.length; i++) {
					var trip = trips[i];
					flights[i] = trip.flightInfo;
				}
				
				return flights;
			}
			
			
			self.createShowAllFareRules = function(flights) {
				
				for(var i=0; i < flights.length; i++) {
					var flightInfo = flights[i];
					flightInfo.showFareRules = ko.observable(false);
					flightInfo.fareRulesSource = ko.observable();
				}
			}
//			self.createShowAllFareRules();
			
			self.cloneTripsForFareRules = function(trips) {
				
				var clonnedTrips = [];
				for(var i=0; i < trips.length; i++) {
					clonnedTrips[i] = $.extend({}, trips[i]);
					var clonnedflightInfo = $.extend({}, trips[i].flightInfo);
					clonnedflightInfo.showFareRules = ko.observable(false);
					clonnedflightInfo.fareRulesSource = ko.observable();
					clonnedTrips[i].flightInfo = clonnedflightInfo;
				}
				return clonnedTrips;
			}
			
//			self.reservation().clonnedTrips = self.cloneTripsForFareRules(self.reservation().trips);

            self.isFareRulesTabOpened = ko.observable(false);
			
			self.loadFareRulesForFlight = function(fareRuleId, flightInfo) {

				self.isFareRulesTabOpened(!this.isFareRulesTabOpened());
				
				var showFareRules = flightInfo.showFareRules();
				if(showFareRules) {
					flightInfo.showFareRules(!showFareRules);
					return;
				}
				
				if(flightInfo && flightInfo.fareRule == null) {
					
					var fareRulesForFlightRequest ={
			    		app: 'app.ibs',
			    		service:'/booking/farerulesforflight',
			    		data: flightInfo.rph,
			    		disableLoader: false,
			    		callback:function(response) { 
			    			flightInfo.fareRule = response.data;
			    			flightInfo.showFareRules(true);
			    			
			    		}
					}
					etrAjax.post(fareRulesForFlightRequest);
					
				}
				else {
					flightInfo.showFareRules(!showFareRules);
				}
				
				flightInfo.fareRulesSource(fareRuleId);
				
			}
			
			
			self.createFareRuleData = function(flight, availabilityResponse, flightListPanelArray, matchingRecommendation) {
				
				var domestic = availabilityResponse.travelType == 'OTA';
				var paxList = availabilityResponse.bookingRequest.bookings[0].paxList;
				var passengers = [];
				var loyaltyData = null;
				var amadeusSessionData = null;
				
				if (availabilityResponse.amadeusResponse) {
					
					var amadeusSessionId = availabilityResponse.amadeusSessionId;
					var recommendationId = matchingRecommendation.id;
					
					var flightIdList  = [];
					
					for (var panelIndex = 0; panelIndex < flightListPanelArray.length; panelIndex++) {
						var flightId = flightListPanelArray[panelIndex].selectedFlight().id;
						flightIdList.push(flightId);
					}
					
					var pageTicket = availabilityResponse.pageTicket;
					
					amadeusSessionData = { 'jsessionId' : amadeusSessionId, 'recommendationId' : recommendationId , 'pageTicket' : pageTicket , 'flightIdList' : flightIdList };
					
				}
				
				for (var paxIndex = 0; paxIndex < paxList.length; paxIndex++) {
					var pax = paxList[paxIndex];
					passengers.push( { 'code' : pax.code , 'quantity' : pax.count } );
				}
				
				return  {
							'flight' : flight,
							'passengers' : passengers, 
							'domestic' : domestic, 
							'loyaltyData' : loyaltyData,
							'amadeusSessionData' : amadeusSessionData
						};
			}
			
			
			self.loadReissueBookingFareRule = function(trip, flight, availabilitySingleCityResponse, flightListPanelArray, matchingRecommendation) {
				
				
				var showFareRules = trip.flightInfo.showFareRules();
				if(showFareRules) {
					trip.flightInfo.showFareRules(!showFareRules);
					return;
				}
				
				if(trip && trip.flightInfo.fareRule == null) {
				
					var bookingRequestFareRule = self.createFareRuleData(flight, availabilitySingleCityResponse, flightListPanelArray, matchingRecommendation);
					
					etrAjax.post({
						app : 'app.ibs',
						service : '/booking/farerulesforreissueflight',
						disableLoader : false,
						data : bookingRequestFareRule,
						callback : function(response) {
							trip.flightInfo.fareRule = response.data;
			    			trip.flightInfo.showFareRules(true);
						}
					});
				
				}
				else {
					trip.flightInfo.showFareRules(!showFareRules);
				}
			}
			
		}

		
	return { ViewModel: UtilViewModel };

});
	

