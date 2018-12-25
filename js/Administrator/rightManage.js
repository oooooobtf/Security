var hasChild = false;
var isMainName;
var hasMenu;
var MainName;
var allRight; //所有权限
var checkedRight; //右边可选
var nocheckRight; //右边不可选
var isCheck;
var isCheck_label;
var userData; //登陆保存信息
var RoleManageData; //人员管理人员信息
var isCheckRole = false;
var Roleflag;
var token = sessionStorage.getItem('token');
$(function() {
	//	userData = JSON.parse(sessionStorage.getItem('userData'));//用户成功登陆信息
	RoleManageData = JSON.parse(sessionStorage.getItem('RoleManageData')); //人员管理页面跳转权限的人员信息
	if(RoleManageData !== null) {
		Roleflag = 1;
	} else {
		Roleflag = 0;
	}
	getRoleRight();
	//	$('.username>span').text(userData.userName);

})

function hiddenShow() {

}

var menus = "";
var mainContainer = new Vue({
	el: '#mainContainer',
	data: {
		roleShow: false,
		roleName: "",

		menu: "",
		btns: [],
		parentName: "",
		mainName: "",
		groupName: "",
		roles: [],
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
		//		隐藏显示下拉
		showRole: function() {
			this.roleShow = !this.roleShow;
		},
		//		角色列表
		loadRoles: function() {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + "/permission/getRoles" + '?timestamp=' + new Date().getTime(),
				async: true,
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				crossDomain: true,
				contentType: 'application/json',
				success: function(result) {
					//					self.roles = result;
					for(var i = 0; i < result.length; i++) {
						if(result[i].roleName == '管理员' || result[i].roleName == '系统员' || result[i].roleName == '监控员') {
							self.roles.push(result[i])
						}

					}
					// console.log(self.roles)
				}
			});
		},
		//		选择角色
		chooseRole: function(data) {
			this.roleName = data.roleName;
			this.id = data.id
			this.roleShow = false;
			isCheckRole = true; //
			$('input[type=checkbox]').removeAttr("checked");
			$('.checkbox-span').removeClass('checkbox-active');
			getRoleRight();
		},

	},

	mounted: function() {
		this.loadRoles();

	}
})

//删除窗口
function openExit() {
	$(".exit").show()
}

//验证
function verifyFrom(e) {
	$(e).parent().find('span.error-hint-text').hide();
	$(e).css('border-color', '#dcdfe6');
}

//一级权限a标签
function clickFirstMenu(e) {
	$(e).parents().find('#menulist').children().find('i').removeClass('caret-right')
	$(e).parents().find('#menulist').children().find('a').removeClass('li-active')
	$(e).parents().find('.addmenu').text('');
	$(e).addClass('li-active')
	$(e).find('i').addClass('caret-right')
	if($(e).siblings('ul').length > 0) {} else {
		getALlOperationRole($(e).text().trim());
		// getTools($(e).text().trim());
	}
}

//一级权限span checkbox
function clickbox(e) {
	if($(e).hasClass('checkbox-active')) {
		$(e).siblings('input').attr("checked", false)
		$(e).removeClass('checkbox-active')
		isCheck = false
	} else {
		$(e).addClass('checkbox-active')
		$(e).siblings('input').prop("checked", true)
		isCheck = true
	}
	var checkbox = $(e).parents('li').find('ul')
	if(checkbox.length > 0) {
		if($(e).hasClass('checkbox-active')) {
			checkbox.find('span').addClass('checkbox-active')
			checkbox.find('input').prop("checked", true)
			//		 	checkbox.find('input').removeAttr("disabled")
		} else {
			checkbox.find('input').attr("checked", false)
			$(e).removeClass('checkbox-active')
			checkbox.find('span').removeClass('checkbox-active')

		}
	}
	checkFirst(e);
}

//一级权限label
function clickLabel(e) {
	if($(e).siblings('span').hasClass('checkbox-active')) {
		$(e).siblings('input').prop("checked", true)
		$(e).siblings('span').removeClass('checkbox-active')
		isCheck = false
	} else {
		$(e).siblings('span').addClass('checkbox-active')
		isCheck = true
		$(e).siblings('input').attr("checked", false)
	}

	var checkbox = $(e).parents('li').find('ul')
	if(checkbox.length > 0) {
		if($(e).siblings('span').hasClass('checkbox-active')) {
			checkbox.find('span').addClass('checkbox-active')
			checkbox.find('input').prop("checked", true)
			//		 	checkbox.find('input').removeAttr("disabled")
		} else {
			checkbox.find('input').attr("checked", false)
			$(e).siblings('span').removeClass('checkbox-active')
			checkbox.find('span').removeClass('checkbox-active')

		}
	}
	checkFirst(e);
}

//二级菜单
function clickchild(e) {
	if($(e).hasClass('checkbox-active')) {
		$(e).removeClass('checkbox-active')
		$(e).siblings('input').attr('checked', false)
		isCheck_label = false
	} else {
		$(e).addClass('checkbox-active')
		isCheck_label = true;
		$(e).siblings('input').prop('checked', true)
	}
	var len = $(e).parents('ul.second-menu').find('input').length;
	var checkLen = 0;
	$(e).parents('ul.second-menu').find('input').each(function() {
		if($(this).is(':checked')) {
			checkLen++
		}
	})
	if(checkLen == 0) {
		$(e).parents('li.main-menu').find('a:first').find('input').prop("checked", false)
		$(e).parents('li.main-menu').find('a:first').find('span').removeClass('checkbox-active')
	} else {
		$(e).parents('li.main-menu').find('a:first').find('input').prop("checked", true)
		$(e).parents('li.main-menu').find('a:first').find('span').addClass('checkbox-active')
	}
	var name = $(e).siblings('label').attr('data-name')
	if(isCheckRole == true) { //选择了右边的角色
		Roleflag = 0;
	} else {
		if(Roleflag == 1) { //从角色管理页权限进来
			RoleManageData = JSON.parse(sessionStorage.getItem('RoleManageData'));
			mainContainer.roleName = RoleManageData.roleName;
			mainContainer.id = RoleManageData.roleId;
		} else {
			mainContainer.roleName = userData.roleName;
			mainContainer.id = userData.roleId;
		}
	}
	if(isCheck_label == true) {
		ulr = '/permission/addPermission?roleId=' + mainContainer.id + '&permissionName=' + encodeURI(name, "UTF-8")
	} else {
		ulr = '/permission/deletePermission?roleId=' + mainContainer.id + '&permissionName=' + encodeURI(name, "UTF-8")
	}

	$.ajax({
		type: "get",
		url: Utils.url + ulr,
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		async: true,
		contentType: 'application/json',
		success: function(result) {
			getRoleRight();
		}
	});
}

//二级label
function clickSecLabel(e) {

	if($(e).siblings('input').is(":checked")) {
		$(e).siblings('span').removeClass('checkbox-active')
		isCheck = false;
	} else {
		$(e).siblings('span').addClass('checkbox-active')
		isCheck = true;
	}
	var checkLen = 0;
	$(e).parents('ul.second-menu').find('input').each(function() {
		if($(this).siblings('span').hasClass("checkbox-active")) {
			checkLen++
		}
	})
	if(checkLen == 0) {
		$(e).parents('li.main-menu').find('a:first').find('input').attr("checked", false)
		$(e).parents('li.main-menu').find('a:first').find('span').removeClass('checkbox-active')
	} else {
		$(e).parents('li.main-menu').find('a:first').find('input').prop("checked", true)
		$(e).parents('li.main-menu').find('a:first').find('span').addClass('checkbox-active')
	}
	var name = $(e).attr('data-name')
	//	if(isCheckRole == true) {//选择了角色
	//
	//	} else {//未选择角色
	//		if(Roleflag == 1) {//人员管理页过来的
	//			RoleManageData = JSON.parse(sessionStorage.getItem('RoleManageData'));
	//			mainContainer.roleName = RoleManageData.roleName;
	//			mainContainer.id = RoleManageData.roleId;
	//		} else {
	//			mainContainer.roleName = userData.roleName;
	//			mainContainer.id = userData.roleId;
	//		}
	//	}
	if(isCheck == true) {
		ulr = '/permission/addPermission?roleId=' + mainContainer.id + '&permissionName=' + encodeURI(name, "UTF-8") + '&timestamp=' + new Date().getTime()
	} else {
		ulr = '/permission/deletePermission?roleId=' + mainContainer.id + '&permissionName=' + encodeURI(name, "UTF-8") + '&timestamp=' + new Date().getTime()
	}
	$.ajax({
		type: "get",
		url: Utils.url + ulr,
		async: true,
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			getRoleRight();
		}
	});
}

//获取对应角色的显示菜单
function getRoleRight() {

	if(isCheckRole == true) { //	选择了右边的角色

	} else {
		if(RoleManageData !== null) {
			mainContainer.roleName = RoleManageData.roleName;
			mainContainer.id = RoleManageData.roleId;
			sessionStorage.removeItem('RoleManageData');
		} else {
			mainContainer.roleName = userData.roleName;
			mainContainer.id = userData.roleId;
		}
	}

	var self = this;
	$.ajax({
		type: "get",
		url: Utils.url + '/permission/getPagePermissionByRoleName?roleName=' + encodeURI(mainContainer.roleName, "UTF-8") + '&timestamp=' + new Date().getTime(),
		async: true,
		crossDomain: true,
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			for(var i = 0; i < result.length; i++) {
				var name = $('label[data-name="' + result[i].name + '"]').text();
				if(name == result[i].name) {
					$('label[data-name="' + result[i].name + '"]').parent().find('input').prop('checked', true);
					$('label[data-name="' + result[i].name + '"]').parent().find('span').addClass('checkbox-active')
					var lis = $('label[data-name="' + result[i].name + '"]').parent().parent();
					lis.parent().siblings().find('input').prop('checked', true);
					lis.parent().siblings().find('span').addClass('checkbox-active');
				} else {}
			}
		}
	});
}

/*
 * 获取当前页面的所有操作权限
 * */
function getALlOperationRole(pageName) {
	//GET /permission/getAllPermissionsByPageName
	$.ajax({
		type: "get",
		url: Utils.url + '/permission/getAllPermissionsByPageName?pageName=' + encodeURI(pageName, "UTF-8") + '&timestamp=' + new Date().getTime(),
		async: true,
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			if(result.length > 0) {
				//              getTools(pageName,result);
			} else {
				$('.msg-input').html('')
			}

		}
	});
}

//获取页面权限
function getTools(data, resultData) {
	var self = this;
	$.ajax({
		type: "get",
		//				url: Utils.url + '/permission/getPermissionByRoleName?pageName='+data+'&roleId='+mainContainer.id,
		url: Utils.url + '/permission/getPermissionByRoleName?roleId=' + mainContainer.id + '&pageName=' + encodeURI(data, "UTF-8") + '&timestamp=' + new Date().getTime(),
		async: true,
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			creatHtml(result, resultData)
			$('.right-checkbox').children('input').prop('checked', true)
		}
	});
}

//填充右边小权限
function creatHtml(currentData, resultData) {
	var html = [];
	for(var i = 0; i < currentData.length; i++) {
		for(var j = 0; j < resultData.length; j++) {
			if(currentData[i].id == resultData[j].id) {
				resultData[j].isCheck = 1;
			}
		}
	}

	for(var i = 0; i < resultData.length; i++) {
		html.push('<div class="right-checkbox">')
		if(resultData[i].isCheck) {
			html.push('<input type="checkbox" checked="checked" id="addbtn' + i + '" class="checkbox">');
			html.push('<span class="checkbox-span checkbox-active" data-name="' + resultData[i].name + '" onclick="postRight(this)" ></span>')
		} else {
			html.push('<input type="checkbox" id="addbtn' + i + '" class="checkbox">');
			html.push('<span class="checkbox-span" data-name="' + resultData[i].name + '" onclick="postRight(this)" ></span>')
		}
		html.push('<label onclick="menuLabel(this)" for="addbtn' + i + '">' + resultData[i].name + '</label>')
		html.push('</div>')
	}
	// for(var i = 0; i < data.length; i++) {
	// 	html.push('<div class="right-checkbox">')
	// 	html.push('<input type="checkbox" id="addbtn' + i + '" class="checkbox">')
	// 	html.push('<span class="checkbox-span " data-name="' + data[i].name + '" onclick="postRight(this)" ></span>')
	// 	//		html.push('<input type="checkbox" onclick="postRight(this)" id="addbtn' + i + '" class="checkbox">')
	// 	html.push('<label onclick="menuLabel(this)" for="addbtn' + i + '">' + data[i].name + '</label>')
	// 	html.push('</div>')
	// }

	$('.msg-input').html(html.join(''))
	// $('.msg-input').find('span').addClass('checkbox-active')
	// $('.msg-input').find('input[type=checkbox]').prop('checked', true)

}

//右边打勾的小权限
function menuLabel(e) {
	var ulr;
	if(isCheckRole == true) { //选择了右边的角色

	} else {
		if(Roleflag == 1) { //从角色管理页权限进来
			RoleManageData = JSON.parse(sessionStorage.getItem('RoleManageData'));
			mainContainer.roleName = RoleManageData.roleName;
			mainContainer.id = RoleManageData.roleId;
		} else {
			mainContainer.roleName = userData.roleName;
			mainContainer.id = userData.roleId;
		}
	}
	//	mainContainer.roleName = userData.roleName;
	//	mainContainer.id = userData.roleId;
	if($(e).siblings('span').hasClass('checkbox-active')) {
		$(e).siblings('span').removeClass('checkbox-active')
		ulr = '/permission/deletePermission?roleId=' + mainContainer.id + '&permissionName=' + encodeURI($(e).siblings('span').attr('data-name'), 'UTF-8') + '&timestamp=' + new Date().getTime()
	} else {
		$(e).siblings('span').addClass('checkbox-active')
		ulr = '/permission/addPermission?roleId=' + mainContainer.id + '&permissionName=' + encodeURI($(e).siblings('span').attr('data-name'), "UTF-8") + '&timestamp=' + new Date().getTime()
	}

	$.ajax({
		type: "get",
		url: Utils.url + ulr,
		async: true,
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			getRoleRight();
		}
	});
}
//取消打勾（右边打勾的小权限）
function postRight(e) {
	var self = this;
	var ulr;
	if(isCheckRole == true) { //选择了右边的角色

	} else {
		if(Roleflag == 1) { //从角色管理页权限进来
			RoleManageData = JSON.parse(sessionStorage.getItem('RoleManageData'));
			mainContainer.roleName = RoleManageData.roleName;
			mainContainer.id = RoleManageData.roleId;
		} else {
			mainContainer.roleName = userData.roleName;
			mainContainer.id = userData.roleId;
		}
	}
	if($(e).hasClass('checkbox-active')) {
		$(e).siblings('input').attr('checked', false)
		$(e).removeClass('checkbox-active')
		ulr = '/permission/deletePermission?roleId=' + mainContainer.id + '&permissionName=' + encodeURI($(e).attr('data-name'), "UTF-8") + '&timestamp=' + new Date().getTime()
	} else {
		$(e).addClass('checkbox-active')
		$(e).siblings('input').prop('checked', true)
		ulr = '/permission/addPermission?roleId=' + mainContainer.id + '&permissionName=' + encodeURI($(e).attr('data-name'), "UTF-8") + '&timestamp=' + new Date().getTime()
	}
	$.ajax({
		type: "get",
		url: Utils.url + ulr,
		async: true,
		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		contentType: 'application/json',
		success: function(result) {
			getRoleRight();
		}
	});
}

//一级菜单全选和全不选
function checkFirst(e) {
	var name;
	var ul = $(e).parents('.main-menu').children('ul')
	var len = $(e).parents('.main-menu').children('ul').find('li').length;
	if(isCheckRole == true) { //选择了右边的角色

	} else {
		if(Roleflag == 1) { //从角色管理页权限进来
			RoleManageData = JSON.parse(sessionStorage.getItem('RoleManageData'));
			mainContainer.roleName = RoleManageData.roleName;
			mainContainer.id = RoleManageData.roleId;
		} else {
			mainContainer.roleName = userData.roleName;
			mainContainer.id = userData.roleId;
		}
	}
	//	二级菜单存在
	if(ul.length > 0) {
		for(var i = 0; i < len; i++) {
			name = ul.find('li').eq(i).find('label').attr('data-name')
			if(isCheck == true) {
				ulr = '/permission/addPermission?roleId=' + mainContainer.id + '&permissionName=' + encodeURI(name, "UTF-8") + '&timestamp=' + new Date().getTime()
			} else {
				ulr = '/permission/deletePermission?roleId=' + mainContainer.id + '&permissionName=' + encodeURI(name, "UTF-8") + '&timestamp=' + new Date().getTime()
			}

			$.ajax({
				type: "get",
				url: Utils.url + ulr,
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				async: true,
				contentType: 'application/json',
				success: function(result) {
					getRoleRight();
				}
			});
		}
		//  	二级菜单不存在
	} else {
		name = $(e).parents('.main-menu').find('label').attr('data-name');
		if(isCheck == true) {
			ulr = '/permission/addPermission?roleId=' + mainContainer.id + '&permissionName=' + encodeURI(name, "UTF-8") + '&timestamp=' + new Date().getTime()
		} else {
			ulr = '/permission/deletePermission?roleId=' + mainContainer.id + '&permissionName=' + encodeURI(name, "UTF-8") + '&timestamp=' + new Date().getTime()
		}
		$.ajax({
			type: "get",
			url: Utils.url + ulr,
			async: true,
			beforeSend: function(request) {
				request.setRequestHeader("token", token);
			},
			contentType: 'application/json',
			success: function(result) {
				getRoleRight();
			}
		});
	}

}