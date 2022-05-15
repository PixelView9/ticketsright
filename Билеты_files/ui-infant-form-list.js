define(['knockout'], function(ko){
		
	ko.components.register('infant-form-list', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/infant-form-list/infant-form-list-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/infant-form-list/infant-form-list.html" }

	});
	
});





