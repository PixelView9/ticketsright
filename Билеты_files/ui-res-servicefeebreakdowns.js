define(['knockout'], function(ko,widgetUtil,i18n){
		
	ko.components.register('reservation-servicefeebreakdowns', {
	    	
		viewModel: { require: "eteration/widgets/managebooking/components/reservation-servicefeebreakdowns/reservation-servicefeebreakdowns-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/reservation-servicefeebreakdowns/reservation-servicefeebreakdowns.html" }
	    
	});
	
});





