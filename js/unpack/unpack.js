var token = sessionStorage.getItem('token')
$(function() {
	//动态给canvas赋值宽高
	canvasWidth = $(".canvas-box").width();
	canvasHeight = $(".canvas-box").height();
	$("#canvas1").attr('width', canvasWidth);
	$("#canvas1").attr('height', canvasHeight);
	//获取到登陆的时候存的信息
	var d = JSON.parse(sessionStorage.getItem('data'));
	// var d = {
	//     "id":79,
	//     "userId":"ceshi02",
	//     "userName":"ydq",
	//     "loginTime":1523347029633,
	//     "roleName":"管理员",
	//     "channelId":"001"
	// };
	//如果信息被清空弹回登陆页面
	// console.log(d)
	if(d == null || d == '' || d == undefined) {
		Utils.noticeModelFn($('.notice-model'), '登陆信息过期，即将返回登陆页面重新登陆！', 2);
		setTimeout(function() {
			window.location = 'login.html';
		}, 3000);
		return
	} else {
		// console.log('登陆成功');
		$('.username>span').text(decodeURI(d.userName));
		channelId = d.channelId;
		unpackAccount = d.userId;
		loginTime = d.loginTime;
		channelNumber = d.channelId;
		//摄像头获取
		getCamera(channelNumber);
		//webSocket连接
		webSocketPost(channelId);

		//待标注图片列表
		imgListPost(1);

		//翻页
		pageTurning();

		//下拉列表点击显示在input
		selectClickFn();

		//摄像头拍照删除
		cameraImgDelete();

		//判断是否装了ActiveX
		//var iRet = WebVideoCtrl.I_CheckPluginInstall();
		//console.log(iRet)
		/*if(-1 == iRet) {
			console.log(iRet)
			Utils.noticeModelFn($('.notice-model'), '未安装过插件！', 2);
			return;
		}*/
//		$(window).unload(function() {
//			WebVideoCtrl.I_Stop();
//		});
		
	}
});

/************************/

var canvasWidth; //canvas 宽度
var canvasHeight; //canvas 高度
var URL = Utils.url; //服务器地址
var page = 1; //页数
var pageNum = 10; //每页数据条数
var channelId = ''; //开包台号
var P = 1; //总页数
var imgID = ''; //选中图片ID
// var ftpIP = '192.168.1.219'; //图片服务器地址
var channelNumber = ''; //上传图片到某个通道号下的文件夹
var loginTime = ''; //通过登陆时间获取当前年月日
var folderPath = ''; //开包实物图片上传路径所在文件夹
var cameraCapture = 'CameraCapture'; //摄像头拍摄图片上传路径所在文件夹
var webSocketUrl = Utils.url + '/endpointWisely'; //推送路径

/************************/

//webSocket推送获取到最新的一张图片
function webSocketPost(channelId) {
	var socket;
	var stompClient;
	if(typeof(WebSocket) == "undefined") {
		Utils.noticeModelFn($('.notice-model'), '您的浏览器不支持WebSocket', 2);
		return;
	}
	socket = new SockJS(webSocketUrl);
	stompClient = Stomp.over(socket); //2创建STOMP协议的webSocket客户端。
	stompClient.connect({}, function(frame) { //3连接webSocket的服务端。
		stompClient.subscribe('/topic/unpack', function(respnose) {
			// console.log(JSON.parse(respnose.body).responseMessage)
		});
		stompClient.subscribe('/user/' + channelId + '/msg', function(respnose) {
			showResponse1(JSON.parse(respnose.body));
		});
	});
	socket.onclose = function() {
		// 关闭 websocket

		console.log('连接已关闭...')
		webSocketPost()
	}
	socket.onerror = function() {
		// 关闭 websocket

		console.log('连接已关闭...')
		webSocketPost()
	}
}

function showResponse1(message) {
	/*console.log(message);
	console.log(message.picAccess);
	console.log(message.unpack);
	console.log(message.channelId);
	console.log(message.verifyAccount);*/
	if(message.picAccess == null || message.picAccess == undefined || message.picAccess == '') {} else {
		setTimeout(function() {
			pageNum = 1;
			imgListPost(2);
		}, 100)
	}
}

/**
 *
 * 图片列表
 *
 **/

//翻页
function pageTurning() {
	//上一页
	$(".img-left").click(function() {
		if(page > 1) {
			page--;
			pageNum = 10;
			imgListPost(1);
		}
	});
	//下一页
	$(".img-right").click(function() {
		if(P - page - 1 > 1) {
			page++;
			pageNum = 10;
			imgListPost(1);
		}
	});

}

//图片列表请求
//num 1替换整个列表 2在li之前prepend一个，在删除最后一个
function imgListPost(num) {
	$.ajax({
		type: "get",
		url: URL + "/unpackVerify/get",
		data: {
			page: page,
			num: pageNum,
			channelId: channelId,
			timestamp: new Date().getTime() //防止在IE下的缓存
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(data) {
			// console.log(data);
			var list;
			if(data.status == 200 && data.msg == "OK") {
				list = data.data.list;
				P = Math.ceil(data.data.total / pageNum);
				//左
				if(page > 1) {
					$(".img-left").addClass("active");
				} else if(page == 1) {
					$(".img-left").removeClass("active")
				}
				//右
				if(P - page - 1 > 1) {
					$(".img-right").addClass("active");
				} else if(P - page - 1 == 1) {
					$(".img-right").removeClass("active");
				}
				var total = data.data.total; //总条数
				imgListHtml(list, num, total);
			}
		},
		error: function() {

		}
	})
}

//图片列表页面展示
function imgListHtml(list, num, total) {
	var html = '';
	var className = '';
	for(var i = 0; i < list.length; i++) {
		if(num == 2) {
			className = 'load-model';
		} else {
			className = 'load-model-none';
		}
		var a = list[i].picAccess.split('/');
        var t = (a[a.length-1].split('.'))[0];
		console.log(t)
		html += '<li class=""  data-id="' + list[i].id + '" data-imgName="'+t+'" data-channelId="' + list[i].channelId + '" data-trackingNumber="' + list[i].trackingNumber + '">' +
			'<img class="" src="' + list[i].picAccess + '" alt="">' +
			'<i class="img-box-bg"></i>' +
			'<span>' + list[i].time + '</span>' +
			'<div class="' + className + '"><div class="ball-scale"></div></div>' +
			'</li>';
	}

	if(num == 1) {
		$("div.img-box>li>div").remove();
		$(".img-box").html(html);
		$(".img-box>li>div.load-model").fadeIn();
	} else if(num == 2) {
		// unpackLoad();
		$(".img-box").prepend(html);
		setTimeout(function() {
			$("div.load-model").remove();
			$(".img-box>li>div.load-model").fadeOut();
		}, 1000);
		if(total > 10) {
			$(".img-box>li:last-child").remove();
		}
	}
	if(total <= 10) {
		$(".img-box>li>div.load-model").fadeIn();
		$("div.img-box>li>div").remove();
		if(num == 1) {
			$(".img-box").html(html);
		}
	}
	$(".img-box>li").each(function() {
		if($(this).attr('data-id') == imgID) {
			$(this).addClass('active').siblings('li').removeClass('active');
		}
	});
	//图片点击
	imgClick();
}

//图片点击 显示在中间canvas
var imgn = '';
function imgClick() {
	$('.img-box>li').on('click', function() {
		$(this).addClass('active').siblings('li').removeClass('active');
		var src = $(this).find('img').attr('src');

		var id = $(this).attr('data-id'); //图片id
		imgID = id;
		var channelId = $(this).attr('data-channelId'); //通道号
		trackingNumber = $(this).attr('data-trackingNumber'); //运单号
		imgn = $(this).attr('data-imgName');
		//图片base64请求
		imgBasePost(src, id, channelId, trackingNumber);
		SetlocalParam();
		StartPlayView();
		var tracking = $(this).attr('data-trackingNumber'); //运单号

		clearTagging();
			
		//通过运单号 运单信息
		trackingNumberPost(tracking);
		if($('.click-entity-shot div.shot-list-img').length > 0) {
			$(".click-entity-shot div.shot-list-img").each(function() {
				var url = $(this).find('i').attr('data-url');
				var id = $(this).find('i').attr('data-id');
				getClickImgDelete(url, id);
				$(this).remove();
			});
		}
	})
}

//点击的图片base64请求
function imgBasePost(src, id, channelId, trackingNumber) {
	$.ajax({
		type: 'get',
		url: URL + '/unpack/getBase64',
		data: {
			url: src
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(data) {
			if(data.msg = 'OK' && data.status == 200)
				$(".cb-img").attr({
					'src': 'data:image/png;base64,' + data.data, //图片流
					'data-id': id, //图片id
					'data-channelId': channelId, //通道号
					'data-trackingNumber': trackingNumber //运单号
				});
			//清除画布
			clearCanvasAll();
			//调用绘图
			draw();
		},
		error: function(data) {

		}
	});
}

/**
 *
 * 运单号
 *
 **/
//运单号页面请求
function trackingNumberPost(tracking) {
	$.ajax({
		type: 'get',
		url: URL + '/unpack/getTracking',
		data: {
			trackingNumber: tracking
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(data) {
			if(data.status == 200 && data.msg == "OK") {
				// console.log(data);
				trackingNumberHtml(data.data);
				
			}
		},
		error: function() {

		}
	})
}

//运单号页面展示
function trackingNumberHtml(data) {
	clearAll();

	$(".bi-trackingNumber").text(judgeFn(data.trackingNumber, 1)); //运单号

	$(".bi-number").text(judgeFn(data.num, 1)); //件数
	$(".bi-flightNo").text(judgeFn(data.flightNo, 1)); //航班
	//	$(".bi-check").text(judgeFn(data.verifyPerson, 1)); //安检员

	$(".bi-carrier").text(judgeFn(data.carryPerson, 1)); //承运人
	$(".bi-agent").text(judgeFn(data.proxyName, 1)); //代理人

	$(".bi-establish").text(judgeFn(data.createTime, 1)); //运单创建时间
	$(".bi-start").text(judgeFn(data.lastStartTime, 1)); //最近开始时间

	$(".bi-suspend").text(judgeFn(data.lastPauseTime, 1)); //最近暂停时间
	//最近暂停时间是否为空
	getDocumentWidth();
	var html = '';
	var imgList = judgeFn(data.pictures, 1);
	for(var i = 0; i < 9; i++) {
		if(imgList[i] != undefined && imgList.length > 0) {
			var isStatus = checkImgExists(imgList[i]);
			if(isStatus) {
				html += ' <li>' +
					'<div class="bi-img-div" >' +
					'<img style="width: 100%;" src="' + imgList[i] + '">' +
					'</div>' +
					'</li>';
			} else {
				html += ' <li>' +
					'<div class="bi-img-div" >' +
					'<img src="../../image/unpack/errorimg.png">' +
					'<p>加载失败</p>' +
					'</div>' +
					'</li>';
			}

		} else {
			html += ' <li>' +
				'<div class="bi-img-div">' +
				'<img src="../../image/unpack/beforeimg.png" >' +
				'<p>暂无图片</p>' +
				'</div>' +
				'</li>'
		}
	}
	$(".bill-img-ul").html(html);
	
}

//监听浏览器窗口发生变化
window.onresize = function() {
	getDocumentWidth();

};

function getDocumentWidth() {
	var text = $(".bi-suspend").text();
	if(text == '' || text == '暂无') {

		var documentWidth = $(document.body).width();
		if(documentWidth <= 1366) {
			$(".bt-middle-right>ul>li").css({
				textAlign: 'right',
				paddingLeft: '0'
			});
			$(".bt-middle-right>ul>li.bt-bottom").css({
				textAlign: 'left',
				paddingLeft: '3px'
			});
		}
		if(1380 <= documentWidth && documentWidth <= 1440) {
			$(".bt-middle-right>ul>li").css({
				textAlign: 'right',
				paddingLeft: '0'
			});
			$(".bt-middle-right>ul>li.bt-bottom").css({
				textAlign: 'left',
				paddingLeft: '11px'
			});
		}
		if(1580 <= documentWidth && documentWidth <= 1600) {
			$(".bt-middle-right>ul>li").css({
				textAlign: 'right',
				paddingLeft: '0'
			});
			$(".bt-middle-right>ul>li.bt-bottom").css({
				textAlign: 'left',
				paddingLeft: '33px'
			});
		}
		if(1900 <= documentWidth && documentWidth <= 1920) {
			$(".bt-middle-right>ul>li").css({
				textAlign: 'right',
				paddingLeft: '0'
			});
			$(".bt-middle-right>ul>li.bt-bottom").css({
				textAlign: 'left',
				paddingLeft: '3px'
			});
		}

	} else {
		$(".bt-bottom").css({
			textAlign: 'right',
			paddingLeft: ''
		})
	}
}

//清除运单信息
function clearAll() {
	$(".bi-trackingNumber").text('暂无'); //运单号

	$(".bi-number").text('暂无'); //件数
	$(".bi-flightNo").text('暂无'); //航班
	$(".bi-check").text('暂无'); //安检员

	$(".bi-carrier").text('暂无'); //承运人
	$(".bi-agent").text('暂无'); //代理人

	$(".bi-establish").text('暂无'); //运单创建时间
	$(".bi-start").text('暂无'); //最近开始时间
	$(".bi-suspend").text('暂无'); //最近暂停时间
}

//判断图片是否存在
function checkImgExists(imgurl) {
	var ImgObj = new Image();
	ImgObj.src = imgurl;
	//没有图片，则返回-1
	if(ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0)) {
		return true;
	} else {
		return false;
	}
}

/**
 *
 * 图片标注信息
 *
 **/
//获取焦点和失去焦点
//function imgRemarks(e, num) {
//	if(num == 1) {
//		$(e).parent().siblings('ol').show();
//		$(e).parent().parent().siblings('li').find('ol').hide();
//	} else if(num == 2) {
//		setTimeout(function() {
//			$(e).parent().siblings('ol').hide();
//		}, 200) //解决与 下拉列表点击显示在input 的冲突
//	} else if(num == 3) {
//		$(e).parent().siblings('ol').show();
//		$(e).siblings('input').focus();
//	}
//}

//获取焦点和失去焦点
function imgRemarks(e, num) {
	switch(num) {
		case 1:
			if($(e).parent().siblings('ol').css('display') == 'block') {
				$(e).parent().siblings('ol').css('display', 'none')
			} else {
				$(e).parent().siblings('ol').css('display', 'block')
			}
			break;
		case 2:
			$(e).parent().siblings('ol').css('display', 'none');
			break;
	}

}

//下拉列表点击显示在input
function selectClickFn() {
	$(".select-box").on('click', 'li', function() {
		var t = $(this).text();
		$(this).parent().siblings('div').find('input').val(t);
		$(this).addClass('active').siblings('li').removeClass('active');
		$(this).parent().hide();
	})
}

//把信息标注在canvas上面
function imgRemarksTagging() {
	var reg = /^\s+|\s+$/g //空
	console.log(reg.test(''))
	var name = $(".contraband-name").val(); //物品名称
	var num = $(".contraband-num").val(); //物品数量
	var type = $(".contraband-type").val(); //物品种类
	var handle = $(".contraband-handle").val(); //物品处理
	var textarea = $(".remark-textarea").val(); //备注
	if(name == '' || reg.test(name)) {
		return Utils.noticeModelFn($('.notice-model'), '物品名称不能为空！', 2);
	}
	if(num == '' || reg.test(num)) {
		return Utils.noticeModelFn($('.notice-model'), '物品数量不能为空！', 2);
	}
	if(type == '' || reg.test(type)) {
		return Utils.noticeModelFn($('.notice-model'), '物品种类不能为空！', 2);
	}
	if(handle == '' || reg.test(handle)) {
		return Utils.noticeModelFn($('.notice-model'), '物品处理不能为空！', 2);
	}
	var text;
	if(textarea != '') {
		text = name + '--' + type + '--' + num + '--' + handle + '--' + textarea;
	} else {
		text = name + '--' + type + '--' + num + '--' + handle;
	}
	if($('div[data-name=' + layerName + ']').length > 0) {
		$('div[data-name=' + layerName + ']').html(text);
		clearTagging();
		judge = 0;
	} else {
		Utils.noticeModelFn($('.notice-model'), '请先在图片上画选框！', 2);
	}

}

//标注上一步
function clearCanvasOne() {
	var name = json.pop(json.length - 1);
	$("#canvas1").removeLayer(name).drawLayers();
	$("[data-name='" + name + "']").remove();
	judge = 0;
}

//清空画布
function clearCanvasAll() {
	var c = document.getElementById("canvas1");
	var ctx = c.getContext("2d");
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	$(".remark-modal").remove();
	layer = 0;
	$("#canvas1").removeLayers(layerName);
	layerName = "layer";
	judge = 0;

}

//清除标注选项信息
function clearTagging() {
	$('.list-contraband input').val('');
	$(".remark-textarea").val('');
	$(".select-box>li").removeClass('active');
	$(".contraband-num").val(1);
}

/**
 *
 *摄像头拍摄图片
 *
 **/

//点击删除按钮图片删除
function cameraImgDelete() {
	$(".click-entity-shot").on('click', 'div.shot-list-img>i', function(e) {
		e.stopPropagation();
		e.preventDefault();
		var _this = $(this);
		var url = $(this).attr('data-url');
		console.log(url);
		 $.ajax({
			 	type: "post",
			 	url: URL + '/common/picDelete?timestamp=' + new Date().getTime(),
	            beforeSend: function (request) {
	                request.setRequestHeader("token", token);
	            },
	            data: encodeURI(url),
	            success: function (data) {
	                if (data.status == 200) {
	                    console.log(data);
	                	_this.parent().remove();
	                	getImgList();
	                	
	                }
	            },
	            error: function (data) {
	                // console.log(data)
	            }
	      })
	});
}
//点击中间图片时删除
function getClickImgDelete(id, url) {
	$.ajax({
		type: "post",
		url: URL + '/unpack/delGoodsPic',
		data: {
			"url": url,
			"id": id
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(data) {
			if(data.status == 200 && data.msg == 'OK') {
				// console.log(data);
			}
		},
		error: function(data) {
			// console.log(data)
		}
	})
}

//拍摄图片大图展示
function imgBigFn(e) {
	var src = $(e).attr('src');
	$(".img-big>img").attr('src', src);
	$("#imgBigBox").fadeIn();
	$("#imgBigBox").click(function(event) {
		event.stopPropagation();
		event.preventDefault();
		$(this).fadeOut();
	});
}

//点击弹出/关闭拍摄弹窗
var stateModal = true;

function cameraImgModal(num) {
	if(num == 1) {
		createFolder();
		$("#cameraShootingBox").show();
		setTimeout(function() {
			if(stateModal) {
				stateModal = false;
				getInitializeVideo(ipObj);
				
				
			}
		}, 100);
		
	} else if(num == 2) {
		$("#cameraShootingBox").fadeOut();
		OCXobj.StopPreview(oLiveView.lCounts);
	}

}

/**
 *
 * 上传所有信息信息
 *
 **/

/****************************/

var unpackedPicAccess; //canvas图片流
var unpackAccount = ''; //开包账号

/****************************/

//把路径与开包所需的上传的方法
function allUpload() {
	//图片base64
	screensShotCanvasUpload();
	setTimeout(function() {
		canvasImgUpload();

	}, 100);
	//开包所需信息

}

//把canvas截取成base64
function screensShotCanvasUpload() {
	var markedImg = document.getElementById("canvasBox");
	html2canvas(markedImg, {
		onrendered: function(canvas) {
			var imageUrl = canvas.toDataURL("image/png");
			unpackedPicAccess = imageUrl;
		}
	});
}

//先传 canvas流，获取图片路径 再上传其他信息
function canvasImgUpload() {
	var unpacked = ''; //canvas图片路径
	var fd = new FormData();
	var l = $(".remark-modal").length;
	if(l <= 0) {
		Utils.noticeModelFn($('.notice-model'), '请给图片添加标注！', 2);
		return;
	} else {
		if($(".remark-modal").text() == '') {
			Utils.noticeModelFn($('.notice-model'), '请给图片添加标注！', 2);
			return;
		}
	}
	fd.append('file', dataURItoBlob(unpackedPicAccess));
	fd.append('filePath', 'unpack/unpacked');
	$.ajax({
		type: 'post',
		url: URL + '/common/upload',
		data: fd,
		dataType: 'json',
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		processData: false, // 不会将 data 参数序列化字符串
		contentType: false, // 根据表单 input 提交的数据使用其默认的 contentType
		success: function(data) {
			if(data.status == 200 && data.msg == 'OK') {
				unpacked = data.data;
				unpackInformation(unpacked);

			}
		},
		error: function(data) {

		}
	});

}
var trackingNumber =''
//把路径与开包所需的所有信息上传
function unpackInformation(unpacked) {
	var l = $(".click-entity-shot>.shot-list-img").length;
	if(l==0){
		Utils.noticeModelFn($('.notice-model'), '先点击显示图片！', 2);
		return;
	}
	
	if(l>0 && l < 3) {
		Utils.noticeModelFn($('.notice-model'), '拍照上传的图片不得少于3张！', 2);
		return;
	}
	var channelId = $(".cb-img").attr('data-channelId');
	trackingNumber = $(".cb-img").attr('data-trackingNumber');
	var unpackVerifyPicId = $(".cb-img").attr('data-id');
	var unpackedGoods = []; //摄像头拍摄图片路径
	$(".click-entity-shot>.shot-list-img").each(function() {
		var url = $(this).find('img').attr('src');
		unpackedGoods.push(url);
	});
	var data = {
		"channelId": channelId, //通道号
		"trackingNumber": trackingNumber, //运单号
		"unpackAccount": unpackAccount, //开包账号
		// unpackChannel: unpackChannel,//开包台号
		"unpackVerifyPicId": unpackVerifyPicId, //图片ID
		"unpackedGoodsPicAccess": unpackedGoods, //监控图片数组
		"unpackedPicAccess": unpacked //canvas
	};
	$.ajax({
		type: "post",
		url: URL + "/unpack/add",
		contentType: 'application/json',
		data: JSON.stringify(data),
		dataType: 'json',
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(data) {
			if(data.status == 200 && data.msg == 'OK') {
				Utils.noticeModelFn($('.notice-model'), '上传开包信息成功！', 1);
				$("#cbImg").attr('src', '../../image/unpack/zanwei.jpg');
				clearCanvasAll();
				clearTagging();
				$(".shot-list-img").remove();
				$(".contraband-num").val(1);
				clearTrackingNumber();
				pageNum = 10;
				imgListPost(1);
			} else {
				Utils.noticeModelFn($('.notice-model'), '上传开包信息失败，请重新操作！', 2);
			}
		},
		error: function(data) {
			Utils.noticeModelFn($('.notice-model'), '上传开包信息失败，请重新操作！', 2);
		}

	})
}
//清空运单信息
function clearTrackingNumber() {
	$(".bi-trackingNumber").text('暂无'); //运单号

	$(".bi-number").text('暂无'); //件数
	$(".bi-flightNo").text('暂无'); //航班
	$(".bi-check").text('暂无'); //安检员

	$(".bi-carrier").text('暂无'); //承运人
	$(".bi-agent").text('暂无'); //代理人

	$(".bi-establish").text('暂无'); //运单创建时间
	$(".bi-start").text('暂无'); //最近开始时间

	$(".bi-suspend").text('暂无'); //最近暂停时间
	var html = '';
	for(var i = 0; i < 9; i++) {
		html += ' <li>' +
			'<div class="bi-img-div">' +
			'<img src="../../image/unpack/beforeimg.png" >' +
			'<p>暂无图片</p>' +
			'</div>' +
			'</li>'
	}
	$(".bill-img-ul").html(html);
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

		for(var i = 0; i < filePathList.length; i++) {
			fldr += filePathList[i] + '\\';
			if(filePathList.length - 1 == i) {
				folderPath = fldr;
			}
			if(!fso.FolderExists(fldr)) {
				fso.CreateFolder(fldr);
			}
		}
	} catch(err) {
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

//base64转换成blob
function dataURItoBlob(dataurl) {
	var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while(n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], {
		type: mime
	});
}

//随机数
function randomNumber() {
	return Math.floor(Math.random() * 8998) + 1000;
}

//判断参数是否为空
function judgeFn(res, num) {
	//num是否显示暂无
	var text = '暂无';
	if(res == null || res == undefined || res == '') {
		if(num == 1) {
			text = '暂无';
		} else if(num == 2) {
			text = '';
		} else {
			text = '';
		}
	} else {
		text = res;
	}

	return text;
}

/* 绘图选框 */
/********************************/

var layer = 0;
var judge = 0; //判断画了几个，一次只允许画一个
var layerName = "layer";
var json = [];

/********************************/

CanvasExt = {
	drawRect: function(canvasId, penColor, strokeWidth) {
		var that = this;
		that.penColor = penColor;
		that.penWidth = strokeWidth;

		var canvas = document.getElementById(canvasId);
		//canvas 的矩形框
		var canvasRect = canvas.getBoundingClientRect();
		//矩形框的左上角坐标
		var canvasLeft = canvasRect.left;
		var canvasTop = canvasRect.top;

		var layerIndex = layer;
		var x = 0;
		var y = 0;
		if(judge == 0) {
			//鼠标点击按下事件，画图准备
			canvas.onmousedown = function(e) {
				//设置画笔颜色和宽度
				if(judge == 0) {
					var color = that.penColor;
					var penWidth = that.penWidth;
					layerIndex++;
					layer++;
					layerName += layerIndex;
					json.push(layerName);
					x = e.clientX - canvasLeft;
					y = e.clientY - canvasTop;
					$("#" + canvasId).addLayer({
						type: 'rectangle',
						strokeStyle: color,
						strokeWidth: penWidth,
						name: layerName,
						fromCenter: false,
						x: x,
						y: y,
						width: 1,
						height: 1
					});

					$("#" + canvasId).drawLayers();
					$("#" + canvasId).saveCanvas();
					//鼠标移动事件，画图
					canvas.onmousemove = function(e) {
						if(judge == 0) {
							width = e.clientX - canvasLeft - x;
							height = e.clientY - canvasTop - y;
							$("#" + canvasId).removeLayer(layerName);
							$("#" + canvasId).addLayer({
								type: 'rectangle',
								strokeStyle: color,
								strokeWidth: penWidth,
								name: layerName,
								fromCenter: false,
								x: x,
								y: y,
								width: width,
								height: height
							});

							$("#" + canvasId).drawLayers();
						}
					}
				}
			};
			canvas.onmouseup = function(e) {
				if(judge == 0) {
					var color = that.penColor;
					var penWidth = that.penWidth;

					canvas.onmousemove = null;

					width = e.clientX - canvasLeft - x;
					height = e.clientY - canvasTop - y;

					$("#" + canvasId).removeLayer(layerName);

					$("#" + canvasId).addLayer({
						type: 'rectangle',
						strokeStyle: color,
						strokeWidth: penWidth,
						name: layerName,
						fromCenter: false,
						x: x,
						y: y,
						width: width,
						height: height
					});
					$("#" + canvasId).drawLayers();
					$("#" + canvasId).saveCanvas();

					judge = 1;
					$(".canvas-box").append("<div class='remark-modal' data-name='" + layerName + "' style='top: " + (y + height + 1) + "px;left: " + (x) + "px;width: " + (width - 2) + "px;display:block'></div>");
				}
			}
		}
	}
};

//选中图片后绘制
function draw() {
	if($("#cbImg").attr("src") != "../../image/unpack/zanwei.jpg") {
		// $("#canvas1").css("z-index","500");
		drawPen();
	} else if($("#cbImg").attr("src") == "../../image/unpack/zanwei.jpg") {
		// $("#canvas1").css("z-index","-1");
	}
}

//绘图
function drawPen() {
	var color = "red"; //#d72020
	var width = 1;
	CanvasExt.drawRect("canvas1", color, width);
}

/********************************/

var oPlugin = {}; //视频所需参数
var g_iWndIndex = 0; //可以不用设置这个变量，有窗口参数的接口中，不用传值，开发包会默认使用当前选择窗口
var ipObj = [];

/********************************/

//通过 通道号获取到改通道下的4个回放摄像头的通道号
function getCamera(channelNumber) {
	//摄像头通道
	$.ajax({
		type: 'get',
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		url: Utils.url + '/scene/getCamera?channelId=' + channelNumber + '&timestamp=' + new Date().getTime(),
		success: function(result) {
			if(result.status == 200 && result.msg == 'OK') {
				ipObj = result.data;
				loginCMS();
			}
		},
		error: function() {
			Utils.noticeModelFn($('.notice-model'), '当前通道视频获取失败!', 2);
		}
	});
}
var oLiveView = {
        szIP: "172.22.100.20", // protocol ip
        szPort: "80", // protocol port
        szName: "admin", // device username
        szPswd: "hk.201712",// device password
        lCounts: 1,//窗口数目
        CameraID: 1036,
        lIndex: 1,
    };
//初始化视频插件参数及插入插件
function getInitializeVideo(ipObj) {
	oPlugin = {
		iWidth: 600, // plugin width
		iHeight: 400 // plugin height
	};
	
	
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

	Utils.noticeModelFn($('.notice-model'), status, 2);
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

//抓图
function CapturePicture() {
    if ($('div.shot-list-img').length > 8) {
        Utils.noticeModelFn($('.notice-model'), '最多只能拍摄9张，请删除后再操作!', 2);
        return;
    }

    var dataTime = new Date().getTime();
    var szPicName = dataTime + ".jpg";
    OCXobj = document.getElementById("PreviewOcx");
    OCXobj.FireCapturePic(picList.PicPath,oLiveView.lIndex);
    var date = dateFn();
    var y = date.Y; //年
    var m = date.M; //月
    var d = date.D; //日
    infdImg = infd + "\\" + y + "-" + m + "-" + d + "\\" + dataTime + ".jpg"; //图片完整路径

    lisTall(infdImg, dataTime);
}

//拍照图片上传ftp
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
	//文件移动到ftp里面
	// infd = "C:\\Users\\YFSL\\Web Kit\\CaptureFiles\\"+y+"-"+m+"-"+d+"\\"+dataTime+".jpg";
	var f2 = fso.GetFile(infd);
	f2.Move(ftpPath + "\\" + dataTime + num + ".JPG");

	//图片位置
	var url = '\\' + cameraCapture + '\\' + channelNumber + "\\" + y + "\\" + m + "\\" + d + '\\' + dataTime + num + '.JPG';

	$.ajax({
		type: "post",
		url: URL + '/unpack/addGoodsPic',
		data: {
			url: String(url),
			timestamp: Utils.getTimeByTimestamp(String(dataTime))
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(data) {
			if(data.status == 200 && data.msg == 'OK') {
				if(data.data.access == null || data.data.access == undefined || data.data.access == '') {} else {
					var imgUrl = data.data.access;
					var html = '<div class="shot-list-img" >' +
						'<img onclick="imgBigFn(this)" src="' + imgUrl + '" alt="">' +
						'<i data-id="' + data.data.id + '" data-url="' + imgUrl + '" class="img-close-icon"></i>' +
						'</div>';
					$('.click-entity-shot').append(html);
				}
			}
		},
		error: function(data) {
			console.log(data)
		}
	})
}

//验证弹窗
function verifyFrom(e) {
	$(e).parent().find('span.error-hint-text').hide();
	$(e).css('border-color', '#dcdfe6');
}

//提交弹窗
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
		url: Utils.url + "/changePassword?oldPassword=" + oldPsd + "&newPassword=" + newPsd + "&newPassword1=" + againPsd + "&userId=" + JSON.parse(sessionStorage.getItem('data')).userId + "&timestamp=" + new Date().getTime(),
		async: true,
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			// console.log(result)
			if(Number(result.status) == 200) {
				Utils.noticeModelFn($('#loginHint'), "更改密码成功！", 1)
				$("#oldPsd").val("");
				$("#newPsd").val("");
				$("#againPsd").val("");
				$('.add-order').hide()
				setTimeout(function() {
					loginout()
				}, 200)
			} else {

			}
		}
	});
}

//登出
function loginout() {
    var userId = JSON.parse(sessionStorage.getItem('data')).userId;
	var self = this;
	$.ajax({
		type: "get",
		url: Utils.url + "/shrio/logout?userId=" + userId + "&timestamp=" + new Date().getTime(),
		async: true,
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			// console.log(result)
			if(Number(result.status) == 200) {
				location.href = "login.html"
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

//监听点击空白地区下拉收起
$(document).on('click', function(e) {

	if($(e.target).parents('.contraband-name-div').length <= 0) {
		$('.name-list').css('display', 'none')
	}
	if($(e.target).parents('.contraband-type-div').length <= 0) {
		$('.type-list').css('display', 'none')
	}
	if($(e.target).parents('.contraband-handle-div').length <= 0) {
		$('.handle-list').css('display', 'none')
	}
	   console.log("123123")
});


/*****同步登录CMS******/
function loginCMS() {
    /*var oLiveView = {
        szIP: "172.22.100.20", // protocol ip
        szPort: "80", // protocol port
        szName: "admin", // device username
        szPswd: "hk.201712", // device password
        lCounts:1,//窗口数目	
    };*/

    OCXobj = document.getElementById("PreviewOcx");

    var result = OCXobj.SetLoginType(1);    // 设置同步登入模式
    var ret = OCXobj.Login(oLiveView.szIP, oLiveView.szPort, oLiveView.szName, oLiveView.szPswd);
    switch (ret) {
        case 0:
            //initCameraList();
            //initTree();
            //clearTree();
            //alert("同步登录成功！");
            console.log("同步登录成功")
            
            OCXobj.SetWndNum(oLiveView.lCounts);
            console.log(trackingNumber)
            setTimeout(function(){
            	 //SetlocalParam();
            	 //StartPlayView();
            	
            },300)
            //showMethodInvokedInfo("同步Login,GetResourceInfo 接口调用成功！");
            break;
        case -1:
            //clearTree();
            console.log("同步登录失败！");
            
            showMethodInvokedInfo("同步Login接口调用失败！错误码：" + OCXobj.GetLastError());
            break;
        default:
            break;
    }

}
var OCXobj;

function StartPlayView() {
    OCXobj = document.getElementById("PreviewOcx");
    // CameraID = document.getElementById("TextCameraId").value;/
    oLiveView.CameraID = 1036;
   /* if (!(parseInt(CameraID) >= 1 && parseInt(CameraID) <= 2147483647)) {
        showMethodInvokedInfo("CameraID介于1到2147483647之间！");
        return;
    }*/
    //if(""==CameraID){
    //	alert("请选择一个监控点！");
    //	return;
    //}
    // if (CameraID.length == 0 || isNaN(CameraID) || "" == CameraID) {
    //     showMethodInvokedInfo("请选择监控点，且监控点必须是一个整数！");
    //     //alert("必须是一个整数.");
    //     return;
    // }
    var ret = OCXobj.StartTask_Preview(oLiveView.CameraID);
    //var ret1 = OCXobj.StartFreeWndByIndexCode("076a48e02668446d90ecfe54c1cab3af");
    switch (ret) {
        case 0:
            //showMethodInvokedInfo("StartTask_Preview接口调用成功！");
           
            break;
        case -1:
            showMethodInvokedInfo("StartTask_Preview接口调用失败！错误码：" + OCXobj.GetLastError());
            break;
        default:
            break;
    }
}
function showMethodInvokedInfo(msg) {
    Utils.noticeModelFn($('.notice-model'), msg, 2);
}
function clearTree() {
    //var OCXobj = document.getElementById("PreviewOcx");
    $("#tree").html("");
}
var picList;
//设置截图参数
var imgL = '';
function SetlocalParam() {
	
	var date = dateFn();
    var y = date.Y; //年
    var m = date.M; //月
    var d = date.D; //日
    picList = {
        PicType: 0,//0：jpg 1：bmp
        PicPath: "Z:\\ftp\\" + cameraCapture + '\\' + channelNumber + "\\" + y + "\\" + m + "\\" + d + "\\" + trackingNumber + "\\" + imgn,//路径
        PicCapType: 0,//按时间 按帧
        PicSpanTime: 1,//抓图时间间隔,单位(ms)
        PicCounts: 1//抓图张数
    };
    imgL = "%5C"+cameraCapture + '%5C' + channelNumber + "%5C" + y + "%5C" + m + "%5C" + d + "%5C" + trackingNumber + "%5C" + imgn;
    //console.log(picList.PicPath);
    //0 C:\CapPic 0 1 1
    //console.log(PicType, PicPath, PicCapType, PicSpanTime, PicCounts, RecordType, MaxRecordTimes, RecordTimes, RecordPath, RecordSize)
    OCXobj = document.getElementById("PreviewOcx");

    //设置图片保存路径和格式
    if (picList.PicCapType == 0) {
        var iRet = OCXobj.SetCaptureParam(picList.PicType, picList.PicPath, picList.PicCapType, picList.PicSpanTime, picList.PicCounts);
        switch (iRet) {
            case -1:
                showMethodInvokedInfo("SetCaptureParam接口调用失败！错误码：" + OCXobj.GetLastError());
                break;
            case 0:
                //showMethodInvokedInfo("SetCaptureParam接口调用成功！");
                break;
            default:
                break;
        }
    }
}

//拍照图片获取
function getImgList() {
	if(trackingNumber == ''){
		return showMethodInvokedInfo("请先选择上面图片列表中的一张！");
	}
	if(imgn == ''){
		return showMethodInvokedInfo("请先选择上面图片列表中的一张！");
	}
    $.ajax({
        type: 'get',
        url: ' /common/picScan?route='+imgL+'&timestamp=' + new Date().getTime(),
        beforeSend: function (request) {
            request.setRequestHeader("token", token);
        },
        success: function (data) {
        	console.log(data);
        	if(data.status == 200){
        		imgListData(data.data);
        	}
        },
        error: function () {

        }
    })
}

//图片
function imgListData(list) {
    if (list.length <= 0) {
        return
    }
    var html = '<div class="shot-list-img-first" onclick="getImgList()" style="font-weight: bold;font-size: 14px;border: 1px solid #62a8ea">' +
    '<div style="width: 80%;position: absolute;top: 50%;left: 50%;transform: translate(-50%,-50%);text-align: center;color: #62a8ea;">' +
    '点击显示<br>' +
    '拍摄图片' +
    '</div>' +
    '</div>';
    for (var i = 0; i < list.length; i++) {
        html += '<div class="shot-list-img">' +
            '<img onclick="imgBigFn(this)" src="' + list[i] + '" alt="">' +
            '<i data-id="" data-url="' + list[i] + '" class="img-close-icon"></i>' +
            '</div>'
    }
    $('.click-entity-shot').html(html);
}