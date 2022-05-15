define(['knockout'], function(ko){
		
	ko.components.register('flight-short-information-title', {
		
	    viewModel: { require: "eteration/widgets/common/components/flight-short-information-title/flight-short-information-title-viewmodel" },
	    template: { require: "text!eteration/widgets/common/components/flight-short-information-title/flight-short-information-title.html" }

	});
	
});





