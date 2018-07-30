/// <amd-module name="plids.module.user.hits"/>
/// <amd-dependency path="json!/DesktopModules/plids/API/v1/Utils/Localization?modulePath=PlidsUser&view=plids.module.user.hits" name="localize"/>
/// <amd-dependency path="text!/DesktopModules/PlidsUser/Scripts/plids.module.user.hits.template.htm" name="template"/>
define("plids.module.user.hits", ["require", "exports", "json!/DesktopModules/plids/API/v1/Utils/Localization?modulePath=PlidsUser&view=plids.module.user.hits", "text!/DesktopModules/PlidsUser/Scripts/plids.module.user.hits.template.htm", "jquery", "plids.common", "knockout"], function (require, exports, localize, template, $, plids, ko) {
    "use strict";
    var initData;
    var hits = (function () {
        function hits(initData) {
            var _this = this;
            this.componentName = "plids-module-user-hits-component";
            this.refresh = function (data, event) {
                _this.noActivity(false);
                _this.feedbacks([]);
                _this.isLoading(false);
                _this.canLoadMore(false);
                _this.haveNews(false);
                _this.load(data, event);
            };
            this.load = function (data, event) {
                if (!_this.isLoading()) {
                    _this.isLoading(true);
                    plids.api.feedback_loadMore_get({
                        userIdentity: _this.userIdentity,
                        lastModifiedOnDate: _this.loadMoreFromDateTime(),
                        size: 10,
                    }, function (data) {
                        if (data.length == 0) {
                            _this.canLoadMore(false);
                            if (_this.loadMoreFromDateTime() == null) {
                                _this.noActivity(true);
                            }
                        }
                        else {
                            _this.feedbacks.push.apply(_this.feedbacks, ko.utils.arrayMap(data, function (feedback) {
                                return new plids.FeedbackResponse(feedback, function () {
                                    //new - ignore - notify
                                    //update - update
                                    //replaced - setUnowner - notify
                                    //this.refresh();
                                });
                            }));
                            if (data.length < 10) {
                                _this.canLoadMore(false);
                            }
                            else {
                                _this.canLoadMore(true);
                            }
                        }
                        _this.isLoading(false);
                    });
                }
            };
            this.changePath = function (activityPath, applyComponent) {
                var userIdentity = activityPath.OwnerFriendlyPath || "";
                if (userIdentity == plids.common.user.FriendlyPath || userIdentity == plids.common.user.UserID.toString()) {
                    userIdentity = "";
                }
                if (_this.userIdentity != userIdentity) {
                    _this.userIdentity = userIdentity;
                    _this.refresh();
                }
                else {
                    _this.setOnWindowScroll(_this.canLoadMoreBak);
                }
                plids.common.observationHub.obserseUserHits(_this.userIdentity, function (observingUserID) {
                    _this.observingUserID = observingUserID;
                });
                applyComponent();
            };
            this.onWindowScroll = function (e) {
                clearTimeout(_this.scrollTimeout);
                _this.scrollTimeout = setTimeout(function () {
                    if (($(window).scrollTop() + $(window).height() + 150) > $(document).height()) {
                        _this.load();
                    }
                }, 300);
            };
            this.setOnWindowScroll = function (enable) {
                if (typeof enable === "undefined" || enable) {
                    $(window).on("scroll", _this.onWindowScroll);
                }
                else {
                    clearTimeout(_this.scrollTimeout);
                    $(window).off("scroll", _this.onWindowScroll);
                }
            };
            this.userHitsChanged = function (userID, type) {
                if (userID == _this.observingUserID) {
                    if (userID != plids.common.user.UserID) {
                        _this.haveNews(true);
                    }
                    else {
                        if (plids.common.activityStatus.ActivityType == "hits") {
                            _this.haveNews(true);
                        }
                        else {
                            _this.refresh();
                        }
                    }
                }
            };
            this.beforeLeave = function () {
                _this.setOnWindowScroll(false);
                _this.canLoadMoreBak = _this.canLoadMore();
            };
            this.localize = localize;
            this.lGlobal = plids.common.lGlobal;
            if (typeof initData !== "undefined") {
                this.userIdentity = initData.userIdentity;
                this.feedbacks = ko.observableArray(ko.utils.arrayMap(initData.feedbacks, function (feedback) {
                    return new plids.FeedbackResponse(feedback);
                }));
                if (initData.feedbacks.length > 0) {
                    this.noActivity = ko.observable(false);
                    this.canLoadMore = ko.observable(initData.feedbacks.length == 10);
                }
                else {
                    this.noActivity = ko.observable(true);
                    this.canLoadMore = ko.observable(false);
                }
            }
            else {
                this.userIdentity = undefined;
                this.feedbacks = ko.observableArray([]);
                this.noActivity = ko.observable(false);
                this.canLoadMore = ko.observable(false);
            }
            this.haveNews = ko.observable(false);
            this.isLoading = ko.observable(false);
            this.loadMoreFromDateTime = ko.computed(function () {
                var a = ko.unwrap(_this.feedbacks);
                return a.length > 0 ? a[a.length - 1].lastModifiedOnDate() : null;
            }, this);
            this.canLoadMore.subscribe(this.setOnWindowScroll);
            plids.common.observationHub.userHitsChanged = this.userHitsChanged;
        }
        return hits;
    }());
    var instance = new hits(initData);
    ko.components.register(instance.componentName, {
        template: template,
        viewModel: { instance: instance }
    });
    return instance;
});
