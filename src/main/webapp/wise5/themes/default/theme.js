'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _themeController = require('./themeController');

var _themeController2 = _interopRequireDefault(_themeController);

var _themeComponents = require('./themeComponents');

var _themeComponents2 = _interopRequireDefault(_themeComponents);

require('./js/webfonts');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var themeModule = angular.module('theme', ['theme.components']).controller(_themeController2.default.name, _themeController2.default);

exports.default = themeModule;
//# sourceMappingURL=theme.js.map