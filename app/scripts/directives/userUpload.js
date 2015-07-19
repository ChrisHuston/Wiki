'use strict';

wikiApp.directive('userUpload', ['UserService', function(UserService) {
    return {
        link: function(scope, elm, attrs) {
            var uploadPath = 'https://www.kblocks.com/app/wiki/';
            var kEndpoint = UserService.appDir + 'php/userUpload.php';
            var file_path = uploadPath + "uploads/w" + UserService.wiki.wiki_id + "/u" + UserService.user.user_id + "/";
            if (UserService.appDir === "https://www.kblocks.com/app/wiki/") {
                var media_path = "app/wiki/uploads/w"+ UserService.wiki.wiki_id + "/u" + UserService.user.user_id;
            } else {
                media_path = "wiki/uploads/w"+ UserService.wiki.wiki_id + "/u" + UserService.user.user_id;
            }

            var extensions = [];
            var fileTypes = [];
            var type_id = '1';
            var tooltip = "";
            var file_name = "";
            var ext = "";
            if (attrs.type === "image") {
                extensions = ['jpeg', 'jpg', 'gif', 'png'];
                fileTypes = ['image/jpeg', 'image/gif', 'image/png'];
                type_id = '2';
                tooltip = "Upload Image";
            } else if (attrs.type === "video") {
                extensions = ['mp4', 'mov', '3gp'];
                fileTypes = ['video/*'];
                type_id = '1';
                tooltip = "Upload Video";
            } else {
                type_id = '3';
                extensions = ['pdf', 'docx', 'xlsx', 'xlsm', 'pptx', 'sps', 'sav', 'mox', 'zip', 'imscc'];
                //fileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/octet-stream', 'application/vnd.ms-excel'];
                tooltip = "Upload File";
            }
            var uploader = new qq.FineUploaderBasic({
                button: elm[0],
                multiple: false,
                request: {
                    endpoint: kEndpoint,
                    params: {qqPath:media_path,
                        user_id:UserService.user.user_id.toString(),
                        wiki_id:UserService.wiki.wiki_id,
                        page_id:scope.page_id,
                        heading_id:scope.heading.heading_id,
                        type_id:type_id,
                        media_name:"",
                        media_path: ""},
                    paramsInBody: true
                },
                validation: {
                    allowedExtensions: extensions,
                    acceptFiles:  fileTypes,
                    sizeLimit: 52428800 // 50 Mb = 50 * 1024 * 1024 bytes
                },
                callbacks: {
                    onError: function (id, fileName, errorReason) {
                        alert(errorReason);
                    },
                    onSubmit: function(id, fileName) {
                        var nameBits = fileName.split(".");
                        ext = nameBits[nameBits.length-1];
                        var regex = /[^-_A-z0-9\.]/g;
                        file_name = fileName.replace(regex, '_');
                        this._options.request.params.media_name = file_name;
                        this._options.request.params.media_path = media_path;
                        scope.showProgress = true;
                    },
                    onProgress: function(id, fileName, loaded, total) {
                        scope.uploadProgress = Math.round(loaded / total * 100);
                    },
                    onComplete: function(id, fileName, responseJSON) {
                        if (responseJSON.success) {
                            scope.showProgress = false;
                            scope.uploadProgress = 0;
                            var media_name = this._options.request.params.media_name;
                            var full_path = file_path + media_name;
                            var tag = "";
                            if (type_id === '1') {
                                tag = "<video class=\"t-wiki-video video-js vjs-default-skin vjs-big-play-centered img-responsive\" src=\"" + full_path + "\" type=\"video/mp4\" controls preload=\"none\"></video>";
                            } else if (type_id === '2') {
                                tag = "<img src=\"" + full_path + "\" class=\"img-responsive\" alt=\"" + media_name + "\"></img>";
                            } else {
                                tag = "<a href=\"" + full_path + "\" target=\"_blank\">" + media_name + "</a>";
                            }
                            scope.insertUpload(tag);
                            scope.$apply();
                        }
                    }
                }
            });
        }
    };
}]);
