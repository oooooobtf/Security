var photo;
var isSearch;
var formData = new FormData()
var userData;
var token = sessionStorage.getItem('token');

$(function() {
	laydate.render({
		elem: '#screenTime',
		//type: "datetime",
		//        range: "至",
		theme: "#62a8ea",
		done: function(value, date, endDate) {
			mainContainer.searchTime = value;
			mainContainer.findByConditions()
		},
	});
	laydate.render({
		elem: '#formTime',
		//type: "datetime",
		//        range: "至",
		theme: "#62a8ea",
		done: function(value, date, endDate) {
			mainContainer.form.deviceTime = value;
			//          findByConditions()
		},
	});

	//	userData = JSON.parse(sessionStorage.getItem('userData'));
	//	$('.username>span').text(userData.userName);

})

var mainContainer = new Vue({
	el: '#mainContainer',
	data: {
		pageNum: 1,
		pageSize: 15,
		pages: 0,
		total: 0,
		conditions: "",
		form: {
			userId: "",
			username: "",
			cardId: "",
			manager: "",
			tel: "",
			role: "",
			id: "",
			roleShow: false
		},
		roles: [],
		editFlag: false,
		conditions: "",
		items: [],
		title: "新增货代",
		alertName: "",

	},
	methods: {
		loadroles: function() {
			var self = this;
			$.ajax({
				type: "get",
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				url: Utils.url + '/role/getRoleTypeList_proxy',
				async: true,
				success: function(result) {
					self.roles = result;
				}
			});
		},
		addborder: function(e) {
			$(e.target).css('border', '1px solid rgb(98, 168, 234)')
		},

		//		下拉框
		showSelect: function() {
			$('.role').css('border', '1px solid rgb(98, 168, 234)')
			this.form.roleShow = !this.form.roleShow
		},

		//		选择分组状态
		chooseGroup: function(data) {

			this.form.roleShow = false
			this.form.role = data
			$('.role').css('border', '1px solid #dddddd')
			$('.roletext').hide()

		},

		//		初始化人员
		loadConsignor: function() {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + '/proxy/getProxyList?pageNum=' + self.pageNum + '&pageSize=' + self.pageSize + '&timestamp=' + new Date().getTime(),
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
						for(var i = 0; i < result.data.list.length; i++) {
							self.items[i].deviceProduceDate = Utils.getTimeByTimestamp(String(result.data.list[i].deviceProduceDate))
						}
						self.pageNum = result.data.pageNum;
						self.pageSize = result.data.pageSize;
						self.total = result.data.total;
						self.pages = result.data.pages;
						isSearch = false;
						cutPage(self.pages, self.pageNum)
						self.$nextTick(function() {
							addTitle()
						})
						$('.el-loading-mask').hide()
					} else {
						$('.el-loading-mask').show()
					}
				}
			});

		},

		//		打开新建编辑弹框
		openEdit: function(data, flag) {
			$('div input').css('border-color', '#dddddd');
			$('.error-hint-text').hide();
			if(flag == 1) {
				this.editFlag = false;
				this.title = "新增货代"
				this.form.userId = "";
				this.form.username = "";
				this.form.cardId = "";
				this.form.manager = "";
				this.form.tel = "";
				this.form.role = "";
			} else {
				this.editFlag = true;
				this.title = "编辑货代"
				this.form.userId = data.userid;
				this.form.username = data.username;
				this.form.cardId = data.cardId;
				this.form.manager = data.manager;
				this.form.tel = data.telphone;
				this.form.role = data.roleName;
				this.form.id = data.id;

			}
			$('.add-order').show()
		},

		//		删除弹框
		openDelete: function(data) {
			this.alertName = data.username
			this.form.id = data.id;
			$('.delete').show()
		},

		//		确定操作 1删除 2屏蔽 3重置
		confirmFlag: function() {
			var self = this;
			$.ajax({
				type: "post",
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				url: Utils.url + "/proxy/deleteProxy?id=" + self.form.id + '&timestamp=' + new Date().getTime(),
				async: true,
				success: function(result) {
					$('.delete').hide()
					if(result.status == 200) {
						Utils.noticeModelFn($('#loginHint'), "删除成功！", 1)
						self.findByConditions()
					} else {
						Utils.noticeModelFn($('#loginHint'), "删除失败！", 2)
					}

				}
			});
		},

		//		筛选
		findByConditions: function() {
			var self = this;

			$.ajax({
				type: "post",
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				url: Utils.url + "/proxy/findProxyByCondition?pageNum=" + self.pageNum + "&pageSize=" + self.pageSize + "&condition=" + encodeURI(self.conditions, 'UTF-8') + '&timestamp=' + new Date().getTime(),

				//			    	processData: false,
				//			    	contentType:false,
				//			    	mimeType:"multipart/form-data",
				success: function(result) {
					if(result.status == 200) {
						if(result.data.list.length > 0) {
							$('.table-title').css('display', '')
							$('.table-container').css('background', '#ffffff')
						} else {
							$('.table-title').css('display', 'none')
							$('.table-container').css('background', 'url(../../image/empty.png) 50% #ffffff no-repeat')
						}
						self.items = result.data.list
						self.pageNum = result.data.pageNum;
						self.pageSize = result.data.pageSize;
						self.total = result.data.total;
						self.pages = result.data.pages;
						cutPage(self.pages, self.pageNum)
						$('.el-loading-mask').hide()
					} else {
						$('.el-loading-mask').show()
					}
				}
			});

		},

		compareValue: function(e) {
			$(e.target).css("border", "solid 1px #dddddd")

		},

		//      提交弹框
		postPeople: function() {
			var self = this;
			var ulr;
			var data;
			if(self.editFlag == false) {
				ulr = "/proxy/addProxy"
				data = {
					userId: self.form.userId,
					userName: self.form.username,
					cardId: self.form.cardId,
					manager: self.form.manager,
					telphone: self.form.tel,
					roleName: self.form.role,

				}
			} else {
				ulr = "/proxy/editProxy";
				data = {
					userId: self.form.userId,
					userName: self.form.username,
					cardId: self.form.cardId,
					manager: self.form.manager,
					telphone: self.form.tel,
					roleName: self.form.role,
					id: self.form.id
				}

			}
			$.ajax({
				type: "post",
				url: Utils.url + ulr + '?timestamp=' + new Date().getTime(),
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				data: JSON.stringify(data),
				async: true,
				contentType: 'application/json',
				success: function(result) {
					if(Number(result.status) == 200) {
						Utils.noticeModelFn($('#loginHint'), "提交成功！", 1)
						$('.add-order').hide()
						self.loadConsignor()
					} else if(Number(result.status) == 400) {
						Utils.noticeModelFn($('#loginHint'), result.msg + "！", 2)

					}
				}
			});
		},
		inputBlur: function() {

			$('.role').css('border', '1px solid #dddddd');
			setTimeout(function() {
				mainContainer.form.roleShow = false
			}, 200)

		}

	},
	mounted: function() {
		this.loadConsignor();
		this.loadroles()

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
			if(isSearch == true) {
				mainContainer.findByConditions()
			} else {
				mainContainer.loadDevice()
			}
			//page:点击时返回的点击的页码，拿到该页码过后执行翻页的逻辑操作

			//			getAllPeople(pageNum, pageSize, creatTime, channelId, conditions)
		}
	});
}

//验证样式
function verifyFrom(e) {
	$(e).parent().find('span.error-hint-text').hide();
	$(e).css('border-color', '#dcdfe6');
}

//验证空提交
function postPeople() {
	var reg = /^\s+|\s+$/g //空
	var regnum = /[^0-9]/g //数字
	var regZh = /[^\u4E00-\u9FA5A-Za-z]/g //中文
//	console.log($('#username').val().length)
	if($('#userid').val().length <= 0 || regnum.test($('#userid').val())) {
		//		$('#userid').val('');
		$('#userid').parent().find('span.error-hint-text').show();
		$('#userid').css('border-color', '#f56c6c');
		return;
	}

	if(reg.test($('#username').val()) || regZh.test($('#username').val()) || $('#username').val().length <= 0) {
		//		$('#username').val('');
		$('#username').parent().find('span.error-hint-text').show();
		$('#username').css('border-color', '#f56c6c');
		return;
	}

	if($('#cardId').val().length <= 0 || regnum.test($('#cardId').val())) {
		//		$('#cardId').val('');
		$('#cardId').parent().find('span.error-hint-text').show();
		$('#cardId').css('border-color', '#f56c6c');
		return;
	}
	if(reg.test($('#manager').val()) || regZh.test($('#manager').val()) || $('#manager').val().length <= 0) {
		//		$('#manager').val('');
		$('#manager').parent().find('span.error-hint-text').show();
		$('#manager').css('border-color', '#f56c6c');
		return;
	}
	if($('#tel').val().length <= 0 || regnum.test($('#tel').val())) {
		//		$('#tel').val('');
		$('#tel').parent().find('span.error-hint-text').show();
		$('#tel').css('border-color', '#f56c6c');
		return;
	}
	if($('#role').val().length <= 0) {
		$('.roletext').css('display', 'block');
		$('#role').css('border-color', '#f56c6c');
		return;
	}

	mainContainer.postPeople()

}

//监听点击空白地区下拉收起
$(document).on('click', function(e) {

	if($(e.target).parents('.role').length <= 0) {
		mainContainer.form.roleShow = false;
		$(".role").css({
			'border-color': '#ddd'
		})
	}

});