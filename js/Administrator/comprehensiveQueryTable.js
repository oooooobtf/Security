var token = sessionStorage.getItem('token');

$(function() {
    orderId = Utils.getParaVal('orderId');

    var flagUrl = Utils.getParaVal('flag');
    var indexUrl = Utils.getParaVal('index');

    if(orderId == undefined || orderId == null || orderId == '') {
        Utils.noticeModelFn($(".notice-model"), '操作过期将返回上一页！', 2);
        setTimeout(function() {
            window.location.href = 'comprehensiveQuery.html?flag=' + flagUrl + '&index=' + indexUrl
        }, 2000);
        return
    }

    channelId = Utils.getParaVal('channelId');
    userData = JSON.parse(JSON.parse(Utils.getParaVal('userData')));
    // console.log(userData);

    //  alert(userData.userName)
    var userData = JSON.parse(sessionStorage.getItem('userData'));
    $('.username>span').text(userData.userName);
    loginTime = userData.loginTime;

    //查询运单信息
    getOrderIdPost(orderId);

    //查询运单进度条详情
    getOrderIdListPost(orderId);

    // 根据页面尺寸显示改变视频显示大小
    getDocumentWidth();



});

/*//监听浏览器窗口发生变化
window.onresize = function () {
    getDocumentWidth();
};*/

/********************************/

var pageNum = 1;
var pageSize = 25;
var orderId = '';
var channelId = ''; //通道号
// var ezopenUrlList = [];//回访地址
var imgList = []; //图片下载所需的路径
var timeStart = ''; //运单开始时间
var timeEnd = ''; //运单结束时间

// var ftpIP = '192.168.1.219';//图片服务器地址
var channelNumber = ''; //上传图片到某个通道号下的文件夹
var loginTime = ''; //通过点击获取当前年月日
var folderPath = ''; //开包实物图片上传路径所在文件夹
var cameraCapture = 'Comprehensive'; //摄像头拍摄图片上传路径所在文件夹

///视频所需参数

var oPlugin = {}; //视频宽高
var g_iWndIndex = 0; //可以不用设置这个变量，有窗口参数的接口中，不用传值，开发包会默认使用当前选择窗口
var g_iSearchTimes = 0; //搜索录像 是否是第一次搜索
var ipObj = []; //回放视频通道数组

/********************************/

//查询运单详情
function getOrderIdPost(orderId) {
    $.ajax({
        type: 'get',
        beforeSend: function(request) {
            request.setRequestHeader("token",token);
        },
        url: Utils.url + '/comprehensiveQuery/findDetailByOrderId?orderId=' + orderId,
        success: function(data) {
            // console.log(data);
            $(".mt-channel-number").html(judgeAll(data.channelId)); //通道号
            channelNumber = data.channelId;
            $(".mt-subcontractor").html(judgeAll(data.unpackAccount)); //开包人
            $(".mt-carrier").html(judgeAll(data.carryPerson)); //承运人
            $(".mt-agent").html(judgeAll(data.proxyName)); //代理人
            $('.mt-left-waybill>i').html(judgeAll(data.orderId)); //运单号
            $('.mt-left-num>i').html(judgeAll(data.num)); //件数
            $('.mt-left-flight>i').html(judgeAll(data.flightId)); //航班号
            $('.mt-inspectors').html(judgeAll(data.checkPerson)); //安检人员
            getCamera(channelNumber);
        },
        error: function() {
            Utils.noticeModelFn($('.notice-model'), '当前通道运单详情获取失败!', 2);
            getCamera(channelNumber);
        }
    });

}

//通过 通道号获取到改通道下的4个回放摄像头的通道号
function getCamera(channelNumber) {
    //摄像头通道
    $.ajax({
        type: 'get',
        url: Utils.url + '/scene/getCamera?channelId=' + channelNumber + '&timestamp=' + new Date().getTime(),
        beforeSend: function(request) {
            request.setRequestHeader("token", token);
        },
        success: function(result) {
            if(result.status == 200 && result.msg == 'OK') {
                ipObj = result.data;
                oLiveView.iChannelID = ipObj[0].creama_id
                getLiActive(ipObj);

            }
        },
        error: function() {

            Utils.noticeModelFn($('.notice-model'), '当前通道视频获取失败!', 2);
        }
    });
}

//查询运单进度条详情
function getOrderIdListPost(orderId) {
    $.ajax({
        type: 'get',
        url: Utils.url + '/comprehensiveQuery/getComprehensiveOrderDetail',
        beforeSend: function(request) {
            request.setRequestHeader("token", token);
        },
        data: {
            orderId: orderId,
            timestamp: Utils.getTimeByTimestamp(String(new Date().getTime()))
        },
        success: function(data) {
            getOrderIdHtml(data[0]);
            //          console.log(data)
        }
    })
}

//查询运单进度条页面展示 时间回显限制
function getOrderIdHtml(orderList) {
    var html = '<ul>';
    var className = '';
    var disPlay = '';
    var text = '';
    var time = '';
    var isTime = true;
    var imgTimeStart = '';
    var imgTimeEnd = '';
    for(var j = 0; j < orderList.length; j++) {
        if(orderList[j].status == '开始') {
            className = 'start-time';
            disPlay = '';
            if(isTime) {
                isTime = false;
                timeStart = Utils.getTimeByTimestamp(String(orderList[j].time));
                imgTimeStart = Utils.getTimeByTimestamp(String(orderList[j].time));
            }

        } else if(orderList[j].status == '结束') {
            className = 'end-time';
            disPlay = 'none';
            timeEnd = Utils.getTimeByTimestamp(String(orderList[j].time));
            imgTimeEnd = Utils.getTimeByTimestamp(String(orderList[j].time));
        } else {
            className = '';
            disPlay = '';
        }
        text = judgeAll(orderList[j].info);
        time = Utils.getTimeByTimestamp(String(orderList[j].time));
        //安检还是开包
        var indexOf = '';
        if(orderList[j].info.indexOf('安检') >= 0) {
            if(orderList[j].status == '开始' || orderList[j].status == '结束') {
                indexOf = '';
            } else {
                indexOf = '安检员：'
            }
        }
        if(orderList[j].info.indexOf('开包') >= 0) {
            if(orderList[j].status == '结束') {
                indexOf = '';
            } else {
                indexOf = '开包员：'
            }
        }
        html += '<li class="progress-list">' +
            '<i class="' + className + '"></i>' +
            '<span style="display: ' + disPlay + '"></span>' +
            '<div class="progress-list-div">' +
            '<div><span class="ul-span">' + text + '</span></div>' +
            '<div><span>' + indexOf + judgeAll(orderList[j].people) + '</span></div>' +
            '<div><span>' + time + '</span></div>' +
            '</div>' +
            '</li>';
    }
    html += '</ul>';
    $(".progress-box").html(html);

    // console.log(imgTimeEnd);
    //查询开包图片和所有图片
    getUnpackAllImgPost(orderId, imgTimeStart, imgTimeEnd, 1);
    //滚动
    srcoll(orderId, imgTimeStart, imgTimeEnd, 1);

    // oLiveView.iChannelID = ipObj[0].creama_id;
    oLiveView.llPlayTime = imgTimeStart;
    oLiveView.llBeginTime = imgTimeStart;
    oLiveView.llEndTime = imgTimeEnd;

    //图片查询时间
    var timeStart1 = '';
    var num = 1;
    laydate.render({
        elem: '#screenTime',
        type: 'datetime',
        theme: "#62a8ea",
        range: true,
        min: imgTimeStart,
        max: imgTimeEnd,
        value: imgTimeStart + ' - ' + imgTimeEnd,
        done: function(value, date) {
            if(value != '') {
                var arr = value.split(' - ');
                timeStart1 = Utils.getTimeByTimestamp(String(new Date(arr[0].replace(/-/g, '/')).getTime()));
                if($('.img-ul-box>li.active').index() == 0) {
                    num = 1;
                } else if($('.img-ul-box>li.active').index() == 1) {
                    num = 2;
                }

                $(".img-box-list>ul").html('');

                //查询开包图片和所有图片
                getUnpackAllImgPost(orderId, timeStart1, imgTimeEnd, num);
                srcoll(orderId, timeStart1, imgTimeEnd, num);
            }

        }
    });

    // 所有图片 开包图片
    $('.img-ul-box').unbind('click').on('click', 'li', function() {
        $(this).addClass('active').siblings('li').removeClass('active');
        $(".li-num").html(0);
        $("#inputUnchecked").removeAttr('checked');
        $(".img-box-list>ul").html('');
        $('#screenTime').val(timeStart + ' - ' + timeEnd);
        imgList = [];
        // console.log($(this).index(),'num');
        if($(this).index() == 0) {
            pageNum = 1;
            num = 1;
            getUnpackAllImgPost(orderId, imgTimeStart, imgTimeEnd, 1);
            $(".img-box-list-all").show();
            $(".img-box-list-unpack").hide();
        } else if($(this).index() == 1) {
            getUnpackAllImgPost(orderId, imgTimeStart, imgTimeEnd, 2);
            $(".img-box-list-all").hide();
            $(".img-box-list-unpack").show();
            num = 2;
        }
        srcoll(orderId, timeStart1, imgTimeEnd, num);
    });

    $('.img-icon-close').attr({
        'data-start': imgTimeStart,
        'data-end': imgTimeEnd,
        'data-orderId': orderId
    });

    //视频查询时间
    laydate.render({
        elem: '#screenTime1',
        type: 'datetime',
        min: timeStart,
        // value: timeStart,
        max: timeEnd,
        range: true,
        value: imgTimeStart + ' - ' + imgTimeEnd,
        theme: "#62a8ea",
        btns: ['clear', 'confirm'],
        done: function(value) {
            console.log(value)
            if(value == '') {
                //clickStartPlayback(timeStart, timeEnd)
                oLiveView.llPlayTime = imgTimeStart;
                oLiveView.llBeginTime = imgTimeStart;
                oLiveView.llEndTime = imgTimeEnd;
                setTimeout(function () {
                    SetPlayBackParam();
                },100);
            } else {
                // console.log(value.split(' - ')[0], value.split(' - ')[1])
                //clickStartPlayback(value.split(' - ')[0], value.split(' - ')[1]);
                oLiveView.llPlayTime=value.split(' - ')[0];
                oLiveView.llBeginTime =value.split(' - ')[0];
                oLiveView.llEndTime =value.split(' - ')[1];
                setTimeout(function () {
                    SetPlayBackParam();
                },100);
            }
        }
    });

    //时间插件×
    $('.img-icon-close').on('click', function() {
        $('#screenTime').val('');
        var start = $(this).attr('data-start');
        var end = $(this).attr('data-end');
        var order = $(this).attr('data-orderId');
        if($('.img-ul-box>li.active').html() == '开包图片') {
            getUnpackAllImgPost(order, start, end, 2);
        } else if($('.img-ul-box>li.active').html() == '所有图片') {
            getUnpackAllImgPost(order, start, end, 1);
        }
    });
    //回放视频登录
    loginCMS();
}

//查询运单所有图片 开包图片 请求
function getUnpackAllImgPost(orderId, imgStartTime, imgEndTime, num) {
    var data;
    if(num == 1) { //所有
        data = {
            orderId: String(orderId), //运单号
            pageNum: pageNum, //页数
            pageSize: pageSize, //每页数据条数
            startTime: imgStartTime, //开始时间
            endTime: imgEndTime, //结束时间
            newTime: new Date().getTime() //防止IE缓存
        };
    } else if(num == 2) { //开包
        data = {
            orderId: orderId, //运单号
            pageNum: 1, //页数
            pageSize: 1000, //每页数据条数
            startTime: imgStartTime, //开始时间
            endTime: imgEndTime, //结束时间
            newTime: new Date().getTime() //防止IE缓存
        };
    }
    $.ajax({
        type: "get",
        beforeSend: function(request) {
            request.setRequestHeader("token", token);
        },
        url: Utils.url + '/comprehensiveQuery/getComprehensiveOrderPhoto',
        data: data,
        success: function(data) {
            // console.log('所有',num)
            if(num == 1) {
                // data[1] //查询所有图片列表
                getAllImgHtml(data[0].list);
            } else if(num == 2) {

                getUnpackImgHtml(data[1]);
            }
        }
    })

}

//查询运单所有图片  页面展示
function getAllImgHtml(allImgList) {
    var html = '';
    if(allImgList == undefined) {
        return;
    }
    if(allImgList.length <= 0) {
        return;
    }
    for(var i = 0; i < allImgList.length; i++) {
        // var imgUrl = checkImgExists(allImgList[i]);
        var url = allImgList[i];
        var time = allImgList[i].split('\\');
        var t1 = time[time.length - 1].split('.');
        var t11 = Utils.getTimeByTimestamp(String(t1[0].substring(0, 13)));

        html += '<li>' +
            '<div >' +
            '<img  src="' + url + '" >' +
            '<p class="img-list-time">' + t11 + '</p>' +
            '<i data-imgUrl="' + url + '" class="img-list-i"></i>' +
            '</div>' +
            '</li>'
    }
    $(".img-box-list-all>ul").append(html);

    //li点击
    getLiAddActive();
}

//开包图片展示页面展示
function getUnpackImgHtml(unpackImgList) {
    $(".img-box-list-unpack").unbind("scroll"); //取消滚动翻页
    var html = '';
    $(".img-box-list>ul").html('');

    if(unpackImgList == undefined) {
        return;
    }
    if(unpackImgList.length <= 0) {
        return;
    }
    for(var i = 0; i < unpackImgList.length; i++) {
        // var imgUrl = checkImgExists(allImgList[i]);
        var url = unpackImgList[i];
        var time = unpackImgList[i].split('/');
        var t1 = time[time.length - 1].split('.');
        var t11 = Utils.getTimeByTimestamp(String(t1[0].substring(0, 13)));

        html += '<li>' +
            '<div >' +
            '<img class="img-list-all img-' + (i + 1) + '"    src="' + url + '" alt="">' +
            '<p class="img-list-time">' + t11 + '</p>' +
            '<i data-imgUrl="' + url + '" class="img-list-i"></i>' +
            '</div>' +
            '</li>'
    }

    $(".img-box-list-unpack>ul").html(html);

    //li点击
    getLiAddActive();
}

//图片下载
function getDownloadPhoto() {
    var obj = {};
    var imgData = '';

    if(imgList.length <= 0) {
        return Utils.noticeModelFn($('.notice-model'), "没有选择图片，请重新操作！", 2);
    }
    for(var i = 0; i < imgList.length; i++) {

        var arr = imgList[i].split('\\');
        obj = {
            'path': imgList[i],
            'name': arr[arr.length - 1]
        };
        // imgData.push(imgList[i].replace(/\\/g,'/'));

        imgData += imgList[i].replace(/\\/g, '/') + ','
    }
    imgData = imgData.slice(0, imgData.length - 1);
    var data = {
        paths: imgData,
        channelId: channelId
    }
    $.ajax({
        //      type: 'get',
        //      url: Utils.url + '/comprehensiveQuery/downloadPhoto?paths=' + imgData+'&channelId='+channelId,
        type: 'get',
        url: Utils.url + '/comprehensiveQuery/downloadPhoto',
        beforeSend: function(request) {
            request.setRequestHeader("token", token);
        },
        data: data,
        success: function() {
            window.open(Utils.url + '/comprehensiveQuery/downloadPhoto?paths=' + imgData + '&channelId=' + channelId);
        }
    })
}

//为空判断
function judgeAll(text) {
    var html = '';
    if(text == undefined || text == null || text == '') {
        html = '';
    } else {
        html = text;
    }
    return html
}

//选择
function getLiAddActive() {
    //判断图片是否加载正确
    var src = '../../image/zanwei.jpg';
    $(".img-box-list>ul>li").each(function() {
        var _this = $(this);
        _this.find('img').error(function() {
            $(this).attr('src', src);
            _this.find('p').html('图片请求失败!');
        })
    });

    //图片选择
    $('.img-box-list>ul').unbind('click').on('click', 'li', function() {
        // $(this).find('i').addClass('active');
        var imgUrl = $(this).find('img').attr('src');
        if($(this).find('div>i').hasClass('active')) {
            for(var i = 0; i < imgList.length; i++) {
                if(imgList[i] == imgUrl) {
                    imgList.splice(i, 1);
                }
            }
            $(this).find('div>i').removeClass('active');
        } else {
            $(this).find('div>i').addClass('active');
            imgList.push(imgUrl);
        }
        //判断是否全部选择完了
        if($(".img-ul-box>li.active").index() == 0) {
            $('.img-box-list-all>ul').each(function() {
                var liLength = $(this).find('li').length;
                var iLength = $(this).find('li  i.active').length;
//				console.log(iLength)

                if(liLength == iLength) {
                    $("#inputUnchecked").prop('checked', 'checked');
                } else {
                    $("#inputUnchecked").removeAttr('checked');
                }
                $('.li-num').html(iLength);

            });
        } else {
            $('.img-box-list-unpack>ul').each(function() {
                var liLength = $(this).find('li').length;
                var iLength = $(this).find('li  i.active').length;
                // console.log(iLength)

                if(liLength == iLength) {
                    $("#inputUnchecked").prop('checked', 'checked');
                } else {
                    $("#inputUnchecked").removeAttr('checked');
                }
                $('.li-num').html(iLength);

            });
        }

    });

}

//全选
function getChecked(e) {
    if($(e).prop('checked') == false) {
        $(e).removeAttr('checked');
        $('.img-box-list>ul>li i').removeClass('active');
    } else {
        $(e).prop('checked', 'checked');
        $('.img-box-list>ul>li i').addClass('active');
        $('.img-box-list>ul>li').each(function() {
            var url = $(this).find('img').attr('src');
            imgList.push(url);
        })
    }
    var iLength = $('.img-box-list>ul>li i.active').length;
    $(".li-num").html(iLength);

}

//通道入口 通道出口 人员视频 开包视频
function getLiActive(ipObj) {
    $('.video-ul-box').on('click', 'li', function() {
        // $("#screenTime1").val(timeStart + " - " + timeEnd);
        StopAll(); //停止回放
        $(this).addClass('active').siblings('li').removeClass('active');
        var index = $(this).index();
        var OCXobj = document.getElementById("PlayBackocx");
        oLiveView.szIndex = ipObj[index].creama_url; //回放视频的通道
        OCXobj.SetWndNum(oLiveView.lCounts);
        SetPlayBackParam();
    })

}

//滚动加载更多
function srcoll(order, timeStart1, timeEnd1, num) {
    $(".img-box-list").unbind("scroll").bind("scroll", function(e) {
        var sum = this.scrollHeight;
        if(sum <= $(this).scrollTop() + $(this).height()) {
            pageNum++;
            getUnpackAllImgPost(order, timeStart1, timeEnd1, num);
            // console.log(num);
        }
    });
}

//根据页面尺寸显示改变视频显示大小
function getDocumentWidth() {
    var documentWidth = $(document.body).width();
    var videoWidth = 500;
    var videoHeight = 430;
    if(documentWidth < 1423) {
        videoWidth = 235;
        videoHeight = 380;
    } else if(1423 <= documentWidth && documentWidth <= 1582) {
        videoWidth = 360;
        videoHeight = 400;
    } else if(1583 <= documentWidth && documentWidth <= 1902) {
        videoWidth = 400;
        videoHeight = 430;
    } else if(1903 <= documentWidth && documentWidth <= 1920) {
        videoWidth = 500;
        videoHeight = 430;
    }

    oPlugin = {
        iWidth: videoWidth,
        iHeight: videoHeight
    };
    document.getElementById('PlayBackocx').style.width = videoWidth+'px';
    document.getElementById('PlayBackocx').style.height = videoHeight+'px';
    // clickStartPlayback(timeStart, timeEnd)
}


//截图
function CapturePicture() {
    createFolder(); //创建文件夹
    try {
        var xmlDoc = WebVideoCtrl.I_GetLocalCfg();
    } catch(arr) {
        return Utils.noticeModelFn($('.notice-model'), '视频IP获取失败!', 2);
    }

    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    var infd;
    if(xmlDoc != null) {
        //本地配置获取图片路径
        infd = ($(xmlDoc).find("PlaybackPicPath").eq(0).text()).replace('/', "\\");
    } else {
        Utils.noticeModelFn($('.notice-model'), '本地配置获取失败!', 2);
    }

    if(oWndInfo != null) {
        var dataTime = new Date().getTime();
        var szPicName = dataTime + ".jpg";
        var iRet = WebVideoCtrl.I_CapturePic(szPicName, {
            bDateDir: true //是否生成日期文件
        });
        if(0 == iRet) {} else {
            Utils.noticeModelFn($('.notice-model'), '抓图失败!', 2);
            return
        }
        var date = dateFn();
        var y = date.Y; //年
        var m = date.M; //月
        var d = date.D; //日
        infdImg = infd + "\\" + y + "-" + m + "-" + d + "\\" + dataTime + ".jpg"; //图片完整路径

        lisTall(infdImg, dataTime);

    } else {
        Utils.noticeModelFn($('.notice-model'), '回放错误，操作失败！', 2);
    }
}

//拍照图片位置移动
function lisTall(infd, dataTime) {
    //随机数
    var num = randomNumber();

    var fso = new ActiveXObject("Scripting.FileSystemObject");

    var date = dateFn();
    var y = date.Y; //年
    var m = date.M; //月
    var d = date.D; //日

    //开包实物图片上传路径所在文件夹
    var ftpPath = folderPath;
    // console.log(folderPath);
    //文件移动到ftp里面
    var f2 = fso.GetFile(infd);
    f2.Move(ftpPath + "\\" + dataTime + num + ".JPG");
    Utils.noticeModelFn($('.notice-model'), '提示：截图已放入Z盘' + cameraCapture + '，请前往查看。', 1);
    //图片位置
    var url = '\\' + cameraCapture + '\\' + channelNumber + "\\" + y + "\\" + m + "\\" + d + '\\' + dataTime + num + '.JPG';

    /*$.ajax({
        type:"post",
        url:URL+'/unpack/addGoodsPic',
        data:{
            url:String(url)
        },
        success:function (data) {
            if(data.status == 200 && data.msg == 'OK'){
                if(data.data.access == null || data.data.access == undefined || data.data.access == ''){
                }else{
                    var imgUrl = data.data.access;
                    var html = '<div class="shot-list-img" >' +
                        '<img onclick="imgBigFn(this)" src="'+imgUrl+'" alt="">' +
                        '<i data-id="'+data.data.id+'" data-url="'+imgUrl+'" class="img-close-icon"></i>' +
                        '</div>';
                    $('.click-entity-shot').append(html);
                }
            }
        },
        error:function (data) {
            console.log(data)
        }
    })*/
}

//创建文件夹
function createFolder() {
    try {
        // 创建新文件夹
        var date = dateFn();
        var y = date.Y; //年
        var m = date.M; //月
        var d = date.D; //日

        // 创建FileSystemObject对象实例
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        // 获取Drive 对象
        var filePath = cameraCapture + '\\' + channelNumber + "\\" + y + "\\" + m + "\\" + d;
        var filePathList = filePath.split('\\');
        var fldr = "\\\\" + Utils.ftpIP + "\\ftp\\";
        //循环创建文件夹
        for(var i = 0; i < filePathList.length; i++) {
            fldr += filePathList[i] + '\\';
            if(filePathList.length - 1 == i) {
                folderPath = fldr;
            }
            if(!fso.FolderExists(fldr)) {
                fso.CreateFolder(fldr);
            }
        }
    } catch(arr) {
        Utils.noticeModelFn($('.notice-model'), '检查是否创建映射磁盘驱动器！', 2);
    }
}

//年月日
function dateFn() {
    var date;
    if(loginTime == '') {
        date = new Date();
    } else {
        date = new Date(loginTime);
    }
    var y = date.getFullYear(); //年
    var m = date.getMonth() + 1; //月
    if(m < 10) {
        m = '0' + m;
    }
    var d = date.getDate(); //日
    if(d < 10) {
        d = '0' + d;
    }
    return {
        Y: y,
        M: m,
        D: d
    }
}

//随机数
function randomNumber() {
    return Math.floor(Math.random() * 8998) + 1000;
}



//显示操作信息
function showOPInfo(szInfo, status, xmlDoc) {
    var szTip = "<div>" + dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss") + " " + szInfo;
    if(typeof status != "undefined" && status != 200) {
        var szStatusString = $(xmlDoc).find("statusString").eq(0).text();
        var szSubStatusCode = $(xmlDoc).find("subStatusCode").eq(0).text();
        if("" === szSubStatusCode) {
            szTip += "(" + status + ", " + szStatusString + ")";
        } else {
            szTip += "(" + status + ", " + szSubStatusCode + ")";
        }
    }
    szTip += "</div>";
    // console.log(szInfo, status, xmlDoc)
    // Utils.noticeModelFn($('.notice-model'), status, 2);
    // $("#opinfo").html(szTip + $("#opinfo").html());
}

//格式化时间
function dateFormat(oDate, fmt) {
    var o = {
        "M+": oDate.getMonth() + 1, //月份
        "d+": oDate.getDate(), //日
        "h+": oDate.getHours(), //小时
        "m+": oDate.getMinutes(), //分
        "s+": oDate.getSeconds(), //秒
        "q+": Math.floor((oDate.getMonth() + 3) / 3), //季度
        "S": oDate.getMilliseconds() //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (oDate.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

//搜索录像
function clickRecordSearch(iType) {
    // timeStart = '2018-06-19 00:00:00';
    // timeEnd = '2018-06-21 23:59:59';
    var szDeviceIdentify = oLiveView.szIP,
        iChannelID = oLiveView.iChannelID,
        bZeroChannel = false,
        iStreamType = oLiveView.iStreamType,
        szStartTime = timeStart,
        szEndTime = timeEnd;
    // console.log(timeStart, timeEnd);
    if(null == szDeviceIdentify) {
        return;
    }

    if(bZeroChannel) { // 零通道不支持录像搜索
        return;
    }

    if(0 == iType) { // 首次搜索
        $("#searchlist").empty();
        g_iSearchTimes = 0;
    }


}


//添加气泡title
function addBlackTitle() {
    $('table tbody tr td:not(:last-child)').mouseover(function(event) {
        var _this = $(this);
        if(_this.text() !== '') {
            _this.justToolsTip({
                events: event,
                // animation:"flipIn",
                width: this.offsetWidth,
                contents: $(this).text(),
                gravity: 'top'
            });
        } else {

        }

    });
}



var oLiveView = {
    szIP: "172.22.100.20", // protocol ip
    szPort: "80", // protocol port
    szName: "admin", // device username
    szPswd: "hk.201712",// device password
    lCounts: 1,//窗口数目
    CameraID: 1036,//监控点
    lIndex: 1,//窗口index
    llPlayTime: '',//播放时间
    llBeginTime: '',//录像查询起始时间
    llEndTime: '',//录像查询结束时间，形如“2017-09-07 00:00:00”的时间。
    szIndex: '9e1d0e79f13d44288bf4062864a53910',//监控点索引
    szenLoc: 4,//存储设备类型
};

/*****同步登录CMS******/
function loginCMS() {
    var OCXobj = document.getElementById("PlayBackocx");

    var result = OCXobj.SetLoginType(1);    // 设置同步登入模式
    var ret = OCXobj.Login(oLiveView.szIP, oLiveView.szPort, oLiveView.szName, oLiveView.szPswd);
    switch (ret) {
        case 0:
            console.log("异步登录成功");setTimeout(function () {
            	OCXobj.SetWndNum(oLiveView.lCounts);
                SetlocalParam();
                //console.log(ipObj);
                //SetPlayBackParam();

            }, 100);
            break;
        case -1:
            //clearTree();
            console.log("异步登录失败！");
            showMethodInvokedInfo("视频异步登录失败，请刷新页面！");
            break;
        default:
            break;
    }

}

/*****设置本地参数******/
var picList = {
    PicType: 1,//0：jpg 1：bmp
    PicPath: 'C:\\Hikvision\\Snapshot\\playBack\\',//路径
    PicCapType: 0,//按时间 按帧
    PicSpanTime: 1,//抓图时间间隔,单位(ms)
    PicCounts: 1,//抓图张数
    RecordPath: 'C:\\Hikvision\\Clip\\',
};

function SetlocalParam() {
    var OCXobj = document.getElementById("PlayBackocx");
    strXML = "<?xml version='1.0'?><Parament><CappicMode>" + picList.PicType
        + "</CappicMode><CappicPath>" + picList.PicPath + "</CappicPath><CutPath>"
        + picList.RecordPath + "</CutPath><CutFileSize>2</CutFileSize></Parament>";
    var ret = OCXobj.SetLocalParam(strXML);
    switch (ret) {
        case 0:
            //alert("设置成功！");
            //showMethodInvokedInfo("SetLocalParam接口调用成功！");
            break;
        case -1:
            //alert("设置失败！");
            showMethodInvokedInfo("SetLocalParam接口调用失败！错误码：" + OCXobj.GetLastError());
            break;
        default:
            break;
    }
}
/*****设置回放参数***** */
function SetPlayBackParam() {
    var OCXobj = document.getElementById("PlayBackocx");
    SetlocalParam();
    var ret = OCXobj.StartPlayback(oLiveView.llPlayTime, oLiveView.llBeginTime, oLiveView.llEndTime, oLiveView.szIndex, oLiveView.szenLoc);
    switch (ret) {
        case 0:
            //showMethodInvokedInfo("StartPlayback接口调用成功！");
            break;
        case -1:
            showMethodInvokedInfo("StartPlayback接口调用失败！错误码："+ OCXobj.GetLastError());
            break;
        default:
            break;
    }
}

//提示框
function showMethodInvokedInfo(msg) {
    Utils.noticeModelFn($('.notice-model'), msg, 2);
}

// 停止全部回放
function StopAll(){
    var OCXobj = document.getElementById("PlayBackocx");
    OCXobj.StopAllPlayback();
}

function getHistory() {
    var OCXobj = document.getElementById("PlayBackocx");
    OCXobj.StopAllPlayback();
    history.go(-1);
}
