define([
	'knockout',
	'eteration/widgets/widget-util',
	'eteration/eteration-i18n',
	'eteration/widgets/managebooking/ui-res-servicefeebreakdowns',
	'eteration/widgets/managebooking/ui-res-basefarebreakdowns',
    'eteration/widgets/managebooking/ui-res-taxesbreakdowns',
	'eteration/widgets/managebooking/ui-res-selected-additional-services',
    'eteration/widgets/managebooking/ui-totalpax',
    'eteration/widgets/managebooking/ui-totalprice',
    'eteration/widgets/ui-i18n'
	], 

function(ko,widgetUtil,i18n){
		
		var ViewModel = function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	self.paidTicket = value.paidTicket;
	    	self.serviceFeePaxBreakdowns = value.serviceFeePaxBreakdowns; // reservation().serviceFeePaxBreakdown
	    	self.baseFarePaxBreakdowns = self.paidTicket ? null:value.baseFarePaxBreakdowns; // reservation().baseFarePaxBreakdown
	    	self.otherTaxesAndFees = value.otherTaxesAndFees; // reservation().otherTaxesAndFees
	    	self.paxTypeAndCounts = value.paxTypeAndCounts; // reservation().paxTypeAndCount
	    	self.reissuedAdditional = value.reissuedAdditional;
	    	self.reissuedRefund = value.reissuedRefund;
	    	self.reissuedPnr = value.reissuedPnr;
	    	self.collapsable = value.collapsable === undefined ? true : value.collapsable;
	    	self.reissuedFareDifference = null;
	    	self.seatFarePrice = value.seatFarePrice;
	    	self.extraSeatPrice = value.extraSeatPrice;
	    	self.baggageFarePrice = value.baggageFarePrice;
	    	// preorder parametresi kapalıyken ürün sepeti kapsamındaki meal price
	    	self.mealFarePrice = value.mealFarePrice;
			self.tysOfferingActive = value.tysOfferingActive;
			self.basketPrice = value.basketPrice;
			self.grandTotalFare = value.grandTotalFare;
			self.totalFare = value.totalFare;
	    	self.totalReissueMilesAmount = value.totalReissueMilesAmount;
	    	
	    	
	    	self.totalOtherTaxesAndFeesAmount = self.paidTicket ? 0:value.totalOtherTaxesAndFeesAmount; // reservation().totalOtherTaxesAndFees
	    	self.totalCarrierCharges = value.totalCarrierCharges; // reservation().totalCarrierCharges
	    	self.totalServiceFee = value.totalServiceFee; // reservation().totalServiceFee
	    	
	    	self.showTotalPrice = value.showTotalPrice === undefined ? true : value.showTotalPrice;
	    	self.totalPrice = self.paidTicket ? value.seatFarePrice: value.totalPrice; // reservation().awardTicketMileAmount
	    	self.totalTax = value.totalTax; // reservation().totalFare

			// preorder parametresi açıkken ürün sepeti kapsamındaki meal price
			self.totalMealPrice = value.totalMealPrice;
	    	
	    	self.paxCount = value.paxCount;

	    	self.awardTicketPaidWithMiles = value.awardTicketPaidWithMiles ? value.awardTicketPaidWithMiles : false;
	    	
	    	self.showBreakdown = ko.observable(!self.collapsable);
	    	
	    	self.showPriceBreakDown = function(){
				self.showBreakdown(!self.showBreakdown());
			}
	    	
	    	self.baseFarePaxBreakdownKeys = function (breakDownsObject) {
				var keys = [];
				if(!self.paidTicket) {
					for(var field in breakDownsObject) {
						if (breakDownsObject.hasOwnProperty(field))
							keys.push(field);
					} 
				}
				return keys;
			}
	    	
	    	self.calculateReissuedAmount = function() {
				
				self.baseFarePaxTypes = self.baseFarePaxBreakdownKeys(self.baseFarePaxBreakdowns);
				
	    		var totalReissuedAmount = 0;
	    		var currency = null;
	    		for(var i=0; i < self.baseFarePaxTypes.length; i++) {
	    			var baseFarePaxType = self.baseFarePaxTypes[i];
	    			if(self.baseFarePaxBreakdowns[baseFarePaxType]) {
	    				totalReissuedAmount = totalReissuedAmount + self.baseFarePaxBreakdowns[baseFarePaxType].amount;
	    				if(currency == null) {
	    					currency = self.baseFarePaxBreakdowns[baseFarePaxType].currency;
	    				}
	    			}
	    		}
	    		
	    		 
	    		return {
	    				amount: totalReissuedAmount,
	    				currency: currency
	    		}
				
			}
	    	
	    	self.totalReissuedAmount = self.baseFarePaxBreakdowns ? self.calculateReissuedAmount() : self.reissuedAdditional;
	    	
	    	if(self.reissuedRefund && self.reissuedRefund.amount > 0 && self.baseFarePaxBreakdowns) {
	    		
	    		self.baseFarePaxTypes = self.baseFarePaxBreakdownKeys(self.baseFarePaxBreakdowns);
	    		
	    		var totalReissuedAmount = 0;
	    		var differenceCurrency = null;
	    		for(var i=0; i < self.baseFarePaxTypes.length; i++) {
	    			var baseFarePaxType = self.baseFarePaxTypes[i];
	    			if(self.baseFarePaxBreakdowns[baseFarePaxType] && self.baseFarePaxBreakdowns[baseFarePaxType].amount > 0) {
	    				totalReissuedAmount = totalReissuedAmount + self.baseFarePaxBreakdowns[baseFarePaxType].amount;
	    				if(differenceCurrency == null) {
	    					differenceCurrency = self.baseFarePaxBreakdowns[baseFarePaxType].currency;
	    				}
	    			}
	    		}
	    		
	    		var differenceAmount = self.reissuedRefund.amount - totalReissuedAmount;
	    		 
	    		self.reissuedFareDifference = {
	    				amount: differenceAmount,
	    				currency: differenceCurrency
	    		}
	    	}
	    	
	    }

		return ViewModel;
	
	
});





