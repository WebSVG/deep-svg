import "../src/index.js";

function html(parent,text){
    const fragment = document.createRange().createContextualFragment(text);
    parent.appendChild(fragment);//this also returns fragment, not the newly created node
    return parent.childNodes[parent.childNodes.length-1];
}

function main(){
    const src = "/demo/diagram.svg"
    const deep = html(document.body,/*html*/`<deep-svg id="id1" src=${src} enable="true" />`);
    console.log(`created svg element '${deep.id}'`);
    deep.addEventListener('text_click',onTextClick);
}

function onTextClick(e){
    if(e.detail.click == "left"){
        console.log(`main> left click on '${e.detail.text}' from '${e.target.id}'`);
        e.target.highlightText(e.detail.text);
    }else{
        console.log(`main> right click on '${e.detail.text}' from '${e.target.id}'`);
    }
}

main()
console.log("main done")

