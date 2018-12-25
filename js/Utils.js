/**
 * 日期格式化和解析
 * DateUtils提供format和parse进行日期转换。
 * format(date, pattern)把日期格式化成字符串。
 * 使用方法：
 * var date = new Date();
 * DateUtils.format(date, 'yyyy-MM-dd HH:mm:ss'); //2017-11-9 13:00:00
 * DateUtils.format(new Date(), 'yyyy年MM月dd日'); // 2017年11月10日
 *
 * parse(str, pattern)把字符串转成日期。
 * 使用方法：
 * var str = 2015-08-12 13:00:00;
 * DateUtils.format(str, 'yyyy-MM-dd HH:mm:ss');
 *
 * parse有两个参数，如果只传递str参数，会调用浏览器内置的Date.parse()方法进行转换。
 *
 *   格式       描述
 *   --------   ---------------------------------------------------------------
 *   yy         年份后两位，如2015取后两位是15。
 *   yyyy       年份四位。
 *   M          月份，取值1 ~ 12。
 *   MM         月份，取值01 ~ 12，如果月份为个位数，前面补0。
 *   MMM        月份缩写，如一月的英文缩写为Jan，中文缩写为一。
 *   MMMM       月份全称，如January、一月。
 *   d          日期在月中的第几天，取值1~31。
 *   dd         日期在月中的第几天，取值01~31，如果天数为个位数，前面补0。
 *   ddd        星期缩写，取值日、一、二、三、四、五、六。
 *   dddd       星期全称，取值星期日、星期一、星期二、星期三、星期四、星期五、星期六。
 *   H          24小时进制，取值0~23。
 *   HH         24小时进制，取值00~23，如果小时为个位数，前面补0。
 *   h          12小时进制，取值0~11。
 *   hh         12小时进制，取值00~11，如果小时为个位数，前面补0。
 *   m          分钟，取值0~59。
 *   mm         分钟，取值00~59，如果为个位数，前面补0。
 *   s          秒，取值0~59。
 *   ss         秒，取值00~59，如果为个位数，前面补0。
 *   S          毫秒，取值0~999。
 *   SS         毫秒，取值00~999，如果不足两位数，前面补0。
 *   SSS        毫秒，取值000~999，如果不足三位数，前面补0。
 *   t          上午、下午缩写。
 *   tt         上午、下午全称。
 *   --------   ---------------------------------------------------------------
 */
DateUtils = (function () {
    /*
    var locale = {
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        shortDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        shortMonthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        am: 'AM',
        pm: 'PM',
        shortAm: 'A',
        shortPm: 'P'
    };
    */

    var locale = {
        dayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        shortDayNames: ["日", "一", "二", "三", "四", "五", "六"],
        monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        shortMonthNames: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"],
        am: "上午",
        pm: "下午",
        shortAm: '上',
        shortPm: '下'
    };

    /**
     * 左边补0
     */
    function leftPad(str, size) {
        var result = '' + str;

        while (result.length < size) {
            result = '0' + result;
        }

        return result;
    }

    var parseToken = (function () {
        var match2 = /\d{2}/, // 00 - 99
            //match3 = /\d{3}/,          // 000 - 999
            match4 = /\d{4}/, // 0000 - 9999
            match1to2 = /\d{1,2}/, // 0 - 99
            match1to3 = /\d{1,3}/, // 0 - 999
            //match1to4 = /\d{1,4}/,     // 0 - 9999
            match2w = /.{2}/, // 匹配两个字符
            match1wto2w = /.{1,2}/, // 匹配1~2个字符
            map = {
                //年的后两位
                'yy': {
                    regex: match2,
                    name: 'year'
                },
                //年
                'yyyy': {
                    regex: match4,
                    name: 'year'
                },
                //两位数的月，不到两位数则补0
                'MM': {
                    regex: match2,
                    name: 'month'
                },
                //月
                'M': {
                    regex: match1to2,
                    name: 'month'
                },
                //两位数的日期，不到两位数则补0
                'dd': {
                    regex: match2,
                    name: 'date'
                },
                //日期
                'd': {
                    regex: match1to2,
                    name: 'date'
                },
                //两位数的小时，24小时进制
                'HH': {
                    regex: match2,
                    name: 'hours'
                },
                //小时，24小时进制
                'H': {
                    regex: match1to2,
                    name: 'hours'
                },
                //两位数的小时，12小时进制
                'hh': {
                    regex: match2,
                    name: 'hours'
                },
                //小时，12小时进制
                'h': {
                    regex: match1to2,
                    name: 'hours'
                },
                //两位数的分钟
                'mm': {
                    regex: match2,
                    name: 'minutes'
                },
                //分钟
                'm': {
                    regex: match1to2,
                    name: 'minutes'
                },
                's': {
                    regex: match1to2,
                    name: 'seconds'
                },
                'ss': {
                    regex: match2,
                    name: 'seconds'
                },
                //上午、下午
                'tt': {
                    regex: match2w,
                    name: 't'
                },
                //上午、下午
                't': {
                    regex: match1wto2w,
                    name: 't'
                },
                //毫秒
                'S': {
                    regex: match1to3,
                    name: 'millisecond'
                },
                //毫秒
                'SS': {
                    regex: match1to3,
                    name: 'millisecond'
                },
                //毫秒
                'SSS': {
                    regex: match1to3,
                    name: 'millisecond'
                }
            };

        return function (token, str, dateObj) {
            var result, part = map[token];
            if (part) {
                result = str.match(part.regex);
                if (result) {
                    dateObj[part.name] = result[0];
                    return result[0];
                }
            }

            return null;
        };
    })();

    return {
        locale: locale,
        format: function (val, pattern) {
            if (Object.prototype.toString.call(val) !== '[object Date]') {
                return '';
            }

            if (Object.prototype.toString.call(pattern) !== '[object String]' || pattern === '') {
                pattern = 'yyyy-MM-dd HH:mm:ss';
            }

            var fullYear = val.getFullYear(),
                month = val.getMonth(),
                day = val.getDay(),
                date = val.getDate(),
                hours = val.getHours(),
                minutes = val.getMinutes(),
                seconds = val.getSeconds(),
                milliseconds = val.getMilliseconds();

            return pattern.replace(/(\\)?(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|SS?S?)/g, function (m) {
                if (m.charAt(0) === '\\') {
                    return m.replace('\\', '');
                }

                var locale = DateUtils.locale;

                switch (m) {
                    case "hh":
                        return leftPad(hours < 13 ? (hours === 0 ? 12 : hours) : (hours - 12), 2);
                    case "h":
                        return hours < 13 ? (hours === 0 ? 12 : hours) : (hours - 12);
                    case "HH":
                        return leftPad(hours, 2);
                    case "H":
                        return hours;
                    case "mm":
                        return leftPad(minutes, 2);
                    case "m":
                        return minutes;
                    case "ss":
                        return leftPad(seconds, 2);
                    case "s":
                        return seconds;
                    case "yyyy":
                        return fullYear;
                    case "yy":
                        return (fullYear + '').substring(2);
                    case "dddd":
                        return locale.dayNames[day];
                    case "ddd":
                        return locale.shortDayNames[day];
                    case "dd":
                        return leftPad(date, 2);
                    case "d":
                        return date;
                    case "MMMM":
                        return locale.monthNames[month];
                    case "MMM":
                        return locale.shortMonthNames[month];
                    case "MM":
                        return leftPad(month + 1, 2);
                    case "M":
                        return month + 1;
                    case "t":
                        return hours < 12 ? locale.shortAm : locale.shortPm;
                    case "tt":
                        return hours < 12 ? locale.am : locale.pm;
                    case "S":
                        return milliseconds;
                    case "SS":
                        return leftPad(milliseconds, 2);
                    case "SSS":
                        return leftPad(milliseconds, 3);
                    default:
                        return m;
                }
            });
        },

        parse: function (val, pattern) {
            if (!val) {
                return null;
            }

            if (Object.prototype.toString.call(val) === '[object Date]') {
                // 如果val是日期，则返回。
                return val;
            }

            if (Object.prototype.toString.call(val) !== '[object String]') {
                // 如果val不是字符串，则退出。
                return null;
            }

            var time;
            if (Object.prototype.toString.call(pattern) !== '[object String]' || pattern === '') {
                // 如果fmt不是字符串或者是空字符串。
                // 使用浏览器内置的日期解析
                time = Date.parse(val);
                if (isNaN(time)) {
                    return null;
                }

                return new Date(time);
            }

            var i, token, tmpVal,
                tokens = pattern.match(/(\\)?(dd?|MM?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|SS?S?|.)/g),
                dateObj = {
                    year: 0,
                    month: 1,
                    date: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    millisecond: 0
                };

            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];
                tmpVal = parseToken(token, val, dateObj);

                if (tmpVal !== null) {
                    if (val.length > tmpVal.length) {
                        val = val.substring(tmpVal.length);
                    } else {
                        val = '';
                    }
                } else {
                    val = val.substring(token.length);
                }
            }

            if (dateObj.t) {
                if (DateUtils.locale.pm === dateObj.t || DateUtils.locale.shortPm === dateObj.t) {
                    dateObj.hours = (+dateObj.hours) + 12;
                }
            }

            dateObj.month -= 1;

            return new Date(dateObj.year, dateObj.month, dateObj.date, dateObj.hours, dateObj.minutes, dateObj.seconds, dateObj.millisecond);
        }
    };
})();


var Utils = (function () {
    return {
        /*
         * 是否为空
         * 返回值：布尔值
         * false：表示不为空
         * true：表示为空
         */
//         url: "http://192.168.0.40:9100",
      //  url: "http://192.168.0.71:9091", //云上地址
  //   url: "http://192.168.0.180:9100", //云上地址
//             url: "http://192.168.0.242:9091", //强哥地址
//            url:"http://192.168.0.54:9100",
        url:"../..",
//         url:"http://192.168.0.241:9091",
        ftpIP: '172.22.150.112/pic',//图片服务器地址
 
        timeModel: 3000,
        isEmptyObject: function (obj) {
            for (var name in obj) {
                return false;
            }
            return true;
        },
        /*
         * 根据参数名截取Url中的参数值
         * para：键；浏览器上的键值对
         * 使用方法：如：http://localhost:8080/BTVhtml/page/home/index.html?param=12
         * Comm.getParaVal('param');//获取地址上的param的值
         */
        getParaVal: function (para) {
            var regStr = "(^|&|&amp;)" + para + "=" + "([^&]*)(&|$)";
            var reg = new RegExp(regStr);
            var pval = window.location.search.substr(1).match(reg);
            if (pval == null)
                return null
            else
                return decodeURI(pval[2]);
        },
        /*得到时间格式
         *	用法：
         *	value：传入的时间。格式如下
         *	2017-10-10 T 05:11:13.3214  2015-08-12 13:00:00  2015/08/12 13:00:00  1507583473000
         *  format：想要转换成的时间格式
         * 	yyyy-MM-dd HH:mm:ss   yyyy年MM月dd日  	yyyy/MM/dd HH:mm:ss  yyyy/MM/dd  yyyy-MM-dd  HH:mm:ss
         * 	列如：
         *  Comm.getDateFormat('1507583473000','HH:mm:ss')
         * 	返回值：是个对象
         * 	{
         * 		timestamp：时间戳
         * 		dateFormat：想要的时间格式
         * }
         * */
        getDateFormat: function (value, format) {
            if (!Utils.isEmptyObject(value) && value != "null") {
                if (typeof value == 'number') {
                    value = value.toString();
                }
                if (value.length <= 0) {
                    return;
                }

                //字符串中包含T的时间
                if (value.indexOf('T') >= 0) {
                    value = value.replace(/\/ /g, "");
                    value = value.replace("T", " ");
                    if (value.indexOf(".") >= 0) {
                        value = value.substring(0, value.indexOf("."));
                    }
                } else if (value.indexOf('/') < 0 && value.indexOf('-') < 0 && value.indexOf(':') < 0) {
                    value = Utils.getTimeByTimestamp(value);
                }

                return {
                    timestamp: new Date(value).getTime(),
                    dateFormat: DateUtils.format(new Date(value), format)
                }
            } else {
                return {
                    timestamp: '',
                    dateFormat: ''
                }
            }

        },
        /*
     * 把时间戳转换为时间格式
     * 返回值：2015-08-12 13:00:00
     * now：传入的时间戳
     */
        getTimeByTimestamp: function (now) {
            if (!Utils.isEmptyObject(now) && now != "null") {
                var time = new Date(parseInt(now));
                var year = time.getFullYear();
                var month = time.getMonth() + 1;
                var hours = time.getHours();
                var minutes = time.getMinutes();
                var seconds = time.getSeconds();
                var day = time.getDate();
                month = month <= 9 ? month = "0" + month : month;
                day = day <= 9 ? day = "0" + day : day;
                hours = hours <= 9 ? hours = "0" + hours : hours;
                minutes = minutes <= 9 ? minutes = "0" + minutes : minutes;
                seconds = seconds <= 9 ? seconds = "0" + seconds : seconds;
                return year + "-" + month + "-" + day + ' ' + hours + ':' + minutes + ':' + seconds;
            } else {
                return "";
            }

        },
        //如果是空对象就返回一个字符串
        isEmptyObjectReturnString: function (obj) {
            if (!Utils.isEmptyObject(obj)) {
                return obj;
            } else {
                return "";
            }

        },
        /*
		* 弹窗
		* con 选择器
		* text 提示文本
		* timeModel 弹窗消失时间
		* num 1成功 2失败
		* */
        noticeModelFn: function (con, text, num) {
        	con.find('span').html(text);
            if (num == 1) {
                con.addClass('success-notice').removeClass('error-notice');
                con.fadeIn()
            } else if (num == 2) {
                con.addClass('error-notice').removeClass('success-notice');
                con.fadeIn()
            } else if (num == 3) {
                con.addClass('online-notice').removeClass('success-notice');
                con.fadeIn()
            }
            setTimeout(function () {
                con.fadeOut();
            }, Utils.timeModel)
        }
    }

})();