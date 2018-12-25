var photo;
var isSearch;
var formData = new FormData()
var haveRole;
var userData;
var token = sessionStorage.getItem('token');

$(function() {
	//状态选择
	stateActive();

	laydate.render({
		elem: '#screenTime',
		eventElem: '.time-span',
		max: DateUtils.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
		//type: "datetime",
		//        range: "至",
		theme: "#62a8ea",
		done: function(value, date, endDate) {
			$('.time-span').text('')
			mainContainer.searchTime = value;
			mainContainer.findByConditions()
		},
	});
	laydate.render({
		elem: '#formTime',
		max: DateUtils.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
		//type: "datetime",
		//        range: "至",
		theme: "#62a8ea",
		done: function(value, date, endDate) {
			$('span.timetext').hide();
			// $(e).css('border-color', '#dcdfe6');
			mainContainer.form.deviceTime = value;
		},
	});

})

var mainContainer = new Vue({
	el: '#mainContainer',
	data: {
		pageNum: 1,
		pageSize: 15,
		pages: 0,
		total: 0,
		selectChannelShow: false,
		selectRoleShow: false,
		selectRole: "",
		selectChannel: "",
		selectRole_: "",
		selectChannel_: "",
		form: {
			deviceId: "",
			deviceIp: "",
			channelNo: "",
			vendor: "",
			deviceType: "",
			deviceRole: "",
			deviceTime: "",
			channelShow: false,
			vendorShow: false,
			TypeShow: false,
			RoleShow: false,
			id: ""
		},
		status: "",
		role: "",
		selectRoles: [],
		roles: [],
		deviceType: ["通道入口（进X光机前）", "通道出口（出X光机后）", "安检室（查看X光机图像处）", "开包台（对可疑货物开包处）", "业务室（录入运单信息）", "机场办公室（配置及查询运单信息）"],
		imgurl: "",
		channelNo: [],
		searchTime: "",
		editFlag: false,
		conditions: "",
		items: [],
		title: "新增设备",
		alertName: "",
		all: "全部"

	},
	methods: {
		loadSecRoles: function() {
			var self = this;
			$.ajax({
				type: "get",
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				url: Utils.url + '/device/findRole' + '?timestamp=' + new Date().getTime(),
				async: true,
				success: function(result) {
					self.selectRoles = result;
				}
			});
		},

		loadroles: function() {
			var self = this;
			$.ajax({
				type: "get",
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				url: Utils.url + '/role/getRoleTypeList_device' + '?timestamp=' + new Date().getTime(),
				async: true,
				success: function(result) {
					self.roles = result;
				}
			});
		},
		addborder: function(e) {
			$(e.target).css('border', '1px solid rgb(98, 168, 234)')
		},
		emptyTime: function(flag) {
			if(flag == 1) {
				this.searchTime = "";
				$('.time-span').text('请选择日期')
				setTimeout(function() {
					mainContainer.findByConditions()
				}, 50)
			} else {
				this.form.deviceTime = "";

			}

		},
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

			switch(status) {
				case 0:
					this.status = "";
					break;
				case 1:
					this.status = "异常";
					break;
				case 2:
					this.status = "正常";
					break;
			}
			this.findByConditions()

		},

		//		获得通道号
		loadChannelNo: function() {
			var self = this;
			$.ajax({
				type: "get",
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				url: Utils.url + '/channel/getALlChannelId' + '?timestamp=' + new Date().getTime(),
				async: true,
				success: function(result) {
					self.channelNo = result;

				}
			});
		},
		//		下拉框
		showSelect: function(flag) {
			var self = this;
			switch(flag) {
				case 1:
					$('.channelNo').css('border', '1px solid rgb(98, 168, 234)')
					this.form.channelShow = !this.form.channelShow
					break;
				case 2:
					$('.vendor').css('border', '1px solid rgb(98, 168, 234)')
					this.form.vendorShow = !this.form.vendorShow
					break;
				case 3:
					$('.Type').css('border', '1px solid rgb(98, 168, 234)')
					this.form.TypeShow = !this.form.TypeShow
					break;
				case 4:
					if(self.roles.length == 0) {

					} else {
						$('.Role').css('border', '1px solid rgb(98, 168, 234)')
						this.form.RoleShow = !this.form.RoleShow
					}

					break;
				case 5:
					$('.RoleSelect').css('border', '1px solid rgb(98, 168, 234)')
					this.selectRoleShow = !this.selectRoleShow
					if(this.selectRoleShow == false) {
						$('.RoleSelect').css('border', '1px solid #dddddd')
					}
					break;
				case 6:
					$('.ChannelSelect').css('border', '1px solid rgb(98, 168, 234)')
					this.selectChannelShow = !this.selectChannelShow
					if(this.selectChannelShow == false) {
						$('.ChannelSelect').css('border', '1px solid #dddddd')
					}
					break;

			}

		},

		//		选择分组状态
		chooseGroup: function(data, flag) {
			switch(flag) {
				case 1:
					this.selectRoleShow = false
					this.selectRole_ = data
					this.selectRole = data;
					$('.RoleSelect').css('border', '1px solid #dddddd')
					this.findByConditions()
					break;
				case 2:
					this.selectChannelShow = false
					this.selectChannel_ = data
					this.selectChannel = data;
					$('.ChannelSelect').css('border', '1px solid #dddddd')
					this.findByConditions()
					break;
				case 3:
					this.form.channelShow = false
					this.form.channelNo = data
					$('.channelNo').css('border', '1px solid #dddddd')
					$('.channeltext').hide()
					break;
				case 4:
					this.form.TypeShow = false
					this.form.deviceType = data;
					this.form.deviceRole = '';

					if(data == '业务室（录入运单信息）') {
						//					this.form.deviceType = '';
						this.loadRole('货代办公室（录入运单信息）')
					} else {
						//					this.form.deviceType = data.deviceType;
						this.loadRole(data)
					}

//					this.loadRole(data);
					$('.Type').css('border', '1px solid #dddddd')
					$('.typetext').hide()
					$('#deviceRole').css('cursor', 'default')
					$('.device-span').css('cursor', 'default');
					$('#deviceRole').attr('placeholder', '请先选择角色');
					break;
				case 5:
					this.form.RoleShow = false
					this.form.deviceRole = data
					$('.Role').css('border', '1px solid #dddddd')
					$('.roletext').hide()
					break;
			}

		},
		loadRole: function(data) {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + '/role/getRoleListByType?roleType=' + encodeURI(data, 'UTF-8') + '&timestamp=' + new Date().getTime(),
				async: true,
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				success: function(result) {
					// console.log(result)
					if(result.length == 0) {
						$('.Role').attr('pointer-events', 'none')
						self.form.deviceRole = "无数据";
						haveRole = false;
						$('#deviceRole').css('cursor', 'not-allowed')
						self.roles = [];

					} else {
						if(self.editFlag == true) {

						} else {
							self.form.deviceRole = "";
						}
						//                      	self.form.deviceRole="";
						haveRole = true;
						self.roles = result;
						$('#deviceRole').css('cursor', 'default')
					}

				}
			});
		},
		//		初始化人员
		loadDevice: function() {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + '/device/getAllDevice?pageNum=' + self.pageNum + '&pageSize=' + self.pageSize + '&timestamp=' + new Date().getTime(),
				async: true,
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				success: function(result) {
					if(result.status == 200) {
						self.items = result.data.list;
						for(var i = 0; i < result.data.list.length; i++) {
							self.items[i].deviceProduceDate = Utils.getTimeByTimestamp(String(result.data.list[i].deviceProduceDate))
							if(self.items[i].deviceType == '货代办公室（录入运单信息）') {
								self.items[i].deviceType = '业务室（录入运单信息）';
							}
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
			$('#deviceRole').removeAttr('placeholder');
			$('#deviceRole1').removeClass('placeholder');
			this.roles = [];
			if(flag == 1) {
				this.title = "新增设备"
				this.form.channelNo = "";
				this.form.deviceId = "";
				this.form.deviceIp = "";
				this.form.vendor = "";
				this.editFlag = false;
				this.form.deviceType = "";
				this.form.deviceRole = "";
				this.form.deviceTime = "";
				if(this.roles.length == 0) {
					$('#deviceRole').css('cursor', 'not-allowed')
					$('.device-span').css('cursor', 'not-allowed');
					$('#deviceRole').attr('placeholder', '请先选择设备类型');

				} else {

				}

			} else {
				this.editFlag = true;
				this.title = "编辑设备"
				this.form.channelNo = data.channelId;
				this.form.deviceId = data.deviceId;
				this.form.deviceIp = data.deviceIp;
				this.form.vendor = data.deviceProducer;
				this.form.deviceType = data.deviceType;
				this.form.deviceRole = data.deviceRole;
				this.form.deviceTime = data.deviceProduceDate.substring(0, 11);
				this.form.id = data.id;

				if(data.deviceType == '业务室（录入运单信息）') {
					//					this.form.deviceType = '';
					this.loadRole('货代办公室（录入运单信息）')
				} else {
					//					this.form.deviceType = data.deviceType;
					this.loadRole(this.form.deviceType)
				}
				$('#deviceRole').css('cursor', 'default')
				$('.device-span').css('cursor', 'default');
				// console.log(this.form.deviceType)

			}
			$('.add-order').show()
		},
		alertMsg: function() {
			if(this.roles.length == 0) {
				$('.device-span').css('cursor', 'not-allowed');
				$('#deviceRole').css('cursor', 'not-allowed')
				$('#deviceRole1').addClass('placeholder');
				$('#deviceRole').attr('placeholder', '请先选择左侧的设备类型');

			} else {

			}
		},

		//		删除弹框
		openDelete: function(data) {
			this.alertName = data.deviceId
			this.form.id = data.id;
			$('.delete').show()
		},

		//		确定操作 1删除 2屏蔽 3重置
		confirmFlag: function() {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + "/device/deleteDevice?id=" + self.form.id + '&timestamp=' + new Date().getTime(),
				async: true,
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
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
			var textSpan = $(".state-list>span.state-active>a").html();
			self.status = textSpan;
			var ulr1 = "";
			var ulr2 = "";
			var ulr3 = "";
			var ulr4 = "";
			var ulr5 = "";

			//角色
			if(self.selectRole == "") {

			} else if(self.selectRole == "全部") {

			} else {
				ulr1 = "&role=" + encodeURI(self.selectRole_, 'UTF-8')
			}
			//通道号
			if(self.selectChannel == "") {

			} else if(self.selectChannel == "全部") {

			} else {
				ulr2 = "&channelId=" + encodeURI(self.selectChannel, 'UTF-8')
			}
			//条件
			if(self.conditions !== '') {
				ulr3 = "&conditions=" + encodeURI(self.conditions, 'UTF-8')
			}
			//状态
			if(textSpan == '全部') {

			} else {
				ulr4 = "&status=" + encodeURI(self.status, 'UTF-8')
			}
			//日期
			if(self.searchTime == "") {

			} else {
				ulr5 = "&date=" + encodeURI(self.searchTime, 'UTF-8')
			}

			//			if(self.selectChannel == "全部") {
			//				self.selectChannel_="";
			//				
			//			}
			//			if(self.selectRole == "全部") {				
			//              self.selectRole_ = "";
			//				
			//			}

			$.ajax({
				type: "get",
				url: Utils.url + "/device/findDevice?pageNum=" + self.pageNum + "&pageSize=" + self.pageSize + ulr1 +
					ulr2 + ulr3 + ulr4 + ulr5 + '&timestamp=' + new Date().getTime(),
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},

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
						for(var i = 0; i < result.data.list.length; i++) {
							self.items[i].deviceProduceDate = Utils.getTimeByTimestamp(String(result.data.list[i].deviceProduceDate))
							if(self.items[i].deviceType == '货代办公室（录入运单信息）') {
								self.items[i].deviceType = '业务室（录入运单信息）';
							}
						}
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
				ulr = "/device/addDevice"
				data = {
					channelId: self.form.channelNo,
					deviceId: self.form.deviceId,
					deviceIp: self.form.deviceIp,
					deviceProduceDate: self.form.deviceTime,
					deviceProducer: self.form.vendor,
					deviceRole: haveRole == true ? self.form.deviceRole : "",
					deviceType: self.form.deviceType == '业务室（录入运单信息）' ? '货代办公室（录入运单信息）' : self.form.deviceType
				}

			} else {
				ulr = "/device/editDevice";
				data = {
					channelId: self.form.channelNo,
					deviceId: self.form.deviceId,
					deviceIp: self.form.deviceIp,
					deviceProduceDate: self.form.deviceTime,
					deviceProducer: self.form.vendor,
					deviceRole: haveRole == true ? self.form.deviceRole : "",
					deviceType: self.form.deviceType == '业务室（录入运单信息）' ? '货代办公室（录入运单信息）' : self.form.deviceType,
					id: self.form.id
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
						Utils.noticeModelFn($('#loginHint'), "提交成功！", 1)
						$('.add-order').hide()
						self.loadDevice()
					} else if(Number(result.status) == 400) {
						Utils.noticeModelFn($('#loginHint'), result.msg + "!", 2)
					}
				}
			});
		},
		inputBlur: function(flag) {
			switch(flag) {
				case 1:
					$('.RoleSelect').css('border', '1px solid #dddddd');
					setTimeout(function() {
						mainContainer.selectRoleShow = false
					}, 200)
					break;
				case 2:
					$('.ChannelSelect').css('border', '1px solid #dddddd');
					setTimeout(function() {
						mainContainer.selectChannelShow = false
					}, 200)
					break;
				case 3:
					$('.channelNo').css('border', '1px solid #dddddd');
					setTimeout(function() {
						mainContainer.form.channelShow = false
					}, 200)
					break;
				case 4:
					$('.Type').css('border', '1px solid #dddddd');
					setTimeout(function() {
						mainContainer.form.TypeShow = false
					}, 200)
					break;
				case 5:
					$('.Role').css('border', '1px solid #dddddd');
					setTimeout(function() {
						mainContainer.form.RoleShow = false
					}, 200)
					break;
			}

		}

	},
	mounted: function() {
		this.loadDevice();
		this.loadChannelNo();
		this.loadSecRoles()
		//		this.loadroles();
	},

})

// 状态选择
function stateActive() {
	$(".state-list>span").click(function() {
		$(this).addClass('state-active').siblings('span').removeClass('state-active');
		$(this).animate({
			'width': '84px'
		});
		$(this).find('i').animate({
			opacity: 1
		});
		$(this).siblings('span').animate({
			'width': '64px'
		});
		$(this).siblings('span').find('i').animate({
			opacity: 0
		});
		mainContainer.findByConditions()
	})
}

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

function verifyFrom(e) {
	$(e).parent().find('span.error-hint-text').hide();
	$(e).css('border-color', '#dcdfe6');
}

function postPeople() {

	var deviceId = $('#deviceId').val();
	if(deviceId.length <= 0) {
		$('#deviceId').parent().find('span.error-hint-text').show();
		$('#deviceId').css('border-color', '#f56c6c');
		return;
	}
	var deviceIp = $('#deviceIp').val();
	if(deviceIp.length <= 0) {
		$('#deviceIp').parent().find('span.error-hint-text').show();
		$('#deviceIp').css('border-color', '#f56c6c');
		return;
	}
	if(!verifyIP(deviceIp)) {
		$('#deviceIp').parent().find('span.error-hint-text').show();
		$('#deviceIp').css('border-color', '#f56c6c');
		return;
	}

	//	$(e).val($(e).val().replace(/^\s+|\s+$/g, ''))
	//if((mainContainer.form.vendor).replace(/^\s+|\s+$/g, '')=="") {
	if(mainContainer.form.vendor == "") {
		$('#vendor').parent().find('span.error-hint-text').show();
		$('#vendor').css('border-color', '#f56c6c');
		return;
	}
	if(mainContainer.form.deviceType == "") {
		$('.typetext').css('display', 'block');
		$('#deviceType').css('border-color', '#f56c6c');
		return;
	}
	if(haveRole == false) {

	} else {
		if(mainContainer.form.deviceRole == "") {
			$('.roletext').css('display', 'block');
			$('#deviceRole').css('border-color', '#f56c6c');
			return;
		}
	}

	if(mainContainer.form.deviceTime == "") {
		$('.timetext').css('display', 'block');
		$('#deviceRole').css('border-color', '#f56c6c');
		return;
	}

	mainContainer.postPeople()

}

//监听点击空白地区下拉收起
$(document).on('click', function(e) {

	if($(e.target).parents('.RoleSelect').length <= 0) { //筛选
		mainContainer.selectRoleShow = false;
		$(".RoleSelect").css({
			'border-color': '#ddd'
		})
	}
	if($(e.target).parents('.ChannelSelect').length <= 0) { //筛选
		mainContainer.selectChannelShow = false;
		$(".ChannelSelect").css({
			'border-color': '#ddd'
		})
	}
	if($(e.target).parents('.channelNo').length <= 0) { //通道号
		mainContainer.form.channelShow = false;
		$(".channelNo").css({
			'border-color': '#ddd'
		})
	}
	if($(e.target).parents('.Type').length <= 0) {
		mainContainer.form.TypeShow = false;
		$(".Type").css({
			'border-color': '#ddd'
		})
	}
	if($(e.target).parents('.Role').length <= 0) {
		mainContainer.form.RoleShow = false;
		$(".Role").css({
			'border-color': '#ddd'
		})
	}

});