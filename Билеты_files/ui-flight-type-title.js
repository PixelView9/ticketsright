define(['knockout'], function(ko){
		
	ko.components.register('flight-type-title', {
		
	    viewModel: { require: "eteration/widgets/common/components/flight-type-title/flight-type-title-viewmodel" },
	    template: { require: "text!eteration/widgets/common/components/flight-type-title/flight-type-title.html" }

	});
	
});





