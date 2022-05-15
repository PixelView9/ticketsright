define(['knockout'], function(ko){

    ko.components.register('chat-thy', {

        viewModel: { require: "eteration/widgets/managebooking/components/chat-thy/chat-thy-viewmodel" },
        template: { require: "text!eteration/widgets/managebooking/components/chat-thy/chat-thy.html" }

    });

});