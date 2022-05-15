define(['knockout'], function(ko){
		
	ko.components.register('mytripsunaccompaniedform', {
		viewModel: { require: "eteration/widgets/managebooking/components/mytripsunaccompaniedform/mytripsunaccompaniedform-viewmodel" },
		template: { require: "text!eteration/widgets/managebooking/components/mytripsunaccompaniedform/mytripsunaccompaniedform.html" }
	    	
	});
	
}); 





