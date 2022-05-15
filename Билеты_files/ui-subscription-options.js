define(['knockout'], function(ko){
		
	ko.components.register('subscription-options', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/subscription-options/subscription-options-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/subscription-options/subscription-options.html" }

	});
	
});





