define(['knockout'], function(ko){
		
	ko.components.register('flight-details', {
		
		viewModel: { require: "eteration/widgets/common/components/flight-details/flight-details-viewmodel" },
	    template: { require: "text!eteration/widgets/common/components/flight-details/flight-details.html" }
	    	
	});
	
});