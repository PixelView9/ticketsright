define(['knockout'], function(ko){
		
	ko.components.register('cancel-flight-tool', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/cancel-flight-tool/cancel-flight-tool-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/cancel-flight-tool/cancel-flight-tool.html" }

	});
	
});





