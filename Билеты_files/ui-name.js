define([
	'knockout',
	'eteration/widgets/widget-util',
	 'eteration/eteration-i18n',
	], function(ko,widgetUtil,i18n){
		
	widgetUtil.setupStringBasedTemplate(ko);

	ko.bindingHandlers.fullname = {
		    init: function (element, valueAccessor, allBindingsAccessor) {
		    	
		    	var personalInfo = ko.utils.unwrapObservable(valueAccessor().personalInfo);
		    	var personalInformationTranslationArgs = {
						"titlelookup": "empty" == personalInfo.title ? personalInfo.title : personalInfo.title.toUpperCase(),
								"displayName": personalInfo.nameMiddleNameAndSurname.toUpperCase()
				}
				
		    	// If we have "TextField-OB-185" translation keyword, we can use this.
				var passengerFullName = i18n.getWithArgs("TextField-OB-185", personalInformationTranslationArgs);
		    	$(element).html(passengerFullName);
		    }

	};
	
	ko.bindingHandlers.shortname = {
		    init: function (element, valueAccessor, allBindingsAccessor) {
		    	var personalInfo = ko.utils.unwrapObservable(valueAccessor().personalInfo);
		    	var shortname = personalInfo.name.charAt(0)+personalInfo.surname.charAt(0);
		    	$element = $(element);
		    	$element.html(shortname);
		    }

	};
		
});





