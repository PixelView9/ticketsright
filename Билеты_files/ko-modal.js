define(['jquery',
        'knockout',
        'bootstrap'], 
	function($,ko) {
	"use strict";

    // Showing a modal is an asynchronous operation.
    // A jQuery Deferred object is returned to allow the calling code to
    // attach a callback for when the modal has been closed.
    (function(){
    	var alloptions, closeCallback;
    	var showModal = function(options) {
            if (typeof options === "undefined") throw new Error("An options argument is required.");
            if (typeof options.viewModel !== "object") throw new Error("options.viewModel is required.");
            alloptions = options;
            var viewModel = options.viewModel;
            viewModel.closeModal = function(callback){
            	viewModel.modal.close();
            	closeCallback =callback;
            }
            var template = options.template || viewModel.template;
            var context = options.context;
            
            if (!template) throw new Error("options.template or options.viewModel.template is required.");
            
            return createModalElement(template, viewModel)
                .pipe($) // jQueryify the DOM element
                .pipe(function($ui) {
                    var deferredModalResult = $.Deferred();
                    addModalHelperToViewModel(viewModel, deferredModalResult, context);
                    showTwitterBootstrapModal($ui);
                    whenModalResultCompleteThenHideUI(deferredModalResult, $ui);
                    whenUIHiddenThenRemoveUI($ui);
                    return deferredModalResult;
                });
        };

        var createModalElement = function(templateName, viewModel) {
            var temporaryDiv = addHiddenDivToBody();
            var deferredElement = $.Deferred();
            ko.renderTemplate(
                templateName,
                viewModel,
                // We need to know when the template has been rendered,
                // so we can get the resulting DOM element.
                // The resolve function receives the element.
                {
                    afterRender: function (nodes) {
                        // Ignore any #text nodes before and after the modal element.
                        var elements = nodes.filter(function(node) {
                            return node.nodeType === 1; // Element
                        });
                        deferredElement.resolve(elements[0]);
                    }
                },
                // The temporary div will get replaced by the rendered template output.
                temporaryDiv,
                "replaceNode"
            );
            // Return the deferred DOM element so callers can wait until it's ready for use.
            return deferredElement;
        };

        var addHiddenDivToBody = function() {
            var div = document.createElement("div");
            div.style.display = "none";
            document.body.appendChild(div);
            return div;
        };

        var addModalHelperToViewModel = function (viewModel, deferredModalResult, context) {
            // Provide a way for the viewModel to close the modal and pass back a result.
            viewModel.modal = {
                close: function (result) {
                    if (typeof result !== "undefined") {
                        deferredModalResult.resolveWith(context, [result]);
                    } else {
                        // When result is undefined, we don't want any `done` callbacks of
                        // the deferred being called. So reject instead of resolve.
                        deferredModalResult.rejectWith(context, []);
                    }
                }
            };
        };

        var showTwitterBootstrapModal = function($ui) {
            // Display the modal UI using Twitter Bootstrap's modal plug-in.
        	if($(window).width()){
        		var container = $('#modal_mobile_container');
            	if(!container.length){
        			 container = $('<div id="modal_mobile_container" class="modal_mobile_container"><div class="select-flight select-flight-mobile"></div></div>').insertAfter('header')
        		}
            	container.append($ui)
        	}
            $ui.modal($.extend({
                // Clicking the backdrop, or pressing Escape, shouldn't automatically close the modal by default.
                // The view model should remain in control of when to close.
                backdrop: false,
                keyboard: false,
                show:true
            }, alloptions.modalOptions || {}));
        };
        
        var whenModalResultCompleteThenHideUI = function (deferredModalResult, $ui) {
            // When modal is closed (with or without a result)
            // Then always hide the UI.
            deferredModalResult.always(function (e) {
                $ui.modal("hide");
            });
        };

        var whenUIHiddenThenRemoveUI = function($ui) {
            // Hiding the modal can result in an animation.
            // The `hidden` event is raised after the animation finishes,
            // so this is the right time to remove the UI element.
            $ui.on("hidden.bs.modal", function (evt) {
            	if(alloptions.preventEvents)
            		evt.preventDefault();
                // Call ko.cleanNode before removal to prevent memory leaks.
                $ui.each(function(index, element) {
                    ko.cleanNode(element);
                });
                $ui.remove();
                delete alloptions.viewModel.closeModal;
                delete alloptions.viewModel.modal;
                $.isFunction(closeCallback) && closeCallback();
                closeCallback = false;
            });
            $ui.on("show.bs.modal", function (evt) {
            	if(alloptions.preventEvents)
            		evt.preventDefault();
            });
            $ui.on("shown.bs.modal", function (evt) {
            	if(alloptions.preventEvents)
            		evt.preventDefault();
            });
        };
        ko.utils.showModal = showModal;
        ko.bindingHandlers.openKoModal = {
    		init : function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    			var accessor = valueAccessor();
    			$(element).on('click', function(){
    				showModal({
        	            viewModel: accessor.viewModel ? accessor.viewModel: viewModel,
        	            template:accessor.template,
        	            modalOptions:accessor.modalOptions,
        	            context: bindingContext
        	        })
    			})

    		}
        };
    })();
});