define([
	'knockout',
	'eteration/widgets/widget-util',
	 'eteration/eteration-i18n',
	], function(ko,widgetUtil,i18n){
		
	widgetUtil.setupStringBasedTemplate(ko);
	
	
	ko.components.register('paxtypecount', {
	    viewModel: function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	self.type = value.type;
	    	self.count = value.count;
	    	self.hasFamilyDiscountCode  = value.hasFamilyDiscountCode;
	    	self.hasVaccDiscount = value.hasVaccDiscount;
	    	
	    	self.paxTypesMap = [ { paxType: 'ADULT', paxCode: 'ADT'}, { paxType: 'CHILD', paxCode: 'CHILD'}, { paxType: 'INF', paxCode: 'INF'}, 
	    	                      { paxType: 'INFANT', paxCode: 'INFANT'}, { paxType: 'SENIOR', paxCode: 'SENIOR'}, { paxType: 'DISABLED', paxCode: 'DISABLED'}, 
	    	                      { paxType: 'ATTENDANT', paxCode: 'ATTENDANT'}, { paxType: 'TEACHER', paxCode: 'TEACHER'}, { paxType: 'JETYOUTHPROMO', paxCode: 'JETYOUTHPROMO'}, 
	    	                      { paxType: 'UNACCOMPANIED', paxCode: 'UNACCOMPANIED'}, { paxType: 'SOLDIER', paxCode: 'SOLDIER'}, { paxType: 'LADIES_DISCOUNT', paxCode: 'LADIES_DISCOUNT'}, 
	    	                      { paxType: 'DOMESTIC_UNACCOMPANIED', paxCode: 'DOMESTIC_UNACCOMPANIED'}, { paxType: 'YOUTH', paxCode: 'YOUTH'}, { paxType: 'JETYOUTH', paxCode: 'JETYOUTH'}, 
	    	                      { paxType: 'VETERAN', paxCode: 'VETERAN'}, { paxType: 'PEACEKEEPINGFORCE', paxCode: 'PEACEKEEPINGFORCE'}, { paxType: 'STUDENT', paxCode: 'STUDENT'},{ paxType: 'YOUNGADULT', paxCode: 'YOUNGADULT'}];
	    	
	    	
	    	self.findPaxTypeCode = function(paxType) {
	    		
	    		var paxTypeCode = paxType;
	    		var paxTypesMap = self.paxTypesMap;
	    		for(var i=0; i < paxTypesMap.length; i++) {
	    			if(paxTypesMap[i].paxType == paxType) {
	    				paxTypeCode = paxTypesMap[i].paxCode;
	    				break;
	    			}
	    		}
	    		return paxTypeCode;
	    	}
	    	
	    },
	    template:
	        "<!-- ko if: hasFamilyDiscountCode -->\n" + 
	        "<span class=\"text-left fs-16 fs-12-mbl fw300 lh-23\" data-bind=\"i18n-text:{'key': 'aile.indirim.basefare' ,args:{'paxtypelookup': findPaxTypeCode(type),'count': count,'countP':'count'}}\"></span>\n" +
	        "<!-- /ko -->\n" +
	         "<!-- ko if: hasVaccDiscount  -->\n" + 
	        "<span class=\"text-left fs-16 fs-12-mbl fw300 lh-23\" data-bind=\"i18n-text:{'key': 'covid.vaccine.discount.price' ,args:{'paxtypelookup': findPaxTypeCode(type),'count': count,'countP':'count'}}\"></span>\n" +
	        "<!-- /ko -->\n" + 
	        "<!-- ko if: !hasFamilyDiscountCode && !hasVaccDiscount -->\n" + 
	        "<span class=\"text-left fs-16 fs-12-mbl fw300 lh-23\" data-bind=\"i18n-text:{'key':'TextField-OB-71',args:{'paxtypelookup': findPaxTypeCode(type),'count': count,'countP':'count'}}\"></span>\n" + 
	        "<!-- /ko -->\n" + 
	        ""
	});
	
	
	
	ko.bindingHandlers.paxTypeCount = {
		    update: function (element, valueAccessor, allBindingsAccessor) {
		       	
		    	var paxType = ko.utils.unwrapObservable(valueAccessor()).type;
		    	var count  = ko.utils.unwrapObservable(valueAccessor()).count;

		    	$element = $(element);
		    	
		    	var html = i18n.getWithArgs("TextField-OB-71", {'paxtypelookup': paxType, 'count': count, 'countP': 'count' });
		    	$element.html(html);
		    }

		};
		
});





