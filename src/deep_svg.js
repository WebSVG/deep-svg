import * as svgm from "./index.js";

class DeepSvg extends HTMLElement{
    constructor(){
        console.log("constructor");
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        this.body = document.createElement("body");
        shadowRoot.appendChild(this.body);
        this.svg = null;
        this.ready = false;
    }
    load_src(){
        let enable = true;
        if(this.hasAttribute("enable")){
            enable = this.getAttribute("enable");
        }
        if(this.hasAttribute("src")){
            const src = this.getAttribute("src");
            console.log(`load src : ${src}`);
            if(this.svg != null){
                this.body.removeChild(this.svg);
                console.log("non null svg");
            }
            this.svg = svgm.createElement_s(this.body,{src:src,enable:enable})
        }
    }
    connectedCallback(){
        console.log("connected");
        this.load_src();
        this.addEventListener("highlightText",this.highlightText);
        this.ready = true;
    }
    static get observedAttributes() {
        return ['src','enable'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(!this.ready){
            return;
        }
        switch (name) {
            case 'src':
                this.load_src();
                break;
            case 'enable':
                svgm.setProperty(this.svg,{enable:newValue});
                break;
        }
    }
    highlightText(e){

    }
}

window.customElements.define('deep-svg',DeepSvg);
