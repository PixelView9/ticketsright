define(['knockout'],
    function(ko) {
        ko.components.register('package-offer-carousel-tys', {
            viewModel: {require: "eteration/widgets/common/components/additional-services-tys/package-offer-carousel-tys/package-offer-carousel-tys-viewmodel"},
            template: {require: "text!eteration/widgets/common/components/additional-services-tys/package-offer-carousel-tys/package-offer-carousel-tys.html"}
        });
        ko.components.register('purchased-additional-services-info', {
            viewModel: {require: "eteration/widgets/common/components/additional-services-tys/purchased-additional-services-info/purchased-additional-services-info-viewmodel"},
            template: {require: "text!eteration/widgets/common/components/additional-services-tys/purchased-additional-services-info/purchased-additional-services-info.html"}
        });
        ko.components.register('purchased-sports-equipment-info', {
            viewModel: {require: "eteration/widgets/common/components/additional-services-tys/purchased-sports-equipment-info/purchased-sports-equipment-info-viewmodel"},
            template: {require: "text!eteration/widgets/common/components/additional-services-tys/purchased-sports-equipment-info/purchased-sports-equipment-info.html"}
        });
        ko.components.register('purchased-lounge-info', {
            viewModel: {require: "eteration/widgets/common/components/additional-services-tys/purchased-lounge-info/purchased-lounge-info-viewmodel"},
            template: {require: "text!eteration/widgets/common/components/additional-services-tys/purchased-lounge-info/purchased-lounge-info.html"}
        });
    }
);