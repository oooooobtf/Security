var token = sessionStorage.getItem('token');
var creatTime = ''
$(function() {
	laydate.render({
		elem: '#inTime',
		theme: '#4e97d9',
		type: 'datetime',
		eventElem: '.inTime-div .time-span',
		done: function(value, date, endDate) {
			creatTime = value;
			searchTime()
			$('.inTime-div .time-span').text('')

			//				getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);
		}
	});
})

var isEdit;
var isSearch;
var status = "";
var el = null;
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
		searchTime: ""

	},
	methods: {

		//选择状态筛选
		selectStatus: function(e, flag) {
			if($(e.target).parent().hasClass("state-active") == true) {

			} else {
				$(e.target).parent().siblings().removeClass("state-active");
				$(e.target).parent().siblings().animate({
					width: "74px"
				});
				$(e.target).parent().siblings().find("i").animate({
					opacity: 0
				});
				$(e.target).parent().addClass("state-active");
				$(e.target).parent().animate({
					width: "96px"
				});
				$(e.target).parent().find("i").animate({
					opacity: 1
				});
				//          hisList.getHistyList(0);
			}
			var str = "";
			switch(flag) {
				case 0:
					str = 0;
					status = 0
					break;
				case 1:
					str = 1;
					status = 1;
					break;
				case -1:
					status = '';
					break;

			}
			

			var self = this;
			$.ajax({
				type: "GET",
				url: Utils.url + '/channel/monitor/get?pageNum=' + self.pageNum + '&pageSize=' + self.pageSize + '&state=' + str + '&time=' + creatTime + '&timestamp=' + new Date().getTime(),
				async: true,
				//				data: JSON.stringify(data),
				contentType: 'application/json',

				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				success: function(result) {
					if(result.status == 200) {
						self.items = result.data.list;
						if(result.data.list.length === 0) {

						} else {
							self.$nextTick(function() {
								tipTitle()
							});
						}
						if(result.data.list.length > 0) {
							$('.table-title').css('display', '')
							$('.table-container').css('background', '#ffffff')

						} else {
							$('.table-title').css('display', 'none')
							$('.table-container').css('background', 'url(../../image/empty.png) 50% #ffffff no-repeat')

						}

						for(var i = 0; i < self.items.length; i++) {
							self.items[i].checkOnTime = result.data.list[i].checkOnTime === null ? '' : Utils.getTimeByTimestamp((result.data.list[i].checkOnTime).toString())
							self.items[i].checkOffTime = result.data.list[i].checkOffTime === null ? '' : Utils.getTimeByTimestamp((result.data.list[i].checkOffTime).toString())
							self.items[i].unpackOnTime = result.data.list[i].unpackOnTime === null ? '' : Utils.getTimeByTimestamp((result.data.list[i].unpackOnTime).toString())
							self.items[i].unpackOffTime = result.data.list[i].unpackOffTime === null ? '' : Utils.getTimeByTimestamp((result.data.list[i].unpackOffTime).toString())
						}
						self.pageNum = result.data.pageNum;
						self.pageSize = result.data.pageSize;
						self.total = result.data.total;
						self.pages = result.data.pages;
						cutPage(self.pages, self.pageNum);

						$('.el-loading-mask').hide()

					} else {
						$('.el-loading-mask').hide()
					}

				}
			});

		},

		//		初始化
		loadChannel: function() {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + '/channel/monitor/get?pageNum=' + self.pageNum + '&pageSize=' + self.pageSize + '&timestamp=' + new Date().getTime(),
				async: true,

				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				success: function(result) {
					if(result.status == 200) {
						self.items = result.data.list;
						self.$nextTick(function() {
							tipTitle()
						});
						if(result.data.list.length > 0) {
							$('.table-title').css('display', '')
							$('.table-container').css('background', '#ffffff')

						} else {
							$('.table-title').css('display', 'none')
							$('.table-container').css('background', 'url(../../image/empty.png) 50% #ffffff no-repeat')

						}

						for(var i = 0; i < self.items.length; i++) {
							self.items[i].checkOnTime = result.data.list[i].checkOnTime === null ? '' : Utils.getTimeByTimestamp((result.data.list[i].checkOnTime).toString())
							self.items[i].checkOffTime = result.data.list[i].checkOffTime === null ? '' : Utils.getTimeByTimestamp((result.data.list[i].checkOffTime).toString())
							self.items[i].unpackOnTime = result.data.list[i].unpackOnTime === null ? '' : Utils.getTimeByTimestamp((result.data.list[i].unpackOnTime).toString())
							self.items[i].unpackOffTime = result.data.list[i].unpackOffTime === null ? '' : Utils.getTimeByTimestamp((result.data.list[i].unpackOffTime).toString())
						}
						self.pageNum = result.data.pageNum;
						self.pageSize = result.data.pageSize;
						self.total = result.data.total;
						self.pages = result.data.pages;
						cutPage(self.pages, self.pageNum);

						$('.el-loading-mask').hide()

					} else {
						$('.el-loading-mask').show()
					}

				}
			});

		},

	},
	mounted: function() {
		this.loadChannel()
		//时间选择器

	},
	created: function() {
		el = this;

	}

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

function deleteTime(e, flag) {
	$(e).siblings('input').val('')

	//	$('#time').val('');
	$(e).siblings('.time-span').show()
	$(e).siblings('.time-span').text('请选择时间')
	creatTime = '';
	mainContainer.searchTime = '';
	searchTime()

	//	getAllOrder(pageNum, pageSize, creatTime, channelId, conditions);
}

function searchTime() {
	var self = el;

	if(status === null) {
		status = ""
	} else {

	}
	$.ajax({
		type: "GET",
		url: Utils.url + '/channel/monitor/get?pageNum=' + el.pageNum + '&pageSize=' + el.pageSize + '&state=' + status + '&time=' + creatTime + '&timestamp=' + new Date().getTime(),
		async: true,
		//				data: JSON.stringify(data),
		contentType: 'application/json',

		beforeSend: function(request) {
			request.setRequestHeader("token", token);
		},
		success: function(result) {
			if(result.status == 200) {
				self.items = result.data.list;
				if(result.data.list.length === 0) {

				} else {
					self.$nextTick(function() {
						tipTitle()
					});
				}
				if(result.data.list.length > 0) {
					$('.table-title').css('display', '')
					$('.table-container').css('background', '#ffffff')

				} else {
					$('.table-title').css('display', 'none')
					$('.table-container').css('background', 'url(../../image/empty.png) 50% #ffffff no-repeat')

				}
				for(var i = 0; i < self.items.length; i++) {
					self.items[i].checkOnTime = result.data.list[i].checkOnTime === null ? '' : Utils.getTimeByTimestamp((result.data.list[i].checkOnTime).toString())
					self.items[i].checkOffTime = result.data.list[i].checkOffTime === null ? '' : Utils.getTimeByTimestamp((result.data.list[i].checkOffTime).toString())
					self.items[i].unpackOnTime = result.data.list[i].unpackOnTime === null ? '' : Utils.getTimeByTimestamp((result.data.list[i].unpackOnTime).toString())
					self.items[i].unpackOffTime = result.data.list[i].unpackOffTime === null ? '' : Utils.getTimeByTimestamp((result.data.list[i].unpackOffTime).toString())
				}
				self.pageNum = result.data.pageNum;
				self.pageSize = result.data.pageSize;
				self.total = result.data.total;
				self.pages = result.data.pages;
				cutPage(self.pages, self.pageNum);

				$('.el-loading-mask').hide()

			} else {
				$('.el-loading-mask').show()
			}

		}
	});
}

//hover时提示框
function tipTitle() {
	$('.just-tooltip').remove();
	$("#tableBox").bind('mouseover').on('mouseover', 'td:not(".channelIP")', function(event) {
		var text = $(this).text();
		var className = $(this).attr('class');
		/*if (this.offsetWidth < this.scrollWidth ) {//判断是否有隐藏 ie有兼容性问题
		    var _this = $(this);

		    _this.justToolsTip({
		        events:event,
		        // animation:"flipIn",//ie下使用动画要卡顿
		        width:this.offsetWidth+'px',
		        contents:$(this).text(),
		        gravity:'top'
		    });
		}*/
		var _this = $(this);
		if(text != '' && className != 'channelIP' && text != '查看') {
			_this.justToolsTip({
				events: event,
				// animation:"flipIn",//ie下使用动画要卡顿
				width: this.offsetWidth + 'px',
				contents: $(this).text(),
				gravity: 'top'
			});
		}
	});
	$(".tip-box").bind('mouseover').on('mouseover', function(event) {
		// $('.just-tooltip').remove();
		var className = $(this).parent().attr('class');
		if(className == 'channelIP') {
			var _this = $(this);
			_this.justToolsTip({
				events: event,
				width: this.offsetWidth,
				contents: $(this).text(),
				gravity: 'top'
			});
		}
	});
}