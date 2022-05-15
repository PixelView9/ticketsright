define([
	'knockout',
	'moment',
	'eteration/widgets/widget-util',
	'eteration/eteration-i18n',
	'eteration/widgets/ui-name',
	'eteration/widgets/ui-i18n'
	], 

function(ko,moment,widgetUtil,i18n){
		
	    var ViewModel = function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	self.departureSegment = value.departureSegment;
	    	self.arrivalSegment = value.arrivalSegment;
	    	self.dateFormat = value.dateFormat;
	    	
	    	
	    	self.flightDateTimeMomentInUtc = moment.utc(self.departureSegment.departureDateTime + self.departureSegment.departureDateTimeTimeZoneRawOffset);
	    	self.formattedFlightDateTime = self.flightDateTimeMomentInUtc.format(self.dateFormat().fulldayfullmonth);
	    }
	    
	    return ViewModel;
});





