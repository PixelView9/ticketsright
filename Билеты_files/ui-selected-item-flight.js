define([
	'jquery',
	'knockout',
	'underscore',
    'eteration/eteration-i18n',
	'eteration/widgets/widget-util',
	'text!eteration/widgets/template/template-selected-item-flight.html',
	'text!eteration/widgets/template/template-selected-item-flight-mobile-domestic.html',
	'text!eteration/widgets/template/template-selected-item-flight-international.html',
	'eteration/widgets/ui-price-selector'
],
function($,ko, underscore, i18n, widgetUtil, template, tempMobileDomestic, tempInt) {

	widgetUtil.setupStringBasedTemplate(ko);
	
	function getDayChangeText(count) {
		if (count === 0)
			return '';
		else if (count === 1)
			return i18n.get('TextField-OB-165.nextday');
		else if (count === 2)
			return '+ ' + i18n.get('TextField-OB-165.2days');
		else if (count === 3)
			return '+ ' + i18n.get('TextField-OB-165.3days');
	}

	ko.templates["selected-item-flight"] = template;
	
	ko.bindingHandlers['selected-item-flight'] = {

		makeTemplateValueAccessor : function(valueAccessor, allBindings, element) {
			var self = {};
			self.links = valueAccessor().links;
			self.flight = valueAccessor().flight;
			self.flightIndex = valueAccessor().flightIndex;

            self.hasDetailBar = valueAccessor().hasDetailBar || true;
            self.isAwardTicket = valueAccessor().isAwardTicket || false;
            self.isChangeFlight = valueAccessor().isChangeFlight || false;
            self.isShowPriceColumn = valueAccessor().isShowPriceColumn || true;
            
			self.showHideDetail = function(event,e) {
				$(e.target).parents('.canvas-table-wrapper').toggleClass('show-detail');
			}
			
			if(valueAccessor().isShowDetail) {
				$('.canvas-table-wrapper').addClass('show-detail');
			}
			
			self.isDayChanged = function () {
				return getDayChangeText(self.flight.arrivalDayDifference || 0);
			}

			return function() { return { name : 'selected-item-flight', data : self } };
		},
		
		init : function(element, valueAccessor, allBindings) {
			return ko.bindingHandlers.template.init(element, ko.bindingHandlers['selected-item-flight'].makeTemplateValueAccessor(valueAccessor, allBindings, element), allBindings);
		},
		
		update : function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			return ko.bindingHandlers.template.update(element, ko.bindingHandlers['selected-item-flight'].makeTemplateValueAccessor(valueAccessor, allBindings, element), allBindings, viewModel, bindingContext);
		}
		
	};
	
	ko.virtualElements.allowedBindings['selected-item-flight'] = true;

	/* YUS DOMESTIC WEB BEGIN  */////////////////////////////////////////////////////////////////////////

    var cabinClassFunc = function(flight) {
        var cabinObj = {
            type: '',
            detail: {
                brandCode: '',
                classList: []
            }
        };

        if (flight.availabilityData) {
        	cabinObj.type = i18n.get('noclasscabintypelookup.' + flight.availabilityData.selectedFareInfo.cabinClass.toLowerCase());
            cabinObj.detail.brandCode = i18n.get('brandnamelookup.' + flight.availabilityData.selectedFareInfo.brandCode);
            var selectedBrandCode = flight.availabilityData.selectedFareInfo.brandCode;
            
            flight.availabilityData.fareCategories[flight.availabilityData.selectedFareInfo.cabinClass].subcategories.forEach(function (item) {
            	if(item.brandCode == selectedBrandCode && item.fareClasses)
            		cabinObj.detail.classList.push(item.fareClasses);
            });
        } else {
            if(flight.brandCode) {
            	cabinObj.detail.brandCode = i18n.get('brandnamelookup.' + flight.brandCode);
            } else if(ko.unwrap(flight.priceForSelectedFareBasisCode)) {
            	cabinObj.detail.brandCode = i18n.get('farefamilylookupwithoutcabin.' + flight.priceForSelectedFareBasisCode().code);
            }
            
            if(flight.cabinClass) {
            	cabinObj.type = i18n.get('noclasscabintypelookup.' + flight.cabinClass.toLowerCase());
            } else if(ko.unwrap(flight.priceForSelectedFareBasisCode)) {
            	cabinObj.type = i18n.get('noclasscabintypelookup.' + flight.priceForSelectedFareBasisCode().cabinClass.toLowerCase());
            }

            if(flight.segments) {
            	underscore.each(flight.segments, function (item, index) {
            		if(item.fareBase && item.fareBase.code) {
            			cabinObj.detail.classList.push(item.fareBase.code);
            		} else if(ko.unwrap(flight.priceForSelectedFareBasisCode)) {
            			flight.priceForSelectedFareBasisCode().flightClasses[index] && cabinObj.detail.classList.push(flight.priceForSelectedFareBasisCode().flightClasses[index]);
            		}
                });
            }
            
            if(!ko.unwrap(flight.priceForSelectedFareBasisCode) && flight.bookingPriceTagForSelectedFareBasisCode && flight.availableFlightFare) {
            	cabinObj.type = !cabinObj.type ? i18n.get('noclasscabintypelookup.' + flight.bookingPriceTagForSelectedFareBasisCode.cabinClass.toLowerCase()) : cabinObj.type;
            	cabinObj.detail.brandCode = !cabinObj.detail.brandCode ? i18n.get('farefamilylookupwithoutcabin.' + flight.bookingPriceTagForSelectedFareBasisCode.code) : cabinObj.detail.brandCode;
            	cabinObj.detail.classList = !cabinObj.detail.classList.length ? flight.bookingPriceTagForSelectedFareBasisCode.flightClasses : cabinObj.detail.classList;
            }

        }
        return cabinObj;
    }
    
    ko.templates["selected-item-flight-international"] = tempInt;

    ko.bindingHandlers['selected-item-flight-international'] = {

        makeTemplateValueAccessor : function(valueAccessor, allBindings, element) {
            var self = {};
            self.flight = valueAccessor().flight;
            self.links = valueAccessor().links;
            self.flightIndex = valueAccessor().flightIndex;

            self.hasDetailBar = valueAccessor().hasDetailBar || true;
            self.isAwardTicket = valueAccessor().isAwardTicket || false;
            self.isChangeFlight = valueAccessor().isChangeFlight || false;
            self.isShowPriceColumn = valueAccessor().isShowPriceColumn || true;
            self.isCheckinProcess = valueAccessor().isCheckinProcess || false;
            self.ydusActive = valueAccessor().ydusActive || false;
            self.cabinClassObj = ko.observable();
            
            var cabinType = cabinClassFunc(self.flight);
            self.cabinClassObj(cabinType);
            
            self.showHideDetail = function(event,e) {
                $(e.target).parents('.canvas-table-wrapper').toggleClass('show-detail');
            }

            if(valueAccessor().isShowDetail) {
                $('.canvas-table-wrapper').addClass('show-detail');
            }
            
            self.isDayChanged = function () {
            	return getDayChangeText(self.flight.arrivalDayDifference || 0);
			}

            return function() { return { name : 'selected-item-flight-international', data : self } };
        },

        init : function(element, valueAccessor, allBindings) {
            return ko.bindingHandlers.template.init(element, ko.bindingHandlers['selected-item-flight-international'].makeTemplateValueAccessor(valueAccessor, allBindings, element), allBindings);
        },

        update : function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            return ko.bindingHandlers.template.update(element, ko.bindingHandlers['selected-item-flight-international'].makeTemplateValueAccessor(valueAccessor, allBindings, element), allBindings, viewModel, bindingContext);
        }

    };

    ko.virtualElements.allowedBindings['selected-item-flight-international'] = true;

    /* YUS DOMESTIC WEB END  */
    

	/* YUS DOMESTIC MOBILE BEGIN  */////////////////////////////////////////////////////////////////////////

    ko.templates["selected-item-flight-mobile-domestic"] = tempMobileDomestic;

    ko.bindingHandlers['selected-item-flight-mobile-domestic'] = {

        makeTemplateValueAccessor : function(valueAccessor, allBindings, element) {
            var self = valueAccessor();
            self.hasDetailBar = valueAccessor().hasDetailBar || true;
            self.isAwardTicket = valueAccessor().isAwardTicket || false;
            self.isChangeFlight = valueAccessor().isChangeFlight || false;
            self.isShowPriceColumn = valueAccessor().isShowPriceColumn || true;
			self.flightIndex = valueAccessor().flightIndex;
			self.isCheckin = valueAccessor().isCheckin || false;
            self.cabinClassObj = ko.observable();
            
            var cabinType = cabinClassFunc(self.flight);
            self.cabinClassObj(cabinType);
            
            self.showHideDetail = function(event,e) {
                $(e.target).parents('.canvas-table-wrapper').toggleClass('show-detail');
            }

            if(valueAccessor().isShowDetail) {
                $('.canvas-table-wrapper').addClass('show-detail');
            }

            self.isDayChanged = function () {
            	return getDayChangeText(self.flight.arrivalDayDifference || 0);
			}

            return function() { return { name : 'selected-item-flight-mobile-domestic', data : self } };
        },

        init : function(element, valueAccessor, allBindings) {
            return ko.bindingHandlers.template.init(element, ko.bindingHandlers['selected-item-flight-mobile-domestic'].makeTemplateValueAccessor(valueAccessor, allBindings, element), allBindings);
        },

        update : function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            return ko.bindingHandlers.template.update(element, ko.bindingHandlers['selected-item-flight-mobile-domestic'].makeTemplateValueAccessor(valueAccessor, allBindings, element), allBindings, viewModel, bindingContext);
        }

    };

    ko.virtualElements.allowedBindings['selected-item-flight-mobile-domestic'] = true;

    /* YUS DOMESTIC MOBILE END  */

});

