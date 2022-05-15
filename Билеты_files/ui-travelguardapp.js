define(['knockout'], function(ko){
	
	ko.components.register('travelguardapp', {
	    viewModel: { require: "eteration/widgets/booking/travelguardapp/travelguardapp-view" },
	    template: { require: "text!eteration/widgets/booking/travelguardapp/travelguardapp.html" }
	});
	
});