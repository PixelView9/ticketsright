define(['jquery', 'knockout', 'eteration/eteration-ajax'],

    function($, ko, etrAjax) {

        function getTicketDetailForApps(reservationData){

            var detail={};
            var returnDateTime;
            var returnDateTimeForBooking; //Ikinci ucusun kalkis tarihi 
            var cityCode;
            var arrivalDateTime;
            var destinationAirport;
            var originAirport;
            var name;
            var surname;
            var email;
            var phone;
            var flightNumber;
            var ffid;
			var paxCount;
            
            if(reservationData.trips && reservationData.trips.length){
            
	            arrivalDateTime = reservationData.trips[0].flightInfo.lastSegment.arrivalDateTime +  reservationData.trips[0].flightInfo.lastSegment.arrivalDateTimeTimeZoneRawOffset;
	
	            if(reservationData.trips[0].flightInfo.lastSegment.destinationAirport.city)
	            	cityCode = reservationData.trips[0].flightInfo.lastSegment.destinationAirport.city.code;
	            	
	            if(reservationData.trips.length>1){
	                returnDateTime = reservationData.trips[reservationData.trips.length-1].flightInfo.firstSegment.departureDateTime + reservationData.trips[reservationData.trips.length-1].flightInfo.firstSegment.departureDateTimeTimeZoneRawOffset;
	                returnDateTimeForBooking = reservationData.trips[1].flightInfo.firstSegment.departureDateTime + reservationData.trips[1].flightInfo.firstSegment.departureDateTimeTimeZoneRawOffset;
	            }
	            else{
	                returnDateTime = reservationData.trips[0].flightInfo.lastSegment.arrivalDateTime + reservationData.trips[0].flightInfo.lastSegment.arrivalDateTimeTimeZoneRawOffset + 86400000;  // add 1 day 
	                returnDateTimeForBooking = returnDateTime;
	            }
            
	            destinationAirport = reservationData.trips[0].flightInfo.lastSegment.destinationAirport;
	            originAirport = reservationData.trips[0].flightInfo.firstSegment.originAirport;
	            
	            if(reservationData.contact == null) {
	            	reservationData.contact = reservationData.passengers[0];
	            }
	            
	            name = reservationData.contact.personalInfo.name;
	            surname = reservationData.contact.personalInfo.surname;
	            email = reservationData.contactEmail;
	            phone = reservationData.contactPhone;
	            ffid = reservationData.contact.fqtvInfo.ffpProgram + reservationData.contact.fqtvInfo.cardNumber;
	            flightNumber = reservationData.trips[0].flightInfo.firstSegment.flightNumber;
				paxCount = reservationData.passengers.length;
            }



            detail.returnDateTime = returnDateTime;
            detail.returnDateTimeForBooking = returnDateTimeForBooking;
            detail.arrivalDateTime = arrivalDateTime;
            detail.destinationAirport = destinationAirport;
            detail.originAirport = originAirport;
            detail.cityCode = cityCode;
            
            detail.name = name;
            detail.surname = surname;
            detail.email = email;
            detail.phone = phone;
            detail.ffid = ffid;
            detail.flightNumber = flightNumber;
			detail.paxCount = paxCount;

            return detail;
        }

        function checkTravelGuardSoldStatus(callback){
            
        	var  checkIsTravelGuardSelled = {
                app: 'app.ibs',
                service:'/payment/istravelguardsold',
                disableErrorHandling:true,
                disableLoader:true,
                global:false,
                callback:function(response) {
                    if(response.data){
                        callback(response.data);
                    }
                }
            };

            etrAjax.get(checkIsTravelGuardSelled)
        }
        
        return {
            getTicketDetailForApps : getTicketDetailForApps,
            checkTravelGuardSoldStatus : checkTravelGuardSoldStatus
        };

    });
