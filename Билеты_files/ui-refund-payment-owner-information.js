define(['knockout'], function(ko){
		
	ko.components.register('refund-payment-owner-information', {
		
		 viewModel: { require: "eteration/widgets/managebooking/components/refund-payment-owner-information/refund-payment-owner-information-viewmodel" },
		 template: { require: "text!eteration/widgets/managebooking/components/refund-payment-owner-information/refund-payment-owner-information.html" }
	    	
	});
	
});

