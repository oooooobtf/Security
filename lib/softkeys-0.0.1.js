(function($) {

	$.fn.softkeys = function(options) {

		var settings = $.extend({
			layout: [],
			target: '',
			rowSeperator: 'br',
			buttonWrapper: 'li'
		}, options);

		var createRow = function(obj, buttons) {
				for(var i = 0; i < buttons.length; i++) {
					createButton(obj, buttons[i]);
				}

				obj.append('<' + settings.rowSeperator + '>');
			},

			createButton = function(obj, button) {
				var character = '',
					type = 'letter',
					styleClass = '';

				switch(typeof button) {
					case 'array':
					case 'object':
						if(typeof button[0] !== 'undefined') {
							character += '<span>' + button[0] + '</span>';
						}
						if(typeof button[1] !== 'undefined') {
							character += '<span>' + button[1] + '</span>';
						}
						type = 'symbol';
						break;

					case 'string':
						switch(button) {
							case 'capslock':
								character = '<span>caps</span>';
								type = 'capslock';
								break;

							case 'shift':
								character = '<span>shift</span>';
								type = 'shift';
								break;

							case 'return':
								character = '<span>return</span>';
								type = 'return';
								break;

							case 'tab':
								character = '<span>tab</span>';
								type = 'tab';
								break;

							case 'space':
								character = '<span>space</span>';
								type = 'space';
								styleClass = 'softkeys__btn--space';
								break;

							case '删除':
								character = '<span>删除</span>';
								type = 'delete';
								break;

							default:
								character = button;
								type = 'letter';
								break;
						}

						break;
				}

				obj.append('<' + settings.buttonWrapper + ' class="softkeys__btn  ' + styleClass + '" data-type="' + type + '">' + character + '</' + settings.buttonWrapper + '>');
			},

			bindKeyPress = function(obj) {
				obj.children(settings.buttonWrapper).on('click touchstart', function(event) {
					event.preventDefault();

					var character = '',
						type = $(this).data('type'),
						targetValue = $(settings.target).val(),
						flag = null;
						
						
//										console.log($(settings.target))

					//                      console.log($(settings.target).next().css('display'))
					if($(settings.target).next().css('display') == 'inline'||$(settings.target).next().css('display') == 'block') {
						$(settings.target).next().css('display', 'none')
						$(settings.target).css('border-color', '#dcdfe6')
					} else {

					}

					switch(type) {
						case 'capslock':
							toggleCase(obj);
							break;

						case 'shift':
							toggleCase(obj);
							toggleAlt(obj);
							break;

						case 'return':
							character = '\n';
							break;

						case 'tab':
							character = '\t';
							break;

						case 'space':
							character = ' ';
							break;

						case 'delete':
							flag = 2
//							console.log($(settings.target).val())

							//                          if(targetValue==undefined){
							//                          	targetValue = targetValue.substr(0, targetValue.length - 1);
							//                          }else{
							//                          	targetValue = targetValue.substr(0, targetValue.length - 1);
							//                          }
//							console.log(isGetPosition)
							if(isGetPosition == false) {
								targetValue = targetValue.substr(0, targetValue.length - 1);
								cursurPosition = (targetValue + character).length
//								console.log(cursurPosition)
								switch($(settings.target).attr('id')) {
									case "userName":
									    if($(settings.target).val().length==1){
									    	$('#userName').removeClass('green')
									    	$('#userName').addClass('error')
									    	$('#userName').next().css('display','block')
									    	$('#userName').next().show()
									    }
								        setCaretPosition('userName', cursurPosition)					
								        break;
								    case "pwd":
								        if($(settings.target).val().length==1){
									    	$('#pwd').removeClass('green')
									    	$('#pwd').addClass('error')
									    	$('#pwd').next().css('display','block')
									    	$('#pwd').next().show()
									    }
								        setCaretPosition('pwd', cursurPosition)
								        break;
									case "orderno":
										setCaretPosition('orderno', cursurPosition)
										matchCompany();
										break;
									case "flightno":
										setCaretPosition('flightno', cursurPosition)
										break;
									case "count":
										setCaretPosition('count', cursurPosition)
										break;
								}
							} else {
//								console.log(cursurPosition)
								if(targetValue.length > 0) {
									var lastValue = targetValue.substr(cursurPosition, targetValue.length - cursurPosition)
									targetValue = (targetValue.substr(0, cursurPosition)).substr(0, targetValue.substr(0, cursurPosition).length - 1) + lastValue;
									cursurPosition--
									switch($(settings.target).attr('id')) {
										case "userName":
								            setCaretPosition('userName', cursurPosition)					
								            break;
								        case "pwd":
								            setCaretPosition('pwd', cursurPosition)
								            break;
										case "orderno":
											setCaretPosition('orderno', cursurPosition)
											matchCompany();
											break;
										case "flightno":
											setCaretPosition('flightno', cursurPosition)
											break;
										case "count":
											setCaretPosition('count', cursurPosition)
											break;
									}
									if(cursurPosition == 0) {
										isGetPosition = false;
									}
								}

								//								    setCaretPosition(ctrl, pos)
							}

							//                          cursurPosition

							break;

						case 'symbol':
							flag = 1
							if(obj.hasClass('softkeys--alt')) {
								character = $(this).children('span').eq(1).html();
							} else {
								character = $(this).children('span').eq(0).html();
							}
							break;

						case 'letter':
							flag = 1
							character = $(this).html();

							if(obj.hasClass('softkeys--caps')) {
								character = character.toUpperCase();
							}

							break;
					}

					if(flag == 1) {
						if(isGetPosition == false) {
							switch($(settings.target).attr('id')) {
								case "userName":
								    var reg=/[^a-zA-Z-]/g;
								    if(!reg.test(character)){
                                       $(settings.target).focus().val(targetValue);
                                    }else{
                                       $(settings.target).focus().val((targetValue + character).substring(0, 11));
                                    }
                                    if( $(settings.target).val()==""){
                                    	isColor=false;
                                    }
                                    showicon($(settings.target))

                                    $('#userName').addClass('green')
								    break;
								case "pwd":
								    if( $(settings.target).val()==""){
                                    	isColor=false;
                                    }
								    showicon($(settings.target))
								    $('#pwd').addClass('green')
								    $(settings.target).focus().val(targetValue + character);
								    break;
								case "orderno":
								    var allvalue=targetValue + character;
								    var reg=/[^a-zA-Z]/g;
//									$(settings.target).focus().val(allvalue.replace(reg,''));
                                    if(!reg.test(character)){
                                       $(settings.target).focus().val(targetValue);
                                    }else{
                                       $(settings.target).focus().val((targetValue + character).substring(0, 12));
                                    }
								
//									console.log('111')
									break;
								case "flightno":
									$(settings.target).focus().val((targetValue + character).substring(0, 9));
									break;
								case "count":
								    var reg=/[^0-9]/g
								    if(reg.test(character)){
                                       $(settings.target).focus().val(targetValue);
                                    }else{
                                       $(settings.target).focus().val((targetValue + character).substring(0, 9));
                                    }
									
									break;
							}
//                          $(settings.target).focus().val((targetValue + character).substring(0, 12));
						} else {
							console.log(cursurPosition)

							var lastValue = targetValue.substr(cursurPosition, targetValue.length - cursurPosition)
							var allValue = targetValue.substr(0, cursurPosition) + character + lastValue
//							console.log(lastValue)
//							console.log(allValue)
							switch($(settings.target).attr('id')) {
								case "userName":
								    var reg=/[^a-zA-Z-]/g;
								    if(!reg.test(character)){
								    	
                                       $(settings.target).focus().val(targetValue);
                                    }else{
                                    	
                                       $(settings.target).focus().val(allValue.substring(0, 11));
                                    }								
								    break;
								case "pwd":
								    $(settings.target).focus().val(allValue);
								    break;
								case "orderno":
								     var reg=/[^a-zA-Z]/g;
//									$(settings.target).focus().val(allvalue.replace(reg,''));
                                    if(!reg.test(character)){
                                       $(settings.target).focus().val(targetValue);
                                    }else{
                                       $(settings.target).focus().val(allValue.substring(0, 12));
                                    }
                                    
//								    $(settings.target).focus().val(allValue.substring(0, 12));
									break;
								case "flightno":
									$(settings.target).focus().val(allValue.substring(0, 9));
									break;
								case "count":
								var reg=/[^0-9]/g
								    if(reg.test(character)){
                                       $(settings.target).focus().val(targetValue);
                                    }else{
                                       $(settings.target).focus().val(allValue.substring(0, 9));
                                    }
									
									break;
							}
							
//							$(settings.target).focus().val(allValue.substring(0, 12));
							cursurPosition++
//							console.log('当前位于：'+cursurPosition)
							switch($(settings.target).attr('id')) {
								case "userName":
								   	setCaretPosition('userName', cursurPosition)						
								    break;
								case "pwd":
								    setCaretPosition('pwd', cursurPosition)
								    break;
								case "orderno":
									setCaretPosition('orderno', cursurPosition)
									matchCompany();
									break;
								case "flightno":
									setCaretPosition('flightno', cursurPosition)
									break;
								case "count":
									setCaretPosition('count', cursurPosition)
									break;
							}
							if(cursurPosition == allValue.length) {
								isGetPosition = false;
							}
						}
//						console.log(cursurPosition)

					} else {
						
						$(settings.target).focus().val((targetValue + character).substring(0, 12));

					}
					switch($(settings.target).attr('id')) {
						case "orderno":
							mainContainer.orderNo = $(settings.target).val();
							matchCompany();

							break;
						case "flightno":
							mainContainer.flightNo = $(settings.target).val();
							break;
						case "count":
							mainContainer.count = $(settings.target).val();
							break;
					}

					//					$(settings.target).focus().val((targetValue + character).substring(0, 12));
					//					$(settings.target).focus().val(allValue.substring(0, 12));
					//					cursurPosition++
					//					switch($(settings.target).attr('id')) {
					//						case "orderno":
					//							mainContainer.orderNo = $(settings.target).val();
					//							setCaretPosition('orderno', cursurPosition)
					//							
					//							break;
					//						case "flightno":
					//							mainContainer.flightNo = $(settings.target).val();
					//							setCaretPosition('flightno', cursurPosition)
					//							
					//							break;
					//						case "count":
					//							mainContainer.count = $(settings.target).val();
					//							setCaretPosition('count', cursurPosition)
					//							
					//							break;
					//					}
					//					if(cursurPosition==allValue.length){
					//						isGetPosition=false;
					//					}
					//                  console.log(mainContainer.orderNo)
				});
			},

			toggleCase = function(obj) {
				obj.toggleClass('softkeys--caps');
			},

			toggleAlt = function(obj) {
				obj.toggleClass('softkeys--alt');
			};

		return this.each(function() {
			for(var i = 0; i < settings.layout.length; i++) {
				createRow($(this), settings.layout[i]);
			}

			bindKeyPress($(this));
		});
	};

}(jQuery));