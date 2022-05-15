	define([ 'jquery', 
	         'knockout',
	         'eteration/eteration',
	         'eteration/eteration-ajax',
	         'eteration/eteration-i18n',
	         'eteration/ui/form-viewmodel',
	         "./viewmodels/businessupgrade-view.js",
	         'eteration/eteration-i18n',
	         'eteration/ui/validation-helper',
	         'eteration/widgets/ui-cms',
	         'eteration/widgets/ui-cms-smarttarget'],

	 function($, ko, Eteration,etrAjax,i18n,FormViewModel,BUP) {	

			var self = this;
            self.itinerrayResponse=ko.observable();
            self.isAvailable=ko.observable(false);

            var loadBupApp = function(reservation) {
                if(self.isAvailable()){
                    Eteration.loadStaticFragment({
                        module : 'businessupgrade',
                        app:'app.ibs',
                        el:$("#businessupgrade"),
                        success : function() {
                            ko.applyBindings(new BUP.ViewModel(self.itinerrayResponse(),self.isAvailable()), $("#businessupgrade")[0]);
                        }
                    });
                }


                if(self.itinerrayResponse()){
                    for (var int = 0; int < self.itinerrayResponse().bupAvailFlightsIndex.length; int++) {
                        var array_element = self.itinerrayResponse().bupAvailFlightsIndex[int];
                        if(array_element> reservation.trips[0].flightInfo.segments.length){
                            array_element = array_element - reservation.trips[0].flightInfo.segments.length;
                            reservation.trips[array_element].flightInfo.isUpgradeAvailable(true);

                        }else{
                            reservation.trips[array_element-1].flightInfo.isUpgradeAvailable(true);
                        }

                    }

                    var trips = reservation.trips;
                    for(var i=0; i < trips.length; i++) {
                        var trip = trips[i];
                        if("ROUND_TRIP" == trip.flightInfo.tripType) {
                            var isUpgradeAvailableForDepartureFlight = trip.flightInfo.isUpgradeAvailable();
                            trip.flightInfo.returnFlightInfo = self.findFlight(trips, trip.flightInfo.returnFlightInfo);
                            if(trip.flightInfo.returnFlightInfo){
                                var isUpgradeAvailableForReturnFlight = trip.flightInfo.returnFlightInfo.isUpgradeAvailable();
                                var bupCheckboxVisibility = isUpgradeAvailableForReturnFlight || isUpgradeAvailableForDepartureFlight;
                                trip.flightInfo.bupCheckboxVisibility(bupCheckboxVisibility);
                                trip.flightInfo.returnFlightInfo.bupCheckboxVisibility(bupCheckboxVisibility);
                            }
                        }
                    }
                }
            }

            self.findFlight = function(trips, returnFlightInfo) {
                for(var i=0; i < trips.length; i++) {
                    if(returnFlightInfo && trips[i].flightInfo.rph == returnFlightInfo.rph) {
                        return trips[i].flightInfo;
                    }
                }

                return returnFlightInfo;
            }


             /*self.getUpgradeAmount= function(reservation){
                etrAjax.get({
                    app: 'app.ibs',
                    service:'/bup/bupamount',
                    disableErrorHandling:true,
                    disableLoader:true,
                    global:false,
                    callback:function(response) {
                        self.itinerrayResponse(response.data);
                        loadBupApp(reservation);
                    }
                });
            }*/

            self.isBupAvailable = function(reservation){
                etrAjax.get({
                    app: 'app.ibs',
                    service:'/bup/isbupvalid',
                    disableErrorHandling:true,
                    disableLoader:true,
                    global:false,
                    callback:function(response) {
                        self.isAvailable(response.data);
                        if(response.data){
                            //getUpgradeAmount(reservation);
                        }
                    }

                });
            }
            
	        return {
	        	isBupAvailable : isBupAvailable
	        };
    });
