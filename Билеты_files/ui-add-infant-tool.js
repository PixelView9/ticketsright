define(['knockout'], function(ko){
		
	ko.components.register('add-flight-tool', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/add-flight-tool/add-flight-tool-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/add-flight-tool/add-flight-tool.html" }

	});
	
});





