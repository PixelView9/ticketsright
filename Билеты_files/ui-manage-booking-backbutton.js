define(['knockout'], function(ko){
		
	ko.components.register('manage-booking-backbutton', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/manage-booking-backbutton/manage-booking-backbutton-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/manage-booking-backbutton/manage-booking-backbutton.html" }

	});
	
});





