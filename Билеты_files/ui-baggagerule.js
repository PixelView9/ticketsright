define(['knockout'], function(ko){
		
	ko.components.register('baggagerule', {
		
	    viewModel: { require: "eteration/widgets/booking/baggagerule/baggagerule-vm" },
	    template: { require: "text!eteration/widgets/booking/baggagerule/baggagerule.html" }
	    	
	});
	
});





