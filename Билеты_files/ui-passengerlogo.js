define([
	'knockout',
	'eteration/widgets/widget-util',
	'eteration/eteration-i18n',
	'eteration/widgets/ui-name',
	'eteration/widgets/ui-i18n'
	], 

function(ko,widgetUtil,i18n){
		
	widgetUtil.setupStringBasedTemplate(ko);

	ko.components.register('passengerlogo', {
	    viewModel: function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	self.imageSourcePath = value.imageSourcePath;
	    	self.shortName = value.shortName;
	    },
	    template:
	    	"<div class=\"profileimage pull-left col-sm-height col-middle\">\n" + 
//	    	"	<img data-bind=\"img:{ src: imageSourcePath }\" width=\"64\" align=\"left\" name=\"\" title=\"\" alt=\"\" class=\"img-circle\">\n" + 
	    	"	<div class=\"profilename\" data-bind=\"text: shortName\"></div>\n" + 
	    	"</div>"
	});
	
});





