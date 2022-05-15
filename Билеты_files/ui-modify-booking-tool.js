define(['knockout'], function(ko){
		
	ko.components.register('modify-booking-tool', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/modify-booking-tool/modify-booking-tool-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/modify-booking-tool/modify-booking-tool.html" }

	});
	
});





