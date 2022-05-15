define(['knockout'], function(ko){
		
	ko.components.register('print-tool', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/print-tool/print-tool-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/print-tool/print-tool.html" }

	});
	
});





