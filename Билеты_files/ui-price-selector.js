define([
		'knockout',
		'eteration/widgets/widget-util',
		'eteration/eteration-i18n',
		'text!eteration/widgets/template/template-price-selector.html',
		'ui-helper/cookie-helper',
		'underscore'
],
function (ko, widgetUtil, i18n, template, cookieHelper, underscore) {

	widgetUtil.setupStringBasedTemplate(ko);

	ko.templates["price-selector"] = template;

	ko.bindingHandlers['price-selector'] = {
		makeTemplateValueAccessor: function (valueAccessor) {
			var self = valueAccessor();
			
			self.isAwardTicket = valueAccessor().isAwardTicket || false;
			self.availabilityFarePrices = self.availabilityFarePrices || self.flight.availabilityData;
			self.ydusActive = ko.unwrap(valueAccessor().ydusActive) || false;
			self.ecoFlyCompareModalActive = valueAccessor().ecoFlyCompareModalActive || ko.observable(false);
			self.ecoJetCompareModalActive = valueAccessor().ecoJetCompareModalActive || ko.observable(false);
			self.isChangeFlight = valueAccessor().isChangeFlight || false;
			self.isAddFlight = valueAccessor().isAddFlight || false;
			self.aJetTKFlightCompareText = ko.observable('');
			self.ecoFlyModalPriceDifferenceText = ko.observable('');
			self.selectedCategory = ko.observable();
			self.selectedCabinClass = ko.observable();
			self.ecoBrandPriceDifference = ko.observable();
			self.ecoBrandPriceCurrency = ko.observable();

			self.toggleActive = function(data, event){
				$(event.target).siblings('.brand-detail-list').toggleClass('show-more');
			}
			
			self.showRecommended = self.flight.availabilityData != null;
			self.buttonText = (self.data && self.data.status !== 'AVAILABLE') ? 'Sold Out' : 'Select Flight';

			if (self.ydusActive && self.flight.availableFlightFare && self.flight.availableFlightFare.travelType == "AMADEUS"){
				self.brandText = 'brandnamelookup.';
				self.tripType = self.flight.availableFlightFare.tripType;
				setTimeout(function () {
					$('.brand-right-info-international-icon').tooltip({'container': 'body','template': '<div class="tooltip brand-right-info-international" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'});
				},500);
			}else{
				self.brandText = self.flight.domestic ? 'brandnamelookup.' : 'farefamilylookupwithoutcabin.';
			}

			self.selectPanelFlight = function (cabinClass, category) {

				if(self.isAwardTicket) {
					self.panel.updateSelectedFlightAWT(self.flight);
				} else {
					if(typeof(enableOnlineBooker) != 'undefined') {
						self.panel.executeExternalCallback(self.flight, completeAvailabilityPageSingleCity, [false]);
					} else if(category) {
						var extraFlyUpgradeModalId = '#extraFlyUpgradeModal_' + self.flight.routeIndex + '_' + self.flight.index;
						var extraJetUpgradeModalId = '#extraJetUpgradeModal_' + self.flight.routeIndex + '_' + self.flight.index;
						var ajTkCompareModal = '#ajTkCompareModal_' + self.flight.routeIndex + '_' + self.flight.index;

						self.flight.selectedCat = category;

						if (self.ydusActive &&  self.isAjTkCompareModalRequired(category,self.flight)){
							self.selectedCategory(category);
							self.selectedCabinClass(cabinClass);
							$(ajTkCompareModal).modal("show");
						}else if(self.ydusActive && !self.flight.domestic && !(self.brandHasBaggage(category)) && (isExtraFlyUpgradeModalRequired(category) || isExtraJetUpgradeModalRequired(category))){
							if (isExtraFlyUpgradeModalRequired(category) && $(extraFlyUpgradeModalId).length != 0){
								$(extraFlyUpgradeModalId).modal("show");
							}
							if (isExtraJetUpgradeModalRequired(category) && $(extraJetUpgradeModalId).length != 0){
								$(extraJetUpgradeModalId).modal("show");
							}
							if(!self.isChangeFlight && !self.isAddFlight){
								self.calculatePriceDifference(category);
							}
						}else{
							if(self.ydusActive){
								self.panel.updateSelectedFlight(self.flight, category.brandCode, cabinClass, category);
								if(!self.isChangeFlight && !self.isAddFlight){
									self.panel.searchForFareBreakdownCallback(cabinClass, category,self.flight);
								}
							} else{
								self.panel.updateSelectedFlight(self.flight, category.brandCode, cabinClass);
							}
						}
					}
				}
			}

			self.continueWithSelectionAjTkModal = function(){
				var ajTkCompareModal = '#ajTkCompareModal_' + self.flight.routeIndex + '_' + self.flight.index;
				$(ajTkCompareModal).modal("hide");
				$('.modal-backdrop.fade.in').hide();

				var extraFlyUpgradeModalId = '#extraFlyUpgradeModal_' + self.flight.routeIndex + '_' + self.flight.index;
				var extraJetUpgradeModalId = '#extraJetUpgradeModal_' + self.flight.routeIndex + '_' + self.flight.index;

				if (!self.flight.domestic && !(self.brandHasBaggage(self.selectedCategory())) && isExtraFlyUpgradeModalRequired(self.selectedCategory()) && $(extraFlyUpgradeModalId).length != 0 && self.ecoFlyCompareModalActive()){
					$(extraFlyUpgradeModalId).modal("show");
				}else if (!self.flight.domestic && !(self.brandHasBaggage(self.selectedCategory())) && isExtraJetUpgradeModalRequired(self.selectedCategory()) && $(extraJetUpgradeModalId).length != 0 && self.ecoFlyCompareModalActive()){
					$(extraJetUpgradeModalId).modal("show");
				}else{
					self.panel.updateSelectedFlight(self.flight, self.selectedCategory().brandCode, self.selectedCabinClass(), self.selectedCategory());
					if(!self.isChangeFlight && !self.isAddFlight && !self.flight.domestic){
						self.panel.searchForFareBreakdownCallback(self.selectedCabinClass(), self.selectedCategory(),self.flight);
					}
				}
			}


			self.toggleBusinessItems = function(routeIndex,index) {
				$('#categoryWrapperBusiness_'+ routeIndex + '_' + index + ' .category-list').addClass('open');
				if ($('#categoryWrapperBusiness_'+ routeIndex + '_' + index + ' .more-bussines-item').hasClass('visible')){
					$('#categoryWrapperBusiness_'+ routeIndex + '_' + index + ' .more-bussines-item').removeClass('visible');
					$('#categoryWrapperBusiness_'+ routeIndex + '_' + index + ' .more-bussines-item').addClass('hide');
				}

			}

			self.continueWithSelection = function(selection){
				hideExtraFlyUpgradeModal();

				var fareCategories = getAllFareCategories();

				if(validateFareCategories(fareCategories, 'ECONOMY')){
					var subCategories = fareCategories.ECONOMY.subcategories;
					var category = findSubcategoryFromBrandCode(subCategories, selection);

					self.flight.selectedCat = category;
					self.panel.updateSelectedFlight(self.flight, category.brandCode, 'ECONOMY', category);
					if(self.tripType != 'MULTI_CITY' && !self.isChangeFlight && !self.isAddFlight){
						self.panel.searchForFareBreakdownCallback('ECONOMY', category,self.flight);
					}
				}
			}

			self.calculatePriceDifference = function (category) {
				var selectedCurrency = category.price.currency;
				var cookieCurrency = cookieHelper.getCookie("Currency");
				var preferedCurrency = cookieCurrency ? cookieCurrency : selectedCurrency;

				var ecoBrandPrice = category.convertedPrices[preferedCurrency].amount;
				var extraBrandPrice;
				self.availabilityFarePrices.fareCategories.ECONOMY.subcategories.forEach(function (item) {
					if ((category.brandCode == 'CL' && item.brandCode == 'LG') || (category.brandCode == 'JR' && item.brandCode == 'JS') && preferedCurrency){
						extraBrandPrice = item.convertedPrices[preferedCurrency].amount;
					}
				});
				var priceDifference = (extraBrandPrice - ecoBrandPrice).toFixed(2);
				self.ecoBrandPriceDifference(priceDifference);
				self.ecoBrandPriceCurrency(preferedCurrency);
			}

			self.brandHasBaggage = function (category){
				var hasBaggage = underscore.any(category.rights,function (item) {
					return item.rightType == "CHECKED_BAGGAGE" && item.hasRight;
				})
				return hasBaggage;
			}

			function isExtraFlyUpgradeModalRequired(subCategory){
				if(subCategory.brandCode == 'CL' && self.flight.routeIndex == 0 && ko.unwrap(self.ecoFlyCompareModalActive)){
					var fareCategories = getAllFareCategories();

					if(validateFareCategories(fareCategories, 'ECONOMY')){
						var subCategories = fareCategories.ECONOMY.subcategories;

						if(isExtraBrandAvailable(subCategories,subCategory.brandCode)){
							return true;
						}
					}
				}

				return false;
			}

			function isExtraJetUpgradeModalRequired(subCategory){
				if(subCategory.brandCode == 'JR' && self.flight.routeIndex == 0 && ko.unwrap(self.ecoJetCompareModalActive)){
					var fareCategories = getAllFareCategories();

					if(validateFareCategories(fareCategories, 'ECONOMY')){
						var subCategories = fareCategories.ECONOMY.subcategories;

						if(isExtraBrandAvailable(subCategories,subCategory.brandCode)){
							return true;
						}
					}
				}

				return false;
			}



			self.isAjTkCompareModalRequired = function(subCategory,flight){

				var brands=['JS', 'JR', 'JF', 'CL', 'LG', 'FL'];
				var compareStatement = underscore.any(brands,function (item) {
					return subCategory.brandCode == item;
				});

				if(compareStatement){
					if(flight.segments.length > 1){
						var hasAjetFlight = flight.airlinesBySegment.some(function (item) {
							return (item.shortName == 'AJ')
						});
						var hasTKFlight = flight.airlinesBySegment.some(function (item) {
							return (item.shortName == 'TK')
						});
						if (hasAjetFlight && hasTKFlight && !flight.domestic){
							self.aJetTKFlightCompareText(i18n.get("aJetTKFlightCompare.Text"));
						}
						return self.aJetTKFlightCompareText() != '' ? true : false;
					}
				}
				return false;
			}


			function validateFareCategories(fareCategories, cabinClass){
				if(cabinClass && cabinClass == 'ECONOMY'){
					return fareCategories && fareCategories.ECONOMY && fareCategories.ECONOMY.status 
							&& fareCategories.ECONOMY.status == 'AVAILABLE' && fareCategories.ECONOMY.subcategories 
							&& fareCategories.ECONOMY.subcategories.length;
				}
				
				if(cabinClass && cabinClass == 'BUSINESS'){
					return fareCategories && fareCategories.BUSINESS && fareCategories.BUSINESS.status 
							&& fareCategories.BUSINESS.status == 'AVAILABLE' && fareCategories.BUSINESS.subcategories 
							&& fareCategories.BUSINESS.subcategories.length;
				}
			}

			function isExtraBrandAvailable(subCategories,selectedBrand){
				var subCategory = findSubcategoryFromBrandCode(subCategories, selectedBrand);

				return subCategory != null && subCategory.brandSelectable && subCategory.status == 'AVAILABLE';
			}
			
			function findSubcategoryFromBrandCode(subCategories, brandCode){
				var filtered = subCategories.filter(function (el) {
					return el && el.brandCode == brandCode;
				});
				
				return (filtered && filtered.length) ? filtered[0] : null;
			}
			
			function getAllFareCategories(){
				return self.availabilityFarePrices.fareCategories;
			}
			
			function hideExtraFlyUpgradeModal(){
				$('#extraFlyUpgradeModal_' + self.flight.routeIndex + '_' + self.flight.index).modal("hide");
				$('#extraJetUpgradeModal_' + self.flight.routeIndex + '_' + self.flight.index).modal("hide");
				$('body').removeClass('modal-open');
				$('.modal-backdrop').remove();				
			}

			
			function checkSelectableBrandExist() {
				var fareCategories = getAllFareCategories();
				
				if(validateFareCategories(fareCategories, 'ECONOMY')){
					var subCategories = fareCategories.ECONOMY.subcategories;
					
					for(var i=0; i<subCategories.length; i++){
						if(subCategories[i] && !subCategories[i].brandSelectable){
							return true;
						}
					}
				}	
				
				if(validateFareCategories(fareCategories, 'BUSINESS')){
					var subCategories = fareCategories.BUSINESS.subcategories;
					
					for(var i=0; i<subCategories.length; i++){
						if(subCategories[i] && !subCategories[i].brandSelectable){
							return true;
						}
					}
				}
				
				return false;
			}
			
			self.nonSelectableBrandExist = ko.observable(checkSelectableBrandExist());
			
			return function () {
				return { name: 'price-selector', data: self }
			};
		},
		init: function (element, valueAccessor, allBindings) {
			return ko.bindingHandlers.template.init(element, ko.bindingHandlers['price-selector'].makeTemplateValueAccessor(valueAccessor, allBindings, element), allBindings);
		},
		update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			return ko.bindingHandlers.template.update(element, ko.bindingHandlers['price-selector'].makeTemplateValueAccessor(valueAccessor, allBindings, element), allBindings, viewModel, bindingContext);
		}
	};

});
