define(['knockout'], function(ko){
		
	ko.components.register('refund-card-owner-information', {
		
		viewModel: { require: "eteration/widgets/managebooking/components/refund-card-owner-information/refund-card-owner-information-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/refund-card-owner-information/refund-card-owner-information.html" }
	    	
	});
	
});

