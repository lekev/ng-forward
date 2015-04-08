'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _expect = require('chai');

var _decorateDirective = require('./decorate-directive');

var _Module = require('../module/module');

var _sinon = require('sinon');

var _sinon2 = _interopRequireWildcard(_sinon);

describe('Directive decorator', function () {
	it('should decorate a target with the given name and type', function () {
		var Example = function Example() {
			_classCallCheck(this, Example);
		};

		_decorateDirective.decorateDirective(Example, 'test', 'E');

		_expect.expect(Example).to.have.property('$component');
		_expect.expect(Example).to.have.property('$provider');
		_expect.expect(Example.$provider.name).to.equal('test');
		_expect.expect(Example.$provider.type).to.equal('directive');
		_expect.expect(Example.$component.restrict).to.equal('E');
	});

	it('should attach a scope binding expression if a binder is provided', function () {
		var Example = function Example() {
			_classCallCheck(this, Example);
		};

		_decorateDirective.decorateDirective(Example, 'test', 'E', { myAttr: '=' });

		_expect.expect(Example.$component).to.have.property('scope');
		_expect.expect(Example.$component.scope).to.have.property('myAttr', '=');
	});

	it('should set bindToController:true; if a binder is provided', function () {
		var Example = function Example() {
			_classCallCheck(this, Example);
		};

		_decorateDirective.decorateDirective(Example, 'test', 'E', { myAttr: '=' });

		_expect.expect(Example.$component).to.have.property('bindToController', true);
	});

	it('should merge binders if used on a subclass', function () {
		var Example = function Example() {
			_classCallCheck(this, Example);
		};

		_decorateDirective.decorateDirective(Example, 'test', 'E', { myAttr: '=' });

		var NewExample = (function (_Example) {
			function NewExample() {
				_classCallCheck(this, NewExample);

				if (_Example != null) {
					_Example.apply(this, arguments);
				}
			}

			_inherits(NewExample, _Example);

			return NewExample;
		})(Example);

		_decorateDirective.decorateDirective(NewExample, 'test', 'A', { newAttr: '&' });

		_expect.expect(NewExample.$component.scope).to.have.property('myAttr', '=');
		_expect.expect(NewExample.$component.scope).to.have.property('newAttr', '&');
	});

	describe('parser', function () {
		it('should be registered with Module', function () {
			var parser = _Module.Module.getParser('directive');

			_expect.expect(parser).to.be.defined;
		});

		it('should register a directive on a module', function () {
			var parser = _Module.Module.getParser('directive');
			var module = {
				directive: _sinon2['default'].spy()
			};

			var MyComponent = (function () {
				function MyComponent() {
					_classCallCheck(this, MyComponent);
				}

				_createClass(MyComponent, null, [{
					key: 'link',
					value: function link() {}
				}, {
					key: 'compile',
					value: function compile() {}
				}]);

				return MyComponent;
			})();

			_decorateDirective.decorateDirective(MyComponent, 'myComponent', 'E', { myAttr: '=' });

			parser(MyComponent, module);

			var name = module.directive.args[0][0];
			var provider = module.directive.args[0][1];
			var directive = provider();
			var controller = directive.controller;
			delete controller.$provider;
			delete controller.$component;

			_expect.expect(name).to.equal('myComponent');
			_expect.expect(directive).to.eql({
				restrict: 'E',
				bindToController: true,
				scope: { myAttr: '=' },
				link: MyComponent.link,
				controller: controller,
				compile: MyComponent.compile,
				controllerAs: 'MyComponent'
			});

			_expect.expect(directive.controller).to.not.have.property('$component');
			_expect.expect(directive.controller).to.not.have.property('$provider');
		});
	});
});