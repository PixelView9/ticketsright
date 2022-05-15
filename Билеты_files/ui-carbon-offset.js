define(['knockout'], function(ko){
	ko.components.register('carbon-offset', {
	    viewModel: {
	    	require: "eteration/widgets/common/components/carbon-offset/carbon-offset-viewmodel"
		},
	    template: {
	    	require: "text!eteration/widgets/common/components/carbon-offset/carbon-offset.html"
		}
	});
});