define(['knockout'], function(ko){
	
	ko.components.register('touristanbul', {
	    viewModel: { require: "eteration/widgets/booking/touristanbul/touristanbul-view" },
	    template: { require: "text!eteration/widgets/booking/touristanbul/touristanbul.html" }
	});
	
});