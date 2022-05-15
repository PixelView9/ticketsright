define(['knockout'], function(ko){
		
	ko.components.register('reservation-taxesbreakdowns', {
		
		viewModel: { require: "eteration/widgets/managebooking/components/reservation-taxesbreakdowns/reservation-taxesbreakdowns-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/reservation-taxesbreakdowns/reservation-taxesbreakdowns.html" }
	    
	});
	
});





