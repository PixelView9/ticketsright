define(['knockout'], function(ko){
		
	ko.components.register('reissue-completion-message', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/reissue-completion-message/reissue-completion-message-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/reissue-completion-message/reissue-completion-message.html" }

	});
	
});





