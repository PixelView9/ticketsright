define(['knockout'], function(ko){
		
	ko.components.register('assistance-selector', {
		
		 viewModel: { require: "eteration/widgets/managebooking/components/assistance-selector/assistance-selector-viewmodel" },
		 template: { require: "text!eteration/widgets/managebooking/components/assistance-selector/assistance-selector.html" }
	
	});
	
});
