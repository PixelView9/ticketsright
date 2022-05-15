define(['knockout'], function(ko){
		
	ko.components.register('refund-pricebreakdown-information', {
		
		viewModel: { require: "eteration/widgets/managebooking/components/refund-pricebreakdown-information/refund-pricebreakdown-information-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/refund-pricebreakdown-information/refund-pricebreakdown-information.html" }
	    	
	});
	
});

