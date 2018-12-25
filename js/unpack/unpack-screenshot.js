var token = sessionStorage.getItem('token')
$(function () {
    var d = JSON.parse(sessionStorage.getItem('data1'));
    //如果信息被清空弹回登陆页面
    if (d == null || d == '' || d == undefined) {
        Utils.noticeModelFn($('.notice-model'), '登陆信息过期，即将返回登陆页面重新登陆！', 2);
        setTimeout(function () {
            window.location = 'login-screenshot.html';
        }, 3000);
        return
    } else {
        /*var d = {
            "id":79,
            "userId":"ceshi02",
            "userName":"ydq",
            "loginTime":1523347029633,
            "roleName":"管理员",
            "channelId":"001"
        };*/
        getScreenTime()
        getDocumentWidth();
        $('.username>span').text(decodeURI(d.userName));
        channelId = d.channelId;
        unpackAccount = d.userId;
        loginTime = d.loginTime;
        channelNumber = d.channelId;
        verifyAccount = d.userName;
        _qcap = new ActiveXObject("QCAP.Interop");
        //console.log(d)
        //msgbox.innerHTML = a.Version;

        setTimeout(function () {
            _create();
        }, 500);
        
        
    }

});
/******************************/

// var ftpIP = '192.168.1.219'; //图片服务器地址

var time = 2000; //自动截屏时间
var channelId = '001'; //开包台号
var verifyAccount = '3'; //安检人员名称
var folderPath = ''; //开包实物图片上传路径所在文件夹 含有ip
var channelNumber = 'ALLScreenShotPhoto'; //上传图片到某个通道号下的文件夹
var loginTime = ''; //通过登陆时间获取当前年月日
var folderPathUrl = ''; //开包实物图片上传路径所在文件夹
var ALLScreenShotPhoto = 'ALLScreenShotPhoto';//自动截图的文件夹

/******************************/

//监听浏览器窗口发生变化
window.onresize = function () {
    getDocumentWidth();
};

//根据页面尺寸显示改变视频显示大小
function getDocumentWidth() {
    var documentWidth = $(document.body).width();
    var width = 960;
    var height = 540;
    if (documentWidth < 1439) {
        width = 960;
        height = 540;
    } else if (1440 <= documentWidth && documentWidth <= 1600) {
        width = 1120;
        height = 630;
    } else if (1601 <= documentWidth && documentWidth <= 1919) {
        width = 1200;
        height = 720;
    } else if (documentWidth == 1920) {
    	  width = 768;//768  614.4
          height = 614.4;
    }

    $(".content-box").css({
        width: width
    });
    $(".x-video").css({
        height: height
    });
    $("#canvas").css({
        width: width,
        height: height
    });
    $(".video-time-axis").css({width: width + 'px'})
}

//获取设置的截屏卡时间
function getScreenTime() {
//	 var time = Utils.getTimeByTimestamp(String(timestamp));
    $.ajax({
        type: 'get',
        beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
//      data:time,
        url: Utils.url + "/getParameter?timestamp="+new Date().getTime(),
        success: function (data) {
            if (data.msg = 'OK' && data.status == 200) {
                time = changeTime(data.data.screenIntervalTime);
                
           
            } else {
                Utils.noticeModelFn($('.notice-model'), '获取设置的截屏卡时间失败!', 2);
                time = 2000;
            }
            setInterval(function () {
            _SnapshotJPG();
            }, time);
        },
        error: function () {
            time = 2000;
            Utils.noticeModelFn($('.notice-model'), '获取设置的截屏卡时间出错!', 2);
        }
    })
}
function changeTime(value){
	return value.substring(0,1) +"000"
}

//手动截取图片
function modalTitle(imgName, args, _dev, timestamp, random) {
    var time = Utils.getTimeByTimestamp(String(timestamp));
     var imgUrl = folderPath + timestamp + random + ".JPG";
     args.Append(_dev);
     args.Append(imgUrl);
     args.Append(40);
     var ret = _qcap.QCAP_SNAPSHOT_JPG(args);
    // setTimeout(function () {
    $.ajax({
        type: "post",
        url: Utils.url + "/unpackVerify/addP",
        data: {
            name: '\\' + imgName, //图片名称
            channelId: channelId, //通道号
            verifyAccount: verifyAccount, //安检人员
            timeStamp: time //当前时间
        },
        beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
        success: function (data) {
            if (data.msg == "OK" && data.status == 200) {


                // console.log(imgUrl,'FTP手动截取图片');


                Utils.noticeModelFn($('.notice-model'), '截图上传成功!', 1);


            } else {
                Utils.noticeModelFn($('.notice-model'), '当前通道并无正在安检的运单!', 2);
            }
        },
        error: function () {

            Utils.noticeModelFn($('.notice-model'), '截图上传失败!', 2);
        }
    })
    // },10)
}

//自动截取图片
function allScreenShotUpdate(imgName, args, _dev, timestamp, random) {
    var time = Utils.getTimeByTimestamp(String(timestamp));
    // console.log(time);
    var imgUrl = folderPath + timestamp + random + ".JPG";
    // console.log(imgUrl,'FTP自动截取图片');
    args.Append(_dev);
    args.Append(imgUrl);
    args.Append(40);
    var ret = _qcap.QCAP_SNAPSHOT_JPG(args);
    // setTimeout(function () {
    $.ajax({
        type: "post",
        url: Utils.url + "/unpackVerify/addScreenShotPhoto",
        beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
        data: {
            photoPath: imgName, //图片名称
            channelId: channelId, //通道号
            timeStamp: time //当前时间
        },
        success: function (data) {
            if (data.msg == "OK" && data.status == 200) {

            } else {
                Utils.noticeModelFn($('.notice-model'), '当前通道并无正在安检的运单!', 2);
            }
        },
        error: function () {
            Utils.noticeModelFn($('.notice-model'), '截图上传失败,请联系管理员!', 2);
        }
    })
    // },10);

}

//随机数
var randomNumber = function () {
    return Math.floor(Math.random() * 8998) + 1000;
};

//创建文件夹
function createFolder(num) {
    // 创建新文件夹
    var date = dateFn();
    var y = date.Y; //年
    var m = date.M; //月
    var d = date.D; //日

    // 创建FileSystemObject对象实例
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var filePath = channelId + "\\" + y + "\\" + m + "\\" + d;
    var filePathList = filePath.split('\\');

    var fldr;
    var fpu = '';
    if (num == 1) { //自动
        fldr = "\\\\" + Utils.ftpIP + "\\ftp\\" + ALLScreenShotPhoto + "\\";
        for (var i = 0; i < filePathList.length; i++) {

            fldr += filePathList[i] + '\\';
            fpu += filePathList[i] + '\\';
            if (filePathList.length - 1 == i) {
                folderPath = fldr;
                folderPathUrl = fpu;
            }

            if (!fso.FolderExists(fldr)) {
                fso.CreateFolder(fldr);
            }
        }
    } else if (num == 2) { //手动
        fldr = "\\\\" + Utils.ftpIP + "\\ftp\\";
        for (var i = 0; i < filePathList.length; i++) {

            fldr += filePathList[i] + '\\';
            fpu += filePathList[i] + '\\';
            if (filePathList.length - 1 == i) {
                folderPath = fldr;
                folderPathUrl = fpu;
            }

            if (!fso.FolderExists(fldr)) {
                fso.CreateFolder(fldr);
            }
        }
    }

}

//年月日
function dateFn() {
    var date;
    if (loginTime == '') {
        date = new Date();
    } else {
        date = new Date(loginTime);
    }
    var y = date.getFullYear(); //年
    var m = date.getMonth() + 1; //月
    if (m < 10) {
        m = '0' + m;
    }
    var d = date.getDate(); //日
    if (d < 10) {
        d = '0' + d;
    }
    return {
        Y: y,
        M: m,
        D: d
    }
}

//验证
function verifyFrom(e) {
    $(e).parent().find('span.error-hint-text').hide();
    $(e).css('border-color', '#dcdfe6');
}

//提交修改信息
function postSetting() {
    var oldPsd = $("#oldPsd").val();
    var newPsd = $("#newPsd").val();
    var againPsd = $("#againPsd").val();
    if (oldPsd.length <= 0) {
        $('#oldPsd').parent().find('span.error-hint-text').show();
        $('#oldPsd').css('border-color', '#f56c6c');
        return;
    }
    if (newPsd.length <= 0) {
        $('#newPsd').parent().find('span.error-hint-text').show();
        $('#newPsd').css('border-color', '#f56c6c');
        return;
    }
    if (againPsd.length <= 0) {
        $('#againPsd').parent().find('span.error-hint-text').show();
        $('#againPsd').css('border-color', '#f56c6c');
        return;
    }

    var self = this;
    $.ajax({
        type: "post",
        url: Utils.url + "/changePassword?oldPassword=" + oldPsd + "&newPassword=" + newPsd + "&newPassword1=" + againPsd + "&timestamp=" + new Date().getTime(),
        async: true,
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
        contentType: 'application/json',
        success: function (result) {
            //console.log(result)
            if (Number(result.status) == 200) {
                Utils.noticeModelFn($('#loginHint'), "更改密码成功！", 1)
                $("#oldPsd").val("");
                $("#newPsd").val("");
                $("#againPsd").val("");
                $('.add-order').hide()
            } else {

            }
        }
    });
}

//登出
function loginout() {
    var self = this;
    var userId = JSON.parse(sessionStorage.getItem('userData')).userId;
    $.ajax({
        type: "get",
        url: Utils.url + "/shrio/logout?userId="+userId+"&timestamp=" + new Date().getTime(),
        async: true,
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
        contentType: 'application/json',
        success: function (result) {
            //console.log(result);
            if (Number(result.status) == 200) {
                location.href = "login-screenshot.html"
            } else {

            }
        }
    });
}

//关闭弹窗
function closeWindow() {
    $('.add-order').hide();
    $("#oldPsd").val("");
    $("#newPsd").val("");
    $("#againPsd").val("");
    $('span.error-hint-text').hide();
    $('.pop-input').css('border-color', '#dcdfe6');
}