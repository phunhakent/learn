/// <amd-module name="plids.module.user.settings.account"/>
/// <amd-dependency path="json!/DesktopModules/plids/API/v1/Utils/Localization?modulePath=PlidsUser&view=plids.module.user.settings.account" name="localize"/>
/// <amd-dependency path="text!/DesktopModules/PlidsUser/Scripts/plids.module.user.settings.account.template.htm" name="template"/>
define("plids.module.user.settings.account", ["require", "exports", "json!/DesktopModules/plids/API/v1/Utils/Localization?modulePath=PlidsUser&view=plids.module.user.settings.account", "text!/DesktopModules/PlidsUser/Scripts/plids.module.user.settings.account.template.htm", "jquery", "plids.common", "knockout"], function (require, exports, localize, template, $, plids, ko) {
    "use strict";
    var accountSettings = (function () {
        function accountSettings(initData) {
            var _this = this;
            this.componentName = "plids-module-user-settings-account-component";
            this.canEdit = !plids.common.user.IsAnonymous;
            this.save = function (data, event) {
                if (_this.errors().length == 0 && !_this.isSaving()) {
                    _this.saved(false);
                    _this.isSaving(true);
                    plids.api.userProfile_settingsAccount_post({
                        Email: _this.email(),
                        PreferedLanguage: _this.preferedLanguage(),
                    }, function (data) {
                        var hasError = false;
                        if (["Success", "Unchanged"].indexOf(data.Email) == -1) {
                            $("[name='account-email']").next("span.label").text(localize["Error.Email." + data.Email]).show();
                            hasError = true;
                        }
                        else if (data.Email == "Success") {
                            location.reload();
                        }
                        if (["Success", "Unchanged"].indexOf(data.PreferedLanguage) == -1) {
                            $("[name='account-language']").next("span.label").text(localize["Error.PreferedLanguage." + data.PreferedLanguage]).show();
                            hasError = true;
                        }
                        if (!hasError) {
                            _this.saved(true);
                            _this.currentSettings({
                                Email: _this.email(),
                                PreferedLanguage: _this.preferedLanguage()
                            });
                        }
                    }, function () { _this.isSaving(false); });
                }
                else {
                    _this.errors.showAllMessages();
                }
            };
            this.refresh = function (callback) {
                plids.api.userProfile_settingsAccount_get(function (data) {
                    callback(function () {
                        _this.email(data.Email);
                        _this.preferedLanguage(data.PreferedLanguage);
                        _this.currentSettings(data);
                    });
                });
            };
            this.changePath = function (activityPath, applyComponent) {
                _this.refresh(applyComponent);
            };
            this.beforeLeave = function () {
                _this.email(_this.currentSettings().Email);
                _this.preferedLanguage(_this.currentSettings().PreferedLanguage);
                _this.saved(false);
                _this.isSaving(false);
                _this.errors.showAllMessages(false);
            };
            this.localize = localize;
            this.lGlobal = plids.common.lGlobal;
            this.email = ko.observable("").extend({
                required: {
                    message: localize["Error.Email.Required"]
                },
                email: {
                    message: localize["Error.Email.Invalid"]
                },
            });
            this.preferedLanguage = ko.observable("en-US").extend({
                required: {
                    message: localize["Error.PreferedLanguage.Required"]
                }
            });
            this.preferedLanguageOptions = [
                {
                    value: "en-US",
                    text: localize["PreferedLanguage.en-US"]
                },
                {
                    value: "de-DE",
                    text: localize["PreferedLanguage.de-DE"]
                }
            ];
            this.currentSettings = ko.observable(null);
            this.canSave = ko.computed(function () {
                var email = ko.unwrap(_this.email);
                var preferedLanguage = ko.unwrap(_this.preferedLanguage);
                var currentSettings = ko.unwrap(_this.currentSettings);
                return currentSettings != null &&
                    ((_this.email.isValid() && email != currentSettings.Email)
                        || (_this.preferedLanguage.isValid() && preferedLanguage != currentSettings.PreferedLanguage));
            }, [this.email, this.preferedLanguage, this.currentSettings]);
            this.isSaving = ko.observable(false);
            this.saved = ko.observable(false);
            this.errors = ko.validation.group([this.email, this.preferedLanguage]);
        }
        return accountSettings;
    }());
    var instance = new accountSettings();
    ko.components.register(instance.componentName, {
        template: template,
        viewModel: { instance: instance }
    });
    return instance;
});
