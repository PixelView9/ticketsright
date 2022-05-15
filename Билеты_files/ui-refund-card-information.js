define(['knockout'], function(ko){
		
	ko.components.register('refund-card-information', {
		
		 viewModel: { require: "eteration/widgets/managebooking/components/refund-card-information/refund-card-information-viewmodel" },
		 template: { require: "text!eteration/widgets/managebooking/components/refund-card-information/refund-card-information.html" }
	    	
	});
	
});

