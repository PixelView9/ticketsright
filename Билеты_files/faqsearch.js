// Do not delete this file. 
//define([ 'jquery', 
//         'knockout',
//         'eteration/eteration', 
//         'eteration/eteration-i18n',
//		 'eteration/ui/faqsearch-viewmodel',
//		 'eteration/widgets/ui-cms'],
//		 
//function($, ko, Eteration,i18n,SearchVM) {
//
//	i18n.loadMsgs([ 'common','ms' ], function() {
//
//		Eteration.loadStaticFragment({
//			module : 'faqsearch',
//			success : function() {
//				$("#searchBoxTextTyped").attr("placeholder", i18n.get("Label-Genel-518"));
//				ko.applyBindings(new SearchVM.ViewModel(), $("#faqsearch")[0]);
//			}
//		});	
//		
//	},"faqsearch");
//	
//});
define([ 'jquery'],function($){
	function faqSearchRemoveHtml(i){
		i++;
		 setTimeout(function () {
			if(i<15){
				$( "#faqSearchContainer div").hasClass("placeholder-holder") ? $( "#faqSearchContainer div").remove():faqSearchRemoveHtml(i);
	        }
		 },200);
	};
	faqSearchRemoveHtml(0);
	
});
