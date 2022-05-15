define([ 'knockout', 'eteration/eteration-i18n', 'eteration/eteration-ajax','underscore'],

function(ko,i18n,etrAjax,underscore) {
	var hasStopOptions = false, i;
	
	function SortData(options, selectedOptionValue) {
		var self = this;
		self.sortOptions = ko.observableArray(options);
		self.selectedSortKey = ko.observable(selectedOptionValue);
		self.selectedSortDirection = ko.observable(1);
		self.sortersAvailable = ko.observable(true);
		self.openSortOptionModal= ko.observable(true);
		
		self.openSortingModal = function(sortModal){
			self.openSortOptionModal(false);
			$("#"+sortModal).modal("show");
			self.openSortOptionModal(true);
		}
	}
	
	function checkForFixedPriceBar() {
		if($('body').hasClass('has-fixed-price-bar'))
			$('body').removeClass('has-fixed-price-bar').css('padding-bottom', '');
	}
	
	function FilterData(originOptions,destinationOptions,airlineOptions,stopOptions, initialFilters) {
		var self = this;
		
		self.panelVisible = ko.observable(false);

		self.originAirportFilterOptions = ko.observableArray(originOptions);
		self.selectedOriginAirportFilters = ko.observableArray(OptionArrayToOptionValueArray(originOptions));

		self.destinationAirportFilterOptions = ko.observableArray(destinationOptions);
		self.selectedDestinationAirportFilters = ko.observableArray(OptionArrayToOptionValueArray(destinationOptions));

		self.airlineFilterOptions = ko.observableArray(airlineOptions);
		self.selectedAirlineFilters = ko.observableArray(OptionArrayToOptionValueArray(airlineOptions));
		
		self.stopFilterOptions = ko.observableArray(ObjectArrayToOptionArray(stopOptions));
		
		if(initialFilters && initialFilters.directFlight && stopOptions && stopOptions.indexOf(0) != -1) {
			self.selectedStopFilters = ko.observableArray([0]);
		} else {
			self.selectedStopFilters = ko.observableArray(stopOptions);	
		}

		self.timeRangeStartIndex = ko.observable();
		self.timeRangeEndIndex = ko.observable();
		
		self.timeRangeStartValue = ko.observable();
		self.timeRangeEndValue = ko.observable();
		
		self.optionFiltersAvailable = ko.observable(true);
		self.timeRangeFiltersAvailable = ko.observable(true);
		
		self.optionFiltersEditable = ko.computed(function() {
			var originAirportEditable = self.originAirportFilterOptions().length > 1;
			var destinationAirportEditable = self.destinationAirportFilterOptions().length > 1;
			var airlineEditable = self.airlineFilterOptions().length > 1;
			var stopEditable = self.stopFilterOptions().length > 1;
			return originAirportEditable || destinationAirportEditable || airlineEditable || stopEditable ;
		});
		
		self.filterCssClass = ko.computed(function() {
			var enabledFilterCount = 0;
			
			enabledFilterCount += self.originAirportFilterOptions().length > 1 ? 1 : 0;
			enabledFilterCount += self.destinationAirportFilterOptions().length > 1 ? 1 : 0;
			enabledFilterCount += self.airlineFilterOptions().length > 1 ? 1 : 0;
			enabledFilterCount += self.stopFilterOptions().length > 1 ? 1 : 0;

			if (!enabledFilterCount) {
				return '';
			}
			
			var columnWidth = 12 / enabledFilterCount; 
			var columnCssClass = 'col-border text-center col-sm-' + columnWidth;
			return columnCssClass;
		});
	}

	function CFFSection(name, value, options, startingPrice, hotelEligibilityLayoverHour) {
		
		var self = this;
		
		self.name = name;
		self.value = ko.observable(value);
		self.options = ko.observable(options);
		self.startingPrice = ko.observable(startingPrice);
		self.selectedOption = ko.observable(options[0]);
		self.hotelEligibilityLayoverHour = hotelEligibilityLayoverHour;

		self.changeSelectedOption = function(section) { 
			self.selectedOption(section);
		};
			
		self.isActive = ko.observable(false);
		
	}
	
	function emptyCFFSection() {
		return new CFFSection('', '', [], '','');
	}
	
	function RouteArrayToPanelArray(routes, sortData, filterData, holder) {
		var panelArray = [];
		for (var routeIndex = 0; routeIndex < routes.length; routeIndex++) {
			var flightDay = routes[routeIndex].days[0];
			
			sortData = sortData ? sortData : GenerateDefaultSortData();

			var filterDataNew = filterData ? filterData : FilterDataFromFlightDay(flightDay);

			var flightListPanel = new FlightListPanelSingleCity(flightDay, sortData, filterDataNew, routeIndex, holder);

			panelArray.push(flightListPanel);

		}

		return panelArray;
		
	}
	
	
	function findInitialCFFSection(sections, defaultOpen, initialCFFCode, initialFFCode) {
		
		var section = null, currentSection, sectionIndex;

		if(initialCFFCode || initialFFCode) {
			for (sectionIndex = 0; sectionIndex < sections.length && !section; sectionIndex++) {
				
				currentSection = sections[sectionIndex];

				//IF THERE IS A DEFAULT CFFCODE
				if(currentSection.value() == initialCFFCode){
					section = currentSection;
					if(initialFFCode) {
						updateInitialSection(section, initialFFCode);
					}
				}

				//IF THERE IS NO DEFAULT CFFCODE OR DEFAULT CFFCODE NOT FOUND
				//IF THERE IS A DEFAULT FFCODE
				if(!section && initialFFCode) {
					section = updateInitialSection(currentSection, initialFFCode);
				}
			}
		} 
		
		//IF SECTION NOT FOUND WITH DEFAULT CFFCODE OR FFCODE, TRY FINDING NONE-GLOBAL FF
		for (sectionIndex = 0; sectionIndex < sections.length && !section; sectionIndex++) {
			currentSection = sections[sectionIndex];
			if(currentSection.value().indexOf('GLOBAL') == -1){
				section = currentSection;
			}
		}

		//IF THERE IS NOT ANY NONE-GLOBAL FF, SET THE FIRST ONE
		if (!section && sections.length) {
			section = sections[0];
		}

		if (section) {
			section.isActive(defaultOpen);
		}
		return section;
	}
	
	function updateInitialSection(section, initialFFCode) {
		for (i = 0; i < section.options().length ; i++) {
			var sectionOption = section.options()[i];
			if(sectionOption.subCategoryCode == initialFFCode){
				var selectedSection = section;
				selectedSection.selectedOption(sectionOption);
				return selectedSection;
			}
		}
		return null;
	}
	
	function generateCFFSections(fareCategories) {
		var cffSections = [];

		for (var fareCategoryIndex = 0; fareCategories && fareCategoryIndex < fareCategories.length; fareCategoryIndex++) {
			var fc = fareCategories[fareCategoryIndex];
			cffSections.push(new CFFSection(fc.categoryName, fc.categoryCode, fc.subCategories, fc.startingPrice, fc.hotelEligibilityLayoverHour));
		}

		return cffSections;
	}
	
	function containsAll(needles, haystack) {
		for (i = 0; i < needles.length; i++) {
			if ($.inArray(needles[i], haystack) == -1){
				return false;
			}
		}
		return true;
	}
	
	function flightFilterUtil(filterData, timeframe) {
		
		filterData = ko.unwrap(filterData);
		timeframe = ko.unwrap(timeframe);
		
		return{
			
			filterByStops : function(flight) {
				
				if(!filterData.selectedStopFilters().length){
					return true;
				}
			
				if(filterData.selectedStopFilters().length == filterData.stopFilterOptions().length){
					return true;
				}
			
				return $.inArray(flight.countOfAllStops, filterData.selectedStopFilters()) >= 0;
			
			},
			
			filterByAirlines : function(flight) {

				
				if(!filterData.selectedAirlineFilters().length){
					return true;
				}
			
				if(filterData.selectedAirlineFilters().length == filterData.airlineFilterOptions().length){
					return true;
				}
			
				return containsAll(extractShortCodesMasked(flight), filterData.selectedAirlineFilters());
			
			},
			
			filterByOriginAirports : function(flight) {


				if(!filterData.selectedOriginAirportFilters().length){
					return true;
				}
				
				if(filterData.selectedOriginAirportFilters().length == filterData.originAirportFilterOptions().length){
					return true;
				}
				
				return containsAll([flight.firstSegment.originAirport.code], filterData.selectedOriginAirportFilters());
			
			},
			
			filterByDestinationAirports : function(flight) {

				if(!filterData.selectedDestinationAirportFilters().length){
					return true;
				}
				
				if(filterData.selectedDestinationAirportFilters().length == filterData.destinationAirportFilterOptions().length){
					return true;
				}
				
				return containsAll([flight.lastSegment.destinationAirport.code], filterData.selectedDestinationAirportFilters());
			
			},
			
			filterByTimeRange : function(flight) {
				
				if (!(filterData.timeRangeFiltersAvailable() && filterData.timeRangeStartValue() &&filterData.timeRangeEndValue())) {
					return true;
				}
				
				var departureDateTimeISO = flight.firstSegment.departureDateTimeISO;
				var arrivalDateTimeISO = flight.lastSegment.arrivalDateTimeISO;
				
				var usagePurposeMap = { 'DEPARTURE_AFTER' : departureDateTimeISO.epochMinutesUtc, 'DEPARTURE_BEFORE' : departureDateTimeISO.epochMinutesUtc, 'ARRIVAL_AFTER' : arrivalDateTimeISO.epochMinutesUtc,'ARRIVAL_BEFORE' : arrivalDateTimeISO.epochMinutesUtc};
				
				var startForDateRangeFilter = usagePurposeMap[timeframe.usagePurpose.left];
				var endForDateRangeFilter = usagePurposeMap[timeframe.usagePurpose.right];

				return (startForDateRangeFilter >= filterData.timeRangeStartValue()*60) && (endForDateRangeFilter <= filterData.timeRangeEndValue()*60);

			}
			
		};
	}
	
	function flightVisibilityUtil(flightFilterUtil){
		return{
			computeVisibility : function(flight) {
				flight.visible(flightFilterUtil.filterByStops(flight) && flightFilterUtil.filterByAirlines(flight) && flightFilterUtil.filterByOriginAirports(flight) && flightFilterUtil.filterByDestinationAirports(flight) && flightFilterUtil.filterByTimeRange(flight));
			}
		}
	}
	
	function flightSortUtilBrandedDomestic(sortData) {
		var sortDirection = sortData.selectedSortDirection();
		return {
			compareByDeparture : function(a, b) {
				var aTime = a.firstSegment.departureDateTime + a.firstSegment.departureDateTimeTimeZoneRawOffset;
				var bTime = b.firstSegment.departureDateTime + b.firstSegment.departureDateTimeTimeZoneRawOffset;
				return sortDirection * (aTime - bTime);
			},
			compareByArrival : function(a, b) {
				var aTime = a.lastSegment.arrivalDateTime + a.lastSegment.arrivalDateTimeTimeZoneRawOffset;
				var bTime = b.lastSegment.arrivalDateTime + b.lastSegment.arrivalDateTimeTimeZoneRawOffset;
				return sortDirection * (aTime - bTime);
			},
			compareBySegmentCount : function(a, b) {
				var aLength = a.segments.length;
				var bLength = b.segments.length;
				return sortDirection * (aLength - bLength);
			},
			compareByDuration : function(a, b) {
				return sortDirection * (a.totalTravelDurationISO - b.totalTravelDurationISO);
			},
			compareByPrice : function(a, b) {
				var aCat = a.availabilityData.fareCategories;
				var bCat = b.availabilityData.fareCategories;
				var priceOfA = aCat ? ((aCat.ECONOMY && aCat.ECONOMY.hasLowestPrice) ?
								aCat.ECONOMY.minPriceSubcategory.price.amount : ((aCat.BUSINESS && aCat.BUSINESS.hasLowestPrice) ?
										aCat.BUSINESS.minPriceSubcategory.price.amount : null)) : null;
				var priceOfB = bCat ? ((bCat.ECONOMY && bCat.ECONOMY.hasLowestPrice) ?
								bCat.ECONOMY.minPriceSubcategory.price.amount : ((bCat.BUSINESS && bCat.BUSINESS.hasLowestPrice) ?
										bCat.BUSINESS.minPriceSubcategory.price.amount : null)) : null;
				
				if (!priceOfA && priceOfB) {
					return 1;
				}
				if (priceOfA && !priceOfB) {
					return -1;
				}
				if (!priceOfA && !priceOfB) {
					return 0;
				}
				return sortDirection * (priceOfA - priceOfB)
			}
		}
	}
	
	function flightSortUtil(sortData) {
		var sortDirection = sortData.selectedSortDirection();
		return {
			compareByDeparture : function(a, b) {
				var aTime = a.firstSegment.departureDateTime + a.firstSegment.departureDateTimeTimeZoneRawOffset;
				var bTime = b.firstSegment.departureDateTime + b.firstSegment.departureDateTimeTimeZoneRawOffset;
				return sortDirection * (aTime - bTime);
			},
			compareByArrival : function(a, b) {
				var aTime = a.lastSegment.arrivalDateTime + a.lastSegment.arrivalDateTimeTimeZoneRawOffset;
				var bTime = b.lastSegment.arrivalDateTime + b.lastSegment.arrivalDateTimeTimeZoneRawOffset;
				return sortDirection * (aTime - bTime);
			},
			compareBySegmentCount : function(a, b) {
				var aLength = a.segments.length;
				var bLength = b.segments.length;
				return sortDirection * (aLength - bLength);
			},
			compareByDuration : function(a, b) {
				return sortDirection * (a.totalTravelDurationISO - b.totalTravelDurationISO);
			},
			compareByPrice : function(a, b) {
				var priceOfA, priceOfB;
				try {
					if(a.priceForSelectedFareBasisCode()) {
						priceOfA = (a.priceForSelectedFareBasisCode() && a.priceForSelectedFareBasisCode().convertedPrices['ORIGINAL_PRICE']) ? a.priceForSelectedFareBasisCode().convertedPrices['ORIGINAL_PRICE'].amount : null;
						priceOfB = (b.priceForSelectedFareBasisCode() && b.priceForSelectedFareBasisCode().convertedPrices['ORIGINAL_PRICE']) ? b.priceForSelectedFareBasisCode().convertedPrices['ORIGINAL_PRICE'].amount : null;
					} else {
						underscore.sortBy(a.bookingPriceTagHolder.priceTags, function(tag) { return tag.convertedPrices['ORIGINAL_PRICE'].amount; })
						priceOfA = a.bookingPriceTagHolder.priceTags[0].convertedPrices['ORIGINAL_PRICE'].amount;
						
						underscore.sortBy(b.bookingPriceTagHolder.priceTags, function(tag) { return tag.convertedPrices['ORIGINAL_PRICE'].amount; })
						priceOfB = b.bookingPriceTagHolder.priceTags[0].convertedPrices['ORIGINAL_PRICE'].amount;
					}
				} catch (e) {
					console.log(e);
				}
				
				if (!priceOfA && priceOfB) {
					return 1;
				}
				if (priceOfA && !priceOfB) {
					return -1;
				}
				if (!priceOfA && !priceOfB) {
					return 0;
				}
				return sortDirection * (priceOfA - priceOfB)
			}
		}
	}
	
	function extractShortCodesMasked(flight) {

		var shortCodes = [];

		for (i = 0; i<flight.participatingAirlinesMasked.length;i++) {
			shortCodes.push(flight.participatingAirlinesMasked[i].shortName);
		}
		

		return shortCodes;
	}
	
	function ObjectArrayToOptionArray(objectArray, text , value) {
		var optionArray = [];
			
		if(text && value) {
			for (i = 0;i < objectArray.length;i++) {
				optionArray.push({ text : objectArray[i][text], value : objectArray[i][value]});
			}
		}  else {
			for (i = 0;i < objectArray.length;i++) {
				optionArray.push({ text : objectArray[i],value : objectArray[i]});
			}
		}

		return optionArray;
	}
	
	function OptionArrayToOptionValueArray(optionArray) {
		var optionValueArray = [];

		for (i=0 ; i< optionArray.length;i++) {
			optionValueArray.push(optionArray[i].value);
		}

		return optionValueArray;
	}
	
	
	function FilterDataFromFlightDay(flightDay, filters) {
		var originOptions = ObjectArrayToOptionArray(flightDay.participatingOriginAirports, 'code', 'code');
		var destinationOptions = ObjectArrayToOptionArray(flightDay.participatingDestinationAirports, 'code', 'code');
		var airlineOptions = ObjectArrayToOptionArray(flightDay.participatingAirlinesMasked, 'shortName', 'shortName');
		var stopOptions  = flightDay.distinctCountOfStops;
		hasStopOptions = stopOptions && stopOptions.length > 1;
		return new FilterData(originOptions,destinationOptions,airlineOptions,stopOptions, filters);
	}

	function getSegmentCountSortOption(){
		return {text : i18n.get('Label-OB-90'),value : 'segmentcount'};
	}
	function getDepartureTimeSortOption(){
		return {text : i18n.get('Label-OB-79'),value : 'departuretime'};
	}
	function getArrivalTimeSortOption(){
		return {text : i18n.get('Label-OB-83'),value : 'arrivaltime'};
	}
	function getDurationSortOption(){
		return {text : i18n.get('Label-OB-85'),value : 'duration'};
	}
	function getPriceSortOption(){
		return {text : i18n.get('Label-OB-84'),value : 'price'};
	}
	
	function GenerateDefaultSortData() {
		var options = [ getDepartureTimeSortOption(), getArrivalTimeSortOption(), getPriceSortOption(), getDurationSortOption() ];
		var selectedOptionValue = 'departuretime';
		if(hasStopOptions) {
			options = [ getSegmentCountSortOption(), getDepartureTimeSortOption(), getArrivalTimeSortOption(), getPriceSortOption(), getDurationSortOption() ];
			selectedOptionValue = 'segmentcount';
		}
		return new SortData(options, selectedOptionValue);
	}
	
	function GenerateTimetableSortData() {
		var options = [ getDepartureTimeSortOption(), getArrivalTimeSortOption(), getDurationSortOption() ];
		var selectedOptionValue = 'departuretime';
		if(hasStopOptions) {
			options = [ getSegmentCountSortOption(), getDepartureTimeSortOption(), getArrivalTimeSortOption(), getDurationSortOption() ];
			selectedOptionValue = 'segmentcount';
		}
		return new SortData(options, selectedOptionValue);
	}
	
	function GenerateMulticitySortData() {
		var options = [ getDepartureTimeSortOption(), getArrivalTimeSortOption(), getDurationSortOption() ];
		var selectedOptionValue = 'departuretime';
		if(hasStopOptions) {
			options = [ getSegmentCountSortOption(), getDepartureTimeSortOption(), getArrivalTimeSortOption(), getDurationSortOption() ];
			selectedOptionValue = 'segmentcount';
		}
		return new SortData(options, selectedOptionValue);
	}
	
	function showToast(type, givenText) {
		//toast types
		//success, error, info, warning
		//default type is empty
		
		if($('#toast').length) {
			givenText = givenText != '' ? i18n.get(givenText) : i18n.get('Label-Genel-101');
			$('#toast').append('<div class="' + type + '">' + givenText + '</div>');
			$('#toast').addClass('opened');
			var setTime = setTimeout(function(){
				$('#toast .' + type).first().css('top', '-200px').remove();
				if($('#toast > div').length < 1)
					$('#toast').removeClass('opened');
			}, 1500);
		}else{
			$('body').append('<div id="toast" class="toast"></div>');
			showToast(type, givenText);
		}
	}
	
	function isDomestic(bookingRequest) {
		try {
			return bookingRequest && underscore.all(bookingRequest.bookings, function(booking) {return booking.originAirport.domestic && booking.destinationAirport.domestic});
		} catch (e) {
			console.log(e);
			return undefined;
		}
	}
	
	function showAllWarnings(index) {
		var count = 0;
		var intervalShowAllWarnings = setInterval(function() {
			count++;
			var wrapper = $('.showWarning_' + index);
			var warningHeight = wrapper.find(".warning-ul").height();
	        	if(warningHeight > 60){
		    	    clearInterval(intervalShowAllWarnings);
		    	    wrapper.find(".allWarnings").removeClass('hidden');
	        	}
		        if(count > 5){
		    	   clearInterval(intervalShowAllWarnings);
		        }
		}, 400);	
	}
	
	function getFirstSelectableBrand(fareCategories, cabinClass){
		var fareCategory = fareCategories[cabinClass];
		
		if(validateFareCategory(fareCategory)){
			var firstSelectableSubcategory = findFirstSelectableSubcategory(fareCategory);
			
			if(firstSelectableSubcategory != null){
				return firstSelectableSubcategory;
			}
		}
		
		for (var key in fareCategories) {
		    if (fareCategories.hasOwnProperty(key)) {
		    	var fareCategory = fareCategories[key];
		    	
				if(validateFareCategory(fareCategory)){
					var firstSelectableSubcategory = findFirstSelectableSubcategory(fareCategory);
					
					if(firstSelectableSubcategory != null){
						return firstSelectableSubcategory;
					}
				}
		    }
		}
		
		return null;
	}
	
	function findFirstSelectableSubcategory(fareCategory){
		var subcategories = fareCategory.subcategories;
		
		if(subcategories && subcategories.length){
			for(var i = 0; i < subcategories.length; i++){
				if(subcategories[i] && subcategories[i].status == 'AVAILABLE' && subcategories[i].brandSelectable){
					return subcategories[i];
				}
			}
		}
		
		return null;
	}
	
	function validateFareCategory(fareCategory){
		if(fareCategory && fareCategory.status && fareCategory.status == 'AVAILABLE' && fareCategory.subcategories && fareCategory.subcategories.length){
			return true;
		}
		
		return false;
	}
	
	function FlightListPanelSingleCity(flightDay, sortData, filterData, index, parent, bookingRequest) {

		var self = this;
		var isInternationalView; // for international view
		self.sortData = sortData;
		self.filterData = filterData;
		self.hotelEligible = flightDay.hotelEligible;
		self.hotelEligibilityForSelectedSegment = ko.observable(false);
		self.availabilityWarnings = flightDay.availabilityWarnings ? flightDay.availabilityWarnings : ko.observable(false);
		self.showMoreFlag = ko.observable(false);
		
		self.initialSelectedFlightNumber = flightDay.initialSelectedFlightNumber;
		
		var flightsToList = flightDay.flights;
		
		var initialFFCode = flightDay.initialFFCode;
		var initialCFFCode = flightDay.initialCFFCode;
		var deeplink = bookingRequest ? bookingRequest.deepLink : false;
		var domestic = isDomestic(bookingRequest);
		var mixCabin = parent ? parent.mixCabin() : true;
		
		self.index = ko.observable(index);
		
		self.hasNoFlight = ko.observable(flightDay.hasNoFlight);
		self.hasFlight = ko.observable(!flightDay.hasNoFlight);
		
		self.selectedPaymentCurrency = ko.observable(flightDay.originalCurrency.code);

		self.primaryPaxCode = flightDay.primaryPaxCode;
		
		self.fareFamilyTabDefaultOpen = ko.observable(flightDay.fareFamilyTabDefaultOpen);
		
		self.oneWayWeeklyViewPanelDefaultOpen = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.oneWayWeeklyViewOpen : false);
		self.roundTripWeeklyViewPanelDefaultOpen = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.roundTripWeeklyViewOpen : false);
		self.oneWayWeeklyViewPanelDefaultOpenMobile = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.oneWayWeeklyViewOpenMobile : false);
		self.daysToTimeRangeEnd = flightDay.daysToTimeRangeEnd;
		self.daysToTimeRangeBeginning = flightDay.daysToTimeRangeBeginning;

		self.navigateToPreviousDayEnabled = !flightDay.onTimeRangeBeginning;
		self.navigateToNextDayEnabled = !flightDay.onTimeRangeEnd;		
	   		
		self.timeframe = ko.observable(flightDay.timeframe) ;
		
		self.cheapestFareFamilyData = ko.observable(flightDay.cheapestFareFamilyData);

		self.fareFamilyFallBackListMap = flightDay.fareFamilyFallBackListMap;
		
		self.selectedSection = ko.observable(emptyCFFSection());
		
		showAllWarnings(index);
		
		self.showMore = function() {
			self.showMoreFlag(!self.showMoreFlag());
		}
		
		self.selectedFareBasisCode = ko.computed(function() {
			
			var section = mixCabin ? self.selectedSection : parent.selectedSection;
			
			if (section && section() && section().selectedOption && section().selectedOption() && section().selectedOption().subCategoryCode) {
				return section().selectedOption().subCategoryCode;
			}
			
			return '';

		});		

		self.changeSelectedSection = function (section, event) {

			if (typeof event != 'undefined' && !$(event.target).is("a")) {
				$(event.target).parent().click();
			} else{
				var sameSectionClicked = self.selectedSection().name == section.name;
				
				if (sameSectionClicked) {
					self.selectedSection().isActive(!self.selectedSection().isActive());
				}else{
					self.selectedSection().isActive(false);
					
					//CHANGE 
					self.selectedSection(section);
					self.updateHotelEligibility(section);
					self.selectedSection().isActive(true);
				}	
			}
		};
		
		self.sections = ko.observableArray(generateCFFSections(flightDay.fareCategories));
		
    	self.selectedSection(findInitialCFFSection(self.sections(), self.fareFamilyTabDefaultOpen(), initialCFFCode, initialFFCode));

		self.scrollToChangeSelectedFareCategory = function () {
			$('html, body').animate({
				scrollTop: 0,
				scrollLeft: 0
			}, 1000);
		};
		
		//-------------------------------------------------------------//

		self.availableClasses = ko.observableArray();
		self.originLocationCode = ko.observable();
		self.destinationLocationCode = ko.observable();
		self.origin = ko.observable();		
		self.destination = ko.observable();		
		self.originationDateTime = ko.observable();
		self.selectedFlight = ko.observable('');		
		self.availabilityOneWayWeeklyResponsePanelVisible;
		self.oneWayBooking = ko.observable(true);
		self.roundTripBooking =	ko.computed(function() { return !self.oneWayBooking() });		
		
		
		
		//-------------------------------------------------------------//

		var externalExecutedFlag = false;
		self.selectedFlightExists = ko.computed(function() {
			if(externalExecutedFlag) return false;
			return self.selectedFlight && self.selectedFlight() != '';
		});

		self.updateSelectedFlight = function(flight, brandCode) {
			externalExecutedFlag = false;
			
			flight.showFareRules ? flight.showFareRules(false) :(flight.showFareRules = ko.observable(false));
			flight.fareRulesData ? flight.fareRulesData('') : (flight.fareRulesData = ko.observable(''));
			
			if(!flight.showItineraryDetails) {
				flight.showItineraryDetails = ko.observable(false);
			} else {
				flight.showItineraryDetails(false);
			}
			
			try {
				if(flight) {
	              	var selectedFareList = flight.selectedCat && flight.selectedCat.fareClasses;
					var priceForSelectedFareBasisCode = underscore.find(flight.bookingPriceTagHolder.priceTags, function(fare) {
						return (fare.code == brandCode && !selectedFareList) || (fare.code == brandCode && selectedFareList && JSON.stringify(selectedFareList) == JSON.stringify(fare.flightClasses));
					});
					if(isInternationalView) {
						if (priceForSelectedFareBasisCode) {
							priceForSelectedFareBasisCode.showingFallBackPrice = false;
							flight.priceForSelectedFareBasisCode(priceForSelectedFareBasisCode);
						} else {
							//NO PRICE FOUND USE FALLBACK PRICES
							var fareFamilyFallBackList = self.fareFamilyFallBackListMap[self.selectedFareBasisCode()];
							
							if (fareFamilyFallBackList && fareFamilyFallBackList.length) {
								var fareFamilyCodeToFallback = underscore.find(fareFamilyFallBackList, function(fareFamilyCode) {  return underscore.any(value.bookingPriceTagHolder.priceTags, function(priceTag) { return priceTag.code == fareFamilyCode }) });
								priceForSelectedFareBasisCode = underscore.find(value.bookingPriceTagHolder.priceTags, function(priceTag) { return priceTag.code == fareFamilyCodeToFallback });
							}				
			
							if (priceForSelectedFareBasisCode) {
								priceForSelectedFareBasisCode.showingFallBackPrice = true;
								priceForSelectedFareBasisCode.selectedFareBasisCode = self.selectedFareBasisCode();
								flight.priceForSelectedFareBasisCode(priceForSelectedFareBasisCode);
							}
						}
					}
				}
			} catch (e) {
				console.log(e);
			}
			
			
			if (flight) {
				if(!($("#toast").hasClass("opened"))) {
					showToast('success', 'Label-Genel-101');
				}
			} else {
				checkForFixedPriceBar();
			}

			try {
				flight && self.updateSelectedFlightCallback && self.updateSelectedFlightCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}
			
			self.selectedFlight(flight);
			
			showAllWarnings(index);
			self.showMoreFlag(false);
			self.showMore = function() {
				self.showMoreFlag(!self.showMoreFlag());
			}

			try {
				flight && self.showFareRulesManuallyCallback && self.showFareRulesManuallyCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}
		};
		
		self.executeExternalCallback = function(flight, callBackFunction, functionArguments) {
			externalExecutedFlag = true;
			if (flight) {
				flight.availableFlightFare.preferedFareBasisCode = flight.priceForSelectedFareBasisCode().code;
			}

			self.selectedFlight(flight);
			callBackFunction.apply(self, functionArguments);
		}
		
		self.filterData.optionFiltersAvailable(flightDay.minimumFlightCountForOptionsFilteringReached);
		self.filterData.timeRangeFiltersAvailable(flightDay.minimumFlightCountForTimeRangeFilteringReached);
		self.sortData.sortersAvailable(flightDay.minimumFlightCountForSortingReached);

		self.originLocationCode(flightDay.originLocationCode);
		
		self.destinationLocationCode(flightDay.destinationLocationCode);
		 
		self.origin(flightDay.originLocationCode);
		
		self.destination(flightDay.destinationLocationCode);
		 
		self.originationDateTime(flightDay.dateOfDay);		
		
		self.filterData.timeRangeStartValue.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		});
		
		self.filterData.timeRangeEndValue.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		});
		
		self.filterData.selectedStopFilters.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		}, null, "arrayChange");
		
		self.emptyEcoCabin = ko.observable(true);
		self.emptyBusCabin = ko.observable(true);
		var busCount = 0, ecoCount = 0;
		underscore.each(flightsToList, function(value) {
			value.visible = ko.observable(true);
			value.showDetails = ko.observable(false);
			value.activeItemTab = ko.observable('');
			value.bookingPriceTagHolder.priceTags = underscore.sortBy(value.bookingPriceTagHolder.priceTags , function(priceTag) {
				priceTag.cabinClass == 'ECONOMY' && ecoCount++;
				priceTag.cabinClass == 'BUSINESS' && busCount++;
				return priceTag.convertedPrices["ORIGINAL_PRICE"].amount;
			});
			if(value.bookingPriceTagHolder.priceTags.length && value.bookingPriceTagHolder.priceTags[0].convertedPrices['ORIGINAL_PRICE'] && value.bookingPriceTagHolder.priceTags[0].convertedPrices['ORIGINAL_PRICE'].currency == 'PTS') {
              	isInternationalView = false;
				value.priceForSelectedFareBasisCode = ko.computed(function() {

					var priceForSelectedFareBasisCode = underscore.find(value.bookingPriceTagHolder.priceTags, function(priceTag) { return priceTag.code == self.selectedFareBasisCode() });
					
					if (priceForSelectedFareBasisCode) {
						priceForSelectedFareBasisCode.showingFallBackPrice = false;
						return priceForSelectedFareBasisCode;
					}
					
					//NO PRICE FOUND USE FALLBACK PRICES
					var fareFamilyFallBackList = self.fareFamilyFallBackListMap[self.selectedFareBasisCode()];
					
					if (fareFamilyFallBackList && fareFamilyFallBackList.length) {
						var fareFamilyCodeToFallback = underscore.find(fareFamilyFallBackList, function(fareFamilyCode) {  return underscore.any(value.bookingPriceTagHolder.priceTags, function(priceTag) { return priceTag.code == fareFamilyCode }) });
						priceForSelectedFareBasisCode = underscore.find(value.bookingPriceTagHolder.priceTags, function(priceTag) { return priceTag.code == fareFamilyCodeToFallback });
					}				

					if (priceForSelectedFareBasisCode) {
						priceForSelectedFareBasisCode.showingFallBackPrice = true;
						priceForSelectedFareBasisCode.selectedFareBasisCode = self.selectedFareBasisCode();
						return priceForSelectedFareBasisCode;
					}
					
					return '';
					
				});
			} else {
              	isInternationalView = true;
				value.priceForSelectedFareBasisCode = ko.observable();
			}
			
			value.hasPriceForSelectedFareBasisCode = ko.computed(function() {
				return value.priceForSelectedFareBasisCode() && value.priceForSelectedFareBasisCode() != '';
			});
			
			value.remainingSeatsInfoForSelectedFareBasisCode = ko.computed(function() {
				
				var remainingSeatsInfoForSelectedFareBasisCode = 0;
              	
				try {
					var selElem = isInternationalView ? value.bookingPriceTagHolder.priceTags[0] : value.priceForSelectedFareBasisCode();
					for (var property in value.firstSegment.remainingSeats) {
						if (value.firstSegment.remainingSeats.hasOwnProperty(property)) {
							if(selElem && property == selElem.code) {
								remainingSeatsInfoForSelectedFareBasisCode = value.firstSegment.remainingSeats[property];	
							}
						}
					}
				} catch (e) {
					console.log(e);
				}
              
				return remainingSeatsInfoForSelectedFareBasisCode;
				
			});
			
			value.hasISODT = underscore.all(value.segments, function(segment) {
				return segment.arrivalDateTimeISO && segment.departureDateTimeISO;
			});
			
			value.routeIndex = index;
		});
		
		ecoCount && self.emptyEcoCabin(false);
		busCount && self.emptyBusCabin(false);
		
		self.toggleFlightSingle = function(flight) {
			underscore.each(flightsToList, function(value) {
				if(flight == value) {
					value.showDetails(!value.showDetails());
				} else {
					value.showDetails(false);
				}
			});
		};

		self.toggleFlightMultiple = function(flight) {
			underscore.each(flightsToList, function(value) {
				if(flight == value) {
					value.showDetails(!value.showDetails());
				}
			});
		};
				
		self.processedFlightList = ko.observableArray(flightsToList);

		self.processedFlightListVisibleFlightsLength = ko.computed(function() {
			return underscore.reduce(self.processedFlightList(), function(length, flight) { return length + ( (flight.visible && flight.visible()) ? 1 : 0 ) }, 0);
		});

		var sortOptiontext = '';
		if( 0 < self.sortData.sortOptions().length) {
			underscore.each(self.sortData.sortOptions(), function( value ) {
				if(self.sortData.selectedSortKey() == value.value) {
					sortOptiontext = value.text;
				}
			});
		}
		self.selectedSortOptionText= ko.observable(sortOptiontext);
		
		self.showSortDirection= ko.observable(false);
		self.sortOptionClicked = function(clickedOption, event) {
			var dir = $(event.target).data('direction');
			dir && (dir = parseInt(dir))
			if(dir) {
				self.sortData.selectedSortKey(clickedOption.value);
				self.sortData.selectedSortDirection(dir);
			}else{
				if (self.sortData.selectedSortKey() === clickedOption.value) {
					self.sortData.selectedSortDirection(-self.sortData.selectedSortDirection());
				} else {
					self.sortData.selectedSortKey(clickedOption.value);
					self.sortData.selectedSortDirection(1);
				}
			}
		    (/price|duration/.test(clickedOption.value) ? self.showSortDirection(true):self.showSortDirection(false));
			self.selectedSortOptionText(clickedOption.text)
			self.processFlightList();
			self.changeSortingCallback && self.changeSortingCallback();
			return true;
		};
		
		self.filterOptionClicked = function() {
			self.processFlightList();
			return true;
		};

		self.updateInitialSelectedFlight = function() {
			
			if (self.initialSelectedFlightNumber && self.selectedSection() && self.selectedSection().value && self.selectedSection().selectedOption()) {

				var initialFlight = underscore.find(self.processedFlightList(), function(flight) {

					var flightNumbersAppended = underscore.pluck(flight.segments, 'flightNumber').join(',');
					
					return flightNumbersAppended == this 

				}, self.initialSelectedFlightNumber);

				if (initialFlight && initialFlight.visible() && initialFlight.hasPriceForSelectedFareBasisCode()) {
					if(deeplink && domestic) {
						if(initialFFCode) {
							self.updateSelectedFlight(initialFlight);
						}else{
							if($('#noFlightForDeeplinkClass')) {									
								$('#noFlightForDeeplinkClass').modal("show");
							}
						}
					}else{
						self.updateSelectedFlight(initialFlight);
					}
				}
			}
		};

		self.updateHotelEligibility = function(selectedSection) {
			var i;
			if(self.hotelEligible && selectedSection && selectedSection.value().indexOf('GLOBAL')== -1 && selectedSection.hotelEligibilityLayoverHour) {
				var hotelEligibilityForSelectedSegment = underscore.all(self.processedFlightList(), function(flight) {
					for(i=0; i < flight.segments.length -1; i++) {
						if(flight.segments[i].hotelIstanbul && flight.segments[i+1].hotelIstanbul) {
							var hourDiff = (flight.segments[i+1].departureDateTime - flight.segments[i].arrivalDateTime) / (1000 * 3600);
							return hourDiff >= selectedSection.hotelEligibilityLayoverHour;
						}
					}
					return false;
				});
				self.hotelEligibilityForSelectedSegment(hotelEligibilityForSelectedSegment); 
			}
		};

		self.processFlightList = function() {
			
			var filterUtil = flightFilterUtil(self.filterData, self.timeframe);
			
			var sortUtil = flightSortUtil(self.sortData);

			var visibilityUtil = flightVisibilityUtil(filterUtil);
			
			if(self.filterData.optionFiltersAvailable() || self.filterData.timeRangeFiltersAvailable()) {
				underscore.each(self.processedFlightList(), visibilityUtil.computeVisibility);
			}
			
			self.processedFlightList.valueHasMutated()
			
			switch (self.sortData.selectedSortKey()) {

			case 'segmentcount':
				var sortList;
				self.processedFlightList.sort(function(a, b) {
					if(self.sortData.selectedSortDirection() < 0)
						sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(b,a);
					else
						sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(a,b);
					return sortList;
				});
				break;

			case 'departuretime':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByDeparture(a,b) || sortUtil.compareByArrival(a,b);
				});
				break;

			case 'arrivaltime':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByArrival(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;

			case 'duration':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByDuration(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;
				

			case 'price':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByPrice(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;	

			}
			
			underscore.each(self.processedFlightList(), function(value, index) {
				value.index = index;
			});
		};
		
		self.processFlightList();

		self.updateInitialSelectedFlight();

		self.updateHotelEligibility(self.selectedSection());
		
		
		self.getHotelInstanbulEligibilityForSelectedFlight = function(flight) {
			var i;
			if(self.hotelEligible && self.selectedSection && self.selectedSection().value().indexOf('GLOBAL')== -1 && self.selectedSection().hotelEligibilityLayoverHour && flight) {
				for(i=0; i < flight.segments.length -1; i++) {
					if(flight.segments[i].hotelIstanbul && flight.segments[i+1].hotelIstanbul) {
						var hourDiff = (flight.segments[i+1].departureDateTime - flight.segments[i].arrivalDateTime) / (1000 * 3600);
						return hourDiff >= self.selectedSection().hotelEligibilityLayoverHour;
					}
				}
			}
			return false;
		}
		
		self.full = self.hasFlight() && underscore.all(self.processedFlightList(), function(flight) {return flight.full;});

		//////////////////////////////////////////////////
		//ODUL BILETTEN AKTARILDI
		//////////////////////////////////////////////////
		
		self.insufficentMilesForSelectedFlight = ko.observable(false);
		self.milesForSelectedFlight = ko.observable();
		self.insufficentFlag = ko.observable(false);
		self.weeklyPricesFunctionalityAvailable = ko.observable(false);

		
		
		self.updateSelectedFlightAWT = function(flight, availableMile, cardType, isCredit,changeFlight, isOneWayFlight, selectedFlightAmount, isDomestic) {
			
			var flightStop = false, insufficentMilesForSelectedFlight, i;
			if(flight && !isDomestic && isOneWayFlight) {
				etrAjax.post({
					app: 'app.ibs',
					service:'/awardticketbooking/findtechnicalstop',
					data : flight,
					async : false,
					callback:function(response) {
						if(response.data) {
							flightStop = true;
							etrAjax.showInfoModal('',["Error-ODULB-08"]);
							return;
						}
					}
				});
			}
			
			if(flight) {
				if(flight.stopOver) {
					etrAjax.showErrorModal("Error-ODULB-08");
					return;
				}
				
				if(flight.segments.length > 4) {
					etrAjax.showErrorModal("Error-ODULB-07");
					return;
				}
				
				
			
				//819-Uçuşlarınızın arasındaki süre 24 saati aşmamalıdır.				
				if(isOneWayFlight) {
					var totalStopValue = 0;
					for(i=0; i < flight.segments.length; i++) {
						var segmentStopValue = 0;
						
						if(flight.segments[i+1] != null) {
							var arrivalDate = moment.utc(flight.segments[i].arrivalDateTime + flight.segments[i].arrivalDateTimeTimeZoneRawOffset).format("DD/MM/YYYY");
							var departureDate = moment.utc(flight.segments[i+1].departureDateTime + flight.segments[i+1].departureDateTimeTimeZoneRawOffset).format("DD/MM/YYYY");
							
							segmentStopValue = moment(departureDate, "DD/MM/YYYY").diff(moment(arrivalDate, "DD/MM/YYYY"), 'days') * 24 * 60;
							totalStopValue += segmentStopValue;
							
							var arrivalDateHour = moment.utc(flight.segments[i].arrivalDateTime + flight.segments[i].arrivalDateTimeTimeZoneRawOffset).format("HH:mm");
							var departureDateHour = moment.utc(flight.segments[i+1].departureDateTime + flight.segments[i+1].departureDateTimeTimeZoneRawOffset).format("HH:mm");
							
							segmentStopValue = moment(departureDateHour, "HH:mm").diff(moment(arrivalDateHour, "HH:mm"), 'minutes');
							totalStopValue += segmentStopValue;
						}
					}
					
					if( parseInt(totalStopValue / 60) > 24) {
						etrAjax.showErrorModal("Error-ODULB-09");
						return;
					}
				}
				
				self.milesForSelectedFlight(flight.priceForSelectedFareBasisCode().convertedPrices['ORIGINAL_PRICE'].amount);
			}
			
			//818-Tek yön ödül biletlerde duraklama yapılamaz.
			if(!flightStop) {
				if(!changeFlight) {
					if(!isCredit) {
						if(availableMile != undefined || cardType != undefined) {
							availableMile = ko.unwrap(availableMile);
							var selectedAmount = flight.priceForSelectedFareBasisCode().convertedPrices['ORIGINAL_PRICE'].amount;
							if(selectedFlightAmount == 0 && isOneWayFlight) {
								insufficentMilesForSelectedFlight = availableMile < selectedAmount;
							}else if(selectedFlightAmount == 0 && !isOneWayFlight) {
								insufficentMilesForSelectedFlight = false;
							}else{
								selectedAmount = selectedAmount + selectedFlightAmount;
								insufficentMilesForSelectedFlight = availableMile < selectedAmount;
							}
							
						}else{
							insufficentMilesForSelectedFlight = false;
						}
						
						if(insufficentMilesForSelectedFlight) {
							self.insufficentMilesForSelectedFlight(insufficentMilesForSelectedFlight);
							self.insufficentFlag(false);
						}else{
							self.selectedFlight('');
							flight.showFareRules = ko.observable(false);
							flight.fareRulesData = ko.observable('');
							flight.showItineraryDetails = ko.observable(false);
						}
						
						self.selectedFlight(flight);
						
					}else{
						self.selectedFlight('');
						flight.showFareRules = ko.observable(false);
						flight.fareRulesData = ko.observable('');
						flight.showItineraryDetails = ko.observable(false);
						self.selectedFlight(flight);
					}
				}else{
					self.selectedFlight('');
					self.milesForSelectedFlight(null);
					flight.showFareRules = ko.observable(false);
					flight.fareRulesData = ko.observable('');
					flight.showItineraryDetails = ko.observable(false);
					self.selectedFlight(flight);
				}
			}
			
			try {
				flight && self.updateSelectedFlightCallback && self.updateSelectedFlightCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}

			try {
				flight && self.showFareRulesManuallyCallback && self.showFareRulesManuallyCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}
		};

	}
	
	function FlightListPanelPremiumSingleCity(flightDay, sortData, filterData, index, loadCount, flightsRendered, resetNextFlight) {

		var self = this;
		
		self.sortData = sortData;
		self.filterData = filterData;
		self.hotelEligible = flightDay.hotelEligible;
		self.hotelEligibilityForSelectedSegment = ko.observable(false);
		self.availabilityWarnings = flightDay.availabilityWarnings ? flightDay.availabilityWarnings : ko.observable(false);
		self.initialSelectedFlightNumber = flightDay.initialSelectedFlightNumber;
		self.flightsRendered = flightsRendered;
		var flightsToList = flightDay.flights;
		var initialFFCode = flightDay.initialFFCode;
		var initialCFFCode = flightDay.initialCFFCode;
		
		self.index = ko.observable(index);
		self.hasNoFlight = ko.observable(flightDay.hasNoFlight);
		self.hasFlight = ko.observable(!flightDay.hasNoFlight);
		
		showAllWarnings(index);
		
		self.showMoreFlag = ko.observable(false);
		self.showMore = function() {
			self.showMoreFlag(!self.showMoreFlag());
		}
		
		self.getDefaultSelectedFlight = function(previouslySelectedFlight) {
            var selectedFlight = underscore.filter(flightsToList,function(elem) {
              	var elActive = underscore.map(elem.segments, function(segment) { return segment.flightNumber });
              	var elPrev = underscore.map(previouslySelectedFlight.segments, function(segment) { return segment.flightNumber });
                var res = elActive.join("") == elPrev.join("");
                if(!elem.priceForSelectedFareBasisCode())
                	elem.priceForSelectedFareBasisCode(elem.bookingPriceTagHolder.priceTags[0]);
                
                var resp = res && previouslySelectedFlight.priceForSelectedFareBasisCode().code == elem.priceForSelectedFareBasisCode().code
                return resp;
            })[0];
            return selectedFlight;
        }

		self.selectedPaymentCurrency = ko.observable(flightDay.originalCurrency.code);
		self.primaryPaxCode = flightDay.primaryPaxCode;
		self.fareFamilyTabDefaultOpen = ko.observable(flightDay.fareFamilyTabDefaultOpen);
		self.oneWayWeeklyViewPanelDefaultOpen = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.oneWayWeeklyViewOpen : false);
		self.roundTripWeeklyViewPanelDefaultOpen = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.roundTripWeeklyViewOpen : false);
		self.oneWayWeeklyViewPanelDefaultOpenMobile = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.oneWayWeeklyViewOpenMobile : false);
		
		self.daysToTimeRangeEnd = flightDay.daysToTimeRangeEnd;
		self.daysToTimeRangeBeginning = flightDay.daysToTimeRangeBeginning;
		self.navigateToPreviousDayEnabled = !flightDay.onTimeRangeBeginning;
		self.navigateToNextDayEnabled = !flightDay.onTimeRangeEnd;		
	   		
		self.timeframe = ko.observable(flightDay.timeframe) ;
		self.cheapestFareFamilyData = ko.observable(flightDay.cheapestFareFamilyData);
		self.fareFamilyFallBackListMap = flightDay.fareFamilyFallBackListMap;
		self.selectedSection = ko.observable(emptyCFFSection());
		self.selectedFareBasisCode = ko.computed(function() {
			var section = self.selectedSection;
			if (section && section() && section().selectedOption && section().selectedOption() && section().selectedOption().subCategoryCode) {
				return section().selectedOption().subCategoryCode;
			}
			return '';
		});

		self.changeSelectedSection = function (section, event) {
			if (typeof event != 'undefined' && !$(event.target).is("a")) {
				$(event.target).parent().click();
			} else {
				var sameSectionClicked = self.selectedSection().name == section.name;
				if (sameSectionClicked) {
					self.selectedSection().isActive(!self.selectedSection().isActive());
				} else {
					self.selectedSection().isActive(false);
					//CHANGE 
					self.selectedSection(section);
					self.updateHotelEligibility(section);
					self.selectedSection().isActive(true);
				}	
			}
		};
		
		self.sections = ko.observableArray(generateCFFSections(flightDay.fareCategories));
		
    	self.selectedSection(findInitialCFFSection(self.sections(), self.fareFamilyTabDefaultOpen(), initialCFFCode, initialFFCode));

		self.scrollToChangeSelectedFareCategory = function () {
			$('html, body').animate({
				scrollTop: 0,
				scrollLeft: 0
			}, 1000);
		};
		
		self.availableClasses = ko.observableArray();
		self.originLocationCode = ko.observable();
		self.destinationLocationCode = ko.observable();
		self.origin = ko.observable();		
		self.destination = ko.observable();		
		self.originationDateTime = ko.observable();
		self.selectedFlight = ko.observable('');		
		self.availabilityOneWayWeeklyResponsePanelVisible;

		var externalExecutedFlag = false;
		self.selectedFlightExists = ko.computed(function() {
			if(externalExecutedFlag) return false;
			return self.selectedFlight && self.selectedFlight() != '';
		});
		
		self.updateSelectedFlight = function(flight, brandCode) {
			externalExecutedFlag = false;
			
			flight.showFareRules ? flight.showFareRules(false) :(flight.showFareRules = ko.observable(false));
			flight.fareRulesData ? flight.fareRulesData('') : (flight.fareRulesData = ko.observable(''));
			
			if(!flight.showItineraryDetails) {
				flight.showItineraryDetails = ko.observable(false);
			} else {
				flight.showItineraryDetails(false);
			}
			
			try {
				var priceForSelectedFareBasisCode = underscore.find(flight.bookingPriceTagHolder.priceTags, function(fare) {
					return fare.code == brandCode
				});
				if (priceForSelectedFareBasisCode) {
					priceForSelectedFareBasisCode.showingFallBackPrice = false;
					flight.priceForSelectedFareBasisCode(priceForSelectedFareBasisCode);
				} else {				
					//NO PRICE FOUND USE FALLBACK PRICES
					var fareFamilyFallBackList = self.fareFamilyFallBackListMap[self.selectedFareBasisCode()];
					
					if (fareFamilyFallBackList && fareFamilyFallBackList.length) {
						var fareFamilyCodeToFallback = underscore.find(fareFamilyFallBackList, function(fareFamilyCode) {  return underscore.any(value.bookingPriceTagHolder.priceTags, function(priceTag) { return priceTag.code == fareFamilyCode }) });
						priceForSelectedFareBasisCode = underscore.find(value.bookingPriceTagHolder.priceTags, function(priceTag) { return priceTag.code == fareFamilyCodeToFallback });
					}				
	
					if (priceForSelectedFareBasisCode) {
						priceForSelectedFareBasisCode.showingFallBackPrice = true;
						priceForSelectedFareBasisCode.selectedFareBasisCode = self.selectedFareBasisCode();
						flight.priceForSelectedFareBasisCode(priceForSelectedFareBasisCode);
					}
				}
			} catch (e) {
				console.log(e);
			}
			
			
			if (flight) {
				flight.availableFlightFare.preferedFareBasisCode = flight.priceForSelectedFareBasisCode() ? flight.priceForSelectedFareBasisCode().code : flight.bookingPriceTagHolder.priceTags[0].code;
				if(!($("#toast").hasClass("opened"))) {
					showToast('success', 'Label-Genel-101');
				}
			} else {
				checkForFixedPriceBar();
			}

			try {
				flight && self.updateSelectedFlightCallback && self.updateSelectedFlightCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}
			
			self.selectedFlight(flight);
			
			showAllWarnings(index);
			self.showMoreFlag(false);
			self.showMore = function() {
				self.showMoreFlag(!self.showMoreFlag());
			}
			
			if(!flight) {
				resetNextFlight && resetNextFlight();
				$('.panel-loading').removeClass('panel-loading');
			}
			
			try {
				flight && self.showFareRulesManuallyCallback && self.showFareRulesManuallyCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}
		};
		
		self.executeExternalCallback = function(flight, callBackFunction, functionArguments) {
			externalExecutedFlag = true;
			if (flight) {
				flight.availableFlightFare.preferedFareBasisCode = flight.priceForSelectedFareBasisCode() ? flight.priceForSelectedFareBasisCode().code : flight.bookingPriceTagHolder.priceTags[0].code;
			}
			self.selectedFlight(flight);
			callBackFunction.apply(self, functionArguments);
		}
		
		self.filterData.optionFiltersAvailable(flightDay.minimumFlightCountForOptionsFilteringReached);
		self.filterData.timeRangeFiltersAvailable(flightDay.minimumFlightCountForTimeRangeFilteringReached);
		self.sortData.sortersAvailable(flightDay.minimumFlightCountForSortingReached);

		self.originLocationCode(flightDay.originLocationCode);
		
		self.destinationLocationCode(flightDay.destinationLocationCode);
		 
		self.origin(flightDay.originLocationCode);
		
		self.destination(flightDay.destinationLocationCode);
		 
		self.originationDateTime(flightDay.dateOfDay);		
		
		self.filterData.timeRangeStartValue.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		});
		
		self.filterData.timeRangeEndValue.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		});
		
		self.filterData.selectedStopFilters.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		}, null, "arrayChange");

		self.emptyEcoCabin = ko.observable(true);
		self.emptyBusCabin = ko.observable(true);
		var busCount = 0, ecoCount = 0;
		
		underscore.each(flightsToList, function(value) {
			value.visible = ko.observable(true);
			value.showDetails = ko.observable(false);
			value.activeItemTab = ko.observable('');
			value.bookingPriceTagHolder.priceTags = underscore.sortBy(value.bookingPriceTagHolder.priceTags , function(priceTag) {
				priceTag.cabinClass == 'ECONOMY' && ecoCount++;
				priceTag.cabinClass == 'BUSINESS' && busCount++;
				return priceTag.convertedPrices["ORIGINAL_PRICE"].amount;
			});
			var isInternationalView; // for international view
			if(value.bookingPriceTagHolder.priceTags.length && value.bookingPriceTagHolder.priceTags[0].convertedPrices['ORIGINAL_PRICE'] && value.bookingPriceTagHolder.priceTags[0].convertedPrices['ORIGINAL_PRICE'].currency == 'PTS') {
				isInternationalView = false;
				value.priceForSelectedFareBasisCode = ko.computed(function() {

					var priceForSelectedFareBasisCode = underscore.find(value.bookingPriceTagHolder.priceTags, function(priceTag) { return priceTag.code == self.selectedFareBasisCode() });
					
					if (priceForSelectedFareBasisCode) {
						priceForSelectedFareBasisCode.showingFallBackPrice = false;
						return priceForSelectedFareBasisCode;
					}
					
					//NO PRICE FOUND USE FALLBACK PRICES
					var fareFamilyFallBackList = self.fareFamilyFallBackListMap[self.selectedFareBasisCode()];
					
					if (fareFamilyFallBackList && fareFamilyFallBackList.length) {
						var fareFamilyCodeToFallback = underscore.find(fareFamilyFallBackList, function(fareFamilyCode) {  return underscore.any(value.bookingPriceTagHolder.priceTags, function(priceTag) { return priceTag.code == fareFamilyCode }) });
						priceForSelectedFareBasisCode = underscore.find(value.bookingPriceTagHolder.priceTags, function(priceTag) { return priceTag.code == fareFamilyCodeToFallback });
					}				

					if (priceForSelectedFareBasisCode) {
						priceForSelectedFareBasisCode.showingFallBackPrice = true;
						priceForSelectedFareBasisCode.selectedFareBasisCode = self.selectedFareBasisCode();
						return priceForSelectedFareBasisCode;
					}
					
					return '';
					
				});
			} else {
				isInternationalView = true;
				value.priceForSelectedFareBasisCode = ko.observable();
			}
			
			value.hasPriceForSelectedFareBasisCode = ko.computed(function() {
				return value.priceForSelectedFareBasisCode() && value.priceForSelectedFareBasisCode() != '';
			});
			
			value.remainingSeatsInfoForSelectedFareBasisCode = ko.computed(function() {
				
				var remainingSeatsInfoForSelectedFareBasisCode = 0;
				
				try {
					var selElem = isInternationalView ? value.bookingPriceTagHolder.priceTags[0] : value.priceForSelectedFareBasisCode();
					for (var property in value.firstSegment.remainingSeats) {
						if (value.firstSegment.remainingSeats.hasOwnProperty(property)) {
							if(selElem && property == selElem.code) {
								remainingSeatsInfoForSelectedFareBasisCode = value.firstSegment.remainingSeats[property];	
							}
						}
					}
				} catch (e) {
					console.log(e);
				}
				
				return remainingSeatsInfoForSelectedFareBasisCode;
				
			});
			
			value.hasISODT = underscore.all(value.segments, function(segment) {
				return segment.arrivalDateTimeISO && segment.departureDateTimeISO;
			});
			
			value.routeIndex = index;
		});
		
		ecoCount && self.emptyEcoCabin(false);
		busCount && self.emptyBusCabin(false);
		
		self.toggleFlightSingle = function(flight) {
			underscore.each(flightsToList, function(value) {
				if(flight == value) {
					value.showDetails(!value.showDetails());
				} else {
					value.showDetails(false);
				}
			});
		};

		self.toggleFlightMultiple = function(flight) {
			underscore.each(flightsToList, function(value) {
				if(flight == value) {
					value.showDetails(!value.showDetails());
				}
			});
		};
		
		self.processedFlightList = ko.observableArray(flightsToList);
		
		self.showMoreFlights = ko.observable(false);
		self.loadMoreFlights = function() {
			self.showMoreFlights(true);
			self.showMoreBtn(false);
		}
		
		self.scrolltoFlights = function() {
			setTimeout(function () {
				scrollToEl($('.premium-panel.panel-loading').last());
				$('.panel-loading').removeClass('panel-loading');
			}, 15);
		}
		
		self.firstGroup = ko.observableArray();
		self.secondGroup = ko.observableArray();
		self.showMoreBtn = ko.observable(0);
		
		var groupListForPanel = function() {
			var el1 = [], el2 = [], iCount = 0;
			self.firstGroup([]);
			self.secondGroup([]);
			underscore.each(self.processedFlightList(), function(elem) {
				if(elem.visible()) {
					if(iCount < loadCount) {
						self.firstGroup.push(elem);
					} else {
						self.secondGroup.push(elem);
					}
					iCount++;
				}
			});
			
			self.showMoreBtn(!self.showMoreFlights() && self.secondGroup().length);
		}
		
		self.getActivePanelFlights = function() {
			return self.showMoreBtn() ? self.processedFlightList() : self.firstGroup();
		}
		
		var callFlightsRendered = function() {
			self.flightsRendered && self.flightsRendered(self.getActivePanelFlights());
		}
		
		self.processedFlightListVisibleFlightsLength = ko.computed(function() {
			return underscore.reduce(self.processedFlightList(), function(length, flight) { return length + ( (flight.visible && flight.visible()) ? 1 : 0 ) }, 0);
		});

		var sortOptiontext = '';
		if( 0 < self.sortData.sortOptions().length) {
			underscore.each(self.sortData.sortOptions(), function( value ) {
				if(self.sortData.selectedSortKey() == value.value) {
					sortOptiontext = value.text;
				}
			});
		}
		self.selectedSortOptionText= ko.observable(sortOptiontext);
		
		self.showSortDirection = ko.observable(false);
		self.sortOptionClicked = function(clickedOption, event) {
			var dir = $(event.target).data('direction');
			dir && (dir = parseInt(dir))
			if(dir) {
				self.sortData.selectedSortKey(clickedOption.value);
				self.sortData.selectedSortDirection(dir);
			} else {
				if (self.sortData.selectedSortKey() === clickedOption.value) {
					self.sortData.selectedSortDirection(-self.sortData.selectedSortDirection());
				} else {
					self.sortData.selectedSortKey(clickedOption.value);
					self.sortData.selectedSortDirection(1);
				}
			}
		    /price|duration/.test(clickedOption.value) ? self.showSortDirection(true) : self.showSortDirection(false);
			self.selectedSortOptionText(clickedOption.text)
			self.processFlightList();
			callFlightsRendered();
			
			return true;
		};
		
		self.filterOptionClicked = function() {
			self.processFlightList();
			return true;
		};

		self.updateInitialSelectedFlight = function() {
			if (self.initialSelectedFlightNumber && self.selectedSection() && self.selectedSection().value && self.selectedSection().selectedOption()) {
				var initialFlight = underscore.find(self.processedFlightList(), function(flight) {
					var flightNumbersAppended = underscore.pluck(flight.segments, 'flightNumber').join(',');
					return flightNumbersAppended == this;
				}, self.initialSelectedFlightNumber);

				if (initialFlight && initialFlight.visible() && initialFlight.hasPriceForSelectedFareBasisCode()) {
					self.updateSelectedFlight(initialFlight);
				}
			}
		};

		self.updateHotelEligibility = function(selectedSection) {
			var i;
			if(self.hotelEligible && selectedSection && selectedSection.value().indexOf('GLOBAL')== -1 && selectedSection.hotelEligibilityLayoverHour) {
				var hotelEligibilityForSelectedSegment = underscore.all(self.processedFlightList(), function(flight) {
					for(i=0; i < flight.segments.length -1; i++) {
						if(flight.segments[i].hotelIstanbul && flight.segments[i+1].hotelIstanbul) {
							var hourDiff = (flight.segments[i+1].departureDateTime - flight.segments[i].arrivalDateTime) / (1000 * 3600);
							return hourDiff >= selectedSection.hotelEligibilityLayoverHour;
						}
					}
					return false;
				});
				self.hotelEligibilityForSelectedSegment(hotelEligibilityForSelectedSegment); 
			}
		};

		self.processFlightList = function() {
			var filterUtil = flightFilterUtil(self.filterData, self.timeframe);
			var sortUtil = flightSortUtil(self.sortData);
			var visibilityUtil = flightVisibilityUtil(filterUtil);
			
			if(self.filterData.optionFiltersAvailable() || self.filterData.timeRangeFiltersAvailable()) {
				underscore.each(self.processedFlightList(), visibilityUtil.computeVisibility);
			}
			
			self.processedFlightList.valueHasMutated()
			
			switch (self.sortData.selectedSortKey()) {
				case 'segmentcount':
					var sortList;
					self.processedFlightList.sort(function(a, b) {
						if(self.sortData.selectedSortDirection() < 0)
							sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(b,a);
						else
							sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(a,b);
						return sortList;
					});
					break;
				case 'departuretime':
					self.processedFlightList.sort(function(a, b) {
						return sortUtil.compareByDeparture(a,b) || sortUtil.compareByArrival(a,b);
					});
					break;
				case 'arrivaltime':
					self.processedFlightList.sort(function(a, b) {
						return sortUtil.compareByArrival(a,b) || sortUtil.compareByDeparture(a,b);
					});
					break;
				case 'duration':
					self.processedFlightList.sort(function(a, b) {
						return sortUtil.compareByDuration(a,b) || sortUtil.compareByDeparture(a,b);
					});
					break;
				case 'price':
					self.processedFlightList.sort(function(a, b) {
						return sortUtil.compareByPrice(a,b) || sortUtil.compareByDeparture(a,b);
					});
					break;
			}
			
			underscore.each(self.processedFlightList(), function(value, index) {
				value.index = index;
			});
			groupListForPanel();
		};
		
		self.getHotelInstanbulEligibilityForSelectedFlight = function(flight) {
			var i;
			if(self.hotelEligible && self.selectedSection && self.selectedSection().value().indexOf('GLOBAL')== -1 && self.selectedSection().hotelEligibilityLayoverHour && flight) {
				for(i=0; i < flight.segments.length -1; i++) {
					if(flight.segments[i].hotelIstanbul && flight.segments[i+1].hotelIstanbul) {
						var hourDiff = (flight.segments[i+1].departureDateTime - flight.segments[i].arrivalDateTime) / (1000 * 3600);
						return hourDiff >= self.selectedSection().hotelEligibilityLayoverHour;
					}
				}
			}
			return false;
		}
		
		self.processFlightList();

		groupListForPanel();
		
		self.updateInitialSelectedFlight();
		self.updateHotelEligibility(self.selectedSection());
		self.full = self.hasFlight() && underscore.all(self.processedFlightList(), function(flight) {return flight.full;});
		self.weeklyPricesFunctionalityAvailable = ko.observable(false);
	}
	
	function FlightListPanelBrandedDomesticSingleCity(flightDay, sortData, filterData, index, bookingRequest) {

		var self = this;
		
		self.sortData = sortData;
		self.filterData = filterData;
		
		self.availabilityWarnings = flightDay.availabilityWarnings ? flightDay.availabilityWarnings : ko.observable(false);
		
		self.initialSelectedFlightNumber = flightDay.initialSelectedFlightNumber;
		
		var flightsToList = flightDay.flights;
		
		self.index = ko.observable(index);
		
		self.hasNoFlight = ko.observable(flightDay.hasNoFlight);
		self.hasFlight = ko.observable(!flightDay.hasNoFlight);
		
		self.selectedPaymentCurrency = ko.observable(flightDay.originalCurrency.code);

		self.primaryPaxCode = flightDay.primaryPaxCode;
		
		self.oneWayWeeklyViewPanelDefaultOpen = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.oneWayWeeklyViewOpen : false);
		self.roundTripWeeklyViewPanelDefaultOpen = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.roundTripWeeklyViewOpen : false);
		self.oneWayWeeklyViewPanelDefaultOpenMobile = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.oneWayWeeklyViewOpenMobile : false);
		
		self.daysToTimeRangeEnd = flightDay.daysToTimeRangeEnd;
		self.daysToTimeRangeBeginning = flightDay.daysToTimeRangeBeginning;

		self.navigateToPreviousDayEnabled = !flightDay.onTimeRangeBeginning;
		self.navigateToNextDayEnabled = !flightDay.onTimeRangeEnd;		
	   		
		self.timeframe = ko.observable(flightDay.timeframe) ;
		
		//-------------------------------------------------------------//

		self.availableClasses = ko.observableArray();
		self.originLocationCode = ko.observable();
		self.destinationLocationCode = ko.observable();
		self.origin = ko.observable();		
		self.destination = ko.observable();		
		self.originationDateTime = ko.observable();
		self.selectedFlight = ko.observable('');		
		self.availabilityOneWayWeeklyResponsePanelVisible;
		self.oneWayBooking = ko.observable(true);
		self.roundTripBooking =	ko.computed(function() { return !self.oneWayBooking() });
		
		//-------------------------------------------------------------//
		showAllWarnings(index);
		
		self.showMoreFlag = ko.observable(false);
		self.showMore = function() {
			self.showMoreFlag(!self.showMoreFlag());
		}
		
		var externalExecutedFlag = false;
		self.selectedFlightExists = ko.computed(function() {
			
			if(externalExecutedFlag) return false;
			
			return self.selectedFlight && self.selectedFlight() != '';
		});
		
		self.updateSelectedFlight = function(flight, brandCode, cabinClass) {

			externalExecutedFlag = false;
			
			flight.showFareRules ? flight.showFareRules(false) :(flight.showFareRules = ko.observable(false));
			flight.fareRulesData ? flight.fareRulesData('') : (flight.fareRulesData = ko.observable(''));
			if(!flight.showItineraryDetails) {
				flight.showItineraryDetails= ko.observable(false);
			} else {
				flight.showItineraryDetails(false);
			}
			if(flight.availabilityData) {
				flight.availabilityData.selectedFareInfo = {
					brandCode: brandCode,
					cabinClass: cabinClass
				}
			}

			if (flight) {
				if(!($("#toast").hasClass("opened"))) {
					showToast('success', 'Label-Genel-101');
				}
			} else {
				checkForFixedPriceBar();
			}

			try {
				flight && self.updateSelectedFlightCallback && self.updateSelectedFlightCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}
			
			self.selectedFlight(flight);
			
			showAllWarnings(index);
			self.showMoreFlag(false);
			self.showMore = function() {
				self.showMoreFlag(!self.showMoreFlag());
			}

			try {
				flight && self.showFareRulesManuallyCallback && self.showFareRulesManuallyCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}
		};
		
		self.executeExternalCallback = function(flight, callBackFunction, functionArguments) {
			externalExecutedFlag = true;
			if (flight) {
				flight.availableFlightFare.preferedFareBasisCode = flight.priceForSelectedFareBasisCode() ? flight.priceForSelectedFareBasisCode().code : flight.bookingPriceTagHolder.priceTags[0].code;
			}
			self.selectedFlight(flight);
			callBackFunction.apply(self, functionArguments);
		}
		
		self.filterData.optionFiltersAvailable(flightDay.minimumFlightCountForOptionsFilteringReached);
		self.filterData.timeRangeFiltersAvailable(flightDay.minimumFlightCountForTimeRangeFilteringReached);
		self.sortData.sortersAvailable(flightDay.minimumFlightCountForSortingReached);

		self.originLocationCode(flightDay.originLocationCode);
		
		self.destinationLocationCode(flightDay.destinationLocationCode);
		 
		self.origin(flightDay.originLocationCode);
		
		self.destination(flightDay.destinationLocationCode);
		 
		self.originationDateTime(flightDay.dateOfDay);		
		
		self.filterData.timeRangeStartValue.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		});
		
		self.filterData.timeRangeEndValue.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		});
		
		self.filterData.selectedStopFilters.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		}, null, "arrayChange");

		self.emptyEcoCabin = ko.observable(false);
		self.emptyBusCabin = ko.observable(false);
		
		underscore.each(flightsToList, function(value) {
			value.visible = ko.observable(true);
			value.showDetails = ko.observable(false);
			value.activeItemTab = ko.observable('');
			value.routeIndex = index;
			value.hasPriceForSelectedFareBasisCode = ko.observable();
		});
		
		self.weeklyPricesFunctionalityAvailable = ko.observable(false);
		
		self.toggleFlightSingle = function(flight) {
			underscore.each(flightsToList, function(value) {
				if(flight == value) {
					value.showDetails(!value.showDetails());
				} else {
					value.showDetails(false);
				}
			});
		};

		self.toggleFlightMultiple = function(flight) {
			underscore.each(flightsToList, function(value) {
				if(flight == value) {
					value.showDetails(!value.showDetails());
				}
			});
		};
				
		self.processedFlightList = ko.observableArray(flightsToList);

		self.processedFlightListVisibleFlightsLength = ko.computed(function() {
			return underscore.reduce(self.processedFlightList(), function(length, flight) { return length + ( (flight.visible && flight.visible()) ? 1 : 0 ) }, 0);
		});

		var sortOptiontext = '';
		if( 0 < self.sortData.sortOptions().length) {
			underscore.each(self.sortData.sortOptions(), function( value ) {
				if(self.sortData.selectedSortKey() == value.value) {
					sortOptiontext = value.text;
				}
			});
		}
		self.selectedSortOptionText = ko.observable(sortOptiontext);
		
		self.showSortDirection = ko.observable(false);
		self.sortOptionClicked = function(clickedOption, event) {
			var dir = $(event.target).data('direction');
			dir && (dir = parseInt(dir))
			if(dir) {
				self.sortData.selectedSortKey(clickedOption.value);
				self.sortData.selectedSortDirection(dir);
			}else{
				if (self.sortData.selectedSortKey() === clickedOption.value) {
					self.sortData.selectedSortDirection(-self.sortData.selectedSortDirection());
				} else {
					self.sortData.selectedSortKey(clickedOption.value);
					self.sortData.selectedSortDirection(1);
				}
			}
		    (/price|duration/.test(clickedOption.value) ? self.showSortDirection(true):self.showSortDirection(false));
			self.selectedSortOptionText(clickedOption.text)
			self.processFlightList();
			self.changeSortingCallback && self.changeSortingCallback();
			return true;
		};
		
		self.filterOptionClicked = function() {
			self.processFlightList();
			return true;
		};


		self.processFlightList = function() {
			
			var filterUtil = flightFilterUtil(self.filterData, self.timeframe);
			
			var sortUtil = flightSortUtilBrandedDomestic(self.sortData);

			var visibilityUtil = flightVisibilityUtil(filterUtil);
			
			if(self.filterData.optionFiltersAvailable() || self.filterData.timeRangeFiltersAvailable()) {
				underscore.each(self.processedFlightList(), visibilityUtil.computeVisibility);
			}
			
			self.processedFlightList.valueHasMutated()
			
			switch (self.sortData.selectedSortKey()) {

			case 'segmentcount':
				var sortList;
				self.processedFlightList.sort(function(a, b) {
					if(self.sortData.selectedSortDirection() < 0)
						sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(b,a);
					else
						sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(a,b);
					return sortList;
				});
				break;

			case 'departuretime':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByDeparture(a,b) || sortUtil.compareByArrival(a,b);
				});
				break;

			case 'arrivaltime':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByArrival(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;

			case 'duration':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByDuration(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;
				

			case 'price':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByPrice(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;	

			}
			
			underscore.each(self.processedFlightList(), function(value, index) {
				value.index = index;
			});
		};
		
		self.processFlightList();
		
		self.full = self.hasFlight() && underscore.all(self.processedFlightList(), function(flight) {return flight.full;});
		self.getDefaultSelectedFlight = function(previouslySelectedFlight) {
			var selectedFlight = underscore.filter(flightsToList,function(elem) {
				var elActive = underscore.map(elem.segments, function(segment) { return segment.flightNumber });
				var elPrev = underscore.map(previouslySelectedFlight.segments, function(segment) { return segment.flightNumber });
				var res = elActive.join("") == elPrev.join("");
				if(!elem.priceForSelectedFareBasisCode())
					elem.priceForSelectedFareBasisCode(elem.bookingPriceTagHolder.priceTags[0]);

				var resp = res && previouslySelectedFlight.priceForSelectedFareBasisCode().code == elem.priceForSelectedFareBasisCode().code
				return resp;
			})[0];
			return selectedFlight;
		}

	}

	function FlightListPanelBrandedDomestic(flightDay, sortData, filterData, index, bookingRequest, tripType) {

		var self = this;
		
		self.sortData = sortData;
		self.filterData = filterData;
		
		self.availabilityWarnings = flightDay.availabilityWarnings ? flightDay.availabilityWarnings : ko.observable(false);
			
		self.initialData = flightDay.initialData;
		
		var flightsToList = flightDay.flights;
		
		self.index = ko.observable(index);
		
		self.hasNoFlight = ko.observable(flightDay.hasNoFlight);
		self.hasFlight = ko.observable(!flightDay.hasNoFlight);
		
		self.selectedPaymentCurrency = ko.observable(flightDay.originalCurrency.code);

		self.primaryPaxCode = flightDay.primaryPaxCode;
		
		self.oneWayWeeklyViewPanelDefaultOpen = ko.observable(false);
		self.roundTripWeeklyViewPanelDefaultOpen = ko.observable(false);
		self.oneWayWeeklyViewPanelDefaultOpenMobile = ko.observable(false);
		
		showAllWarnings(index);
		
		self.showMoreFlag = ko.observable(false);
		self.showMore = function() {
			self.showMoreFlag(!self.showMoreFlag());					
		}

		if(tripType == "ONE_WAY" || tripType == "ROUND_TRIP") {
			self.oneWayWeeklyViewPanelDefaultOpen = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.oneWayWeeklyViewOpen : false);
			self.roundTripWeeklyViewPanelDefaultOpen = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.roundTripWeeklyViewOpen : false);
			self.oneWayWeeklyViewPanelDefaultOpenMobile = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.oneWayWeeklyViewOpenMobile : false);
		}
		
		self.daysToTimeRangeEnd = flightDay.daysToTimeRangeEnd;
		self.daysToTimeRangeBeginning = flightDay.daysToTimeRangeBeginning;

		self.navigateToPreviousDayEnabled = !flightDay.onTimeRangeBeginning;
		self.navigateToNextDayEnabled = !flightDay.onTimeRangeEnd;		
	   				
		//-------------------------------------------------------------//

		self.availableClasses = ko.observableArray();
		self.originLocationCode = ko.observable();
		self.destinationLocationCode = ko.observable();
		self.origin = ko.observable();		
		self.destination = ko.observable();		
		self.originationDateTime = ko.observable();
		self.selectedFlight = ko.observable('');		
		// TODO:
		self.availabilityOneWayWeeklyResponsePanelVisible;
//		self.oneWayBooking = ko.observable(tripType == "ONE_WAY");
//		self.roundTripBooking =	ko.observable(tripType == "ROUND_TRIP");
//		self.multiCityBooking =	ko.observable(tripType == "MULTI_CITY");
		
		//-------------------------------------------------------------//

		var externalExecutedFlag = false;
		self.selectedFlightExists = ko.computed(function() {
			if(externalExecutedFlag) return false;
			return self.selectedFlight && self.selectedFlight() != '';
		});
		
		self.updateSelectedFlight = function(flight, brandCode, cabinClass) {

			externalExecutedFlag = false;
			
			flight.showFareRules ? flight.showFareRules(false) :(flight.showFareRules = ko.observable(false));
			flight.fareRulesData ? flight.fareRulesData('') : (flight.fareRulesData = ko.observable(''));
			if(!flight.showItineraryDetails) {
				flight.showItineraryDetails= ko.observable(false);
			} else {
				flight.showItineraryDetails(false);
			}
			if(flight.availabilityData) {
				flight.availabilityData.selectedFareInfo = {
					brandCode: brandCode,
					cabinClass: cabinClass
				}
			}

			if (flight) {
				if( !($("#toast").hasClass("opened")) ) {
					showToast('success', 'Label-Genel-101');
				}
			} else {
				checkForFixedPriceBar();
			}

			try {
				flight && self.updateSelectedFlightCallback && self.updateSelectedFlightCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}
			
			self.selectedFlight(flight);
			
			showAllWarnings(index);
			self.showMoreFlag(false);
			self.showMore = function() {
				self.showMoreFlag(!self.showMoreFlag());
			}
			

			try {
				flight && self.showFareRulesManuallyCallback && self.showFareRulesManuallyCallback(self.index(), flight);
				if(flight && $('.trip-container:not(.selected-panel)').length) {
					scrollToEl($('.trip-container:not(.selected-panel)').first(), undefined, 0);
				} else {
					var el = $('.trip-container').length ? $('.trip-container').eq(self.index()) : $('.container.without-canvas').eq(self.index() -1);
					scrollToEl(el, undefined, 30);
				}
			} catch (e) {
				console.log(e);
			}
			
		};
		
		self.filterData.optionFiltersAvailable(flightDay.minimumFlightCountForOptionsFilteringReached);
		self.filterData.timeRangeFiltersAvailable(flightDay.minimumFlightCountForTimeRangeFilteringReached);
		self.sortData.sortersAvailable(flightDay.minimumFlightCountForSortingReached);

		self.originLocationCode(flightDay.originLocationCode);
		
		self.destinationLocationCode(flightDay.destinationLocationCode);
		 
		self.origin(flightDay.originLocationCode);
		
		self.destination(flightDay.destinationLocationCode);
		 
		self.originationDateTime(flightDay.dateOfDay);		
		
		self.filterData.timeRangeStartValue.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		});
		
		self.filterData.timeRangeEndValue.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		});
		
		self.filterData.selectedStopFilters.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		}, null, "arrayChange");
		
		self.emptyEcoCabin = ko.observable(false);
		self.emptyBusCabin = ko.observable(false);
		
		underscore.each(flightsToList, function(value) {
			value.visible = ko.observable(true);
			value.showDetails = ko.observable(false);
			value.activeItemTab = ko.observable('');
			value.routeIndex = index;
		});
		
		self.weeklyPricesFunctionalityAvailable = ko.observable(false);
		
		self.toggleFlightSingle = function(flight) {
			underscore.each(flightsToList, function(value) {
				if(flight == value) {
					value.showDetails(!value.showDetails());
				} else {
					value.showDetails(false);
				}
			});
		};

		self.toggleFlightMultiple = function(flight) {
			underscore.each(flightsToList, function(value) {
				if(flight == value) {
					value.showDetails(!value.showDetails());
				}
			});
		};
				
		self.processedFlightList = ko.observableArray(flightsToList);

		self.processedFlightListVisibleFlightsLength = ko.computed(function() {
			return underscore.reduce(self.processedFlightList(), function(length, flight) { return length + ( (flight.visible && flight.visible()) ? 1 : 0 ) }, 0);
		});

		var sortOptiontext = '';
		if( 0 < self.sortData.sortOptions().length) {
			underscore.each(self.sortData.sortOptions(), function( value ) {
				if(self.sortData.selectedSortKey() == value.value) {
					sortOptiontext = value.text;
				}
			});
		}
		self.selectedSortOptionText = ko.observable(sortOptiontext);
		
		self.showSortDirection = ko.observable(false);
		self.sortOptionClicked = function(clickedOption, event) {
			var dir = $(event.target).data('direction');
			dir && (dir = parseInt(dir))
			if(dir) {
				self.sortData.selectedSortKey(clickedOption.value);
				self.sortData.selectedSortDirection(dir);
			}else{
				if (self.sortData.selectedSortKey() === clickedOption.value) {
					self.sortData.selectedSortDirection(-self.sortData.selectedSortDirection());
				} else {
					self.sortData.selectedSortKey(clickedOption.value);
					self.sortData.selectedSortDirection(1);
				}
			}
		    (/price|duration/.test(clickedOption.value) ? self.showSortDirection(true):self.showSortDirection(false));
			self.selectedSortOptionText(clickedOption.text)
			self.processFlightList();
			self.changeSortingCallback && self.changeSortingCallback();
			return true;
		};
		
		self.filterOptionClicked = function() {
			self.processFlightList();
			return true;
		};

		self.updateInitialSelectedFlight = function() {
			
			if (self.initialData && self.initialData.flightNumberList && self.initialData.brandCode) {
				
				var initialSelectedFlightNumber = self.initialData.flightNumberList.join(',');

				var initialFlight = underscore.find(self.processedFlightList(), function(flight) {

					var flightNumbersAppended = underscore.pluck(flight.segments, 'flightNumber').join(',');
					
					return flightNumbersAppended == this;

				}, initialSelectedFlightNumber);

				if (initialFlight && initialFlight.visible() && 
						initialFlight.availabilityData && initialFlight.availabilityData.selectedFareInfo &&
						initialFlight.availabilityData.selectedFareInfo.brandCode == self.initialData.brandCode){

					self.updateSelectedFlight(initialFlight, initialFlight.availabilityData.selectedFareInfo.brandCode, initialFlight.availabilityData.selectedFareInfo.cabinClass);

				} else if(bookingRequest.deepLink && $('#noFlightForDeeplinkClass')){
					$('#noFlightForDeeplinkClass').modal("show");
				}
			}
		};

		self.processFlightList = function() {
			
			var filterUtil = flightFilterUtil(self.filterData, self.timeframe);
			
			var sortUtil = flightSortUtilBrandedDomestic(self.sortData);

			var visibilityUtil = flightVisibilityUtil(filterUtil);
			
			if(self.filterData.optionFiltersAvailable() || self.filterData.timeRangeFiltersAvailable()){
				underscore.each(self.processedFlightList(), visibilityUtil.computeVisibility);
			}
			
			self.processedFlightList.valueHasMutated()
			
			switch (self.sortData.selectedSortKey()) {

			case 'segmentcount':
				var sortList;
				self.processedFlightList.sort(function(a, b) {
					if(self.sortData.selectedSortDirection() < 0)
						sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(b,a);
					else
						sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(a,b);
					return sortList;
				});
				break;

			case 'departuretime':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByDeparture(a,b) || sortUtil.compareByArrival(a,b);
				});
				break;

			case 'arrivaltime':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByArrival(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;

			case 'duration':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByDuration(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;
				

			case 'price':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByPrice(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;	

			}
			
			underscore.each(self.processedFlightList(), function(value, index) {
				value.index = index;
			});
		};
		
		self.processFlightList();

		self.updateInitialSelectedFlight();
		
		self.full = self.hasFlight() && underscore.all(self.processedFlightList(), function(flight){return flight.full;});

	}
	
	function FlightListPanelBrandedDomesticHolder(data, callbacks, isChangeFlight) {
		var self = this;
		var tripType = data.tripType;
		self.pricesVisible = !isChangeFlight;
		self.selectedPaymentCurrency = ko.observable(data.routes.length ? data.routes[0].days[0].originalCurrency.code : 'ORIGINAL_PRICE');
	
    	self.sortSelections = ko.observableArray();
    	self.filterSelections = ko.observableArray();
    	self.sortSelections(data.bookingRequest.sortSelections);
    	self.filterSelections(data.bookingRequest.filterSelections);
    	
		self.flightListPanelArray = ko.observableArray([]);
		
		self.emptyEcoCabin = ko.observable(false);
		self.emptyBusCabin = ko.observable(false);
		for (var routeIndex = 0; routeIndex < data.routes.length; routeIndex++) {
			
			var route = data.routes[routeIndex];
			
			if(route.days.length == 0) {
				self.flightListPanelArray.push({noflights:true, selectedFlightExists: ko.observable(false)});
				continue;
			}
			
			var flightDay = route.days[0];
			
			var currentBooking = tripType == "ROUND_TRIP" ? data.bookingRequest.bookings[0] : data.bookingRequest.bookings[routeIndex];
			
			var filterData = FilterDataFromFlightDay(flightDay, currentBooking.filters);
			
			if(self.filterSelections() && self.filterSelections().length > 0 && self.filterSelections()[routeIndex]){
				
				filterData.panelVisible(self.filterSelections()[routeIndex].panelVisible);								
				filterData.stopFilterOptions(self.filterSelections()[routeIndex].stopFilterOptions);
				filterData.selectedStopFilters(self.filterSelections()[routeIndex].selectedStopFilters);
				filterData.airlineFilterOptions(self.filterSelections()[routeIndex].airlineFilterOptions);
				filterData.optionFiltersAvailable(self.filterSelections()[routeIndex].optionFiltersAvailable);
				filterData.selectedAirlineFilters(self.filterSelections()[routeIndex].selectedAirlineFilters);
				filterData.timeRangeFiltersAvailable(self.filterSelections()[routeIndex].timeRangeFiltersAvailable);
				filterData.originAirportFilterOptions(self.filterSelections()[routeIndex].originAirportFilterOptions);
				filterData.selectedOriginAirportFilters(self.filterSelections()[routeIndex].selectedOriginAirportFilters);								
				filterData.destinationAirportFilterOptions(self.filterSelections()[routeIndex].destinationAirportFilterOptions);
				filterData.selectedDestinationAirportFilters(self.filterSelections()[routeIndex].selectedDestinationAirportFilters);							
				
			} else {								
				self.filterSelections([]);
				self.filterSelections().push(filterData);
			}
			
			var sortData = GenerateDefaultSortData();
			
			if(sortData.sortOptions()[0].value != 'segmentcount' &&
				self.sortSelections()[routeIndex] != 'segmentcount' &&
					self.sortSelections().length > 0) {
				sortData.selectedSortKey(self.sortSelections()[routeIndex]);
			}
			
			var flightListPanel = new FlightListPanelBrandedDomestic(flightDay, sortData, filterData, routeIndex, data.bookingRequest, tripType);
			
			if(callbacks) {
				flightListPanel.updateSelectedFlightCallback = callbacks.updateSelectedFlightCallback;
				flightListPanel.changeSortingCallback = callbacks.changeSortingCallback;
				flightListPanel.showFareRulesManuallyCallback = callbacks.showFareRulesManuallyCallback;
				flightListPanel.searchForFareBreakdownCallback = callbacks.searchForFareBreakdownCallback;
			}
			
			self.flightListPanelArray.push(flightListPanel);
			
		}
	    
		self.flightListPanelArrayAllFlightsSelected = ko.pureComputed(function() {
			
			if (underscore.isEmpty(self.flightListPanelArray())) {
				return false;
			}

			return underscore.all(self.flightListPanelArray(), function(panel) { return panel.selectedFlightExists() });
		}).extend({ rateLimit: 10 });
		
		self.selectedFlights = function() {
			var selectedFlights = [];
			
			if(self.flightListPanelArray()){
				ko.utils.arrayForEach(self.flightListPanelArray(), function(panel){
					panel.selectedFlight() && selectedFlights.push(panel.selectedFlight());
                });	
			}

			return selectedFlights;
		};
		
		self.airTravelers = function() {
			var airTravelers = [];
			
			var paxList = data.bookingRequest.bookings[0].paxList;
			
			for (var paxIndex = 0; paxIndex < paxList.length; paxIndex++) {
				var pax = paxList[paxIndex];
				airTravelers.push({ 'code' : pax.code , 'quantity' : pax.count });
			}

			return airTravelers;
		};
	}

	function FlightListPanelBrandedInternationalHolder(data, callbacks, isChangeFlight) {
		var self = this;
		var tripType = data.tripType;
		self.pricesVisible = !isChangeFlight;
		self.selectedPaymentCurrency = ko.observable(data.routes.length ? data.routes[0].days[0].originalCurrency.code : 'ORIGINAL_PRICE');

		self.sortSelections = ko.observableArray();
		self.filterSelections = ko.observableArray();
		self.sortSelections(data.bookingRequest.sortSelections);
		self.filterSelections(data.bookingRequest.filterSelections);

		self.flightListPanelArray = ko.observableArray([]);

		self.emptyEcoCabin = ko.observable(false);
		self.emptyBusCabin = ko.observable(false);
		for (var routeIndex = 0; routeIndex < data.routes.length; routeIndex++) {

			var route = data.routes[routeIndex];

			if(route.days.length == 0) {
				self.flightListPanelArray.push({noflights:true, selectedFlightExists: ko.observable(false)});
				continue;
			}

			var flightDay = route.days[0];

			var currentBooking = tripType == "ROUND_TRIP" ? data.bookingRequest.bookings[0] : data.bookingRequest.bookings[routeIndex];

			var filterData = FilterDataFromFlightDay(flightDay, currentBooking.filters);

			if(self.filterSelections() && self.filterSelections().length > 0 && self.filterSelections()[routeIndex]){

				filterData.panelVisible(self.filterSelections()[routeIndex].panelVisible);
				filterData.stopFilterOptions(self.filterSelections()[routeIndex].stopFilterOptions);
				filterData.selectedStopFilters(self.filterSelections()[routeIndex].selectedStopFilters);
				filterData.airlineFilterOptions(self.filterSelections()[routeIndex].airlineFilterOptions);
				filterData.optionFiltersAvailable(self.filterSelections()[routeIndex].optionFiltersAvailable);
				filterData.selectedAirlineFilters(self.filterSelections()[routeIndex].selectedAirlineFilters);
				filterData.timeRangeFiltersAvailable(self.filterSelections()[routeIndex].timeRangeFiltersAvailable);
				filterData.originAirportFilterOptions(self.filterSelections()[routeIndex].originAirportFilterOptions);
				filterData.selectedOriginAirportFilters(self.filterSelections()[routeIndex].selectedOriginAirportFilters);
				filterData.destinationAirportFilterOptions(self.filterSelections()[routeIndex].destinationAirportFilterOptions);
				filterData.selectedDestinationAirportFilters(self.filterSelections()[routeIndex].selectedDestinationAirportFilters);

			} else {
				self.filterSelections([]);
				self.filterSelections().push(filterData);
			}

			var sortData = GenerateDefaultSortData();

			if(sortData.sortOptions()[0].value != 'segmentcount' &&
				self.sortSelections()[routeIndex] != 'segmentcount' &&
				self.sortSelections().length > 0) {
				sortData.selectedSortKey(self.sortSelections()[routeIndex]);
			}

			var flightListPanel = new FlightListPanelBrandedInternational(flightDay, sortData, filterData, routeIndex, data.bookingRequest, tripType,self);

			if(callbacks) {
				flightListPanel.updateSelectedFlightCallback = callbacks.updateSelectedFlightCallback;
				flightListPanel.changeSortingCallback = callbacks.changeSortingCallback;
				flightListPanel.showFareRulesManuallyCallback = callbacks.showFareRulesManuallyCallback;
				flightListPanel.searchForFareBreakdownCallback = callbacks.searchForFareBreakdownCallback;
			}

			self.flightListPanelArray.push(flightListPanel);

		}

		self.flightListPanelArrayAllFlightsSelected = ko.pureComputed(function() {

			if (underscore.isEmpty(self.flightListPanelArray())) {
				return false;
			}

			return underscore.all(self.flightListPanelArray(), function(panel) { return panel.selectedFlightExists() });
		}).extend({ rateLimit: 10 });

		self.selectedFlights = function() {
			var selectedFlights = [];

			if(self.flightListPanelArray()){
				ko.utils.arrayForEach(self.flightListPanelArray(), function(panel){
					panel.selectedFlight() && selectedFlights.push(panel.selectedFlight());
				});
			}

			return selectedFlights;
		};

		self.airTravelers = function() {
			var airTravelers = [];

			var paxList = data.bookingRequest.bookings[0].paxList;

			for (var paxIndex = 0; paxIndex < paxList.length; paxIndex++) {
				var pax = paxList[paxIndex];
				airTravelers.push({ 'code' : pax.code , 'quantity' : pax.count });
			}

			return airTravelers;
		};
		self.updatePanelArray = function(remainingPanelIndex){
			for (var i = 0; i < self.flightListPanelArray().length; i++) {
				//if(self.flightListPanelArray()[i].index() > remainingPanelIndex){
					self.flightListPanelArray.splice(i+1, 1);
				//}
			}

			setTimeout(function(){
				var el = $('#panelHeader_' + remainingPanelIndex);
				if(el && el.length > 0){
					scrollToEl(el);
				}
			}, 500);
		}
	}

	function FlightListPanelBrandedInternationalSingleCity(flightDay, sortData, filterData, index, bookingRequest) {

		var self = this;

		self.sortData = sortData;
		self.filterData = filterData;

		self.availabilityWarnings = flightDay.availabilityWarnings ? flightDay.availabilityWarnings : ko.observable(false);

		self.initialSelectedFlightNumber = flightDay.initialSelectedFlightNumber;

		var flightsToList = flightDay.flights;

		self.index = ko.observable(index);

		self.hasNoFlight = ko.observable(flightDay.hasNoFlight);
		self.hasFlight = ko.observable(!flightDay.hasNoFlight);

		self.selectedPaymentCurrency = ko.observable(flightDay.originalCurrency.code);

		self.primaryPaxCode = flightDay.primaryPaxCode;

		self.oneWayWeeklyViewPanelDefaultOpen = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.oneWayWeeklyViewOpen : false);
		self.roundTripWeeklyViewPanelDefaultOpen = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.roundTripWeeklyViewOpen : false);
		self.oneWayWeeklyViewPanelDefaultOpenMobile = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.oneWayWeeklyViewOpenMobile : false);

		self.daysToTimeRangeEnd = flightDay.daysToTimeRangeEnd;
		self.daysToTimeRangeBeginning = flightDay.daysToTimeRangeBeginning;

		self.navigateToPreviousDayEnabled = !flightDay.onTimeRangeBeginning;
		self.navigateToNextDayEnabled = !flightDay.onTimeRangeEnd;

		self.timeframe = ko.observable(flightDay.timeframe) ;

		//-------------------------------------------------------------//

		self.availableClasses = ko.observableArray();
		self.originLocationCode = ko.observable();
		self.destinationLocationCode = ko.observable();
		self.origin = ko.observable();
		self.destination = ko.observable();
		self.originationDateTime = ko.observable();
		self.selectedFlight = ko.observable('');
		self.availabilityOneWayWeeklyResponsePanelVisible;
		self.oneWayBooking = ko.observable(true);
		self.roundTripBooking =	ko.computed(function() { return !self.oneWayBooking() });

		//-------------------------------------------------------------//
		showAllWarnings(index);

		self.showMoreFlag = ko.observable(false);
		self.showMore = function() {
			self.showMoreFlag(!self.showMoreFlag());
		}

		var externalExecutedFlag = false;
		self.selectedFlightExists = ko.computed(function() {

			if(externalExecutedFlag) return false;

			return self.selectedFlight && self.selectedFlight() != '';
		});

		self.updateSelectedFlight = function(flight, brandCode, cabinClass) {
			var i;

			flight.fareRulesLinkVisibility ? flight.fareRulesLinkVisibility(true) :(flight.fareRulesLinkVisibility = ko.observable(true));
			flight.showFareRules ? flight.showFareRules(false) :(flight.showFareRules = ko.observable(false));
			flight.fareRulesData ? flight.fareRulesData('') : (flight.fareRulesData = ko.observable(''));

			if(!flight.showItineraryDetails){
				flight.showItineraryDetails= ko.observable(false);
			} else{
				flight.showItineraryDetails(false);
			}

			if(flight.availabilityData) {
				flight.availabilityData.selectedFareInfo = {
					brandCode: brandCode,
					cabinClass: cabinClass
				}
			}


			if(flight){
				showToast('success', 'Label-Genel-101');
			} else{
				checkForFixedPriceBar();
			}

			try {
				flight && self.updateSelectedFlightCallback && self.updateSelectedFlightCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}

			self.selectedFlight(flight);

			showAllWarnings(index);
			self.showMoreFlag(false);

			self.showMore = function() {
				self.showMoreFlag(!self.showMoreFlag());
			}

			try {
				flight && self.showFareRulesManuallyCallback && self.showFareRulesManuallyCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}
		};


		/*self.updateSelectedFlight = function(flight, brandCode, cabinClass) {

			externalExecutedFlag = false;

			flight.showFareRules ? flight.showFareRules(false) :(flight.showFareRules = ko.observable(false));
			flight.fareRulesData ? flight.fareRulesData('') : (flight.fareRulesData = ko.observable(''));
			if(!flight.showItineraryDetails) {
				flight.showItineraryDetails= ko.observable(false);
			} else {
				flight.showItineraryDetails(false);
			}
			if(flight.availabilityData) {
				flight.availabilityData.selectedFareInfo = {
					brandCode: brandCode,
					cabinClass: cabinClass
				}
			}

			if (flight) {
				if(!($("#toast").hasClass("opened"))) {
					showToast('success', 'Label-Genel-101');
				}
			} else {
				checkForFixedPriceBar();
			}

			try {
				flight && self.updateSelectedFlightCallback && self.updateSelectedFlightCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}

			self.selectedFlight(flight);

			showAllWarnings(index);
			self.showMoreFlag(false);
			self.showMore = function() {
				self.showMoreFlag(!self.showMoreFlag());
			}

			try {
				flight && self.showFareRulesManuallyCallback && self.showFareRulesManuallyCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}
		};*/

		self.executeExternalCallback = function(flight, callBackFunction, functionArguments) {
			externalExecutedFlag = true;
			if (flight) {
				flight.availableFlightFare.preferedFareBasisCode = flight.priceForSelectedFareBasisCode() ? flight.priceForSelectedFareBasisCode().code : flight.bookingPriceTagHolder.priceTags[0].code;
			}
			self.selectedFlight(flight);
			callBackFunction.apply(self, functionArguments);
		}

		self.filterData.optionFiltersAvailable(flightDay.minimumFlightCountForOptionsFilteringReached);
		self.filterData.timeRangeFiltersAvailable(flightDay.minimumFlightCountForTimeRangeFilteringReached);
		self.sortData.sortersAvailable(flightDay.minimumFlightCountForSortingReached);

		self.originLocationCode(flightDay.originLocationCode);

		self.destinationLocationCode(flightDay.destinationLocationCode);

		self.origin(flightDay.originLocationCode);

		self.destination(flightDay.destinationLocationCode);

		self.originationDateTime(flightDay.dateOfDay);

		self.filterData.timeRangeStartValue.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		});

		self.filterData.timeRangeEndValue.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		});

		self.filterData.selectedStopFilters.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		}, null, "arrayChange");

		self.emptyEcoCabin = ko.observable(false);
		self.emptyBusCabin = ko.observable(false);

		underscore.each(flightsToList, function(value) {
			value.visible = ko.observable(true);
			value.showDetails = ko.observable(false);
			value.activeItemTab = ko.observable('');
			value.routeIndex = index;
			value.hasPriceForSelectedFareBasisCode = ko.observable();
		});

		self.weeklyPricesFunctionalityAvailable = ko.observable(false);

		self.toggleFlightSingle = function(flight) {
			underscore.each(flightsToList, function(value) {
				if(flight == value) {
					value.showDetails(!value.showDetails());
				} else {
					value.showDetails(false);
				}
			});
		};

		self.toggleFlightMultiple = function(flight) {
			underscore.each(flightsToList, function(value) {
				if(flight == value) {
					value.showDetails(!value.showDetails());
				}
			});
		};

		self.processedFlightList = ko.observableArray(flightsToList);

		self.processedFlightListVisibleFlightsLength = ko.computed(function() {
			return underscore.reduce(self.processedFlightList(), function(length, flight) { return length + ( (flight.visible && flight.visible()) ? 1 : 0 ) }, 0);
		});

		var sortOptiontext = '';
		if( 0 < self.sortData.sortOptions().length) {
			underscore.each(self.sortData.sortOptions(), function( value ) {
				if(self.sortData.selectedSortKey() == value.value) {
					sortOptiontext = value.text;
				}
			});
		}
		self.selectedSortOptionText = ko.observable(sortOptiontext);

		self.showSortDirection = ko.observable(false);
		self.sortOptionClicked = function(clickedOption, event) {
			var dir = $(event.target).data('direction');
			dir && (dir = parseInt(dir))
			if(dir) {
				self.sortData.selectedSortKey(clickedOption.value);
				self.sortData.selectedSortDirection(dir);
			}else{
				if (self.sortData.selectedSortKey() === clickedOption.value) {
					self.sortData.selectedSortDirection(-self.sortData.selectedSortDirection());
				} else {
					self.sortData.selectedSortKey(clickedOption.value);
					self.sortData.selectedSortDirection(1);
				}
			}
			(/price|duration/.test(clickedOption.value) ? self.showSortDirection(true):self.showSortDirection(false));
			self.selectedSortOptionText(clickedOption.text)
			self.processFlightList();
			self.changeSortingCallback && self.changeSortingCallback();
			return true;
		};

		self.filterOptionClicked = function() {
			self.processFlightList();
			return true;
		};


		self.processFlightList = function() {

			var filterUtil = flightFilterUtil(self.filterData, self.timeframe);

			var sortUtil = flightSortUtilBrandedDomestic(self.sortData);

			var visibilityUtil = flightVisibilityUtil(filterUtil);

			if(self.filterData.optionFiltersAvailable() || self.filterData.timeRangeFiltersAvailable()) {
				underscore.each(self.processedFlightList(), visibilityUtil.computeVisibility);
			}

			self.processedFlightList.valueHasMutated()

			switch (self.sortData.selectedSortKey()) {

				case 'segmentcount':
					var sortList;
					self.processedFlightList.sort(function(a, b) {
						if(self.sortData.selectedSortDirection() < 0)
							sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(b,a);
						else
							sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(a,b);
						return sortList;
					});
					break;

				case 'departuretime':
					self.processedFlightList.sort(function(a, b) {
						return sortUtil.compareByDeparture(a,b) || sortUtil.compareByArrival(a,b);
					});
					break;

				case 'arrivaltime':
					self.processedFlightList.sort(function(a, b) {
						return sortUtil.compareByArrival(a,b) || sortUtil.compareByDeparture(a,b);
					});
					break;

				case 'duration':
					self.processedFlightList.sort(function(a, b) {
						return sortUtil.compareByDuration(a,b) || sortUtil.compareByDeparture(a,b);
					});
					break;


				case 'price':
					self.processedFlightList.sort(function(a, b) {
						return sortUtil.compareByPrice(a,b) || sortUtil.compareByDeparture(a,b);
					});
					break;

			}

			underscore.each(self.processedFlightList(), function(value, index) {
				value.index = index;
			});
		};

		self.processFlightList();

		self.full = self.hasFlight() && underscore.all(self.processedFlightList(), function(flight) {return flight.full;});
		self.getDefaultSelectedFlight = function(previouslySelectedFlight) {
			var selectedFlight = underscore.filter(flightsToList,function(elem) {
				var elActive = underscore.map(elem.segments, function(segment) { return segment.flightNumber });
				var elPrev = underscore.map(previouslySelectedFlight.segments, function(segment) { return segment.flightNumber });
				var res = elActive.join("") == elPrev.join("");
				return res;
			})[0];
			return selectedFlight;
		}

	}

	function FlightListPanelBrandedInternational(flightDay, sortData, filterData, index, bookingRequest, tripType,holder) {

		var self = this;

		self.sortData = sortData;
		self.filterData = filterData;

		self.availabilityWarnings = flightDay.availabilityWarnings ? flightDay.availabilityWarnings : ko.observable(false);

		self.initialData = flightDay.initialData;

		var flightsToList = flightDay.flights;

		self.index = ko.observable(index);

		self.hasNoFlight = ko.observable(flightDay.hasNoFlight);
		self.hasFlight = ko.observable(!flightDay.hasNoFlight);

		self.selectedPaymentCurrency = ko.observable(flightDay.originalCurrency.code);

		self.primaryPaxCode = flightDay.primaryPaxCode;

		self.oneWayWeeklyViewPanelDefaultOpen = ko.observable(false);
		self.roundTripWeeklyViewPanelDefaultOpen = ko.observable(false);
		self.oneWayWeeklyViewPanelDefaultOpenMobile = ko.observable(false);

		showAllWarnings(index);

		self.showMoreFlag = ko.observable(false);
		self.showMore = function() {
			self.showMoreFlag(!self.showMoreFlag());
		}

		if(tripType == "ONE_WAY" || tripType == "ROUND_TRIP") {
			self.oneWayWeeklyViewPanelDefaultOpen = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.oneWayWeeklyViewOpen : false);
			self.roundTripWeeklyViewPanelDefaultOpen = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.roundTripWeeklyViewOpen : false);
			self.oneWayWeeklyViewPanelDefaultOpenMobile = ko.observable(flightDay.weeklyViewPanelDefaultOpen ? flightDay.weeklyViewPanelDefaultOpen.oneWayWeeklyViewOpenMobile : false);
		}

		self.daysToTimeRangeEnd = flightDay.daysToTimeRangeEnd;
		self.daysToTimeRangeBeginning = flightDay.daysToTimeRangeBeginning;

		self.navigateToPreviousDayEnabled = !flightDay.onTimeRangeBeginning;
		self.navigateToNextDayEnabled = !flightDay.onTimeRangeEnd;

		//-------------------------------------------------------------//

		self.availableClasses = ko.observableArray();
		self.originLocationCode = ko.observable();
		self.destinationLocationCode = ko.observable();
		self.origin = ko.observable();
		self.destination = ko.observable();
		self.originationDateTime = ko.observable();
		self.selectedFlight = ko.observable('');
		// TODO:
		self.availabilityOneWayWeeklyResponsePanelVisible;
//		self.oneWayBooking = ko.observable(tripType == "ONE_WAY");
//		self.roundTripBooking =	ko.observable(tripType == "ROUND_TRIP");
//		self.multiCityBooking =	ko.observable(tripType == "MULTI_CITY");

		//-------------------------------------------------------------//

		var externalExecutedFlag = false;
		self.selectedFlightExists = ko.computed(function() {
			if(externalExecutedFlag) return false;
			return self.selectedFlight && self.selectedFlight() != '';
		});

		self.updateSelectedFlight = function(flight, brandCode, cabinClass) {

			externalExecutedFlag = false;

			flight.showFareRules ? flight.showFareRules(false) :(flight.showFareRules = ko.observable(false));
			flight.fareRulesData ? flight.fareRulesData('') : (flight.fareRulesData = ko.observable(''));
			if(!flight.showItineraryDetails) {
				flight.showItineraryDetails= ko.observable(false);
			} else {
				flight.showItineraryDetails(false);
			}
			if(flight.availabilityData) {
				flight.availabilityData.selectedFareInfo = {
					brandCode: brandCode,
					cabinClass: cabinClass
				}
			}

			if(!flight || flight == ''){
				holder.updatePanelArray(self.index());
			}

			if (flight) {
				if( !($("#toast").hasClass("opened")) ) {
					showToast('success', 'Label-Genel-101');
				}
			} else {
				checkForFixedPriceBar();
			}

			try {
				flight && self.updateSelectedFlightCallback && self.updateSelectedFlightCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}



			self.selectedFlight(flight);

			showAllWarnings(index);
			self.showMoreFlag(false);
			self.showMore = function() {
				self.showMoreFlag(!self.showMoreFlag());
			}


			try {
				flight && self.showFareRulesManuallyCallback && self.showFareRulesManuallyCallback(self.index(), flight);
				if(flight && $('.trip-container:not(.selected-panel)').length) {
					scrollToEl($('.trip-container:not(.selected-panel)').first(), undefined, 0);
				} else {
					var el = $('.trip-container').length ? $('.trip-container').eq(self.index()) : $('.container.without-canvas').eq(self.index() -1);
					scrollToEl(el, undefined, 30);
				}
			} catch (e) {
				console.log(e);
			}

		};

		self.filterData.optionFiltersAvailable(flightDay.minimumFlightCountForOptionsFilteringReached);
		self.filterData.timeRangeFiltersAvailable(flightDay.minimumFlightCountForTimeRangeFilteringReached);
		self.sortData.sortersAvailable(flightDay.minimumFlightCountForSortingReached);

		self.originLocationCode(flightDay.originLocationCode);

		self.destinationLocationCode(flightDay.destinationLocationCode);

		self.origin(flightDay.originLocationCode);

		self.destination(flightDay.destinationLocationCode);

		self.originationDateTime(flightDay.dateOfDay);

		self.filterData.timeRangeStartValue.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		});

		self.filterData.timeRangeEndValue.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		});

		self.filterData.selectedStopFilters.subscribe(function() {
			if(self.processFlightList) {
				self.processFlightList();
			}
		}, null, "arrayChange");

		self.emptyEcoCabin = ko.observable(false);
		self.emptyBusCabin = ko.observable(false);

		underscore.each(flightsToList, function(value) {
			value.visible = ko.observable(true);
			value.showDetails = ko.observable(false);
			value.activeItemTab = ko.observable('');
			value.routeIndex = index;
		});

		self.weeklyPricesFunctionalityAvailable = ko.observable(false);

		self.toggleFlightSingle = function(flight) {
			underscore.each(flightsToList, function(value) {
				if(flight == value) {
					value.showDetails(!value.showDetails());
				} else {
					value.showDetails(false);
				}
			});
		};

		self.toggleFlightMultiple = function(flight) {
			underscore.each(flightsToList, function(value) {
				if(flight == value) {
					value.showDetails(!value.showDetails());
				}
			});
		};

		self.processedFlightList = ko.observableArray(flightsToList);

		self.processedFlightListVisibleFlightsLength = ko.computed(function() {
			return underscore.reduce(self.processedFlightList(), function(length, flight) { return length + ( (flight.visible && flight.visible()) ? 1 : 0 ) }, 0);
		});

		var sortOptiontext = '';
		if( 0 < self.sortData.sortOptions().length) {
			underscore.each(self.sortData.sortOptions(), function( value ) {
				if(self.sortData.selectedSortKey() == value.value) {
					sortOptiontext = value.text;
				}
			});
		}
		self.selectedSortOptionText = ko.observable(sortOptiontext);

		self.showSortDirection = ko.observable(false);
		self.sortOptionClicked = function(clickedOption, event) {
			var dir = $(event.target).data('direction');
			dir && (dir = parseInt(dir))
			if(dir) {
				self.sortData.selectedSortKey(clickedOption.value);
				self.sortData.selectedSortDirection(dir);
			}else{
				if (self.sortData.selectedSortKey() === clickedOption.value) {
					self.sortData.selectedSortDirection(-self.sortData.selectedSortDirection());
				} else {
					self.sortData.selectedSortKey(clickedOption.value);
					self.sortData.selectedSortDirection(1);
				}
			}
			(/price|duration/.test(clickedOption.value) ? self.showSortDirection(true):self.showSortDirection(false));
			self.selectedSortOptionText(clickedOption.text)
			self.processFlightList();
			self.changeSortingCallback && self.changeSortingCallback();
			return true;
		};

		self.filterOptionClicked = function() {
			self.processFlightList();
			return true;
		};

		self.updateInitialSelectedFlight = function() {

			if (self.initialData && self.initialData.flightNumberList && self.initialData.brandCode) {

				var initialSelectedFlightNumber = self.initialData.flightNumberList.join(',');

				var initialFlight = underscore.find(self.processedFlightList(), function(flight) {

					var flightNumbersAppended = underscore.pluck(flight.segments, 'flightNumber').join(',');

					return flightNumbersAppended == this;

				}, initialSelectedFlightNumber);

				if (initialFlight && initialFlight.visible() &&
					initialFlight.availabilityData && initialFlight.availabilityData.selectedFareInfo &&
					initialFlight.availabilityData.selectedFareInfo.brandCode == self.initialData.brandCode){

					self.updateSelectedFlight(initialFlight, initialFlight.availabilityData.selectedFareInfo.brandCode, initialFlight.availabilityData.selectedFareInfo.cabinClass);

				} else if(bookingRequest.deepLink && $('#noFlightForDeeplinkClass')){
					$('#noFlightForDeeplinkClass').modal("show");
				}
			}
		};

		self.processFlightList = function() {

			var filterUtil = flightFilterUtil(self.filterData, self.timeframe);

			var sortUtil = flightSortUtilBrandedDomestic(self.sortData);

			var visibilityUtil = flightVisibilityUtil(filterUtil);

			if(self.filterData.optionFiltersAvailable() || self.filterData.timeRangeFiltersAvailable()){
				underscore.each(self.processedFlightList(), visibilityUtil.computeVisibility);
			}

			self.processedFlightList.valueHasMutated()

			switch (self.sortData.selectedSortKey()) {

				case 'segmentcount':
					var sortList;
					self.processedFlightList.sort(function(a, b) {
						if(self.sortData.selectedSortDirection() < 0)
							sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(b,a);
						else
							sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(a,b);
						return sortList;
					});
					break;

				case 'departuretime':
					self.processedFlightList.sort(function(a, b) {
						return sortUtil.compareByDeparture(a,b) || sortUtil.compareByArrival(a,b);
					});
					break;

				case 'arrivaltime':
					self.processedFlightList.sort(function(a, b) {
						return sortUtil.compareByArrival(a,b) || sortUtil.compareByDeparture(a,b);
					});
					break;

				case 'duration':
					self.processedFlightList.sort(function(a, b) {
						return sortUtil.compareByDuration(a,b) || sortUtil.compareByDeparture(a,b);
					});
					break;


				case 'price':
					self.processedFlightList.sort(function(a, b) {
						return sortUtil.compareByPrice(a,b) || sortUtil.compareByDeparture(a,b);
					});
					break;

			}

			underscore.each(self.processedFlightList(), function(value, index) {
				value.index = index;
			});
		};

		self.processFlightList();

		self.updateInitialSelectedFlight();

		self.full = self.hasFlight() && underscore.all(self.processedFlightList(), function(flight){return flight.full;});

	}

	function FlightListPanel(flightsToList, sortData, filterData, flightDay){

		var self = this;

		self.sortData = sortData;
		self.filterData = filterData;
		
		self.availabilityWarnings = flightDay.availabilityWarnings ? flightDay.availabilityWarnings : ko.observable(false);

		self.availableClasses = ko.observableArray();
		self.originLocationCode = ko.observable();
		self.destinationLocationCode = ko.observable();
		
		self.timeframe = ko.observable(flightDay.timeframe);
		self.origin = ko.observable();		
		self.destination = ko.observable();		
		self.originationDateTime = ko.observable();
		self.selectedFlight = ko.observable('');		
		self.availabilityOneWayWeeklyResponsePanelVisible;
		
		self.oneWayBooking = ko.observable(true);
		
		self.roundTripBooking =	ko.computed(function() {
			return !self.oneWayBooking();
		});		

		self.selectedFareBasisCode = ko.observable();
		self.selectedFlightExists = ko.pureComputed(function() {
			return self.selectedFlight && self.selectedFlight() != '';
		});
		
		self.updateSelectedFlight = function(flight) {
			self.selectedFlight('');
			self.selectedFlight(flight);
		};
		
		
		underscore.each(flightsToList, function(value) {
			value.visible = ko.observable(true);
			value.showDetails = ko.observable(false);
			value.activeItemTab = ko.observable('');
		});
		

		self.toggleFlightSingle=function(flight){
			underscore.each(flightsToList, function(value) {
				if(flight == value){
					value.showDetails(!value.showDetails());
				} else {
					value.showDetails(false);
				}
			});
		};
		
		self.toggleFlightMultiple=function(flight){
			underscore.each(flightsToList, function(value) {
				if(flight == value){
					value.showDetails(!value.showDetails());
				}
			});
		};
		
		self.filterData.timeRangeStartValue.subscribe(function() {
			if(self.processFlightList){
				self.processFlightList();
			}
		});
		
		self.filterData.timeRangeEndValue.subscribe(function() {
			if(self.processFlightList){
				self.processFlightList();
			}
		});
				
		self.processedFlightList = ko.observableArray(flightsToList);

		self.processedFlightListVisibleFlightsLength = ko.computed(function(){
			return underscore.reduce(self.processedFlightList(), function(length, flight){ return length + ( (flight.visible && flight.visible()) ? 1 : 0 ) }, 0);
		});
		
		var sortOptiontext = '';
		if( 0 < self.sortData.sortOptions().length) {
			underscore.each(self.sortData.sortOptions(), function(value) {
				if(self.sortData.selectedSortKey() == value.value) {
					sortOptiontext = value.text;
				}
			});
		}
		self.selectedSortOptionText= ko.observable(sortOptiontext);
		
		self.showSortDirection = ko.observable(false);
		self.sortOptionClicked = function(clickedOption, event) {
			var dir = $(event.target).data('direction');
			dir && (dir = parseInt(dir))
			if(dir){
				self.sortData.selectedSortKey(clickedOption.value);
				self.sortData.selectedSortDirection(dir);
			}else{
				if (self.sortData.selectedSortKey() === clickedOption.value) {
					self.sortData.selectedSortDirection(-self.sortData.selectedSortDirection());
				} else {
					self.sortData.selectedSortKey(clickedOption.value);
					self.sortData.selectedSortDirection(1);
				}
			}
		    (/price|duration/.test(clickedOption.value) ? self.showSortDirection(true):self.showSortDirection(false));
			self.selectedSortOptionText(clickedOption.text)
			self.processFlightList();
			self.changeSortingCallback && self.changeSortingCallback();
			return true;
		};
		
		self.activeFilterOptionsCount = ko.computed(function() {			
			var filterOptionsCount = 0;
			filterOptionsCount += self.filterData.stopFilterOptions().length > 1 ? 1 : 0;
			filterOptionsCount += self.filterData.airlineFilterOptions().length > 1 ? 1 : 0;
			filterOptionsCount += self.filterData.originAirportFilterOptions().length > 1 ? 1 : 0;
			filterOptionsCount += self.filterData.destinationAirportFilterOptions().length > 1 ? 1 : 0;
			
			return filterOptionsCount;
		}, self);
		
		self.filterData.selectedStopFilters.subscribe(function() {
			if(self.processFlightList){
				self.processFlightList();
			}
		}, null, "arrayChange");

		self.filterOptionClicked = function() {
			self.processFlightList();
			return true;
		};

		self.processFlightList = function() {
			
			var filterUtil = flightFilterUtil(self.filterData, self.timeframe);
			
			var sortUtil = flightSortUtil(self.sortData);

			var visibilityUtil = flightVisibilityUtil(filterUtil);
	
			if(self.filterData.optionFiltersAvailable() || self.filterData.timeRangeFiltersAvailable()){
				underscore.each(self.processedFlightList(), visibilityUtil.computeVisibility);
			}
			
			self.processedFlightList.valueHasMutated()
			
			switch (self.sortData.selectedSortKey()) {

			case 'segmentcount':
				var sortList;
				self.processedFlightList.sort(function(a, b) {
					if(self.sortData.selectedSortDirection() < 0)
						sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(b,a);
					else
						sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(a,b);
					return sortList;
				});
				break;

			case 'departuretime':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByDeparture(a,b) || sortUtil.compareByArrival(a,b);
				});
				break;

			case 'arrivaltime':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByArrival(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;

			case 'duration':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByDuration(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;
				
			case 'price':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByPrice(a,b) || sortUtil.compareByDeparture(a,b);
				});

				break;
			}
			
			underscore.each(self.processedFlightList(), function(value, index) {
				value.index = index;
			});
		};

		self.processFlightList();
		
	}

	function FlightListPanelMultiCity(sortData, filterData, flightDay, holder, index){

		var self = this;
		
		self.hasNoFlight = ko.observable(flightDay.hasNoFlight);
		
		self.availabilityWarnings = flightDay.availabilityWarnings ? flightDay.availabilityWarnings : ko.observable(false);
		
		
		self.navigateToPreviousDayEnabled = !flightDay.onTimeRangeBeginning;
		self.navigateToNextDayEnabled = !flightDay.onTimeRangeEnd;
		
		self.selectedSection = ko.observable(emptyCFFSection);

		self.selectedPaymentCurrency = ko.observable(flightDay.originalCurrency.code);

		showAllWarnings(index);
		
		self.showMoreFlag = ko.observable(false);
		self.showMore = function() {
			self.showMoreFlag(!self.showMoreFlag());
		}
		
	    self.changeSelectedSection = function (section) {
	    	
			var sameSectionClicked = self.selectedSection().name == section.name;
			
			if (sameSectionClicked) {
				self.selectedSection().isActive(!self.selectedSection().isActive());
				return true;
			}
			
			self.selectedSection().isActive(false);
			self.selectedSection(section);
			self.selectedSection().isActive(true);
			return true;
			
		}; 
		
		 
		self.sections = ko.observableArray(generateCFFSections(flightDay.fareCategories));
		
    	self.selectedSection(findInitialCFFSection(self.sections(), false, flightDay.initialCFFCode, flightDay.initialFFCode));
    	
		self.selectedFareBasisCode = ko.computed(function() {
			
			var section = self.selectedSection;
			
			if (section && section() && section().selectedOption && section().selectedOption() && section().selectedOption().subCategoryCode) {
				return section().selectedOption().subCategoryCode;
			}
			
			return '';

		});	
		
		
		self.index = ko.observable(index);
		self.hotelEligibilityForSelectedSegment = ko.observable(false);
		
		self.getHotelInstanbulEligibilityForSelectedFlight = function() {
			return false;
		}

		self.sortData = sortData;
		self.filterData = filterData;
		
		var flightsToList = flightDay.flights;
		
		self.processedFlightList = ko.observableArray(flightsToList);
		
		//SET PANEL DEFINITIONS		
		self.origin = ko.observable(flightDay.originLocationCode);
		self.originLocationCode = ko.observable(flightDay.originLocationCode);
		self.originationDateTime = ko.observable(flightDay.dateOfDay);	
		self.destination = ko.observable(flightDay.destinationLocationCode);
		self.destinationLocationCode = ko.observable(flightDay.destinationLocationCode);
		self.timeframe = ko.observable(flightDay.timeframe) ;
		self.filterData.optionFiltersAvailable = ko.observable(flightDay.minimumFlightCountForOptionsFilteringReached);
		self.filterData.timeRangeFiltersAvailable = ko.observable(flightDay.minimumFlightCountForTimeRangeFilteringReached);

		self.fareFamilyFallBackListMap = flightDay.fareFamilyFallBackListMap;

		//SELECTED FLIGHT
		self.selectedFlight = ko.observable('');		

		self.selectedFlightExists = ko.computed(function() {
			return self.selectedFlight && self.selectedFlight() != '';
		});

		self.updateSelectedFlight = function(flight, scrollValue, event, scrollEl) {
			var i;
			flight.fareRulesLinkVisibility ? flight.fareRulesLinkVisibility(true) :(flight.fareRulesLinkVisibility = ko.observable(true));
			flight.showFareRules ? flight.showFareRules(false) :(flight.showFareRules = ko.observable(false));
			flight.fareRulesData ? flight.fareRulesData('') : (flight.fareRulesData = ko.observable(''));
			if(!flight.showItineraryDetails){
				flight.showItineraryDetails= ko.observable(false);
			}else{
				flight.showItineraryDetails(false);
			}
			
			if (flight) {
				flight.availableFlightFare.preferedFareBasisCode = flight.priceForSelectedFareBasisCode().code;
				showToast('success', 'Label-Genel-101');
				
				if(!holder.mixcabinAllowed && flight.priceForSelectedFareBasisCode().showingFallBackPrice) {

					var fareFamily = flight.priceForSelectedFareBasisCode().code;
					var newOption;
					var newSection = underscore.find(holder.sections(), function(section) {
						var tempOption = underscore.find(section.options(), function(option) {
							return option.subCategoryCode == fareFamily;
						});
						if(tempOption) {
							newOption = tempOption;
						}
						return tempOption;
					});
					if(holder.selectedSection().value() != newSection.value()) {
						holder.changeSelectedSection(newSection);
					}
					
					if(holder.selectedSection().selectedOption() != fareFamily) {
						holder.selectedSection().changeSelectedOption(newOption);
					}

					for(i= 0; i< holder.flightListPanelArray().length; i++){
						var panel = holder.flightListPanelArray()[i];
						if(panel.selectedFlight() && panel.selectedFlight().availableFlightFare.preferedFareBasisCode != fareFamily) {
							panel.selectedFlight().availableFlightFare.preferedFareBasisCode = fareFamily;
						}
					}
				}
			} else {
				checkForFixedPriceBar();
			}
			
			try {
				flight && self.updateSelectedFlightCallback && self.updateSelectedFlightCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}

			self.selectedFlight(flight);
			
			showAllWarnings(index);
			self.showMoreFlag(false);
			self.showMore = function() {
				self.showMoreFlag(!self.showMoreFlag());
			}

			if(scrollValue && !scrollEl){
				self.scrollPage(scrollValue);					
			}			
			if(scrollEl) {
				var el = $(scrollEl);
				scrollToEl(el, undefined, 0);
			}

			try {
				flight && self.showFareRulesManuallyCallback && self.showFareRulesManuallyCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}
		};
		
		self.scrollPage = function(scrollValue){	
			$('html, body').animate({
			    scrollTop: scrollValue,
			    scrollLeft: 0
			}, 1000);
			
		};
		
		//TIME RANGE SLIDER EVENTS
		self.filterData.timeRangeStartValue.subscribe(function() {
			if(self.processFlightList){
				self.processFlightList();
			}
		});
		
		self.filterData.timeRangeEndValue.subscribe(function() {
			if(self.processFlightList){
				self.processFlightList();
			}
		});
		
		self.filterData.selectedStopFilters.subscribe(function() {
			if(self.processFlightList){
				self.processFlightList();
			}
		}, null, "arrayChange");
		
		underscore.each(flightsToList, function(value) {
			value.visible = ko.observable(true);
			value.showDetails = ko.observable(false);
			value.activeItemTab = ko.observable('');
			value.bookingPriceTagHolder.priceTags = underscore.sortBy(value.bookingPriceTagHolder.priceTags , function(priceTag){ return priceTag.convertedPrices["ORIGINAL_PRICE"].amount; });

			value.priceForSelectedFareBasisCode = ko.computed(function() {

				self.selectedFareBasisCodeDynamic = holder.mixcabinAllowed ? self.selectedFareBasisCode() : holder.selectedFareBasisCode();

				var priceForSelectedFareBasisCode = '';
				
				if(!this.selectedFareBasisCodeDynamic){
					return priceForSelectedFareBasisCode;
				}
				
				priceForSelectedFareBasisCode = underscore.find(value.bookingPriceTagHolder.priceTags, function(priceTag) { return priceTag.code == this }, self.selectedFareBasisCodeDynamic);
				
				if (priceForSelectedFareBasisCode) {
					priceForSelectedFareBasisCode.showingFallBackPrice = false;
					return priceForSelectedFareBasisCode;
				}
				
				//NO PRICE FOUND USE FALLBACK PRICES
				var fareFamilyFallBackList = self.fareFamilyFallBackListMap[this.selectedFareBasisCodeDynamic];
				
				if (fareFamilyFallBackList && fareFamilyFallBackList.length) {
					var fareFamilyCodeToFallback = underscore.find(fareFamilyFallBackList, function(fareFamilyCode) {  return underscore.any(value.bookingPriceTagHolder.priceTags, function(priceTag) { return priceTag.code == fareFamilyCode }) });
					priceForSelectedFareBasisCode = underscore.find(value.bookingPriceTagHolder.priceTags, function(priceTag) { return priceTag.code == fareFamilyCodeToFallback });
				}				

				if (priceForSelectedFareBasisCode) {
					priceForSelectedFareBasisCode.showingFallBackPrice = true;
					priceForSelectedFareBasisCode.selectedFareBasisCode = this.selectedFareBasisCodeDynamic;
					return priceForSelectedFareBasisCode;
				}
				
				return '';
				
			},self);
			
			value.hasPriceForSelectedFareBasisCode = ko.computed(function() {
				return value.priceForSelectedFareBasisCode() != '';
			});
			
			
			value.remainingSeatsInfoForSelectedFareBasisCode = ko.computed(function() {
				
				var remainingSeatsInfoForSelectedFareBasisCode = 0;
				
				if(value.hasPriceForSelectedFareBasisCode()) {
					for (var property in value.firstSegment.remainingSeats) {
						if (value.firstSegment.remainingSeats.hasOwnProperty(property)) {
							if(property == value.priceForSelectedFareBasisCode().code){
								remainingSeatsInfoForSelectedFareBasisCode = value.firstSegment.remainingSeats[property];	
							}
						}
					}
				}
				
				return remainingSeatsInfoForSelectedFareBasisCode;
				
			});
			
			self.processedFlightListVisibleFlightsLength = ko.computed(function(){
				return underscore.reduce(self.processedFlightList(), function(length, flight){ return length + ( (flight.visible && flight.visible()) ? 1 : 0 ) }, 0);
			});
			
			value.hasISODT = underscore.all(value.segments, function(segment) {
				return segment.arrivalDateTimeISO && segment.departureDateTimeISO;
			});

			value.routeIndex = index;

		});
		
		
		self.toggleFlightSingle=function(flight){
			underscore.each(flightsToList, function(value) {
				if(flight == value){
					value.showDetails(!value.showDetails());
				} else {
					value.showDetails(false);
				}
			});
		};
		
		self.toggleFlightMultiple=function(flight){
			underscore.each(flightsToList, function(value) {
				if(flight == value){
					value.showDetails(!value.showDetails());
				}
			});
		};
		
		
		var sortOptiontext = '';
		if( 0 < self.sortData.sortOptions().length) {
			underscore.each(self.sortData.sortOptions(), function(value) {
				if(self.sortData.selectedSortKey() == value.value) {
					sortOptiontext = value.text;
				}
			});
		}
		self.selectedSortOptionText= ko.observable(sortOptiontext);
		
		self.showSortDirection = ko.observable(false);
		self.sortOptionClicked = function(clickedOption, event) {
			var dir = $(event.target).data('direction');
			dir && (dir = parseInt(dir))
			if(dir){
				self.sortData.selectedSortKey(clickedOption.value);
				self.sortData.selectedSortDirection(dir);
			}else{
				if (self.sortData.selectedSortKey() === clickedOption.value) {
					self.sortData.selectedSortDirection(-self.sortData.selectedSortDirection());
				} else {
					self.sortData.selectedSortKey(clickedOption.value);
					self.sortData.selectedSortDirection(1);
				}
			}
		    (/price|duration/.test(clickedOption.value) ? self.showSortDirection(true):self.showSortDirection(false));
			self.selectedSortOptionText(clickedOption.text)
			self.processFlightList();
			self.changeSortingCallback && self.changeSortingCallback();
			return true;
		};
		
		self.filterOptionClicked = function() {
			self.processFlightList();
			return true;
		};
		
		self.processFlightList = function() {
			
			var filterUtil = flightFilterUtil(self.filterData, self.timeframe);
			
			var sortUtil = flightSortUtil(self.sortData);
			
			var visibilityUtil = flightVisibilityUtil(filterUtil);
	
			if(self.filterData.optionFiltersAvailable() || self.filterData.timeRangeFiltersAvailable()){
				underscore.each(self.processedFlightList(), visibilityUtil.computeVisibility);
			}

			switch (self.sortData.selectedSortKey()) {

			case 'segmentcount':
				var sortList;
				self.processedFlightList.sort(function(a, b) {
					if(self.sortData.selectedSortDirection() < 0)
						sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(b,a);
					else
						sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(a,b);
					return sortList;
				});
				break;

			case 'departuretime':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByDeparture(a,b) || sortUtil.compareByArrival(a,b);
				});
				break;

			case 'arrivaltime':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByArrival(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;

			case 'duration':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByDuration(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;
				
			case 'price':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByPrice(a,b) || sortUtil.compareByDeparture(a,b);
				});

				break;
			}
			
			underscore.each(self.processedFlightList(), function(value, index) {
				value.index = index;
			});

		};
		
		self.updateInitialSelectedFlight = function() {
			if (flightDay.initialSelectedFlightNumber && self.selectedSection() && self.selectedSection().value && self.selectedSection().selectedOption()) {

				var initialFlight = underscore.find(self.processedFlightList(), function(flight) {
						var flightNumbersAppended = underscore.pluck(flight.segments, 'flightNumber').join('');
						return flightNumbersAppended == this;
					}, flightDay.initialSelectedFlightNumber);

				if (initialFlight && initialFlight.visible() && initialFlight.hasPriceForSelectedFareBasisCode()){
					self.updateSelectedFlight(initialFlight);
				}
			}
		};
		
		self.processFlightList();
		self.updateInitialSelectedFlight();
		self.full = !self.hasNoFlight() && underscore.all(self.processedFlightList(), function(flight){return flight.full;});
	}

	function FlightListPanelMultiCityHolder(data, selectedFlightsIndexList,isChangeFlight){
	
		var self = this;

		self.availabilityMultiCityResponse = ko.observable(data);
				
		self.pricesVisible = isChangeFlight ? false : !self.availabilityMultiCityResponse().amadeusResponse;
		
		self.mixcabinAllowed = !self.availabilityMultiCityResponse().amadeusResponse && !isChangeFlight;
		
		self.selectedSection = ko.observable(emptyCFFSection);

		self.selectedPaymentCurrency = ko.observable(data.routes.length ? data.routes[0].days[0].originalCurrency.code : 'ORIGINAL_PRICE');

	    self.changeSelectedSection = function (section) {
	    	
			var sameSectionClicked = self.selectedSection().name == section.name;
			
			if (sameSectionClicked) {
				self.selectedSection().isActive(!self.selectedSection().isActive());
				return true;
			}
			
			self.selectedSection().isActive(false);
			self.selectedSection(section);
			self.selectedSection().isActive(true);
			return true;
			
		};
		
		
		self.sections = ko.observableArray(generateCFFSections(data.fareCategories));
		
		var initialFFCode = (self.mixcabinAllowed || !data.routes.length) ? '' : data.routes[0].days[0].initialFFCode;

    	self.selectedSection(findInitialCFFSection(self.sections(), false, self.availabilityMultiCityResponse().bookingRequest.selectedCabinClass, initialFFCode));
    	
		self.selectedFareBasisCode = ko.computed(function() {
			
			var section = self.selectedSection;
			
			if (section && section() && section().selectedOption && section().selectedOption() && section().selectedOption().subCategoryCode) {
				return section().selectedOption().subCategoryCode;
			}
			
			return '';

		}).extend({ throttle: 1 });	
    	
    	
    	self.sortSelections = ko.observableArray();
    	self.filterSelections = ko.observableArray();
    	self.sortSelections(self.availabilityMultiCityResponse().bookingRequest.sortSelections);
    	self.filterSelections(self.availabilityMultiCityResponse().bookingRequest.filterSelections);
    	
		self.flightListPanelArray = ko.observableArray();
				
		for (var routeIndex = 0; routeIndex < data.routes.length; routeIndex++) {
			
			var route = data.routes[routeIndex];
			
			if(route.days.length == 0) {
				self.flightListPanelArray.push({noflights:true, selectedFlightExists: ko.observable(false)});
				continue;
			}
			
			var flightDay = route.days[0];
			
			
			var flightPanelIndex = routeIndex;
			if(selectedFlightsIndexList) {
				var selectedFlightIndex = selectedFlightsIndexList[routeIndex];
				if(selectedFlightIndex) {
					flightPanelIndex = selectedFlightIndex;
				}
			}
			
			var currentBooking = self.availabilityMultiCityResponse().bookingRequest.bookings[routeIndex];
			
			var filterData = FilterDataFromFlightDay(flightDay, currentBooking.filters);
			
			if(self.filterSelections() && self.filterSelections().length > 0 && self.filterSelections()[routeIndex]){
				
				filterData.panelVisible(self.filterSelections()[routeIndex].panelVisible);								
				filterData.stopFilterOptions(self.filterSelections()[routeIndex].stopFilterOptions);
				filterData.selectedStopFilters(self.filterSelections()[routeIndex].selectedStopFilters);
				filterData.airlineFilterOptions(self.filterSelections()[routeIndex].airlineFilterOptions);
				filterData.optionFiltersAvailable(self.filterSelections()[routeIndex].optionFiltersAvailable);
				filterData.selectedAirlineFilters(self.filterSelections()[routeIndex].selectedAirlineFilters);
				filterData.timeRangeFiltersAvailable(self.filterSelections()[routeIndex].timeRangeFiltersAvailable);
				filterData.originAirportFilterOptions(self.filterSelections()[routeIndex].originAirportFilterOptions);
				filterData.selectedOriginAirportFilters(self.filterSelections()[routeIndex].selectedOriginAirportFilters);								
				filterData.destinationAirportFilterOptions(self.filterSelections()[routeIndex].destinationAirportFilterOptions);
				filterData.selectedDestinationAirportFilters(self.filterSelections()[routeIndex].selectedDestinationAirportFilters);							
				
			}else{								
				self.filterSelections([]);
				self.filterSelections().push(filterData);
			}
			
			var sortData = data.travelType=="AMADEUS" ? GenerateMulticitySortData(): GenerateDefaultSortData();
			
			if(sortData.sortOptions()[0].value != 'segmentcount' &&
				self.sortSelections()[routeIndex] != 'segmentcount' &&
					self.sortSelections().length > 0) {
				sortData.selectedSortKey(self.sortSelections()[routeIndex]);
			}

			var flightListPanel = new FlightListPanelMultiCity(sortData, filterData, flightDay, self, flightPanelIndex);

			self.flightListPanelArray.push(flightListPanel);
			
		}
	    
		self.flightListPanelArrayAllFlightsSelected = ko.pureComputed(function() {
			
			if (underscore.isEmpty(self.flightListPanelArray())) {
				return false;
			}

			return underscore.all(self.flightListPanelArray(), function(panel) { return panel.selectedFlightExists() });
		}).extend({ rateLimit: 10 });
		
		self.flightListPanelArrayNoFlightSelected = ko.computed(function() {
			
			if (underscore.isEmpty(self.flightListPanelArray())) {
				return true;
			}

			return underscore.all(self.flightListPanelArray(), function(panel) { return !panel.selectedFlightExists() });
			
		});
		
		self.selectedFlights = function() {
			
			var selectedFlights = [];
			
			if(self.flightListPanelArray && self.flightListPanelArray().length){
				ko.utils.arrayForEach(self.flightListPanelArray(), function(panel){
					selectedFlights.push(panel.selectedFlight());
                });	
			}

			return selectedFlights;
			
		};
		
		
		self.airTravelers = function() {
			
			var airTravelers = [];
			
			var paxList = self.availabilityMultiCityResponse().bookingRequest.bookings[0].paxList;
			
			for (var paxIndex = 0; paxIndex < paxList.length; paxIndex++) {
				var pax = paxList[paxIndex];
				airTravelers.push({ 'code' : pax.code , 'quantity' : pax.count });
			}

			return airTravelers;
			
		};

		self.scrollToChangeSelectedFareCategory = function () {
			$('html, body').animate({
			    scrollTop: 0,
			    scrollLeft: 0
			}, 1000);
		};
		
	}
	
	function FlightListPanelBrandedMultiCity(sortData, filterData, flightDay, holder, index, selectedFlightCabinClass, reissueTripType){
		var self = this;
		
		self.hasNoFlight = ko.observable(flightDay.hasNoFlight);
		self.availabilityWarnings = flightDay.availabilityWarnings ? flightDay.availabilityWarnings : ko.observable(false);
		
		self.navigateToPreviousDayEnabled = !flightDay.onTimeRangeBeginning;
		self.navigateToNextDayEnabled = !flightDay.onTimeRangeEnd;
		
		self.selectedPaymentCurrency = ko.observable(flightDay.originalCurrency.code);
		showAllWarnings(index);
		self.showMoreFlag = ko.observable(false);
		
		self.showMore = function() {
			self.showMoreFlag(!self.showMoreFlag());
		}
		
		self.index = ko.observable(index);
		self.hotelEligibilityForSelectedSegment = ko.observable(false);
		
		self.getHotelInstanbulEligibilityForSelectedFlight = function() {
			return false;
		}
		
		self.reissueTripType = ko.observable(reissueTripType);

		self.sortData = sortData;
		self.filterData = filterData;
		
		var flightsToList = flightDay.flights;
		self.processedFlightList = ko.observableArray(flightsToList);
		
		//SET PANEL DEFINITIONS		
		self.origin = ko.observable(flightDay.originLocationCode);
		self.originLocationCode = ko.observable(flightDay.originLocationCode);
		self.originationDateTime = ko.observable(flightDay.dateOfDay);	
		self.destination = ko.observable(flightDay.destinationLocationCode);
		self.destinationLocationCode = ko.observable(flightDay.destinationLocationCode);
		self.timeframe = ko.observable(flightDay.timeframe) ;
		self.filterData.optionFiltersAvailable = ko.observable(flightDay.minimumFlightCountForOptionsFilteringReached);
		self.filterData.timeRangeFiltersAvailable = ko.observable(flightDay.minimumFlightCountForTimeRangeFilteringReached);

		self.fareFamilyFallBackListMap = flightDay.fareFamilyFallBackListMap;

		//SELECTED FLIGHT
		self.selectedFlight = ko.observable('');		

		self.selectedFlightExists = ko.computed(function() {
			return self.selectedFlight && self.selectedFlight() != '';
		});

		self.updateSelectedFlight = function(flight, brandCode, cabinClass, subcategory) {
			var i;
			
			flight.fareRulesLinkVisibility ? flight.fareRulesLinkVisibility(true) :(flight.fareRulesLinkVisibility = ko.observable(true));
			flight.showFareRules ? flight.showFareRules(false) :(flight.showFareRules = ko.observable(false));
			flight.fareRulesData ? flight.fareRulesData('') : (flight.fareRulesData = ko.observable(''));
			
			if(!flight.showItineraryDetails){
				flight.showItineraryDetails= ko.observable(false);
			} else{
				flight.showItineraryDetails(false);
			}
			
			if(flight.availabilityData) {
				var flightDayForMultiCity = undefined;
				
				if(subcategory){
					flightDayForMultiCity = subcategory.flightDayForMultiCity;
				}
				
				flight.availabilityData.selectedFareInfo = {
					brandCode: brandCode,
					cabinClass: cabinClass,
					flightDayForMultiCity: flightDayForMultiCity
				}
				
				var firstSelectableBrand = getFirstSelectableBrand(flight.availabilityData.fareCategories, selectedFlightCabinClass);
				var firstSelectableBrandFlightDay = firstSelectableBrand.flightDayForMultiCity;
				
				if(self.reissueTripType() == 'MULTI_CITY'){
					if(flight.availabilityData.selectedFareInfo.flightDayForMultiCity != null){ //multicity cevabi gelmistir ve son ucus henuz secilmemistir
						holder.addNewPanel(flightDayForMultiCity);
					} else if(flight.availabilityData.selectedFareInfo.brandCode == undefined
								&& flight.availabilityData.selectedFareInfo.cabinClass == undefined){ //irr senaryo
						
						flight.availabilityData.selectedFareInfo.brandCode = firstSelectableBrand.brandCode;
						flight.availabilityData.selectedFareInfo.cabinClass = selectedFlightCabinClass;
						
						if(firstSelectableBrandFlightDay != null){
							flight.availabilityData.selectedFareInfo.flightDayForMultiCity = firstSelectableBrandFlightDay;
							holder.addNewPanel(firstSelectableBrandFlightDay);
						}
					}					
				}
				
				if(self.reissueTripType() == 'ROUND_TRIP'){ //roundtrip reissue da singlecity cevabı gelmistir
					if(flight.availabilityData.selectedFareInfo.brandCode == undefined
							&& flight.availabilityData.selectedFareInfo.cabinClass == undefined){ //irr senaryo
						
						flight.availabilityData.selectedFareInfo.brandCode = firstSelectableBrand.brandCode;
						flight.availabilityData.selectedFareInfo.cabinClass = selectedFlightCabinClass;
						
						subcategory = firstSelectableBrand;
					}
					
					if(holder.flightListPanelArray().length == 1){ // ilk secim sonrasi donus icin subsequente cikilmasi gerekmektedir
						holder.subsequent(flight, subcategory);
					}
				} 
				
				if(self.reissueTripType() == 'ONE_WAY'){ //reissue da tek ucus ya da rt olmayan 2 ucus icin degisiklik yapiliyordur
					if(flight.availabilityData.selectedFareInfo.brandCode == undefined
							&& flight.availabilityData.selectedFareInfo.cabinClass == undefined){ //irr senaryo
						
						flight.availabilityData.selectedFareInfo.brandCode = firstSelectableBrand.brandCode;
						flight.availabilityData.selectedFareInfo.cabinClass = selectedFlightCabinClass;
					}
				}
			}
			
			/* SECILI UCUSU DEGISTIRME BUTONUNA TIKLANMISTIR */
			if(!flight || flight == ''){
				holder.updatePanelArray(self.index()); 
			}
			/* -- */
			
			if(flight){
				showToast('success', 'Label-Genel-101');
			} else{
				checkForFixedPriceBar();
			}
			
			try {
				flight && self.updateSelectedFlightCallback && self.updateSelectedFlightCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}

			self.selectedFlight(flight);
			
			showAllWarnings(index);
			self.showMoreFlag(false);
			
			self.showMore = function() {
				self.showMoreFlag(!self.showMoreFlag());
			}

			try {
				flight && self.showFareRulesManuallyCallback && self.showFareRulesManuallyCallback(self.index(), flight);
			} catch (e) {
				console.log(e);
			}
		};
		
		self.scrollPage = function(scrollValue){	
			$('html, body').animate({
			    scrollTop: scrollValue,
			    scrollLeft: 0
			}, 1000);
			
		};
		
		//TIME RANGE SLIDER EVENTS
		self.filterData.timeRangeStartValue.subscribe(function() {
			if(self.processFlightList){
				self.processFlightList();
			}
		});
		
		self.filterData.timeRangeEndValue.subscribe(function() {
			if(self.processFlightList){
				self.processFlightList();
			}
		});
		
		self.filterData.selectedStopFilters.subscribe(function() {
			if(self.processFlightList){
				self.processFlightList();
			}
		}, null, "arrayChange");
		
		self.emptyEcoCabin = ko.observable(false);
		self.emptyBusCabin = ko.observable(false);
		var busCount = 0, ecoCount = 0;
		
		underscore.each(flightsToList, function(value) {
			value.visible = ko.observable(true);
			value.showDetails = ko.observable(false);
			value.activeItemTab = ko.observable('');

//			TODO: kütüphane bu bilgiyi donmuyor, guncelleme gerekebilir
//			value.remainingSeatsInfoForSelectedFareBasisCode = ko.computed(function() {
//				var remainingSeatsInfoForSelectedFareBasisCode = 0;
//				return remainingSeatsInfoForSelectedFareBasisCode;
//			});
			
			value.hasPriceForSelectedFareBasisCode = ko.computed(function() {
				return false;
			});
			
			self.processedFlightListVisibleFlightsLength = ko.computed(function(){
				return underscore.reduce(self.processedFlightList(), function(length, flight){ return length + ( (flight.visible && flight.visible()) ? 1 : 0 ) }, 0);
			});
			
			value.hasISODT = underscore.all(value.segments, function(segment) {
				return segment.arrivalDateTimeISO && segment.departureDateTimeISO;
			});
			
			var Economy = value.availabilityData.fareCategories.ECONOMY;
			var Business = value.availabilityData.fareCategories.BUSINESS;
			
			findFirstSelectableSubcategory(Economy) != null && ecoCount++;
			findFirstSelectableSubcategory(Business) != null && busCount++;
			
			value.routeIndex = index;
		});
		
		self.toggleFlightSingle=function(flight){
			underscore.each(flightsToList, function(value) {
				if(flight == value){
					value.showDetails(!value.showDetails());
				} else{
					value.showDetails(false);
				}
			});
		};
		
		self.toggleFlightMultiple=function(flight){
			underscore.each(flightsToList, function(value) {
				if(flight == value){
					value.showDetails(!value.showDetails());
				}
			});
		};
		
		var sortOptiontext = '';
		
		if(0 < self.sortData.sortOptions().length) {
			underscore.each(self.sortData.sortOptions(), function(value) {
				if(self.sortData.selectedSortKey() == value.value) {
					sortOptiontext = value.text;
				}
			});
		}
		
		self.selectedSortOptionText= ko.observable(sortOptiontext);
		self.showSortDirection = ko.observable(false);
		
		self.sortOptionClicked = function(clickedOption, event) {
			var dir = $(event.target).data('direction');
			dir && (dir = parseInt(dir))
			
			if(dir){
				self.sortData.selectedSortKey(clickedOption.value);
				self.sortData.selectedSortDirection(dir);
			} else{
				if(self.sortData.selectedSortKey() === clickedOption.value) {
					self.sortData.selectedSortDirection(-self.sortData.selectedSortDirection());
				} else{
					self.sortData.selectedSortKey(clickedOption.value);
					self.sortData.selectedSortDirection(1);
				}
			}
			
		    (/price|duration/.test(clickedOption.value) ? self.showSortDirection(true):self.showSortDirection(false));
		    
			self.selectedSortOptionText(clickedOption.text)
			self.processFlightList();
			self.changeSortingCallback && self.changeSortingCallback();
			
			return true;
		};
		
		self.filterOptionClicked = function() {
			self.processFlightList();
			return true;
		};
		
		self.processFlightList = function() {
			var filterUtil = flightFilterUtil(self.filterData, self.timeframe);
			var sortUtil = flightSortUtil(self.sortData);
			var visibilityUtil = flightVisibilityUtil(filterUtil);
	
			if(self.filterData.optionFiltersAvailable() || self.filterData.timeRangeFiltersAvailable()){
				underscore.each(self.processedFlightList(), visibilityUtil.computeVisibility);
			}

			switch (self.sortData.selectedSortKey()) {

			case 'segmentcount':
				var sortList;
				self.processedFlightList.sort(function(a, b) {
					if(self.sortData.selectedSortDirection() < 0)
						sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(b,a);
					else
						sortList = sortUtil.compareBySegmentCount(a,b) || sortUtil.compareByDeparture(a,b);
					return sortList;
				});
				break;

			case 'departuretime':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByDeparture(a,b) || sortUtil.compareByArrival(a,b);
				});
				break;

			case 'arrivaltime':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByArrival(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;

			case 'duration':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByDuration(a,b) || sortUtil.compareByDeparture(a,b);
				});
				break;
				
			case 'price':
				self.processedFlightList.sort(function(a, b) {
					return sortUtil.compareByPrice(a,b) || sortUtil.compareByDeparture(a,b);
				});

				break;
			}
			
			underscore.each(self.processedFlightList(), function(value, index) {
				value.index = index;
			});

		};
		
		self.processFlightList();
		self.full = !self.hasNoFlight() && underscore.all(self.processedFlightList(), function(flight){return flight.full;});
	}

	function FlightListPanelBrandedMultiCityHolder(data, selectedFlightsIndexList, selectedFlightsCabinClasses, isChangeFlight,callbacks){
		var self = this;

		self.availabilityMultiCityResponse = ko.observable(data);
		self.pricesVisible = isChangeFlight ? false : self.availabilityMultiCityResponse().amadeusResponse;
		self.mixcabinAllowed = !self.availabilityMultiCityResponse().amadeusResponse && !isChangeFlight;
		self.selectedSection = ko.observable(emptyCFFSection);
		self.selectedPaymentCurrency = ko.observable(data.routes.length ? data.routes[0].days[0].originalCurrency.code : 'ORIGINAL_PRICE');

    	self.sortSelections = ko.observableArray();
    	self.filterSelections = ko.observableArray();
    	self.sortSelections(self.availabilityMultiCityResponse().bookingRequest.sortSelections);
    	self.filterSelections(self.availabilityMultiCityResponse().bookingRequest.filterSelections);
    	
		self.flightListPanelArray = ko.observableArray();
		self.flightListPanelArray.extend({ rateLimit: 50 });
				
		self.addNewPanel = function(flightDayForMultiCity){
			var flightPanelIndex;
			var routeIndex;

			if(self.flightListPanelArray() && self.flightListPanelArray().length){
				var lastPanel = self.flightListPanelArray()[self.flightListPanelArray().length - 1];
				var lastPanelIndex;

				if(lastPanel && selectedFlightsIndexList && selectedFlightsIndexList.length) { // reissue akisi
					lastPanelIndex = selectedFlightsIndexList.indexOf(lastPanel.index());
					
					if(lastPanelIndex != undefined){
						flightPanelIndex = selectedFlightsIndexList[parseInt(lastPanelIndex) + 1];
						routeIndex =  selectedFlightsIndexList.indexOf(flightPanelIndex);
					}
				} else if(lastPanel){ // biletleme akisi
					flightPanelIndex = parseInt(lastPanel.index()) + 1;
					routeIndex = flightPanelIndex;
				}
			} else{
				flightPanelIndex = isChangeFlight ? selectedFlightsIndexList[0] : 0;
				routeIndex =   isChangeFlight ? selectedFlightsIndexList.indexOf(flightPanelIndex) : flightPanelIndex;
			}

			var currentBooking = self.availabilityMultiCityResponse().bookingRequest.bookings[routeIndex];
			var filterData = FilterDataFromFlightDay(flightDayForMultiCity, currentBooking.filters);
			
			if(self.filterSelections() && self.filterSelections().length > 0 && self.filterSelections()[routeIndex]){
				filterData.panelVisible(self.filterSelections()[routeIndex].panelVisible);								
				filterData.stopFilterOptions(self.filterSelections()[routeIndex].stopFilterOptions);
				filterData.selectedStopFilters(self.filterSelections()[routeIndex].selectedStopFilters);
				filterData.airlineFilterOptions(self.filterSelections()[routeIndex].airlineFilterOptions);
				filterData.optionFiltersAvailable(self.filterSelections()[routeIndex].optionFiltersAvailable);
				filterData.selectedAirlineFilters(self.filterSelections()[routeIndex].selectedAirlineFilters);
				filterData.timeRangeFiltersAvailable(self.filterSelections()[routeIndex].timeRangeFiltersAvailable);
				filterData.originAirportFilterOptions(self.filterSelections()[routeIndex].originAirportFilterOptions);
				filterData.selectedOriginAirportFilters(self.filterSelections()[routeIndex].selectedOriginAirportFilters);								
				filterData.destinationAirportFilterOptions(self.filterSelections()[routeIndex].destinationAirportFilterOptions);
				filterData.selectedDestinationAirportFilters(self.filterSelections()[routeIndex].selectedDestinationAirportFilters);							
			} else{								
				self.filterSelections([]);
				self.filterSelections().push(filterData);
			}
			
			var sortData = data.travelType=="AMADEUS" ? GenerateMulticitySortData() : GenerateDefaultSortData();
			
			if(sortData.sortOptions()[0].value != 'segmentcount' && self.sortSelections()[routeIndex] != 'segmentcount' && self.sortSelections().length > 0) {
				sortData.selectedSortKey(self.sortSelections()[routeIndex]);
			}			
			
			var selectedFlightCabinClass = null;

			if(isChangeFlight && flightPanelIndex){
				selectedFlightCabinClass = selectedFlightsCabinClasses[selectedFlightsIndexList.indexOf(flightPanelIndex)];
			}

			var flightListPanel = new FlightListPanelBrandedMultiCity(sortData, filterData, flightDayForMultiCity, self, flightPanelIndex, selectedFlightCabinClass, data.tripType);
			
			if(callbacks){
				flightListPanel.searchForFareBreakdownCallback = callbacks.searchForFareBreakdownCallback;
			}

			self.flightListPanelArray.push(flightListPanel);
			
			setTimeout(function(){
				var el = $('#panelHeader_' + flightPanelIndex);
				if(el && el.length > 0){
					scrollToEl(el);
				}
			}, 500);
		}
	    
		self.flightListPanelArrayAllFlightsSelected = ko.pureComputed(function() {
			if (underscore.isEmpty(self.flightListPanelArray())) {
				return false;
			}
			
			/* MULTI CITY CEVABI ISE */
			var lastPanel = self.flightListPanelArray()[self.flightListPanelArray().length - 1];
			
			if(lastPanel.selectedFlight() && lastPanel.selectedFlight().availabilityData.selectedFareInfo != null
					&& lastPanel.selectedFlight().availabilityData.selectedFareInfo.flightDayForMultiCity != null){
				
				return false;
			}
			/* -- */
			
			/* BU SENARYODA HENUZ SUBSEQUENT CAGIRILMAMISTIR */
			if(data.tripType == 'ROUND_TRIP' && self.flightListPanelArray().length != 2){
				return false;
			}
			/* -- */

			return underscore.all(self.flightListPanelArray(), function(panel) { return panel.selectedFlightExists() });
		}).extend({ rateLimit: 50 });
		
		self.flightListPanelArrayNoFlightSelected = ko.computed(function() {
			if (underscore.isEmpty(self.flightListPanelArray())) {
				return true;
			}

			return underscore.all(self.flightListPanelArray(), function(panel) { return !panel.selectedFlightExists() });
		});
		
		self.selectedFlights = function() {
			var selectedFlights = [];
			
			if(self.flightListPanelArray && self.flightListPanelArray().length){
				ko.utils.arrayForEach(self.flightListPanelArray(), function(panel){
					selectedFlights.push(panel.selectedFlight());
                });	
			}

			return selectedFlights;
		};
		
		self.airTravelers = function() {
			var airTravelers = [];
			var paxList = self.availabilityMultiCityResponse().bookingRequest.bookings[0].paxList;
			
			for (var paxIndex = 0; paxIndex < paxList.length; paxIndex++) {
				var pax = paxList[paxIndex];
				airTravelers.push({ 'code' : pax.code , 'quantity' : pax.count });
			}

			return airTravelers;
		};

		self.scrollToChangeSelectedFareCategory = function () {
			$('html, body').animate({
			    scrollTop: 0,
			    scrollLeft: 0
			}, 1000);
		};
		
		self.updatePanelArray = function(remainingPanelIndex){
			if(data.tripType == 'ONE_WAY'){ //reissue da tek degisiklik veya rt olmayan 2 degisiklik senaryosu
				return;
			}
			
			for (var i = 0; i < self.flightListPanelArray().length; i++) {
				if(self.flightListPanelArray()[i].index() > remainingPanelIndex){
					self.flightListPanelArray.splice(i, 1);
				}
			}
			
			setTimeout(function(){
				var el = $('#panelHeader_' + remainingPanelIndex);
				if(el && el.length > 0){
					scrollToEl(el);
				}
			}, 500);
		}
		
		self.subsequent = function(selectedFlight, subcategory){
			etrAjax.post({
				app : 'app.ibs',
				service : '/booking/getupdatedavailabilityreissue',
				data : {
					'duTaxBeanCurrency'    : data.duTaxBean.currency,
					'duTaxBeanEcoAmount'   : data.duTaxBean.ecoAmount,
					'duTaxBeanBizAmount'   : data.duTaxBean.bizAmount,
					'duTaxBeanAjEcoAmount' : data.duTaxBean.ajEcoAmount,
					'amedeusJSessionId'    : data.amadeusSessionId,
					'outboudFlightId'      : selectedFlight.id,
					'inboundFlightId'      : subcategory.inboundFlightId,
					'recommendationId'     : subcategory.recommendationId,
					'pageTicket'           : data.pageTicket
				},
				callback : function(response) {
					if(response && response.data){
						var noresultVisibility = (response.data.routes == null || response.data.routes.length == 0) ? true : false;
						
						if(!noresultVisibility){
							var firstRoute = response.data.routes[0];
							
							if(firstRoute.days && firstRoute.days.length && firstRoute.days[0] && !firstRoute.days[0].hasNoFlight){
								self.addNewPanel(response.data.routes[0].days[0]);
							} else{
								etrAjax.showErrorModal(['ibs.booking.availability.label.error.noflights']);
							}
						} else{
							etrAjax.showErrorModal(['ibs.booking.availability.label.error.noflights']);
						}
					}
				}
			});			
		}
	}	
	
	function FlightListPanelHolder(response, mixCabin) {
		
		var self = this;
		
		self.mixCabin = ko.observable(mixCabin);
		
		self.availabilityResponse = ko.observable(response.data);
		
		self.availabilityOneWayWeeklyResponse = ko.observable(self.availabilityResponse().oneWayWeeklyResponse);
		
		self.availabilityRoundTripWeeklyResponse = ko.observable(self.availabilityResponse().roundTripWeeklyResponse);
				
		self.sections = ko.observableArray(generateCFFSections(self.availabilityResponse().routes[0].days[0].fareCategories));
		self.selectedSection = ko.observable();
        self.selectedCabinClass = ko.observable(self.availabilityResponse().bookingRequest.selectedCabinClass);
        
        if(self.sections().length) {
			try {
	            var selectedCabinClassSection = null;
	            var sectionList =  self.sections();
	            for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {
	                if(sectionList[sectionIndex].name == self.selectedCabinClass()){
	                    selectedCabinClassSection = sectionList[sectionIndex];
	                }
	            }
			    
	            self.selectedSection(findInitialCFFSection(self.sections(), false, selectedCabinClassSection.value(), selectedCabinClassSection.options()[0].subCategoryCode));
			} catch (e) {
	            self.selectedSection(findInitialCFFSection(self.sections(), false, '', ''));
	        }
        }


		self.changeSelectedSection = function (section) {
			
			var sameSectionClicked = self.selectedSection().name == section.name;
			
			if (sameSectionClicked) {
				self.selectedSection().isActive(!self.selectedSection().isActive());
				return true;
			}
			
			self.selectedSection().isActive(false);
			self.selectedSection(section);
			self.selectedSection().isActive(true);
			return true;
			
		};
		
    	
		self.selectedFareBasisCode = ko.computed(function() {
			
			var section = self.selectedSection;
			
			if (section && section() && section().selectedOption && section().selectedOption() && section().selectedOption().subCategoryCode) {
				return section().selectedOption().subCategoryCode;
			}
			
			return '';

		});		
    	
		self.flightListPanelArrayInitialized = ko.observable(false);		

		self.flightListPanelArray = ko.observableArray(RouteArrayToPanelArray(self.availabilityResponse().routes, null, null, self));
		
		self.flightListPanelArrayAllFlightsSelected = ko.computed(function() {
			
			if (underscore.isEmpty(self.flightListPanelArray())) {
				return false;
			}

			return underscore.all(self.flightListPanelArray(), function(panel) { return panel.selectedFlightExists() });
			
		});
		
		
		self.flightListPanelArraySelectionStates = ko.computed(function() {
			return underscore.map(self.flightListPanelArray(), function(panel){ return panel.selectedFlightExists() });
		});

		
		self.flightListPanelArrayAnySelected = ko.computed(function() {
			return underscore.any(self.flightListPanelArray(), function(panel){ return panel.selectedFlightExists() });
		});
		
		self.flightListPanelArraySelectionStates.subscribeChanged(function (newStates, oldStates) {
			
			// IF PANELS IN INCONSISTENT STATE (WHILE INITIALIZE) NO SCROLL
			if (!(oldStates.length && newStates.length && oldStates.length == newStates.length)) {
				return;
			}
			
			var selectedState = function(state){ return state };
			var unselectedState = function(state){ return !state };
			var countSelectedState = function(total, state){ return total + state ? 1 : 0; }
			var selectionIndex = function(state, index){ return state != oldStates[index] };
			
			// ALL FLIGHS SELECTED NO SCROLL
			if (underscore.all(newStates,selectedState)) {
				return;
			}
			
			var indexOfPanelToScroll;
			if (underscore.reduce(newStates, countSelectedState) > underscore.reduce(oldStates, countSelectedState)) {
				indexOfPanelToScroll = underscore.findIndex(newStates, unselectedState);
			} else{
				indexOfPanelToScroll = underscore.findIndex(newStates, selectionIndex);
			}
			
			scrollToEl($('#panel_container_id_' + indexOfPanelToScroll) , undefined, 10, undefined, 400);
			
		});
		
		
		self.flightListPanelArrayInitialized(true);		

	}
	
	return {
		SortData : SortData,
		FilterData : FilterData,
		FlightListPanel : FlightListPanel,
		FlightListPanelSingleCity : FlightListPanelSingleCity,
		FlightListPanelPremiumSingleCity: FlightListPanelPremiumSingleCity,
		FlightListPanelBrandedDomesticSingleCity: FlightListPanelBrandedDomesticSingleCity,
		FlightListPanelBrandedDomesticHolder: FlightListPanelBrandedDomesticHolder,
		FlightListPanelBrandedInternationalSingleCity: FlightListPanelBrandedInternationalSingleCity,
		FlightListPanelBrandedInternationalHolder: FlightListPanelBrandedInternationalHolder,
		FlightListPanelBrandedInternational : FlightListPanelBrandedInternational,
//		FlightListPanelBrandedDomestic: FlightListPanelBrandedDomestic,
		GenerateDefaultSortData : GenerateDefaultSortData,
		GenerateTimetableSortData : GenerateTimetableSortData,
		GenerateMulticitySortData : GenerateMulticitySortData,
		FilterDataFromFlightDay : FilterDataFromFlightDay,
		ObjectArrayToOptionArray : ObjectArrayToOptionArray,
		FlightListPanelMultiCityHolder : FlightListPanelMultiCityHolder,
		FlightListPanelMultiCity : FlightListPanelMultiCity,
		FlightListPanelBrandedMultiCityHolder : FlightListPanelBrandedMultiCityHolder,
		FlightListPanelBrandedMultiCity : FlightListPanelBrandedMultiCity,
		FlightListPanelHolder: FlightListPanelHolder
	};
	
});

