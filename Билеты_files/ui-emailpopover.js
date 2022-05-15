define([ 'knockout','eteration/eteration-i18n' ,'eteration/eteration-ajax','eteration/ui/validation-helper'], function(ko,i18n,etrAjax,validation) {

    ko.bindingHandlers.emailpopover = {
    	    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
     	      processData(element, valueAccessor, allBindingsAccessor, viewModel);
    	    }
    };
	
    
    
    function processData(element, valueAccessor, allBindingsAccessor, viewModel){
	       
    	   var email = valueAccessor().email;
    	   if(email == undefined){
    		   email = "";
    	   }
    	   
    	   var emailType = valueAccessor().emailType;
    	   
    	   if(emailType == undefined){
    		   emailType = "None";
    	   }
    	   
    	   var mailData = valueAccessor().mailData;
    	   
    	   console.log("-----------------");
    	   console.log(mailData);
    	   
    	   console.log(emailType);
    	   
	       var options =  {};
 	       var defaultOptions = {};
 	       options.content = "";
 	      var contentId = 'emailInput-' + Math.floor((Math.random() * 10000) + 1);
 	      var buttonLabel = i18n.get('Label-REZ-DASH-77565');
 	      var errorMessage = i18n.get('Label-REZ-DASH-77565.inv');
 	      options.content = 
 	    		  "<div class='input-group' id='"+ contentId +"'><div class='input-group'>\
					<input type='text' style='width:195px' id='emailInput' maxlength='50' class='form-control' value="+email+">\
					<span class='input-group-btn'>\
						<button class='btn btn-danger emailaction' type='button'>"+buttonLabel+"</button>\
					</span>\
			      </div>\
			      <span class=\"help-block\" style='display:none;'><i class=\"fa fa-warning red\"></i><span class=\"black\">"+errorMessage+"</span></span>\
			      </div>\
 	    		 ";
 	       
 	       options.html=true;
 	       options = $.extend(true, {}, defaultOptions, options);

           $(element).popover(options).on('shown.bs.popover', function(e){
        	    var content = $('#' +contentId);
        	    console.log("Email Type = "+emailType);
     	 		var selectSeatEvents = content.find(".emailaction").data("events");
				if(!selectSeatEvents){
	     	 		$(".emailaction").on("click",function(event){
	     	 			var valResult = validation.validators['email'](content.find(".form-control"));
	     	 			if(!valResult){
	     	 				content.removeClass('has-warning');
	     	 				content.find('.help-block').hide();
	     	 				$(element).popover('hide');
	     	 				
	     	 				
	     	 				if(emailType == "milesSmilesThankYouEmail"){
		     	 				etrAjax.post({
		    						app : 'app.ibs',
		    						service : '/booking/sendMsThankyouEmail/?email='+$('#emailInput').val(),
		    						data : mailData,
		    						callback : function(response) {
		    						}
		    					});		     	 				
	     	 				}
	     	 				else if(emailType == "rentCarThankYouEmail"){
     	 						etrAjax.post({
		    						app : 'app.ibs',
		    						service : '/booking/sendRentCarThankyouEmail/?email='+$('#emailInput').val(),
		    						data : mailData,
		    						callback : function(response) {
		    						}
		    					});
	     	 				}
	     	 				else{
	     	 					
	     	 					var emailData = {
	     	 							email: $('#emailInput').val(), 
	     	 							emailType:emailType
	     	 					}
	     	 					
     	 						etrAjax.post({
		    						app : 'app.ibs',
		    						service : '/booking/sendmail/',
		    						data: emailData,
		    						captchaCheck: true,
		    						callback : function(response) {
		    							
		    							var html = '<div class="modal fade" id="mailSuccessfullySendModal" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'+
						    							'<div class="modal-dialog">'+
							    							'<div class="modal-content">'+
								    							'<button data-dismiss="modal" class="modal-close" type="button" title='+i18n.get('Label-Genel-201')+'>'+
								    								'<i class="fa fa-times"></i>'+
								    							'</button>'+
								    							'<div class="modal-body">'+
								    								'<h3>'+ i18n.get('TextField-TY-202') + '</h3>'+
								    							'</div>'+
							    							'</div>'+
							    						'</div>'+
							    					'</div>';
		    							
	    							var modalContainer = $('#successModalContainer');
	    							
	    							$('body').append('<div role="warning" id="successModalContainer"></div>');
	    							modalContainer = $('#successModalContainer');
	    							modalContainer.html(html);
	    							$('#mailSuccessfullySendModal').modal("show");
		    						}
		    					});
	     	 				}
	     	 				
	     	 			}else{
	     	 				content.addClass('has-warning');
	     	 				content.find('.help-block').show();
	     	 			}
	     	 		});
 				}
     		});

           $(document).on('click', function(event){
        	   if(!$(element).is(event.target)) {
        		   var content= $('#' +contentId);
        		   if(content) {
        			   var popoverContainer = content.parent().parent();
        			   if(popoverContainer.is('.popover.in') 
        					   //&& popoverContainer.has(event.target).length === 0 ) {
        					   && $(event.target).parents().index(popoverContainer) == -1) {
        				   $(element).popover('hide');
        			   }
        		   }
        	   }
           });
    }
});