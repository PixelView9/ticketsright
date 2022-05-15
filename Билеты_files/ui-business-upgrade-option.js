define(['knockout'], function(ko){
		
	ko.components.register('business-upgrade-option', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/business-upgrade-option/business-upgrade-option-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/business-upgrade-option/business-upgrade-option.html" }

	});
	
});





