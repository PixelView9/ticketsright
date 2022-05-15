define(['knockout'], function(ko){
		
	ko.components.register('passengerpaneltag', {
		 
		viewModel: { require: "eteration/widgets/managebooking/components/passengerpaneltag/passengerpaneltag-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/passengerpaneltag/passengerpaneltag.html" }
	    	
	});
	
});





