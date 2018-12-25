var hasChild = false;
var isMainName;
var hasMenu;
var MainName;
var token = sessionStorage.getItem('token');
$(function() {

	//	userData = JSON.parse(sessionStorage.getItem('userData'));
	//	$('.username>span').text(userData.userName);

	//     loadMenu(); 
	// mainContainer.creatTree()

})
var menus = "";
var mainContainer = new Vue({
	el: '#mainContainer',
	data: {
		//		hasMenu:null,
		menuName: "请点击此处后在右编辑菜单",
		menuTitles: "菜单名称",
		editMenu: "",
		title: "新增菜单",
		menu: "",
		parentName: "",
		mainName: "", //部门名字
		groupName: "", //班组名字
		id: "",

		alertName: "",
		departParent: [{
			id: "",
			name: "",
			parentId: ""

		}],
		departchildren: [],
		depart: []

	},
	methods: {
		bindTitle: function() {
			//			this.menuTitle = this.editMenu;
		},

		//		删除弹框
		openDelete: function() {
			this.alertName = this.menuTitles;
			$('.delete').show()
		},

		//		删除菜单
		deleteMenu: function() {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + '/department/deleteGroup?groupName=' + encodeURIComponent(self.alertName, 'UTF-8') + '&timestamp=' + new Date().getTime(),
				async: true,
				contentType: 'application/json',

				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				success: function(result) {
					if(Number(result.status) == 200) {
						Utils.noticeModelFn($('#loginHint'), "删除成功！", 1)
						$('.delete').hide()
						menus = '';
						load();
					} else if(Number(result.status) == 400) {
						$('.delete').hide()
						Utils.noticeModelFn($('#loginHint'), "该部门正在使用中，不能删除！", 2)

					}
				}
			});
		},
		//		更改名称
		saveName: function() {
			var self = this;
			var ulr;
			if(hasMenu == false) {
				//初始化部门
				ulr = "/department/firstAdd?departmentName=" + encodeURIComponent(self.editMenu, 'UTF-8') + '&timestamp=' + new Date().getTime()
				initeDepartment(self, ulr);
			} else {
				if(isMainName == true) { //更改部门名字
					var userData = JSON.parse(window.sessionStorage.getItem('userData'));
					var userId = userData.userId;
					ulr = "/department/editDepartmentName?departmentName=" + encodeURIComponent(self.editMenu, 'UTF-8') + "&id=" + self.id + '&userId=' + userId + '&timestamp=' + new Date().getTime()

				} else { //更改班组名字
					ulr = "/department/editgroupName?groupName=" + encodeURIComponent(self.editMenu, 'UTF-8') + "&id=" + self.id + '&timestamp=' + new Date().getTime()
				}
				editDepartmentName(self, ulr);
			}

			//			$('#menulist').html('')
		},
		//      提交弹框
		postMenu: function() {
			if(Utils.isEmptyObject(this.menu)) {
				$('#menu').siblings().show();
			} else {
				var self = this;
				$.ajax({
					type: "get",
					url: Utils.url + '/department/addGroup?parentName=' + encodeURIComponent(self.parentName, 'UTF-8') + '&groupName=' + encodeURIComponent(self.menu, 'UTF-8') + '&timestamp=' + new Date().getTime(),
					async: true,
					beforeSend: function(request) {
						request.setRequestHeader("token", token);
					},
					contentType: 'application/json',
					success: function(result) {
						if(Number(result.status) == 200) {
							Utils.noticeModelFn($('#loginHint'), "新增成功！", 1)
							$('.add').hide()
							self.menu = "";
							menus = '';
							load();
						} else {
							Utils.noticeModelFn($('#loginHint'), result.msg + "！", 2);
						}
					}
				});
			}
		}

	},
	update: function() {
		load();
	},
	mounted: function() {
		load();

	},
})

/*初始化部门*/
function initeDepartment(self, ulr) {
	$.ajax({
		type: "get",
		url: Utils.url + ulr,
		xhrFields: {
			withCredentials: true
		},
		async: true,
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			if(Number(result.status) == 200) {
				Utils.noticeModelFn($('#loginHint'), "保存成功！", 1)
				menus = '';
				hasMenu = true;
				$('#list').attr('placeholder', self.editMenu)
				self.menuTitles = self.editMenu;
				self.editMenu = '';
				load();

			} else {
				Utils.noticeModelFn($('#loginHint'), result.msg + "，保存失败！", 2)
			}
		},
		error: function() {
			Utils.noticeModelFn($('#loginHint'), "保存失败！", 2)
		}
	});
}

/*编辑部门名字*/
function editDepartmentName(self, ulr) {
	$.ajax({
		type: "get",
		url: Utils.url + ulr,
		async: true,
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			if(Number(result.status) == 200) {
				Utils.noticeModelFn($('#loginHint'), "保存成功！", 1)
				menus = '';
				hasMenu = true;
				$('#list').attr('placeholder', self.editMenu)
				self.menuTitles = self.editMenu;
				self.editMenu = '';
				load();

			} else {
				Utils.noticeModelFn($('#loginHint'), result.msg + "，保存失败！", 2)
			}
		},
		error: function() {
			Utils.noticeModelFn($('#loginHint'), "保存失败！", 2)
		}
	});
}

function openExit() {
	$(".exit").show()
}

function verifyFrom(e) {
	$(e).parent().find('span.error-hint-text').hide();
	$(e).css('border-color', '#dcdfe6');
}

function postPeople() {

	if(mainContainer.oldPsd.length <= 0) {
		$('#oldPsd').parent().find('span.error-hint-text').show();
		$('#oldPsd').css('border-color', '#f56c6c');
		return;
	}
	if(mainContainer.newPsd.length <= 0) {
		$('.newPsd').parent().find('span.error-hint-text').show();
		$('.newPsd').css('border-color', '#f56c6c');
		return;
	}

	if(mainContainer.againPsd.length <= 0) {
		$('.againPsd').parent().find('span.error-hint-text').show();
		$('.againPsd').css('border-color', '#f56c6c');
		return;
	}
	mainContainer.postPeople()

}

//点击一级菜单
function clickFirstMenu(e, id) {
	MainName = $(e).find('.menu').text();
	mainContainer.groupName = $(e).find('.menu').text();
	mainContainer.id = id;
	mainContainer.menuTitles = '';
	mainContainer.menuTitles = $(e).find('.menu').text();

	mainContainer.editMenu = "";
	if(mainContainer.mainName == mainContainer.groupName) {
		isMainName = true
	} else {
		isMainName = false;
	}
	$(e).parents().find('#menulist').children().find('i').removeClass('caret-right')
	$(e).parents().find('#menulist').children().find('a').removeClass('li-active')
	$(e).parents().find('.addmenu').text('');
	$(e).addClass('li-active')
	$(e).find('i').addClass('caret-right')
	//	$('#list').attr('placeholder', $(e).text())
	mainContainer.editMenu = $(e).text();

	//如果选择的部门有下级
	//	$('.msg-title').find('span').text($(e).find('.menu').text())
	if($(e).next('ul').length > 0) {

		if($(e).siblings().hasClass("in") == false) {

			$(e).next('ul').slideDown(350);
			$(e).next('ul').addClass("in");
			$(e).find('.addmenu').text('添加子级菜单');
			$(e).find('.caret').css("transform", "rotate(0deg)");

		} else {
			$(e).next('ul').slideUp(350);
			setTimeout(function() {
				$(e).next('ul').removeClass("in");
			}, 350)
			$(e).find('.caret').css("transform", "rotate(-90deg)");
			$(e).find('.addmenu').text('添加子级菜单');
		}

	} else {
		$(e).find('.addmenu').text('添加子级菜单');
		$(e).find('.caret').css("transform", "rotate(0deg)");

	}
	//	如果没展开
	//	if($(e).siblings().hasClass("in") == false) {
	//
	//		$(e).next('ul').slideDown(350);
	//		$(e).next('ul').addClass("in");
	//		$(e).find('.addmenu').text('添加子级菜单');
	//		if($(e).next('ul').length > 0) {
	//
	//			$(e).find('.caret').css("transform", "rotate(0deg)");
	//		} else {
	//			$(e).find('.caret').css("transform", "rotate(-90deg)");
	//		}
	//
	//		//  如果展开
	//	} else {
	//		$(e).next('ul').slideUp(350);
	//		setTimeout(function() {
	//			$(e).next('ul').removeClass("in");
	//		}, 350)
	//
	//		$(e).find('.addmenu').text('添加子级菜单');
	//		if($(e).next('ul').length > 0) {
	//			$(e).find('.caret').css("transform", "rotate(-90deg)");
	//		} else {
	//			$(e).find('.caret').css("transform", "rotate(0deg)");
	//		}
	//
	//	}

}

//获得树形结构
function GetData(id, arry) {
	var childArry = GetParentArry(id, arry);

	if(hasMenu == false) {
		menus += '<ul class="list-ul">';
		menus += '<li>'
		menus += '<a data-toggle="collapse" onclick="clickFirstMenu(this)" class="list-li">'
		menus += '<span class="caret"></span><span class="menu">请点击此处后在右编辑菜单</span>';
		menus += '<i></i>'
		menus += '</a>'
		menus += '</li>';
		menus += '</ul>';
	} else {

		if(childArry.length > 0) {

			menus += '<ul class="list-ul collapse">';
			for(var i in childArry) {

				menus += '<li>'
				menus += '<a data-toggle="collapse" onclick="clickFirstMenu(this,' + childArry[i].id + ')" class="list-li">'
				menus += '<span class="caret"></span><span class="menu">' + childArry[i].name + '</span>';
				menus += '<span class="addmenu" onclick="openAdd(this)"></span>'
				menus += '<i></i>'
				menus += '</a>'

				GetData(childArry[i].id, arry);

				menus += '</li>';
			}
			menus += '</ul>';
		}
	}
}

function GetParentArry(id, arry) {
	var newArry = new Array();
	for(var i in arry) {
		if(arry[i].parentId == id)
			newArry.push(arry[i]);
	}
	return newArry;
}

function openAdd(e) {
	$('.add').show()
	mainContainer.parentName = $(e).siblings('.menu').text()
	window.event.cancelBubble = true;
}

function loadchildren() {
	var self = this;
	var userId = JSON.parse(sessionStorage.getItem('userData')).userId
	$.ajax({
		type: "get",
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		url: Utils.url + "/department/getChildGroupTreeById?userId=" + userId + "&timestamp=" + new Date().getTime(),
		async: true,
		//		xhrFields: {
		//			withCredentials: true
		//		},
		contentType: 'application/json',
		success: function(result) {
			if(result == []) {
				mainContainer.departchildren = [];
			} else {
				mainContainer.departchildren = result;
			}
			loadMenu()
		}
	});
}

//获得部门
function loadParent() {
	var self = this;
	var userId = JSON.parse(sessionStorage.getItem('userData')).userId
	$.ajax({
		type: "get",
		url: Utils.url + "/department/getGroupTreeById?userId=" + userId + '&timestamp=' + new Date().getTime(),
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		async: true,
		contentType: 'application/json',
		success: function(result) {
			if(result.data == "[]") {
				hasMenu = false;
				creathtml();
			} else {
				mainContainer.mainName = result.data.name; //部门名字
				mainContainer.departParent[0].id = result.data.id;
				mainContainer.departParent[0].name = result.data.name;
				mainContainer.departParent[0].parentId = 0;
				isMainName = true
				mainContainer.id = result.data.id;
				loadchildren()
			}
		},
		error: function() {
			hasMenu = false;
			creathtml();
		}

	});
	if(hasMenu == false) {
		creathtml();
	}

}

function loadMenu() {

	mainContainer.depart = mainContainer.departParent
	mainContainer.depart.push.apply(mainContainer.departParent, mainContainer.departchildren);
	creathtml();
}

function creathtml() {

	GetData(0, mainContainer.depart)

	$("#menulist").html(menus);
	$('#menulist').find('ul').addClass('in')
	$('#menulist').find('.caret').css('transform', 'rotate(0deg)')
	//	console.log($('#menulist ul').length)
	//	默认全部展开
	for(var i = 1; i <= $('#menulist ul').length; i++) {
		if($('#menulist ul:nth-child(' + i + ')').hasClass('in')) {
			//			console.log(i)
			//			$('#menulist ul:nth-child(' + i + ')').siblings('a').find('.caret').css("transform", "rotate(0deg)");

		}
	}

	$('#menulist>ul>li>a:first-child').addClass('li-active')
	$('#menulist>ul>li>a:first-child').find('.addmenu').text('添加子级菜单');
	mainContainer.editMenu = $('#menulist>ul>li>a:first-child').find('.menu').text();
	mainContainer.departParent = [{
		"id": "",
		"name": "",
		"parentId": ""
	}]

	mainContainer.depart = []
	mainContainer.departchildren = [];
}

function load() {

	loadParent()
}