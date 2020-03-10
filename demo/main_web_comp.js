import "../src/deep_svg.js";

function html(parent,text){
    parent.appendChild(document.createRange().createContextualFragment(text))
}

function main(){
    const src = "/demo/diagram.svg"
    html(document.body,/*html*/`<deep-svg id="id1" src=${src} enable="true" />`);

    console.log(`created svg element '${document.querySelector("deep-svg").id}'`);
    window.addEventListener('text_click',onTextClick);
}

function onTextClick(e){
    if(e.detail.click == "left"){
        console.log(`main> left click on '${e.detail.text}' from '${e.detail.id}'`);
        document.getElementById(e.detail.id).highlightText(e.detail.text);
    }else{
        console.log(`main> right click on '${e.detail.text}' from '${e.detail.id}'`);
    }
}

main()
console.log("main done")

