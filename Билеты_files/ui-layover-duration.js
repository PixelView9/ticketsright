define(['jquery', 'knockout', 'moment', 'humanize-duration','eteration/eteration-i18n' , 'eteration/widgets/ui-moment'], 

function($, ko, moment, humanize,i18n) {

	ko.components.register('layover-duration', {
	    viewModel: function(vm) {
	    	
	    	this.duration = (vm.value().flight.segments[vm.value().index].departureDateTime-vm.value().flight.segments[vm.value().index-1].arrivalDateTime);
	    	if(!this.duration){
	    		this.duration = (vm.value().flight.segments[vm.value().index].date.departureTime-vm.value().flight.segments[vm.value().index-1].date.arrivalTime);	
	    	}
	    },
	    template:
	        '<span class="h6 visible-xs visible-sm dib-mbl" data-bind="humanize:{value:duration}"></span>' +
	    	'<span class="hidden-xs hidden-sm ws-nowrap" data-bind="humanize:{value:duration}"></span>'
	});

});
