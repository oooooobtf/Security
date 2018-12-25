var selectflights = [];
var selectCompany = "";
var formCompany = "";
var createTime = "";
var conditions = "";
var qiantian = "";
var isCheck;
var nameData;
//var isAdd;
var newOrder;
var cursurPosition;
var isGetPosition = false;
var flag = null;
var isTrueOrder = false;
var token = sessionStorage.getItem('token');

$(window).keydown(function(e) {
	var key = window.event ? e.keyCode : e.which;
	if(key.toString() == "13") {
		return false;
	}
})


$(function() {

	if(sessionStorage.getItem('userData') !== null) {
		nameData = JSON.parse(sessionStorage.getItem('userData'))
		//		console.log(sessionStorage.getItem('userName'))
		$('#userName').text(nameData.userName)
	}
	var setTimeoutLoing;
	$('#code').bind('input propertychange', function() {
		window.clearTimeout(setTimeoutLoing);
		setTimeoutLoing = setTimeout(function() {
			slotOrder($('#code').val());
		}, 100)
	})
	//	if(nameData == null || nameData == '' || nameData == undefined) {
	//		noticeModelFn($('.notice-model-screen'), '登陆信息过期，即将返回登陆页面重新登陆！', 2);
	//
	//		setTimeout(function() {
	//			window.location = 'login.html';
	//		}, 3000);
	//		return
	//	}
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

	//	loadOrder();
	connect();
	$('input[name="carryPeople"]').on('focus', function() {
		$(this).trigger('blur');
	});
	//  fullScreen()
})

//$(document).ready(function(){
//	
//	
//	initSoftKey()
//  
//});

var mainContainer = new Vue({
	el: "#mainContainer",
	data: {
		items: [],
		list: {},
		pageNum: 1,
		pageSize: 12,
		pages: 0,
		total: 0,
		orderNo: "",
		flightNo: "",
		count: "",
		carryPeople: "",
		userName: "",
		orderStatus: "2"

	},
	methods: {

		//		跳转运单详情
		gotoDetail: function(data) {
			console.log(data);
			sessionStorage.setItem('orderMsg', JSON.stringify(data))
			window.location.href = "touchScreen-detail.html"
		},

		//		获得运单
		loadOrder: function() {
			var self = this;
			var width = window.screen.width;
			switch(width) {
				case 1920:
					self.pageSize = 24;
					break;
				case 1680:
					self.pageSize = 24;
					break;
				case 1660:
					self.pageSize = 15;
					break;
				case 1440:
					self.pageSize = 12;
					break;
				case 1400:
					self.pageSize = 12;
					break;
				case 1366:
					self.pageSize = 8;
					break;
			}
			$.ajax({
				type: "GET",
				url: Utils.url + "/order/getOrder_site" + '?timestamp=' + new Date().getTime() + '&channelId=' + nameData.channelId + '&userName=' + encodeURI(nameData.userName, 'UTF-8') + '&pageNum=' + self.pageNum + '&pageSize=' + self.pageSize + '&show=1',
				contentType: "application/json;charset=UTF-8",
				dataType: 'json',
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				success: function(data) {
					console.log(data)
					if(data.status == 200) {
						$('.el-loading-mask').hide()
						self.items = data.data.list.items;
						for(var i = 0; i < data.data.list.items.length; i++) {
							self.items[i].carryPerson = replaceZh(data.data.list.items[i].carryPerson)
						}
						self.list = data.data.list;
						self.orderStatus = data.data.list.orderStatus;
						self.pageNum = data.data.list.currentPage;
						self.pageSize = data.data.list.pageSize;
						self.total = data.data.list.totalNum;
						self.pages = data.data.list.totalPage;
						cutPage(self.pages, self.pageNum)

					} else {

					}

				}
			})

		},

		//		提交新增运单
		postOrder: function() {
			var self = this;
			var formData = new FormData();
			formData.append('orderId', self.orderNo);
			formData.append('flightId', self.flightNo)
			formData.append('num', self.count)
			formData.append('carryPerson', formCompany)
			formData.append('userName', nameData.userName)

			$.ajax({
				type: "POST",
				processData: false,
				contentType: false,
				xhrFields: {
					withCredentials: true
				},
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				url: Utils.url + "/order/addOrder" + '?timestamp=' + new Date().getTime(),
				// dataType: "json",
				data: formData,
				success: function(data) {
					if(data.status == 200) {
						$('.addorder').hide()
						//						isAdd = false;
						$('.add-input').css('border-color', '')
						$(document).find('span.error-hinttext').hide();
						self.loadOrder()
						noticeModelFn($('.notice-model-screen'), '新增成功！', 1);
					} else if(data.status == 400) {
						if(data.msg == "该id已存在") {
							noticeModelFn($('.notice-model-screen'), '该运单号已存在！', 2);
						} else {
							noticeModelFn($('.notice-model-screen'), data.msg + '！', 2);
						}

					}
				}
			});

		},

		//		根据状态获得运单样式
		compareColor: function(status) {
			switch(status) {
				case 0:
					return "order-default";
					break
				case 2:
					return "order-play";
					break
				case 3:
					return "order-stop";
					break

			}

		},

		//		生成页码
		comparePage: function(currentPage, index) {
			if(currentPage == index + 1) {
				return "activepage"
			} else {
				return "pagebtn"
			}
		},
		changePage: function(page) {
			this.pageNum = page;
			this.loadOrder()
		},

	},
	mounted: function() {
		var self = this;
		if(sessionStorage.getItem('userData') !== null) {
			nameData = JSON.parse(sessionStorage.getItem('userData'))

			//		console.log(sessionStorage.getItem('userName'))
			$('#userName').text(nameData.userName)
		}
		self.userName = nameData.userName

		self.loadOrder();

	},
	created: function() {
		//获取动态时间
		$('#time').text(getTime(2))
		$('#date').text(getTime(3))
		setInterval("getTime(1)", 1000);
	}

})

//websock 获得办公室新添加的运单
var stompClient = null;
//此值有服务端传递给前端,实现方式没有要求
//var userId = Math.random() > 0.5 ? '001' : '002';
var userId = JSON.parse(sessionStorage.getItem('userData')).channelId
var userId1 = JSON.parse(sessionStorage.getItem('userData')).userName
var newOrder = "";
var socket;
console.log(userId)
//websock协议
function connect() {
	socket = new SockJS(Utils.url + '/endpointWisely'); //1连接SockJS的endpoint是“endpointWisely”，与后台代码中注册的endpoint要一样。
	stompClient = Stomp.over(socket); //2创建STOMP协议的webSocket客户端。
	stompClient.connect({}, function(frame) { //3连接webSocket的服务端。
		stompClient.subscribe('/user/' + userId + '/msg', function(respnose) {
			console.log("response.body====" + respnose.body + "=====");
			mainContainer.loadOrder()
		});
		stompClient.subscribe('/user/' + userId1 + '/msg', function(respnose) {
			if(JSON.parse(respnose.body).code == "ADD") {
				newOrder = JSON.parse(respnose.body).data;
				newOrder.carryPerson = replaceZh(JSON.parse(respnose.body).data.carryPerson)
				mainContainer.items.push(newOrder)
			}
			if(JSON.parse(respnose.body).code == "UPDATE" || JSON.parse(respnose.body).code == "DELETE") {

				mainContainer.loadOrder()
			}
			if(JSON.parse(respnose.body).code == "START" || JSON.parse(respnose.body).code == "PAUSE") {
				mainContainer.loadOrder()
			}

			//			appendOrder(JSON.parse(respnose.body));
		});
	});
	socket.onclose = function() {
		connect()
		console.log('close')
	}
	socket.onerror = function() {
		console.log('close')
		connect()
	}
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

//生成键盘
function showKeybored(flag) {
	$('#keycontent').html('')
	var html = [];
	//	html.push('<div class="softkeys" id="softKey" data-target="input[name=orderNo]">');
	switch(flag) {
		case 1:
			html.push('<div class="softkeys" id="softKey" data-target="input[name=orderNo]">');
			break;
		case 2:
			html.push('<div class="softkeys" id="softKey" data-target="input[name=flightNo]">');
			break;
		case 3:
			html.push('<div class="softkeys" id="softKey" data-target="input[name=count]">');
			break;
		case 4:
			html.push('<div class="softkeys" id="softKey" data-target="input[name=carryPeople]">');
			break;
	}
	html.push('</div>')
	$('#key').show()
	$('.closekey').show()
	$('#keycontent').html(html.join(''))

	initSoftKey()

}

function compareTime(val) {
	if(val < 10) {
		return "0" + val;

	} else {
		return val;
	}
}

//初始化键盘
function initSoftKey() {
	$('.softkeys').softkeys({
		target: $('.softkeys').data('target'),
		layout: [
			[
				['1'],
				['2'],
				['3'],
				['4'],
				['5'],
				['-'],
				['6'],
				['7'],
				['8'],
				['9'],
				['0'],

			],
			[
				'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '删除'

			],
			[

				'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',

			],
			[

				'Z', 'X', 'C', 'V', 'B', 'N', 'M',

			]
		]
	});
}

//取消运单
function cancelOrder() {
	$('.addorder').hide()
	$('.add-input').css('border-color', '')
	$('#key').hide();
	$('#keycontent').html('')
	$(document).find('span.error-hinttext').hide();
	//	isAdd = false;
	mainContainer.orderNo = "";
	mainContainer.flightNo = "";
	mainContainer.count = "";
	mainContainer.carryPeople = "";
	$('#orderno').val("")
	$('#flightno').val("")
	$('#count').val("")
	$('#carrier').val("")
}

function addOrder() {
	//	isAdd = true
	$(document).find('span.error-hinttext').hide();
	$('.add-input').css('border-color', '')
	$('.addorder').show()
	$('#code').focus()

}

//关闭承运人筛选框
function closeCarrySelect() {
	$('.dialog-figure-carry').hide();
	selectCompany = '';
	$(document).removeClass('flight-active')
}

//获得当前时间
function getTime(flag) {
	var tt = new Date();
	var fullYear = tt.getFullYear();
	var month = compareTime(tt.getMonth() + 1);
	var day = compareTime(tt.getDay());
	var date = compareTime(tt.getDate());
	var hours = compareTime(tt.getHours());
	var minutes = compareTime(tt.getMinutes());
	var seconds = compareTime(tt.getSeconds());
	if(flag == 1) {
		$('#time').text(hours + ":" + minutes + ":" + seconds);
	} else if(flag == 2) {
		return hours + ":" + minutes + ":" + seconds
	} else {
		return fullYear + "/" + month + "/" + date
	}

}

//验证中文
function replaceZh(val) {
	var regZh = /[^\u4E00-\u9FA5]/g //中文
	var value = val.replace(regZh, '')
	return value;
}

//断开连接
function disconnect() {
	if(stompClient != null) {
		stompClient.disconnect();
	}
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

// show航班选择框
function showFlight(e) {
	//	console.log(e)
	$('.dialog-figure').show()
	selectflights = [];
	$.ajax({
		type: "POST",
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		url: Utils.url + "/order/getFlightId" + '?timestamp=' + new Date().getTime() + '&proxyName=' + encodeURI(nameData.userName, 'UTF-8') + "&channelId=" + nameData.channelId,
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

//承运人选择框
function showCompany() {
	$('.dialog-figure-carry').show()
	$('#key').hide()
	$('.closekey').hide()
	$('#keycontent').html('')
	selectCompany = "";
	formCompany = "";
	var condition = "";
	$.ajax({
		type: "POST",
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		url: Utils.url + "/order/findCarryPersonBycondition?condition=" + condition + '&timestamp=' + new Date().getTime(),
		// dataType: "json",
		success: function(data) {
			$('.el-loading-mask1').hide()
			var html = [];
			for(var i = 0; i < data.length; i++) {
				html.push("<div class='flightlist' onclick='checkCompany(this)' data-name='" + data[i].carryPerson + "'>" + replaceZh(data[i].carryPerson) + "</div>")
			}
			$('.dialog-body').html(html)

		}
	});
}

//承运人选择框
function matchCompany() {

	$.ajax({
		type: 'post',
		url: Utils.url + '/order/findCarryPersonBycondition?condition=' + $('#orderno').val().substring(0, 3) + '&timestamp=' + new Date().getTime(),
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			if(result.length == 1) {
				formCompany = result[0].carryPerson
				mainContainer.carryPeople = replaceZh(result[0].carryPerson)
				isTrueOrder = true;
			} else {
				mainContainer.carryPeople = ""
				formCompany = "";
				isTrueOrder = false;

			}
		}
	})
}

//判断非空
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

// 筛选承运人
function checkCompany(e) {

	if($(e).hasClass('flight-active') == true) {
		$(e).removeClass('flight-active')
		selectCompany = "";

	} else {
		if(selectCompany === "") {
			$(e).addClass('flight-active');
			selectCompany = $(e).attr('data-name');
		}

	}

	//	if(isAdd === true) {
	//		if($(e).hasClass('flight-active') == true) {
	//			$(e).removeClass('flight-active')
	//			formCompany = "";
	//
	//		} else {
	//			if(formCompany === "") {
	//				$(e).addClass('flight-active');
	//				formCompany = $(e).attr('data-name');
	//				mainContainer.carryPeople = $(e).text()
	//			}
	//			console.log(formCompany)
	//
	//		}
	//	} else {
	//		if($(e).hasClass('flight-active') == true) {
	//			$(e).removeClass('flight-active')
	//			selectCompany = "";
	//
	//		} else {
	//			if(selectCompany === "") {
	//				$(e).addClass('flight-active');
	//				selectCompany = $(e).attr('data-name');
	//			}
	//
	//		}
	//	}

}

function verifyFrom(e) {
	$(e).parent().find('span.error-hinttext').hide();
	$(e).css('border-color', '#dcdfe6');
}

//提交验证
function postOrder() {
	$('#key').hide();
	$('#keycontent').html('')

	var reg = /^\s+|\s+$/g //空
	var regnum = /[^0-9]/g //数字
	var regNumAnd = /[^0-9-]/g //数字和-
	//	var regNumAnd = /^(\d|[-]){12}$/; //数字和-
	var regNumAndEng = /[^0-9A-Za-z]/g //大小写数字
	var regZh = /[^\u4E00-\u9FA5A-Za-z]/g //中文
	//	var regflight = /^[A-Z]{2}\d{3,5}$/
	var regflight = /^(?!\d+$)[\da-zA-Z]*$/

	var regOrder = /^\d{3}-\d{8}$/; //运单号验证  

	if($('#orderno').val().length <= 0 || reg.test($('#orderno').val())) {
		//		$('#orderno').val('');
		$('#orderno').parent().find('span.error-hinttext').text('请输入运单号！')
		$('#orderno').parent().find('span.error-hinttext').show();
		$('#orderno').css('border-color', '#f56c6c');
		return;
	} else {
		if($('#orderno').val().indexOf('-') < 0 || $('#orderno').val().length < 12 || $('#orderno').val().length > 12 || !regOrder.test($('#orderno').val()) || isTrueOrder == false) {
			//			$('#orderno').val('');
			$('#orderno').parent().find('span.error-hinttext').text('请输入正确的运单号！')
			$('#orderno').parent().find('span.error-hinttext').show();
			$('#orderno').css('border-color', '#f56c6c');
			return;
		}

	}

	if(reg.test($('#flightno').val()) || $('#flightno').val().length <= 0) {
		//		$('#flightno').val('');
		$('#flightno').parent().find('span.error-hinttext').text('请输入航班号！')
		$('#flightno').parent().find('span.error-hinttext').show();
		$('#flightno').css('border-color', '#f56c6c');
		return;
	} else {
		if(!regflight.test($('#flightno').val()) || $('#flightno').val().length > 9) {
			//		      $('#flightno').val('');
			$('#flightno').parent().find('span.error-hinttext').text('请输入正确的航班号！')
			$('#flightno').parent().find('span.error-hinttext').show();
			$('#flightno').css('border-color', '#f56c6c');
			return;
		}
	}

	if($('#count').val().length <= 0 || regnum.test($('#count').val()) || reg.test($('#count').val())) {
		//		$('#count').val('');
		$('#count').parent().find('span.error-hinttext').show();
		$('#count').css('border-color', '#f56c6c');
		return;
	}

	if($('#carrier').val().length <= 0) {
		//		$('#carrier').val('');
		$('#orderno').parent().find('span.error-hinttext').text('请输入正确的运单号！')
		$('#orderno').parent().find('span.error-hinttext').show()
		$('#orderno').css('border-color', '#f56c6c');
		//		$('#carrier').css('border-color', '#f56c6c');
		return;
	}

	mainContainer.postOrder()
}

// 确认筛选
function affirmFlight() {
	if(selectflights.length == 0) {
		$('.dialog-figure').hide()
		// selectflights=[]
		mainContainer.loadOrder()
	} else {
		//		console.log(selectflights)
		$('#flightInput').val(selectflights)
		findByConditions()
	}
}

function affirmCompany() {
	$('.dialog-figure-carry').hide()
	if(selectCompany === "") {

		// selectflights=[]
		mainContainer.loadOrder()
	} else {
		//		console.log(selectflights)
		$('#carryInput').val(replaceZh(selectCompany))
		findByConditions()
	}
}

//清空航班号筛选
//function emptyFlight(e) {
//	//	console.log(e)
//	$('#flightInput').val('');
//	selectflights = [];
//	mainContainer.loadOrder();
//	//	findByConditions();
//	// 阻止冒泡
//	if(e && e.stopPropagation) {
//		//因此它支持W3C的stopPropagation()方法
//		e.stopPropagation();
//	} else {
//		//否则，我们需要使用IE的方式来取消事件冒泡
//		window.event.cancelBubble = true;
//	}
//
//}
function emptyFilter(e, flag) {
	// 阻止冒泡
	if(e && e.stopPropagation) {
		//因此它支持W3C的stopPropagation()方法
		e.stopPropagation();
	} else {
		//否则，我们需要使用IE的方式来取消事件冒泡
		window.event.cancelBubble = true;
	}
	if(flag === 1) {
		$('#flightInput').val('');
		selectflights = [];
	} else if(flag === 2) {
		$('#carryInput').val('');
		selectCompany = ""

	} else {
		$('#searchInput').val('');
		conditions = '';
	}

	findByConditions();
}

// 筛选
function findByConditions() {
	$.ajax({
		type: "get",
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		url: Utils.url + "/order/getOrder_site?conditions=" + encodeURI(selectCompany, 'UTF-8') + "&orderId=" + conditions + "&flightIds=" + selectflights + "&userName=" + encodeURI(nameData.userName, 'UTF-8') +
			"&channelId=" + nameData.channelId + "&timestamp=" + new Date().getTime() + "&pageNum=" + mainContainer.pageNum + "&pageSize=" + mainContainer.pageSize + "&show=1",
		// dataType: "json",

		success: function(data) {
			$('.dialog-figure').hide()
			$('.dialog-figure-carry').hide()
			if(data.status == 200) {
				$('.el-loading-mask').hide()
				mainContainer.items = data.data.list.items;
				for(var i = 0; i < data.data.list.items.length; i++) {
					mainContainer.items[i].carryPerson = replaceZh(data.data.list.items[i].carryPerson)
				}
				mainContainer.list = data.data.list;
			} else {

			}
			//			fullOrder(data)
		}
	});
}

//登出
function loginOut() {

	var self = this;
	if(mainContainer.orderStatus == 'Y') {
		noticeModelFn($('.notice-model-screen'), '当前通道有正在安检的运单，请暂停/结束后再退出！', 2);
	} else {
		$.ajax({
			type: "get",
			url: Utils.url + "/shrio/logout?userId" + JSON.parse(sessionStorage.getItem('userData')).userId + "&timestamp=" + new Date().getTime(),
			async: true,
			beforeSend: function(request) {
				request.setRequestHeader("token", token);
			},
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

}
//
//function fullScreen() {
//	var el = document.documentElement;
//	var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
//	if(typeof rfs != "undefined" && rfs) {
//		rfs.call(el);
//	};
//	return;
//}

// function fullScreen()
//  {
// 
// 
//      var docElm = document.documentElement;
//      //W3C 
//      if (docElm.requestFullscreen) {
//          docElm.requestFullscreen();
//      }
//          //FireFox 
//      else if (docElm.mozRequestFullScreen) {
//          docElm.mozRequestFullScreen();
//      }
//          //Chrome等 
//      else if (docElm.webkitRequestFullScreen) {
//          docElm.webkitRequestFullScreen();
//      }
//          //IE11 
//      else if (docElm.msRequestFullscreen) {
//          docElm.msRequestFullscreen();
//      }
//  }

//获取光标位置
function getTxt1CursorPosition(name) {
	if($('#' + name).val().length == 0) {

	} else {
		isGetPosition = true;
		var oTxt1 = document.getElementById(name);

		cursurPosition = -1;
		if(oTxt1.selectionStart) { //非IE浏览器
			cursurPosition = oTxt1.selectionStart;
		} else { //IE
			var range = document.selection.createRange();
			range.moveStart("character", -oTxt1.value.length);
			cursurPosition = range.text.length;
		}
		console.log(cursurPosition);
	}

}

//function setCaretPosition(ctrl, pos){//设置光标位置函数
//	if(ctrl.setSelectionRange)
//	{
//		ctrl.focus();
//		ctrl.setSelectionRange(pos,pos);
//	}
//	else if (ctrl.createTextRange) {
//		var range = ctrl.createTextRange();
//		range.collapse(true);
//		range.moveEnd('character', pos);
//		range.moveStart('character', pos);
//		range.select();
//	}
//}
//设置光标位置
function setCaretPosition(obj, spos) {
	var tobj = document.getElementById(obj);
	if(spos < 0)
		spos = tobj.value.length;
	if(tobj.setSelectionRange) { //兼容火狐,谷歌
		setTimeout(function() {
			tobj.setSelectionRange(spos, spos);
			tobj.focus();
		}, 0);
	} else if(tobj.createTextRange) { //兼容IE
		var rng = tobj.createTextRange();
		rng.move('character', spos);
		rng.select();
	}
}

function noticeModelFn(con, text, num) {

	con.find('span').html(text);

	if(num == 1) {
		con.find('div').addClass('success-notice').removeClass('error-notice');
		con.fadeIn()
	} else if(num == 2) {
		con.find('div').addClass('error-notice').removeClass('success-notice');
		con.fadeIn()
	} else if(num == 3) {
		con.find('div').addClass('online-notice').removeClass('success-notice');
		con.fadeIn()
	}
	setTimeout(function() {
		con.fadeOut();
	}, 3000)
}

function searchMsgByOrder() {
	conditions = $('#searchInput').val()
	findByConditions()
}

function slotOrder(id) {
	var data = {
		code: id
	}
	$.ajax({
		type: "POST",
		url: Utils.url + "/order/showOrder?code=" + id + "&timestamp=" + new Date().getTime(),
		async: true,
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		//		data: JSON.stringify(data),
		contentType: 'application/json',
		success: function(result) {
			if(Number(result.status) == 200) {
				$('#code').val('')
				noticeModelFn($('.notice-model-screen'), '录入成功！', 1);
				mainContainer.loadOrder()
			} else {
				noticeModelFn($('.notice-model-screen'), result.msg+'！', 2);

			}
		}
	});
}

/*分页
 * pageCount:总页数
 * current：当前页码
 * */
function cutPage(pageCount, current) {
	$("#paging").CreatePage({
		pageCount: pageCount, //总页数
		current: current, //当前页码
		backFn: function(page) {
			mainContainer.pageNum = page;
			//			mainContainer.pageSize = page;
			mainContainer.loadOrder();
			// if(isSearch == true) {
			// 	mainContainer.findByConditions();
			// } else {
			// 	mainContainer.loadChannel();
			// }
			//page:点击时返回的点击的页码，拿到该页码过后执行翻页的逻辑操作
		}
	});
}