DEBUG = true || (typeof DEBUG === 'undefined' || DEBUG) && console;

Cut.prototype.spy = function(spy) {
    if (!arguments.length) {
        return this._spy;
    }
    this._spy = spy ? true : false;
    return this;
};

Cut.Mouse = function() {
    Cut.Mouse.subscribe.apply(Cut.Mouse, arguments);
};

Array.prototype.contains = function (obj){
    //如果数组含有obj，就返回obj的下标+1；否则返回false
    var boo = false;
    for(var i=0;i<this.length;i++) {
        if(this[i] == obj) {
            boo = i+1;
            break;
        }
    }
    return boo;
};
Array.prototype.clone = function () {
    //返回一个相同的数组，改变新数组时原数组不受影响
    return this.slice(0);
};
Array.prototype.where = function(f){

    function lambda( l )
    {
        var fn = l.match(/\((.*)\)\s*=>\s*(.*)/) ;
        var p = [] ;
        var b = "" ;

        if ( fn.length > 0 ) fn.shift() ;
        if ( fn.length > 0 ) b = fn.pop() ;
        if ( fn.length > 0 ) p = fn.pop()
            .replace(/^\s*|\s(?=\s)|\s*$|,/g, '').split(' ') ;

        // prepend a return if not already there.
        fn = ( ( ! /\s*return\s+/.test( b ) ) ? "return " : "" ) + b ;

        p.push( fn ) ;

        try
        {
            return Function.apply( {}, p ) ;
        }
        catch(e)
        {
            return null ;
        }
    }

    var fn = f ;
    // if type of parameter is string
    if ( typeof f == "string" )
    // try to make it into a function
        if ( ( fn = lambda( fn ) ) == null )
        // if fail, throw exception
            throw "Syntax error in lambda string: " + f ;
    // initialize result array
    var res = [] ;
    var l = this.length;
    // set up parameters for filter function call
    var p = [ 0, 0, res ] ;
    // append any pass-through parameters to parameter array
    for (var i = 1; i < arguments.length; i++) p.push( arguments[i] );
    // for each array element, pass to filter function
    for (var i = 0; i < l ; i++)
    {
        // skip missing elements
        if ( typeof this[ i ] == "undefined" ) continue ;
        // param1 = array element
        p[ 0 ] = this[ i ] ;
        // param2 = current indeex
        p[ 1 ] = i ;
        // call filter function. if return true, copy element to results
        if ( !! fn.apply(this, p)  ) res.push(this[i]);
    }
    // return filtered result
    return res ;
};

Cut.ArrayFilter=function(a1,a2){
 /*  对比两个数组元素的异同，返回一个对象来描述
     more:a1有a2没有
     same:a1、a2都有
     less:a1没有a2有
     要求两个数组本身都没有重复元素*/
    var result ={
        more:[],
        same:[],
        less:a2.clone()
    };
    for(var i=0;i<a1.length;i++){
        var index= result.less.contains(a1[i]);
        if (index){
            result.same.push(a1[i]);
            result.less.splice(index-1,1);
        }else{
            result.more.push(a1[i]);
        }
    }
    return result;
};

Cut.prototype.visit = function(visitor) {
    //遍历节点树，start 为真时跳过该节点和子节点，end为真时终止遍历并返回end结果
    var reverse = visitor.reverse;
    var visible = visitor.visible;
    if (visitor.start && visitor.start(this)) {
        return;
    }
    var child, next = reverse ? this.last(visible) : this.first(visible);
    while (child = next) {
        next = reverse ? child.prev(visible) : child.next(visible);
        var cut = child.visit(visitor,reverse);
        if (cut) {
            return cut;
        }
    }
    return visitor.end && visitor.end(this);
};

Cut.prototype.hasMouseEvent = function() {
    //is cut has mouse event ?
    var list =[
        Cut.Mouse.CLICK,
        Cut.Mouse.START,
        Cut.Mouse.MOVE,
        Cut.Mouse.END,
        Cut.Mouse.OVER,
        Cut.Mouse.OUT,
        Cut.Mouse.ZOOM];
    for (var i= 0;i<list.length;i++){
        if (this.listeners(list[i]) && this.listeners(list[i]).length){
            return true;
        }
    }
    return false;
};

Cut.prototype.fire=function(type,arg){
    var listeners = this.listeners(type);
    if (listeners) {
        for (var i = 0; i < listeners.length; i++){
            listeners[i].call(this,arg);
        }
        return true;
    }
    return false;
};

Cut.Mouse.CLICK = "click";
Cut.Mouse.START = "mousedown";
Cut.Mouse.MOVE = "mousemove";
Cut.Mouse.END = "mouseup";
Cut.Mouse.OVER="mouseover";
Cut.Mouse.OUT="mouseout";
Cut.Mouse.ZOOM="mousezoom";
Cut.Mouse.shuchu={};
Cut.Mouse.MAX_TOUCHES_NUM=10;

Cut.Mouse.subscribe = function(listener, elem) {
    elem = elem || document;
    var isTouchSupported = "ontouchstart" in window;

    elem.addEventListener("mousedown", mouseStart);
    elem.addEventListener("mouseup", mouseEnd);
    elem.addEventListener("mousemove", mouseMove);
    if (isTouchSupported){
        elem.addEventListener("touchstart", mouseStart);
        elem.addEventListener("touchend", mouseEnd);
        elem.addEventListener("touchmove", mouseMove);
    }

    var rel = {
        x : 0,
        y : 0,
        id: 0
    };

    function emptyTouch(){
        var touch={
            startTarget:[],
            startX:0,
            startY:0,
            state:0,
            target:[],
            x:0,
            y:0,
            changed:false
        };
        return touch;
    };
    var touches = [];
    for (var i=0;i< Cut.Mouse.MAX_TOUCHES_NUM ;i++){
        touches[i]=emptyTouch();
    }
    Cut.Mouse.shuchu=touches[0];

    var findTarget  = {
        reverse : true,
        visible : true,
        start : function(cut) {
            if (!(cut.spy() || listener === cut)) {
                cut.matrix().reverse().map(touches[rel.id], rel);
                if (rel.x < 0 || rel.x > cut._pin._width || rel.y < 0
                    || rel.y > cut._pin._height) {
                    return true;
                }
            }
        },
        end : function(cut) {
            if (cut.hasMouseEvent()){
                touches[rel.id].target.push(cut);
            }
        }
    };

    function findInTouches(cut,onlyhead){
        var touchCount=0;
        for (var i=0;i< Cut.Mouse.MAX_TOUCHES_NUM;i++){
            if (touches[i].target.length){
                if (onlyhead){
                    if (touches[i].target[0]==cut){
                        touchCount+=1;
                    }
                }else{
                    if (touches[i].target.contains(cut)){
                        touchCount+=1;
                    }
                }
            }
        }
        return touchCount;
    };

    function mouseStart(event) {
        try{
        event.preventDefault();
        update(event);

        for (var i=0;i< Cut.Mouse.MAX_TOUCHES_NUM;i++){
            var t =touches[i];
            if (t.changed){
                t.changed=false;
                t.state=1;
                t.startTarget= t.target;
                t.startX = t.x;
                t.startY = t.y;
                if (t.target.length){
                    var touchCount=findInTouches(t.target[0],onlyhead=true);
                    if (touchCount==1){
                        t.target[0].fire("mousedown");
                    }
                }
                Cut.Mouse.shuchu=touches[0];
            }
        }
        } catch (e) {
            console && console.log(e);
        }
    };

    function mouseEnd(event) {
        try{
            event.preventDefault();
            update(event);

            for (var i=0;i< Cut.Mouse.MAX_TOUCHES_NUM;i++){
                var t =touches[i];
                if (t.changed){
                    if (t.target.length){
                        var touchCount=findInTouches(t.target[0],onlyhead=true);
                        if (touchCount==1){
                            t.target[0].fire("mouseup");
                            if (t.state ==1 && t.target[0] == t.startTarget[0]){
                                t.target[0].fire("click");
                            }
                        }
                    }
                    touches[i]=emptyTouch();
                }
            }
            Cut.Mouse.shuchu=touches[0];
        }catch (e) {
            console && console.log(e);
        }
        event=null;
    };

    function mouseMove(event) {
        try{
            event.preventDefault();
            var oldTarget=[];
            for (var i=0;i< Cut.Mouse.MAX_TOUCHES_NUM;i++){
                oldTarget[i]=touches[i].target;
            }
            update(event);
            for (var i=0;i< Cut.Mouse.MAX_TOUCHES_NUM;i++){
                if (touches[i].changed){
                    var compare =Cut.ArrayFilter(touches[i].target,oldTarget[i]);
                    if (compare.more.length){
                        for (var j=0;j<compare.more.length;j++){
                            var touchCount= findInTouches(compare.more[j],onlyhead=false);
                            if (touchCount==1){
                                compare.more[j].fire("mouseover");
                            }
                        }
                    }
                    if (compare.less.length){
                        for (var j=0;j<compare.less.length;j++){
                            var touchCount= findInTouches(compare.less[j],onlyhead=false);
                            if (touchCount==0){
                                compare.less[j].fire("mouseout");
                            }
                        }
                    }
                    if (compare.same.length){
                        for (var j=0;j<compare.same.length;j++){
                            var touchCount= findInTouches(compare.same[j],onlyhead=false);
                            if (touchCount>1){
                                if (compare.same[j].fire("mousezoom",touches)){
                                    break;
                                }
                            }else if (touchCount ==1 && touches[i].startTarget.contains(compare.same[j])){
                                if (compare.same[j].fire("mousemove",touches[i])){
                                    break;
                                }
                            }
                        }
                    }
                }
                touches[i].changed=false;
            }
        Cut.Mouse.shuchu=touches[0];
        } catch (e) {
            console && console.log(e);
        }
    };

    function adjust(){
        // accounts for border
        try{
        var id = rel.id;
        touches[id].x -= elem.clientLeft || 0;
        touches[id].y -= elem.clientTop || 0;

        var par = elem;
        while (par) {
            touches[id].x -= par.offsetLeft || 0;
            touches[id].y -= par.offsetTop || 0;
            if (!rel.isTouch) {
                // touch events offset scrolling with pageX/Y
                // so scroll offset not needed for them
                touches[id].x += par.scrollLeft || 0;
                touches[id].y += par.scrollTop || 0;
            }

            par = par.offsetParent;
        }

        // see loader
        touches[id].x *= listener._ratio || 1;
        touches[id].y *= listener._ratio || 1;

        touches[id].target=[];
        listener.visit(findTarget);
        } catch (e) {
        console && console.log(e);
    }
    };

    function update(event) {

        try{
        rel.isTouch = false;
        // touch screen events
        if (event.touches) {
            var len = event.changedTouches.length;
            if (len) {
                for (var i=0 ;i<len;i++){
                    var id = event.changedTouches[i].identifier;
                    if (id< Cut.Mouse.MAX_TOUCHES_NUM ){
                        rel.isTouch = true;
                        rel.id=id;
                        touches[id].x = event.changedTouches[i].pageX;
                        touches[id].y = event.changedTouches[i].pageY;
                        touches[id].changed=true;
                        adjust();
                    }
                }
            } else {
                return;
            }
        } else {
            // mouse events
            rel.id=0;
            touches[0].x = event.clientX;
            touches[0].y = event.clientY;
            touches[0].changed=true;
            // http://www.softcomplex.com/docs/get_window_size_and_scrollbar_position.html
            if (document.body.scrollLeft || document.body.scrollTop) {
                // body is added as offsetParent
            } else if (document.documentElement) {
                touches[0].x += document.documentElement.scrollLeft;
                touches[0].y += document.documentElement.scrollTop;
            }
            adjust();
        }
        } catch (e) {
            console && console.log(e);
        }
    };
};


