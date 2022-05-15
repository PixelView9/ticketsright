define(['knockout'], function(ko){
	
	ko.components.register('bookhotelnew', {
	    viewModel: { require: "eteration/widgets/booking/bookhotelnew/bookhotelnew-view" },
	    template: { require: "text!eteration/widgets/booking/bookhotelnew/bookhotelnew.html" }
	});
	
});