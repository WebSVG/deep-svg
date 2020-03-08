import * as filters from "../src/svg_filters.js";

let glow,glow_anim;

let state ={coord:{x:0,y:0}};

const config = {
    "scale_ratio":1.08,
    "scale_min"  :0.2,
    "scale_max"  :5
}


function defined(statement){
    return (typeof(statement) != "undefined")
}

function sibling(sibl,element){
    sibl.parentElement.appendChild(element);    
}

function send_event(event_name,data){
	var event = new CustomEvent(event_name, {detail:data});
	window.dispatchEvent(event);
}

function get_svg(target){
    return (target.tagName == "svg")?target:target.closest("svg");
}

function create_xmlns(tagName,attributes){
    const xmlns = "http://www.w3.org/2000/svg";
    let element = document.createElementNS(xmlns,tagName);
    for(let [key, value] of Object.entries(attributes)){
        element.setAttribute(key,value);
    }
    return element;
}

/**
 * @param {html element} parent 
 * @param {Object} props : properties containing 'id' and 'enable'
 * @return {html element} svg element
 */
async function createElement(parent,props){
    const file = window.location.origin+props.src;
    const response = await fetch(file);
    const svg_text = await response.text();
    parent.insertAdjacentHTML("beforeend",svg_text);
    let elements = parent.getElementsByTagName("svg");
    let res_svg =  elements[elements.length-1];
    if(defined(props.id)){
        res_svg.id = props.id;
    }else{
        res_svg.id = `svg_${Math.round(1000000*Math.random())}`;
    }
    svg_transform_init(res_svg);
    if(defined(props.enable) && props.enable){
        enable(res_svg);
    }
    return res_svg;
}

function enable(svg){
    add_events(svg);
    glow = filters.create(svg,{type:"glow",color:"#c2feff"});
    glow_anim = filters.create(svg,{type:"glow_anim",color:"#c2feff"});
}

function disable(svg){
    remove_events(svg);
    filters.remove(svg,glow);
    filters.remove(svg,glow_anim);
}

function setProperty(svg,props){
    if(defined(props.enable)){
        if(props.enable){
            enable(svg);
        }else{
            disable(svg);
        }
    }
}

function highlightText(svg,text,type="glow"){
    const tspans = svg.getElementsByTagName('tspan');
    for(let tspan of tspans){
        if(tspan.innerHTML == text){
            filters.start(tspan.parentElement.parentElement,glow_anim);
            console.log("filter attached and started")
        }
    }
}

function add_events(svg){
    svg.addEventListener( 'touchstart', onMousePan, false );
    svg.addEventListener( 'touchend', onMousePan, false );
    svg.addEventListener( 'mousedown', onMousePan, false );
    svg.addEventListener( 'mousemove', onMousePan, false );
    svg.addEventListener( 'wheel', onWheel, false );
    svg.addEventListener( 'click', onClick, false );
    svg.addEventListener( 'contextmenu', onContext, false );

    svg.querySelectorAll('tspan').forEach((tspan)=>{
        tspan.style.cursor = "pointer";
    });
}

function remove_events(svg){
    svg.removeEventListener( 'touchstart', onMousePan);
    svg.removeEventListener( 'touchend', onMousePan);
    svg.removeEventListener( 'mousedown', onMousePan);
    svg.removeEventListener( 'mousemove', onMousePan);
    svg.removeEventListener( 'wheel', onWheel);
    svg.removeEventListener( 'click', onClick);
    svg.removeEventListener( 'contextmenu', onContext);
    svg.querySelectorAll('tspan').forEach((tspan)=>{
        tspan.style.cursor = "default";
    })
}

function onClick(e){
    if(e.target.tagName == "tspan"){
        let svg = get_svg(e.target);
        send_event("text_click",{svg:svg,text:e.target.innerHTML,click:"left"});
    }
}

function onContext(e){
    if(e.target.tagName == "tspan"){
        let svg = get_svg(e.target);
        send_event("text_click",{svg:svg,text:e.target.innerHTML,click:"right"});
    }
    e.preventDefault();
    e.stopPropagation();
}

function onMousePan(e){
    let mx = e.clientX;//e.offsetX
    let my = e.clientY;//e.offsetY
    let dx = mx - state.coord.x;
    let dy = my - state.coord.y;
    if((e.buttons == 1) && (e.type == "mousemove")){
        let svg = get_svg(e.target);
        svg_shift(svg,dx,dy);
    }
    state.coord.x = mx;
    state.coord.y = my;
    e.preventDefault();
    e.stopPropagation();
}

function onWheel(e){
    let step;
    //console.log(e.offsetX)
    if(e.deltaY > 0){
        step = 'up';
    }else if (e.deltaY < 0){
        step = 'down';
    }
    let svg = get_svg(e.target);
    let svg_rect_no_scale = svg.parentElement.getBoundingClientRect();
    let origin = {rx:e.offsetX / svg_rect_no_scale.width, ry:e.offsetY / svg_rect_no_scale.height};
    svg_scale(svg,step,origin);
    e.preventDefault();
    e.stopPropagation();
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

/**
 * Synchronous avriant of createElement, will block durin file fetch and return with the result
 * @param {html element} parent 
 * @param {Object} props 
 * @return {html element} svg element
 */
async function createElement_s(parent,props){
    let svg = await createElement(parent,props);
    return svg;
}

export{
    createElement,
    highlightText,
    enable,
    disable,
};
