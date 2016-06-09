angular.module('group-by-weight', [])
	.controller('AppCtrl', function ($scope, $timeout, $window) {
		$scope.groups = [
			{
				$id: 1,
				name: 'Alcohol',
				items: [],
			},
			{
				$id: 2,
				name: 'Entertainment',
				items: [],
			},
			{
				$id: 0,
				name: 'Food',
				items: [],
			},
			{
				$id: 3,
				name: 'Household',
				items: [],
			},
			{
				$id: 4,
				name: 'Lifestyle',
				items: [],
			},
			{
				$id: 5,
				name: 'Ignore',
				items: [],
				background: 'rgba(0,0,0,.2)',
			},
		];

		$scope.colors = [];
		$scope.$watch('groups', groups => {
			$scope.colors = [];
			for(var i = 0; i < 360; i += 360 / groups.length) {
				$scope.colors.push(`hsla(${i}, ${90 + Math.random() * 10}%, ${50 + Math.random() * 10}%, .2)`);
			}
		});

		let refresh  = e => {
			$scope.$apply();
		};
		angular.element($window).on('load resize', refresh);


		$scope.weightByLength = function ($id) {
			return bezierConnect(document.getElementById('input' + $id), document.getElementById('output' + $id));
		};
		$scope.weightBySum = function ($id) {
			return bezierConnect(document.getElementById('output' + $id), document.getElementById('exput' + $id));
		};
		function bezierConnect(inputEl, outputEl) {
			if (!inputEl || !outputEl) return;

			let input  = inputEl.getBoundingClientRect(),
				output = outputEl.getBoundingClientRect(),
				width = output.left - (input.left + input.width);

			return `M0 ${input.top} C${width/2} ${input.top}, ${width/2} ${output.top}, ${width} ${output.top} v${output.height} C${width/2} ${output.top + output.height}, ${width/2} ${input.top + input.height}, 0 ${input.top + input.height} v${-input.height}`;
		};

		let selected = [];
		$scope.select = function (item, append) {
			var found = selected.indexOf(item);
			if (found < 0) {
				// not found, add it
				if (append) {
					selected.push(item);
				} else {
					selected.splice(0, selected.length, item);
				}
			} else {
				// already in there, remove it
				selected.splice(found, 1);
			}
			return selected;
		};
		$scope.selected = function (item) {
			return selected.indexOf(item) >= 0;
		};

		$scope.sum = function (group) {
			group.$sum = 0;
			group.items.map(item => group.$sum += item.amount);
			return group.$sum;
		};
		$scope.len = function (group) {
			return group.$len = group.items.length || 0;
		};
		$scope.abs = function (num) {
			return Math.abs(num);
		};

		$scope.moveItem = function(source, index, destination) {
			destination.push(source.splice(parseInt(index), 1)[0]);
		};
		$scope.parseCSV = function (files) {
			let reader = new FileReader();
			reader.onload = function (e) {
				$timeout(function () {
					$scope.items = [];
					CSV.parse(e.target.result).map((row, i) => {
						if (!i) return;

						$scope.items.push({
							name: row[4] + '\n' + row[5],
							date: row[2],
							amount: parseFloat(row[6].toString().replace(/\(([^\)]+)\)/g, '-$1').replace(/[^\d\.\-]/g, '')),
						});
					});
				});
			};
			reader.readAsText(files[0]);
		};
	})


	// drop-n-drop
	.directive('drag', function ($rootScope, $parse, $timeout) {
		return {
			restrict: 'A',
			link: function ($scope, $element, $attrs) {
				var draggable = true,
					effect    = $attrs.dragEffect || 'move';
				
				// enable native drag-n-drop
				//$scope.$watch($attrs.drag, function (v) {
				//	draggable = $element[0].draggable = !! v;
				//});
				$element[0].draggable = true;
				
				
				// hook events
				$element.on('dragstart', function (e) {
					if (draggable) {
						e.stopPropagation();
						e.dataTransfer.effectAllowed = effect;
						$rootScope.$dragDropData = $parse($attrs.drag)($scope);
						
						$element.addClass('dragging');
						
						$timeout(function () {
							$parse($attrs.dragStart)($scope, {$event: e, $element: $element});
						});
					}
				});
				
				$element.on('dragend', function (e) {
					if (draggable) {
						$element.removeClass('dragging');
						
						$timeout(function () {
							$parse($attrs.dragEnd)($scope, {$event: e, $element: $element, $data: $rootScope.$dragDropData});
							$rootScope.$dragDropData = undefined;
						});
					}
				});
			},
		};
	})
	.directive('dragDrop', function ($rootScope, $parse, $timeout) {
		return {
			restrict: 'A',
			link: function ($scope, $element, $attrs) {
				var effect = $attrs.dragEffect || 'move';
				
				// hook events
				$element.on('dragover', function (e) {
					e.preventDefault();
					e.stopPropagation();
					e.dataTransfer.dropEffect = effect;
					
					$element.addClass('dragover');
					
					$timeout(function () {
						$parse($attrs.dragOver)($scope, {$event: e, $element: $element, $data: $rootScope.$dragDropData});
					});
				});
				
				$element.on('dragenter', function (e) {
					e.preventDefault();
					e.stopPropagation();
					
					$element.addClass('dragover');
					
					$timeout(function () {
						$parse($attrs.dragEnter)($scope, {$event: e, $element: $element, $data: $rootScope.$dragDropData});
					});
				});
				$element.on('dragleave', function (e) {
					e.preventDefault();
					e.stopPropagation();
					
					$element.removeClass('dragover');
					
					$timeout(function () {
						$parse($attrs.dragLeave)($scope, {$event: e, $element: $element, $data: $rootScope.$dragDropData});
					});
				});
				
				$element.on('drop', function (e) {
					e.preventDefault();
					e.stopPropagation();

					$element.removeClass('dragover');
					
					$timeout(function () {
						$parse($attrs.dragDrop)($scope, {$event: e, $element: $element, $data: $rootScope.$dragDropData});
					});
				});
			},
		};
	})
	.directive('fileChange', function ($parse) {
		return {
			restrict: 'A',
			link: function ($scope, $element, $attrs) {
				$element.on('change', e => {
					$parse($attrs.fileChange)($scope, {$event: e});
				});
			},
		};
	});