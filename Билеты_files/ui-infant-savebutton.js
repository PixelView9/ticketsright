define(['knockout'], function(ko){
		
	ko.components.register('infant-savebutton', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/infant-savebutton/infant-savebutton-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/infant-savebutton/infant-savebutton.html" }

	});
	
});





