'use strict';

angular.module('miUtil', []).run(["$rootScope", "$document", "$timeout", function ($rootScope, $document, $timeout) {
	// remove 300ms click delay on touch devices
	if (FastClick) FastClick.attach(document.body);

	// fix vh units in ios7 (and others)
	if (viewportUnitsBuggyfill) viewportUnitsBuggyfill.init();

	// menu
	var $menu = $rootScope.$menu = {
		active: false,
		open: function open(e) {
			$menu.active = true;
			if (e) e.stopPropagation();
		},
		close: function close(e) {
			$menu.active = false;
			if (e) e.stopPropagation();
		},
		toggle: function toggle(e) {
			$menu.active = !$menu.active;
			if (e) e.stopPropagation();
		}
	};
	// close the menu as soon as you click
	$document.on('click', function () {
		$timeout(function () {
			$menu.close();
		});
	});
	// allow Esc key to close menu
	$document.on('keyup', function (e) {
		if (e.keyCode === 27 /*esc*/) {
				$timeout(function () {
					$menu.close();
				});
			}
	});
	// prevent scroll bubbling when menu open
	$rootScope.miUtilPreventScrollOnMenuActive = true;
	$rootScope.$watch('$menu.active', function (v) {
		if ($rootScope.miUtilPreventScrollOnMenuActive) {
			angular.element(document.body).css({
				overflow: v ? 'hidden' : ''
			});
		}
	});

	// modal
	var $modal = $rootScope.$modal = {
		active: false,
		open: function open(id) {
			$modal.active = id;
		},
		close: function close() {
			$modal.active = false;
		},
		toggle: function toggle(id) {
			$modal.active = $modal.active === id ? false : id;
		},
		isOpen: function isOpen(id) {
			return $modal.active === id;
		}
	};
	// allow Esc key to close modal
	$document.on('keyup', function (e) {
		if (e.keyCode === 27 /*esc*/) {
				$timeout(function () {
					$modal.close();
				});
			}
	});
	// prevent scroll bubbling when modal open
	$rootScope.$watch('$modal.active', function (v) {
		angular.element(document.body).css({
			overflow: v ? 'hidden' : ''
		});
		$rootScope.$broadcast('$modal.' + (v ? 'open' : 'close'));
	});
}]).filter('length', function () {
	return function (obj) {
		return angular.isArray(obj) ? obj.length : angular.isObject(obj) ? Object.keys(obj).filter(function (v) {
			return v[0] != '$';
		}).length : 0;
	};
}).filter('unique', function () {
	return function (array, key) {
		if (!array) return array;

		var o = {},
		    r = [];

		for (var i = 0; i < array.length; i++) {
			o[angular.isFunction(key) ? key(array[i]) : array[i][key]] = array[i];
		}
		for (var k in o) {
			r.push(o[k]);
		}
		return r;
	};
}).directive('miIcon', function () {
	return {
		scope: { svg: '@', size: '@' },
		restrict: 'E',
		replace: true,
		templateNamespace: 'svg',
		template: '<svg xmlns="http://www.w3.org/2000/svg" class="mi-icon" style="display: inline-block; width: {{ size || 16 }}px; height: {{ size || 16 }}px; fill: currentColor; vertical-align: middle;"><use xlink:href="" /></svg>',
		link: function link($scope, $element, $attrs) {
			// manual scope override to avoid initial svg attr set issue/error
			$attrs.$observe('svg', function (svg) {
				$element.children().attr('xlink:href', 'assets/icons.svg#' + svg);
			});
		}
	};
}).directive('miModal', function () {
	return {
		scope: { id: '@' },
		restrict: 'E',
		replace: true,
		transclude: true,
		template: '<aside ng-show="$modal.isOpen(id)" ng-click="$modal.close()" class="mi-modal-container" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0;">\n\t\t\t\t<div class="mi-modal">\n\t\t\t\t\t<div ng-click="$event.stopPropagation()" class="mi-modal-content" ng-transclude></div>\n\t\t\t\t\t<a ng-click="$modal.close()" class="mi-modal-close">\n\t\t\t\t\t\t<mi-icon svg="x"></mi-icon>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t</aside>'
	};
}).directive('miClickToggle', ["$timeout", "$parse", function ($timeout, $parse) {
	return {
		restrict: 'A',
		link: function link($scope, $element, $attrs) {
			var obj = $scope.$eval($attrs.miClickToggle);
			$element.on('click', function (e) {
				e.preventDefault();

				$timeout(function () {
					angular.forEach(obj, function (v, k) {
						return $parse(k).assign($scope, v);
					});
				});
			});
			angular.forEach(obj, function (v, k) {
				$scope.$watch(k, function (newV) {
					if (newV !== undefined) $element[v === newV ? 'addClass' : 'removeClass']($scope.$eval($attrs.miClickToggleActive) || 'active');
				});
			});
		}
	};
}]);
'use strict';

angular.module('group-by-weight', []).controller('AppCtrl', ["$scope", "$timeout", "$window", function ($scope, $timeout, $window) {
	$scope.groups = [{
		$id: 1,
		name: 'Alcohol',
		items: []
	}, {
		$id: 2,
		name: 'Entertainment',
		items: []
	}, {
		$id: 0,
		name: 'Food',
		items: []
	}, {
		$id: 3,
		name: 'Household',
		items: []
	}, {
		$id: 4,
		name: 'Lifestyle',
		items: []
	}, {
		$id: 5,
		name: 'Ignore',
		items: [],
		background: 'rgba(0,0,0,.2)'
	}];

	$scope.colors = [];
	$scope.$watch('groups', function (groups) {
		$scope.colors = [];
		for (var i = 0; i < 360; i += 360 / groups.length) {
			$scope.colors.push('hsla(' + i + ', ' + (90 + Math.random() * 10) + '%, ' + (50 + Math.random() * 10) + '%, .2)');
		}
	});

	var refresh = function refresh(e) {
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

		var input = inputEl.getBoundingClientRect(),
		    output = outputEl.getBoundingClientRect(),
		    width = output.left - (input.left + input.width);

		return 'M0 ' + input.top + ' C' + width / 2 + ' ' + input.top + ', ' + width / 2 + ' ' + output.top + ', ' + width + ' ' + output.top + ' v' + output.height + ' C' + width / 2 + ' ' + (output.top + output.height) + ', ' + width / 2 + ' ' + (input.top + input.height) + ', 0 ' + (input.top + input.height) + ' v' + -input.height;
	};

	var selected = [];
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
		group.items.map(function (item) {
			return group.$sum += item.amount;
		});
		return group.$sum;
	};
	$scope.len = function (group) {
		return group.$len = group.items.length || 0;
	};
	$scope.abs = function (num) {
		return Math.abs(num);
	};

	$scope.moveItem = function (source, index, destination) {
		destination.push(source.splice(parseInt(index), 1)[0]);
	};
	$scope.parseCSV = function (files) {
		var reader = new FileReader();
		reader.onload = function (e) {
			$timeout(function () {
				$scope.items = [];
				CSV.parse(e.target.result).map(function (row, i) {
					if (!i) return;

					$scope.items.push({
						name: row[4] + '\n' + row[5],
						date: row[2],
						amount: parseFloat(row[6].toString().replace(/\(([^\)]+)\)/g, '-$1').replace(/[^\d\.\-]/g, ''))
					});
				});
			});
		};
		reader.readAsText(files[0]);
	};
}])

// drop-n-drop
.directive('drag', ["$rootScope", "$parse", "$timeout", function ($rootScope, $parse, $timeout) {
	return {
		restrict: 'A',
		link: function link($scope, $element, $attrs) {
			var draggable = true,
			    effect = $attrs.dragEffect || 'move';

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
						$parse($attrs.dragStart)($scope, { $event: e, $element: $element });
					});
				}
			});

			$element.on('dragend', function (e) {
				if (draggable) {
					$element.removeClass('dragging');

					$timeout(function () {
						$parse($attrs.dragEnd)($scope, { $event: e, $element: $element, $data: $rootScope.$dragDropData });
						$rootScope.$dragDropData = undefined;
					});
				}
			});
		}
	};
}]).directive('dragDrop', ["$rootScope", "$parse", "$timeout", function ($rootScope, $parse, $timeout) {
	return {
		restrict: 'A',
		link: function link($scope, $element, $attrs) {
			var effect = $attrs.dragEffect || 'move';

			// hook events
			$element.on('dragover', function (e) {
				e.preventDefault();
				e.stopPropagation();
				e.dataTransfer.dropEffect = effect;

				$element.addClass('dragover');

				$timeout(function () {
					$parse($attrs.dragOver)($scope, { $event: e, $element: $element, $data: $rootScope.$dragDropData });
				});
			});

			$element.on('dragenter', function (e) {
				e.preventDefault();
				e.stopPropagation();

				$element.addClass('dragover');

				$timeout(function () {
					$parse($attrs.dragEnter)($scope, { $event: e, $element: $element, $data: $rootScope.$dragDropData });
				});
			});
			$element.on('dragleave', function (e) {
				e.preventDefault();
				e.stopPropagation();

				$element.removeClass('dragover');

				$timeout(function () {
					$parse($attrs.dragLeave)($scope, { $event: e, $element: $element, $data: $rootScope.$dragDropData });
				});
			});

			$element.on('drop', function (e) {
				e.preventDefault();
				e.stopPropagation();

				$element.removeClass('dragover');

				$timeout(function () {
					$parse($attrs.dragDrop)($scope, { $event: e, $element: $element, $data: $rootScope.$dragDropData });
				});
			});
		}
	};
}]).directive('fileChange', ["$parse", function ($parse) {
	return {
		restrict: 'A',
		link: function link($scope, $element, $attrs) {
			$element.on('change', function (e) {
				$parse($attrs.fileChange)($scope, { $event: e });
			});
		}
	};
}]);