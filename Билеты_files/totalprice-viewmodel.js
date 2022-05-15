define([
	'knockout',
	'eteration/widgets/widget-util',
	 'eteration/eteration-i18n',
	 'eteration/widgets/ui-money'
	], 

function(ko,widgetUtil,i18n){
		
	    var ViewModel = function(vm) {
	    	
	    	var self = this;
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	self.css = value.css === undefined ?  "text-left pull-right " : value.css;
	    	
	    	self.totalTax = value.totalTax;
	    	self.totalPrice = value.totalPrice;
	    	self.ignoreZeroAmount = value.ignoreZeroAmount == undefined ? false : value.ignoreZeroAmount;
	    	self.sub = value.sub || false;
			self.tysOfferingActive = value.tysOfferingActive;
			self.awdTicket = value.awdTicket;
			self.basketPrice = value.basketPrice;
			self.awardTicketPaidWithMiles = value.awardTicketPaidWithMiles;
			self.totalFare = value.totalFare;
			self.totalCmMile = value.totalCmMile;
	    }
	
	    return ViewModel;
});





