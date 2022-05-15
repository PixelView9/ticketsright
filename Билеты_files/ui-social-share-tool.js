define(['knockout'], function(ko){
		
	ko.components.register('social-share-tool', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/social-share-tool/social-share-tool-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/social-share-tool/social-share-tool.html" }

	});
	
});





