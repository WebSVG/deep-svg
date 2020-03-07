import * as svgm from "../src/index.js";


async function main(){
    
    let svg = await svgm.createElement(document.body,{src:"/demo/diagram.svg",id:"diagram_a"});
    console.log(`created svg element '${svg.id}'`);
    window.addEventListener('text_click',onTextClick);
}

function onTextClick(e){
    console.log(`main> '${e.detail.text}' text clicked on '${e.detail.svg.id}'`);
    setTimeout(()=>{svgm.highlightText(e.detail.svg,e.detail.text,"opacity")}
    ,1000)
}

main()
.then(()=>console.log("main done"))

