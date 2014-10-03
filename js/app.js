Cut(function(root, container ) {
	
    Cut.Mouse(root, container ,1);
    root.viewbox(640, 960);

    var ui={};
    var sound={};
    var font={};
    var style={};
    
    font.btn={color:"#000",size:50};

    ui.center=Cut.image("base:color_dark").pin({"align":0.5}).appendTo(root);
    ui.tl=Cut.image("base:color_dark").pin({"align":0}).appendTo(root);
    ui.br=Cut.image("base:color_dark").pin({"align":1}).appendTo(root);
    ui.tr=Cut.image("base:color_dark").pin({"alignX":1,"alignY":0}).appendTo(root);
    ui.bl=Cut.image("base:color_dark").pin({"alignX":0,"alignY":1}).appendTo(root);
    
	ui.w1=Cut.view(100,200).pin({align:0.5}).appendTo(root);
    ui.yellow=Cut.image("base:color_yellow").pin({align:0.5,scale:20,alpha:0.2}).appendTo(root);
    ui.red=Cut.image("base:color_red").pin({align:0.5,scale:20,alpha:0.8}).appendTo(ui.w1);
    
    ui.t1=Cut.text(font.btn).pin({"alignX":0,"alignY":0}).setValue("暂停").spacing(10).appendTo(ui.w1);
});

Cut({
    name : "base",
    imagePath : "./img/basic-texture.png",
    imageRatio : 4,
    trim : 0.2,
    cutouts : [
        { name : "color_dark",   x : 0*16,  y : 0,  width : 16, height : 16 },
        { name : "color_light",  x : 1*16,  y : 0,  width : 16, height : 16 },
        { name : "color_blue",   x : 2*16,  y : 0,  width : 16, height : 16 },
        { name : "color_purple", x : 3*16,  y : 0,  width : 16, height : 16 },
        { name : "color_red",    x : 4*16,  y : 0,  width : 16, height : 16 },
        { name : "color_orange", x : 5*16,  y : 0,  width : 16, height : 16 },
        { name : "color_yellow", x : 6*16,  y : 0,  width : 16, height : 16 },
        { name : "color_green",  x : 7*16,  y : 0,  width : 16, height : 16 },
        { name : "null",         x : 32,    y : 32, width : 16, height : 16 },

        { name : "d_0",          x : 0*8,   y : 20, width : 8,  height : 8 },
        { name : "d_1",          x : 1*8,   y : 20, width : 8,  height : 8 },
        { name : "d_2",          x : 2*8,   y : 20, width : 8,  height : 8 },
        { name : "d_3",          x : 3*8,   y : 20, width : 8,  height : 8 },
        { name : "d_4",          x : 4*8,   y : 20, width : 8,  height : 8 },
        { name : "d_5",          x : 5*8,   y : 20, width : 8,  height : 8 },
        { name : "d_6",          x : 6*8,   y : 20, width : 8,  height : 8 },
        { name : "d_7",          x : 7*8,   y : 20, width : 8,  height : 8 },
        { name : "d_8",          x : 8*8,   y : 20, width : 8,  height : 8 },
        { name : "d_9",          x : 9*8,   y : 20, width : 8,  height : 8 },

        { name : "box",          x : 0,     y : 32, width : 16, height : 16, top : 16/4, bottom : 16/4, left : 16/4, right : 16/4}

    ]
});