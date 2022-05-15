define(['knockout'], function(ko,widgetUtil,i18n){
		
	ko.components.register('reservation-selected-additional-services', {
	    	
		viewModel: { require: "eteration/widgets/managebooking/components/reservation-selected-additional-services/reservation-selected-additional-services-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/reservation-selected-additional-services/reservation-selected-additional-services.html" }
	    
	});
	
});





