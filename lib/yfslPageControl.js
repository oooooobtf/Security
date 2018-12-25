/*!
 * 作者：杜东梅，郑磊，赵华林
 * 时间：2017-11-08
 * 描述： 公用的方法
 * 使用方法：Comm.getNowDateChangeTimestamp();
 */

/*     分页 插件
 *  使用方法：
 *  js代码：
 * $("#paging").CreatePage({
 *		pageCount: 10,//总页数
 *		current: 1,//当前页码
 *		backFn: function (page) {
 *			//page:点击时返回的点击的页码，拿到该页码过后执行翻页的逻辑操作
 *		}
 *	});
 *
 * HTML代码：
 * 外围的div的容器的div的class比必须是page-turning，如果需要其他的页码样式，可以重写css里面的样式，或者重新定义这个div的class的名字
 * <div class="page-turning" id="paging"></div>
 * */

(function($) {
	var ms = {
		init: function(obj, args) {
			return(function() {
				ms.fillHtml(obj, args);
				ms.bindEvent(obj, args);
			})();
		},
		//填充html
		fillHtml: function(obj, args) {
			return(function() {
				obj.empty();
				//首页

				//上一页
				if(args.current > 1) {
					obj.append('<a href="javascript:;" class="prevPage"><b><</b> </a>');
				} else {
					obj.remove('.prevPage');
					obj.append('<a class="disabled"><b><</b></a>');
				}
				//中间页码
				if(args.current != 1 && args.current >= 4 && args.pageCount != 4) {
					obj.append('<a href="javascript:;" class="tcdNumber"  >' + 1 + '</a>');
				}
				if(args.current - 2 > 2 && args.current <= args.pageCount && args.pageCount > 5) {
					obj.append('<a>...</a>');
				}
				var start = args.current - 2,
					end = args.current + 2;
				if((start > 1 && args.current < 4) || args.current == 1) {
					end++;
				}
				if(args.current > args.pageCount - 4 && args.current >= args.pageCount) {
					start--;
				}
				for(; start <= end; start++) {
					if(start <= args.pageCount && start >= 1) {
						if(start != args.current) {
							obj.append('<a href="javascript:void(0);" class="tcdNumber">' + start + '</a>');
						} else {
							obj.append('<a class="current">' + start + '</a>');
						}
					}
				}
				if(args.current + 2 < args.pageCount - 1 && args.current >= 1 && args.pageCount > 5) {
					obj.append('<a>...</a>');
				}
				if(args.current != args.pageCount && args.current < args.pageCount - 2 && args.pageCount != 4) {
					obj.append('<a href="javascript:void(0);" class="tcdNumber">' + args.pageCount + '</a>');
				}
				//下一页
				if(args.current < args.pageCount) {
					obj.append('<a href="javascript:void(0);" class="nextPage"><b>></b></a>');
				} else {
					obj.remove('.nextPage');
					obj.append('<a class="disabled"><b>></b></a>');
				}


			})();
		},
		//绑定事件
		bindEvent: function(obj, args) {
			return(function() {
				obj.unbind('click');

				obj.on("click", "a.tcdNumber", function() {
					var current = parseInt($(this).text());
					ms.fillHtml(obj, {
						"current": current,
						"pageCount": args.pageCount
					});
					if(typeof(args.backFn) == "function") {
						args.backFn(current);
					}
				});
				//上一页
				obj.on("click", "a.prevPage", function() {
					var current = parseInt(obj.children("a.current").text());
					ms.fillHtml(obj, {
						"current": current - 1,
						"pageCount": args.pageCount
					});
					if(typeof(args.backFn) == "function") {
						args.backFn(current - 1);
					}
				});
				//下一页
				obj.on("click", "a.nextPage", function() {
					var current = parseInt(obj.children("a.current").text());
					//console.log(current);
					ms.fillHtml(obj, {
						"current": current + 1,
						"pageCount": args.pageCount
					});
					if(typeof(args.backFn) == "function") {
						args.backFn(current + 1);
					}
				});
				//首页
        obj.on("click",'a.homePage',function () {
          var current = parseInt(obj.children("a.current").text());
          ms.fillHtml(obj, {
            "current": 1,
            "pageCount": args.pageCount
          });
          if(typeof(args.backFn) == "function") {
            args.backFn(1);
          }
        });
        //尾页
        obj.on("click",'a.endPage',function () {

          ms.fillHtml(obj, {
            "current": args.pageCount,
            "pageCount": args.pageCount
          });
          if(typeof(args.backFn) == "function") {
            args.backFn(args.pageCount);
          }
        })
			})();
		}
	}
	$.fn.CreatePage = function(options) {
		var args = $.extend({
			pageCount: 10,
			current: 1,
			backFn: function() {}
		}, options);
		ms.init(this, args);
	}
})(jQuery);

