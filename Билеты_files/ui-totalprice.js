define(['knockout'], function(ko){
		
	ko.components.register('totalprice', {
		
		viewModel: { require: "eteration/widgets/managebooking/components/totalprice/totalprice-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/totalprice/totalprice.html" }
	
	});
	
});





