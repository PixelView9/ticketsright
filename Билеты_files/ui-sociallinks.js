define(['knockout',
		'jquery',
		'facebook',
		'eteration/eteration-i18n' ,
		'eteration/eteration-ajax',
		'gapi'], 
	function(ko, $, fb,i18n,etrAjax) {
		function SociallinksUi(){
			ko.bindingHandlers.sociallinks = {
			    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
		 	      processData(element, valueAccessor, allBindingsAccessor, viewModel);
			    }
			 };
	
			var prodUrl = 'http://www.turkishairlines.com/'; 
		
			function fbShare(desc, urlToShare) {
		//		var url = "http://www.turkishairlines.com/";
		//		var title = "Turkish Airlines";
		//        window.open('https://www.facebook.com/dialog/feed?app_id=145634995501895&display=popup&caption='+desc+'&link='+url+'&redirect_uri=https://www.facebook.com&name=Turkish%20Airlines','_blank',"width=600, height=300");
		
			    fb.init({
			        appId      : '242570602781993',
			        xfbml      : false,
			        version    : 'v2.6'
			      });
				
			    fb.ui({
			    	 method: 'share',
			    	 href: urlToShare ? urlToShare : prodUrl,
			    	 quote: desc
			    	}, function(response){});
		        
		        
			}
			
			function twShare(desc) {
				var title = "Turkish Airlines";
		        window.open('https://twitter.com/intent/tweet?text='+desc,'_blank',"width=800, height=400");
			}
			
			function plusShare(desc, urlToShare) {
		//		var url = urlToShare ? urlToShare : prodUrl;
		//		var title = "Turkish Airlines";
		//        window.open('https://plus.google.com/share?url='+url,'_blank',"width=600, height=300");
		//        
		//        
			}
			
			function linkedinShare(desc, urlToShare) {
				var url = urlToShare ? urlToShare : prodUrl;
				var title = "Turkish Airlines";
		        window.open('https://www.linkedin.com/shareArticle?mini=true&url='+url+'&title='+desc+'&summary='+title+'&source='+url,'_blank',"width=600, height=300");
			}
		    
		    function processData(element, valueAccessor, allBindingsAccessor, viewModel){
			   var fbShareData = valueAccessor().fbShareData;
			   var urlToShare = valueAccessor().urlToShare ? valueAccessor().urlToShare() : null;
			   var options =  {};
			   var defaultOptions = {};
			   options.content = "";
			   options.content = function() {
				   return	"<ul id='socialList' class='social social-list'>" +
						    "<li><a tabindex='0' id='fa-facebook' class='social-fb'><i class='fa fa-facebook fa-lg'></i></a></li>" +
						    "<li><a tabindex='0' id='fa-twitter' class='social-tw'><i class='fa fa-twitter fa-lg'></i></a></li>" +
						    "<li><a tabindex='0' id='fa-linkedin' class='social-li'><i class='fa fa-linkedin fa-lg'></i></a></li>" +
						    "</ul>";
				   
				};
			   
			    options.html=true;	    
			    //if trigger is set to focus activate delay attribute
			    //options.delay = {'hide': 500};
			    
			    //trigger is set to click to provide share icons as accessible
			    options.trigger = 'click';
			    options.container= $(element).data("container") || '.socialsharelinks';
			    options = $.extend(true, {}, defaultOptions, options);
			    var popoverItem = $(element).popover(options);
			    popoverItem.on('shown.bs.popover', function(){
			 		
			 		var fbBtn = $("#fa-facebook");
			 		
			 		var fbShareEvent = fbBtn.data("events");
					if(!fbShareEvent){
						fbBtn.on("click",function(event){
							fbShare(fbShareData(), urlToShare);
							$(element).popover('hide');
						});
						fbBtn.keypress(function(e){
					        if(e.which == 13){
					        	fbBtn.click();
					        }
					    });
					}
					
					var twBtn = $("#fa-twitter");
					var twShareEvent = twBtn.data("events");
					if(!twShareEvent){
						twBtn.on("click",function(event){
							twShare(fbShareData());
							$(element).popover('hide');
						});
						twBtn.keypress(function(e){
					        if(e.which == 13){
					        	twBtn.click();
					        }
					    });
					}
					
					var plusBtn = $("#fa-google-plus");
					var plusShareEvent = plusBtn.data("events");
					if(!plusShareEvent){
		//				plusBtn.on("click",function(event){
		//					plusShare(fbShareData(), urlToShare);
		//					$(element).popover('hide');
		//				});
		//				plusBtn.keypress(function(e){
		//			        if(e.which == 13){
		//			        	plusBtn.click();
		//			        }
		//			    });
						plusBtn.ready(function() {
						   var options = {
					            contenturl: urlToShare ? urlToShare : prodUrl,
					            contentdeeplinkid: '/pages',
					            clientid: '1046537985725-e194e3b60moucv3gup5qrr2ppcrlaq8j.apps.googleusercontent.com',
					            cookiepolicy: 'single_host_origin',
					            prefilltext: fbShareData(),
					            calltoactionlabel: 'CREATE',
					            calltoactionurl: urlToShare ? urlToShare : prodUrl,
					            calltoactiondeeplinkid: '/pages/create'
					        };
						   gapi.interactivepost.render('fa-google-plus', options);
		
						});
					}
					
					var lnkdBtn = $("#fa-linkedin");
					var linkedinShareEvent = lnkdBtn.data("events");
					if(!linkedinShareEvent){
						lnkdBtn.on("click",function(event){
							linkedinShare(fbShareData(), urlToShare);
							$(element).popover('hide');
						});
						lnkdBtn.keypress(function(e){
					        if(e.which == 13){
					        	lnkdBtn.click();
					        }
					    });
					}
			 		
		//	 		$("#fa-facebook").on("click",function(event){
		//				fbShare(fbShareData(), urlToShare);
		//				$(element).popover('hide');
		//			});
		//			
		//			$("#fa-twitter").on("click",function(event){
		//				twShare(fbShareData(), urlToShare);
		//				$(element).popover('hide');
		//			});
		//			
		//			$("#fa-google-plus").on("click",function(event){
		//				plusShare(fbShareData(), urlToShare);
		//				$(element).popover('hide');
		//			});
		//			
		//			$("#fa-linkedin").on("click",function(event){
		//				linkedinShare(fbShareData(), urlToShare);
		//				$(element).popover('hide');
		//			});
			 	});
		
		        $(document).on('click', function(event){
		     	   if(!$(element).is($(event.target).closest('.social-share-popover'))) {
		     		   var content= $('#socialList');
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
		}return {ViewModel : SociallinksUi};    
});
