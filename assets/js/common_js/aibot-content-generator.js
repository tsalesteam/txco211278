(function(){

let aiInitialized = false;

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", initAIBot);

function initAIBot(){

    if(aiInitialized) return;
    aiInitialized = true;

    injectStyles();
    observeEditableState();
}

/* ===============================
   DETECT EDIT MODE
================================ */

function observeEditableState(){

    const observer = new MutationObserver(() => {

        const editableEls = document.querySelectorAll('[contenteditable="true"]');

        if(editableEls.length){
            attachBots();
        }else{
            removeBots();
        }

    });

    observer.observe(document.body,{
        attributes:true,
        subtree:true,
        attributeFilter:["contenteditable"]
    });

}

/* ===============================
   ADD AI BOT ICON
================================ */

function attachBots(){

    const editableEls = document.querySelectorAll('[contenteditable="true"]');

    editableEls.forEach(el=>{

        const text = cleanText(el.textContent);

        if(text.length < 200) return;

        if(el.querySelector(".aiBotImage")) return;

        const img = document.createElement("img");
        img.src="assets/images/AiBot.png";
        img.className="aiBotImage jumping";
        img.title="Generate content with AI";

        el.appendChild(img);

    });

}

/* ===============================
   REMOVE ICONS
================================ */

function removeBots(){
    document.querySelectorAll(".aiBotImage").forEach(el=>el.remove());
}

/* ===============================
   TEXT CLEAN
================================ */

function cleanText(t){
    return (t||"").replace(/\s+/g," ").trim();
}

/* ===============================
   EVENTS
================================ */

let isAudioPlaying=false;

document.addEventListener("mouseenter",function(e){

    if(!e.target.classList.contains("aiBotImage")) return;

    if(!isAudioPlaying){

        isAudioPlaying=true;

        const audio=new Audio("assets/aiBotAudio.mp3");
        audio.play();

        audio.onended=()=>isAudioPlaying=false;
    }

},true);


/* ===============================
   CLICK AI BOT
================================ */

document.addEventListener("click",function(e){

    if(!e.target.classList.contains("aiBotImage")) return;

    const parent = e.target.closest('[contenteditable="true"]');
    if(!parent) return;

    openModal(parent);

});


/* ===============================
   MODAL
================================ */

function openModal(parent){

    const currentText = parent.innerText.trim();

    const modal = document.createElement("div");
    modal.className="ai-modal";

    modal.innerHTML=`

        <div class="ai-modal-content">

            <span class="ai-close">&times;</span>

            <h3>AI Content Generator</h3>

            <textarea id="topicInput">${currentText}</textarea>

            <button id="generateBtn">Generate</button>

            <textarea id="resultText"></textarea>

            <button id="insertBtn">Insert</button>

        </div>

    `;

    document.body.appendChild(modal);

    modal.querySelector(".ai-close").onclick=()=>modal.remove();

    modal.querySelector("#generateBtn").onclick=function(){

        const topic=document.getElementById("topicInput").value;

        document.getElementById("resultText").value=
        "Generated content for: "+topic;

    };

    modal.querySelector("#insertBtn").onclick=function(){

        parent.innerText=document.getElementById("resultText").value;
        modal.remove();

    };

}

/* ===============================
   CSS
================================ */

function injectStyles(){

const css=`

.aiBotImage{
width:28px;
height:28px;
margin-left:6px;
cursor:pointer;
}

.jumping{
animation:aiJump 1s infinite;
}

@keyframes aiJump{
0%{transform:translateY(0)}
50%{transform:translateY(-5px)}
100%{transform:translateY(0)}
}

.ai-modal{
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,0.7);
display:flex;
align-items:center;
justify-content:center;
z-index:999999;
}

.ai-modal-content{
background:white;
padding:25px;
width:500px;
border-radius:10px;
}

.ai-close{
cursor:pointer;
float:right;
font-size:22px;
}

textarea{
width:100%;
margin-top:10px;
}

button{
margin-top:10px;
padding:6px 12px;
cursor:pointer;
}

`;

const style=document.createElement("style");
style.innerHTML=css;
document.head.appendChild(style);

}

})();