/* 
 * justToolsTip v1.3
 * Simple customizable tooltip with confirm option and 3d effects
 * (c)2015 chemailbox@163.com, qq:977877
 */

(function($) {

    /** just tip **/
    function justTools(elem, options){
        this.elem = elem;
        this.set = options;
        //this.obj = null;
    }
    justTools.prototype = {
        addAnimation: function(){
            switch(this.set.animation){
                case 'none':
                    break;
                case 'fadeIn':
                    this.obj.addClass('animated fadeIn');
                    break;
                case 'flipIn':
                    switch(this.set.gravity){
                        case 'top':
                            this.obj.addClass('animated flipInTop');
                            break;
                        case 'bottom':
                            this.obj.addClass('animated flipInBottom');
                            break;
                        case 'left':
                            this.obj.addClass('animated flipInLeft');
                            break;
                        case 'right':
                            this.obj.addClass('animated flipInRight');
                            break;
                    }
                    break;
                case 'moveInLeft':
                    this.obj.addClass('animated moveLeft');
                    break;
                case 'moveInTop':
                    this.obj.addClass('animated moveTop');
                    break;
                case 'moveInBottom':
                    this.obj.addClass('animated moveBottom');
                    break;
                case 'moveInRight':
                    this.obj.addClass('animated moveRight');
                    break;
            }
        },
        close:function(){
            this.obj.remove();
            this.elem.removeAttr("just-open");
        },
        setPosition:function(){
            var setPos = {};
            var pos = { x: this.elem.offset().left, y: this.elem.offset().top };
            var wh = { w: this.elem.outerWidth(), h: this.elem.outerHeight() };
            var rightTmp = ( pos.x + wh.w / 2 ) + this.obj.outerWidth() / 2 ;
            var leftTmp = ( pos.x + wh.w / 2 ) - this.obj.outerWidth() / 2 ;
            //console.log(leftTmp)
            switch(this.set.gravity){
                case 'top':
                    if(rightTmp > $(window).width() ){
                        setPos = {
                            x: pos.x + wh.w - this.obj.outerWidth(),
                            y: pos.y - this.obj.outerHeight() - this.set.distance
                        };
                        this.obj.find(".just-" + this.set.gravity).css("left", this.obj.outerWidth() - wh.w/2 + "px")
                    }else if( leftTmp < 0 ){
                        setPos = {
                            x: pos.x,
                            y: pos.y - this.obj.outerHeight() - this.set.distance
                        };
                        this.obj.find(".just-" + this.set.gravity).css("left", wh.w/2 + "px")
                    }else{
                        setPos = {
                            x: pos.x - (this.obj.outerWidth() - wh.w)/2,
                            y: pos.y - this.obj.outerHeight() - this.set.distance
                        };
                    }
                    break;
                case 'bottom':
                    if(rightTmp > $(window).width() ){
                        setPos = {
                            x: pos.x + wh.w - this.obj.outerWidth(),
                            y: pos.y + wh.h + this.set.distance
                        };
                        this.obj.find(".just-" + this.set.gravity).css("left", this.obj.outerWidth() - wh.w/2 + "px")
                    }else if( leftTmp < 0 ){
                        setPos = {
                            x: pos.x,
                            y: pos.y + wh.h + this.set.distance
                        };
                        this.obj.find(".just-" + this.set.gravity).css("left", wh.w/2 + "px")
                    }else{
                        setPos = {
                            x: pos.x - (this.obj.outerWidth() - wh.w)/2,
                            y: pos.y + wh.h + this.set.distance
                        };
                    }
                    break;
                case 'left':
                    setPos = {
                        x: pos.x - this.obj.outerWidth() - this.set.distance,
                        y: pos.y - (this.obj.outerHeight() - wh.h)/2
                    };
                    break;
                case 'right':
                    setPos = {
                        x: pos.x + wh.w + this.set.distance,
                        y: pos.y - (this.obj.outerHeight() - wh.h)/2
                    };
                    break;
            }
            this.obj.css({"left": setPos.x + "px", "top": setPos.y + "px"});
        },
        setEvent:function(){
            var that = this;
            if(that.set.events =="click" || that.set.events =="onclick"){
                that.obj.one("click", function(e){
                    // console.log(1)
                    // e.preventDefault();
                    // e.stopPropagation();
                })
            }
            if(that.set.events =="mouseover" || that.set.events =="onmouseover" || that.set.events =="mouseenter"){
                this.elem.one("mouseout, mouseleave",function(){
                    // console.log(2);
                    that.close();
                }).one("click", function(e){
                    // console.log(3);
                    // e.preventDefault();
                    // e.stopPropagation();
                })
            }
        },
        setConfirmEvents:function(){
            var that = this;
            var yes = this.obj.find(".just-yes");
            var no = this.obj.find(".just-no");
            yes.click(function(){
                if(that.set.onYes(that)==true){
                    that.close();
                };
            })
            no.click(function(){
                that.close();
                that.set.onNo(that);
            })
        },
        addConfirm:function(){
            this.obj.append("<div class='just-confirm'><button type='button' class='just-yes'>"
                + this.set.yes +"</button><button type='button' class='just-no'>" + this.set.no +"</button></div>");
            this.setConfirmEvents();
        },
        setContent:function(){
            this.obj = $("<div class='just-tooltip " + this.set.theme + "'" +
                "style='width:" + this.set.width + "'><div style='font-size: 12px;text-align: center;' class='just-con'>" + this.set.contents + "</div>" + "<span class='just-" + this.set.gravity + "'></span></div>");
            if(this.set.confirm==true){
                this.addConfirm();
            }
            $("body").append(this.obj);
            this.setEvent();
            this.addAnimation();

        },
        getEvent:function(){
            if(window.event){return window.event};
            var func=this.getEvent.caller;              
            while(func!=null){      
                var arg0 = func.arguments[0];
                if(arg0){
                    // console.log(arg0.constructor)
                   if((arg0.constructor==Event || arg0.constructor==MouseEvent)  
                     || (typeof(arg0)=="object" && arg0.preventDefault && arg0.stopPropagation)){      
                        return arg0;  
                    }  
                }  
                func = func.caller;  
            }
            //$._data(this.elem.get(0)).events.click[0].events
            return null;  
        },
        destroy:function(){
            $("div[just-open]").removeAttr("just-open");
            $(".just-tooltip").remove();  
        },
        init:function(){
            var that = this;
            var e = that.getEvent();
            that.set.events = e.type;
            // e.preventDefault();
            // e.stopPropagation();
            $document = $(document);
            if(that.set.events =="click" || that.set.events =="onclick"){
                that.destroy();
                $document.one("click", function(e){
                    that.destroy();
                });
            }
            that.setContent();
            that.setPosition();

            $document.one("resize", function(){
                that.setPosition();
            })
        }
    }
    $.fn.justToolsTip = function(options){
        if(this.attr("just-open")){
            return;
        }
        this.attr("just-open", "show");
        var defaults = {
            id:new Date().getTime(),
            height:"auto",
            width:"auto",
            contents:'',
            gravity: 'top',  //top, left, bottom, right
            theme: '',//className
            distance: 5,
            animation: 'none', //none, fadeIn, flipIn, moveInLeft, moveInTop, moveInBottom, moveInRight
            confirm: false,
            yes: '确定',
            no: '取消',
            onYes: function(){}, //返回ture，关闭tools
            onNo: function(){}
        }
        this.each(function(i){
            options = $.extend(defaults, options);
            var tooltip = new justTools($(this), options);
            tooltip.init();
        }); 
    }

})(jQuery);
