var token = sessionStorage.getItem('token');
$(function() {
	var username = sessionStorage.getItem('userName');
	$('.username').text(username);
})
var mainContainer = new Vue({
	el: '#mainContainer',
	data: {
		oldPsd: "",
		newPsd: "",
		againPsd: "",
	},
	methods: {

		//      提交弹框
		postPeople: function() {
			var self = this;
			var userData = JSON.parse(sessionStorage.getItem('userData'));
			var userID = userData.userId
			$.ajax({
				type: "post",
				beforeSend: function(request) {
					request.setRequestHeader("token", token);
				},
				url: Utils.url + "/changePassword?oldPassword=" + self.oldPsd + "&newPassword=" + self.newPsd + "&newPassword1=" + self.againPsd + '&userId=' + userID,
				//				data: data,
				async: true,
				contentType: 'application/json',
				success: function(result) {
					console.log(result)
					if(Number(result.status) == 200) {
						Utils.noticeModelFn($('#loginHint'), "更改密码成功！", 1)
						$('.add-order').hide()
						setTimeout(function() {
							window.location = 'login.html';
						}, 2000);
					} else {

					}
				}
			});
		}

	},
	mounted: function() {

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

	if(mainContainer.oldPsd.length <= 0) {
		$('#oldPsd').parent().find('span.error-hint-text').show();
		$('#oldPsd').css('border-color', '#f56c6c');
		return;
	}
	if(mainContainer.newPsd.length <= 0) {
		$('#newPsd').parent().find('span.error-hint-text').show();
		$('#newPsd').css('border-color', '#f56c6c');
		return;
	}

	if(mainContainer.againPsd.length <= 0) {
		$('#againPsd').parent().find('span.error-hint-text').show();
		$('#againPsd').css('border-color', '#f56c6c');
		return;
	}
	mainContainer.postPeople()

}