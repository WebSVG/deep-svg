
//https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate
//calcMode [discrete | linear | paced | spline]

function anim_radius(id,max){
    return /*html*/`
    <animate id=${id} attributeName="radius" from="0" to=${max} dur="500ms" repeatCount="1"/>
    `
}

function anim_wave(id,attribute,max){
    return /*html*/`
    <animate id=${id} attributeName="${attribute}" values="0;${max};0" keyTimes="0;0.5;1" dur="500ms" repeatCount="1"/>
    `
}

function glow_anim(color){
    return /*html*/`
    <filter id="filter_glow_anim" height="300%" width="300%" x="-75%" y="-75%" data-anim="filter_ga-animate">
        <feMorphology operator="dilate" radius="0" in="SourceAlpha" result="fe_dilate">
            ${anim_wave("filter_ga-animate","radius",8)}
        </feMorphology>
        <feGaussianBlur in="fe_dilate" stdDeviation="5" result="fe_blur" />
        <feFlood flood-color="${color}" result="fe_flood" />
        <feComposite in="fe_flood" in2="fe_blur" operator="in" result="comp_blur_color" />
        <feMerge>
            <feMergeNode in="comp_blur_color"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>
    `
}

function glow(color){
    return /*html*/`
    <filter id="filter_glow" height="300%" width="300%" x="-75%" y="-75%">
        <feMorphology operator="dilate" radius="4" in="SourceAlpha" result="fe_dilate"/>
        <feGaussianBlur in="fe_dilate" stdDeviation="5" result="fe_blur" />
        <feFlood flood-color="${color}" result="fe_flood" />
        <feComposite in="fe_flood" in2="fe_blur" operator="in" result="comp_blur_color" />
        <feMerge>
            <feMergeNode in="comp_blur_color"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>
    `
}

function dur_to_ms(duration){
    if(duration.endsWith("ms")){
        return parseFloat(duration);
    }else{
        return parseFloat(duration)*1000;
    }
}

/**
 * attaches, plays animation then detaches if not indefinite specified in repeatCount
 * @param {html filter element} filter
 */
function start(element,filter){
    attach(element,filter);
    const anim_id = filter.getAttribute("data-anim");
    const anim = document.getElementById(anim_id);
    anim.beginElement();
    if(!(anim.getAttribute("repeatDur") == "indefinite")){
        const duration_ms = dur_to_ms(anim.getAttribute("dur"));
        console.log(`will detach after ${duration_ms} ms`);
        setTimeout(()=>{
            detach(element,filter);
        },duration_ms);
    }
}

/**
 * 
 * @param {svg element} element : the element to attach a filter to
 * @param {html filter element} filter 
 */
function attach(element,filter){
    element.setAttribute("filter",`url(#${filter.id})`);
}

/**
 * 
 * @param {svg element} element : the element to attach a filter to
 * @param {html filter element} filter 
 */
function detach(element,filter){
    element.removeAttribute("filter",`url(#${filter.id})`);
}

function create(svg,props){
    let filter_html;
    if(props.type == "glow"){
        filter_html = glow(props.color);
    }else if(props.type == "glow_anim"){
        filter_html = glow_anim(props.color);
    }else{
        console.warn(`unsupported filter type: '${props.type}'`);
        return;
    }
    let parent = svg.querySelector("defs");
    parent.insertAdjacentHTML("beforeend",filter_html);
    let filters = parent.getElementsByTagName("filter")
    return filters[filters.length-1];
}

function remove(svg,filter){
    const defs = svg.querySelector("defs");
    defs.removeChild(filter);
}

export {
    create,
    remove,
    start,
    attach,
    detach,
};
