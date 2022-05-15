define(['knockout'], function(ko){
		
	ko.components.register('infant-spinner', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/infant-spinner/infant-spinner-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/infant-spinner/infant-spinner.html" }

	});
	
});





