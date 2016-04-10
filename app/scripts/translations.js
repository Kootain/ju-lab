/**
 * INSPINIA - Responsive Admin Theme
 *
 */
function translate($translateProvider) {

    $translateProvider
        .translations('en', {

            // Define all menu elements
            DASHBOARD: 'Dashboard',

            ALLDEVICES: 'Devices list',
                DEVICE: 'Device',
                ONLINEDEVICE: 'Online devices',
                    CATEGORY: 'Catrgory',

            REAGENT_MANAGEMENT: 'Reagent management',
                REAGENT: 'Reagent',
                ADD_REAGENT: 'Add reagent',
            // Define some custom text
            OVERVIEW: 'Overview',
            WELCOME: 'Welcome',
            LEARN_MORE: 'Leran more',
            DETAIL: 'Detail',
            MESSAGEINFO: 'You have 42 messages and 6 notifications.',
            SEARCH: 'Search for something...',

        });

    $translateProvider.preferredLanguage('en');

}

angular
    .module('julab')
    .config(translate)
