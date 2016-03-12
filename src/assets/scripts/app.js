angular.module('group-by-weight', [
	'ui.router',
	'ui.router.title',
	'firebaseHelper',
	//'miUtil',
])
	.config(function ($locationProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $stateProvider, $firebaseHelperProvider) {
		// routing
		$locationProvider.html5Mode(true).hashPrefix('!');
		$urlRouterProvider.when('', '/');
		$urlRouterProvider.when('home', '/');
		$urlMatcherFactoryProvider.strictMode(false); // make trailing slashes optional

		// pages
		var pages = [
			'home',
		];
		$stateProvider
			.state('main', {
				abstract: true,
				templateUrl: 'views/main.html',
			})
				.state('page', {
					parent: 'main',
					url: '/{page:|' + pages.join('|') + '}',
					templateUrl: $stateParams => 'views/page/' + ($stateParams.page || 'home') + '.html',
					resolve: {
						$title: function ($stateParams) {
							switch ($stateParams.page) {
								case '':
								case 'home': return '';
								default:     return $stateParams.page[0].toUpperCase() + $stateParams.page.slice(1);
							}
						},
					},
				})
		// fallbacks
			.state('404', {
				parent: 'main',
				templateUrl: 'views/page/404.html',
			});
		$urlRouterProvider.otherwise(function ($injector, $location) {
			var $state = $injector.get('$state');
			$state.go('404', null, {location: false});
			return $location.path();
		});

		// data
		$firebaseHelperProvider.namespace('XXXXXX');
	})

	.controller('AppCtrl', function ($rootScope, $state) {
		$rootScope.$state = $state;

		$rootScope.menus = [
			{
				name: 'Home',
				sref: 'page({page: "", "#": ""})',
			},
		];
	})
	.controller('FlowCtrl', function ($scope) {
		$scope.items = function(qty) {
			var a = [];
			for (var i = 0; i < parseInt(qty) || 0; i++) {
				a.push(i);
			}
			return a;
		};
		$scope.groups = [
			{
				name: 'Red',
			},
			{
				name: 'Orange',
			},
			{
				name: 'Yellow',
			},
			{
				name: 'Green',
			},
			{
				name: 'Blue',
			},
			{
				name: 'Indigo',
			},
			{
				name: 'Violet',
			},
		];

		$scope.colors = [];
		$scope.$watch('groups', groups => {
			$scope.colors = [];
			for(var i = 0; i < 360; i += 360 / groups.length) {
				$scope.colors.push(`hsl(${i}, ${90 + Math.random() * 10}%, ${50 + Math.random() * 10}%)`);
			}
		});
	});
