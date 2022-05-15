define(['knockout'], function(ko){
	
	ko.components.register('gulfinsurance', {
	    viewModel: { require: "eteration/widgets/booking/gulfinsurance/gulfinsurance-view" },
	    template: { require: "text!eteration/widgets/booking/gulfinsurance/gulfinsurance.html" }
	});
	
});