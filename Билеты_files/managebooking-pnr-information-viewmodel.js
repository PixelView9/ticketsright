define([
	'knockout',
	'eteration/eteration-ajax',
	'eteration/eteration-i18n',
	'eteration/widgets/ui-i18n'
	], 

function(ko,etrAjax,i18n){
		
	    var ViewModel = function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	
	    	self.links = value.links;
	    	self.eventbus = value.eventbus;
	    	
	    	self.pnr = ko.observable();
	    	self.thankyouPageType = ko.observable();
	    	
	    	self.eventbus.addSubscriber(function(reservationObject) {
		    	
	    		self.pnr(reservationObject.pnr);
	    		
	    	}, self, 'reservation');
	    	
	    	
	    	self.eventbus.addSubscriber(function(thankyouPageType) {
	    		
	    		self.thankyouPageType(thankyouPageType);
	    		
	    	}, self, 'thankyou_page_type');
	    	
	    	
	    	self.redirectToMytripsDashboard = function() {
				
				var redirectToMytripsDashboardRequest ={
		    		app: 'app.ibs',
		    		service:'/booking/redirectdashboard',
		    		callback:function(response) { 
		    			window.location = self.links.myTripsDashboard + "?cId=" + response.data;
		    			window.cId = response.data;
		    		}
				}
				etrAjax.get(redirectToMytripsDashboardRequest);
			}
	    	
	    	self.eventbus.notifySubscribers(true, 'reservation_provider');
	    	self.eventbus.notifySubscribers(true, 'thankyou_page_type_provider');
	    }
	    
	    return ViewModel;
});





