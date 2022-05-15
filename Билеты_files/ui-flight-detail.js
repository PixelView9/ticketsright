define([
	'knockout',
	'eteration/widgets/widget-util',
	'eteration/eteration-i18n',
	'text!eteration/widgets/template/template-flight-detail.html',
	'eteration/eteration-ajax', 
    'eteration/widgets/ui-isodate',
    'eteration/widgets/ui-layover'
],
function(ko, widgetUtil, i18n, template, etrAjax) {

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
	
	function calculateNonTKSegmentList(airlineList){
		if(!Array.isArray(airlineList)) return []
		 return airlineList
		 		.filter(filterSpaOrCodeShare)
	}
	
	function filterSpaOrCodeShare(airline){
		if(airline != null){
			if( (['TK'].indexOf(airline.shortName) == -1)){
				return true
			}
		}
		return false
	}
	
	ko.templates["flight-detail"] = template;

	ko.bindingHandlers['flight-detail'] = {
		makeTemplateValueAccessor : function(valueAccessor) {
			var self = {};
			self.panel = valueAccessor().panel || false;
			self.getEligibilityFunction = self.panel.getHotelInstanbulEligibilityForSelectedFlight ? self.panel.getHotelInstanbulEligibilityForSelectedFlight : function() { };
			self.flight = valueAccessor().flight || {};
			self.availabilityFarePrices = valueAccessor().availabilityFarePrices || valueAccessor().flight.availabilityData;
			self.isPhone = window.isPhone;
			self.segments = valueAccessor().flight.segments;
			self.isChangeFlight = valueAccessor().isChangeFlight || false;
			self.selectedFlight = valueAccessor().selectedFlight || false;
			self.isAwardTicket = valueAccessor().isAwardTicket || false;
			self.usageStatus = (valueAccessor().usageStatus == '1' && self.isAwardTicket && !self.isChangeFlight) || false;
			self.links = valueAccessor().links;
			self.showDetails = valueAccessor().showDetails || self.flight.showDetails;
			self.ydusActive = valueAccessor().ydusActive || false;
			
			if(self.ydusActive){
				self.notBrandedFlight = false;
			} else{
				self.notBrandedFlight = valueAccessor().notBrandedFlight || valueAccessor().isChangeFlight || false;
			}

			self.isDayChanged = function () {
				return getDayChangeText(self.flight.arrivalDayDifference || 0);
			};
			
			self.getSelectableColumn = function(_d, e) {
				if(!self.usageStatus) {
					$(e.target).parents('.canvas-table-wrapper').find('.price-col:not(.disabled)').first().trigger('click');
				} else {
					self.usagaStatusModalShow();
				}
			}
			
			self.usagaStatusModalShow = function(){
				etrAjax.showErrorModal('Label-MS-INFO-1453');
			}
			self.nonTKSegmentList = calculateNonTKSegmentList(valueAccessor().flight.airlinesBySegment)

            return function() { return { name : 'flight-detail', data : self } };
		},
		init : function(element, valueAccessor, allBindings) {
			return ko.bindingHandlers.template.init(element, ko.bindingHandlers['flight-detail'].makeTemplateValueAccessor(valueAccessor, allBindings, element), allBindings);
		},
		update : function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			return ko.bindingHandlers.template.update(element, ko.bindingHandlers['flight-detail'].makeTemplateValueAccessor(valueAccessor, allBindings, element), allBindings, viewModel, bindingContext);
		}
	};
	
	ko.virtualElements.allowedBindings['flight-detail'] = true;
});
