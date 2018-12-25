var allMenu = [];
var isColor = false;
$(function() {
	var setTimeoutLoing;
	$('#cardID').bind('input propertychange', function() {
		window.clearTimeout(setTimeoutLoing);
		setTimeoutLoing = setTimeout(function() {
			slotCardLogin($('#cardID').val());
		}, 100)
	});

	$('#pwd').bind('keypress', function(event) {
		if(event.keyCode == "13") {
			accountNumberLoing()
		}
	})

})

/*
 * 刷卡登录
 * */
function slotCardLogin(pwd) {
	if(pwd == '') {
		Utils.noticeModelFn($('#loginHint'), '请输入卡号或者刷卡登录！', 2);
	}
	$.ajax({
		type: "post",
		url: Utils.url + '/cardLogin?cardId=' + pwd + '&timestamp=' + new Date().getTime(),
		xhrFields: {
			withCredentials: true
		},
		headers: {
			'Content-Type': 'application/json; charset=UTF-8'
		},
		success: function(result) {
			if(Number(result.status) == 200) {

				if(result.data.info.roleName == '货代录入员') {
					sessionStorage.setItem('userName', result.data.info.userName);
					sessionStorage.setItem('userData', JSON.stringify(result.data.info));
					sessionStorage.setItem('token', result.data.token)
					window.location.href = 'waybill-entering.html'
				} else {
					if(result.data.info.userId == 'admin') {
						sessionStorage.setItem('userName', result.data.info.userName);
						sessionStorage.setItem('userData', JSON.stringify(result.data.info));
						sessionStorage.setItem('token', result.data.token)
						window.location.href = '../../page/Administrator/livemonitoring.html?flag=1&index=1'
					} else {
						Utils.noticeModelFn($('#loginHint'), '无权限登录！', 2);
					}
				}

			} else {
				Utils.noticeModelFn($('#loginHint'), result.msg + "！", 2);
				// Utils.noticeModelFn($('#loginHint'), '登录失败，请重新输入！', 2);

			}
		},
		error: function() {

		}
	});
}

/*
 *账号登录
 * */
function accountNumberLoing() {
	var userName = $('#userName').val();
	if(userName == '') {
		Utils.noticeModelFn($('#loginHint'), '请输入用户名！', 2);
		return;
	}
	var pwd = $('#pwd').val();
	if(pwd == '') {
		Utils.noticeModelFn($('#loginHint'), '请输入密码！', 2);
		return;
	}
	var data = {
		userId: userName,
		password: pwd
	}
	$.ajax({
		type: "post",
		url: Utils.url + '/acountLogin?timestamp=' + new Date().getTime(),
		xhrFields: {
			withCredentials: true
		},
		headers: {
			'Content-Type': 'application/json; charset=UTF-8'
		},
		data: JSON.stringify(data),
		success: function(result) {
			if(Number(result.status) == 200) {
				// console.log(result.data.roleName)
				if(result.data.info.roleName == '货代录入员') {
					sessionStorage.setItem('userName', result.data.info.userName);
					sessionStorage.setItem('userData', JSON.stringify(result.data.info));
					sessionStorage.setItem('token', result.data.token)
					window.location.href = 'waybill-entering.html'
				} else {
					if(result.data.info.userId == 'admin') {
						sessionStorage.setItem('userName', result.data.info.userName);
						sessionStorage.setItem('userData', JSON.stringify(result.data.info));
						sessionStorage.setItem('token', result.data.token)
						window.location.href = '../../page/Administrator/livemonitoring.html?flag=1&index=1'
					} else {
						Utils.noticeModelFn($('#loginHint'), '无权限登录！', 2);
					}

				}

			} else {
				// Utils.noticeModelFn($('#loginHint'),"登录失败，请重新输入！！",2);
				Utils.noticeModelFn($('#loginHint'), result.msg + "！", 2);
			}
		},
		error: function(result) {
			if(result.status == 404) {
				Utils.noticeModelFn($('#loginHint'), '登录失败，请重新输入！', 2);
			}
		}
	});

}

function loginCut(e, flag) {
	$(e).parent().find('div').removeClass('active');
	$(e).addClass('active');
	if(flag == 1) {
		//		/账号登录
		$('.face-login').hide();
		$('.slot-card-login').hide();
		$('.account-number-login').show();

		$('.numbericon').attr('src', '../../image/login/loginicon2_.png')

		//		$('.input-col').children('i').css('display','none')
		$('.input-col').children('input').removeClass('error')

		$('input').val('')
		$('.error-text').hide()

	} else if(flag == 2) {
		//人脸登录
		$('.face-login').show();
		$('.slot-card-login').hide();
		$('.account-number-login').hide();
		//				cameraTake();
	} else {
		//刷卡登录
		$('.face-login').hide();
		$('.account-number-login').hide();
		$('.slot-card-login').show();
		$('#cardID').focus();

		$('#cardID').addClass('green')

		//		$('.input-col').children('i').css('display','none')
		$('.input-col').children('input').removeClass('error')

		$('.numbericon').attr('src', '../../image/login/loginicon2.png')
		$('.input-col').children('input').addClass('default')
		$('#cardID').removeClass('default')
	}
}

//window.location.href= '../../lib/js/jscam_canvas_only.swf'

function showicon(e, flag) {
	if(isColor == true) {
		isColor = false;
	} else {
		$(e).removeClass('error')
		$(e).addClass('green')
		if($(e).val() !== "") {

			$(e).siblings('.error-text').hide()

			//		$('.check-icon').show()
			//		$('.close-icon').hide()

		} else {

			$(e).siblings('.error-text').show()
			$(e).siblings('.error-text').css('display', 'block')
			//		$('.check-icon').hide()
			//		$('.close-icon').show()
			$(e).addClass('error')
			isColor = false;

		}
	}

}

function changeColor(e) {
	if($(e).siblings('span').css('display') == 'block') {

	} else {
		$(e).removeClass('error');
		$(e).addClass('green')
		//	    $(e).siblings('i').hide()
		$(e).removeClass('default');
		isColor = true;
	}

}