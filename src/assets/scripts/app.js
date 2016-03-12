angular.module('group-by-weight', [])
	.controller('AppCtrl', function ($scope) {
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
