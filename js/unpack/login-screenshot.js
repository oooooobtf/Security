var isColor = false;
var timer;
var isAcountLogin = false;
$(function() {
	var setTimeoutLoing;
	$('#cardID').focus();
	$('#cardID').bind('input propertychange', function() {
		window.clearTimeout(setTimeoutLoing);
		setTimeoutLoing = setTimeout(function() {
			slotCardLogin($('#cardID').val());
		}, 100)
	})
	cameraTake();

	$('#faceLogin').on('click', function() {
		webcam.capture();
	})

	$('#pwd').bind('keypress', function(event) {
		if(event.keyCode == "13") {
			accountNumberLoing()
		}
	})

});

/*
 * 刷卡登录
 * */
function slotCardLogin(pwd) {
	$.ajax({
		type: "post",
		url: Utils.url + '/cardLogin?cardId=' + pwd,
		xhrFields: {
			withCredentials: true
		},
		headers: {
			'Content-Type': 'application/json; charset=UTF-8'
		},
		xhrFields: {
			withCredentials: true
		},
		success: function(result) {
			if(Number(result.status) == 200) {
				//除了操机员和货代录入员其他都可以登录
				if(result.data.info.roleName == '操机员' || result.data.info.roleName == '货代录入员') {

					Utils.noticeModelFn($('#loginHint'), "无权限登录！", 2);
				} else {
					var d = result.data.info;
					//					sessionStorage.setItem('data1', JSON.stringify(d));
					//					sessionStorage.setItem('userData', JSON.stringify(d));
					//					sessionStorage.setItem('token', result.data.token)

					if(result.data.info.userId == 'admin') {
						sessionStorage.setItem('data1', JSON.stringify(d));
						sessionStorage.setItem('userData', JSON.stringify(d));
						sessionStorage.setItem('token', result.data.token)
						window.location.href = '../../page/Administrator/livemonitoring.html?flag=1&index=1'
					} else {
						sessionStorage.setItem('data1', JSON.stringify(d));
						sessionStorage.setItem('userData', JSON.stringify(d));
						sessionStorage.setItem('token', result.data.token)
						window.location.href = 'unpack-screenshot.html'
					}

				}

			} else {
				// Utils.noticeModelFn($('#loginHint'),"登录失败，请重新输入！！",2);
				Utils.noticeModelFn($('#loginHint'), result.msg + "！", 2);
				//				window.location.href = 'livemonitoring.html'
			}
		},
		error: function() {

		}
	});
	//	window.location.href = 'waybill-entering.html'
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
				//除了操机员和货代录入员其他都可以登录
				if(result.data.info.roleName == '操机员' || result.data.info.roleName == '货代录入员') {

					Utils.noticeModelFn($('#loginHint'), "无权限登录！", 2);
				} else {
					var d = result.data.info;
					if(result.data.info.userId == 'admin') {
						sessionStorage.setItem('data1', JSON.stringify(d));
						sessionStorage.setItem('userData', JSON.stringify(d));
						sessionStorage.setItem('token', result.data.token)
						window.location.href = '../../page/Administrator/livemonitoring.html?flag=1&index=1'
					} else {
						sessionStorage.setItem('data1', JSON.stringify(d));
						sessionStorage.setItem('userData', JSON.stringify(d));
						sessionStorage.setItem('token', result.data.token)
						window.location.href = 'unpack-screenshot.html'
					}
				}

			} else {
				// Utils.noticeModelFn($('#loginHint'),"登录失败，请重新输入！！",2);
				Utils.noticeModelFn($('#loginHint'), result.msg + "！", 2);
				//				window.location.href = 'livemonitoring.html'
			}
		},
		error: function() {

		}
	});

}

/*
 * 人脸登录  /image/compare
 * */
function faceLogin(imgUrl) {
	var data = {
		imageUrl: imgUrl
	};
	$.ajax({
		type: 'post',
		url: Utils.url + '/image/compare?timestamp=' + new Date().getTime(),
		xhrFields: {
			withCredentials: true
		},
		headers: {
			'Content-Type': 'application/json; charset=UTF-8'
		},
		data: JSON.stringify(data),
		success: function(result) {
			if(Number(result.status) == 200) {
				//登录成功
				if(result.data.info.roleName == '操机员' || result.data.info.roleName == '货代录入员') {
					Utils.noticeModelFn($('#loginHint'), "无权限登录！", 2);
				} else {
					var d = result.data.info;
					sessionStorage.setItem('data1', JSON.stringify(d));
					sessionStorage.setItem('userData', JSON.stringify(d));
					window.location.href = 'unpack-screenshot.html'

				}

			} else {
				// Utils.noticeModelFn($('#loginHint'),"登录失败，请重新输入！！",2);
				Utils.noticeModelFn($('#loginHint'), result.msg + "！", 2);
			}
		},
		error: function(e) {}
	})
}

function loginCut(e, flag) {
	$(e).parent().find('div').removeClass('active');
	$(e).addClass('active');
	if(flag == 1) {
		isAcountLogin = true;
		//		/账号登录
		$('.face-login').hide();
		$('.slot-card-login').hide();
		$('.account-number-login').show();
		$('.faceicon').attr('src', '../../image/login/loginicon1.png')
		$('.numbericon').attr('src', '../../image/login/loginicon2_.png')

		$('.input-col').children('i').css('display', 'none')
		$('.input-col').children('input').removeClass('error')
		$('.input-col').children('input').removeClass('green')
		$('input').val('')
		$('.error-text').hide()
		window.clearInterval(timer);
	} else if(flag == 2) {
		//人脸登录
		$('.face-login').show();
		$('.slot-card-login').hide();
		$('.account-number-login').hide();
		$('.faceicon').attr('src', '../../image/login/loginicon1_.png')
		$('.numbericon').attr('src', '../../image/login/loginicon2.png')
		$('.input-col').children('input').addClass('default')
		//				cameraTake();
	} else {
		isAcountLogin = false;
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

/*
 * 摄像头调取
 * */
function cameraTake() {
	var pos = 0,
		ctx = null,
		image = [];
	jQuery("#webcam").webcam({
		width: 320,
		height: 240,
		mode: "callback",
		swffile: "../../lib/js/jscam_canvas_only.swf", // 这里引入swf文件，注意路径
		onTick: function(remain) {
			console.log(remain);
		},
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
				faceLogin(base64);
				//				console.log(base64);
				// 将图片base64码设置给img
				//var base64image = document.getElementById('base64image');
				//    base64image.setAttribute('src', base64);
				pos = 0;
			}
		},

		onCapture: function() {
			webcam.save();
		},

		debug: function(type, string) {
			console.log('type:' + type + ',string:' + string);
		},
		onLoad: function() {}

	});

	window.addEventListener("load", function() {
		var canvas = document.getElementById("canvas");

		if(canvas.getContext) {
			ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, 320, 240);
			var img = new Image();
			img.onload = function() {
				ctx.drawImage(img, 129, 89);
			}
			image = ctx.getImageData(0, 0, 320, 240);
		}

	}, false);
}

function showicon(e, flag) {
	if(isColor == true) {
		isColor = false;
	} else {
		$(e).removeClass('error')
		$(e).addClass('green')
		if($(e).val() !== "") {
			if(flag == 1) {
				$(e).siblings('.check-icon').show();
				$(e).siblings('.close-icon').hide();

			} else {
				$(e).siblings('.check-icon_').show();
				$(e).siblings('.close-icon_').hide();
			}
			$(e).siblings('.error-text').hide()

			//		$('.check-icon').show()
			//		$('.close-icon').hide()

		} else {
			if(flag == 1) {
				$(e).siblings('.check-icon').hide();
				$(e).siblings('.close-icon').show();
				$(e).siblings('.error-text').show()

			} else {
				$(e).siblings('.check-icon_').hide();
				$(e).siblings('.close-icon_').show();
				$(e).siblings('.error-text').show()

			}
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
		$(e).removeClass('default');
		isColor = true;
	}

}

function showTip(e) {
	setTimeout(function() {
		if(isAcountLogin == true) {

		} else {
			$(e).removeClass('green')
			showTip1()
			window.clearInterval(timer);
			timer = setInterval(function() {
				showTip1()
			}, 6000)
		}
	}, 200)

}

function showTip1() {
	noticeModelFn($('#loginHint'), "请点击输入框，再刷卡登录", 2);
}

function addGreen(e) {
	$(e).addClass('green');
	window.clearInterval(timer);
}

function noticeModelFn(con, text, num) {
	con.find('span').html(text);
	if(num == 1) {
		con.addClass('success-notice').removeClass('error-notice');
		con.fadeIn()
	} else if(num == 2) {
		con.addClass('error-notice').removeClass('success-notice');
		con.fadeIn()
	} else if(num == 3) {
		con.addClass('online-notice').removeClass('success-notice');
		con.fadeIn()
	}
	setTimeout(function() {
		con.fadeOut();
	}, 3000)
}