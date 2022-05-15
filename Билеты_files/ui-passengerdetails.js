define([
	'knockout',
	'eteration/widgets/widget-util',
	'eteration/eteration-i18n',
	'eteration/widgets/ui-name',
	'eteration/widgets/ui-i18n'
	], 

function(ko,widgetUtil,i18n){
		
	widgetUtil.setupStringBasedTemplate(ko);

	ko.components.register('passengerdetails', {
	    viewModel: function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	self.apisAvailable = value.apisAvailable;
	    	self.passengerInformation = value.passengerInformation;
	    	self.contactPerson = value.contactPerson === undefined ? false : value.contactPerson; 
	    	self.unaccompanied = value.unaccompanied ? value.unaccompanied : false;
	    	
	    	self.unaccompaniedFormToggle = function(passengerInfo){
	    		if($('#unaccompaniedForm_'+passengerInfo).hasClass("hidden")) {
	    			$('#unaccompaniedForm_'+passengerInfo).removeClass("hidden");
	    			$( document).trigger( "umRefFromOpen"+passengerInfo);
	    			$('html,body').animate({
	    		        scrollTop: $("#unaccompaniedForm_" + passengerInfo).offset().top
	    		    }, 'slow');
	    	    } else {
	    	    	$('#unaccompaniedForm_'+passengerInfo).addClass("hidden");
	    	    }
	    			    		
	    	};
	    },
	    template:
	    	"<div class=\"media row-sm-height\" data-bind=\"with: passengerInformation\">\n" + 
	    	"	<div class=\"media-body col-sm-height col-middle\">\n" + 
	    	"		<div class=\"h5 nomargin\" data-bind=\"fullname : {personalInfo:personalInfo}\"></div>\n" +
//	    	"		<!-- ko if : contactPerson == true -->\n"+
//			"			<small class=\"blue fs-14\">\n" +
//			"				<span data-bind=\"i18n-text: { key: 'Label-REZ-RI-10'}\"></span>\n"+
//			"			</small>\n" +
//			"		<!-- /ko -->\n" +
	    	"		<!--ko if: $parent.apisAvailable -->\n" + 
	    	"		<small class='block'> <span data-bind=\"text: linkDetailKey, css: linkcss\"></span> <!-- ko if: passengerType != \'INFANT\' --> - <span> <a data-bind=\"click: apisFormModel().toggle, text: linkButtonText, css: linkcss\"></a>\n" + 
	    	"		</span> <!-- /ko -->\n" + 
	    	"		</small>\n" + 
	    	"		<!-- /ko -->\n" + 
	    	"		\n" + 
	    	"		<!-- ko if: ticketNumber && ticketNumber != null -->\n" + 
	    	"			<small class=\"text-muted block\"> <span data-bind=\"i18n-text: { key: \'Label-REZ-DASH-5017\' , args:{\'no\':ticketNumber}}\"></span>\n" + 
	    	"			</small>\n" + 
	    	"		<!-- /ko -->\n" + 
	    	"		<!-- ko if: $parent.unaccompanied && $parent.isUmFormVisible -->\n"+
	    	"			<a class=\"blue fs-12 fw700 mb-5\" data-bind=\"click: function(){$parent.unaccompaniedFormToggle($parent.passengerInformation.rph)}, i18n-text: { key: \'mytrips.umform.title\'}\"></a>\n"+
	    	"		<!-- /ko -->\n"+
	    	"	</div>\n" + 
	    	"</div>"
	    	
	});
	
});





