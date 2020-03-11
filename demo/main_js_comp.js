import * as svgm from "../src/index.js";


async function main(){
    
    let svg = await svgm.createElement(document.body,{src:"/demo/diagram.svg",id:"diagram_a",enable:true});
    
    console.log(`created svg element '${svg.id}'`);
    svg.addEventListener('text_click',onTextClick);
}

function onTextClick(e){
    if(e.detail.click == "left"){
        console.log(`main> left click on '${e.detail.text}' from '${e.target.id}'`);
        svgm.highlightText(e.target,e.detail.text);
    }else{
        console.log(`main> right click on '${e.detail.text}' from '${e.target.id}'`);
    }
}

main()
.then(()=>console.log("main done"))

