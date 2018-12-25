var token = sessionStorage.getItem('userData');
$(function() {
	//
	flagUrl = Utils.getParaVal('flag');
	indexUrl = Utils.getParaVal('index');

	// var userData = JSON.parse(sessionStorage.getItem('userData'));
	// $('.username>span').text( userData.userName);

	//监听浏览器窗口发生变化
	selectUlWidth();

	//状态选择
	stateActive();

	//搜索回车
	keyDownSearchFn();

	//运单查询列表
	upLoadPost();
	// waybillQueryListPost();

	//通道号请求
	getALLChannelAgentPost('/channel/getALlChannelId');
	//代理人
	getALLChannelAgentPost('/comprehensiveQuery/getProxyPerson');

	//时间
	laydate.render({
		elem: '#screenTime',
		theme: "#62a8ea",
		eventElem: '.time-span',
		max: Utils.getTimeByTimestamp(String(new Date().getTime())),
		done: function(value, date) {
			$('.time-span').text('');
			upLoadPost();

		}
	});

});

//监听浏览器窗口发生变化
window.onresize = function() {
	selectUlWidth();
	tipTitle();
};

//监听点击空白地区下拉收起
$(document).on('click', function(e) {
	if($(e.target).parents('.selectG-box').length <= 0) {
		$(".selectG-box>.pop-ul").hide();
		$(".ChannelSelect").css({
			'border-color': '#ddd'
		})
	}
	if($(e.target).parents('.selectR-box').length <= 0) {
		$(".selectR-box>.pop-ul").hide();

		$(".RoleSelect").css({
			'border-color': '#ddd'
		})
	}
});

//下拉选框的宽度
function selectUlWidth() {
	var width1 = $(".selectR-box>.pop-select").width();
	$(".selectR-box>.pop-ul").width(width1);
	var width = $(".selectG-box>.pop-select").width();
	$(".selectG-box>.pop-ul").width(width);
}

function addBorder(e) {
	$(e).css('border-color', 'rgb(98, 168, 234)')
}

function removeBorder(e) {
	$(e).css('border-color', 'rgb(221, 221, 221)')
}

//下拉操作
function selectUlDown(e, num) {
	var _this = $(e);
	_this.css({
		'border-color': 'rgb(98, 168, 234)'
	});
	_this.parent().find('.pop-ul').show();
	_this.parent().find('.pop-ul>li').click(function() {
		var t = $(this).text();
		_this.find('input').val(t);
		_this.parent().find('.pop-ul').hide();
		upLoadPost();
	});
	if(num == 1) {
		$(".selectG-box>.pop-ul").hide();
	} else if(num == 2) {
		$(".selectR-box>.pop-ul").hide();
	}
}

// 状态选择
function stateActive() {
	$(".state-list>span").click(function() {
		$(this).addClass('state-active').siblings('span').removeClass('state-active');
		$(this).animate({
			'width': '84px'
		});
		$(this).find('i').animate({
			opacity: 1
		});
		$(this).siblings('span').animate({
			'width': '64px'
		});
		$(this).siblings('span').find('i').animate({
			opacity: 0
		});
		upLoadPost();
	})
}

//hover时提示框
function tipTitle() {
	$('.just-tooltip').remove();
	$("#tableBox").bind('mouseover').on('mouseover', 'td:not(".channelIP")', function(event) {
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
	});
	$(".tip-box").bind('mouseover').on('mouseover', function(event) {
		// $('.just-tooltip').remove();
		var className = $(this).parent().attr('class');
		if(className == 'channelIP') {
			var _this = $(this);
			_this.justToolsTip({
				events: event,
				width: this.offsetWidth,
				contents: $(this).text(),
				gravity: 'top'
			});
		}
	});
}

/******************************/

var flagUrl = '';
var indexUrl = '';
var pageNum = 1; //页数
var pageSize = 20; //每页数据条数
var totalNum = 0; //总条数
var pageCount = 1; //总页数

/******************************/

//获取运单列表请求
function waybillQueryListPost() {
	$("#tbodyBox").html('');
	$.ajax({
		type: 'get',
		url: Utils.url + "/comprehensiveQuery/getComprehensiveOrderByCondition", //防止在IE下的缓存,
		data: {
			pageNum: pageNum,
			pageSize: pageSize,
			timestamp: new Date().getTime()
		},
		success: function(data) {
			if(data.status == 200 && data.msg == 'OK') {

				waybillQueryListHtml(data.data.list);
				totalNum = data.data.total;
				pageCount = Math.ceil(totalNum / pageSize);
				$(".total-num").html('共' + totalNum + '项');

				//翻页
				cutPage(pageCount, pageNum);
				setTimeout(function() {
					$('.el-loading-mask').hide()
				}, 300)
				//              $('.el-loading-mask').hide();
			}
		}
	})
}
//运单查询列表数据展示
function waybillQueryListHtml(list) {
	var html = '';

	for(var i = 0; i < list.length; i++) {
		var createTime = Utils.getTimeByTimestamp(String(list[i].createTime));
		var startTime = Utils.getTimeByTimestamp(String(list[i].startTime));
		var endTime = Utils.getTimeByTimestamp(String(list[i].endTime));
		var text = '';
		var className = '';
		if(list[i].isUnpack == 0) {
			text = '未开包';
			className = 'unnormal';
		} else {
			text = '已开包';
			className = 'normal';
		}
		html += '<tr >' +
			'<td>' + list[i].channelId + '</td>' +
			'<td class="channelIP" width="13%">' +
			'<span class="tip-box">' + judgeAll(list[i].orderId) + '</span>' +
			'<span class="' + className + '">' + text + '</span>' +
			'</td>' +
			'<td>' + judgeAll(list[i].flightId) + '</td>' +
			'<td width="5%">' + judgeAll(list[i].num) + '</td>' +
			'<td width="10%">' + judgeAll(list[i].carryPerson) + '</td>' +
			'<td width="10%" class="demoStyle3">' + judgeAll(list[i].proxyName) + '</td>' +
			'<td>' + judgeAll(list[i].checkPerson) + '</td>' +
			'<td width="10%">' + judgeAll(list[i].proxyName) + '</td>' +
			'</tr>'
	}
	$("#tbodyBox").html(html);

	//hover时提示框
	tipTitle();
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
//翻页
function cutPage(pageCount, current) {
	$("#paging").CreatePage({
		pageCount: pageCount, //总页数
		current: current, //当前页码
		backFn: function(page) {
			//page:点击时返回的点击的页码，拿到该页码过后执行翻页的逻辑操作
			pageNum = page;
			upLoadPost()
		}
	});
}
//通道号请求
function getALLChannelAgentPost(URL) {
	$.ajax({
		type: 'get',
		url: Utils.url + URL,

		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(data) {
			// if(data.status == 200 && data.msg == 'OK'){
			if(URL == '/comprehensiveQuery/getProxyPerson') {
				// 代理人
				getALLChannelAgentHtml(data, $("#agentList"));
			} else {
				// 通道号
				getALLChannelAgentHtml(data, $("#channelList"));
			}
			// }

		}
	})
}

// 代理人/通道号 下拉窗口数据页面展示
function getALLChannelAgentHtml(list, con) {
	var html = '<li>全部</li>';
	for(var i = 0; i < list.length; i++) {
		html += '<li>' + list[i] + '</li>'
	}
	con.html(html);
}

//搜索
function getSearchFn() {
	upLoadPost();
}
//搜索回车
function keyDownSearchFn() {
	$(".input-search").on('keydown', function(e) {
		if(e.keyCode == 13) {
			upLoadPost();
		}
	});
}

//时间选择后搜索
function getCloseTime() {

	$("#screenTime").val('');
	$('.time-span').text('请选择日期');
	upLoadPost();
}
//搜索所需参数
function upLoadPost() {
	var textSpan = $(".state-list>span.state-active>a").html();
	var isUnpack;
	var createTime;
	var proxyName;
	var channelId;
	var condition;

	if(textSpan == '全部') {
		isUnpack = '';
	} else if(textSpan == '未开包') {
		isUnpack = '0';
	} else if(textSpan == '已开包') {
		isUnpack = '1';
	}
	if($("#screenTime").val() != '') { //时间
		createTime = $("#screenTime").val();
	} else {
		createTime = '';
	}
	if($("#channelPeople").val() != '') { //代理人
		proxyName = $("#channelPeople").val();
	} else {
		proxyName = '';
	}
	if($("#channelPeople1").val() != '') { //通道
		channelId = $("#channelPeople1").val();
	} else {
		channelId = '';
	}
	if($(".input-search").val() != '') { //搜索
		condition = $(".input-search").val();
	} else {
		condition = '';
	}
	var obj = {
		pageNum: pageNum,
		pageSize: pageSize,
		isUnpack: isUnpack,
		createTime: createTime,
		proxyName: proxyName,
		channelId: channelId,
		condition: condition,
		timestamp: new Date().getTime()
	};
	if(obj.isUnpack == '') {
		delete obj.isUnpack
	}
	if(obj.createTime == '') {
		delete obj.createTime
	}
	if(obj.proxyName == '' || obj.proxyName == '全部') {
		delete obj.proxyName
	}
	if(obj.channelId == '' || obj.channelId == '全部') {
		delete obj.channelId
	}
	if(obj.condition == '') {
		delete obj.condition
	}
	$.ajax({
		type: 'get',
		url: Utils.url + '/comprehensiveQuery/getComprehensiveOrderByCondition',
		data: obj,

		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(data) {
			if(data.status == 200 && data.msg == 'OK') {
				if(data.data.list.length > 0) {
					$('.table-title').css('display', '')
					$('.table-container').css('background', '#ffffff')

				} else {
					$('.table-title').css('display', 'none')
					$('.table-container').css('background', 'url(../../image/empty.png) 50% #ffffff no-repeat')

				}
				waybillQueryListHtml(data.data.list);
				totalNum = data.data.total;
				pageCount = Math.ceil(totalNum / pageSize);
				$(".total-num").html('共' + totalNum + '项');
				//翻页
				cutPage(pageCount, pageNum);
			} else {
				Utils.noticeModelFn($('.notice-model'), '请求失败，请重新操作！', 2)
			}
		},
		error: function() {
			Utils.noticeModelFn($('.notice-model'), '请求失败，请重新操作！', 2)
		}
	});
	getOrderStastics(obj);
}
//跳转到详情
function getLocationHref(e) {
	var orderId = $(e).attr('data-orderId');
	var channelId = $(e).attr('data-channelId');
	$("#screenTime").val('');
	window.location = 'comprehensiveQueryTable.html?flag=' + flagUrl + '&index=' + indexUrl + '&orderId=' + orderId + '&channelId=' + channelId + "&userData=" + encodeURI(JSON.stringify(sessionStorage.getItem('userData')), "UTF-8");
}
//统计
function getOrderStastics(obj) {
	// /comprehensiveQuery/getOrderStastics
	$.ajax({
		type: 'get',
		url: Utils.url + '/comprehensiveQuery/getOrderStastics',
		data: obj,

		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(data) {
			if(data.status == 200 && data.msg == 'OK') {
				// console.log(data);
				$(".order-total").html(data.data.orderTotal);
				$(".cargo-total").html(data.data.cargoTotal);
				$(".unpakc-order-total").html(data.data.unpakcOrderTotal);
			} else {
				Utils.noticeModelFn($('.notice-model'), '请求失败，请重新操作！', 2)
			}
		},
		error: function() {
			Utils.noticeModelFn($('.notice-model'), '请求失败，请重新操作！', 2)
		}
	})
}