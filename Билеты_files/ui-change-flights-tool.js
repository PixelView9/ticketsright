define(['knockout'], function(ko){
		
	ko.components.register('change-flights-tool', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/change-flights-tool/change-flights-tool-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/change-flights-tool/change-flights-tool.html" }

	});
	
});





