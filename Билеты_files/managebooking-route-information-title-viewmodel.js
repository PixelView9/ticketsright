define([
	'knockout',
	'eteration/eteration-i18n',
	'eteration/widgets/ui-i18n'
	], 

function(ko,i18n){
		
	    var ViewModel = function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	self.eventbus = value.eventbus;
	    	
	    	self.thankyouPageType = ko.observable();
	    	self.roundTripRoute = ko.observable();
	    	self.departureSegment = ko.observable();
	    	self.arrivalSegment = ko.observable();
	    	
	    	self.eventbus.addSubscriber(function(reservationObject) {
	    		
	    		var departureSegment = reservationObject.trips[0].flightInfo.firstSegment;
	    		self.departureSegment(departureSegment);
	    		
	    		var arrivalSegment = reservationObject.trips[0].flightInfo.lastSegment;
	    		self.arrivalSegment(arrivalSegment);
	    		
	    		self.roundTripRoute(reservationObject.roundTrip);
	    		
	    	}, self, 'reservation');
	    	
	    	
	    	self.eventbus.addSubscriber(function(thankyouPageType) {
	    		
	    		self.thankyouPageType(thankyouPageType);
	    		
	    	}, self, 'thankyou_page_type');
	    	
	    	
	    	self.eventbus.notifySubscribers(true, 'reservation_provider');
	    	self.eventbus.notifySubscribers(true, 'thankyou_page_type_provider');
	    }
	    
	    return ViewModel;
});





