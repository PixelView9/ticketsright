define(['knockout'], function(ko){
		
	ko.components.register('email-tool', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/email-tool/email-tool-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/email-tool/email-tool.html" }

	});
	
});





