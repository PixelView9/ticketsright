define([ 'jquery', 'knockout', 'moment', 'humanize-duration', 'eteration/eteration-i18n' ], function($, ko, moment, humanize, i18n) {

	ko.bindingHandlers.timelineHours = {

		update : function(element, valueAccessor, allBindingsAccessor) {

			$(element).html('')

			var elem = $('<span></span>').appendTo(element)

			var value = ko.unwrap(valueAccessor());
			var timeframe = value.timeframe;
			var index = value.index;

			var sliderValues = timeframe.sliderValues;
			var sliderTimezoneOffsets = timeframe.sliderTimezoneOffsets;
			
			var originOffset = sliderTimezoneOffsets[0];
			var destinationOfset = sliderTimezoneOffsets[1] || sliderTimezoneOffsets[0];
				
			var originTime = index % 2 == 1 ? (sliderValues[index+1] + originOffset) % 24 : '';
			var destinationTime = index % 2 == 1 ? (sliderValues[index+1] + destinationOfset) % 24 : '';
			elem.append('<span>' + originTime  + '</span>');
			elem.append('<span>' + destinationTime + '</span>');
			
			if (value.index == sliderValues.length - 1 - 1) {
				$(element).addClass('last-col');
			}

		}

	};

	ko.bindingHandlers.timelineItemRange = {

		update : function(element, valueAccessor, allBindingsAccessor) {

			var el = $(element);

			el.empty();

			var value = ko.unwrap(valueAccessor());

			var flight = value.flight;

			var timeframe = value.timeframe;

			var width = calculatePercentageFrame(timeframe, flight.totalTravelDurationISO);
			var left = parseFloat(timeframe.startDiffRange);
			var frameDateTime = new Date(flight.firstSegment.departureDateTime);
			frameDateTime.setMinutes(0);
			frameDateTime.setHours(timeframe.startHour);

			var diff = flight.firstSegment.departureDateTime - frameDateTime.valueOf();

			if (diff > 0) {
				left = left + calculatePercentageFrame(timeframe, diff);
			}

			el.css({
				width : width + '%',
				left : left + '%'
			});
			el.addClass('airline-' + flight.firstSegment.airline.shortName);

			var segments = flight.segments;

			if (segments.length >= 1) {
				for (var i = 0; i < segments.length; i++) {
					if (i > 0) {
						var waitingTime = segments[i].departureDateTime - segments[i - 1].arrivalDateTime;
						var wwidth = calculatePercentageSegment(flight.totalTravelDurationISO, waitingTime), waitingSpan = $('<span class="airline-off"></span>').width(wwidth + '%')
						el.append(waitingSpan)
					}
					
					if(segments[i].airline.shortName) {
						var jwidth = calculatePercentageSegment(flight.totalTravelDurationISO, segments[i].journeyDuration);
						journeySpan = $('<span class="airline-' + segments[i].airline.shortName.toLowerCase() + '"></span>').width(jwidth + '%')
						el.append(journeySpan);
					}
				}
			}

		}

	};

	function calculatePercentageFrame(timeframe, value) {
		return parseFloat((((value / timeframe.frameLenght) * 100) * (timeframe.frameLenght / timeframe.frameItemLenght)).toFixed(8));
	}

	function calculatePercentageSegment(total, value) {
		return parseFloat(((value / total) * 100).toFixed(8));
	}

});