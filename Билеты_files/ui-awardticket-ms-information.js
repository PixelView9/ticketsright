define(['knockout'], function(ko){
		
	ko.components.register('awardticket-ms-information', {
		
		viewModel: { require: "eteration/widgets/managebooking/components/awardticket-ms-information/awardticket-ms-information-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/awardticket-ms-information/awardticket-ms-information.html" }
	
	});
	
});

