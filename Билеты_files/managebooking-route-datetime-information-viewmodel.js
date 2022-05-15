define([
	'knockout',
	'moment',
	'eteration/eteration-i18n',
	'eteration/widgets/ui-i18n'
	], 

function(ko,moment,i18n){
		
	    var ViewModel = function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	self.eventbus = value.eventbus;
	    	
	    	self.firstTrip = ko.observable();
	    	self.lastTrip = ko.observable();
	    	self.thankyouPageType = ko.observable();
	    	self.roundTripRoute = ko.observable(false);
	    	self.lengthOfTrips = ko.observable(0);
	    	self.departureSegment = ko.observable();
	    	self.arrivalSegment = ko.observable();
	    	self.dateFormat = ko.observable();
	    	
	    	self.transactionDateLimit = ko.observable();
	    	self.transactionTimeLimit = ko.observable();
	    	
	    	self.formattedArrivalFlightDate = ko.observable();
	    	self.formattedDepartureFlightDate = ko.observable();
	    	
	    	self.departureAirPortCodeForTimeZone = 'IST';
	    	
	    	
	    	self.eventbus.addSubscriber(function(reservationObject) {
	    		
	    		var firstTrip = reservationObject.trips[0];
	    		self.firstTrip(firstTrip);
	    		
	    		var lastTrip = reservationObject.trips[reservationObject.trips.length-1];
	    		self.lastTrip(lastTrip);
	    		
	    		var departureSegment = self.firstTrip().flightInfo.firstSegment;
	    		self.departureSegment(departureSegment);
	    		
	    		var arrivalSegment = self.lastTrip().flightInfo.lastSegment;
	    		self.arrivalSegment(arrivalSegment);
	    		
	    		self.roundTripRoute(reservationObject.roundTrip);
		    	self.lengthOfTrips(reservationObject.trips.length);
		    	
	    	}, self, 'reservation');
	    	
	    	
	    	self.eventbus.addSubscriber(function(dateFormatValue) {
	    		
	    		self.dateFormat(dateFormatValue);
	    		
	    		var departureFlightDateMoment = moment.utc(self.departureSegment().departureDateTime + self.departureSegment().departureDateTimeTimeZoneRawOffset);
		    	self.formattedDepartureFlightDate(departureFlightDateMoment.format(self.dateFormat().fulldayfullmonth));
	    		
		    	var arrivalFlightDateMoment = moment.utc(self.arrivalSegment().departureDateTime + self.arrivalSegment().departureDateTimeTimeZoneRawOffset);
		    	self.formattedArrivalFlightDate(arrivalFlightDateMoment.format(self.dateFormat().fulldayfullmonth));
	    		
	    	}, self, 'date_format');
	    	
	    	
	    	self.eventbus.addSubscriber(function(transactionDateFields) {
    			
	    		self.transactionDateLimit(transactionDateFields.transactionDateLimit);
	    		self.transactionTimeLimit(transactionDateFields.transactionTimeLimit);
	    		
	    	}, self, 'transaction_date_fields');
	    	
	    	
	    	self.eventbus.addSubscriber(function(thankyouPageType) {
	    		
	    		self.thankyouPageType(thankyouPageType);
	    		
	    	}, self, 'thankyou_page_type');
	    	
	    	
	    	self.eventbus.notifySubscribers(true, 'reservation_provider');
	    	self.eventbus.notifySubscribers(true, 'date_format_provider');
	    	self.eventbus.notifySubscribers(true, 'transaction_date_fields_provider');
	    	self.eventbus.notifySubscribers(true, 'thankyou_page_type_provider');
	    }
	    
	    return ViewModel;
});





