import Vue from 'vue';

import Main from './pages/Main.vue';

// window.onload = function(){
console.log("===== window.onload====")
var myDiv = document.createElement("div");
myDiv.id = 'main_app';
myDiv.innerHTML = "Main PAGE";
document.body.appendChild(myDiv);

let scripts =  [
    "../external-libraries/datGUI/dat.gui.min.js",
    "../external-libraries/DOMPurify/purify.min.js",
    "../external-libraries/Rangy/rangy.min.js",
    "../external-libraries/Rangy/rangy-classapplier.min.js",
    "../external-libraries/Rangy/rangy-highlighter.min.js",
    "../external-libraries/Rangy/rangy-textrange.min.js",
    "../external-libraries/jquery/jquery-3.6.0.min.js",
    // "../js/content.js"
];

for (var i=0; i<scripts.length; i++) {
    var div = document.createElement("script");
    div.setAttribute("src", scripts[i]);
    document.body.appendChild(div);
}

const app = new Vue({
    el: '#main_app',
    render: createElement => createElement(Main)
});
// }
