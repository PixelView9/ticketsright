define(['jquery',
        'knockout',
        'moment',
        'eteration/eteration-ajax',
        'eteration/widgets/ui-i18n',
        'eteration/eteration',
        'eteration/ui/form-viewmodel',
        'eteration/eteration-i18n',
        'eteration/widgets/ui-selectpicker',
        'eteration/widgets/ui-common',
        'eteration/widgets/ui-etrselect',
        'eteration/widgets/ui-money',
        'eteration/widgets/ui-cms-smarttarget',
        'eteration/widgets/ui-moment'],
    function($,ko,moment,etrAjax,ui18,Eteration,BaseViewModel,i18n) {

        function BusinessUpgrade(bupItinerrayResponse,bupAvailable) {

            var self = this;

            self.validationContext = ko.jqValidation({
                postValidators:[
                    {
                        name:"confirmupgrade",
                        id:"confirmupgrade",
                        func:function() {
                            if(!self.upgrade())
                                return i18n.get("ERR-BUP-1000");
                        }
                    }
                ]
            });



            self.upgrade=ko.observable(false);
            self.itinerrayResponse=ko.observable(bupItinerrayResponse);
            self.isAvailable=ko.observable(bupAvailable);
            self.bupCmsParams = ko.observableArray();

            if(self.itinerrayResponse()){
                self.bupCmsParams.removeAll();
                self.bupCmsParams.push({'key':'bupprice','value':self.itinerrayResponse().amount});
                self.bupCmsParams.push({'key':'buppricesymbol','value':self.itinerrayResponse().currencyCode});
            }

            var map = {
                'confirmupgrade' : 'confirmupgrade',
//							'upgrade' : 'upgrade',
            };

            /*self.makeBussinessUpgrade = function() {

                etrAjax.get({
                    app: 'app.ibs',
                    service:'/bup/paymentload',
                    largeLoader : true,
                    loaderName : 'Select Flights',
                    callback:function(response) {

                    },
                    uiMap:map
                });

            };*/

            self.businessUpgrade = function(){

                if (self.upgrade()) {

                    if(!self.reservation) {
                        //self.makeBussinessUpgrade();
                        return true;
                    }

                    var nonIttPnr = self.reservation.nonIttPnr;
                    if(nonIttPnr) {
                        //self.openNonIttModal(self.makeBussinessUpgrade);
                    }
                    else {
                        //self.makeBussinessUpgrade();
                    }
                }

            };

            var upgradeButtonHtml = "				<!-- ko if: upgrade-->\n" +
                "										<a class=\"btn btn-danger btn-lg\" data-bind=\"click : businessUpgrade\">\n" +
                "											<span data-bind=\"i18n-text: { key: \'Label-UPG-16\'}\"></span>\n" +
                "										</a>\n" +
                "									<!-- /ko -->\n" +
                "									<!-- ko ifnot: upgrade-->\n" +
                "										<a class=\"btn btn-danger btn-lg disabled\">\n" +
                "											<span data-bind=\"i18n-text: { key: \'Label-UPG-16\'}\"></span>\n" +
                "										</a>\n" +
                "									<!-- /ko -->";


            self.afterBupBlockLoad = function(){

                setTimeout(function(){

                    //						$("#bupselection").attr("jqValidation","validationContext");
                    //						$("#upgradebutton").attr("disabled","disabled");
                    //						$("#upgradebutton").attr("data-bind","click : businessUpgrade");
                	
                	var ugradebutton = $("#ugradebutton");
                	ugradebutton.empty();
                	ugradebutton.append(upgradeButtonHtml);
                	
                	var confirmupgrade = $("#confirmupgrade");
                	confirmupgrade.attr("data-bind","checked: upgrade");
                	confirmupgrade.attr("data-validation","required:true");
                	
                	var bupSection = $("#bupselection")[0];
                    ko.cleanNode(bupSection);
                    ko.applyBindings(self, bupSection);

                }, 1000);

            }

        }

        return { ViewModel:  BusinessUpgrade };
    });