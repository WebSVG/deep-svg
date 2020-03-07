import * as svgm from "../src/index.js";


async function main(){
    
    let svg = await svgm.createElement(document.body,{src:"/demo/diagram.svg",id:"diagram_a",enable:true});
    
    console.log(`created svg element '${svg.id}'`);
    window.addEventListener('text_click',onTextClick);

    svgm.highlightText(svg,"Webpack","opacity");
}

function onTextClick(e){
    if(e.detail.click == "left"){
        console.log(`main> left click on '${e.detail.text}' from '${e.detail.svg.id}'`);
        svgm.highlightText(e.detail.svg,e.detail.text,"opacity");
    }else{
        console.log(`main> right click on '${e.detail.text}' from '${e.detail.svg.id}'`);
    }
}

main()
.then(()=>console.log("main done"))

