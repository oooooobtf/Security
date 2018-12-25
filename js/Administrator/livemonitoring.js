var token = sessionStorage.getItem('token');
$(function() {
	//全部的视频
	getAllAisleNumber();

	//判断是否装了ActiveX
	/*var iRet = WebVideoCtrl.I_CheckPluginInstall();
	if(-1 == iRet) {
		Utils.noticeModelFn($('.notice-model'), '未安装过插件！', 2);
		return;
	}*/
	//有跳转时关闭回放
	$(window).unload(function() {
		$.each(g_aIframe, function(i, oIframe) {
			getWebVideoCtrl(oIframe).I_Stop();
		});
	});

	//ip 视频
	/* var ipObj = [
	     {
	         'ip': '192.168.1.51',
	         'channel': '1',
	     },
	     {
	         'ip': '192.168.1.51',
	         'channel': '1',
	     },
	     {
	         'ip': '192.168.1.53',
	         'channel': '3',
	     },
	     {
	         'ip': '192.168.1.53',
	         'channel': '4',
	     },
	 ];*/
	//页面宽度
	var documentWidth = $(document.body).width();
	var videoHeight = '';

	// sessionStorage.setItem('ipObj', JSON.stringify(ipObj));
	sessionStorage.setItem('docWidth', documentWidth);
	if(documentWidth < 1423) {
		videoHeight = 280;
	} else if(1423 <= documentWidth && documentWidth <= 1582) {
		videoHeight = 280;
	} else if(1583 <= documentWidth && documentWidth <= 1902) {
		videoHeight = 320;
	} else if(1903 <= documentWidth && documentWidth <= 1920) {
		videoHeight = 320;
	}
	$(".first-row>div").css({
		// width:videoWidth,
		height: videoHeight
	});
	$(".two-row>div").css({
		// width:videoWidth,
		height: videoHeight
	})
	
});

//websock
var stompClient = null;
//此值有服务端传递给前端,实现方式没有要求

//websock协议
function connect() {

	var channelId = $('#channelNumber').val(); //获得订阅的通道号
	var orderId;
	var socket = new SockJS(Utils.url + '/endpointWisely'); //1连接SockJS的endpoint是“endpointWisely”，与后台代码中注册的endpoint要一样。
	stompClient = Stomp.over(socket); //2创建STOMP协议的webSocket客户端。
	stompClient.connect({}, function(frame) { //3连接webSocket的服务端。
		//4通过stompClient.subscribe（）订阅服务器的目标是'/user/' + userId + '/msg'接收一对一的推送消息,
		//其中userId由服务端传递过来,用于表示唯一的用户,通过此值将消息精确推送给一个用户

		stompClient.subscribe('/user/manager/msg', function(respnose) {
			if(JSON.parse(respnose.body).code == "START") {
				orderId = JSON.parse(respnose.body).data.orderId
				$('#channelNumber').val(JSON.parse(respnose.body).data.channelId);
				getCurrentChannelContent(JSON.parse(respnose.body).data.channelId)
			}
			if(JSON.parse(respnose.body).code == "PAUSE" || JSON.parse(respnose.body).code == "END") {
				$('#channelNumber').val(JSON.parse(respnose.body).data.channelId);
				getCurrentChannelContent(JSON.parse(respnose.body).data.channelId)

			}
			connect()

		});

		stompClient.subscribe('/user/' + $('#channelNumber').val() + '/msg', function(respnose) {
			if(respnose.body == "DELETE" || respnose.body == "START" || respnose.body == "PAUSE") {
				if(respnose.body == "START") {
					Utils.noticeModelFn($('#loginHint'), "当前通道" + $('#channelNumber').val() + "，" + orderId + "运单开始安检", 3)
				}
			} else {
				var data = JSON.parse(respnose.body);
				// console.log(data)
				if(data.orderId == null || data.orderId == '' || data.orderId == undefined) {
					if(data.roleName) {

						Utils.noticeModelFn($('#loginHint'), data.roleName + data.userName + "上岗", 3)
						//						if(data.roleName === '安检员') {
						//							// $('#securityStaff').text(data.userName);
						//						}
					}
				} else {
					//					Utils.noticeModelFn($('#loginHint'), "当前通道" + $('#channelNumber').val() +"，"+ orderId + "运单开始安检", 3)
				}

			}

		});

	});
	socket.onclose = function() {
		// 关闭 websocket

		console.log('连接已关闭...')
		connect()
	}
	socket.onerror = function() {
		// 关闭 websocket

		console.log('连接已关闭...')
		connect()
	}

	//	socket.onclose= disconnect

	//	socket.onmessage=function(e){
	//		console.log(e)
	//	}
	//	socket.onerror=function(e){
	//		console.log('error')
	//		console.log(e)
	//	}

}

//得到所有的通道号
function getAllAisleNumber() {

	$.ajax({
		type: 'get',
		url: Utils.url + '/scene/getChannelIds?timestamp=' + new Date().getTime(),

		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(result) {
			handleAisleNumber(result);

		},
		error: function(e) {}
	})
}

//处理通道号
function handleAisleNumber(data) {
	var checkingChannelId = [];
	var unCheckingChannelId = [];
	var html = [];
	if(!Utils.isEmptyObject(data)) {
		checkingChannelId = data.checkingChannelId;
		unCheckingChannelId = data.unCheckingChannelId;
		if(!Utils.isEmptyObject(checkingChannelId)) {
			$('#channelNumber').val(checkingChannelId[0]);
			for(var i = 0; i < checkingChannelId.length; i++) {
				html.push('<li onclick="selectChannel(this)">' + checkingChannelId[i] + '</li>');
			}
			getCurrentChannelContent(checkingChannelId[0]);
		}
		if(!Utils.isEmptyObject(unCheckingChannelId)) {
			if(Utils.isEmptyObject(checkingChannelId)) {
				$('#channelNumber').val(unCheckingChannelId[0]);
				getCurrentChannelContent(unCheckingChannelId[0]);
			}
			for(var i = 0; i < unCheckingChannelId.length; i++) {
				html.push('<li onclick="selectChannel(this)">' + unCheckingChannelId[i] + '</li>');
			}
		}
		connect();
	}

	$('ul.channel-number').html(html.join(''))
}

//选择通道号
function selectChannel(e) {
	var channelId = $(e).text();
	$('#channelNumber').val(channelId);
	connect();
	$('.channel-number-pop').hide();
	getCurrentChannelContent(channelId);

}

//得到当前通道号下面的内容 和请求视频IP
var ipObj;
function getCurrentChannelContent(channelId) {
	$.ajax({
		type: 'get',
		url: Utils.url + '/scene/getOrderInfo?channelId=' + channelId + '&timestamp=' + new Date().getTime(),
		success: function(result) {
			handleBasicsInfo(result);
			// console.log(result);
			// 视频ip

		},

		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		error: function(e) {
			Utils.noticeModelFn($('.notice-model'), '当前通道号下面的内容获取失败!', 2);
		}
	});
	//摄像头通道
	$.ajax({
		type: 'get',
		url: Utils.url + '/scene/getCamera?channelId=' + channelId + '&timestamp=' + new Date().getTime(),

		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(result) {
			if(result.status == 200 && result.msg == 'OK') {
				// console.log(result)
				ipObj = result.data;
				 console.log((ipObj))
				
				sessionStorage.setItem('ipObj', JSON.stringify(ipObj));
				//getVideoChannelIp();
				 
				 loginCMS();
			}
		},
		error: function() {
			Utils.noticeModelFn($('.notice-model'), '当前通道视频获取失败!', 2);
		}
	});
}

//处理基础信息
function handleBasicsInfo(data) {
	var html = [];
	var devices = [];
	if(!Utils.isEmptyObject(data)) {
		var basicsInfo = data.hisiOrderinfoBasic;
		if(!Utils.isEmptyObject(basicsInfo)) {
			$('#waybillNumber').text(basicsInfo.orderId == "" ? "暂无" : basicsInfo.orderId);
			$('#flightAndCount').html('<span>件数：' + basicsInfo.num + '</span><span>航班：' + basicsInfo.flightId + '</span>')
			// $('#securityStaff').text(Utils.isEmptyObjectReturnString(basicsInfo.checkPerson)==""?"暂无":Utils.isEmptyObjectReturnString(basicsInfo.checkPerson));
			$('#carryPerson').text(basicsInfo.carryPerson == "" ? "暂无" : basicsInfo.carryPerson);
			$('#proxyName').text(basicsInfo.proxyName == "" ? "暂无" : basicsInfo.proxyName);
			$('#createTime').text(Utils.getTimeByTimestamp('' + basicsInfo.createTime + '') == "" ? "暂无" : Utils.getTimeByTimestamp('' + basicsInfo.createTime + ''))
			$('#startTime').text(Utils.getTimeByTimestamp('' + basicsInfo.startTime + '') == "" ? "暂无" : Utils.getTimeByTimestamp('' + basicsInfo.startTime + ''))
			$('#enTime').text(Utils.getTimeByTimestamp('' + basicsInfo.lastPauseTime + '') == "" ? "暂无" : Utils.getTimeByTimestamp('' + basicsInfo.lastPauseTime + ''))
			// $('#enTime').text( Utils.getTimeByTimestamp('' + basicsInfo.endTime + '')==""?"暂无":Utils.getTimeByTimestamp('' + basicsInfo.endTime + '') )
		} else {
			clearTextContent();
		}
		var photos = data.photos;
		if(!Utils.isEmptyObject(photos)) {
			for(var i = 0; i < photos.length; i++) {
				html.push('<li><img src="' + photos[i].photoPath + '"/></li>')
			}
		}
		devices = data.devices;
		if(!Utils.isEmptyObject(devices)) {
			for(var i = 0; i < devices.length; i++) {
				////				/通道入口", "通道出口", "安检室", "开包台"
				if(devices[i].deviceType == '通道入口') {
					// initePlayer(devices[i].creamaUrl, 'aisleEnterPlayer');
				} else if(devices[i].deviceType == '通道出口') {
					// initePlayer(devices[i].creamaUrl, 'aisleExitPlayer');
				} else if(devices[i].deviceType == '安检室') {
					// initePlayer(devices[i].creamaUrl, 'checkPersonPlayer');
				} else { //开包台
					// initePlayer(devices[i].creamaUrl, 'unpackPersonPlayer');
				}

			}
		}
		//		initePlayer('ezopen://open.ys7.com/140409569/1.hd.live','unpackPersonPlayer');
	} else {
		clearTextContent();
	}

	$('ul.all-img').html(html.join(''));

}

//清空内容
function clearTextContent() {
	$('#waybillNumber').text('暂无');
	$('#flightAndCount').html('<span>件数：0</span><span>航班：暂无</span>');
	//  $('#securityStaff').text('暂无');
	$('#carryPerson').text('暂无');
	$('#proxyName').text('暂无');
	$('#createTime').text('暂无');
	$('#startTime').text('暂无');
	$('#enTime').text('暂无')
}

function getWebVideoCtrl(oIframe) {
	return oIframe.contentWindow.WebVideoCtrl;
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

//var g_aIframe = $("iframe"); //获取到iframe
//获取到的视频通道ip

var oLiveView = {
    szIP: "172.22.100.20", // protocol ip
    szPort: "80", // protocol port
    szName: "admin", // device username
    szPswd: "hk.201712",// device password
    lCounts: 4,//窗口数目
    CameraID: 1036,//监控点
    lIndex: 1,//窗口index
};
function getVideoChannelIp() {
	/*$(window).unload(function() {
		$.each(g_aIframe, function(i, oIframe) {
			getWebVideoCtrl(oIframe).I_Stop();
		});
	});*/
	
	
	/*$(".video-box .video-area").each(function(i) {
		$(this).html('');
		$(this).append('<iframe name="iframeBox" class="iframe"  scrolling="yes" marginWidth="0" marginHeight="0" src="video-iframe.html?id=' + i + '" frameborder="0" ></iframe>')
	})*/

}


/*****同步登录CMS******/
function loginCMS() {
	var OCXobj = document.getElementById("PreviewOcx");

    var result = OCXobj.SetLoginType(0);    // 设置同步登入模式
    var ret = OCXobj.Login(oLiveView.szIP, oLiveView.szPort, oLiveView.szName, oLiveView.szPswd);
    switch (ret) {
        case 0:
            console.log("同步登录成功");
            OCXobj.SetWndNum(oLiveView.lCounts);
            setTimeout(function(){
            	 SetlocalParam();
            	 //console.log(ipObj);
            	 for(var i=0;i<ipObj.length;i++){
	            	 oLiveView.lIndex = i;
	                 oLiveView.CameraID = Number(ipObj[i].creama_id);
	                 StartPlayView();
                 }
            	 
            },1100);
            break;
        case -1:
            //clearTree();
            console.log("同步登录失败！");
            showMethodInvokedInfo("视频同步登录失败，请刷新页面！");
            break;
        default:
            break;
    }

}

//视频预览
function StartPlayView() {
	var OCXobj = document.getElementById("PreviewOcx");
    console.log(oLiveView.CameraID,oLiveView.lIndex)
    var ret = OCXobj.StartTask_Preview_InWnd(oLiveView.CameraID,oLiveView.lIndex);

    switch (ret) {
        case 0:
            //showMethodInvokedInfo("StartTask_Preview接口调用成功！");
           
            break;
        case -1:
            showMethodInvokedInfo("视频实时调用接口调用失败，请刷新页面！");
           
            break;
        default:
            break;
    }
}
function showMethodInvokedInfo(msg) {
    Utils.noticeModelFn($('.notice-model'), msg, 2);
}

var picList;
//设置截图参数
function SetlocalParam() {
    picList={
        PicType:0,//0：jpg 1：bmp
        PicPath:'C:\\CapPic',//路径
        PicCapType:0,//按时间 按帧
        PicSpanTime:1,//抓图时间间隔,单位(ms)
        PicCounts:1//抓图张数
    };
    //0 C:\CapPic 0 1 1
    //console.log(PicType, PicPath, PicCapType, PicSpanTime, PicCounts, RecordType, MaxRecordTimes, RecordTimes, RecordPath, RecordSize)
    var OCXobj = document.getElementById("PreviewOcx");

    //设置图片保存路径和格式
    if (picList.PicCapType == 0) {
        var iRet = OCXobj.SetCaptureParam(picList.PicType, picList.PicPath, picList.PicCapType, picList.PicSpanTime, picList.PicCounts);
        switch (iRet) {
            case -1:
               // showMethodInvokedInfo("SetCaptureParam接口调用失败！错误码：" + OCXobj.GetLastError());
                showMethodInvokedInfo("图片参数设置失败，请刷新页面！");
                break;
            case 0:
                //showMethodInvokedInfo("SetCaptureParam接口调用成功！");
                break;
            default:
                break;
        }
    }
}
