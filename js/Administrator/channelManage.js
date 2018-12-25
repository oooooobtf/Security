var isEdit;
var isSearch;
var token = sessionStorage.getItem('token');
var mainContainer = new Vue({
	el: '#mainContainer',
	data: {
		pageNum: 1,
		pageSize: 15,
		pages: 0,
		total: 0,
		isCollapse1: true,
		isCollapse2: false,
		channelIp: "",
		channelId: "",
		id: "",
		alertName: "",
		items: [],
		title: "新增通道",

	},
	methods: {
		//选择状态筛选
		selectStatus: function(e, status) {
			if($(e.target).parent().hasClass("state-active") == true) {

			} else {
				$(e.target).parent().siblings().removeClass("state-active");
				$(e.target).parent().siblings().animate({
					width: "64px"
				});
				$(e.target).parent().siblings().find("i").animate({
					opacity: 0
				});
				$(e.target).parent().addClass("state-active");
				$(e.target).parent().animate({
					width: "86px"
				});
				$(e.target).parent().find("i").animate({
					opacity: 1
				});
				//          hisList.getHistyList(0);
			}
			var str = "";
			switch(status) {
				case 0:
					str = "全部";
					break;
				case 1:
					str = "异常";
					break;
				case 2:
					str = "正常";
					break;
			}
			var data = {
				"status": str,
				"pageNum": this.pageNum,
				"pageSize": this.pageSize
			}
			var self = this;
			$.ajax({
				type: "POST",
				url: Utils.url + '/channel/getChannelByStatus' + '?timestamp=' + new Date().getTime(),
				async: true,
				data: JSON.stringify(data),
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				contentType: 'application/json',
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

		//		初始化
		loadChannel: function() {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + '/channel/getAllChannel?pageNum=' + self.pageNum + '&pageSize=' + self.pageSize + '&timestamp=' + new Date().getTime(),
				async: true,
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				success: function(result) {
					if(result.status == 200) {
						self.items = result.data.list;
						self.pageNum = result.data.pageNum;
						self.pageSize = result.data.pageSize;
						self.total = result.data.total;
						self.pages = result.data.pages;
						cutPage(self.pages, self.pageNum);
						self.$nextTick(function() {
							addTitle()
						});
						$('.el-loading-mask').hide()
					} else {

					}

				}
			});

		},

		//		打开新建编辑弹框
		openEdit: function(data, flag) {
			$('div input').css('border-color', '#dddddd');
			$('.error-hint-text').hide();
			if(flag == 1) {
				this.title = "新增通道";
				this.channelId = "";
				this.channelIp = "";
				isEdit = false;

			} else {
				this.editFlag = true;
				this.title = "编辑通道";
				this.channelId = data.channelId;
				this.channelIp = data.channelAddress;
				this.id = data.id;
				isEdit = true;
			}
			$('.add-order').show()
		},

		//		删除弹框
		openDelete: function(data) {
			this.alertName = data.channelId;
			this.id = data.channelId;
			$('.delete').show()
		},

		//		确定操作 1删除 2屏蔽 3重置
		confirmFlag: function() {
			var self = this;
			$.ajax({
				type: "delete",
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				//				url: Utils.url + "/channel/deleteChannel?channelId=" + self.id+ '&timestamp=' + new Date().getTime(),
				url: Utils.url + "/channel/deleteChannel?channelId=" + encodeURI(self.id, 'UTF-8') + '&timestamp=' + new Date().getTime(),
				async: true,
				success: function(result) {
					$('.delete').hide();
					if(result.status == 200) {
						Utils.noticeModelFn($('#loginHint'), "删除成功！", 1);
						self.loadChannel();
					} else {
						Utils.noticeModelFn($('#loginHint'), "删除失败！", 2);
					}
				}
			});
		},

		//      提交弹框
		postPeople: function() {
			var self = this;
			var ulr;
			var data;
			var msg;
			if(isEdit == true) {
				ulr = "/channel/updateChannel";
				data = {
					"channelId": self.channelId,
					"channelAddress": self.channelIp,
					"id": self.id
				}

			} else {
				ulr = "/channel/addChannel";
				data = {
					"channelId": self.channelId,
					"channelAddress": self.channelIp
				}

			}
			$.ajax({
				type: "post",
				url: Utils.url + ulr + '?timestamp=' + new Date().getTime(),
				data: JSON.stringify(data),
				async: true,
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				contentType: 'application/json',
				success: function(result) {
					if(Number(result.status) == 200) {
						$('.add-order').hide();
						Utils.noticeModelFn($('#loginHint'), '提交成功！', 1);
						self.loadChannel();
					} else {
						Utils.noticeModelFn($('#loginHint'), result.msg, 2);
					}
				},
				error: function() {
					Utils.noticeModelFn($('#loginHint'), '提交错误，请重试！', 2);
				}
			});
		}

	},
	mounted: function() {
		this.loadChannel()
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
			mainContainer.loadChannel();
			// if(isSearch == true) {
			// 	mainContainer.findByConditions();
			// } else {
			// 	mainContainer.loadChannel();
			// }
			//page:点击时返回的点击的页码，拿到该页码过后执行翻页的逻辑操作
		}
	});
}

//验证
function verifyFrom(e) {
	$(e).parent().find('span.error-hint-text').hide();
	$(e).css('border-color', '#dcdfe6');
}

//提交弹框
function postPeople() {
	var channelId = $('#channelId').val();
	var reg = /^[a-zA-Z0-9-]+$/;
	if(channelId.length <= 0) {
		$('#channelId').parent().find('span.error-hint-text').show();
		$('#channelId').css('border-color', '#f56c6c');
		$('#channelId').siblings('span').html('通过名称不能为空！');
		return;
	} else {
		if(!reg.test(channelId)) {
			$('#channelId').parent().find('span.error-hint-text').show();
			$('#channelId').siblings('span').html('通道名称由字母、-、数字组成');
			$('#channelId').css('border-color', '#f56c6c');
			return;
		}
	}
	var Ip = $('#Ip').val();
	if(Ip.length <= 0) {
		$('#Ip').parent().find('span.error-hint-text').show();
		$('#Ip').css('border-color', '#f56c6c');
		return;
	}
	if(!verifyIP(Ip)) {
		$('#Ip').parent().find('span.error-hint-text').show();
		$('#Ip').css('border-color', '#f56c6c');
		return;
	}
	mainContainer.postPeople()

}