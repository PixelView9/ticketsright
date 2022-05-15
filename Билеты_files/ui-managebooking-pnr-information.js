define(['knockout'], function(ko){
		
	ko.components.register('managebooking-pnr-information', {
		
		viewModel: { require: "eteration/widgets/managebooking/components/managebooking-pnr-information/managebooking-pnr-information-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/managebooking-pnr-information/managebooking-pnr-information.html" }
	
	});
	
});





