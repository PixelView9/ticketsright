define(['knockout'], function(ko){
		
	ko.components.register('modify-booking-save-button', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/modify-booking-save-button/modify-booking-save-button-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/modify-booking-save-button/modify-booking-save-button.html" }

	});
	
});





