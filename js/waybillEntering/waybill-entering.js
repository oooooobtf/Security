var pageNum = 1;
var pageSize = 15;
var creatTime = ''; //创建的的时间
var channelId = ''; //通道号
var conditions = ''; //输入的条件
var isAddOrder = false; //是否是添加订单
var isBeginOrder = false;
var deletetId;
var deleteOrderId;
var editOrderId;
//var allOrderData = [];
var orderDetilsEchoImg = []; //订单图片回显的数据
var isOpen; //打开了拍照弹框
var photo;
var isTrueCarry;
var formData = new FormData();
var userId;
var carryCompany;
var idCardImgList = [] //身份证图片
var orderImgList = [] //运单图片
var isIdCardTake; //是否是身份证拍照
var el;
//拍摄参数
var pos = 0;
var ctx = null;
var cam = null;
var saveCB;
var image = [];
var token = sessionStorage.getItem('token')

$(function() {
	if(sessionStorage.getItem('userData') !== undefined || JSON.parse(sessionStorage.getItem('userData') !== null)) {
		userId = JSON.parse(sessionStorage.getItem('userData')).userId
	} else {
		//		noticeModelFn($('.notice-model-screen'), '登陆信息过期，即将返回登陆页面重新登陆！', 2);
		//		setTimeout(function() {
		//			window.location = 'login.html';
		//		}, 3000);
		//		return

	}

	//时间选择器
	laydate.render({
		elem: '#time',
		theme: '#4e97d9',
		eventElem: '.time-span',
		done: function(value, date, endDate) {
			creatTime = value;
			$('.time-span').text('')
			getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);
		}
	});

	$('#searchByInput').bind('keyup', function(event) {
		if(event.keyCode == "13") {　　　　 //回车执行查询
			conditions = $('#searchByInput').val();
			getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);　　
		}
	})
	$('.search>span').bind('click', function(event) {

		conditions = $('#searchByInput').val();
		getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);　　

	})

	connect();
	//	Load()
})

//websock
var stompClient = null;
//此值有服务端传递给前端,实现方式没有要求
//var userId1 = JSON.parse(sessionStorage.getItem('userData')).userName;
//websock协议
function connect() {
	var socket = new SockJS(Utils.url + '/endpointWisely'); //1连接SockJS的endpoint是“endpointWisely”，与后台代码中注册的endpoint要一样。
	stompClient = Stomp.over(socket); //2创建STOMP协议的webSocket客户端。
	stompClient.connect({}, function(frame) { //3连接webSocket的服务端。
		stompClient.subscribe('/user/manager/msg', function(respnose) {
			var data = JSON.parse(respnose.body);
			var currentOrder = data.orderId;
			var currentChannelID = data.channelId;
			$('tbody').find('tr').each(function(index) {
				var oderID = $(this).find('td.channel-id').attr('data-orderid');
				$(this).find('td span.edit-order').attr('data-channelId', currentChannelID);
				$(this).find('td span.delete-order').attr('data-channelId', currentChannelID);
				if(oderID === currentOrder) {
					$(this).find('td.channel-id').text(currentChannelID);

					$(this).find('td.channel-status').text(el.getOderStatus(data.status));

				}
			})
			getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);

		});

		//		stompClient.subscribe('/user/' + userId1 + '/msg', function(respnose) {
		//			getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);
		//		});
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

var addOrderDiag = new Vue({
	el: "#addOrderDiag",
	data: {
		channelId: "",
		orderNo: "",
		flightNo: "",
		count: "",
		carryPeople: "",
		orderId: "",
		id: "",
		endPlace: "",
		productName: "",
		productWei: "",
		idCardNo: "",
		outTime: "",
		inTime: "",
		proxyPerson: "",
		consignor: "",
		idCardNo: "",
		isDanger: "",
		isBeginOrder: false,
		timeShow: false
	}
})

var mainContainer = new Vue({
	el: "#mainContent",
	data: {
		allOrderData: [],
		items: {
			status: 0,
			orderId: "880-1234578",
			productName: '衣服',
			productWei: "45",
			flightId: "MH1548",
			carryPerson: "xiaohong",
			conPerson: "小黑",
			num: "45",
			endPlace: "北京",
			channelId: "2",
			isDanger: "是",
			idCardNo: "500234199802121145",
			createTime: "2018-10-10 15:00:45",
			startTime: "2018-10-10 15:00:45",
			lastPauseTime: "2018-10-10 15:00:45",
			outTime: "2018-10-10 12:10:54",
			inTime: "2018-10-10 12:10:54",
			idCardList: ["https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1541412169&di=5569613ac63f0efccfb834c2d6ff0bd8&imgtype=jpg&er=1&src=http%3A%2F%2Fpic1.win4000.com%2Fpic%2Fd%2F90%2Ff2861315588.jpg"],
			orderPaperList: ["https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1541412169&di=5569613ac63f0efccfb834c2d6ff0bd8&imgtype=jpg&er=1&src=http%3A%2F%2Fpic1.win4000.com%2Fpic%2Fd%2F90%2Ff2861315588.jpg"]

		},
		list: {},
		proxyList: [],

	},
	methods: {

		getOrderDetail: function(id, channelId) {
			var self = this;
			editOrderId = id;
			$('ul.echo-img').find('li').remove();
			$('div.z_photo').find('section.up-section').remove();
			$('#barcode').attr('src', '')

			var channelId = channelId;

			//编辑
			isAddOrder = false;
			isTrueCarry = true;

			$('.title1').text('编辑运单')

			$.ajax({
				type: "get",
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				url: Utils.url + '/order/getOrderById?id=' + id + '&timestamp=' + new Date().getTime(),
				//			url: Utils.url + '/order/findOrder_office?pageNum=' + pageNum + '&pageSize=' + pageSize +
				//			'&createTime=' + creatTime + '&channelId=' + channelId + '&conditions=' + conditions + '&timestamp=' + new Date().getTime(),
				dataType: 'json',
				//				data: data,
				success: function(result) {
					if(Number(result.status) == 200) {
						addOrderDiag.orderNo = result.data.orderId;
						addOrderDiag.flightNo = result.data.flightId;
						addOrderDiag.productName = result.data.cargoName;
						addOrderDiag.productWei = result.data.weight;
						addOrderDiag.count = result.data.num;
						addOrderDiag.endPlace = result.data.flightTerminal;
						addOrderDiag.carryPeople = result.data.carryPerson;
						addOrderDiag.proxyPerson = result.data.proxyName;
						addOrderDiag.consignor = result.data.consignor;
						addOrderDiag.idCardNo = result.data.proxyIcno;
						addOrderDiag.isDanger = result.data.dangerous === 0 ? '否' : '是';
						addOrderDiag.channelId = result.data.channelId;
						addOrderDiag.inTime = result.data.inboundTime === null ? '' : mainContainer.getTimeByTimestamp(result.data.inboundTime.toString());
						addOrderDiag.outTime = result.data.outboundTime === null ? '' : mainContainer.getTimeByTimestamp(result.data.outboundTime.toString());
						if(result.data.dangerous === 0) {
							$('.inTime').hide()

						} else {
							$('.inTime').show()
							if(result.data.outboundTime !== null) {
								$('.outTime-div .time-span').text('')
							}
							if(result.data.inboundTime !== null) {
								$('.inTime-div .time-span').text('')
							}
						}
						//时间选择器
						laydate.render({
							elem: '#inTime',
							theme: '#4e97d9',
							type: 'datetime',
							eventElem: '.inTime-div .time-span',
							done: function(value, date, endDate) {
								$('.inTime-div').next().hide()
								$('#inTime').css('border-color', '#dcdfe6');
								$('.inTime-div .time-span').text('')
							}
						});

						laydate.render({
							elem: '#outTime',
							theme: '#4e97d9',
							type: 'datetime',
							eventElem: '.outTime-div .time-span',
							done: function(value, date, endDate) {
								$('.outTime-div').next().hide()
								$('#outTime').css('border-color', '#dcdfe6');
								$('.outTime-div .time-span').text('')
							}
						});

						var html = [];
						for(var i = 0; i < result.data.icPhotos.length; i++) {
							html.push('<li>');
							html.push('<img src="../../lib/img/imgclose.png" class="close-img" onclick="closeImg(this)">');
							html.push('<img src="' + result.data.icPhotos[i] + '" class="image"  onclick="showDetailsImg(this)"> ');
							html.push('</li>');
						}
						$('ul#idFace').append(html.join(''));

						var html2 = [];
						for(var i = 0; i < result.data.trackingPhotos.length; i++) {
							html2.push('<li>');
							html2.push('<img src="../../lib/img/imgclose.png" class="close-img" onclick="closeImg(this)">');
							html2.push('<img src="' + result.data.trackingPhotos[i] + '" class="image"  onclick="showDetailsImg(this)"> ');
							html2.push('</li>');
						}
						$('ul#orderPaper').append(html2.join(''));
						if(result.data.channelId === null) {
							$('#orderNO').attr('disabled', false);
							$('#orderNO').css('cursor', 'default');
							addOrderDiag.isBeginOrder = false;
							beginread_onclick()
							$('.code-btn').attr('disabled', false)

						} else {
							$('#orderNO').attr('disabled', true);
							$('#orderNO').css('cursor', 'not-allowed');
							addOrderDiag.isBeginOrder = true;
							$('.close-img').hide()
							endread_onclick()
							$('.code-btn').attr('disabled', true)

						}

					}
				},
				error: function(e) {}
			});
			$('.add-order').show();

			//			getOrderImgs(orderId);

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
						var html = [];
						if(!Utils.isEmptyObject(result.data.list)) {
							for(var i = 0; i < result.data.list.length; i++) {
								html.push('<li data-proxy="' + result.data.list[i].username + '" onclick="chooseProxy(this)">' + result.data.list[i].username + '</li>');
							}
						}
						$('.proxy').html(html.join(''));
					}
				},
				error: function(e) {}
			});
		},

		getTimeByTimestamp: function(now) {
			if(!Utils.isEmptyObject(now) && now != "null") {
				var time = new Date(parseInt(now));
				var year = time.getFullYear();
				var month = time.getMonth() + 1;
				var hours = time.getHours();
				var minutes = time.getMinutes();
				var seconds = time.getSeconds();
				var day = time.getDate();
				month = month <= 9 ? month = "0" + month : month;
				day = day <= 9 ? day = "0" + day : day;
				hours = hours <= 9 ? hours = "0" + hours : hours;
				minutes = minutes <= 9 ? minutes = "0" + minutes : minutes;
				seconds = seconds <= 9 ? seconds = "0" + seconds : seconds;
				return year + "-" + month + "-" + day + ' ' + hours + ':' + minutes + ':' + seconds;
			} else {
				return "";
			}
		},

		getOderStatus: function(status) {
			var txt = '';
			//0 等待安检  2是正在安检  3是暂停安检
			if(status == 0) {
				txt = '等待安检'
			} else if(status == 2) {
				txt = '正在安检';
			} else if(status == 3) {
				txt = '暂停安检'
			}
			return txt;

		},

		showAddAndUpdateOrder: function() {
			//清除缓存的图片
			$('ul.echo-img').find('li').remove();
			$('div.z_photo').find('section.up-section').remove();
			$('.add-order').show();
			idCardImgList = [];

			$('#barcode').attr('src', '')
			beginread_onclick()

			$('#orderNO').attr('disabled', false);
			$('#orderNO').css('cursor', 'default');
			//添加
			$('.title1').text('新增运单')
			isAddOrder = true;
			isTrueCarry = false;
			orderDetilsEchoImg = [];
			addOrderDiag.orderNo = '';
			addOrderDiag.flightNo = '';
			addOrderDiag.productName = '';
			addOrderDiag.productWei = '';
			addOrderDiag.count = '';
			addOrderDiag.endPlace = '';
			addOrderDiag.carryPeople = '';
			addOrderDiag.proxyPerson = JSON.parse(sessionStorage.getItem('userData')).userName;
			addOrderDiag.consignor = '';
			addOrderDiag.idCardNo = '';
			addOrderDiag.isDanger = '';

			//时间选择器
			laydate.render({
				elem: '#inTime',
				theme: '#4e97d9',
				type: 'datetime',
				eventElem: '.inTime-div .time-span',
				done: function(value, date, endDate) {
					$('.inTime-div').next().hide()
					$('#inTime').css('border-color', '#dcdfe6');
					$('.inTime-div .time-span').text('')
				}
			});

			laydate.render({
				elem: '#outTime',
				theme: '#4e97d9',
				type: 'datetime',
				eventElem: '.outTime-div .time-span',
				done: function(value, date, endDate) {
					$('.outTime-div').next().hide()
					$('#outTime').css('border-color', '#dcdfe6');
					$('.outTime-div .time-span').text('')
				}
			});
		},

		/*
		 *删除订单弹窗的显示
		 * */
		showDeleteOrderHint: function(id, orderId, channelId) {
			var channelId = channelId
			deleteId = id;
			deleteOrderId = orderId;
			if(channelId !== null) {
				Utils.noticeModelFn($('#loginHint'), "该订单处于运行或暂停状态，不能删除！", 2);
				return;
			}
			$('.hw-delete').show();
			deletetId = id
			deleteOrderId = orderId
			$('#deletHint').text('你确定删除' + deleteOrderId + '订单？');
		},

		/*===============订单详情（订单进度）======================*/
		/*
		 * 显示当前订单的安检进度
		 * 得到订单的详情
		 * */
		showOrderProgress: function(orderId, data) {
			var orderId = orderId;
			var data = data;
			if(!Utils.isEmptyObject(data)) {
				$('.order-id').html('<span>运单号: ' + data.orderId + '</span>');
				$('p.order-details1').html('<span>' + (data.channelId == null ? "暂无" : data.channelId) + '</span><span>' + data.flightId + '</span><span>' + data.num + '</span>');
				//		$('p.order-details2').html('<span>'+data.carryPerson+'</span><span>'+data.flightId+'</span>');
				$('p.order-details2').html('<span>' + data.carryPerson + '</span>');
			}

			$('.order-progress').show();
			$.ajax({
				type: 'get',
				url: Utils.url + '/order/findDetail?orderId=' + orderId,
				success: function(result) {
					handelOrderDetails(result);
				},
				error: function(e) {}
			})
		},
		prinf: function(data) {
			var id = data.orderId
			sessionStorage.setItem('orderId', id)

			window.open('../../page/waybillEntering/prinf.html')
		},
		printf: function() {
			window.open('../../page/waybillEntering/prinfExport .html')
		},
		initPhoto: function() {
			navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMeddia || navigator.msGetUserMedia;
			if(navigator.getMedia) {
				navigator.getMedia({
					video: true
				}, function(stream) {
					mediaStreamTrack = stream.getTracks()[0];
					var video = document.querySelector('video');

					video.src = (window.URL || window.webkitURL).createObjectURL(stream);
					video.play();
				}, function(err) {
				});
			}

			//			if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			//				navigator.mediaDevices.getUserMedia({
			//					video: true,
			//					audio: true
			//				}).then(function(stream) {
			//					console.log(stream);
			//
			//					mediaStreamTrack = typeof stream.stop === 'function' ? stream : stream.getTracks()[1];
			//
			//					video.src = (window.URL || window.webkitURL).createObjectURL(stream);
			//					video.play();
			//				}).catch(function(err) {
			//					console.log(err);
			//				})
			//			}
		},

	},
	mounted: function() {
		getAllChannelNumber();
		this.getProxyList();
		getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);
	},
	created: function() {
		el = this;
	}
})

/* 打印 */
//function preview(oper) {
//	if(oper < 10) {
//		bdhtml = window.document.body.innerHTML; //获取当前页的html代码
//		sprnstr = '<div class="startprint1"></div>'; //设置打印开始区域
//		eprnstr = '<div class="endprint1"></div>'; //设置打印结束区域
//		prnhtml = bdhtml.substring(bdhtml.indexOf(sprnstr) + 31); //从开始代码向后取html,减去div的长度
//		prnhtml = prnhtml.substring(0, prnhtml.indexOf(eprnstr)); //从结束代码向前取html
//		window.document.body.innerHTML = prnhtml;
//		window.print();
//		// window.document.body.innerHTML = bdhtml;
//		window.location.reload();
//	} else {
//		window.print();
//		window.location.reload();
//	}
//}

//关闭拍照弹框

function closeDiag(flag) {
	if(flag === 1) {
		$('.photo').hide();
		CloseVideo()
		Unload()
	} else {
		$('.face-photo').hide()
		$('#webcam').html('')

	}

}

//      拍照弹框
function openTakePhoto(flag) {
	if(flag === 1) {
		isIdCardTake = true;
		$('.face-photo').show()
		//		mainContainer.initPhoto()
		cameraTake();
		$('#idFace').parent().find('span.error-hint-text').hide();
		//		window.open('../../page/waybillEntering/takePhoto.html','','width=800,height=500,left=600,top=100')
	} else {
		isIdCardTake = false;
		$('#orderPaper').parent().find('span.error-hint-text').hide();
		$('.photo').show();
		setTimeout(function() {
			Load();
		}, 200)
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
			$('ul#idFace').next().find('section').css("display", "none");
		}
	} else {
		html.push('<li>');
		html.push('<img src="../../lib/img/imgclose.png" class="close-img" onclick="closeImg(this)">');
		html.push('<img src="' + data + '" class="image"  onclick="showDetailsImg(this)"> ');
		html.push('</li>');
		$('ul#orderPaper').append(html.join(''));
		if($('ul#orderPaper li').length == 6) {
			$('ul#orderPaper').next().find('section').css("display", "none");
		}
	}

}

//预览拍照图片
function showDetailsImg(e) {
	$('.img-preview').show();
	$('#imgPreview').attr('src', $(e).attr('src'));
}

//删除拍了的图片
function closeImg(e) {
	//  $('div.z_photo').find('section').css("display", "inline-block");
	//	$(e).parent('li').remove()
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

function deleteTime(e) {
	$(e).siblings('input').val('')
	//	$('#time').val('');
	$(e).siblings('.time-span').text('请选择时间')
	creatTime = '';
	getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);
}

//得到所有的通道号
function getAllChannelNumber() {
	$.ajax({
		type: 'get',
		url: Utils.url + '/channel/getALlChannelId?timestamp=' + new Date().getTime(),
		headers: {
			'Content-Type': 'application/json; charset=UTF-8'
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(result) {
			if(result.length > 5) {
				$('div.select-down > div.open ul').css('overflow-y', 'scroll')
				$('div.select-down > div.open ul').css('max-height', '175px')
			}
			handleAllChannelNumber(result);
		},
		error: function(e) {}
	})

}

/*
 *处理所有的通道号
 * */
function handleAllChannelNumber(data) {
	var html = [];
	html.push('<li onclick="selectChannelNmuber(-1)">全部</li>')
	if(!Utils.isEmptyObject(data)) {
		for(var i = 0; i < data.length; i++) {
			html.push('<li data-channel="' + data[i] + '" onclick="selectChannelNmuber(0,this)">' + data[i] + '</li>');
		}
	}
	$('.channel-number').html(html.join(''));
}

/*
 * 选择通道号
 * */
function selectChannelNmuber(flag, e) {
	if(flag == -1) {
		//全部
		channelId = '';
		$('#channelNumber').val('全部');
	} else {
		channelId = $(e).attr('data-channel');
		$('#channelNumber').val(channelId);
	}
	getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);
}

/*
 *	处理订单的进度详情
 * */
function handelOrderDetails(data) {
	var orderProgress = [];
	var orderProgressHtml = [];
	var orderImage = [];
	var orderImageHtml = [];
	if(!Utils.isEmptyObject(data)) {
		orderProgress = data[0];
		orderImage = data[1];
		if(!Utils.isEmptyObject(orderProgress)) {
			for(var i = 0; i < orderProgress.length; i++) {
				orderProgressHtml.push('<li>');
				orderProgressHtml.push('<div>' + Utils.getTimeByTimestamp('' + orderProgress[i].time + '') + '</div>');
				orderProgressHtml.push('<div class="' + getOrderProgressStatus(orderProgress[i].status).className + '">');
				orderProgressHtml.push('<i></i>');
				orderProgressHtml.push('<p>' + Utils.isEmptyObjectReturnString(orderProgress[i].info) + '</p>');
				if(orderProgress[i].status == '结束' || orderProgress[i].status == '暂停') {} else {
					orderProgressHtml.push('<p>' + getOrderProgressStatus(orderProgress[i].status).people + '：' + Utils.isEmptyObjectReturnString(orderProgress[i].people) + '</p>');
				}
				orderProgressHtml.push('</div>');
				orderProgressHtml.push('</li>');
			}
		} else {
			orderProgressHtml.push('<li>暂无</li>');
		}

		if(!Utils.isEmptyObject(orderImage)) {
			for(var i = 0; i < orderImage.length; i++) {
				orderImageHtml.push('<li onclick="showOrderProgressBigImage(this)">');
				orderImageHtml.push('<img src="' + orderImage[i].photoPath + '"/>');
				orderImageHtml.push('</li>');
			}

		}
	}

	$('.order-progress-list').html(orderProgressHtml.join(''));
	//	$('.order-progress-img').html(orderImageHtml.join(''));

}

/*
 * 得到订单进度的状态
 * status:状态
 * */
function getOrderProgressStatus(status) {
	var className = '';
	var people = '';
	if(status == '开始') {
		className = 'start-check';
		people = '安检人员'
	} else if(status == '结束' || status == '暂停') {
		className = 'stop-check';
		people = '';
	} else {
		//开包
		className = 'unpack';
		people = '开包人员'
	}
	return {
		className: className,
		people: people
	}
}

//查看订单进度的大图
function showOrderProgressBigImage(e) {
	var img = $(e).find('img').attr('src');
	openImg(img);
}

/*=============================编辑和添加订单=================*/
//显示添加和编辑订单的弹窗

/*
 * orderId：订单的id
 * 得到图片
 * */
function getOrderImgs(orderId) {
	orderDetilsEchoImg = [];
	$.ajax({
		type: 'get',
		url: Utils.url + '/order/getPhoto?orderId=' + orderId + '&timestamp=' + new Date().getTime(),
		headers: {
			'Content-Type': 'application/json; charset=UTF-8'
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(result) {
			handleOrderImgs(result);
		},
		error: function(e) {}
	})
}

//处理订单详情的图片回显
function handleOrderImgs(data) {
	var html = [];
	$('div.z_photo').find('section.up-section').remove();
	$('ul.echo-img').html(html.join(''));
	orderDetilsEchoImg = data;
	if(!Utils.isEmptyObject(data)) {
		for(var i = 0; i < data.length; i++) {
			html.push('<li>');
			html.push('<img src="../../lib/img/imgclose.png" class="close-img" onclick="closeImg(this,' + i + ')">');
			html.push('<img src="' + data[i].photoPath + '" data-id="' + data[i].id + '"  class="image" onclick="showOrderDetailsImg(this)">');
			html.push('</li>');
		}
	}
	$('ul.echo-img').html(html.join(''));
}

//显示大图，订单详情的数据回显的大图显示
function showOrderDetailsImg(e) {
	var img = $(e).attr('src');
	openImg(img);
}

//删除数据回显的时候的图片
function closeImg(e, index) {
	$(e).parent().remove();
	$('div.z_photo').find('section').css("display", "block");
	//	console.log($(e).next().attr("data-id"));
	formData.append("ids", $(e).next().attr("data-id"));
	orderDetilsEchoImg.splice(index, 1);
}

/*
 *查看大图
 * */
function openImg(img) {
	$('.img-preview').show();
	$('#imgPreview').attr('src', img);
}

//表单验证
function verifyFrom(e) {
	$(e).parent().find('span.error-hint-text').hide();
	$(e).css('border-color', '#dcdfe6');
}

function base64toUrl(data) {
	var formDataImg = new FormData()
	formDataImg.append('file', dataURItoBlob(data))

	$.ajax({
		type: 'POST',
		url: Utils.url + '/common/upload?filePath=order' + '&timestamp=' + new Date().getTime(),
		//		headers: {
		//			'Content-Type': 'application/json; charset=UTF-8'
		//		},
		processData: false,
		contentType: false,
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		data: formDataImg,
		success: function(result) {
			showPhoto(result.data);
		},
		error: function(e) {}
	})
}

/*
 *添加和编辑订单
 * */
function addAndUpdateOrder() {
	var reg = /^\s+|\s+$/g //空
	var regflight = /^(?!\d+$)[\da-zA-Z]*$/
	var regZh = /[\u4E00-\u9FA5]/g
	//  var regflight= /^[a-zA-Z0-9]{9}$/ //航班号验证
	var regOrder = /^\d{3}-\d{8}$/ //运单号验证  
	//  var regnumAndE = /^[0-9a-zA-Z]*[A-Z]{1}[0-9a-zA-Z]*$/
	//  console.log(regOrder.test($('#orderNO').val()))

	var orderNO = $('#orderNO').val();
	idCardImgList = []
	orderImgList = []

	if($('#orderNO').val().length <= 0 || reg.test($('#orderNO').val())) {
		$('#orderNO').parent().find('span.error-hint-text').text('请输入运单号！')
		$('#orderNO').parent().find('span.error-hint-text').show();
		$('#orderNO').css('border-color', '#f56c6c');
		return;
	} else {
		if($('#orderNO').val().indexOf('-') < 0 || $('#orderNO').val().length < 12 || $('#orderNO').val().length > 12 || !regOrder.test(orderNO)) {
			$('#orderNO').parent().find('span.error-hint-text').text('请输入正确的运单号！')
			$('#orderNO').parent().find('span.error-hint-text').show();
			$('#orderNO').css('border-color', '#f56c6c');
			return;
		}

	}

	var flightNO = $('#flightNO').val();
	if(regflight.test(flightNO) == false || reg.test(flightNO) || flightNO.length <= 0) {
		//		$('#flightNO').val("")
		$('#flightNO').parent().find('span.error-hint-text').show();
		if(flightNO.length <= 0) {
			$('#flightNO').parent().find('span.error-hint-text').text('请输入航班号')
		} else {
			$('#flightNO').parent().find('span.error-hint-text').text('请输入正确的航班号')
		}

		$('#flightNO').css('border-color', '#f56c6c');
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

		$('#productName').css('border-color', '#f56c6c');
		return;
	}

	var productWei = $('#productWei').val();
	if(productWei.length <= 0) {
		$('#productWei').parent().find('span.error-hint-text').show();
		$('#productWei').css('border-color', '#f56c6c');
		return;
	}

	var orderCount = $('#orderCount').val();
	if(orderCount.length <= 0) {
		$('#orderCount').parent().find('span.error-hint-text').show();
		$('#orderCount').css('border-color', '#f56c6c');
		return;
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

		$('#endPlace').css('border-color', '#f56c6c');
		return;
	}

	var carryCompany = $('#carryCompany').val();
	if(carryCompany.length <= 0) {
		$('#carryCompany').parent().find('span.error-hint-text').show();
		$('#carryCompany').css('border-color', '#f56c6c');
		return;
	}

	var proxyPerson = $('#proxyPerson').val();
	if(proxyPerson.length === 0) {
		$('#proxyPerson').parents('.select-down').find('span.error-hint-text').show();
		$('#proxyPerson').css('border-color', '#f56c6c');
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

		$('#consignor').css('border-color', '#f56c6c');
		//		return;
	}

	var idCardNo = $('#idCardNo').val();
	if(idCardNo.length === 0) {
		$('#idCardNo').parent().find('span.error-hint-text').show();
		$('#idCardNo').css('border-color', '#f56c6c');
		return;
	}

	var isDanger = $('#isDanger').val();
	if(isDanger.length === 0) {
		$('#isDanger').parents('.select-down').find('span.error-hint-text').show();
		$('#isDanger').css('border-color', '#f56c6c');
		return;
	}

	if(isDanger === '是') {
		var inTime = $('#inTime').val();
		if(inTime.length <= 0) {
			$('#inTime').parent('.inTime-div').next().show();
			$('#inTime').css('border-color', '#f56c6c');
			return;
		}

		var outTime = $('#outTime').val();
		if(outTime.length <= 0) {
			$('#outTime').parent('.outTime-div').next().show();
			$('#outTime').css('border-color', '#f56c6c');
			return;
		}
	}
	//	if($('#barcode').attr('src') === '') {
	//		$('#barcode').parent().find('span.error-hint-text').show();
	//		return;
	//	}

	var idCardLen = $('#idFace li').length;
	for(var i = 1; i < idCardLen + 1; i++) {
		idCardImgList.push($('#idFace li:nth-child(' + i + ')').children('.image').attr('src'))
		//		idCardImgList.push(dataURItoBlob($('#idFace li:nth-child(' + i + ')').children('.image').attr('src')))
	}
	if(idCardLen === 0) {
		$('#idFace').next().find('span.error-hint-text').show();
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
		$('#orderPaper').next().find('span.error-hint-text').show();
		return;
	}
	var orderList = [];
	for(var i = 0; i < orderImgList.length; i++) {
		orderList.push(orderImgList[i]);
	}

	var data = {
		cargoName: productName,
		carryPerson: carryCompany,
		flightId: flightNO,
		proxyIcno: idCardNo,
		consignor: consignor,
		orderId: orderNO,
		dangerous: isDanger === '是' ? 1 : 0,
		num: orderCount,
		proxyName: proxyPerson,
		flightTerminal: endPlace,
		inboundTime: inTime,
		outboundTime: outTime,
		icPhotos: idList,
		trackingPhotos: orderList,
		weight: productWei
	}
	if(!isAddOrder) {
		data = {
			//			id: editOrderId,
			cargoName: productName,
			carryPerson: carryCompany,
			flightId: flightNO,
			proxyIcno: idCardNo,
			consignor: consignor,
			orderId: orderNO,
			dangerous: isDanger === '是' ? 1 : 0,
			num: orderCount,
			proxyName: proxyPerson,
			flightTerminal: endPlace,
			inboundTime: inTime,
			outboundTime: outTime,
			icPhotos: idList,
			trackingPhotos: orderList,
			weight: productWei
		}
		if(isTrueCarry == true) {
			submitOrder(data, 'editOrder', editOrderId);
		} else {
			idCardImgList = [];
			orderImgList = [];

		}

	} else {
		if(isTrueCarry == true) {
			submitOrder(data, 'addOrder');
		} else {

			idCardImgList = [];
			orderImgList = [];
		}

	}
}

//模糊匹配承运人
function matchCompany() {
	$('#barcode').attr('src', '')

	$.ajax({
		type: 'post',
		url: Utils.url + '/order/findCarryPersonBycondition?condition=' + $('#orderNO').val().substring(0, 3) + '&timestamp=' + new Date().getTime(),
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			if(result.length == 1) {
				//				$('#carryCompany').val(result[0].carryPerson)
				addOrderDiag.carryPeople = result[0].carryPerson;
				isTrueCarry = true;

			} else {
				$('#carryCompany').val('')
			}
			//			if(result.length > 0) {
			//				var html = [];
			//				for(var i = 0; i < result.length; i++) {
			//					html.push('<li onclick="chooseCarryPeople(this)">' + result[i].carryPerson + '</li>')
			//				}
			//
			//				$('#carrylist').html(html.join(''))
			//				$('#carrylist').show();
			//			}
			//			for(var j = 0; j < result.length; j++) {
			//				if($('#carryCompany').val() == result[j]) {
			//					isTrueCarry = true;
			//				} else {
			//					isTrueCarry = false;
			//				}
			//			}

		}
	})

}

function cancelOrder() {
	$('.add-order').hide();
	$('.error-hint-text').hide();
	addOrderDiag.orderNo = '';
	addOrderDiag.flightNo = '';
	addOrderDiag.productName = '';
	addOrderDiag.productWei = '';
	addOrderDiag.count = '';
	addOrderDiag.endPlace = '';
	addOrderDiag.carryPeople = '';
	addOrderDiag.proxyPerson = '';
	addOrderDiag.consignor = '';
	addOrderDiag.idCardNo = '';
	addOrderDiag.isDanger = '';
	$('#idCardNo').val('')
	$('#consignor').val('')
	$('.pop-input').css('border-color', '#dcdfe6')
}

//提交订单
function submitOrder(data, orderUrl, id) {
	var self = this;
	if(orderUrl == 'addOrder') {
		$.ajax({
			type: 'post',
			url: Utils.url + '/order/' + orderUrl,
			//			processData: false,
			//			contentType: false,
			//			xhrFields: {
			//				withCredentials: true
			//			},
			beforeSend: function(request) {
				request.setRequestHeader("token", token);
			},
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function(result) {
				if(Number(result.status) == 200) {
					$('.add-order').hide();
					getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);
					Utils.noticeModelFn($('#loginHint'), "提交成功！", 1);

				} else if(Number(result.status) == 400 && result.msg == '该id已存在') {
					Utils.noticeModelFn($('#loginHint'), "该运单号已存在！", 2);

				}
			},
			error: function() {

			}
		})
	} else {
		$.ajax({
			type: 'PUT',
			url: Utils.url + '/order/' + orderUrl + '/' + id,
			//			processData: false,
			//			contentType: false,
			contentType: 'application/json',
			data: JSON.stringify(data),
			beforeSend: function(request) {
				request.setRequestHeader("token", token);
			},
			success: function(result) {
				if(Number(result.status) == 200) {
					$('.add-order').hide();
					getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);
					Utils.noticeModelFn($('#loginHint'), "提交成功！", 1);
					//					formData = new FormData();
				} else if(Number(result.status) == 400) {
					Utils.noticeModelFn($('#loginHint'), result.msg + "！", 2);
					//					formData = new FormData();
				}
			},
			error: function() {

			}
		})
	}

}

/*============================删除订单==============*/

/*
 * 删除订单
 * deletetId:id
 * deleteOrderId:订单id
 * */

//验证中文
function replaceZh(val) {
	var regZh = /[^\u4E00-\u9FA5]/g //中文
	var value = val.replace(regZh, '')
	return value;
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
			//page:点击时返回的点击的页码，拿到该页码过后执行翻页的逻辑操作
			pageNum = page;
			getAllOrder(pageNum, pageSize, creatTime, channelId, conditions)
		}
	});
}

/*
 *得到订单状态
 * */

/*登陆*/

//提交修改信息
function postSetting() {

	var oldPsd = $("#oldPsd").val();
	var newPsd = $("#newPsd").val();
	var againPsd = $("#againPsd").val();
	if(oldPsd.length <= 0) {
		$('#oldPsd').parent().find('span.error-hint-text').show();
		$('#oldPsd').css('border-color', '#f56c6c');
		return;
	}
	if(newPsd.length <= 0) {
		$('#newPsd').parent().find('span.error-hint-text').show();
		$('#newPsd').css('border-color', '#f56c6c');
		return;
	}
	if(againPsd.length <= 0) {
		$('#againPsd').parent().find('span.error-hint-text').show();
		$('#againPsd').css('border-color', '#f56c6c');
		return;
	}

	var self = this;
	$.ajax({
		type: "post",
		url: Utils.url + "/changePassword?oldPassword=" + oldPsd + "&newPassword=" + newPsd + "&newPassword1=" + againPsd + "&userId=" + userId + "&timestamp=" + new Date().getTime(),
		async: true,
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			if(Number(result.status) == 200) {
				Utils.noticeModelFn($('#loginHint'), "更改密码成功！", 1)
				$("#oldPsd").val("");
				$("#newPsd").val("");
				$("#againPsd").val("");
				$('.add-order-user').hide()
				setTimeout(function() {
					loginout()
				}, 200)
			} else {
				Utils.noticeModelFn($('#loginHint'), result.msg + "！", 2)

			}
		}
	});
}
//关闭弹窗
function closeWindow() {
	$('.add-order-user').hide();
	$("#oldPsd").val("");
	$("#newPsd").val("");
	$("#againPsd").val("");
	$('span.error-hint-text').hide();
	$('.pop-input').css('border-color', '#dcdfe6');
}

//选择下拉框
//function showSelect(e) {
//	$(e).css('border-color', 'rgb(98, 168, 234)');
//	if($('#carrylist').css('display') == 'none') {
//		//		$('#carrylist').show();
//	} else {
//		//		$('#carrylist').hide();
//	}
//}

//监听点击空白地区下拉收起
$(document).on('click', function(e) {

	if($(e.target).parents('.carry').length <= 0) {
		$('#carrylist').hide();
		$(".carry").css({
			'border-color': '#ddd'
		})
	}

});

//添加气泡title
function addBlackTitle() {
	$('.just-tooltip').remove();
	$('table tr td:not(:last-child)').mouseover(function(event) {
		var _this = $(this);
		//		(this.offsetWidth-1 < this.scrollWidth) //判断是否有隐藏 ie有兼容性问题
		//		if($(this).context.offsetWidth - 1 < $(this).context.scrollWidth) {
		//			_this.justToolsTip({
		//				events: event,
		//				// animation:"flipIn",
		//				width: this.offsetWidth,
		//				contents: $(this).text(),
		//				gravity: 'top'
		//			});
		//		} else {
		//
		//		}
		if(_this.text() !== '') {
			_this.justToolsTip({
				events: event,
				// animation:"flipIn",
				width: this.offsetWidth,
				contents: $(this).text(),
				gravity: 'top'
			});
		}

	});
}

//添加气泡title
function addTitle1() {
	$("td.td-icon>span>i").mouseover(function(event) {
		var _this = $(this);
		_this.justToolsTip({
			events: event,
			// animation:"flipIn",
			width: this.offsetWidth,
			contents: $(this).attr('data-name'),
			gravity: 'top'
		});

	});
}

function verifyFrom_(e) {

	$(e).parent().find('span.error-hint-text').hide();
	$(e).css('border-color', '#dcdfe6');
	matchCompany()
}

function chooseDanger(flag) {
	if(flag === 0) {
		$('#isDanger').val('否')
		$('.inTime').hide()
	} else {
		$('#isDanger').val('是')
		$('.inTime').show()
	}
	$('#isDanger').parents('.select-down').find('span.error-hint-text').hide();

}

function chooseProxy(e) {

	//	$('#proxyPerson').val($(e).attr('data-proxy'))
	addOrderDiag.proxyPerson = $(e).attr('data-proxy');
	$('#proxyPerson').parents('.select-down').find('span.error-hint-text').hide();

}

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
	//	CloseVideoMain();

	if(!DeviceMain)
		return;

	var SelectType = 0;
	var txt;

	var nResolution = 0;
	SelectType = 1;

	VideoMain = plugin().Device_CreateVideo(DeviceMain, nResolution, SelectType);
	console.log()
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
	CloseVideo()
	//	CloseVideoMain();
	Unload()
	$('.photo').hide();
	base64toUrl(photo)
	//	showPhoto(photo);

}

function TakePhoto() {
	webcam.capture();
	$('#XwebcamXobjectX').remove();
	$('.face-photo').hide();
	$('#webcam').html('');
	base64toUrl(photo)
	//	showPhoto(photo);
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

function RGB(r, g, b) {
	return r | g << 8 | b << 16;
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
	addOrderDiag.consignor = rdcard.NameS;
	addOrderDiag.idCardNo = rdcard.CardNo;

}

function tabChange(e, flag) {
	if($(e).hasClass('active')) {
		$('.add-tab').removeClass('active')
		$(e).removeClass('active')
	} else {
		$('.add-tab').removeClass('active')
		$(e).addClass('active')
	}
	if(flag === 1) {
		$('.order').show()
		$('.declaration').hide()
	} else {
		$('.order').hide()
		$('.declaration').show()
	}
}

//		删除运单
function confirmDeleteOrder() {
	var data = {
		"id": deletetId,
		"orderId": deleteOrderId,
	}
	$.ajax({
		type: 'post',
		contentType: 'application/json',
		//		url: Utils.url + '/order/deleteOrder?id=' + deletetId + '&orderId=' + deleteOrderId + '&timestamp=' + new Date().getTime(),
		url: Utils.url + '/order/deleteOrder',
		data: JSON.stringify(data),
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(result) {
			if(Number(result.status) == 200) {
				getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);
				$('.hint-windows').hide();
				Utils.noticeModelFn($('#loginHint'), "删除成功！", 1);
			} else {

			}
		},
		error: function(e) {}
	})
}

/*
 * 得到所有的运单
 * pageNum:当前页码
 * pageSize：每页显示的数据
 * creatTime：创建的的时间
 * channelId：通道号
 * conditions：输入的条件
 * */
function getAllOrder(pageNum, pageSize, creatTime, channelId, conditions) {
	var self = this;
	channelId = encodeURI(channelId, "UTF-8");
	//	conditions = encodeURI(conditions, 'UTF-8');
	var data;

	if(channelId == undefined || channelId == "" || channelId == null) {
		data = {
			pageNum: pageNum,
			pageSize: pageSize,
			creatTime: creatTime,
			conditions: conditions,
			//		userName:encodeURI(JSON.parse(sessionStorage.getItem('userData')).userName, 'UTF-8'),
			userName: JSON.parse(sessionStorage.getItem('userData')).userName,
			timestamp: new Date().getTime(),
			//      queryType:1
		}
	} else {
		data = {
			pageNum: pageNum,
			pageSize: pageSize,
			creatTime: creatTime,
			channelId: channelId,
			conditions: conditions,
			//		userName: encodeURI(JSON.parse(sessionStorage.getItem('userData')).userName, 'UTF-8'),
			userName: JSON.parse(sessionStorage.getItem('userData')).userName,
			timestamp: new Date().getTime(),
			queryType: 1
		}

	}

	$.ajax({
		type: "get",
		url: Utils.url + '/order/getOrder_site',
		//			url: Utils.url + '/order/findOrder_office?pageNum=' + pageNum + '&pageSize=' + pageSize +
		//			'&createTime=' + creatTime + '&channelId=' + channelId + '&conditions=' + conditions + '&timestamp=' + new Date().getTime(),
		dataType: 'json',
		data: data,
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(result) {
			if(Number(result.status) == 200) {
				if(result.data.list.items.length > 0) {
					$('.table-title').css('display', '')
					$('.table-container').css('background', '#ffffff')

				} else {
					$('.table-title').css('display', 'none')
					$('.table-container').css('background', 'url(../../image/empty.png) 50% #ffffff no-repeat')

				}
				el.allOrderData = result.data.list.items;
				for(var i = 0; i < el.allOrderData.length; i++) {
					el.allOrderData[i].createTime = Utils.getTimeByTimestamp((result.data.list.items[i].createTime).toString())
				}

				//				el.allOrderData = result.data.list.items;
				$('.fl>.totle').text('共' + result.data.list.totalNum + "项")
				cutPage(result.data.list.totalPage, result.data.list.currentPage);
				//				addTitle1();
				//				addBlackTitle();
				tipTitle();
			}
		},
		error: function(e) {}
	});
}

function getCode() {
	if(addOrderDiag.orderNo === '') {
		Utils.noticeModelFn($('#loginHint'), "请填写运单号再生成条形码！", 2);
	} else {
		$("#barcode").parent().find('.error-hint-text').hide()
		$("#barcode").JsBarcode(addOrderDiag.orderNo, {
			displayValue: false,
			margin: 0,
			marginLeft: 10,
			height: 32,
			width: 1.5
		});

	}

}

//hover时提示框
function tipTitle() {
	$('.just-tooltip').remove();
	$("#tableBox").bind('mouseover').on('mouseover', 'td:not(".handle-btn")', function(event) {
		var text = $(this).text();
		var className = $(this).attr('class');
		/*if (this.offsetWidth < this.scrollWidth ) {//判断是否有隐藏 ie有兼容性问题
		    var _this = $(this);

		    _this.justToolsTip({
		        events:event,
		        // animation:"flipIn",//ie下使用动画要卡顿
		        width:this.offsetWidth+'px',
		        contents:$(this).text(),
		        gravity:'top'
		    });
		}*/
		var _this = $(this);
		if(text != '' && className != 'channelIP' && text != '查看') {
			_this.justToolsTip({
				events: event,
				// animation:"flipIn",//ie下使用动画要卡顿
				width: this.offsetWidth + 'px',
				contents: $(this).text(),
				gravity: 'top'
			});
		}

		$("td.handle-btn>i").mouseover(function(event) {
			var _this = $(this);
			_this.justToolsTip({
				events: event,
				// animation:"flipIn",
				width: this.offsetWidth,
				contents: $(this).attr('data-title'),
				gravity: 'top'
			});
		});

	});

}