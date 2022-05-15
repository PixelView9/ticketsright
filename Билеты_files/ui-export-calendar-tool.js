define(['knockout'], function(ko){
		
	ko.components.register('export-calendar-tool', {
		
	    viewModel: { require: "eteration/widgets/managebooking/components/export-calendar-tool/export-calendar-tool-viewmodel" },
	    template: { require: "text!eteration/widgets/managebooking/components/export-calendar-tool/export-calendar-tool.html" }

	});
	
});





