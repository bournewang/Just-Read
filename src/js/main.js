import Vue from 'vue';

import Main from './pages/Main.vue';

// window.onload = function(){
console.log("===== window.onload====")
var myDiv = document.createElement("div");
myDiv.id = 'main_app';
myDiv.innerHTML = "Main PAGE";
document.body.appendChild(myDiv);

const app = new Vue({
    el: '#main_app',
    render: createElement => createElement(Main)
});
// }
