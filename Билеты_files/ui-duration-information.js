define(['knockout'], function(ko){
		
	ko.components.register('duration-information', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/duration-information/duration-information-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/duration-information/duration-information.html" }

	});
	
});





