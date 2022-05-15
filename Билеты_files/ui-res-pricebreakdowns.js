define(['knockout'], function(ko){
		
	ko.components.register('reservation-pricebreakdowns', {
		
		viewModel: { require: "eteration/widgets/managebooking/components/reservation-pricebreakdowns/reservation-pricebreakdowns-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/reservation-pricebreakdowns/reservation-pricebreakdowns.html" }
	    
	});
	
});





