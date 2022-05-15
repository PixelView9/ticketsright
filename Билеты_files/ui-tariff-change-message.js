define(['knockout'], function(ko){
		
	ko.components.register('tariff-change-message', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/tariff-change-message/tariff-change-message-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/tariff-change-message/tariff-change-message.html" }

	});
	
});





