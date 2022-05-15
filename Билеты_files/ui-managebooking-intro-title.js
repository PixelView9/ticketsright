define(['knockout'], function(ko){
		
	ko.components.register('managebooking-intro-title', {
		
		viewModel: { require: "eteration/widgets/managebooking/components/managebooking-intro-title/managebooking-intro-title-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/managebooking-intro-title/managebooking-intro-title.html" }
	
	});
	
});





