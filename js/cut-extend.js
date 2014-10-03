Cut.prototype.appendTo = function(parent) {
    if (!parent) {
        throw 'Parent is null!';
    }
    if (!Cut._isCut(parent)) {
        throw 'It is not a Cut node!';
    }

    this.remove();

    if (parent._last) {
        parent._last._next = this;
        this._prev = parent._last;
    }

    this._parent = parent;
    parent._last = this;

    if (!parent._first) {
        parent._first = this;
    }

    this._parent._listenOn(this);

    this._ts_parent = Cut._TS++;
    parent._ts_children = Cut._TS++;
    parent.touch();
    this._pin.tick();	//修正bug：使用该方法后第一帧位置出错。
    return this;
};

Cut.prototype.prependTo = function(parent) {
    if (!parent) {
        throw 'Parent is null!';
    }
    if (!Cut._isCut(parent)) {
        throw 'It is not a Cut node!';
    }

    this.remove();

    if (parent._first) {
        parent._first._prev = this;
        this._next = parent._first;
    }

    this._parent = parent;
    parent._first = this;

    if (!parent._last) {
        parent._last = this;
    }

    this._parent._listenOn(this);

    this._ts_parent = Cut._TS++;
    parent._ts_children = Cut._TS++;
    parent.touch();
    this._pin.tick();  //修正bug：使用该方法后第一帧位置出错。
    return this;
};

Cut.prototype.insertBefore = function(next) {
    if (!next) {
        throw 'Next is null!';
    }
    if (!Cut._isCut(next)) {
        throw 'It is not a Cut node!';
    }

    this.remove();

    var parent = next._parent;
    var prev = next._prev;

    next._prev = this;
    prev && (prev._next = this) || parent && (parent._first = this);

    this._parent = parent;
    this._prev = prev;
    this._next = next;

    this._parent._listenOn(this);

    this._ts_parent = Cut._TS++;
    this.touch();
    this._pin.tick();  //修正bug：使用该方法后第一帧位置出错。
    return this;
};

Cut.prototype.insertAfter = function(prev) {
    if (!prev) {
        throw 'Prev is null!';
    }
    if (!Cut._isCut(prev)) {
        throw 'It is not a Cut node!';
    }

    this.remove();

    var parent = prev._parent;
    var next = prev._next;

    prev._next = this;
    next && (next._prev = this) || parent && (parent._last = this);

    this._parent = parent;
    this._prev = prev;
    this._next = next;

    this._parent._listenOn(this);

    this._ts_parent = Cut._TS++;
    this.touch();
    this._pin.tick();  //修正bug：使用该方法后第一帧位置出错。
    return this;
};


Cut.View=function(){
	//视窗类，超出视窗的部分不显示
    Cut.View.prototype._super.apply(this,arguments);
};
Cut.View.prototype = Cut._create(Cut.Image.prototype);
Cut.View.prototype._super = Cut.Image;
Cut.View.prototype.constructor = Cut.View;
Cut.view = function(w,h) {
	//建立视窗，指定宽度、高度
    var view=new Cut.View();
    view.image(Cut.Out.drawing(w,h,1,function(context,ratio){
        context.rect(0,0,w,h);
    }));
    return view;
};
Cut.View.prototype._paint = function(context) {
    if (!this._visible) {
        return;
    }
    Cut._stats.paint++;

    var m = this._pin.absoluteMatrix();
    context.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);

    this._alpha = this._pin._alpha * (this._parent ? this._parent._alpha : 1);
    var alpha = this._pin._textureAlpha * this._alpha;

    if (context.globalAlpha != alpha) {
        context.globalAlpha = alpha;
    }

    var box= this._cutouts[0];
    context.save();
    context.beginPath();
    context.rect(box._sx,box._sy,box._sw,box._sh);
    context.clip();

    if (context.globalAlpha != this._alpha) {
        context.globalAlpha = this._alpha;
    }

    var child, next = this._first;
    while (child = next) {
        next = child._next;
        child._paint(context);
    }
    
    context.restore();
};

Cut.text = function(font) {
    return new Cut.Text().setFont(font);
};
Cut.Text = function() {
    Cut.Text.prototype._super.apply(this, arguments);
    this._font={
        style:"normal",
        variant:"normal",
        weight:"normal",
        size:20,
        family:"Arial",
        color:"#000000",
        stroke:false,
        strokeColor:"#ffffff",
        strokeWeight:"bolder"
    };
    this.row();
};
Cut.Text.prototype = Cut._create(Cut.prototype);
Cut.Text.prototype._super = Cut;
Cut.Text.prototype.constructor = Cut.Text;
Cut.Text.prototype.setFont = function(font) {
    for(var  p in font){
        this._font[p]=font[p];
    }
    return this;
};
Cut.Text.prototype.setValue = function(value) {
    if (typeof value == "string") {
        this.value = value;
        this.empty();
        for (var i = 0; i < value.length; i++) {
            var chr = this.value[i];
            var child = Cut.char(chr,this._font).appendTo(this);
        }
    }
    return this;
};

Cut.char = function(value,font) {
    var char = new Cut.Char();
    value && char.setChar(value,font);
    return char;
};
Cut.Char = function() {
    Cut.Char.prototype._super.apply(this, arguments);

};
Cut.Char.prototype = Cut._create(Cut.Image.prototype);
Cut.Char.prototype._super =  Cut.Image;
Cut.Char.prototype.constructor = Cut.Char;

Cut.Char.prototype.setChar = function(value,font) {
    var size=font.size;
    this._cutouts[0] = Cut.Out.drawing(value,size,size,1,function(ctx){
        ctx.font=""+font.style+" "+font.weight+" "+font.size +"px "+font.family;
        ctx.measureText && this.cropX(ctx.measureText(value).width);
        ctx.fillText(value,0,0);
    });
    this._cutouts.length = 1;
    this._cutouts[0]._font =font;
    this.pin({
        width : this._cutouts[0] ? this._cutouts[0].dWidth() : 0,
        height : this._cutouts[0] ? this._cutouts[0].dHeight() : 0
    });

    this._cutout = this._cutouts[0].clone();

    return this;
};

Cut.Out.prototype.paste = function(context) {
    Cut._stats.paste++;
    if (this._font){
        var font=this._font;
        context.textBaseline="middle";
        context.font=""+font.style+" "+font.weight+" "+font.size +"px "+font.family;
        if (font.stroke){
            context.strokeStyle=font.strokeColor;
            context.lineWidth=font.strokeWeight;
            context.strokeText(this.name,this._dx,this._dy+font.size/2);
        }
        context.fillStyle=font.color;
        context.fillText(this._name,this._dx,this._dy+font.size/2);
    }else{
        var img = typeof this._image === 'function' ? this._image() : this._image;
        try {
            img && context.drawImage(img, // source
                this._sx, this._sy, this._sw, this._sh, // cut
                this._dx, this._dy, this._dw, this._dh // position
            );
        } catch (e) {
            if (!this.failed) {
                console.log('Unable to paste: ' + this, img);
            	this._failed = true;
            }
        }
    }
};

Cut.Button=function(){
    Cut.Button.prototype._super.apply(this,arguments);
    this.text=Cut.text().appendTo(this);
};
Cut.Button.prototype = Cut._create(Cut.Image.prototype);
Cut.Button.prototype._super = Cut.Image;
Cut.Button.prototype.constructor = Cut.Button;
Cut.button = function() {
    var options={}
    for(var i=0;i<arguments.length;i++){
        for(var p in arguments[i]){
            options[p]=arguments[i][p];
        }
    }
    var btn=new Cut.Button();
    if (!options.standard){
        throw ("button does not have an image!");
    }
    btn.image(options.standard);

    if (options.pressed){
        btn.on(Cut.Mouse.OVER,function(){
            this.image(options.pressed);
        });
        btn.on(Cut.Mouse.OUT,function(){
            this.image(options.standard);
        });
        btn.on(Cut.Mouse.START,function(){
            this.image(options.pressed);
        });
        btn.on(Cut.Mouse.END,function(){
            this.image(options.standard);
        });
    }

    if (options.onPressed){
        btn.on(Cut.Mouse.OVER,options.onPressed);
        btn.on(Cut.Mouse.START,options.onPressed);
    }

    if (options.onStandard){
        btn.on(Cut.Mouse.OUT,options.onStandard);
        btn.on(Cut.Mouse.END,options.onStandard);
    }

    if (options.onClick){
        btn.on(Cut.Mouse.CLICK,options.onClick);
    }

    if (options.onMouseEnd){
        btn.on(Cut.Mouse.END,options.onMouseEnd);
    }

    if(options.font){
        btn.text.setFont(options.font);
    }

    if(options.text){
        btn.text.setValue(options.text);
    }

    if(options.textPin){
        btn.text.pin(options.textPin);
    }

    if(options.textSpaceing){
        btn.text.spacing(options.textSpaceing);
    }

    if(options.icon){
        btn.icon=Cut.image(options.icon).pin({"align":0.5}).appendTo(btn);
        if (options.iconPin){
            btn.icon.pin(options.iconPin);
        }
    }

    return btn;
};
