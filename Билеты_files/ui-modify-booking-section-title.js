define(['knockout'], function(ko){
		
	ko.components.register('modify-booking-section-title', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/modify-booking-section-title/modify-booking-section-title-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/modify-booking-section-title/modify-booking-section-title.html" }

	});
	
});





