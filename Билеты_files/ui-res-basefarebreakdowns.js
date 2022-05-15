define(['knockout'], function(ko){
		
	ko.components.register('reservation-basefarebreakdowns', {
		 
		viewModel: { require: "eteration/widgets/managebooking/components/reservation-basefarebreakdowns/reservation-basefarebreakdowns-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/reservation-basefarebreakdowns/reservation-basefarebreakdowns.html" }
	    
	});
	
});





