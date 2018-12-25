var isColor = false;
var cursurPosition;
var isGetPosition = false;
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
	//  cameraTake();

	//  $('#faceLogin').on('click', function() {
	//      webcam.capture();
	//  })
	$('#pwd').bind('keypress', function(event) {
		if(event.keyCode == "13") {
			accountNumberLoing()
		}
	})
	//	$(document).on("click",function(){
	//	  console.log($(this.target))
	//	})
	//	fullScreen()
})

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
				if(result.data.info.roleName == '判读员') {
					console.log(result.data)
					sessionStorage.setItem('userData', JSON.stringify(result.data.info))
					sessionStorage.setItem('token', result.data.token)
					window.location.href = 'touchScreen_.html';
				} else {
					if(result.data.info.userId == 'admin') {
						sessionStorage.setItem('userData', JSON.stringify(result.data.info))
						sessionStorage.setItem('token', result.data.token)
						window.location.href = '../../page/Administrator/livemonitoring.html?flag=1&index=1'
					} else {
						Utils.noticeModelFn($('#loginHint'), '无权限登录！', 2);
					}

				}

			} else {
				// Utils.noticeModelFn($('#loginHint'),'登录失败，请重新输入！',2);
				Utils.noticeModelFn($('#loginHint'), result.msg + "！", 2);
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
				// console.log(result.data)
				if(result.data.info.roleName == '判读员') {
					sessionStorage.setItem('userData', JSON.stringify(result.data.info))
					sessionStorage.setItem('token', result.data.token)
					//					sessionStorage.setItem('userName', result.data.userName)
					window.location.href = 'touchScreen_.html';
				} else {
					if(result.data.info.userId == 'admin') {
						sessionStorage.setItem('userData', JSON.stringify(result.data.info))
						sessionStorage.setItem('token', result.data.token)
						window.location.href = '../../page/Administrator/livemonitoring.html?flag=1&index=1'
					} else {
						Utils.noticeModelFn($('#loginHint'), '无权限登录！', 2);
					}

				}

			} else {
				Utils.noticeModelFn($('#loginHint'), result.msg + "！", 2);
				// Utils.noticeModelFn($('#loginHint'),"无权限登录！",2);
			}
		},
		error: function(result) {
			if(result.status == 404) {
				Utils.noticeModelFn($('#loginHint'), result.msg + '!', 2);
			}
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
		url: Utils.url + '/image/compare',
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
				window.location.href = 'touchScreen.html'
			} else {
				Utils.noticeModelFn($('#loginHint'), result.msg, 2);
			}
		},
		error: function(e) {}
	})
}

//切换
function loginCut(e, flag) {
	$(e).parent().find('div').removeClass('active');
	$(e).addClass('active');
	if(flag == 1) {
		isAcountLogin = true;
		//		/账号登录
		$('.face-login').hide();
		$('.slot-card-login').hide();
		$('.account-number-login').show();

		//		$('.faceicon').attr('src','../../image/login/loginicon1.png')
		$('.numbericon').attr('src', '../../image/login/loginicon2_.png')

		//		$('.input-col').children('i').css('display','none')
		$('.input-col').children('input').removeClass('error')
		$('.input-col').children('input').addClass('default')
		$('input').val('')
		$('.error-text').hide()
		window.clearInterval(timer);

	} else if(flag == 2) {
		//人脸登录
		$('.face-login').show();
		$('.slot-card-login').hide();
		$('.account-number-login').hide();
		//		cameraTake();
	} else {
		//刷卡登录
		isAcountLogin = false;
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
			// console.log(remain);
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

function showicon(e) {
	if(isColor == true) {
		isColor = false;
	} else {
		$(e).removeClass('error')
		$(e).addClass('green')
		if($(e).val() !== "") {
			$(e).siblings('.error-text').hide()
		} else {
			$(e).siblings('.error-text').show()
			$(e).siblings('.error-text').css('display', 'block')
			$(e).addClass('error')
			isColor = false;
		}
	}

}

function changeColor(e, flag) {
	if($(e).siblings('span').css('display') == 'block') {

	} else {
		$(e).removeClass('error');
		$(e).addClass('green')
		//	    $(e).siblings('i').hide()
		$(e).removeClass('default');
		isColor = true;
	}
	//	if(flag == 1) {
	//		showKeybored(1)
	//	} else {
	//		showKeybored(2)
	//	}

}

//生成键盘
function showKeybored(flag) {
	$('#keycontent').html('')
	var html = [];
	//	html.push('<div class="softkeys" id="softKey" data-target="input[name=orderNo]">');
	switch(flag) {
		case 1:
			html.push('<div class="softkeys" id="softKey" data-target="input[name=userName]">');
			break;
		case 2:
			html.push('<div class="softkeys" id="softKey" data-target="input[name=pwd]">');
			break;

	}
	html.push('</div>')
	$('#key').show()
	$('.closekey').show()
	$('.key-background').show()
	$('#keycontent').html(html.join(''))

	initSoftKey()

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
				['6'],
				['7'],
				['8'],
				['9'],
				['0'],
				['-'],

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

//针对不同浏览器的全屏方法
function kaishi() {
	var docElm = document.documentElement;
	//W3C 
	if(docElm.requestFullscreen) {
		docElm.requestFullscreen();
	}
	//FireFox 
	else if(docElm.mozRequestFullScreen) {
		docElm.mozRequestFullScreen();
	}
	//Chrome等 
	else if(docElm.webkitRequestFullScreen) {
		docElm.webkitRequestFullScreen();
	}
	//IE11 
	else if(docElm.msRequestFullscreen) {
		docElm.msRequestFullscreen();
	}
}

// 判断各种浏览器，找到正确的方法
function launchFullscreen(element) {
	if(element.requestFullscreen) {
		element.requestFullscreen();
	} else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if(element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
}

function fullScreen() {
	var el = document.documentElement;
	var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
	if(typeof rfs != "undefined" && rfs) {
		rfs.call(el);
	};
	return;
}

//ie低版本的全屏，退出全屏都这个方法
function iefull() {
	var el = document.documentElement;
	var rfs = el.msRequestFullScreen || el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;　 //执行全屏
	if(typeof rfs != "undefined" && rfs) {
		rfs.call(el);
	} else if(typeof window.ActiveXObject != "undefined") {
		var wscript = new ActiveXObject("WScript.Shell");
		if(wscript != null) {
			wscript.SendKeys("{F11}");
		}
	}

	//	if(typeof window.ActiveXObject != "undefined") {
	//		//这的方法 模拟f11键，使浏览器全屏
	//		var wscript = new ActiveXObject("WScript.Shell");
	//		if(wscript != null) {
	//			wscript.SendKeys("{F11}");
	//		}
	//	}
}

function Fkey() {
	var WsShell = new ActiveXObject('WScript.Shell')
	WsShell.SendKeys('{F11}');
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