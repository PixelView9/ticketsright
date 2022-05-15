define(['knockout'], function(ko){
	
	ko.components.register('carrentforthankyou', {
	    viewModel: { require: "eteration/widgets/booking/carrentforthankyou/carrentforthankyou-view" },
	    template: { require: "text!eteration/widgets/booking/carrentforthankyou/carrentforthankyou.html" }
	});
	
});