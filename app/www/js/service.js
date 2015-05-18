'use strict';

/**
 * @ngdoc function
 * @name starter.factory
 * @description
 * Service to hold controller's $scope and share data between scopes
 *
**/
angular.module('starter')

.factory('Scopes', function($rootScope) {
	var mem = {};

	return {
		isEmpty: function() {
			return Object.keys(mem).length === 0;
		},
		store: function(key, value) {
			mem[key] = value;
		},
		get: function(key) {
			return mem[key];
		}
	};
});