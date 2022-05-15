define(['knockout'], function(ko){
		
	ko.components.register('modify-booking-edit-button', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/modify-booking-edit-button/modify-booking-edit-button-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/modify-booking-edit-button/modify-booking-edit-button.html" }

	});
	
});





