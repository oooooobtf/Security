var token =sessionStorage.getItem('token');
var mainContainer = new Vue({
	el: '#mainContainer',
	data: {
		videoT: "",
		imgT: "",
		cardT: "",
		videoTime: "",
		imgTime: "",
		cardTime: "",
		//		videoSelect: ["30天", "60天", "90天"],
		imgSelect: ["30天", "60天", "90天"],
		cardSelect: ["1秒", "2秒", "3秒"],
		videoShow: false,
		imgShow: false,
		cardShow: false
	},
	methods: {

		//		下拉框
		showSelect: function(flag) {
			switch(flag) {
				case 1:
					$('.video').css('border', '1px solid rgb(98, 168, 234)')
					this.videoShow = !this.videoShow
					break;
				case 2:
					$('.img').css('border', '1px solid rgb(98, 168, 234)')
					this.imgShow = !this.imgShow
					break;
				case 3:
					$('.card').css('border', '1px solid rgb(98, 168, 234)')
					this.cardShow = !this.cardShow
					break;

			}

		},
		//		选择分组状态
		chooseGroup: function(data, flag) {
			switch(flag) {
				case 1:
					this.videoShow = false
					this.videoTime = data
					$('.video').css('border', '1px solid #dddddd')
					$('.videotext').hide()
					break;
				case 2:
					this.imgShow = false
					this.imgTime = data
					$('.img').css('border', '1px solid #dddddd')
					$('.imgtext').hide()
					break;
				case 3:
					this.cardShow = false
					this.cardTime = data
					$('.card').css('border', '1px solid #dddddd')
					$('.cardtext').hide()
					break;

			}

		},

		//      提交弹框
		postPeople: function() {
			var self = this;
			var data = {
				//				videoSaveTime: self.videoTime,
				photoSaveTime: self.imgTime,
				screenIntervalTime: self.cardTime
			}

			$.ajax({
				type: "post",
				url: Utils.url + "/saveParameter" + '?timestamp=' + new Date().getTime(),
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				data: JSON.stringify(data),
				async: true,
				contentType: 'application/json',
				success: function(result) {
					if(Number(result.status) == 200) {
						Utils.noticeModelFn($('#loginHint'), "更改成功！", 1)
						self.getParameter()

					} else {

					}
				}
			});
		},
		getParameter: function() {
			var self = this;
			$.ajax({
				type: "get",
				url: Utils.url + "/getParameter" + '?timestamp=' + new Date().getTime(),
				async: true,
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				contentType: 'application/json',
				success: function(result) {
					if(Number(result.status) == 200) {
						self.imgTime = result.data.photoSaveTime;
						self.cardTime = result.data.screenIntervalTime;
					} else {

					}
				}
			});
		},
		inputBlur: function(flag) {
			var self = this;
			switch(flag) {
				case 1:
					$('.video').css('border', '1px solid #dddddd');
					setTimeout(function() {
						self.videoShow = false
						self.imgShow = false
						self.cardShow = false
					}, 300)
					break;
				case 2:
					$('.img').css('border', '1px solid #dddddd');
					setTimeout(function() {
						self.videoShow = false
						self.imgShow = false
						self.cardShow = false
					}, 300)
					break;
				case 3:
					$('.card').css('border', '1px solid #dddddd');
					setTimeout(function() {
						self.videoShow = false
						self.imgShow = false
						self.cardShow = false
					}, 300)
					break;
			}

		}

	},
	mounted: function() {
		//		this.loadTime()
		this.getParameter()

	},

})

function openExit() {
	$(".exit").show()
}

function verifyFrom(e) {
	$(e).parent().find('span.error-hint-text').hide();
	$(e).css('border-color', '#dcdfe6');
}

function postPeople() {
	//	if(mainContainer.videoTime=="") {
	//		$('.video').parent().find('span.error-hint-text').show();
	//		$('.video').css('border-color', '#f56c6c');
	//		return;
	//	}
	if(mainContainer.imgTime.length == "") {
		$('.img').parent().find('span.error-hint-text').show();
		$('.img').css('border-color', '#f56c6c');
		return;
	}

	if(mainContainer.cardTime.length == "") {
		$('.card').parent().find('span.error-hint-text').show();
		$('.card').css('border-color', '#f56c6c');
		return;
	}
	mainContainer.postPeople()

}

//监听点击空白地区下拉收起
$(document).on('click', function(e) {

	if($(e.target).parents('.video').length <= 0) { //筛选
		mainContainer.videoShow = false;
		$(".video").css({
			'border-color': '#ddd'
		})
	}
	if($(e.target).parents('.img').length <= 0) { //筛选
		mainContainer.imgShow = false;
		$(".img").css({
			'border-color': '#ddd'
		})
	}
	if($(e.target).parents('.card').length <= 0) { //通道号
		mainContainer.cardShow = false;
		$(".card").css({
			'border-color': '#ddd'
		})
	}

});