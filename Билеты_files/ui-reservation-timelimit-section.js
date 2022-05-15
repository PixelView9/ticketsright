define(['knockout'], function(ko){
		
	   ko.components.register('reservation-time-limit-section', {
		   viewModel: { require: "eteration/widgets/managebooking/components/reservation-time-limit-section/reservation-time-limit-section-viewmodel" },
		   template: { require: "text!eteration/widgets/managebooking/components/reservation-time-limit-section/reservation-time-limit-section.html" }
	   });
	
});