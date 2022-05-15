define(['knockout'], function(ko){
		
	ko.components.register('agency-reservation-message', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/agency-reservation-message/agency-reservation-message-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/agency-reservation-message/agency-reservation-message.html" }

	});
	
});





