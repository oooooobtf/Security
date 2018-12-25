var userData;
var isSearch;
var token = sessionStorage.getItem('token');
$(document).ready(function() {
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
		roleShow: false,
		roleType: "",
		roleName: "",
		roleDetail: "",
		roleTypes: ["通道入口（进X光机前）", "通道出口（出X光机后）", "安检室（查看X光机图像处）", "开包台（对可疑货物开包处）", "业务室（录入运单信息）", "机场办公室（配置及查询运单信息）"],
		id: "",
		alertName: "",
		items: [],
		title: "新建角色",
		isEdit: false

	},
	methods: {
		//		初始化人员
		loadRole: function() {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + '/role/getRole?pageNum=' + self.pageNum + '&pageSize=' + self.pageSize + '&timestamp=' + new Date().getTime(),
				async: true,
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				success: function(result) {
					if(result.status == 200) {
						if(result.data.list.length > 0) {
							$('.table-title').css('display', '')
							$('.table-container').css('background', '#ffffff')

						} else {
							$('.table-title').css('display', 'none')
							$('.table-container').css('background', 'url(../../image/empty.png) 50% #ffffff no-repeat')

						}
						self.items = result.data.list;

						for(var i in self.items) {
							if(self.items[i].roleType == '货代办公室（录入运单信息）') {
								self.items[i].roleType = '业务室（录入运单信息）'
							}
						}

						self.pageNum = result.data.pageNum;
						self.pageSize = result.data.pageSize;
						self.total = result.data.total;
						self.pages = result.data.pages;
						cutPage(self.pages, self.pageNum)
						//						hiddenShow();
						self.$nextTick(function() {
							addTitle()
							addBlackTitle();
						})
						$('.el-loading-mask').hide()
					} else {
						$('.el-loading-mask').show()
					}

				}
			});

		},

		addscroll: function(e) {
			// console.log($(e.target))
			if($(e.target).context.scrollHeight > 118) {
				$(e.target).css('overflow-y', 'scroll')
			}
		},

		//		显示下拉
		showSelect: function() {
			this.roleShow = !this.roleShow;
		},

		//		选择人员
		chooseRole: function(j) {
			var self = this;
			self.roleType = j;
			self.roleShow = false;
			$('.Role').removeClass('blueborder');
			$('.type').hide();
		},

		//		打开新建编辑弹框
		openEdit: function(data, flag) {
			this.roleShow = false;
			$('div input').css('border-color', '#dddddd');
			$('.error-hint-text').hide();
			if(flag == 1) {
				this.title = "新建角色"
				this.roleName = "";
				this.roleDetail = "";
				this.isEdit = false;
				this.roleType = "";

			} else {
				this.editFlag = true;
				this.title = "编辑角色"
				this.roleName = data.roleName;
				this.roleDetail = data.roleDesc;
				this.id = data.id;
				this.roleType = data.roleType;
				this.isEdit = true;
			}
			$('.add-order').show()
		},

		//		删除弹框
		openDelete: function(data) {
			this.alertName = data.roleName
			this.id = data.id;
			$('.delete').show()
		},

		//		确定操作 1删除 2屏蔽 3重置
		confirmFlag: function() {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + "/role/deleteRole?id=" + self.id + '&timestamp=' + new Date().getTime(),
				async: true,
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				success: function(result) {
					$('.delete').hide()
					if(result.status == 200) {
						Utils.noticeModelFn($('#loginHint'), "删除成功！", 1)
						self.loadRole()
					} else {
						Utils.noticeModelFn($('#loginHint'), "删除失败！", 2)
					}
				}
			});
		},

		//		添加获得焦点边框
		addborder: function(flag) {
			if(flag == 1) {
				$('.bigtext').css('border', '1px solid rgb(98, 168, 234)')
			} else {
				$('.bigtext').css('border', '1px solid #dddddd')
			}

		},

		//		跳转权限
		gotoRight: function(data) {
			data.roleId = data.id;
			sessionStorage.setItem('RoleManageData', JSON.stringify(data))
			window.location.href = "rightManage.html?flag=3&index=5"
		},

		//      提交弹框
		postPeople: function() {
			var self = this;
			var ulr;
			var data;
			if(self.isEdit == true) {
				ulr = "/role/editRole";
				data = {
					"roleName": self.roleName,
					"roleDesc": self.roleDetail,
					"roleType": self.roleType == '业务室（录入运单信息）' ? '货代办公室（录入运单信息）' : self.roleType,
					"id": self.id
				}
			} else {
				ulr = "/role/addRole";
				data = {
					"roleName": self.roleName,
					"roleDesc": self.roleDetail,
					"roleType": self.roleType == '业务室（录入运单信息）' ? '货代办公室（录入运单信息）' : self.roleType,

				}
			}
			$.ajax({
				type: "get",
				url: Utils.url + ulr + '?timestamp=' + new Date().getTime(),
				data: data,
				async: true,
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				contentType: 'application/json',
				success: function(result) {
					if(result.status == 200) {
						self.roleShow = false;
						Utils.noticeModelFn($('#loginHint'), "提交成功！", 1)
						$('.add-order').hide();
						self.loadRole();

					} else if(result.status == 400) {
						Utils.noticeModelFn($('#loginHint'), result.msg + "！", 2)
					}
				}
			});
		}

	},
	mounted: function() {
		this.loadRole()

	},

})

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
			mainContainer.loadRole()
			// if(isSearch == true) {
			// 	mainContainer.findByConditions()
			// } else {
			// 	mainContainer.loadRole()
			// }
			//page:点击时返回的点击的页码，拿到该页码过后执行翻页的逻辑操作
		}
	});
}

//验证输入框样式
function verifyFrom(e) {
	$(e).parent().find('span.error-hint-text').hide();
	$(e).css('border-color', '#dcdfe6');
}

//提交验证
function postPeople() {
	var reg = /^\s+|\s+$/g //空

	var roleType = $('#roleType').val();
	if(roleType.length <= 0) {
		$('.type').show();
		$('#Role').css('border-color', '#f56c6c');
		return;
	}
	var roleName = $('#roleName').val();
	if(roleName.length <= 0 || reg.test(roleName)) {
		//		$('#roleName').val('');
		$('#roleName').parent().find('span.error-hint-text').show();
		$('#roleName').css('border-color', '#f56c6c');
		return;
	}
	var bigtext = $('.bigtext').val();
	if(bigtext.replace(reg, '').length <= 0) {
		//		$('.bigtext').val($('.bigtext').val().replace(/^\s+|\s+$/g, ''))
		$('.bigtext').parent().find('span.error-hint-text').show();
		$('.bigtext').css('border-color', '#f56c6c');

		return;
	}
	mainContainer.postPeople()

}

//失去焦点
function inputBlur() {
	$('.Role').removeClass('blueborder')
	mainContainer.roleShow = false;

}

function addblue() {
	$('.Role').addClass('blueborder')
}

//添加气泡title
function addBlackTitle() {
	$('table tr td:not(:last-child)').mouseover(function(event) {
		var _this = $(this);
		//		(this.offsetWidth-1 < this.scrollWidth) {//判断是否有隐藏 ie有兼容性问题
		if($(this).context.offsetWidth - 1 < $(this).context.scrollWidth) {
			_this.justToolsTip({
				events: event,
				// animation:"flipIn",
				width: this.offsetWidth,
				contents: $(this).text(),
				gravity: 'top'
			});
		} else {

		}

	});
}

//监听点击空白地区下拉收起
$(document).on('click', function(e) {

	if($(e.target).parents('.Role').length <= 0) {
		mainContainer.roleShow = false;
		$('.Role').removeClass('blueborder');
	}

});