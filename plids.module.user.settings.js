/// <amd-module name="plids.module.user.settings"/>
/// <amd-dependency path="json!/DesktopModules/plids/API/v1/Utils/Localization?modulePath=PlidsUser&view=plids.module.user.settings" name="localize"/>
/// <amd-dependency path="text!/DesktopModules/PlidsUser/Scripts/plids.module.user.settings.template.htm" name="template"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("plids.module.user.settings", ["require", "exports", "json!/DesktopModules/plids/API/v1/Utils/Localization?modulePath=PlidsUser&view=plids.module.user.settings", "text!/DesktopModules/PlidsUser/Scripts/plids.module.user.settings.template.htm", "knockout", "plids.common"], function (require, exports, localize, template, ko, plids) {
    "use strict";
    var initData;
    var initModule;
    var BaseSettingsMenuItem = (function () {
        function BaseSettingsMenuItem(settingType, label, isActive) {
            if (isActive === void 0) { isActive = false; }
            var _this = this;
            this.change = function (activityPath) {
                _this.isActive(activityPath.SubType == _this.settingType);
            };
            this.settingType = settingType;
            this.label = label;
            this.isActive = ko.observable(isActive);
            this.href = ko.computed(function () {
                if (_this.isActive()) {
                    return false;
                }
                else {
                    return "/" + String.locale.substr(0, 2) + "/settings/" + _this.settingType;
                }
            }, [this.isActive]);
        }
        return BaseSettingsMenuItem;
    }());
    var settings = (function (_super) {
        __extends(settings, _super);
        function settings(initData, initModule) {
            var _this = _super.call(this) || this;
            _this.componentName = "plids-module-user-settings-component";
            _this.readyCounter = 0;
            _this.syncBindingCalls = [];
            _this.updateMenu = function (activityPath) {
                _this.menuItems.forEach(function (menuItem) {
                    menuItem.change(activityPath);
                });
            };
            _this.changePath = function (activityPath, applyComponent) {
                plids.common.loadModuleComponents(["plids.module.user.settings" + (typeof activityPath.SubType !== "undefined" ? ("." + activityPath.SubType) : "")], function (vm) {
                    _this.updateMenu(activityPath);
                    vm.changePath(activityPath, function (syncBindingCall) {
                        _this.settingLabel(vm.localize["Setting.Heading"]);
                        _this.setModuleComponent(vm);
                        if (typeof syncBindingCall === "function") {
                            syncBindingCall();
                        }
                        applyComponent();
                    });
                });
            };
            if (typeof initData !== "undefined" && typeof initModule !== "undefined") {
                _this.menuItems = [
                    new BaseSettingsMenuItem("account", localize["Menu.Account"], initData.component == "account"),
                    new BaseSettingsMenuItem("security", localize["Menu.Security"], initData.component == "security"),
                    new BaseSettingsMenuItem("password", localize["Menu.Password"], initData.component == "password"),
                ];
                _this.setModuleComponent(initModule);
            }
            else {
                _this.menuItems = [
                    new BaseSettingsMenuItem("account", localize["Menu.Account"]),
                    new BaseSettingsMenuItem("security", localize["Menu.Security"]),
                    new BaseSettingsMenuItem("password", localize["Menu.Password"]),
                ];
            }
            _this.settingLabel = ko.observable("");
            _this.isMobileDisplay = ko.computed(function () {
                return plids.skin.displayMode() == 1;
            }, [plids.skin.displayMode]);
            return _this;
        }
        return settings;
    }(plids.moduleComponentHolderBase));
    var instance = new settings(initData, initModule);
    ko.components.register(instance.componentName, {
        template: template,
        viewModel: { instance: instance }
    });
    return instance;
});
