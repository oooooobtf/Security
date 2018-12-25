var selectflights = [];
var createTime = "";
var conditions = "";
var qiantian = "";
var isCheck;
var nameData;

$(function() {
	
	if(sessionStorage.getItem('userData') !== null) {
		nameData = sessionStorage.getItem('userData')
		console.log(JSON.parse(nameData))
		//		console.log(sessionStorage.getItem('userName'))
		$('#userName').text(JSON.parse(nameData).userName)
	}
	if(nameData == null || nameData == '' || nameData == undefined) {
		Utils.noticeModelFn($('.notice-model'), '登陆信息过期，即将返回登陆页面重新登陆！', 2);

		setTimeout(function() {
			window.location = 'login.html';
		}, 3000);
		return
	}
	disconnect();

	laydate.render({
		elem: '#screenTime',
		theme: "#62a8ea",
		eventElem: '.time-span',
		done: function(value, date, endDate) {
			$('.time-span').text('')
			createTime = value;
			findByConditions()
		},
	});

	loadOrder();
	connect();
})

//websock 获得办公室新添加的运单
var stompClient = null;
//此值有服务端传递给前端,实现方式没有要求
//var userId = Math.random() > 0.5 ? '001' : '002';
var userId = JSON.parse(sessionStorage.getItem('userData')).channelId
var userId1 = "007";
var newOrder = "";
console.log(userId)
//websock协议
function connect() {
	var socket = new SockJS(Utils.url + '/endpointWisely'); //1连接SockJS的endpoint是“endpointWisely”，与后台代码中注册的endpoint要一样。
	stompClient = Stomp.over(socket); //2创建STOMP协议的webSocket客户端。
	stompClient.connect({}, function(frame) { //3连接webSocket的服务端。
		//		setConnected(true);
		console.log('开始进行连接Connected: ' + frame);
		//4通过stompClient.subscribe（）订阅服务器的目标是'/topic/getResponse'发送过来的地址，与@SendTo中的地址对应。
		//		stompClient.subscribe('/topic/getResponse', function(respnose) {
		//		});
		//		stompClient.subscribe('/topic/order', function(respnose) {
		//		});
		//4通过stompClient.subscribe（）订阅服务器的目标 是'/user/' + userId + '/msg'接收一对一的推送消息,
		//其中userId由服务端传递过来,用于表示唯一的用户,通过此值将消息精确推送给一个用户
		stompClient.subscribe('/user/' + userId + '/msg', function(
			respnose) {
			console.log("response.body====" + respnose.body + "=====");
			if(respnose.body === 'DELETE' || respnose.body === 'START' || respnose.body === 'PAUSE') {
				loadOrder();
			} else {

			}
			//			loadOrder()
		});
		stompClient.subscribe('/user/' + userId1 + '/msg', function(respnose) {
			appendOrder(JSON.parse(respnose.body));
		});
	});
}
//window.onbeforeunload = function() {
//	if(stompClient != null) {
//		stompClient.disconnect();
//	}
//}

function disconnect() {
	if(stompClient != null) {
		stompClient.disconnect();
	}
	//console.log("Disconnected");
}

//追加订单websocket
function appendOrder(value) {
	var data = value.hisiOrderinfoBasic;
	var html = [];
	html.push('<div class="swiper-slide" >')
	if(data.status == 0 && isCheck == "false" || data.status == 3 && isCheck == "false") {
		html.push('<div class="waybill waybill-wait">')
	} else if(data.status == 0 && isCheck == "true") {
		html.push('<div class="waybill waybill-gray">')
	} else if(data.status == 2 && isCheck == "true") {
		html.push('<div class="waybill waybill-proceed">')
	} else if(data.status == 3 && isCheck == "true") {
		html.push('<div class="waybill waybill-gray">')
	}
	html.push('<div class="way-head">')
	if((data.status == 0 && isCheck == "false") || (data.status == 3 && isCheck == "false")) {
		html.push('<i class="circle cir-blue"></i>')
	} else if(data.status == 0 && isCheck == "true") {
		html.push('<i class="circle cir-gray"></i>')
	} else if(data.status == 3 && isCheck == "true") {
		html.push('<i class="circle cir-gray"></i>')
	} else if(data.status == 2) {
		html.push('<i class="circle cir-orange"></i>')
	}
	html.push('<div class="one-tier">')
	html.push('<h4 class="way-tit black-tit">运单号 ' + data.orderId + '</h4>')
	html.push('<span class="label green">件数： ' + data.num + '</span>')
	html.push('</div>')
	html.push('<p class="two-tier">')
	if(data.status == 0 || data.status == 3) {
		html.push('<span class="status wait-gray">等待安检...</span>')
	} else if(data.status == 2) {
		html.push('<span class="status wait-gray">安检进行中...</span>')
	}
	html.push('<span class="gray-tit creat-time">创建时间：')
	html.push('<i class="black time-font">' + compareNull(data.createTime, 2).substring(0, 11) + '</i>')
	html.push('</span>')
	html.push('</p>')
	html.push('</div>')
	// 内容
	html.push('<div class="way-content">')
	html.push('<div class="way-list">')
	html.push('<ul>')
	html.push('<li><p class="gray-tit">航班号 <span class="black gap"> ' + data.flightId + '</span></p>')
	html.push('</li>')
	html.push('<li><p class="gray-tit">承运人 <span class="black gap">' + data.carryPerson + '</span></p>')
	html.push('</li>')
	html.push('<li><p class="gray-tit">通道号 <span class="black gap">' + compareNull(data.channelId, 1) + '</span></p>')
	html.push('</li>')
	html.push('</ul>')
	html.push('<div class="way-plan">')
	html.push('<div class="plan-part">')
	html.push('<p class="plan-node">')
	html.push('<i class="spot green-spot"></i>')
	html.push('<span class="gray-tit" style="margin-right: 16px;">运单开始时间</span>')
	html.push('<span class="black">' + compareNull(data.startTime, 2) + '</span>')
	html.push('</p>')
	html.push('<p class="plan-node">')
	html.push('<i class="spot red-spot"></i>')
	html.push('<span class="gray-tit" style="margin-right: 16px;">最近暂停时间</span>')
	html.push('<span class="black">' + compareNull(data.lastPauseTime, 2) + '</span>')
	html.push('</p>')
	html.push('</div>')
	html.push('</div>')
	html.push('</div>')
	html.push('</div>') ///新
	// 相关图片
	html.push('<div class="relation-img">')
	html.push('<p class="gray-tit">相关图片</p>')
	html.push('<div class="img-list">')
	html.push('<div class="swiper-container">')
	html.push('<div class="swiper-wrapper" style="height: 100px;">')
	for(var j = 0; j < value.photos.length; j++) {
		html.push(
			'<div class="swiper-slide" style="width: 150px">' +
			'<img src="' + value.photos[j].photoPath + '" width="90%" style="border-radius: 5px;height: 100px;"  onclick="preImg(this)">' +
			'</div>'
		)
	}

	html.push('</div>')
	html.push('<div class="swiper-button-next"></div>')
	html.push('<div class="swiper-button-prev"></div>')
	html.push('</div>')
	html.push('</div>')
	// html.push('</div>')
	html.push('</div>')

	html.push('<div class="hint">')
	if(data.status == 2 && isCheck == "true") {
		html.push('<div class="hint-content">')
		html.push(' <p class="hint-tit"><i class="hint-icon"></i>提示</p>')
		html.push('<p class="hint-txt">将货物按照规范搬到传送带上，并开启传送带开关必须结束当前正在安检的运单后，才可以开始下一单')
		html.push('</p>')
		html.push('</div>')
	}
	html.push('</div>')
	html.push('<div class="way-footer">')
	if(data.status == 0 && isCheck == "false") {
		html.push('<div class="start-btn fot-blue" onclick="checkSecurity(this)" data-orderId="' + data.orderId + '">开始安检</div>')
	} else if(data.status == 2 && isCheck == "true") {
		html.push('<div class="switch" onclick="stopSeurity(this)"  data-orderId="' + data.orderId + '"><span>暂停</span></div>')
		html.push('<div class="footer-btn fot-orange" onclick="showAlert(this)" data-orderId="' + data.orderId + '">结束安检</div>')
	} else if(data.status == 3 && isCheck == "true") {
		html.push('<div class="orange-switch" onclick="showDialogAlertGo()"><span>开始</span></div>')
		html.push('<div class="footer-btn fot-gray">结束安检</div>')
	} else if(data.status == 3 && isCheck == "false") {
		html.push('<div class="orange-switch" onclick="checkSecurity(this)" data-orderId="' + data.orderId + '"><span>开始</span></div>')
		html.push('<div class="footer-btn fot-gray">结束安检</div>')
	} else if(data.status == 0 && isCheck == "true") {
		html.push('<div class="start-btn fot-gray" onclick="showDialogAlertGo()">开始安检</div>')
	}
	html.push('</div>')
	html.push('</div>')
	html.push('</div>')

	$('#mainContent').append(html.join(''));
	initSwiper();
}

/*初始化Swiper*/
function initSwiper() {
	var myBigSwiper = new Swiper('.bigswiper', {
		slidesPerView: 3,
		prevButton: '.swiper-button-prev',
		nextButton: '.swiper-button-next',
		observer: true, //修改swiper自己或子元素时，自动初始化swiper
		observeParents: true, //修改swiper的父元素时，自动初始化swiper
		onSlideChangeEnd: function(swiper) {
			swiper.update();
			// mySwiper.startAutoplay();
			// mySwiper.reLoop();
		}
	})
	var mySwiper = new Swiper('.swiper-container', {
		slidesPerView: 3,
		prevButton: '.swiper-button-prev',
		nextButton: '.swiper-button-next',
		observer: true, //修改swiper自己或子元素时，自动初始化swiper
		observeParents: true, //修改swiper的父元素时，自动初始化swiper
		onSlideChangeEnd: function(swiper) {
			swiper.update();
			// mySwiper.startAutoplay();
			// mySwiper.reLoop();
		}
	})
}

function getHtml(data) {
	var html = [];
	for(var i = 0; i < data.length; i++) {
		html.push('<div class="swiper-slide" >');
		if(data[i].status == 0 && isCheck == "false" || data[i].status == 3 && isCheck == "false") {
			html.push('<div class="waybill waybill-wait">')
		} else if(data[i].status == 0 && isCheck == "true") {
			html.push('<div class="waybill waybill-gray">')
		} else if(data[i].status == 2 && isCheck == "true") {
			html.push('<div class="waybill waybill-proceed">')
		} else if(data[i].status == 3 && isCheck == "true") {
			html.push('<div class="waybill waybill-gray">')
		}
		html.push('<div class="way-head">')
		if((data[i].status == 0 && isCheck == "false") || (data[i].status == 3 && isCheck == "false")) {
			html.push('<i class="circle cir-blue"></i>')
		} else if(data[i].status == 0 && isCheck == "true") {
			html.push('<i class="circle cir-gray"></i>')
		} else if(data[i].status == 3 && isCheck == "true") {
			html.push('<i class="circle cir-gray"></i>')
		} else if(data[i].status == 2) {
			html.push('<i class="circle cir-orange"></i>')
		}
		html.push('<div class="one-tier">')
		html.push('<h4 class="way-tit black-tit">运单号 ' + data[i].orderId + '</h4>')
		html.push('<span class="label green">件数： ' + data[i].num + '</span>')
		html.push('</div>')
		html.push('<p class="two-tier">')
		if(data[i].status == 0 || data[i].status == 3) {
			html.push('<span class="status wait-gray">等待安检...</span>')
		} else if(data[i].status == 2) {
			html.push('<span class="status wait-gray">安检进行中...</span>')
		}
		html.push('<span class="gray-tit creat-time">创建时间：')
		html.push('<i class="black time-font">' + compareNull(data[i].createTime, 2).substring(0, 11) + '</i>')
		html.push('</span>')
		html.push('</p>')
		html.push('</div>')

		// 内容
		html.push('<div class="way-content">')
		html.push('<div class="way-list">')
		html.push('<ul>')
		html.push('<li><p class="gray-tit">航班号 <span class="black gap"> ' + data[i].flightId + '</span></p>')
		html.push('</li>')
		html.push('<li><p class="gray-tit">承运人 <span class="black gap">' + data[i].carryPerson + '</span></p>')
		html.push('</li>')
		html.push('<li><p class="gray-tit">通道号 <span class="black gap">' + compareNull(data[i].channelId, 1) + '</span></p>')
		html.push('</li>')
		html.push('</ul>')
		html.push('<div class="way-plan">')
		html.push('<div class="plan-part">')
		html.push('<p class="plan-node">')
		html.push('<i class="spot green-spot"></i>')
		html.push('<span class="gray-tit" style="margin-right: 16px;">运单开始时间</span>')
		html.push('<span class="black">' + compareNull(data[i].startTime, 2) + '</span>')
		html.push('</p>')
		html.push('<p class="plan-node">')
		html.push('<i class="spot red-spot"></i>')
		html.push('<span class="gray-tit" style="margin-right: 16px;">最近暂停时间</span>')
		html.push('<span class="black">' + compareNull(data[i].lastPauseTime, 2) + '</span>')
		html.push('</p>')
		html.push('</div>')
		html.push('</div>')
		html.push('</div>')
		html.push('</div>')

		// 相关图片
		html.push('<div class="relation-img">')
		html.push('<p class="gray-tit">相关图片</p>')
		html.push('<div class="img-list">')
		html.push('<div class="swiper-container smallswiper">')
		html.push('<div class="swiper-wrapper" style="height: 100px;">')
		for(var j = 0; j < data[i].photos.length; j++) {
			html.push(
				'<div class="swiper-slide" style="width: 150px">' +
				'<img src="' + data[i].photos[j].photoPath + '" width="90%" style="border-radius: 5px;height: 100px;"  onclick="preImg(this)">' +
				'</div>'
			)
		}
		html.push('</div>')
		html.push('<div class="swiper-button-next"></div>')
		html.push('<div class="swiper-button-prev"></div>')
		html.push('</div>')
		html.push('</div>')
		html.push('</div>')
		html.push('<div class="hint">')
		if(data[i].status == 2 && isCheck == "true") {
			html.push('<div class="hint-content">')
			html.push('<p class="hint-tit"><i class="hint-icon"></i>提示</p>')
			html.push('<p class="hint-txt">将货物按照规范搬到传送带上，并开启传送带开关必须结束当前正在安检的运单后，才可以开始下一单</p>')
			html.push('</div>')
		}
		html.push('</div>')
		html.push('<div class="way-footer">')
		if(data[i].status == 0 && isCheck == "false") {
			html.push('<div class="start-btn fot-blue" onclick="checkSecurity(this)" data-orderId="' + data[i].orderId + '">开始安检</div>')
		} else if(data[i].status == 2 && isCheck == "true") {
			html.push('<div class="switch" onclick="stopSeurity(this)"  data-orderId="' + data[i].orderId + '"><span>暂停</span></div>')
			html.push('<div class="footer-btn fot-orange" onclick="showAlert(this)" data-orderId="' + data[i].orderId + '">结束安检</div>')
		} else if(data[i].status == 3 && isCheck == "true") {
			html.push('<div class="orange-switch" onclick="showDialogAlertGo()"><span>开始</span></div>')
			html.push('<div class="footer-btn fot-gray">结束安检</div>')
		} else if(data[i].status == 3 && isCheck == "false") {
			html.push('<div class="orange-switch" onclick="checkSecurity(this)" data-orderId="' + data[i].orderId + '"><span>开始</span></div>')
			html.push('<div class="footer-btn fot-gray">结束安检</div>')
		} else if(data[i].status == 0 && isCheck == "true") {
			html.push('<div class="start-btn fot-gray" onclick="showDialogAlertGo()">开始安检</div>')
		}
		html.push('</div>');
		html.push('</div>');
		html.push('</div>')
	}
	return html.join('');
}

//断开连接
function disconnect() {
	if(stompClient != null) {
		stompClient.disconnect();
	}
}

// 初始化订单
function loadOrder() {
	$.ajax({
		type: "GET",
		url: Utils.url + "/order/getOrder_site" + '?timestamp=' + new Date().getTime() + '&channelId=' + JSON.parse(nameData).channelId,
		contentType: "application/json;charset=UTF-8",
		dataType: 'json',
		success: function(data) {
			console.log(data)
			if(data.status == 200) {
				$('.el-loading-mask').hide()
				if(data.data.orderStatus === "Y") {
					sessionStorage.setItem('isCheck', 'true')
				} else {
					sessionStorage.setItem('isCheck', 'false')
				}
				fullOrder(data.data.list.items)

			} else {

			}

		}
	})

}

// 填充内容
function fullOrder(data) {
	isCheck = sessionStorage.getItem('isCheck')
	if(isCheck == undefined) {
		for(var k = 0; k < data.length; k++) {
			if(data[k].status == 2) {
				isCheck = "true"
				break;
			} else {
				isCheck = 'false'
			}
		}
	} else {

	}
	// $('.scene-content').html(html.join(''))
	$('#mainContent').html(getHtml(data));

	initSwiper();
}

// 开始安检
function checkSecurity(e) {
	var data = {
		orderId: $(e).attr('data-orderId')
	}
	$.ajax({
		type: "POST",
		url: Utils.url + "/order/startCheck" + '?timestamp=' + new Date().getTime() + '&channelId=' + JSON.parse(nameData).channelId,
		data: JSON.stringify(data),
		contentType: "application/json;charset=UTF-8",
		xhrFields: {
			withCredentials: true
		},
		// dataType: "json",
		success: function(data) {
			if(data.status == 200) {
				var isCheck = "true";
				sessionStorage.setItem('isCheck', isCheck)
				loadOrder();
				//				findByConditions()
			} else {

			}

		}
	})
}
// 暂停安检
function stopSeurity(e) {
	var data = {
		orderId: $(e).attr('data-orderId')
	}
	$.ajax({
		type: "POST",
		xhrFields: {
			withCredentials: true
		},
		url: Utils.url + "/order/pauseCheck" + '?timestamp=' + new Date().getTime(),
		data: JSON.stringify(data),
		contentType: "application/json;charset=UTF-8",
		// dataType: "json",
		success: function(data) {
			if(data.status == 200) {
				var isCheck = "false";
				sessionStorage.setItem('isCheck', isCheck)
				loadOrder();
				//				findByConditions()
			} else {

			}

		}
	})
}
// 结束安检弹框
function showAlert(e) {
	$('.dialog-figure-alert').show()
	// endSecurity(e)
	sessionStorage.setItem('orderId', $(e).attr('data-orderId'))

}

//结束安检
function endSecurity() {
	var data = {
		orderId: sessionStorage.getItem('orderId')
	}
	$.ajax({
		type: "POST",
		url: Utils.url + "/order/endCheck" + '?timestamp=' + new Date().getTime() + '&channelId=' + JSON.parse(nameData).channelId,
		data: JSON.stringify(data),
		xhrFields: {
			withCredentials: true
		},
		contentType: "application/json;charset=UTF-8",
		// dataType: "json",
		success: function(data) {
			if(data.status == 200) {
				var isCheck = "false";
				sessionStorage.setItem('isCheck', isCheck)
				$('.dialog-figure-alert').hide()
				loadOrder();
				//				findByConditions()
			} else if(data.status == 400) {
				$('.dialog-figure-alert').hide()
				Utils.noticeModelFn($('.notice-model'), '当前运单还有未开包的货物，不能结束！', 2);
			}

		}
	})

}

//计算机
function tapKey(data) {
	switch(data) {
		case "删除":
			var j = ($('#searchInput').val().length);
			$('#searchInput').val(($('#searchInput').val()).substring(0, j - 1));
			break;
		case "确认":
			$('.dialog-key').hide();
			conditions = $('#searchInput').val()
			//			console.log(conditions)
			findByConditions()
			break;
		case 0:
		case 1:
		case 2:
		case 3:
		case 4:
		case 5:
		case 6:
		case 7:
		case 8:
		case 9:
			$('#searchInput').val($('#searchInput').val() + data);
			break;

	}

}
// 预览图片
function preImg(e) {
	$('.img-preview').show()
	$('#imgPreview').attr('src', e.src)
}

// 改变时间控件样式
function changelaydate() {
	$('.laydate-theme-molv .layui-laydate-main').css('width', '470px')
	$('.layui-laydate-content table').css('width', '450px')
	$('.layui-laydate-content').css('font-size', '20px')
}

// show航班选择框
function showFlight(e) {
	//	console.log(e)
	$('.dialog-figure').show()
	selectflights = [];
	$.ajax({
		type: "POST",
		url: Utils.url + "/order/getFlightId" + '?timestamp=' + new Date().getTime(),
		// dataType: "json",
		success: function(data) {
			$('.el-loading-mask1').hide()
			var html = [];
			for(var i = 0; i < data.length; i++) {
				html.push("<div class='flightlist' onclick='checkFlight(this)'>" + data[i] + "</div>")
			}
			$('.dialog-body').html(html)

		}
	});
}

function compareNull(data, flag) {
	if(data == null) {
		return ""
	} else {
		switch(flag) {
			case 1:
				return data;
				break;
			case 2:
				return Utils.getTimeByTimestamp(String(data));
				break;
		}

	}
}

// 筛选航班
function checkFlight(e) {
	if($(e).hasClass('flight-active') == true) {
		$(e).removeClass('flight-active')
		for(var i = 0; i < selectflights.length; i++) {
			if(selectflights[i] == $(e).text()) {
				selectflights.splice(i, 1)
			}
		}

	} else {
		$(e).addClass('flight-active');
		selectflights.push($(e).text());

	}
}

// 确认筛选
function affirmFlight() {
	if(selectflights.length == 0) {
		$('.dialog-figure').hide()
		// selectflights=[]
		loadOrder()
	} else {
		//		console.log(selectflights)
		$('#flightInput').val(selectflights)
		findByConditions()
	}
}

function emptyFlight(e) {
	//	console.log(e)
	$('#flightInput').val('');
	selectflights = [];
	loadOrder();
	//	findByConditions();
	// 阻止冒泡
	if(e && e.stopPropagation) {
		//因此它支持W3C的stopPropagation()方法
		e.stopPropagation();
	} else {
		//否则，我们需要使用IE的方式来取消事件冒泡
		window.event.cancelBubble = true;
	}

}
// 筛选
function findByConditions() {
	$.ajax({
		type: "POST",
		url: Utils.url + "/order/findOrder_site?createTime=" + encodeURI(createTime, 'UTF-8') + "&qiantian=" + encodeURI(qiantian, 'UTF-8') + "&flightIds=" + selectflights + "&conditions=" + conditions + '&timestamp=' + new Date().getTime(),
		// dataType: "json",
		success: function(data) {
			$('.dialog-figure').hide()
			fullOrder(data)
		}
	});
}

// 结束安检警告框
function showDialogAlert(e) {
	$('.dialog-figure-alert').show()
}

// 有订单在进行中
function showDialogAlertGo() {
	$('.dialog-figure-go').show()
}

// 选择前天
function selectDay() {
	if($('.select-day').find('i').hasClass("day-active") == false) {
		$('.select-day').find('i').addClass("day-active");
		qiantian = "qiantian";
		findByConditions();
	} else {
		$('.select-day').find('i').removeClass("day-active");
		qiantian = "";
		findByConditions()
	}
}

// 清空筛选时间
function emptyTime() {
	$('.time-span').text('请选择日期');
	$('#screenTime').val("")
	createTime = "";
	loadOrder();
	//	findByConditions()

}

//登出
function loginout() {
	var self = this;
	$.ajax({
		type: "get",
		url: Utils.url + "/shrio/logout?timestamp=" + new Date().getTime(),
		async: true,
		contentType: 'application/json',
		success: function(result) {
			if(Number(result.status) == 200) {
				sessionStorage.removeItem('isCheck')
				location.href = "login.html"
			} else {

			}
		}
	});
}