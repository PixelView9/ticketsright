define([
	'jquery',
	'knockout',
	'moment',
	'eteration/eteration-i18n',
	'ui-helper/flight-list-helper',
	'eteration/widgets/ui-i18n',
	'knockout-repeat',
    'mobile/custom-bindings'
	], function($, ko, moment, i18n, flightListHelper){
		
	
			ko.components.register('trip-flight-canvas-mobile', {
		        viewModel: function(vm) {
		        	
		        	var self = this;
			    	var value = vm.value;
			    	if('function' === typeof value) {
			    		value = vm.value();
			    	}
		            
			    	self.timeFrame = value.timeframe;
		            self.flightInfo = value.flightInfo;
		            
		            self.originAirportCityCode = self.flightInfo.firstSegment.originAirport.city.code;
		            self.destinationAirportCityCode = self.flightInfo.lastSegment.destinationAirport.city.code;
		            
		        },
		        template:

		            '<table width="auto" cellspacing="0" cellpadding="0" border="0" class="table table-bordered table-timeline-mobile nomargin table-fixed">'

		        	
		        			+'<tbody>'
							
								+'<tr class="timeline-ruller-row">'
								
									+'<td class="first-col"></td>'
									
									+'<td  class="start-col"><span><span data-bind="text:originAirportCityCode"></span><span data-bind="text:destinationAirportCityCode"></span></span></td>'
									
									+'<td data-bind="repeat: timeFrame.sliderValues.length-1" data-repeat-bind="timelineHours:{timeframe:timeFrame, index:$index}"></td>'

									+'<td rowspan="2" class="price-col pb-25"><small data-bind="i18n-text: { key: \'Label-OB-97\'}"></small>'
									
									//+'<br><small class="text-muted" data-bind="i18n-text: { key: \'TextField-REZ-PFL-98765\'}"></small>'
									+'</td>'
									
								+'</tr>'
								
								+'<tr class="timeline-seperator-row">'
									+'<td data-bind="attr : { width : (100/(timeFrame.sliderValues.length-1 + 2))+\'%\' }, repeat: timeFrame.sliderValues.length-1 + 2"></td>'
								+'</tr>'
								
								+'<tr class="timeline-item-row">'
									
									+'<td class="first-col"></td>'
									
									+'<td data-bind="attr : { colspan : (timeFrame.sliderValues.length-1) }">'
										+'<canvas  height="40" width="40" data-bind="flightChart:{mobileCanvas: true, flightData: flightInfo, flightId: flightInfo.id, timeframe: timeFrame}"></canvas>'
									+'</td>'

									+'<td class="last-col"></td>'
									
									+'<td class="price-col">'
										+'<small data-bind="text: humanizeDuration(flightInfo.totalTravelDurationISO, { spacer: \'\', delimiter: \'\', language : i18n.getUserLocale() })"> </small>'
										//+ '<br>'
										//+'<small data-bind="i18n-text: { key: \'TextField-REZ-PFL-04.miles\', args: { \'mile\': flightInfo.totalTravelDistance } }"> </small>'
									+'</td>'
									
								+'</tr>'
								
							+'</tbody>'
							
						+'</table>'
					
		    });
	
			
			ko.components.register('trip-flight', {
		        viewModel: function(vm) {
		        	
		        	var self = this;
			    	var value = vm.value;
			    	if('function' === typeof value) {
			    		value = vm.value();
			    	}
			    	self.wkOrScStatus = ko.observable(value.wkOrScStatus || false);
			    	self.bindingContext = value.bindingContext;
			    	self.index = value.index;
			    	self.parentIndex = value.parentIndex;
			    	self.isBupAvailableVisibility = value.isBupAvailableVisibility === undefined ? false : value.isBupAvailableVisibility;
			    	self.durationVisibility = value.durationVisibility;
			    	self.fareRulesVisibility = ko.observable(value.fareRulesVisibility === undefined ? true : value.fareRulesVisibility);
			    	
		        	self.flightInfo = value.flightInfo;
		        	self.timeframe = value.timeframe;
			    	
			    	self.selectedFlights = value.selectedFlights;
			    	self.selectFlightEnable = value.selectFlightEnable;


			    	self.createTripTitleOptions = function(flightInfo, selectedFlights, selectFlightEnable, index, wkOrScStatus) {
		        		var tripTitleKey = flightInfo.returnFlight ? 'Label-REZ-PFL-05' : 'Label-REZ-PFL-04';
//		        		var tripDistance = flightInfo.totalTravelDistance;
		        		var fareBaseCode = flightInfo.firstSegment.fareBase.name;
		        		var cabinTypeCode = flightInfo.firstSegment.bookingClass.cabinType.code.toLowerCase();
		        		var originAirportCode = flightInfo.firstSegment.originAirport.code;
//		        		var totalTravelDurationISO = flightInfo.totalTravelDurationISO;
		        		var destinationAirportCode = flightInfo.lastSegment.destinationAirport.code;
		        		var departureDateTime = moment.utc(flightInfo.firstSegment.departureDateTime + flightInfo.firstSegment.departureDateTimeTimeZoneRawOffset).format('MMMM DD');
		        		
		        		var flightInfoId = flightInfo.id;
		        		var isBupAvailable = flightInfo.segments[0].isBupAvailable;
		        		
		        		return { 
		        			tripTitleKey: tripTitleKey, 
		        			originAirportCode: originAirportCode, 
		        			destinationAirportCode: destinationAirportCode, 
		        			departureDateTime: departureDateTime,
		        			fareBaseCode : fareBaseCode,
		        			cabinTypeCode: cabinTypeCode,
		        			flightInfoId: flightInfoId,
		        			selectedFlights: selectedFlights,
		        			selectFlightEnable: selectFlightEnable,
		        			flightInfo: flightInfo,
		        			isBupAvailable: isBupAvailable,
		        			fareRulesVisibility: self.fareRulesVisibility,
		        			isBupAvailableVisibility: self.isBupAvailableVisibility,
		        			index: index,
							wkOrScStatus: self.wkOrScStatus
//		        			tripDistance: tripDistance,
//		        			totalTripDuration : totalTripDuration
		        		};
		        	}
		        	self.tripTitleOptions = self.createTripTitleOptions(self.flightInfo, self.selectedFlights, self.selectFlightEnable, self.index);
		        	
		        	
		        	self.createOriginSummaryInfo = function(flightInfo) {
		        		var departureDateTime = flightInfo.firstSegment.departureDateTimeISO.epochMilisecondsUtc;
		        		var departureDateTimeTimeZoneRawOffset = flightInfo.firstSegment.departureDateTimeISO.offsetMilisecondsLocal;
		        		var originAirportCode = flightInfo.firstSegment.originAirport.code;
		        		var originAirportCountryCode = flightInfo.firstSegment.originAirport.country == null ? flightInfo.firstSegment.originAirport.code:flightInfo.firstSegment.originAirport.country.code;
		        		
		        		return {
		        			departureDateTime: departureDateTime,
		        			departureDateTimeTimeZoneRawOffset: departureDateTimeTimeZoneRawOffset,
		        			originAirportCode: originAirportCode,
		        			originAirportCountryCode: originAirportCountryCode
		        		}
		        	}
		        	
		        	self.createReturnSummaryInfo = function(flightInfo) {
		        		var arrivalDateTime = flightInfo.lastSegment.arrivalDateTimeISO.epochMilisecondsUtc;
		        		var arrivalDateTimeTimeZoneRawOffset = flightInfo.lastSegment.arrivalDateTimeISO.offsetMilisecondsLocal;
		        		var destinationAirportCode = flightInfo.lastSegment.destinationAirport.code;
		        		var destinationAirportCountryCode = flightInfo.lastSegment.destinationAirport.country == null ? flightInfo.lastSegment.destinationAirport.code:flightInfo.lastSegment.destinationAirport.country.code;
		        		
		        		return {
		        			arrivalDateTime: arrivalDateTime,
		        			arrivalDateTimeTimeZoneRawOffset: arrivalDateTimeTimeZoneRawOffset,
		        			destinationAirportCode: destinationAirportCode,
		        			destinationAirportCountryCode: destinationAirportCountryCode
		        		}
		        	}
		        	
		        	self.originSummaryInfo = self.createOriginSummaryInfo(self.flightInfo);
		        	self.returnSummaryInfo = self.createReturnSummaryInfo(self.flightInfo);
		        	
		        },
		        template:
		        	'<mytrips-trip-title params="value: { \'options\': tripTitleOptions, parentIndex:parentIndex }"></mytrips-trip-title>' +
		        	'<!-- ko if: wkOrScStatus() || !flightInfo.brandCode -->' +
		        	'<common-trip-flight params="value: { index: index, flightInfo: flightInfo, timeframe: timeframe, parentIndex:parentIndex }" class="container pt-0" ></common-trip-flight>' +
		        	'<!-- /ko -->' +
		        	'<!-- ko if: !wkOrScStatus() && flightInfo.brandCode -->' +
		        		'<div class="row without-canvas">' +
		        			'<div class="col-sm-12">' +
	        					'<div class="canvas-table-wrapper selected-flight-bar domestic without-tick mobile" data-bind="selected-item-flight-mobile-domestic: { flightIndex: index, flight: flightInfo, links: $root.pageLinks }, attr:{id:\'cTooltip_\' + index }"></div>' +
	        					'<div class="flight-detail" data-bind="flight-detail: { panel: $root.reservation, flight: flightInfo, isAwardTicket: $root.isAwardTicket, selectedFlight: true, links: $root.pageLinks }"></div>' +
		        			'</div>' +
			        	'</div>' +
	        		'<!-- /ko -->'
			});
			
			
			ko.components.register('common-trip-flight', {
		        viewModel: function(vm) {
		        	
		        	var self = this;
			    	var value = vm.value;
			    	if('function' === typeof value) {
			    		value = vm.value();
			    	}
		        	
			    	self.index = value.index;
			    	self.parentIndex = value.parentIndex;
		        	self.flightInfo = value.flightInfo;
		        	self.tempAdd = (self.flightInfo.tempAdd == null || self.flightInfo.tempAdd == undefined || self.flightInfo.tempAdd == '') ? false:self.flightInfo.tempAdd;
		        	self.timeframe = value.timeframe;

		        	self.showFlightDetailsModal = function(modalId) {
		        		$('#'+modalId).modal("show");
		            }
		        },
		        template:

		        			"				<div class=\"nomargin fare-container\">\r\n" + 
		        			"					<div class=\"list-group nomargin\">" +
	        			    						"<!-- ko foreach:{data: flightInfo.segments, as:\'segment\'} -->"  +
	        			    							"<!-- ko if: ($parent.parentIndex != null && ($parent.parentIndex == 0 && !segment.scSegment && !$parent.tempAdd) || ($parent.parentIndex > 0 && !segment.wkSegment && (!$parent.tempAdd || segment.scSegment))) || ($parent.parentIndex == null && !segment.scSegment) -->"  +
		        			    							'<div class="clearfix list-group-item" data-bind="attr: {style: ((segment.wkSegment) ? \'background:#fdafb1\':((segment.scSegment && $root.reservation().trips.length > 0) ? \'background:#b2ceeb\':\'\'))}">  '  + 
		        			    								'<div class="col-xs-4">'  + 
															      	 '<small class="text-muted label-small pr-5-mbl" data-bind="i18n-text: { key: \'Label-OB-203.mobil\'}"></small>'  + 
															      	 '<span class="red bold" data-bind="text : segment.flightNumber"></span>'  + 
															    '</div>'  + 
															    '<div class="col-xs-4 nopadding">'  +
															    	"<!-- ko if:($parent.flightInfo != null && $parent.flightInfo.cabinClass != null) || (segment.bookingClass != null && segment.bookingClass.cabinCode != null) -->"  +
																    	'<small class="text-muted label-small" data-bind="i18n-text: { key: \'Label-OB-204.mobil\'}"></small>'  +
																    	"<!-- ko if:($parent.flightInfo != null && $parent.flightInfo.cabinClass != null) || (segment.bookingClass != null && segment.bookingClass.cabinType) -->"  +
																    		'<span class="h6 bold" data-bind="i18n-text: { key: \'TextField-OB-04\' , args:{\'cabintypelookup\':segment.bookingClass.cabinType.name.toLowerCase(), \'C\': segment.fareBase.code}}"></span>' + 
																    	'<!-- /ko -->  '  +
																    	"<!-- ko ifnot:segment.bookingClass.cabinType -->"  +
																    		'<span class="h6 bold" data-bind="text: i18n.get(\'cabintypelookup.\'+segment.bookingClass.cabinCode)+ \'(\' + segment.bookingClass.cabinCode + \')\'"></span>' + 
																    	'<!-- /ko -->  '  +
															    	'<!-- /ko -->  '  +
															    '</div>'  +
																'<div class="col-xs-4 text-right">'  + 
															      	 '<small class="text-muted label-small" data-bind="i18n-text: { key: \'Label-OB-85\'}"></small>'  +  
															      	 '<span class="h6 text-upper" data-bind="humanize : {value : segment.flightDuration, delimiter: \'\' }"></span>'  + 
															    '</div>'  + 
															'</div>'  + 
															'<div class="clearfix list-group-item" data-bind="attr: {style: ((segment.wkSegment) ? \'background:#fdafb1\':((segment.scSegment && $root.reservation().trips.length > 0) ? \'background:#b2ceeb\':\'\'))}">  '  + 
																'<div class="col-xs-4">  '  + 
															      	 '<small class="text-muted label-small" data-bind="i18n-text: { key: \'Label-OB-79\'}"></small>  '  + 
															      	 '<span class="bold" data-bind="moment:{value : segment.departureDateTimeISO.epochMilisecondsUtc, pattern : \'HH:mm\', timeZoneRawOffset : segment.departureDateTimeISO.offsetMilisecondsLocal}"}"></span>  '  + 
															    '</div>'  + 
															    '<div class="col-xs-8 nopadding">'  + 
															    	 '<span class="text-muted label-small" data-bind="i18n-text: { key: \'TextField-OCI-106\', args:{\'portcitylookup\': segment.originAirport.code, \'countrylookup\' : (segment.originAirport.country == null ? \'\':segment.originAirport.country.code), \'portcodelookup\' : segment.originAirport.code}}"></span>' +
															    	 '<span class="bold" data-bind="i18n-text: { key: \'TextField-OB-87\' , args:{\'portnamelookup\':segment.originAirport.code}}"></span>' +
															    '</div>'  + 
															'</div>'  + 
															'<div class="clearfix list-group-item" data-bind="attr: {style: ((segment.wkSegment) ? \'background:#fdafb1\':((segment.scSegment && $root.reservation().trips.length > 0) ? \'background:#b2ceeb\':\'\'))}">  '  +
																'<div class="col-xs-4">  '  + 
																	'<small class="text-muted label-small" data-bind="i18n-text: { key: \'Label-OB-83\'}"></small>  '  + 
																	'<span class="bold" data-bind="moment:{value : segment.arrivalDateTime, pattern : \'HH:mm\', timeZoneRawOffset : segment.arrivalDateTimeTimeZoneRawOffset}"></span>  '  + 
																'</div>  '  +  
																'<div class="col-xs-8 nopadding">'  + 
															    	 '<span class="text-muted label-small" data-bind="i18n-text: { key: \'TextField-OCI-109\', args:{\'portcitylookup\': segment.destinationAirport.code, \'countrylookup\' : (segment.destinationAirport.country == null ? \'\':segment.destinationAirport.country.code), \'portcodelookup\' : segment.destinationAirport.code}}"></span>' +
															    	 '<span class="bold" data-bind="i18n-text: { key: \'TextField-OB-87\' , args:{\'portnamelookup\':segment.destinationAirport.code}}"></span>' +
															    '</div>'  +
													      	 '</div>  '  + 
													      	 '<div class="table-row list-group-item" data-bind="attr: {style: ((segment.wkSegment) ? \'background:#fdafb1\':((segment.scSegment && $root.reservation().trips.length > 0) ? \'background:#b2ceeb\':\'\'))}">  '  +
														      	 '<div class="table-cell">  '  + 
														      	 	'<span class="pull-left"><img class="carrierairlines-icon-size" data-bind="attr:{src: \'/theme/img/carrierairlines/carriercode_\' + airline.shortName.toLocaleLowerCase() + \'.png\',alt: airline.longName}"></img></span>'  + 
														      	 	'<span class="text-muted text-xs">&nbsp;&nbsp;  '  + 
															      	 		'<span data-bind="i18n-text: { key: \'TextField-TRF-19\' , args:{\'carriercodelookup\':segment.airline.shortName}}"></span>'  +
														      	 	'</span>  '  + 
														      	 '</div>  '  + 
														      	'<!--ko if:segment.equipment != null -->  '  + 
															      	 '<div class="table-cell text-xs text-muted text-right">  '  + 
															      	 	'<span data-bind="i18n-text: { key: \'TextField-TRF-04\' , args:{\'planemodellookup\':segment.equipment.airEquipType, \'planetypelookup\':segment.equipment.airEquipType}}"></span>'  +
																     '</div>  '  + 
															     '<!-- /ko -->  '  + 
														     '</div>  '  +
														 '<!-- /ko -->  '  +
													     '<!--ko if:segment.layoverDuration != null -->  '  + 
													     '<div class="list-group-item clearfix list-group-header">  '  + 
													     	'<div class="col-xs-9">  '  + 
													     		'<span class="h4 text-upper">  '  + 
													     		'Layover in <span data-bind="text:segment.destinationAirport.city == null ? segment.destinationAirport.code:segment.destinationAirport.city.name"></span>  '  + 
													     		'</span>  '  + 
													     '</div>  '  + 
													     '<div class="col-xs-3 text-right">  '  + 
													     	'<span>  '  + 
													     		'<span class="text-muted icn-dock-left">  '  + 
													     			'<i class="fa fa-clock-o"></i>  '  + 
													     		'</span>  '  + 
													     		'<span class="h4" data-bind="humanize :{value: segment.layoverDuration, delimiter: \'\'}"></span>  '  + 
													     	'</span>  '  + 
													     '</div>  '  + 
													    '</div>  '  + 
													   '<!-- /ko -->  '  + 
													'<!-- /ko -->  ' +
		        			"					</div>" + 
		        			"				</div>\r\n" + 
		        			"    		</div>\r\n"     +
		        			"<br/>"
		    });
			
			ko.components.register('trip-summary', {
				viewModel: function(vm) {
		            var self = this;
			    	var value = vm.value;
			    	if('function' === typeof value) {
			    		value = vm.value();
			    	}
			    	
			    	self.flightInfo = value.flightInfo;
			    	self.durationVisibility = value.durationVisibility ? value.durationVisibility : false;
			    	self.originSummaryInfo = value.originSummaryInfo;
			    	self.returnSummaryInfo = value.returnSummaryInfo;
			    	
		        },
		        template: 
		        		"<!-- ko if: durationVisibility -->" +
			        		"<div class=\"row pl-45 mt-10\">\n" +
					    		"<div class=\"col-xs-12\">\n" + 
						    	"	<small class=\"text-muted fs-10 fw300 text-upper\" data-bind=\"i18n-text: { key: 'Label-OB-85'}\"></small>\n" + 
						    	"	<i class=\"fa fa-clock-o text-muted\"></i>\r\n" + 
						    	"	<div class=\"h4 nomargin fw700 fs-24\" data-bind=\"humanize : {value : flightInfo.totalTravelDurationISO, delimiter: '' }\"></div>\r\n" + 
						    	"</div>" +
					    	"</div>" +
					    	"<hr class=\"ml-45\"/>" + 
		        	    "<!-- /ko -->" +
				    	"<div class=\"row pl-45\">" + 
		        		"	<div class=\"col-xs-4\">" + 
		        		"		<small class=\"text-muted fs-10 fw300 text-upper\" data-bind=\"i18n-text: { key: \'Label-KV-07\' } \"></small>" + 
		        		"		<div class=\"h4 blue nomargin fw700 fs-24\" data-bind=\"moment:{value : originSummaryInfo.departureDateTime, pattern : \'HH:mm\', timeZoneRawOffset : originSummaryInfo.departureDateTimeTimeZoneRawOffset}\"></div>" + 
		        		"	</div>" + 
		        		"	<div class=\"col-xs-8\">" + 
		        		"		<small class=\"text-muted fs-10 fw300 text-upper\" data-bind=\"i18n-text: { key: \'TextField-OB-87\' , args:{\'portnamelookup\': originSummaryInfo.originAirportCode }}\"></small>" + 
		        		"		<div class=\"h4 nomargin fw700 fs-24\">" + 
		        		"			<span data-bind=\"i18n-text: { key: \'TextField-OB-85\', args:{\'portcitylookup\': originSummaryInfo.originAirportCode, \'countrylookup\': originSummaryInfo.originAirportCountryCode, \'portcodelookup\': originSummaryInfo.originAirportCode }}\"></span>" + 
		        		"		</div>" + 
		        		"	</div>" + 
		        		"</div>" +
		        		"<div class=\"row pl-45\">" + 
		        		"	<div class=\"col-xs-4\">" + 
		        		"		<small class=\"text-muted fs-10 fw300 text-upper\" data-bind=\"i18n-text: { key: \'Label-KV-08\' } \"></small>" + 
		        		"		<div class=\"h4 blue nomargin fw700 fs-24\" data-bind=\"moment:{value : returnSummaryInfo.arrivalDateTime, pattern : \'HH:mm\', timeZoneRawOffset : returnSummaryInfo.arrivalDateTimeTimeZoneRawOffset}\"></div>" + 
		        		"	</div>" + 
		        		"	<div class=\"col-xs-8 grid-bottom\">" + 
		        		"		<small class=\"text-muted fs-10 fw300 text-upper\" data-bind=\"i18n-text: { key: \'TextField-OB-88\', args:{\'portnamelookup\': returnSummaryInfo.destinationAirportCode}}\"></small>\r\n" + 
		        		"		<div class=\"h4 nomargin fw700 fs-24\">" + 
		        		"			<span data-bind=\"i18n-text: { key: \'TextField-OB-85\', args:{\'portcitylookup\': returnSummaryInfo.destinationAirportCode, \'countrylookup\': returnSummaryInfo.destinationAirportCountryCode, \'portcodelookup\': returnSummaryInfo.destinationAirportCode}}\"></span>" + 
		        		"		</div>" + 
		        		"	</div>" + 
		        		"</div>"
			});
			
			ko.components.register('mytrips-trip-title', {
		        viewModel: function(vm) {
		            var self = this;
			    	var value = vm.value;
			    	if('function' === typeof value) {
			    		value = vm.value();
			    	}
			    	self.options = value.options;
			    	self.parentIndex = value.parentIndex == null ? self.options.index:value.parentIndex;
		        	self.tempAdd = (self.options.flightInfo.tempAdd == null || self.options.flightInfo.tempAdd == undefined || self.options.flightInfo.tempAdd == '') ? false:self.options.flightInfo.tempAdd;
		        	self.flightInfo = value.options.flightInfo;
		        	self.options.fareRulesVisibility(!self.options.wkOrScStatus() || false);
		        },
		        template:
		        	'<!-- ko if: (parentIndex == 0 &&  !tempAdd) || (parentIndex > 0 &&  (!tempAdd || options.flightInfo.segments[0].scSegment)) -->' +
		            	'<div class="row">' +
			            	'<div class="col-xs-12">' +
								'<!-- ko if: (flightInfo.tripType == "MULTICITY" || parentIndex == 0 ) -->'+
				           		'<div class="h4 mt-30 mt-10-mbl mb-0 fs-12 bold outbound-title" data-bind="i18n-text: { key: \'Label-REZ-PFL-7999\', args:{\'count\': $index() +1 }} "></div>'+
								'<!-- /ko -->'+
								'<!-- ko ifnot: (flightInfo.tripType == "MULTICITY" || parentIndex == 0 ) -->'+
								'<div class="h4 mt-30 mt-10-mbl mb-0 fs-12 bold inbound-title" data-bind="i18n-text: { key: \'Label-REZ-PFL-7999\', args:{\'count\': $index() +1 }} "></div>'+
								'<!-- /ko -->'+
					           	'<div class="h4 nomargin fs-14 lh-22">'+
					           		'<!-- ko if: options.selectedFlights -->' +
						           		'<label tabindex="0" role="checkbox" class="checkbox metro-checkbox normal pull-left pr-10">' +
							           		'<input type="checkbox" data-bind="enable: !(options.flightInfo.disableSelection), checked: options.selectedFlights, value: options.flightInfoId, attr: { name: \'selectFlightsForRefund_\' + options.index }" data-validation=\'{"required":true}\' />' +
											'<span class="check"></span>' +
										'</label>' +
					           		'<!-- /ko -->' +
					           		'<!-- ko if: options.isBupAvailableVisibility -->' +
						           		'<!-- ko if: options.isBupAvailable -->' +
						           			'<label tabindex="0" role="checkbox" class="checkbox metro-checkbox normal pull-left pr-10">' +
							           			'<input type="checkbox" disabled="disabled" data-bind="checked: true">' +
							           			'<span class="check"></span>' +
											'</label>' +
						           		'<!-- /ko -->' +
						           		'<!-- ko ifnot: options.isBupAvailable -->' +
							           		'<label tabindex="0" role="checkbox" class="checkbox metro-checkbox normal pull-left pr-10">' +
							           			'<input type="checkbox" disabled="disabled" data-bind="checked: false">' +
							           			'<span class="check"></span>' +
											'</label>' +
						           		'<!-- /ko -->' +
					           		'<!-- /ko -->' +
					           		'<span id="flightInfoArea" class="dib mt-10" data-bind="i18n-text: { key: \'TextField-REZ-RI-05\', args:{\'DEP\': options.originAirportCode, \'ARR\': options.destinationAirportCode, \'datewoyear\': options.departureDateTime }}"></span><br/>' +
					           		'<p class="mt-10 mb-0 clearfix">'+
					           		'<!-- ko if: options.flightInfo.cabinClass -->'+
					           			'<span class="blue fw700 fs-14 ls-0-3 dib" data-bind="i18n-text: { key: \'TextField-REZ-RI-06\', args:{\'cabintypelookup\': options.cabinTypeCode, \'farefamilylookup\': \'\' }}"></span>' +
					           		'<!-- /ko -->' +
									'<!-- ko if: options.fareRulesVisibility() -->' +
										'<!-- ko if: options.flightInfo.domestic -->' +
											'<!-- ko if: !isTkHolidayPnr() -->' +
												'<a class="fw700 fs-18 fs-14-mbl pull-right double-right-arrow fareRulesDropdownMobile" role="button" tabindex="0" class="fs-16 fw700 farerules-btn" data-scrollDelay="100" data-scrollDir="bottom" data-scrollTarget="farerules.panel" data-bind="click: function() { $root.loadFareRulesForFlight(\'ux81837farerules\', options.flightInfo); }">' +
													'<span data-bind="i18n-text: { key: \'Link-OB-31\'}"></span>' +
												'</a>' +
											'<!-- /ko -->' +
										'<!-- /ko -->' +
									'<!-- /ko -->' +
									'</p>'+
					           	'</div>'+
					        '</div>' +
						'</div>' +
			           	'<!-- ko if: options.flightInfo.showFareRules && options.flightInfo.showFareRules() && options.flightInfo.fareRulesSource() === \'ux81837farerules\' -->' +
			           		'<!-- ko if: options.flightInfo.fareRule -->' +
					           	'<div class="manage-booking-fare-rule" data-bind="attr: { \'id\': \'ux81837farerules\' + $index() }">' +
									'<farerules params="value: {\'fareRule\': options.flightInfo.fareRule}"></farerules>' +
								'</div>' +
							'<!-- /ko -->' +
							'<!-- ko ifnot: options.flightInfo.fareRule -->' +
								'<div data-bind="i18n-text: { key: \'Label-REZ-DASH-05\'}"></div>' +
							'<!-- /ko -->' +
						'<!-- /ko -->' +
					'<!-- /ko -->'
						
		    });
		
});
