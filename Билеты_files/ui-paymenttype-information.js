define([
	'knockout',
	'eteration/widgets/widget-util',
	'eteration/eteration-i18n',
    'eteration/widgets/ui-i18n',
    'eteration/widgets/ui-money'
	], 

function(ko,widgetUtil,i18n){
		
	widgetUtil.setupStringBasedTemplate(ko);
	
	
	ko.components.register('paymenttype-information', {
		
	    viewModel: function(vm) {
	    	
	    	var self = this;
	    	
	    	var value = vm.value;
	    	if(typeof vm.value === "function") value = vm.value();
	    	
	    	self.reservation = (typeof value.reservation === "function") ? value.reservation : ko.observable(value.reservation);
	    	self.language = (typeof value.language === "function") ? value.language : ko.observable(value.language);
	    	
	    	self.cardHolderNameVisibility = value.cardHolderNameVisibility;
	    	self.installmentCountVisibility = value.installmentCountVisibility;
	    	self.paymentLogoName = (self.reservation().paymentInfo && $.inArray(self.reservation().paymentInfo.paymentType, window.paymentTypes) > -1) ? self.reservation().paymentInfo.paymentType : '';
	    	
	    },
	    template:
	    	"	<!-- ko if: reservation().paid -->" + 
	    	
	    	"     	<!--ko if: reservation().paymentInfo -->" + 

	    	"         <h4 class='mt-0-mbl mb-0-mbl bold' data-bind=\"i18n-text: {  key: 'Label-REZ-RF-100' }\"></h4>" + 
	    	
	    	"			<!-- ko if:reservation().paymentInfo.paymentType == 'creditCard' -->" + 
	    	"	     		<!--ko if: reservation().paymentInfo.cardInfo -->" + 
	    	"					<div class=\"row grid mt-10-mbl mb-0-mbl\">" + 
	    	"						<div class=\"col-sm-7\">" + 
	    	
	    	"							<div class=\"row\">" + 
	    	
	    	"								<div class=\"col-xs-12 col-sm-4\">" + 
	    	"									<p class=\"bold\">" + 
	    	"										<span data-bind=\"text: reservation().paymentInfo.cardInfo.cardType\"></span>" + 
	    	"										<span data-bind=\"text: reservation().paymentInfo.cardInfo.cardNumber\"></span> <br />" + 
	    	"									</p>" + 
	    	"									<!-- ko if: cardHolderNameVisibility -->" +
	    	"										<p class=\"bold\" data-bind=\"visible: reservation().paymentInfo.cardInfo.cardHolderName\">" +
			"											<span data-bind=\"i18n-text: { key: 'TextField-REZ-DASH-19', args:{'passenger name': reservation().paymentInfo.cardInfo.cardHolderName}}\"></span><br/><small class=\"text-muted\" data-bind=\"i18n-text:{'key':'Label-REZ-DASH-33'}\"></small>" +
			"										</p>" +
			"									<!-- /ko -->" +
	    	"								</div>" + 
	    	
	    	"								<!-- ko if: installmentCountVisibility && reservation().paymentInfo && reservation().paymentInfo.installmentCount > 0 --> " +
	    	"									<div class=\"col-xs-12 col-sm-3\">" + 
	    	"										<label class=\"bold hidden-xs\"><span data-bind=\"text: reservation().paymentInfo.cardInfo.cardType\"></span></label><br>" + 
	    	"										<span class=\"text-muted\" data-bind=\"i18n-text: { key: 'TextField-TY-657' , args:{'installmentcount':reservation().paymentInfo.installmentCount, 'countP' : 'installmentcount'}}\"></span>" + 
	    	"									</div>" + 
	    	"								<!-- /ko -->" + 
	    	
	    	"							</div>" + 
	    	
	    	"						</div>" + 
	    	
	    	"					</div>" + 
	    	
	    	"				<!-- /ko -->" + 
	    	"			<!-- /ko -->" + 
	    	
	    	"			<!-- ko with: paymentLogoName -->" + 
	    	"				 	<div class=\"row grid\">" + 
	    	"				        <div class=\"col-sm-12\">" + 
	    	"							<span data-bind=\"cms:{schema: 'Image',keyword: [{'Application Metadata':$data}],template: 'Application Image',maxItems: 1}\"></span>" + 
	    	"						</div>" + 
	    	"					</div>" + 
	    	"			<!-- /ko -->" +
	    	"		<!-- /ko -->" + 
	    	"		<hr class='mt-10-mbl mb-10-mbl' />" + 
	    	
	    	"  	<!-- /ko -->" + 
	    	""
	});
	
});





