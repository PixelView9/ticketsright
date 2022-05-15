define(['knockout'], function(ko){
		
	ko.components.register('pnr-operation-tool', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/pnr-operation-tool/pnr-operation-tool-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/pnr-operation-tool/pnr-operation-tool.html" }

	});
	
});





