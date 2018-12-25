var photo;
var isSearch; // 是否是搜索时
var formData = new FormData()
var menus = "";
var hasChild; //是否有子集
var windowisOpen = false; //弹窗
var isOpen = false; //打开了拍照弹框
var userData;
var token = sessionStorage.getItem('token');

//var groupList=[
//{"id":55,"parentId":1,"name":"A部门"},
//{"id":56,"parentId":1,"name":"B部门"},
//{"id":57,"parentId":56,"name":"B-1"},
//];
//var groupList=[];
$(function() {
	$('.pop-takepic').on('click', function() {
		webcam.capture();
		$('.photo').hide();
		$('#webcam').html('');
		showPhoto(photo);
	});
	$(".pd-download").attr('href', mainContainer.downLoad);
	$('.pop-input').bind('focus', function(e) {
		$(this).css('border', '1px solid rgb(98, 168, 234)')
	})
	$('.pop-input').bind('blur', function(e) {
		$(this).css('border', '1px solid #dcdfe6')
	})
	//  cameraTake();
	//	userData = JSON.parse(sessionStorage.getItem('userData'));
	//	$('.username>span').text(userData.userName);

});

var mainContainer = new Vue({
	el: '#mainContainer',
	data: {
		pageNum: 1,
		pageSize: 15,
		pages: 0,
		total: 0,
		selectShow: false,
		selectRShow: false,
		selectGroupShow: false,
		selectRoleShow: false,
		ulShow1: false,
		selectRole: "",
		selectGroup: "",
		selectRole_: "",
		selectGroup_: "",
		peopleId: "",
		name: "",
		phone: "",
		cardId: "",
		group: "",
		id: "",
		role: "",
		roles: [],
		imgurl: "",
		editFlag: false,
		conditions: "",
		groups: ["A班组1号", "A班组2号", "A班组3号"],
		groups: [{
			"key": "32",
			"value": "32",
			"label": "班组C",
			"children": [{
				"key": "33",
				"value": "33",
				"label": "班组C-1",
				"children": [{
					"key": "34",
					"value": "34",
					"label": "班组C-1-1",
					"children": []
				}]
			}]
		}],
		items: [],
		title: "新增人员",
		alertName: "",
		blockName: "",
		resetName: "",
		blockFlag: "",
		all: "全部",
		depart: [],
		departChildren: [],
		hasDepart: "",
		downLoad: Utils.url + '/downLoad' //下载模板地址
	},
	methods: {
		loadroles: function() {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + '/role/getRoleTypeList_user' + '?timestamp=' + new Date().getTime(),
				async: true,

				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				success: function(result) {
					self.roles = result;

				}
			});
		},
		//		下拉框
		showSelect: function(flag) {
			switch(flag) {
				case 1:
					$('.GroupSelect').css('border', '1px solid rgb(98, 168, 234)')
					if($('#mainUl').css('display') == 'none') {
						$('#mainUl').show()
					} else {
						$('#mainUl').hide()
					}
					break;
				case 2:
					$('.RoleSelect').css('border', '1px solid rgb(98, 168, 234)')
					this.selectRoleShow = !this.selectRoleShow
					break;
				case 3:
					$('.Group').css('border', '1px solid rgb(98, 168, 234)')
					if($('#group').css('cursor') == 'not-allowed') {

					} else {
						if($('#mainUl_').css('display') == 'none') {
							$('#mainUl_').show()
						} else {
							$('#mainUl_').hide()
						}
					}

					break;
				case 4:
					$('.Role').css('border', '1px solid rgb(98, 168, 234)')
					if($('#role').css('cursor') == 'not-allowed') {

					} else {
						this.selectRShow = !this.selectRShow
					}

					break;

			}

		},

		//		选择分组状态
		chooseGroup: function(data, flag) {
			switch(flag) {
				//				case 1:
				//					this.selectGroupShow = false
				//					this.selectGroup = data
				//					this.selectGroup_ = data
				//					$('.GroupSelect').css('border', '1px solid #dddddd')
				//					//					this.findByConditions()
				//					break;
				case 2:
					this.selectRoleShow = false
					this.selectRole = data
					this.selectRole_ = data
					$('.RoleSelect').css('border', '1px solid #dddddd')
					this.findByConditions()
					break;
				case 3:
				 	this.group = data
					this.selectShow = false
					this.ulShow1 = false

					$('.Group').css('border', '1px solid #dddddd')
					$('.grouptext').hide()
					break;
				case 4:
					this.selectRShow = false

					if(data == "请选择") {
						this.role = ""
					} else {
						this.role = data
					}
					$('.Role').css('border', '1px solid #dddddd')
					$('.roletext').hide()
					break;
			}

		},

		//		初始化人员
		loadPeople: function() {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + '/findAllUsers?pageNum=' + self.pageNum + '&pageSize=' + self.pageSize + '&timestamp=' + new Date().getTime(),
				async: true,
				xhrFields: {
					withCredentials: true
				},

				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				success: function(result) {
					if(result.status == 200) {
						self.items = result.data.items;
						self.pageNum = result.data.currentPage;
						self.pageSize = result.data.pageSize;
						self.total = result.data.totalNum;
						self.pages = result.data.totalPage;
						if(result.data.items.length > 0) {
							$('.table-title').css('display', '');
							$('.table-container').css('background', '#ffffff');
						} else {
							if(self.pageNum != 1) {
								self.pageNum = self.pageNum - 1;
								self.loadPeople();
							} else {
								$('.table-title').css('display', 'none')
								$('.table-container').css('background', 'url(../../image/empty.png) 50% #ffffff no-repeat')
							}
						}

						isSearch = false;
						cutPage(self.pages, self.pageNum)
						$('.el-loading-mask').hide()
						self.$nextTick(function() {
							addTitle();
						})

					} else if(result.status == 500) {
						Utils.noticeModelFn($('#loginHint'), "登录超时，即将跳转登录页面！", 2)
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					if(jqXHR.status == 500) {
						Utils.noticeModelFn($('#loginHint'), "登录超时，即将跳转登录页面！", 2)
						setTimeout(function() {
							loginout();
						}, 2000)

					}
					/*弹出jqXHR对象的信息*/
					//					console.log(jqXHR.responseText);
					//					console.log(jqXHR.status);
					//					console.log(jqXHR.readyState);
					//					console.log(jqXHR.statusText);
				}
			});
		},

		//		打开新建编辑弹框
		openEdit: function(data, flag) {
			$('div input').css('border-color', '#dddddd');
			$('.error-hint-text').hide();
			windowisOpen = true;
			if(flag == 1) {
				$('div.z_photo').find('section').css("display", "block");
				$('ul.echo-img').html('');
				this.title = "新增人员"
				this.editFlag = false;
				this.peopleId = "";
				this.name = "";
				this.phone = "";
				this.group = "";
				this.role = "";
				this.cardId = "";
				$('#group').attr('disabled', false)
				$('#group').css('cursor', 'default')
				$('#group').attr('unselectable', 'off')

				$('#role').attr('disabled', false)
				$('#role').css('cursor', 'default')
				$('#role').attr('unselectable', 'off')

			} else {
				this.editFlag = true;
				this.title = "编辑人员";
				this.peopleId = data.userid;
				this.name = this.getJudgeFn(decodeURI(data.username));
				this.phone = this.getJudgeFn(data.telphone);
				this.group = this.getJudgeFn(decodeURI(data.groupName));
				this.role = this.getJudgeFn(decodeURI(data.roleName));
				this.id = data.id;
				this.cardId = data.cardId;

				if(this.name === 'admin') {
					$('#group').attr('disabled')
					$('#group').css('cursor', 'not-allowed')
					$('#group').attr('unselectable', 'on')

					$('#role').attr('disabled')
					$('#role').css('cursor', 'not-allowed')
					$('#role').attr('unselectable', 'on')
				} else {

					$('#group').attr('disabled', '')
					$('#group').css('cursor', 'default')
					$('#group').attr('unselectable', 'off')

					$('#role').attr('disabled', '')
					$('#role').css('cursor', 'default')
					$('#role').attr('unselectable', 'off')

				}

				if(data.savepath !== null) {
					this.imgurl = data.savepath
				}
				if(data.savepath !== null) {
					showPhoto(data.savepath)
				} else {
					closeImg()
				}
			}
			$('.add-order').show()
		},

		//		删除弹框
		openDelete: function(data) {
			this.alertName = decodeURI(data.username);
			this.id = data.id;
			$('.delete').show()
		},

		//		屏蔽弹框
		openBlock: function(data, flag) {
			this.blockName = decodeURI(data.username);
			this.id = data.id;
			if(flag == 1) {
				this.blockFlag = "屏蔽"
			} else {
				this.blockFlag = "取消屏蔽"
			}
			$('.blockw').show()
		},

		//		重置弹框
		openReset: function(data) {
			this.resetName = decodeURI(data.username);
			this.id = data.userid;
			$('.reset').show()
		},

		//      拍照弹框
		openTakePhoto: function() {
			$('.photo').show();
			isOpen = true;
			//			var html = [];
			//			html.push('<div id="webcam" style="margin-top: 14px;text-align: center;" width="600" height="600"></div>')
			//			html.push('<canvas id="canvas" width="200" height="200"></canvas>');
			//			$('.video-canvas').html(html.join(''))
			cameraTake1();
		},

		//		确定操作 1删除 2屏蔽 3重置
		confirmFlag: function(flag) {
			var urlFlag, message;
			var self = this;
			if(flag == 1) {
				urlFlag = "/deleteUser?id="
				message = "删除"
			} else if(flag == 2) {
				if(this.blockFlag == "屏蔽") {
					urlFlag = "/disabledUser?id="
					message = "屏蔽"
				} else {
					urlFlag = "/undisabledUser?id="
					message = "解除屏蔽"
				}
			} else {
				urlFlag = "/resetPassword?userId="
				message = "重置"
			}
			$.ajax({
				type: "get",
				url: Utils.url + urlFlag + self.id + '&timestamp=' + new Date().getTime(),
				async: true,

				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				success: function(result) {
					$('.delete').hide()
					$('.blockw').hide()
					$('.reset').hide()
					if(result.status == 200) {
						Utils.noticeModelFn($('#loginHint'), message + "成功！", 1)
						self.findByConditions()
					} else {
						Utils.noticeModelFn($('#loginHint'), message + "失败！", 2)
					}
				}
			});
		},
		//      导入文件
		upFile: function(e) {
			var formData = new FormData();
			var self = this;
			formData.append("file", $(e.target).context.files[0])
			$.ajax({
				type: "post",
				url: Utils.url + "/upLoad" + '?timestamp=' + new Date().getTime(),
				data: formData,
				processData: false,
				contentType: false,
				xhrFields: {
					withCredentials: true
				},

				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				mimeType: "multipart/form-data",
				success: function(result) {
					if((JSON.parse(result).status == 200)) {
						self.loadPeople();
						Utils.noticeModelFn($('#loginHint'), '导入成功！', 1)
					} else if(JSON.parse(result).status == 500) {
						Utils.noticeModelFn($('#loginHint'), "登录超时，即将跳转登录页面！", 2)
						setTimeout(function() {
							loginout();
						}, 2000)
					} else if(JSON.parse(result).status == 400 && JSON.parse(result).msg == "存在重复userId") {
						Utils.noticeModelFn($('#loginHint'), "存在重复的人员ID！", 2)
					}
					$(e.target).val('');
				}
			});
		},

		//		筛选
		findByConditions: function() {
			var self = this;
			var ulr1 = "";
			var ulr2 = "";
			var ulr3 = "";
			if(self.conditions == "" && self.selectRole == "" && self.selectGroup == "") {
				isSearch = false;
				self.loadPeople()
			} else {
				if(self.selectRole == "") {

				} else if(self.selectRole == "全部") {

				} else {
					ulr1 = "&roleName=" + encodeURI(self.selectRole_, 'UTF-8')
				}
				if(self.selectGroup == "") {

				} else if(self.selectGroup == "全部") {

				} else {
					ulr2 = "&groupName=" + encodeURI(self.selectGroup_, 'UTF-8')
				}
				if(self.conditions !== '') {
					ulr3 = "&conditions=" + encodeURI(self.conditions, 'UTF-8')
				}
				$.ajax({
					type: "get",
					xhrFields: {
						withCredentials: true
					},

					beforeSend: function(request) {
						request.setRequestHeader("token", token);
					},
					url: Utils.url + "/findAllUsers?pageNum=" + self.pageNum + "&pageSize=" + self.pageSize + ulr3 +
						ulr1 + ulr2 + '&timestamp=' + new Date().getTime(),
					success: function(result) {
						if(result.status == 200) {
							if(result.data.items.length > 0) {
								$('.table-title').css('display', '')
								$('.table-container').css('background', '#ffffff')

							} else {
								$('.table-title').css('display', 'none')
								$('.table-container').css('background', 'url(../../image/empty.png) 50% #ffffff no-repeat')

							}
							self.items = result.data.items;
							self.pageNum = result.data.currentPage;
							self.pageSize = result.data.pageSize;
							self.total = result.data.totalNum;
							self.pages = result.data.totalPage;

							cutPage(self.pages, self.pageNum)
							$('.el-loading-mask').hide()

						} else {
							$('.el-loading-mask').show()
						}
					}
				});
			}
		},

		compareValue: function() {
			if(this.conditions == "") {
				isSearch = false;
			}
			$('.search-input').css('border', '1px solid #dddddd')

		},
		addborder: function() {

			$('.search-input').css('border', '1px solid rgb(98, 168, 234)')
		},

		//      提交弹框
		postPeople: function() {
			var self = this;
			var ulr;
			formData = new FormData();
			if(self.editFlag == false) {
				ulr = "/addUser"
				formData.append('userId', self.peopleId);
				formData.append('userName', self.name);
				formData.append('telPhone', self.phone);
				formData.append('groupName', self.group);
				formData.append('roleName', self.role);
				formData.append('cardId', self.cardId);
				//				formData.append('file', dataURItoBlob(photo))
				$.ajax({
					type: "post",
					url: Utils.url + ulr,
					xhrFields: {
						withCredentials: true
					},

					beforeSend: function(request) {
						request.setRequestHeader("token", token);
					},
					data: formData,
					async: true,
					processData: false,
					contentType: false,
					mimeType: "multipart/form-data",
					success: function(result) {
						if(Number(JSON.parse(result).status) == 200) {
							Utils.noticeModelFn($('#loginHint'), "提交成功！", 1)
							formData = new FormData();
							$('.add-order').hide()
							windowisOpen = false;
							closeImg()
							if(isSearch == true) {
								self.findByConditions()
							} else {
								self.loadPeople()
							}
							if(JSON.parse(result).status == 500 || JSON.parse(result).status == 400) {
								formData = new FormData();
							}
						} else if(Number(JSON.parse(result).status == 400)) {
							Utils.noticeModelFn($('#loginHint'), JSON.parse(result).msg + "！", 2)
							formData = new FormData();
						}
					},
					error: function(jqXHR, textStatus, errorThrown) {
						/*弹出jqXHR对象的信息*/
						// console.log(jqXHR.responseText);
						// console.log(jqXHR.status);
						//console.log(jqXHR.readyState);
						//console.log(jqXHR.statusText);
						/*弹出其他两个参数的信息*/
						//console.log(textStatus);
						//console.log(errorThrown);
						if(jqXHR.status == 400 || jqXHR.status == 500) {
							formData = new FormData();
						}
					}
				});
			} else {
				ulr = "/editUser"
				formData.append('userId', self.peopleId);
				formData.append('userName', self.name);
				formData.append('telPhone', self.phone);
				formData.append('groupName', self.group);
				formData.append('roleName', self.role);
				formData.append('cardId', self.cardId);
				formData.append('id', self.id);

				//				if(isOpen == true) {
				//					formData.append('file', dataURItoBlob(photo))
				//				} else {
				//					formData.append('imgUrl', self.imgurl)
				//				}
				$.ajax({
					type: "post",
					url: Utils.url + ulr,
					data: formData,
					async: true,

					beforeSend: function(request) {
						request.setRequestHeader("token", token);
					},
					processData: false,
					contentType: false,
					mimeType: "multipart/form-data",
					success: function(result) {
						if(Number(JSON.parse(result).status) == 200) {
							Utils.noticeModelFn($('#loginHint'), "提交成功！", 1)
							formData = new FormData();
							$('.add-order').hide()
							windowisOpen = false;
							closeImg()
							if(isSearch == true) {
								self.findByConditions()
							} else {
								self.loadPeople()
							}
						} else {
							formData = new FormData();
							Utils.noticeModelFn($('#loginHint'), JSON.parse(result).msg + "!", 2)
						}
					}
				});
			}

		},
		//为空判断
		getJudgeFn: function(text) {
			var t = '';
			if(text == '' || text == null || text == undefined || text == 'null') {
				t = '';
			} else {
				t = text;
			}
			//console.log(t);
			return t;
		}
	},
	mounted: function() {

		this.loadroles();
		this.loadPeople();
		getFirstGroup();
		//		if(screen.width==1366){
		//			this.pageSize=10;
		//		}
		//		getGroup();
	},

});

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
			if(isSearch == true) {
				mainContainer.findByConditions()
			} else {
				mainContainer.loadPeople()
			}
			//page:点击时返回的点击的页码，拿到该页码过后执行翻页的逻辑操作

			//			getAllPeople(pageNum, pageSize, creatTime, channelId, conditions)
		}
	});
}

function inputRBlur() {
	$('.Role').css('border', '1px solid #dddddd');
	setTimeout(function() {
		mainContainer.selectRShow = false
	}, 300)
}

function takePhoto() {
	var canvas = document.getElementById("canvas");
	if(canvas.getContext) {
		ctx = document.getElementById("canvas").getContext("2d");
		ctx.clearRect(0, 0, 320, 240);
		var img = new Image();
		img.src = "";
		img.onload = function() {
			ctx.drawImage(img, 0, 0);
		}
		image = ctx.getImageData(0, 0, 320, 240);
	}

	if(canvas.toDataURL) {
		ctx = canvas.getContext("2d");
		image = ctx.getImageData(63, 0, 194, 240);
		saveCB = function(data) {
			var col = data.split(";");
			var img = image;
			for(var i = 63; i < 257; i++) {
				var tmp = parseInt(col[i]);
				img.data[pos + 0] = (tmp >> 16) & 0xff;
				img.data[pos + 1] = (tmp >> 8) & 0xff;
				img.data[pos + 2] = tmp & 0xff;
				img.data[pos + 3] = 0xff;
				pos += 4;
			}
			if(pos >= 4 * 194 * 240) {
				ctx.putImageData(img, 0, 0);
				var base64 = canvas.toDataURL("image/png");
				photo = base64;
				pos = 0;
			}
		};

	} else {
		saveCB = function(data) {
			image.push(data);
			pos += 4 * 194;
			if(pos >= 4 * 194 * 240) {
				pos = 0;
			}
		};
	}

	jQuery("#webcam").webcam({

		mode: "callback",
		swffile: "../../lib/js/jscam_canvas_only.swf",
		onCapture: function() {
			webcam.save();
			var canvas = document.getElementById("canvas")
			var imageContent = canvas.toDataURL("image/png")
			var callBack = window.dialogArguments;
			if(callBack != undefined && callBack != null) {
				callBack(imageContent);
			}
		},
		onSave: saveCB,
		debug: function(type, string) {
			jQuery("#status").html(type + ": " + string);
		},
		onLoad: function() {
			var cams = webcam.getCameraList();
			for(var i in cams) {
				jQuery("#cams").append("<li>" + cams[i] + "</li>");
			}
		}
	});
}

function cameraTake1() {
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

//填充拍照内容
function showPhoto(data) {
	$('.please-upload-img').hide();
	var html = [];
	$('div.z_photo').find('section').css("display", "none");
	$('ul.echo-img').html(html.join(''));
	html.push('<li>');
	html.push('<img src="../../lib/img/imgclose.png" class="close-img" onclick="closeImg()">');
	html.push('<img src="' + data + '" class="image" onclick="showDetailsImg(this)"> ');
	html.push('</li>');
	$('ul.echo-img').html(html.join(''));

}

//删除拍了的图片
function closeImg() {
	$('.echo-img').find('li').remove()
	//	$(e).parent().remove();
	//	formData.delete('file');
	$('div.z_photo').find('section').css("display", "block");

}

//显示大图，订单详情的数据回显的大图显示
function showDetailsImg(e) {
	var img = $(e).attr('src');
	openImg(img);
}
/*
 *查看大图
 * */
function openImg(img) {
	$('.img-preview').show();
	$('#imgPreview').attr('src', img);
}

function verifyFrom(e) {
	$(e).parent().find('span.error-hint-text').hide();
	$(e).css('border-color', '#dcdfe6');
}

function dataURItoBlob(base64Data) {
	var byteString;
	if(base64Data.split(',')[0].indexOf('base64') >= 0)
		byteString = atob(base64Data.split(',')[1]);
	else
		byteString = unescape(base64Data.split(',')[1]);
	var mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
	var ia = new Uint8Array(byteString.length);
	for(var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	return new Blob([ia], {
		type: mimeString
	});
}
//提交验证
function postPeople() {
	var reg = /^\s+|\s+$/g //空
	var regZh = /[^\u4E00-\u9FA5A-Za-z]/g //中文
	var peopleNo = $('#peopleNo').val();
	if(peopleNo.length <= 0) {
		$('#peopleNo').parent().find('span.error-hint-text').show();
		$('#peopleNo').css('border-color', '#f56c6c');
		return;
	}
	var name = $('#name').val();
	if(reg.test($('#name').val()) || regZh.test($('#name').val()) || $('#name').val().length <= 0) {
		$('#name').val('');
		$('#name').parent().find('span.error-hint-text').show();
		$('#name').css('border-color', '#f56c6c');
		return;
	}

	var cardId = $('#cardId').val();
	if(cardId.length <= 0) {
		$('#cardId').parent().find('span.error-hint-text').show();
		$('#cardId').css('border-color', '#f56c6c');
		return;
	}

	var tel = $('#tel').val();
	if(tel.length <= 0) {
		$('#tel').parent().find('span.error-hint-text').show();
		$('#tel').css('border-color', '#f56c6c');
		return;
	}
	if(mainContainer.group == '') {
		$('.grouptext').css('display', 'block');
		$('.pop-select').css('border-color', '#f56c6c');
		return;
	}

	if($('div.z_photo').find('section').css('display') == "block") {
		$('.please-upload-img').show();
		// $('.uploading-img').children().find('span.error-hint-text').show();
		// $('.updata-img').css('border-color', '#f56c6c');
		return;
	}
	mainContainer.postPeople();

}

//获得一级部门
function getFirstGroup() {
	var userId = JSON.parse(sessionStorage.getItem('userData')).userId;

	$.ajax({
		type: "get",
		url: Utils.url + "/department/getGroupTreeById?userId=" + userId + "&timestamp = " + new Date().getTime(),
		xhrFields: {
			withCredentials: true
		},

		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(result) {
			if(result.status == 200) {
				if(result.data == '[]') {
					mainContainer.hasDepart = "请建立部门";
					$('#group').attr('placeholder', '暂无数据')
					$('#group').css('cursor', 'not-allowed')
				} else {
					getGroup(result.data.id)
				}

			}

		}
	});
}

//获得子集班组
function getGroup(id) {
	var userId = JSON.parse(sessionStorage.getItem('userData')).userId;
	$.ajax({
		type: "get",
		url: Utils.url + "/department/getChildGroupTreeById?userId=" + userId + "&timestamp = " + new Date().getTime(),
		xhrFields: {
			withCredentials: true
		},

		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(result) {
			if(result.length <= 0) {
				$('#group').attr('placeholder', '暂无数据')
				$('#group').css('cursor', 'not-allowed')
				mainContainer.hasDepart = "请建立班组";
			} else {
				mainContainer.hasDepart = "分组不能为空"
			}
			GetData(id, result)
			$("#ulhtml").append(menus);
			$("#ulhtml_").append(menus);

			if(result.length >= 5) {
				$("#ulhtml").find('ul:first').css({
					"margin-left": 0,
					'max-height': '210px',
					'overflow-y': 'scroll',
				})

			} else {
				$("#ulhtml").find('ul:first').css({
					"margin-left": 0,
					'max-height': '210px',
					'overflow-y': 'hidden',
				})

			}
			if(result.length > 5) {
				$("#ulhtml_").find('ul:first').css({
					"margin-left": 0,
					'max-height': '210px',
					'overflow-y': 'scroll',
				})

			} else {
				$("#ulhtml_").find('ul:first').css({
					"margin-left": 0,
					'max-height': '210px',
					'overflow-y': 'hidden',
				})

			}

			$("#ulhtml").find('ul:first').attr('id', 'mainUl')
			$("#ulhtml_").find('ul:first').attr('id', 'mainUl_')
			$("#ulhtml").find('ul>span:first').prepend('<li onclick="selectGroup(this)" style="cursor: pointer;">全部</li>')
			var oUl1 = document.getElementById('mainUl');
			if(oUl1 !== null) {
				var aLi = oUl1.getElementsByTagName('li'); //获取所以的li
				addMouseOver(oUl1, aLi)
			}
			var oUl1_ = document.getElementById('mainUl_');
			if(oUl1_ !== null) {
				var aLi_ = oUl1_.getElementsByTagName('li');
				addMouseOver(oUl1_, aLi_)
			}
		}
	});
}

//给下拉框ul添加hover
function addMouseOver(oUl1, aLi) {
	var timer = null; //设置定时器
	//遍历所有的li
	for(var i = 0; i < aLi.length; i++) {
		//给每一个li加鼠标移入事件
		aLi[i].onmouseover = function() {
			clearTimeout(this.timer); //先清除定时器
			var that = this; // 用that 代替this 在定时器中使用
			this.timer = setTimeout(function() {
				//获取当然li下面的第一个ul列表即下级菜单
				var oUl = that.getElementsByTagName('ul')[0];
				//判断列表是否存在，存在就让它显示
				if(oUl) {
					//					oUl.style.display = 'block';
					oUl.style.display = 'none';
				}
			}, 300);
		}
		// 鼠标移出事件  
		aLi[i].onmouseout = function() {
			clearTimeout(this.timer);
			var that = this;
			this.timer = setTimeout(function() {
				var oUl = that.getElementsByTagName('ul')[0];
				if(oUl) {
					oUl.style.display = 'none';
				}
			}, 300);
		}
	}
}

//头部插入
function prepend(arr, item) {
	//将arr数组复制给a
	var a = arr.slice(0);
	//使用unshift方法向a开头添加item
	a.unshift(item);
	return a;
}

//创建动态树形下拉框
function GetData(id, arry) {
	var childArry = GetParentArry(id, arry);
	//	var menus="";
	if(childArry.length > 0) {
		menus += '<ul class="pop-ul" style="margin-left: 162px;line-height: 22px;top:-1px;margin-top:0;display:none">';
		for(var i in childArry) {
			menus += '<span></span>';
			menus += '<li style="position:relative;padding:0">' + '<span style="display:block;padding:10px;cursor: pointer;" onclick="selectGroup(this)">' + childArry[i].name + '</span>';
			GetData(childArry[i].id, arry);
			menus += '</li>';
		}
		menus += '</ul>';
	}
}

//选择班组
function selectGroup(e) {
	// 阻止冒泡
	$('.grouptext').hide();
	if(e && e.stopPropagation) {
		//因此它支持W3C的stopPropagation()方法
		e.stopPropagation();
	} else {
		//否则，我们需要使用IE的方式来取消事件冒泡
		window.event.cancelBubble = true;
	}
	//	       弹框里面的下拉
	if(windowisOpen == true) {
		mainContainer.group = $(e).text();
		$('#mainUl_').hide()

	} else {
		//		筛选里面的下拉
		mainContainer.selectGroup = $(e).text()
		mainContainer.selectGroup_ = $(e).text()
		$('#mainUl').css('display', 'none')
		mainContainer.findByConditions()

	}

}

//根据上级菜单id获取夏季菜单
function GetParentArry(id, arry) {
	var newArry = new Array();
	for(var i in arry) {
		if(arry[i].parentId == id)
			newArry.push(arry[i]);
	}
	return newArry;
}

//监听点击空白地区下拉收起
$(document).on('click', function(e) {

	if($(e.target).parents('.GroupSelect').length <= 0) {
		$('#mainUl').hide();
		$(".GroupSelect").css({
			'border-color': '#ddd'
		})
	}
	if($(e.target).parents('.Group').length <= 0) {
		
		$('#mainUl_').hide();
		$(".Group").css({
			'border-color': '#ddd'
		})
	}
	if($(e.target).parents('.RoleSelect').length <= 0) {
		mainContainer.selectRoleShow = false;
		$(".RoleSelect").css({
			'border-color': '#ddd'
		})
	}
	if($(e.target).parents('.Role').length <= 0) {
		mainContainer.selectRShow = false;
		$(".Role").css({
			'border-color': '#ddd'
		})
	}

});