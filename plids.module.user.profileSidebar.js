/// <amd-module name="plids.module.user.profileSidebar"/>
/// <amd-dependency path="json!/DesktopModules/plids/API/v1/Utils/Localization?modulePath=PlidsUser&view=plids.module.user.profileSidebar" name="localize"/>
/// <amd-dependency path="text!/DesktopModules/PlidsUser/Scripts/plids.module.user.profileSidebar.template.htm" name="template"/>
define("plids.module.user.profileSidebar", ["require", "exports", "json!/DesktopModules/plids/API/v1/Utils/Localization?modulePath=PlidsUser&view=plids.module.user.profileSidebar", "text!/DesktopModules/PlidsUser/Scripts/plids.module.user.profileSidebar.template.htm", "jquery", "plids.common", "knockout"], function (require, exports, localize, template, $, plids, ko) {
    "use strict";
    var initData;
    var profileSidebar = (function () {
        function profileSidebar(initData) {
            var _this = this;
            this.componentName = "plids-module-user-profileSidebar-component";
            this.isSendingFollowingRequest = false;
            this.userStatsChanged = function (data) {
                if (data.UserID == _this.userID) {
                    _this.groupCompetence(new plids.RankValueWithHint(data.GroupCompetence));
                    _this.evaluationsChart(new plids.FiveStarHorizontalChart(data.Evaluations, "col-xs-9"));
                    _this.feedbacksChart(new plids.FiveStarHorizontalChart(data.Feedbacks, "col-xs-9"));
                    _this.evaluations(data.Evaluations.Total);
                    _this.feedbacks(data.Feedbacks.Total);
                }
            };
            this.refresh = function (applyComponent) {
                plids.api.userProfile_profileStats_get(_this.userIdentity, function (data) {
                    applyComponent(function () {
                        _this.userID = data.UserID;
                        _this.displayName(data.UserDisplayName);
                        _this.profilePic(plids.common.getUserProfilePic(data.UserID, 120, 120));
                        _this.friendlyPath(data.UserFriendlyPath);
                        _this.biography(data.Biography);
                        _this.joinedOnDate(new plids.TimeAgo(data.JoinedOnDate));
                        _this.evaluations(data.Evaluations.Total);
                        _this.feedbacks(data.Feedbacks.Total);
                        _this.groupCompetence(new plids.RankValueWithHint(data.GroupCompetence));
                        _this.evaluationsChart(new plids.FiveStarHorizontalChart(data.Evaluations, "col-xs-9"));
                        _this.feedbacksChart(new plids.FiveStarHorizontalChart(data.Feedbacks, "col-xs-9"));
                        _this.isFollowing(data.IsFollowing);
                        _this.isOwner(_this.userID == plids.common.user.UserID);
                        _this.userLink("/" + String.locale.substr(0, 2) + "/" + (data.UserFriendlyPath != null ? data.UserFriendlyPath : data.UserID));
                        plids.common.activityStatus.ActivitysOwnerUserID = data.UserID;
                        plids.common.activityStatus.ActivitysOwnerFriendlyPath = data.UserFriendlyPath;
                        plids.common.activityStatus.ActivitysOwnerDisplayName = data.UserDisplayName;
                        plids.common.observationHub.obserseUserProfileStat(_this.userID);
                    });
                });
            };
            this.setFollowFlag = function (data, event) {
                if (plids.common.user.IsAuthenticated) {
                    $(event.currentTarget).find("i").removeClass("fa-plus").addClass("fa-spin fa-circle-o-notch");
                    if (!_this.isSendingFollowingRequest) {
                        _this.isSendingFollowingRequest = true;
                        plids.api.userProfile_followUser_post({
                            UserID: data.userID
                        }, function () {
                            data.isFollowing(true);
                        }, function () {
                            data.isSendingFollowingRequest = false;
                        });
                    }
                }
                else {
                    plids.common.showAnonymousModal();
                }
            };
            this.setUnFollowFlag = function (data, event) {
                $(event.currentTarget).find("i").removeClass("fa-check").addClass("fa-spin fa-circle-o-notch");
                if (!_this.isSendingFollowingRequest) {
                    _this.isSendingFollowingRequest = true;
                    plids.api.userProfile_unfollowUser_post({
                        UserID: data.userID
                    }, function () {
                        data.isFollowing(false);
                    }, function () {
                        data.isSendingFollowingRequest = false;
                    });
                }
            };
            this.changePath = function (activityPath, applyComponent) {
                var userIdentity = activityPath.OwnerFriendlyPath || "";
                if (userIdentity == plids.common.user.FriendlyPath || userIdentity == plids.common.user.UserID.toString()) {
                    userIdentity = "";
                }
                _this.isEditMode(false);
                if (_this.userIdentity != userIdentity) {
                    _this.userIdentity = userIdentity;
                    _this.refresh(applyComponent);
                }
                else {
                    applyComponent(function () {
                        plids.common.activityStatus.ActivitysOwnerUserID = _this.userID;
                        plids.common.activityStatus.ActivitysOwnerFriendlyPath = _this.friendlyPath();
                        plids.common.activityStatus.ActivitysOwnerDisplayName = _this.displayName();
                        plids.common.observationHub.obserseUserProfileStat(_this.userID);
                    });
                }
            };
            this.cancelEditMode = function (data, event) {
                _this.isEditMode(false);
                _this.profileImageCropper(null);
                _this.newFriendlyPath("");
                _this.newDisplayName("");
                _this.newBiography("");
                _this.editErrors.showAllMessages(false);
            };
            this.saveEdit = function (data, event) {
                if (_this.editErrors().length == 0) {
                    _this.isSaving(true);
                    plids.api.userProfile_editProfile_post({
                        NewDisplayName: _this.newDisplayName(),
                        NewFriendlyPath: _this.newFriendlyPath(),
                        NewBiography: _this.newBiography()
                    }, function (data) {
                        if (data.Saved) {
                            var changedFriendlyPath = _this.friendlyPath() != _this.newFriendlyPath();
                            var changedDisplayName = _this.displayName() != _this.newDisplayName();
                            _this.friendlyPath(_this.newFriendlyPath());
                            _this.displayName(_this.newDisplayName());
                            _this.biography(_this.newBiography());
                            _this.isEditMode(false);
                            if (changedFriendlyPath) {
                                var activityPath = plids.common.getActivityPath(location.pathname);
                                activityPath.OwnerFriendlyPath = _this.friendlyPath();
                                location.replace(plids.common.getHrefByActivityPath(activityPath));
                            }
                            else {
                                if (changedDisplayName) {
                                    location.reload();
                                }
                            }
                        }
                        else {
                            if (data.Status.DisplayName != "Success") {
                                $("[name='new-display-name']").next("span.label").text(_this.localize["Error.DisplayName." + data.Status.DisplayName]).show();
                            }
                            if (data.Status.FriendlyPath != "Success") {
                                $("[name='new-friendly-path']").next("span.label").text(_this.localize["Error.FriendlyPath." + data.Status.FriendlyPath]).show();
                            }
                        }
                    }, function () {
                        _this.isSaving(false);
                    });
                }
                else {
                    _this.editErrors.showAllMessages();
                }
            };
            this.editProfile = function (data, event) {
                var icon = $(event.currentTarget).find("i");
                plids.common.lazyLoad(["jquery.fileupload", "croppie"], function (fileUpload, croppie) {
                    icon.addClass("fa-pencil").removeClass("fa-circle-o-notch fa-spin");
                    _this.isEditMode(true);
                    _this.profileImageCropper(new imageCropper("#crop-user-photo-pick", _this.profilePic));
                    _this.newFriendlyPath(_this.friendlyPath());
                    _this.newDisplayName(_this.displayName());
                    _this.newBiography(_this.biography());
                    _this.editErrors.showAllMessages(false);
                    if ($("#croppiecss").length == 0) {
                        var link = document.createElement("link");
                        link.id = "croppiecss";
                        link.type = "text/css";
                        link.rel = "stylesheet";
                        link.href = "/Resources/Shared/plids/Croppie-2.1.1/croppie.css";
                        document.head.appendChild(link);
                    }
                }, function () {
                    icon.addClass("fa-circle-o-notch fa-spin").removeClass("fa-pencil");
                });
            };
            this.inputOnEnter = function (data, event) {
                if (event.keyCode == 13) {
                    event.preventDefault();
                    return false;
                }
                return true;
            };
            this.localize = localize;
            this.lGlobal = plids.common.lGlobal;
            if (typeof initData == "object") {
                if (initData.userIdentity == plids.common.user.FriendlyPath || initData.userIdentity == plids.common.user.UserID.toString()) {
                    this.userIdentity = "";
                }
                else {
                    this.userIdentity = initData.userIdentity;
                }
                this.isOwner = ko.observable(initData.profileStats.UserID == plids.common.user.UserID);
                this.userID = initData.profileStats.UserID;
                this.displayName = ko.observable(initData.profileStats.UserDisplayName);
                this.profilePic = ko.observable(plids.common.getUserProfilePic(initData.profileStats.UserID, 120, 120));
                this.friendlyPath = ko.observable(initData.profileStats.UserFriendlyPath);
                this.biography = ko.observable(initData.profileStats.Biography);
                this.joinedOnDate = ko.observable(new plids.TimeAgo(initData.profileStats.JoinedOnDate));
                this.evaluations = ko.observable(initData.profileStats.Evaluations.Total);
                this.feedbacks = ko.observable(initData.profileStats.Feedbacks.Total);
                this.groupCompetence = ko.observable(new plids.RankValueWithHint(initData.profileStats.GroupCompetence));
                this.evaluationsChart = ko.observable(new plids.FiveStarHorizontalChart(initData.profileStats.Evaluations, "col-xs-9"));
                this.feedbacksChart = ko.observable(new plids.FiveStarHorizontalChart(initData.profileStats.Feedbacks, "col-xs-9"));
                this.isFollowing = ko.observable(initData.profileStats.IsFollowing);
                this.userLink = ko.observable("/" + String.locale.substr(0, 2) + "/" + (initData.profileStats.UserFriendlyPath != null ? initData.profileStats.UserFriendlyPath : initData.profileStats.UserID));
                plids.common.activityStatus.ActivitysOwnerUserID = initData.UserID;
                plids.common.activityStatus.ActivitysOwnerFriendlyPath = initData.UserFriendlyPath;
                plids.common.activityStatus.ActivitysOwnerDisplayName = initData.UserDisplayName;
                plids.common.observationHub.obserseUserProfileStat(initData.profileStats.UserID);
            }
            else {
                this.userIdentity = undefined;
                this.userID = 0;
                this.displayName = ko.observable("");
                this.profilePic = ko.observable("");
                this.friendlyPath = ko.observable("");
                this.biography = ko.observable("");
                this.joinedOnDate = ko.observable(new plids.TimeAgo());
                this.evaluations = ko.observable(0);
                this.feedbacks = ko.observable(0);
                this.groupCompetence = ko.observable(null);
                this.evaluationsChart = ko.observable(new plids.FiveStarHorizontalChart({ Total: 0 }, "col-xs-9"));
                this.feedbacksChart = ko.observable(new plids.FiveStarHorizontalChart({ Total: 0 }, "col-xs-9"));
                this.isFollowing = ko.observable(false);
                this.isOwner = ko.observable(false);
                this.userLink = ko.observable("");
            }
            this.isSendingFollowingRequest = false;
            this.isEditMode = ko.observable(false);
            this.profileImageCropper = ko.observable(null);
            this.isMobileDisplay = ko.computed(function () {
                return plids.skin.displayMode() == 1;
            }, [plids.skin.displayMode]);
            this.canEdit = ko.computed(function () {
                return _this.isOwner() && !plids.common.user.IsAnonymous;
            }, [this.isOwner]);
            this.newFriendlyPath = ko.observable("").extend({
                required: {
                    message: this.localize["Error.FriendlyPath.IsRequired"]
                },
                pattern: {
                    message: this.localize["Error.FriendlyPath.Invalid"],
                    params: /^[^_]\w{2,14}$/
                },
                validation: {
                    validator: function (val) {
                        return /[a-zA-Z_]{1,}/.test(val);
                    },
                    message: this.localize["Error.FriendlyPath.Invalid"]
                }
            });
            this.newDisplayName = ko.observable("").extend({
                required: {
                    message: this.localize["Error.DisplayName.IsRequired"]
                }
            });
            this.newBiography = ko.observable("").extend({
                maxLength: {
                    message: this.localize["Error.Biography.MaxLength"],
                    params: 255
                }
            });
            this.isSaving = ko.observable(false);
            this.editErrors = ko.validation.group([this.newFriendlyPath, this.newDisplayName, this.newFriendlyPath]);
            plids.common.observationHub.userStatsChanged = this.userStatsChanged;
        }
        return profileSidebar;
    }());
    var imageCropper = (function () {
        function imageCropper(fileInputID, relatedSource) {
            var _this = this;
            this.modalID = "#profile-image-crop-modal";
            this.clear = function () {
                if (_this.isUploaded() && _this.deleteUrl != "") {
                    $.ajax({
                        url: _this.deleteUrl,
                        type: 'DELETE',
                        success: function (result) {
                        }
                    });
                }
                _this.isUploaded(false);
                _this.isUploading(false);
                _this.deleteUrl = "";
                _this.bindUrl = "";
            };
            this.isUploading = ko.observable(false);
            this.isUploaded = ko.observable(false);
            this.isSaving = ko.observable(false);
            this.deleteUrl = "";
            var tourInterval = setInterval(function () {
                if ($(fileInputID).length > 0) {
                    clearInterval(tourInterval);
                    $(fileInputID)
                        .fileupload({
                        url: "/RedmineScreenshotsUploadHandler.ashx",
                        dataType: "json",
                        singleFileUploads: true,
                        limitMultiFileUploads: 1,
                        type: "POST"
                    })
                        .bind('fileuploadadd', function (e, data) { })
                        .bind('fileuploadsubmit', function (e, data) { })
                        .bind('fileuploadsend', function (e, data) { })
                        .bind('fileuploaddone', function (e, data) {
                        _this.isUploaded(true);
                        _this.deleteUrl = data.result[0].delete_url;
                        _this.bindUrl = data.result[0].thumbnail_url;
                        $(_this.modalID).modal("show");
                    })
                        .bind('fileuploadfail', function (e, data) { })
                        .bind('fileuploadalways', function (e, data) { })
                        .bind('fileuploadprogress', function (e, data) { })
                        .bind('fileuploadprogressall', function (e, data) { })
                        .bind('fileuploadstart', function (e) { _this.isUploading(true); })
                        .bind('fileuploadstop', function (e) { _this.isUploading(false); })
                        .bind('fileuploadchange', function (e, data) { })
                        .bind('fileuploadpaste', function (e, data) { })
                        .bind('fileuploaddrop', function (e, data) { })
                        .bind('fileuploaddragover', function (e) { })
                        .bind('fileuploadchunksend', function (e, data) { })
                        .bind('fileuploadchunkdone', function (e, data) { })
                        .bind('fileuploadchunkfail', function (e, data) { })
                        .bind('fileuploadchunkalways', function (e, data) { });
                    $(_this.modalID)
                        .on("show.bs.modal", function (event) {
                        $('#crop-uploaded-photo').croppie('destroy');
                        _this.uploadCrop = $('#crop-uploaded-photo').croppie({
                            viewport: {
                                width: 240,
                                height: 240
                            },
                            boundary: {
                                width: 320,
                                height: 320
                            }
                        });
                    })
                        .on("shown.bs.modal", function (event) {
                        _this.uploadCrop.croppie("bind", {
                            url: _this.bindUrl
                        });
                    })
                        .on("hidden.bs.modal", function (event) {
                        if (_this.isUploaded() && _this.deleteUrl != "") {
                            $.ajax({
                                url: _this.deleteUrl,
                                type: 'DELETE',
                                success: function (result) {
                                }
                            });
                        }
                        _this.isSaving(false);
                        _this.isUploaded(false);
                        _this.isUploading(false);
                        _this.deleteUrl = "";
                    });
                }
            }, 100);
            this.save = function () {
                _this.isSaving(true);
                _this.uploadCrop.croppie('result', {
                    type: 'canvas',
                    size: 'viewport'
                }).then(function (resp) {
                    $.ajax({
                        url: plids.api.getApiEndpoint("v1/UserProfile/ChangeImageProfile"),
                        type: "POST",
                        data: {
                            Base64String: resp.substr(resp.indexOf(',') + 1),
                            Extension: 'png',
                            ContentType: resp.substr(resp.indexOf(':') + 1, resp.indexOf(';') - resp.indexOf(':') - 1)
                        },
                        success: function (data) {
                            //relatedSource(resp);
                            //$(".user-popover-toggle").find("img").attr("src", resp);
                            var noCacheImage = plids.common.getUserProfilePic(plids.common.user.UserID, 120, 120, true);
                            relatedSource(noCacheImage);
                            $(".user-popover-toggle").find("img").attr("src", noCacheImage);
                            $(_this.modalID).modal('hide');
                        }
                    });
                });
            };
        }
        return imageCropper;
    }());
    var instance = new profileSidebar(initData);
    ko.components.register(instance.componentName, {
        template: template,
        viewModel: { instance: instance }
    });
    return instance;
});
