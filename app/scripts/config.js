function config($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise("/main/index");

    $stateProvider
        //////////////////index
        .state('content', {
            abstract: true,
            url: "/main",
            templateUrl: "views/common/content.html",
            controller: 'mainCtrl as main',
            ncyBreadcrumb:{
                label:'index'
            },
            resolve: {
                socket: function(){
                    socket = io.connect(':3000/');
                    socket.emit('in',{type:'web'});
                },
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'cgNotify',
                            files: ['../bower_components/angular-notify/dist/angular-notify.min.css','../bower_components/angular-notify/dist/angular-notify.min.js','views/common/notify.html']
                        }
                    ]);
                }
            }
        })
        .state('content.index', {
            url: "/index",
            templateUrl: "views/main.html",
            data: { pageTitle: 'Dashboard' },
            ncyBreadcrumb:{
                label:'Dashboard'
            }
        })
        //////////////////devices manage
        .state('content.devices', {
            abstract: true,
            url: "/devices",
            template: '<ui-view/>',
            ncyBreadcrumb:{
                label:'devices'
            },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            insertBefore: '#loadBefore',
                            name: 'localytics.directives',
                            files: ['../bower_components/chosen/chosen.css','../bower_components/chosen/chosen.jquery.js','../bower_components/angular-chosen-localytics/chosen.js']
                        }
                    ]);
                }
            }
        })
        .state('content.devices.overview', {
            url: "/overview",
            templateUrl: "views/device/overview.html",
            controller: 'deviceOverviewCtrl as deviceOverview',
            data: { pageTitle: 'devices overview' },
            ncyBreadcrumb:{
                label:'overview',
            },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'angles',
                            files: ['scripts/plugins/angles.js', '../bower_components/Chart.js/Chart.min.js']
                        },
                        {
                            name: 'angular-peity',
                            files: ['../bower_components/peity/jquery.peity.min.js', 
                                    '../bower_components/angular-peity/angular-peity.js']
                        },
                        {
                            serie: true,
                            name: 'angular-flot',
                            files: [ '../bower_components/flot/jquery.flot.js', 
                                     '../bower_components/flot/jquery.flot.time.js',
                                     '../bower_components/flot.tooltip.pib/js/jquery.flot.tooltip.min.js', 
                                     '../bower_components/jquery.flot.spline/index.js', 
                                     '../bower_components/flot/jquery.flot.resize.js', 
                                     '../bower_components/flot/jquery.flot.pie.js', 
                                     '../bower_components/flot.curvedlines/curvedLines.js', 
                                     '../bower_components/angular-flot/angular-flot.js', ]
                        }
                    ]);
                }
            }
        })
        .state('content.devices.list', {
            url: "/list",
            templateUrl: "views/device/devices_list.html",
            controller: 'deviceCtrl as device',
            data: { pageTitle: 'online devices' },
            ncyBreadcrumb:{
                label: 'device list',
            }
        })
        /////////////////reagent manage
        .state('content.reagents', {
            abstract: true,
            url: "/reagents",
            template: '<ui-view/>',
            ncyBreadcrumb:{
                label:'reagents'
            }
        })
        .state('content.reagents.overview', {
            url: "/overview",
            controller: 'scaleOverviewCtrl as reagentOverview',
            templateUrl: "views/reagent/overview.html",
            data: { pageTitle: 'reagents overview' },
            ncyBreadcrumb:{
                label:'overview'
            },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            name: 'angular-flot',
                            files: [ '../bower_components/flot/jquery.flot.js', 
                                     '../bower_components/flot/jquery.flot.time.js',
                                     '../bower_components/flot.tooltip.pib/js/jquery.flot.tooltip.min.js', 
                                     '../bower_components/jquery.flot.spline/index.js', 
                                     '../bower_components/flot/jquery.flot.resize.js', 
                                     '../bower_components/flot/jquery.flot.pie.js', 
                                     '../bower_components/flot.curvedlines/curvedLines.js', 
                                     '../bower_components/angular-flot/angular-flot.js', ]
                        },
                        {
                            name:'rangeSlider',
                            files: ['../bower_components/ionrangeslider/css/ion.rangeSlider.css','../bower_components/ionrangeslider/css/ion.rangeSlider.skinFlat.css','../bower_components/ionrangeslider/js/ion.rangeSlider.min.js']
                        },
                        {
                            insertBefore: '#loadBefore',
                            name: 'localytics.directives',
                            files: ['../bower_components/chosen/chosen.css','../bower_components/chosen/chosen.jquery.js','../bower_components/angular-chosen-localytics/chosen.js']
                        }
                    ]);
                }
            }
        })
        .state('content.reagents.list', {
            url: "/list",
            controller: 'reagentCtrl as r',
            templateUrl: "views/reagent/reagent_list.html",
            data: { pageTitle: 'reagents list' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            files: ['../bower_components/datatables/media/js/jquery.dataTables.js','../bower_components/datatables/media/css/dataTables.bootstrap.css']
                        },
                        {
                            serie: true,
                            files: ['../bower_components/datatables/media/js/dataTables.bootstrap.js']
                        },
                        {
                            name: 'datatables',
                            files: ['../bower_components/angular-datatables/dist/angular-datatables.min.js']
                        },
                        {
                            name: 'ngTable',
                            files: ['../bower_components/ng-table/dist/ng-table.js']
                        }
                        
                    ]);
                }
            },
            ncyBreadcrumb:{
                label: 'list'
            }
        })
}
angular
    .module('julab')
    .config(config)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });