
let state ={over_vertex:false,coord:{x:0,y:0},dragging:false,acting:false};

let svg;

const config = {
    "scale_ratio":1.08,
    "scale_min"  :0.2,
    "scale_max"  :5
}

async function create(parent,filename){
    let res;
    const response = await fetch(filename);
    const svg_text = await response.text();
    parent.insertAdjacentHTML("beforeend",svg_text)
    let elements = parent.getElementsByTagName("svg")
    let res_svg =  elements[elements.length-1];
    svg_transform_init(res_svg);
    add_events(res_svg);
    return res_svg;
}

function add_events(l_svg){
    svg = l_svg;
    svg.addEventListener( 'touchstart', onMousePan, false );
    svg.addEventListener( 'touchend', onMousePan, false );
    svg.addEventListener( 'mousedown', onMousePan, false );
    svg.addEventListener( 'mouseup', onMousePan, false );
    svg.addEventListener( 'mousemove', onMousePan, false );
    svg.addEventListener( 'wheel', onWheel, false );
    svg.addEventListener( 'contextmenu', onContext, false );

    //onMouseVertex for every rect mouseenter,mouseleave
}

function onContext(e){
    if(e.target.tagName == "rect"){
        e.preventDefault();
        e.stopPropagation();
    }
}

function onMousePan(e){
    let mx = e.clientX;//e.offsetX
    let my = e.clientY;//e.offsetY
    let dx = mx - state.coord.x;
    let dy = my - state.coord.y;
    if(state.dragging){
        if(e.type == "mouseup"){
            onViewMouse('drag',{start:false})
            state.dragging = false;//for mouse up outside the vertex after starting a down inside
        }
    }
    if((e.type != "mousemove") && (e.target.tagName == "rect")){
        onMouseVertex(e);        
    }
    if((e.buttons == 1) && (e.type == "mousemove")){
        if(state.dragging){
            onViewMouse('vert_move',{tx:dx,ty:dy});
        }else if(e.target.tagName == "svg"){//svg or div
            if(!state.dragging){
                onViewMouse('view_move',{tx:dx,ty:dy});
            }
        }
    }
    state.coord.x = mx;
    state.coord.y = my;
    e.preventDefault();
    e.stopPropagation();
}

//coming from a registration in each rect to have mouseenter / mouseleave,...
function onMouseVertex(e){
    //console.log(`${e.type} on ${e.target.id}`);
    const id = e.target.id.substr(5,e.target.id.length);
    let graph_events = [];
    let start;
    if(['contextmenu', 'click'].includes(e.type)){
        e.preventDefault();
        e.stopPropagation();
    }else if(['mousedown'].includes(e.type)){
        if(e.buttons == 2){
            graph_events.push('act');
            start = true;
            state.acting = true;
        }else if(e.buttons == 1){
            graph_events.push('drag');
            start = true;
            //console.log("drag start");
            state.dragging = true;
        }
    }else if(['mouseup'].includes(e.type)){
        if(state.dragging){
            graph_events.push('drag');
            state.dragging = false;
            start = false;
            //console.log("drag over");
        }
        if(state.acting){
            graph_events.push('act');
            start = false;
            state.acting = false;
        }
    }else if(e.type == 'touchstart'){
        if(e.touches.length == 1){
            graph_events.push('hover');
            start = true;
            state.over_vertex = true;
        }else if(e.touches.length == 2){
            graph_events.push('act');
            start = true;
            graph_events.push('hover');
            state.acting = true;
            state.over_vertex = true;
        }
    }else if(e.type == 'mouseenter'){
        graph_events.push('hover');
        start = true;
        state.over_vertex = true;
    }else if(['mouseleave','touchend'].includes(e.type)){
        graph_events.push('hover');
        start = false;
        state.over_vertex = false;
        if(state.acting){
            graph_events.push('act');
            start = false;
            state.acting = false;
        }
    }
    graph_events.forEach(type => onViewMouse(type,{id:id,start:start}));
    return false;
}

function onWheel(e){
    let step;
    if(e.deltaY > 0){
        step = 'up';
    }else if (e.deltaY < 0){
        step = 'down';
    }
    if(state.over_vertex){
        onViewMouse('vertex_scale',{step:step});
    }else{
        let svg_rect_no_scale = e.target.parentElement.getBoundingClientRect();
        let origin = {rx:e.offsetX / svg_rect_no_scale.width,ry:e.offsetY / svg_rect_no_scale.height};
        onViewMouse('view_scale',{step:step,origin:origin});
    }
    e.preventDefault();
    e.stopPropagation();
}


function onViewMouse(type,data){
    //let svg = document.getElementById('svg_graph');
    if(type == "view_scale"){
        //svg_move(svg,0,0);
        svg_scale(svg,data.step,data.origin);
    }else if(type == "view_move"){
        svg_shift(svg,data.tx,data.ty);
    }
}

function svg_transform_init(element){
    element.style.backgroundColor = "#fafafa";
    let tr_translate = element.createSVGTransform();
    tr_translate.setTranslate(0,0);
    element.transform.baseVal.appendItem(tr_translate);

    let tr_scale = element.createSVGTransform();
    tr_scale.setScale(1,1);
    element.transform.baseVal.appendItem(tr_scale);

    element.style.transformOrigin = "0% 0%";
}

function svg_scale(element,step,origin){
    let rect_prev = element.getBoundingClientRect();
    let transform = element.transform.baseVal[1];
    let tochange = false;
    let new_scale;
    if(transform.type == SVGTransform.SVG_TRANSFORM_SCALE){
        let sx = transform.matrix.a;
        if(step == 'up'){
            new_scale = sx / config.scale_ratio;
            if (new_scale > config.scale_min){
                tochange = true;
            }
        }else{
            new_scale = sx * config.scale_ratio;
            if (new_scale < config.scale_max){
                tochange = true;
            }
        }
    }
    if(tochange){
        transform.setScale(new_scale,new_scale);
        let rect = element.getBoundingClientRect();
        let dx = origin.rx * (rect.width - rect_prev.width);
        let dy = origin.ry * (rect.height - rect_prev.height);
        svg_shift(element,-dx,-dy);
    }
    //console.log(`after scale w = ${rect.width} ; h = ${rect.height}`);
}

function svg_shift(element,tx,ty){
    //console.log(`tx = ${tx} ; ty = ${ty}`);
    let transform = element.transform.baseVal[0];
    if(transform.type == SVGTransform.SVG_TRANSFORM_TRANSLATE){
        let new_tx = transform.matrix.e + tx;
        let new_ty = transform.matrix.f + ty;
        transform.setTranslate(new_tx,new_ty);
    }
}

export{create};
