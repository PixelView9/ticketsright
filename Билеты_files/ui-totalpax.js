define(['knockout'], function(ko){
		
	ko.components.register('totalpax', {
		
		viewModel: { require: "eteration/widgets/managebooking/components/totalpax/totalpax-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/totalpax/totalpax.html" }
	
	});
	
});





