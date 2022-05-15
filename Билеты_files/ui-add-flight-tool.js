define(['knockout'], function(ko){
		
	ko.components.register('add-infant-tool', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/add-infant-tool/add-infant-tool-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/add-infant-tool/add-infant-tool.html" }

	});
	
});





