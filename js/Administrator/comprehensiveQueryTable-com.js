var userData;
var rights = [];
var allMenu = [];
var loginFLag;
var token = sessionStorage.getItem('token');

$(function() {
	$('.pop-input').bind('focus', function(e) {
		$(this).css('border', '1px solid rgb(98, 168, 234)')
	})
	$('.pop-input').bind('blur', function(e) {
		$(this).css('border', '1px solid #dcdfe6')
	})

	$('input').attr('autocomplete', 'off');
	$('#headerMenu').html(getHeaderMenu())
	userData = JSON.parse(sessionStorage.getItem('userData')); //用户成功登陆信息
	//	userData = JSON.parse(JSON.parse(Utils.getParaVal('userData')));

	//  alert(userData.userName)
	//  var userData = JSON.parse(sessionStorage.getItem('userData'));
	$('.username>span').text(userData.userName);
	loginFLag = sessionStorage.getItem('loginFLag');

	getAllRoleRight();
	//	fullScreen()

})

function getAllRoleRight() {
	var self = this;
	$.ajax({
		type: "get",
		url: Utils.url + '/permission/getPagePermissionByRoleName?roleName=' + encodeURI(userData.roleName, 'UTF-8') + '&timestamp=' + new Date().getTime(),
		async: true,
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(result) {
			if(result.length > 0) {
				for(var i = 0; i < result.length; i++) {
					//rights[i] = result[i].name
					allMenu.push(result[i].name);
				}
				handleMenu();
			}
		}
	});
}

function handleMenu() {
	//	getMenu()
	$('#menuList').html(getMenu());
	var lengs = $('.menu-ul>li').length;

	var falg = 0;
	$('#layoutMenu1').find('li').each(function() {
		var menuName = $(this).find('a').text();
		if(allMenu.indexOf(menuName) >= 0) {
			$(this).show();
			falg++;
		} else {
			$(this).css('display', 'none');

		}
	})
	if(falg <= 0) {
		$('ul.menu-ul>li:last-child').hide();
	} else {
		$('ul.menu-ul>li:last-child').show();
	}

	var flag = Utils.getParaVal('flag') ? Utils.getParaVal('flag') : 1;
	var index = Utils.getParaVal('index') ? Utils.getParaVal('index') : 1;
	$('ul.menu-ul>li').find('ul.yfsl-menu-sub').removeClass('in');
	var className = flag == 1 ? 'live-monitoring' : ((flag == 2) ? 'comprehensive-query' : 'system-setting');
	$('ul.menu-ul>li[data-flag="' + flag + '"]').find('ul').addClass('in');
	$('ul.menu-ul>li[data-flag="' + flag + '"]').addClass('is-open');
	var $ul = $('ul.menu-ul>li[data-flag="' + flag + '"]').find('ul');
	$($ul).find('li[data-index="' + index + '"]').find('a').addClass('active');

	if(index == 9) {
		$('ul.menu-ul>li').find('ul.yfsl-menu-sub').removeClass('in');
		$('ul.menu-ul>li').removeClass('is-open');
	}
	if(loginFLag !== null) {
		if(loginFLag == 'false') {
			gotoPage();
		} else {

		}
	}

}

function getMenu() {
	var html = [];
	html.push('<ul class="menu-ul">');
	if(allMenu.indexOf('现场情况监控') >= 0) {
		html.push('<li style="display:block" class="live-monitoring" data-flag="1">');
	} else {
		html.push('<li style="display:none;" data-flag="1">');
	}
	html.push('<a data-toggle="collapse" href="#layoutMenu">');
	html.push('<i class="icon wb-desktop"></i>');
	html.push('<span class="yfsl-menu-title">监控管理</span>');
	html.push('<span class="yfsl-menu-arrow ion-ios-arrow-right"></span>');
	html.push('</a>');
	html.push('<ul class="yfsl-menu-sub collapse" id="layoutMenu">');

	html.push('<li style="display:block" data-index="1">');
	html.push('<a href="livemonitoring.html?flag=1&index=1" >现场情况监控</a>');
	html.push('</li>');
	html.push('<li style="display:block" data-index="2">');
	html.push('<a href="channelStatusMonitoring.html?flag=1&index=2" >通道状态监控</a>');
	html.push('</li>');
	html.push('</ul>');
	html.push('</li>');

	if(allMenu.indexOf('运单综合查询') >= 0) {
		html.push('<li style="display:block" class="comprehensive-query" data-flag="2">');
	} else {
		html.push('<li style="display:none;" data-flag="2">');
	}
	html.push('<a data-toggle="collapse" href="#layoutMenu2">');
	html.push('<i class="icon wb-search "></i>');
	html.push('<span class="yfsl-menu-title">综合查询</span>');
	html.push('<span class="yfsl-menu-arrow ion-ios-arrow-right"></span>');
	html.push('</a>');

	html.push('<ul class="yfsl-menu-sub collapse" id="layoutMenu2">');
	html.push('<li style="display:block" data-index="1"><a href="comprehensiveQuery.html?flag=2&index=1">运单综合查询</a></li>');
	html.push('<li style="display:block" data-index="2"><a href="comprehensiveChannelAanalysis.html?flag=2&index=2">通道分析统计</a></li>');
	html.push('</ul>');
	html.push('</li>');

	html.push('<li style="display:block" class="system-setting " data-flag="3">');
	html.push('<a data-toggle="collapse" href="#layoutMenu1">');
	html.push('<i class="icon fa-cog"></i>');
	html.push('<span class="yfsl-menu-title">系统设置</span>');
	html.push('<span class="yfsl-menu-arrow ion-ios-arrow-right"></span>');
	html.push('</a>');

	html.push('<ul class="yfsl-menu-sub collapse" id="layoutMenu1">');
	html.push('<li style="display:block" data-index="1"><a href="personalManage.html?flag=3&index=1" >人员管理</a></li>');
	html.push('<li style="display:block" data-index="2"><a href="channelManage.html?flag=3&index=2">通道管理</a></li>');
	html.push('<li style="display:block" data-index="3"><a href="deviceManage.html?flag=3&index=3" >设备管理</a></li>');
	html.push('<li style="display:block" data-index="4"><a href="roleManage.html?flag=3&index=4" >角色管理</a></li>');
	html.push('<li style="display:block" data-index="5"><a href="rightManage.html?flag=3&index=5" >权限管理</a></li>');
	html.push('<li style="display:block" data-index="6"><a href="departManage.html?flag=3&index=6" >部门管理</a></li>');
	html.push('<li style="display:block" data-index="7"><a href="consignorManage.html?flag=3&index=7" >货代管理</a></li>');
	html.push('<li style="display:block" data-index="8"><a href="parameter.html?flag=3&index=8">一般参数</a></li>');
	html.push('</ul>');
	html.push('</li>');
	html.push('</ul>');

	return html.join('');
}

//获得头部内容
function getHeaderMenu() {
	var html = [];
	html.push('<span class="setting" style="margin-right:40px" onclick="toSetting()"><i class="icon wb-user"></i>个人设置</span>')
	html.push('<span class="username" onclick="openExit()"><i class="icon fa-sign-out"></i><span>用户名</span></span>')
	//	if(JSON.parse(sessionStorage.getItem('userData')).roleName=="管理员"){
	//		html.push('<span class="change"><i class="icon fa-retweet"></i><span>切换至开包员界面</span></span>')
	//	}else{
	//		html.push('<span class="change"><i class="icon fa-retweet"></i><span>切换至管理员界面</span></span>')
	//	}

	return html.join('')
}

//退出弹框
function openExit() {
	$(".exit").show()
}
//goto个人设置
function toSetting() {
	// location.href = "../../page/Administrator/userSetting.html?index=9"
	window.location.href = "userSetting.html?index=9"
}
//登出
function loginout() {
	var self = this;
	$.ajax({
		type: "get",
		url: Utils.url + "/shrio/logout?timestamp=" + new Date().getTime(),
		async: true,
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			if(Number(result.status) == 200) {
				sessionStorage.removeItem('loginFLag');
				location.href = "login.html"
			} else {

			}
		}
	});
}

//添加气泡title
function addTitle() {
	$("td.td-icon>i").mouseover(function(event) {
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

function gotoPage() {
	var forFlag = false;
	var gotourl;
	for(var i = 1; i <= $('.menu-ul>li').length; i++) {
		if($('.menu-ul>li:nth-child(' + i + ')').css('display') == 'none') {

		} else {
			for(var j = 1; j <= $('.menu-ul>li:nth-child(' + i + ')').find('ul>li').length; j++) {
				if($('.menu-ul>li:nth-child(' + i + ')').find('ul>li:nth-child(' + j + ')').css('display') == 'none') {} else {
					forFlag = true;
					gotourl = $('.menu-ul>li:nth-child(' + i + ')').find('ul>li:nth-child(' + j + ') a').attr('href');
					sessionStorage.setItem('loginFLag', 'true');

					break;
				}

			}

		}
		if(forFlag == true) {
			sessionStorage.removeItem('loginFLag');
			window.location.href = gotourl;
			return;
		}

	}
}

function verifyFrom(e) {

	$(e).parent().find('span.error-hint-text').hide();
	$(e).css('border-color', '#dcdfe6');
}

//空格验证+样式
function verifyEvery(e) {
	verifyFrom(e)
	$(e).val($(e).val().replace(/^\s+|\s+$/g, ''))
}

//10个中英文字符
function verifyCount(e) {

}

//限制20个字符
function verifyTwen(e, num) {
	verifyEvery(e);
	var reg = '/^[1-' + num + ']*$/'
	$(e).val($(e).val().replace(reg, ''))

}

function verifyNumE(e) {
	$(e).val($(e).val().replace(/[^0-9a-zA-Z]/g, ""));
}

//只能输入数字
function verifyNum(e) {
	verifyFrom(e)
	$(e).val($(e).val().replace(/[^0-9]/g, ""));
	$(e).val($(e).val().replace(/^\s+|\s+$/g, ''))
}
//只能输入数字和-
function verifyNumSpecial(e) {
	verifyFrom(e)
	$(e).val($(e).val().replace(/[^0-9-]/g, ""));
	$(e).val($(e).val().replace(/^\s+|\s+$/g, ''))
}

//只能输入中文，英文
function verifyCnEn(e) {
	verifyFrom(e)
	//	$(e).val($(e).val().replace(/[^\u4E00-\u9FA5A-Za-z]/g, ''))
	$(e).val($(e).val().replace(/[^\a-\z\A-\Z\u4E00-\u9FA5]/g, ""));

}

//IP输入的限制
function verifyIP(ip) {
	var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
	// var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
	//  $(e).val($(e).val().replace(reg,""));
	return reg.test(ip);
}

function verifyip(e) {
	verifyFrom(e)
	//	var reg=/\d{0,3}\.\d{0,3}\.\d{0,3}\.\d{0,3}/g 
	//	$(e).val($(e).val().replace(reg, ""));
	$(e).val($(e).val().replace(/[^0-9.]/g, ""));
	$(e).val($(e).val().replace(/^\s+|\s+$/g, ''))

}

//function fullScreen() {
//	var el = document.documentElement;
//	var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
//	if(typeof rfs != "undefined" && rfs) {
//		rfs.call(el);
//	};
//	return;
//}