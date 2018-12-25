var isCheck;
var nameData;
var order;
var channelId;
var formCompany;
var creatTime = '';
var cursurPosition;
var isGetPosition = false;
var flag = null;
var isTrueOrder = true;
var orderDetilsEchoImg = [];
var formData = new FormData();
var idCardImgList = [] //身份证图片
var orderImgList = [] //运单图片
var isIdCardTake; //是否是身份证拍照
var token = sessionStorage.getItem('token');

$(function() {

	if(sessionStorage.getItem('userData') !== null) {
		nameData = JSON.parse(sessionStorage.getItem('userData'))
		//		console.log(sessionStorage.getItem('userName'))
		$('#userName').text(nameData.userName)
	}

	$('input[name="carryPeople"]').on('focus', function() {
		$(this).trigger('blur');
	});
	$('input[id="carryInput"]').on('focus', function() {
		$(this).trigger('blur');
	});

	connect();

})

var mainContainer = new Vue({
	el: "#mainContainer",
	data: {
		items: {},
		list: {},
		orderNo: "880-151544",
		flightNo: "MH15485",
		count: "45",
		carryPeople: "123",
		orderId: "123",
		id: "",
		endPlace: "北京",
		productName: "衣服",
		productWei: "80",
		idCardNo: "500234199802121145",
		outTime: "2018-10-10 12:10:54",
		inTime: "2018-10-10 12:10:54",
		isDanger: "",
		consignor: "",
		proxyPerson: "",
		proxyList: [],
		timeShow: false
	},
	methods: {
		loadOrder: function() {
			var self = this;
			$.ajax({
				type: "GET",
				url: Utils.url + "/order/getOrderById?id=" + self.id + '&timestamp=' + new Date().getTime(),
				contentType: "application/json;charset=UTF-8",
				dataType: 'json',
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				success: function(data) {
					if(data.status == 200) {
						$('.el-loading-mask').hide()
						self.items = data.data;
						formCompany = data.data.carryPerson
						self.items.startTime = Utils.getTimeByTimestamp(String(data.data.startTime))
						self.items.createTime = Utils.getTimeByTimestamp(String(data.data.createTime))
						self.items.lastPauseTime = Utils.getTimeByTimestamp(String(data.data.lastPauseTime))
						self.items.inboundTime = data.data.inboundTime === null ? '' : Utils.getTimeByTimestamp(String(data.data.inboundTime));
						self.items.outboundTime = data.data.outboundTime === null ? '' : Utils.getTimeByTimestamp(String(data.data.outboundTime));
						self.items.carryPerson = replaceZh(data.data.carryPerson)

						self.orderNo = self.items.orderId
						self.flightNo = self.items.flightId
						self.count = self.items.num
						self.carryPeople = data.data.carryPerson
						self.id = self.items.id
						order = self.orderNo

					} else {

					}
				}
			})
		},
		//		提交新增运单
		postOrder: function(data) {
			var self = this;

			$.ajax({
				type: "PUT",
				contentType: 'application/json',
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				//				processData: false,
				//				contentType: false,
				//				xhrFields: {
				//					withCredentials: true
				//				},
				url: Utils.url + "/order/editOrder" + '/' + self.id + '?timestamp=' + new Date().getTime(),
				// dataType: "json",
				data: JSON.stringify(data),
				success: function(data) {
					if(data.status == 200) {
						$('.addorder').hide()
						self.loadOrder()
					} else if(data.status == 400) {
						noticeModelFn($('.notice-model-screen'), data.msg + '！', 2);
					}
				}
			});

		},
		compareColor: function() {
			var self = this;
			switch(self.items.status) {
				case 0:
					return "defaultstyle";
					break
				case 2:
					return "playstyle";
					break
				case 3:
					return "stopstyle";
					break

			}

		},
		getProxyList: function() {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + '/proxy/getProxyList?' + new Date().getTime(),
				dataType: 'json',
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				//				data: data,
				success: function(result) {
					if(Number(result.status) == 200) {
						self.proxyList = result.data.list
						//						var html = [];
						//						if(!Utils.isEmptyObject(result.data.list)) {
						//							for(var i = 0; i < result.data.list.length; i++) {
						//								html.push('<li data-proxy="' + result.data.list[i].username + '" onclick="chooseProxy(this)">' + result.data.list[i].username + '</li>');
						//							}
						//						}
						//						$('.proxy').html(html.join(''));
					}
				},
				error: function(e) {}
			});
		},
		chooseProxy: function(data) {
			this.proxyPerson = data.username;
			//			$('#proxyPerson').val(data.username)
			$('.inTime').hide()
			$('#proxyPerson').parents('.select-down').find('span.error-hint-text').hide();
		}

	},
	mounted: function() {
		var self = this;
		if(sessionStorage.getItem('orderMsg') !== null) {
			order = JSON.parse(sessionStorage.getItem('orderMsg'))
			self.orderId = order.orderId;
			self.id = order.id;
			self.loadOrder();
			self.getProxyList()
			//		console.log(sessionStorage.getItem('userName'))
		} else {
			noticeModelFn($('.notice-model-screen'), '登陆信息过期，即将返回登陆页面重新登陆！', 2);
			setTimeout(function() {
				window.location = 'login.html';
			}, 3000);
			return
			//		console.log(sessionStorage.getItem('userName'))
		}

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
order = JSON.parse(sessionStorage.getItem('orderMsg')).orderId;
channelId = JSON.parse(sessionStorage.getItem('userData')).channelId;
//var orderNo =  JSON.parse(sessionStorage.getItem('userData')).orderId;
var socket;
//websock协议
function connect() {
	socket = new SockJS(Utils.url + '/endpointWisely'); //1连接SockJS的endpoint是“endpointWisely”，与后台代码中注册的endpoint要一样。
	stompClient = Stomp.over(socket); //2创建STOMP协议的webSocket客户端。
	stompClient.connect({}, function(frame) { //3连接webSocket的服务端。
		stompClient.subscribe('/user/' + userId + '/msg', function(respnose) {

		});
		stompClient.subscribe('/user/' + userId1 + '/msg', function(respnose) {
			//			appendOrder(JSON.parse(respnose.body));
			if(JSON.parse(respnose.body).code == 'START') {

				if(JSON.parse(respnose.body).data.orderId == order) {
					if(JSON.parse(respnose.body).data.channelId !== channelId) {
						noticeModelFn($('.notice-model-screen'), '该运单已经在通道' + JSON.parse(respnose.body).data.channelId + '号开始安检，即将跳转到首页', 2);
						setTimeout(function() {
							window.location.href = "touchScreen_.html"
						}, 2000)

					}
				}
			}
			if(JSON.parse(respnose.body).code == 'UPDATE' || JSON.parse(respnose.body).code == 'PAUSE') {
				mainContainer.loadOrder()
			}
			if(JSON.parse(respnose.body).code == 'DELETE') {
				if(JSON.parse(respnose.body).data.orderId == order) {
					if(JSON.parse(respnose.body).data.channelId !== channelId) {
						noticeModelFn($('.notice-model-screen'), "该运单已经被删除，即将跳转到首页！", 2);
						setTimeout(function() {
							window.location.href = "touchScreen_.html"
						}, 3000)

					}
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

}

//打开编辑运单弹框
function addorder() {
	$('.addorder').show()
	mainContainer.orderNo = mainContainer.items.orderId;
	mainContainer.flightNo = mainContainer.items.flightId;
	mainContainer.productWei = mainContainer.items.weight;
	mainContainer.productName = mainContainer.items.cargoName;
	mainContainer.count = mainContainer.items.num;
	mainContainer.endPlace = mainContainer.items.flightTerminal;
	mainContainer.carryPeople = mainContainer.items.carryPerson;
	mainContainer.consignor = mainContainer.items.consignor;
	mainContainer.idCardNo = mainContainer.items.proxyIcno;
	mainContainer.isDanger = mainContainer.items.dangerous === 0 ? '否' : '是';
	mainContainer.inTime = mainContainer.items.inboundTime;
	mainContainer.outTime = mainContainer.items.outboundTime;
	mainContainer.proxyPerson = mainContainer.items.proxyName;

	if(mainContainer.items.dangerous == 1) {

		mainContainer.timeShow = true;
	} else {
		mainContainer.timeShow = false;
	}

	$('ul.echo-img').find('li').remove();
	$('div.z_photo').find('section.up-section').remove();

	var html = [];
	for(var i = 0; i < mainContainer.items.icPhotos.length; i++) {
		html.push('<li>');
		html.push('<img src="../../lib/img/imgclose.png" class="close-img" onclick="closeImg(this)">');
		html.push('<img src="' + mainContainer.items.icPhotos[i] + '" class="image"  onclick="showDetailsImg(this)"> ');
		html.push('</li>');
	}
	$('ul#idFace').append(html.join(''));

	var html2 = [];
	for(var i = 0; i < mainContainer.items.trackingPhotos.length; i++) {
		html2.push('<li>');
		html2.push('<img src="../../lib/img/imgclose.png" class="close-img" onclick="closeImg(this)">');
		html2.push('<img src="' + mainContainer.items.trackingPhotos[i] + '" class="image"  onclick="showDetailsImg(this)"> ');
		html2.push('</li>');
	}
	$('ul#orderPaper').append(html2.join(''));

//	if(mainContainer.items.channelId === null) {
		//		addOrderDiag.isBeginOrder = false;
//		beginread_onclick()

//	} else {
		$('.close-img').hide()
//		endread_onclick()
		//		addOrderDiag.isBeginOrder = true;

//	}

	//	formCompany= mainContainer.items.carryPerson;

}

function deleteTime(e, flag) {
	$(e).siblings('input').val('')

	//	$('#time').val('');
	$(e).siblings('.time-span').show()
	$(e).siblings('.time-span').text('请选择时间')
	creatTime = '';
	if(flag === 1) {
		mainContainer.inTime = '';
	} else {
		mainContainer.outTime = '';
	}
	//	getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);
}

//删除运单
function deleteOrder() {
	var data = {
		"id": mainContainer.id,
		"orderId": mainContainer.orderNo,
	}
	$.ajax({
		type: 'post',
		contentType: 'application/json',
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		url: Utils.url + '/order/deleteOrder',
		data: JSON.stringify(data),
		success: function(result) {
			if(Number(result.status) == 200) {
				window.location.href = "touchScreen_.html"
			} else {

			}
		},
		error: function(e) {}
	})
}

// 开始安检
function checkSecurity() {
	var self = this;
	var data = {
		orderId: mainContainer.orderId
	}
	$.ajax({
		type: "POST",
		url: Utils.url + "/order/startCheck" + '?timestamp=' + new Date().getTime() + '&channelId=' + nameData.channelId,
		data: JSON.stringify(data),
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: "application/json;charset=UTF-8",
		xhrFields: {
			withCredentials: true
		},
		// dataType: "json",
		success: function(data) {
			if(data.status == 200) {

				mainContainer.loadOrder();
				//				findByConditions()
			} else if(data.status === 400) {
				$('.dialog-figure-go').show()

			}

		}
	})
}

// 暂停安检
function stopSeurity() {
	var self = this;
	var data = {
		orderId: mainContainer.orderId
	}
	$.ajax({
		type: "POST",
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		url: Utils.url + "/order/pauseCheck" + '?timestamp=' + new Date().getTime(),
		data: JSON.stringify(data),
		contentType: "application/json;charset=UTF-8",
		// dataType: "json",
		success: function(data) {
			if(data.status == 200) {

				mainContainer.loadOrder();
				//				findByConditions()
			} else {

			}

		}
	})
}

//结束安检
function endSecurity() {
	var data = {
		orderId: mainContainer.orderId
	}
	$.ajax({
		type: "POST",
		url: Utils.url + "/order/endCheck" + '?timestamp=' + new Date().getTime() + '&channelId=' + nameData.channelId,
		data: JSON.stringify(data),
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: "application/json;charset=UTF-8",
		// dataType: "json",
		success: function(data) {
			if(data.status == 200) {
				$('.dialog-figure-alert').hide()
				window.location.href = "touchScreen_.html"
				//				mainContainer.loadOrder();
				//				findByConditions()
			} else if(data.status == 400) {
				$('.dialog-figure-alert').hide()
				noticeModelFn($('.notice-model-screen'), '当前运单还有未开包的货物，不能结束！', 2);
			}

		}
	})

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

}

//关闭承运人弹框
function closeCarrySelect() {
	$('.dialog-figure-carry').hide();
	selectCompany = '';
	$(document).removeClass('flight-active')
}

//确认筛选承运人
function affirmCompany() {
	$('.dialog-figure-carry').hide()
	mainContainer.carryPeople = replaceZh(selectCompany)
}

//验证中文
function replaceZh(val) {
	var regZh = /[^\u4E00-\u9FA5]/g //中文
	var value = val.replace(regZh, '')
	return value;
}


//承运人选择框
function showCompany() {
	$('.dialog-figure-carry').show()
	$('#key').hide()
	$('.closekey').hide()
	$('#keycontent').html('')
	selectCompany = "";
	var condition = "";
	$.ajax({
		type: "POST",
		url: Utils.url + "/order/findCarryPersonBycondition?condition=" + condition + '&timestamp=' + new Date().getTime(),
		// dataType: "json",
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
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

//返回运单列表页面
function returnBack() {
	window.location.href = "touchScreen_.html"
}

//断开连接
function disconnect() {
	if(stompClient != null) {
		stompClient.disconnect();
	}
	//console.log("Disconnected");
}

//规范时间
function compareTime(val) {
	if(val < 10) {
		return "0" + val;
	} else {
		return val;
	}
}

//取消运单
function cancelOrder() {
	$('.addorder').hide()
	$('.add-input').css('border-color', '')
	$('#key').hide();
	$('#keycontent').html('')
	$(document).find('span.error-hinttext').hide();
	isAdd = false;
	mainContainer.orderNo = "";
	mainContainer.flightno = "";
	mainContainer.count = "";
	mainContainer.carryPeople = "";
	$('#orderno').val("")
	$('#flightno').val("")
	$('#count').val("")
	$('#carrier').val("")
}

//显示新增
function addOrder() {

	$('.addorder').show()
	//清除缓存的图片

}

function chooseDanger(flag) {
	if(flag === 0) {
		//		$('#isDanger').val('否')
		mainContainer.isDanger = '否'
		mainContainer.timeShow = false;
		//		$('.Time').hide()
	} else {
		mainContainer.isDanger = '是'
		mainContainer.timeShow = true;
		//时间选择器
		laydate.render({
			elem: '#inTime',
			theme: '#4e97d9',
			type: 'datetime',
			eventElem: '.inTime-div .time-span',
			done: function(value, date, endDate) {
				creatTime = value;
				$('.inTime-div .time-span').text('')
				//				getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);
			}
		});

		laydate.render({
			elem: '#outTime',
			theme: '#4e97d9',
			type: 'datetime',
			eventElem: '.outTime-div .time-span',
			done: function(value, date, endDate) {
				creatTime = value;
				$('.outTime-div .time-span').text('')
				//				getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);
			}
		});
		//		$('#isDanger').val('是')
		//		$('.Time').show()
		//		$('#outTime').val('')
		//		$('#intTime').val('');
		mainContainer.outTime = '';
		mainContainer.inTime = '';

	}
	$('#isDanger').parents('.select-down').find('span.error-hint-text').hide();

}

//关闭承运人
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

//判断样式
function verifyFrom(e) {
	if($(e).next().css('display') == 'none') {

	} else {
		$(e).parent().find('span.error-hint-text').hide();
		$(e).removeClass('error')
//		$(e).css('border-color', '#dcdfe6');
	}

}

//提交验证
function postOrder() {
	$('#key').hide();
	$('#keycontent').html('')

	var reg = /^\s+|\s+$/g //空
	var regnum = /[^0-9]/g //数字
	var regNumAnd = /[^0-9-]/g //数字和-
	//	var regNumAndEng = /[^0-9A-Za-z]/g //大小写数字
	var regZh = /[\u4E00-\u9FA5]/g //中文
	var regOrder = /^\d{3}-\d{8}$/; //运单号验证  
	var regflight = /^(?!\d+$)[\da-zA-Z]*$/
	var regFloatNum = /^([1-9]\d{1})$|^(0|[1-9]\d{1,2})$&([1-9]\d{1})$|^(0|[1-9]\d{1,2})\.(\d{1,2})$/
	
	

	var orderno = $('#orderno').val();
	if($('#orderno').val().length <= 0 || reg.test($('#orderno').val())) {
		$('#orderno').parent().find('span.error-hint-text').text('请输入运单号！')
		$('#orderno').parent().find('span.error-hint-text').show();
		$('#orderno').addClass('error');
		return;
	} else {
		if($('#orderno').val().indexOf('-') < 0 || $('#orderno').val().length < 12 || $('#orderno').val().length > 12 || !regOrder.test(orderno)) {
			$('#orderno').parent().find('span.error-hint-text').text('请输入正确的运单号！')
			$('#orderno').parent().find('span.error-hint-text').show();
			$('#orderno').addClass('error');
			return;
		}
	}

	var flightno = $('#flightno').val();
	if(regflight.test(flightno) == false || reg.test(flightno) || flightno.length <= 0) {
		//		$('#flightNO').val("")
		$('#flightno').parent().find('span.error-hint-text').show();
		if(flightno.length <= 0) {
			$('#flightno').parent().find('span.error-hint-text').text('请输入航班号')
		} else {
			$('#flightno').parent().find('span.error-hint-text').text('请输入正确的航班号')
		}
		$('#flightno').css('border-color', '#f56c6c');
		return;
	}

	var productName = $('#productName').val();
	if(regZh.test(productName) == false || reg.test(productName) || productName.length <= 0) {
		//		$('#productName').val("")
		$('#productName').parent().find('span.error-hint-text').show();
		if(productName.length <= 0) {
			$('#productName').parent().find('span.error-hint-text').text('请输入货物名称')
		} else {
			$('#productName').parent().find('span.error-hint-text').text('请输入正确的货物名称')
		}

		$('#productName').addClass('error');
		return;
	}

	var productWei = $('#productWei').val();
	if(productWei.length <= 0) {
		$('#productWei').parent().find('span.error-hint-text').show();
		$('#productWei').addClass('error');
		return;
	}

	var count = $('#count').val();
	if(count.length <= 0) {
		$('#count').parent().find('span.error-hint-text').show();
		$('#count').addClass('error');
		return;
	} else {
		if(count.indexOf('0') > 0) {

		} else {
			$('#count').parent().find('span.error-hint-text').show();
			$('#count').parent().find('span.error-hint-text').text('输入不规范，请重新输入正确的件数')
			$('#count').addClass('error');
			return;
		}

	}

	var endPlace = $('#endPlace').val();
	if(regZh.test(endPlace) == false || reg.test(endPlace) || endPlace.length <= 0) {
		//		$('#endPlace').val("")
		$('#endPlace').parent().find('span.error-hint-text').show();
		if(endPlace.length <= 0) {
			$('#endPlace').parent().find('span.error-hint-text').text('请输入目的地')
		} else {
			$('#endPlace').parent().find('span.error-hint-text').text('请输入正确的目的地')
		}

		$('#endPlace').addClass('error');
		return;
	}

	var carrier = $('#carrier').val();
	if(carrier.length <= 0) {
		$('#carrier').parent().find('span.error-hint-text').show();
		$('#carrier').addClass('error');
		return;
	}

	var proxyPerson = $('#proxyPerson').val();
	if(proxyPerson.length === 0) {
		$('#proxyPerson').parents('.select-down').find('span.error-hint-text').show();
		$('#proxyPerson').addClass('error');
		return;
	}

	var consignor = $('#consignor').val();
	if(reg.test(consignor) || consignor.length == 0) {

		$('#consignor').parent().find('span.error-hint-text').show();
		if(consignor.length == 0) {
			$('#consignor').parent().find('span.error-hint-text').text('请输入托运人')
		} else {
			$('#consignor').parent().find('span.error-hint-text').text('请输入正确的托运人')
		}

		$('#consignor').addClass('error');
		//		return;
	}

	var idCardNo = $('#idCardNo').val();
	if(idCardNo.length === 0) {
		$('#idCardNo').parent().find('span.error-hint-text').show();
		$('#idCardNo').addClass('error');
		return;
	}

	var isDanger = $('#isDanger').val();
	if(isDanger.length === 0) {
		$('#isDanger').parents('.select-down').find('span.error-hint-text').show();
		$('#isDanger').addClass('error');
		return;
	}

	if(isDanger === '是') {
		var inTime = $('#inTime').val();
		if(inTime.length <= 0) {
			$('#inTime').parent('.inTime-div').next().show();
			$('#inTime').addClass('error');
			return;
		}

		var outTime = $('#outTime').val();
		if(outTime.length <= 0) {
			$('#outTime').parent('.outTime-div').next().show();
			$('#outTime').addClass('error');
			return;
		}
	}

	var idCardLen = $('#idFace li').length;
	for(var i = 1; i < idCardLen + 1; i++) {
		idCardImgList.push($('#idFace li:nth-child(' + i + ')').children('.image').attr('src'))
		//		idCardImgList.push(dataURItoBlob($('#idcard li:nth-child(' + i + ')').children('.image').attr('src')))
	}
	if(idCardLen === 0) {
		$('#idFace').parent().find('span.error-hint-text').show();
		return;
	}
	var idList = [];
	for(var i = 0; i < idCardImgList.length; i++) {
		idList.push(idCardImgList[i]);
	}

	var orderPaperLen = $('#orderPaper li').length;
	var orderList = [];
	for(var i = 1; i < orderPaperLen + 1; i++) {
		orderImgList.push($('#orderPaper li:nth-child(' + i + ')').children('.image').attr('src'))
	}
	if(orderPaperLen === 0) {
		$('#orderPaper').parent().find('span.error-hint-text').show();
		return;
	}
	var orderList = [];
	for(var i = 0; i < orderImgList.length; i++) {
		orderList.push(orderImgList[i]);
	}

	var data = {
		//			id: editOrderId,
		cargoName: productName,
		carryPerson: formCompany,
		flightId: flightno,
		proxyIcno: idCardNo,
		consignor: consignor,
		orderId: orderno,
		dangerous: isDanger === '是' ? 1 : 0,
		num: count,
		proxyName: proxyPerson,
		flightTerminal: endPlace,
		inboundTime: inTime,
		outboundTime: outTime,
		icPhotos: idList,
		trackingPhotos: orderList,
		weight: productWei
	}

	mainContainer.postOrder(data)
}

//阻止冒泡
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

	mainContainer.loadOrder();
}

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
	}

}

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

//关闭拍照弹框

function closeDiag(flag) {
	if(flag === 1) {
		$('.photo').hide();
		CloseVideo()
//		Unload()
	} else {
		$('.face-photo').hide()
		$('#webcam').html('')

	}
}

function TakePhoto() {
	webcam.capture();
	$('.face-photo').hide();
	$('#webcam').html('');
	base64toUrl(photo)
	//	showPhoto(photo);
}

function base64toUrl(data) {
	var formDataImg = new FormData()
	formDataImg.append('file', dataURItoBlob(data))

	$.ajax({
		type: 'POST',
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		url: Utils.url + '/common/upload?filePath=order' + '&timestamp=' + new Date().getTime(),
		//		headers: {
		//			'Content-Type': 'application/json; charset=UTF-8'
		//		},
		processData: false,
		contentType: false,
		xhrFields: {
			withCredentials: true
		},
		data: formDataImg,
		success: function(result) {
			showPhoto(result.data);
		},
		error: function(e) {}
	})
}

function cameraTake() {
	var canvas = document.getElementById("canvas");
	var pos = 0,
		ctx = null,
		image = [];
	jQuery("#webcam").webcam({
		width: 320,
		height: 240,
		mode: "callback",
		swffile: "../../lib/js/jscam_canvas_only.swf", // 这里引入swf文件，注意路径
		onTick: function(remain) {},
		onSave: function(data) {
			var col = data.split(";");
			var img = image;
			for(var i = 0; i < 320; i++) {
				var tmp = parseInt(col[i]);
				img.data[pos + 0] = (tmp >> 16) & 0xff;
				img.data[pos + 1] = (tmp >> 8) & 0xff;
				img.data[pos + 2] = tmp & 0xff;
				img.data[pos + 3] = 0xff;
				pos += 4;
			}
			if(pos >= 4 * 320 * 240) {
				// 将图片显示到canvas中
				ctx.putImageData(img, 0, 0);
				// 取得图片的base64码  AirportInternational
				var base64 = canvas.toDataURL("image/png");
				photo = base64;
				isOpen = true;
				// 将图片base64码设置给img
				//var base64image = document.getElementById('base64image');
				//    base64image.setAttribute('src', base64);
				pos = 0;
			}
		},

		onCapture: function() {
			webcam.save();
		},

		debug: function(type, string) {},
		onLoad: function() {}

	});
	var canvas = document.getElementById("canvas");
	if(canvas.getContext) {
		ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, 320, 240);
		var img = new Image();
		img.onload = function() {
			ctx.drawImage(img, 320, 240);
		}
		image = ctx.getImageData(0, 0, 320, 240);
	}

}

//      拍照弹框
function openTakePhoto(flag) {
	if(flag === 1) {
		isIdCardTake = true;
//		$('.face-photo').show()
//		cameraTake();
		$('#idFace').parent().find('span.error-hint-text').hide();
	} else {
		isIdCardTake = false;
		$('#orderPaper').parent().find('span.error-hint-text').hide();
//		$('.photo').show();
//		setTimeout(function() {
//			Load();
//		}, 200)
	}

	isOpen = true;

}

//填充拍照内容
function showPhoto(data) {
	var html = [];
	if(isIdCardTake === true) {
		html.push('<li>');
		html.push('<img src="../../lib/img/imgclose.png" class="close-img" onclick="closeImg(this)">');
		html.push('<img src="' + data + '" class="image"  onclick="showDetailsImg(this)"> ');
		html.push('</li>');
		$('ul#idFace').append(html.join(''));
		if($('ul#idFace li').length == 6) {
			$('div.z_photo').find('section').css("display", "none");
		}
	} else {
		html.push('<li>');
		html.push('<img src="../../lib/img/imgclose.png" class="close-img" onclick="closeImg(this)">');
		html.push('<img src="' + data + '" class="image"  onclick="showDetailsImg(this)"> ');
		html.push('</li>');
		$('ul#orderPaper').append(html.join(''));
		if($('ul#orderPaper li').length == 6) {
			$('div.z_photo').find('section').css("display", "none");
		}
	}

}

//预览拍照图片
function showDetailsImg(e) {
	// console.log('1111')
	$('.img-preview').show();
	$('#imgPreview').attr('src', $(e).attr('src'));
}

//删除拍了的图片
function closeImg(e) {
	//  $('div.z_photo').find('section').css("display", "inline-block");
	//	$(e).parent('li').remove()
}

//删除数据回显的时候的图片
function closeImg(e, index) {
	$(e).parent().remove();
	$('div.z_photo').find('section').css("display", "block");
	//	console.log($(e).next().attr("data-id"));
	formData.append("ids", $(e).next().attr("data-id"));
	orderDetilsEchoImg.splice(index, 1);
}

function dataURItoBlob(base64Data) {
	var format = "image/jpeg";
	var base64 = base64Data;
	var code = window.atob(base64.split(",")[1]);
	var aBuffer = new window.ArrayBuffer(code.length);
	var uBuffer = new window.Uint8Array(aBuffer);
	for(var i = 0; i < code.length; i++) {
		uBuffer[i] = code.charCodeAt(i) & 0xff;
	}
	var blob = null;
	try {
		blob = new Blob([uBuffer], {
			type: format
		});
	} catch(e) {
		window.BlobBuilder = window.BlobBuilder ||
			window.WebKitBlobBuilder ||
			window.MozBlobBuilder ||
			window.MSBlobBuilder;
		if(e.name == 'TypeError' && window.BlobBuilder) {
			var bb = new window.BlobBuilder();
			bb.append(uBuffer.buffer);
			blob = bb.getBlob("image/jpeg");
		} else if(e.name == "InvalidStateError") {
			blob = new Blob([aBuffer], {
				type: format
			});
		} else {}
	}
	return blob;

};

var DeviceMain; //主头
var DeviceAssist; //副头
var VideoMain; //主头
var VideoAssist; //副头
var videoCapMain;
var videoCapAssist;

var PicPath;
var initFaceDetectSuccess;
var readIDcard = false;

function plugin() {
	return document.getElementById('view1');
}

function MainView() {
	return document.getElementById('view1');
}

function addEvent(obj, name, func) {
	if(obj.attachEvent) {
		obj.attachEvent("on" + name, func);
	} else {
		obj.addEventListener(name, func, false);
	}
}

function OpenVideo() {

	OpenVideoMain();

}

function CloseVideo() {
	CloseVideoMain();

}

function CloseVideoMain() {
	if(VideoMain) {
		plugin().Video_Release(VideoMain);
		VideoMain = null;

		MainView().View_SetText("", 0);
	}
}

function OpenVideoMain() {
	CloseVideoMain();

	if(!DeviceMain)
		return;

	var SelectType = 0;
	var txt;

	var nResolution = 0;
	SelectType = 1;

	VideoMain = plugin().Device_CreateVideo(DeviceMain, nResolution, SelectType);
	if(VideoMain) {
		MainView().View_SelectVideo(VideoMain);
		MainView().View_SetText("打开视频中，请等待...", 0);

	}
}

function Load() {
	//设备接入和丢失
	//type设备类型， 1 表示视频设备， 2 表示音频设备
	//idx设备索引
	//dbt 1 表示设备到达， 2 表示设备丢失
	addEvent(plugin(), 'DevChange', function(type, idx, dbt) {
		if(1 == type) //视频设备
		{
			if(1 == dbt) //设备到达
			{
				var deviceType = plugin().Global_GetEloamType(1, idx);
				if(1 == deviceType) //主摄像头
				{
					if(null == DeviceMain) {
						DeviceMain = plugin().Global_CreateDevice(1, idx);
						if(DeviceMain) {

							var subType = plugin().Device_GetSubtype(DeviceMain);

							OpenVideoMain();
						}
					}
				} else if(2 == deviceType || 3 == deviceType) //辅摄像头
				{
					if(null == DeviceAssist) {
						DeviceAssist = plugin().Global_CreateDevice(1, idx);
						if(DeviceAssist) {

							sSubType.options.length = 0;
							var subType = plugin().Device_GetSubtype(DeviceAssist);
							if(subType & 1) {
								sSubType.add(new Option("YUY2"));
							}
							if(subType & 2) {
								sSubType.add(new Option("MJPG"));
							}
							if(subType & 4) {
								sSubType.add(new Option("UYVY"));
							}
							if((0 != (subType & 2)) && (0 != (subType & 1))) //辅摄像头优先采用mjpg模式打开 
							{
								sSubType.selectedIndex = 1;
							} else {
								sSubType.selectedIndex = 0;
							}
							initFaceDetectSuccess = plugin().InitFaceDetect();

							OpenVideoAssist();
						}
					}
				}
			} else if(2 == dbt) //设备丢失
			{
				if(DeviceMain) {
					if(plugin().Device_GetIndex(DeviceMain) == idx) {
						CloseVideoMain();
						plugin().Device_Release(DeviceMain);
						DeviceMain = null;

						document.getElementById('subType1').options.length = 0;

					}
				}

				if(DeviceAssist) {
					if(plugin().Device_GetIndex(DeviceAssist) == idx) {
						CloseVideoAssist();
						plugin().Device_Release(DeviceAssist);
						DeviceAssist = null;
					}
				}
			}
		}
	});

	addEvent(plugin(), 'Ocr', function(flag, ret) {
		if(1 == flag && 0 == ret) {
			var ret = plugin().Global_GetOcrPlainText(0);
			alert(ret);
		}
	});

	addEvent(plugin(), 'IdCard', function(ret) {
		if(1 == ret) {
			var str = GetTimeString() + "：";

			for(var i = 0; i < 16; i++) {
				str += plugin().Global_GetIdCardData(i + 1);
				str += ";";
			}

			document.getElementById("idcard").value = str;

			var image = plugin().Global_GetIdCardImage(1); //1表示头像， 2表示正面， 3表示反面 ...
			plugin().Image_Save(image, "C:\\idcard.jpg", 0);
			plugin().Image_Release(image);

			document.getElementById("idcardimg").src = "C:\\idcard.jpg";
		}
	});

	addEvent(plugin(), 'Biokey', function(ret) {
		if(4 == ret) {
			// 采集模板成功
			var mem = plugin().Global_GetBiokeyTemplateData();
			if(mem) {
				if(plugin().Memory_Save(mem, "C:\\1.tmp")) {
					document.getElementById("biokey").value = "获取模板成功，存储路径为C:\\1.tmp";
				}
				plugin().Memory_Release(mem);
			}

			var img = plugin().Global_GetBiokeyImage();
			plugin().Image_Save(img, "C:\\BiokeyImg1.jpg", 0);
			plugin().Image_Release(img);

			document.getElementById("BiokeyImg1").src = "C:\\BiokeyImg1.jpg";
			alert("获取指纹模板成功");
		} else if(8 == ret) {
			var mem = plugin().Global_GetBiokeyFeatureData();
			if(mem) {
				if(plugin().Memory_Save(mem, "C:\\2.tmp")) {
					document.getElementById("biokey").value = "获取特征成功，存储路径为C:\\2.tmp";
				}
				plugin().Memory_Release(mem);
			}

			var img = plugin().Global_GetBiokeyImage();
			plugin().Image_Save(img, "C:\\BiokeyImg2.jpg", 0);
			plugin().Image_Release(img);

			document.getElementById("BiokeyImg2").src = "C:\\BiokeyImg2.jpg";
			alert("获取指纹特征成功");
		} else if(9 == ret) {
			document.getElementById("biokey").value += "\r\n刷的不错！";
		} else if(10 == ret) {
			document.getElementById("biokey").value += "\r\n图像质量太差！";
		} else if(11 == ret) {
			document.getElementById("biokey").value += "\r\n图像点数太少！";
		} else if(12 == ret) {
			document.getElementById("biokey").value += "\r\n太快！";
		} else if(13 == ret) {
			document.getElementById("biokey").value += "\r\n太慢！";
		} else if(14 == ret) {
			document.getElementById("biokey").value += "\r\n其它质量问题！";
		}
	});

	addEvent(plugin(), 'Reader', function(type, subtype) {
		var str = "";
		if(4 == type) {
			if(0 == subtype) //接触式CPU卡
			{
				str += "[接触式CPU卡][银行卡号]:";
				str += plugin().Global_ReaderGetCpuCreditCardNumber();
			} else if(1 == subtype) //非接触式CPU卡
			{
				str += "[非接触式CPU卡] :";
				str += "[Id]:";
				str += plugin().Global_ReaderGetCpuId();
				str += "[银行卡号]:";
				str += plugin().Global_ReaderGetCpuCreditCardNumber();

				str += "[磁道数据]:";
				str += plugin().Global_CpuGetBankCardTrack(); //磁道数据

				str += "[交易记录]:";
				var n = plugin().Global_CpuGetRecordNumber(); //交易条数
				for(var i = 0; i < n; i++) {
					str += plugin().Global_CpuGetankCardRecord(i);
					str + ";";
				}
			}
		} else if(2 == type) {
			str += "[M1卡] Id:";
			str += plugin().Global_ReaderGetM1Id();
		} else if(3 == type) {
			str += "[Memory卡] Id:";
			str += plugin().Global_ReaderGetMemoryId();
		} else if(5 == type) {
			str += "[社保卡] :";
			str += plugin().Global_ReaderGetSocialData(1);
			str += plugin().Global_ReaderGetSocialData(2);
		}
		document.getElementById("reader").value = str;
	});

	addEvent(plugin(), 'Mag', function(ret) {
		var str = "";

		str += "[磁卡卡号] ";
		str += plugin().Global_MagneticCardGetNumber();

		str += "[磁道数据]";

		str += "磁道1:";
		str += plugin().Global_MagneticCardGetData(0);
		str += "磁道2:";
		str += plugin().Global_MagneticCardGetData(1);
		str += "磁道3:";
		str += plugin().Global_MagneticCardGetData(2);

		document.getElementById("mag").value = str;
	});

	addEvent(plugin(), 'ShenZhenTong', function(ret) {
		var str = "";

		str += "[深圳通卡号] ";
		str += plugin().Global_GetShenZhenTongNumber();

		str += "[金额:] ";
		str += plugin().Global_GetShenZhenTongAmount();

		str += "[交易记录:]";

		var n = plugin().Global_GetShenZhenTongCardRecordNumber();
		for(var i = 0; i < n; i++) {
			str += plugin().Global_GetShenZhenTongCardRecord(i);
			str += ";";
		}
		document.getElementById("shenzhentong").value = str;
	});

	addEvent(plugin(), 'MoveDetec', function(video, id) {
		// 自动拍照事件	
	});

	addEvent(plugin(), 'Deskew', function(video, view, list) {
		// 纠偏回调事件
		var count = plugin().RegionList_GetCount(list);
		for(var i = 0; i < count; ++i) {
			var region = plugin().RegionList_GetRegion(list, i);

			var x1 = plugin().Region_GetX1(region);
			var y1 = plugin().Region_GetY1(region);

			var width = plugin().Region_GetWidth(region);
			var height = plugin().Region_GetHeight(region);

			plugin().Region_Release(region);
		}

		plugin().RegionList_Release(list);
	});

	//	var title = document.title;
	//	document.title = title + plugin().version;

	MainView().Global_SetWindowName("view");

	//			        thumb1().Global_SetWindowName("thumb");

	var ret;
	ret = plugin().Global_InitDevs();
	if(ret) {
		//进行人脸识别初始化时，视频应处于关闭状态
		plugin().InitFaceDetect();
	}

	if(!plugin().Global_VideoCapInit()) {
		alert("初始化失败！");
	}
}

function Unload() {
	if(VideoMain) {
		MainView().View_SetText("", 0);
		plugin().Video_Release(VideoMain);
		VideoMain = null;
	}
	if(DeviceMain) {
		plugin().Device_Release(DeviceMain);
		DeviceMain = null;
	}

	if(DeviceAssist) {
		plugin().Device_Release(DeviceAssist);
		DeviceAssist = null;
	}

	plugin().Global_DeinitDevs();

	//进行人脸识别反初始化时，视频应处于关闭状态
	plugin().DeinitFaceDetect();
}

function GetTimeString() {
	var date = new Date();
	var yy = date.getFullYear().toString();
	var mm = (date.getMonth() + 1).toString();
	var dd = date.getDate().toString();
	var hh = date.getHours().toString();
	var nn = date.getMinutes().toString();
	var ss = date.getSeconds().toString();
	var mi = date.getMilliseconds().toString();

	var ret = yy + mm + dd + hh + nn + ss + mi;
	return ret;
}

//拍照
function Scan() {
	if(VideoMain) {
		var imgList = plugin().Video_CreateImageList(VideoMain, 0, 0);
		var img = plugin().Video_CreateImage(VideoMain, 0, 0);
		var Name = GetTimeString() + ".jpg";
		photo = 'data:image/jpeg;base64,' + plugin().Image_GetBase64(img, 2, 0)
		MainView().View_PlayCaptureEffect();
		plugin().Image_Release(img);

	}
	$('.photo').hide();
	CloseVideo()
	base64toUrl(photo)
	//	showPhoto(photo);

}

function RGB(r, g, b) {
	return r | g << 8 | b << 16;
}

//预览拍照图片
function showDetailsImg(e) {
	// console.log('1111')
	$('.img-preview').show();
	$('#imgPreview').attr('src', $(e).attr('src'));
}

//身份证读卡
function beginread_onclick() {
	var pp
	pp = rdcard.ReadCard2();
	//	if(pp == 0) {
	//		document.getElementsByName("tResult")[0].value = "ReadCard2�ɹ�";
	//
	//	} else {
	//		document.getElementsByName("tResult")[0].value = "ReadCard2ʧ��: " + pp;
	//	}
}

function endread_onclick() {
	var pp
	pp = rdcard.endread();
	//	if(pp == 0) {
	//		document.getElementsByName("tResult")[0].value = "endread�ɹ�";
	//	} else {
	//		document.getElementsByName("tResult")[0].value = "endreadʧ��: " + pp;
	//	}
}

function getinfo_onclick() {
	document.getElementsByName("idCardNo")[0].value = rdcard.CardNo;
	document.getElementsByName("consignor")[0].value = rdcard.NameS;
	mainContainer.consignor = rdcard.NameS;
	mainContainer.idCardNo = rdcard.CardNo;

}