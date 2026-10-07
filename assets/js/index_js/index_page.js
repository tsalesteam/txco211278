 // generate content code till line no.1750
let sectionFileMap = {};
let originalSectionMap = {};
let isOriginalImageChanged = false;
// let currentSection = null;

// function generateContent(id) {

//     currentSection = id;

//     const htmlContent = document.getElementById(id).innerText;

//     AIBridge.send({
//         type: "GENERATE_TEXT",
//         payload: { text: htmlContent }
//     });
// }

// AIBridge.onMessage(function (data) {

//     if (data.type === "GENERATE_TEXT_RESULT") {

//         document.getElementById(currentSection).innerHTML = data.payload.text;

//     }


// });

// //

function loadSavedSections(reqSrc){
    cookieStr = (reqSrc!=undefined && reqSrc== "headerAndFooterAIGeneratedSections") ? "header_footer_AI_generated_sections" : "middle_AI_generated_sections"
    var ai_sections = getCookie(cookieStr);
    //var ai_sections = getCookie("middle_AI_generated_sections")
    ai_sections_str="";
    if (ai_sections!=null && ai_sections!= undefined) {
        var ai_sections_arr = JSON.parse(ai_sections)
        ai_sections_str = ai_sections_arr.join(",");
    }

    if (!ai_sections_str) {
        console.warn("No AI sections found in cookie");
        return;
    }
    fetch(`/ai/get_saved_sections?client=${getCookie("clientName")}&project=${getCookie("projectName")}&ai_generated_sections=${ai_sections_str}&reqSrc=${reqSrc}`)
    .then(res => res.json())
    .then(data => {

        console.log('data: ', data);

        if (!data || Object.keys(data).length === 0) {
            console.warn("No sections returned from backend");
            return;
        }

        Object.keys(data).forEach(sectionId => {

            const item = data[sectionId];
            const container = $("#"+sectionId);

            if(!container.length){
                console.warn("Container not found:", sectionId);
                return;
            }

            // PRESERVE STRUCTURE
            sectionFileMap[sectionId] = {
                ...sectionFileMap[sectionId],
                final: item.file_path
            };

            // CREATE / FIND AI WRAPPER
            let aiWrapper = container.find(".ai-generated-wrapper");

            if(!aiWrapper.length){
                aiWrapper = $(`<div class="ai-generated-wrapper" data-template="${item.file_path}"></div>`);
                container.append(aiWrapper);
            }

            // INJECT AI CONTENT
            aiWrapper.html(item.html);
            aiWrapper.attr("data-template", item.file_path);

            //
            aiWrapper.hide();
            container.children("section, footer, div").first().show();

            //  SHOW TOGGLE (UI ONLY)
           container.find(".ai-toggle").show();

const aiCheckbox = container.find(".ai-version-checkbox");

// restore AI state
const savedHF = JSON.parse(getCookie("globalHeader") || "{}");
const savedFooter = JSON.parse(getCookie("globalFooter") || "{}");

const isHeaderMatch = savedHF.id === sectionId && savedHF.isAI;
const isFooterMatch = savedFooter.id === sectionId && savedFooter.isAI;

setTimeout(() => {
    if (isHeaderMatch || isFooterMatch) {
        aiCheckbox.prop("checked", true).trigger("change");
    } else {
        aiWrapper.hide();
        container.children("section, footer, div").first().show();
    }
}, 50);
            //  RESET ONLY (NO SIDE EFFECT)
            // aiCheckbox.prop("checked", false);
            //  REMOVE THIS (VERY IMPORTANT)
            // aiCheckbox.trigger("change");
// alert(ai_sections_str);
        });

    });
}
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();

            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// AI CONTENT MODAL SYSTEM

let currentSection = null;
let generatedText = "";
let updateImagesOnlyMode = false;

const style = document.createElement("style");
style.innerHTML = `
.ai-modal{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.6);
    display:none;
    z-index:9999;
    align-items:center;
    justify-content:center;
    backdrop-filter:blur(4px);
}

.ai-modal-content{
    width:900px;
    max-height:85vh;
    background:white;
    border-radius:14px;
    padding:25px;
    display:flex;
    flex-direction:column;
    box-shadow:0 20px 60px rgba(0,0,0,0.2);
     position: relative;
}

.ai-tabs{
    display:flex;
    gap:20px;
    border-bottom:1px solid #eee;
}

.ai-tab{
    padding:10px 16px;
    cursor:pointer;
    font-weight:500;
    color:#666;
}

.ai-tab.active{
    border-bottom:3px solid #F28F32;
    color:#000;
    font-weight:600;
}
.ai-actions{
    margin-top:20px;
    display:flex;
    gap:10px;
    justify-content:flex-end;
}
.ai-body{
    flex:1;
    overflow-y:auto;
    overflow-x:auto;
    margin-top:15px;
}
.ai-tab-content{
    width:100%;
}
.ai-body .navbar{
    position:absolute!important;
}
.website-builder .ai-tab-content{
  overflow:hidden;
}

.website-builder .ai-tab-content .section-wrapper{
  min-width:1200px;
  zoom:0.67;
}

.ai-tab-content img{
    max-width:100% !important;
}

.ai-tab-content .container,
.ai-tab-content .container-fluid{
    max-width:100% !important;
    width:100% !important;
}
.ai-tab-content{
    display:none;
}
.ai-tab-content section{
    transform:scale(0.9);
    transform-origin:top left;
}
.ai-tab-content.active{
    display:block;
}

.ai-actions{
    margin-top:15px;
    display:flex;
    gap:10px;
}

.ai-btn{
    padding:8px 14px;
    border:none;
    background:#000;
    color:white;
    cursor:pointer;
    border-radius:4px;
}

#ai-generate,
#ai-apply,
#ai-update-images-only{
  background: linear-gradient(90deg, #F28F32 0%, #a73729 100%);
  color:#fff;
  border-radius:30px;
  border:none;
  padding:8px 22px;
  cursor:pointer;
  font-weight:500;
}
.generate-btn{
background: linear-gradient(90deg, #F28F32 0%, #a73729 100%);
  color: #fff;
  border-radius: 30px;
  border: none;
  padding: 0px 14px 0px 14px;
  cursor: pointer;
  font-weight: 500;
  margin-left: 16px;
  font-size: 18px;
}

.generate-btn:disabled {
  background: linear-gradient(90deg, #d3d3d3 0%, #b5b5b5 100%);
  color: #777;
  cursor: not-allowed;
  opacity: 0.8;
}
  .generate-btn:disabled,
.generate-btn:disabled:hover {
  background: linear-gradient(90deg, #d3d3d3 0%, #b5b5b5 100%);
  color: #777;
  cursor: not-allowed;
  opacity: 0.8;
}
  .generate-btn:hover{
  background: linear-gradient(90deg, #a73729 0%, #F28F32 100%);
  }
  .generate-btn span i{
  vertical-align: top;
  }

#ai-close,
#edit-images{
  background:#000;
  color:#fff;
  border-radius:30px;
  border:none;
  padding:8px 22px;
  cursor:pointer;
}

 .ai-switch-icon{
font-size: 20px;
color: #ffb200;
  margin: 0 6px;
    margin-right: 6px;
  padding: 0 11px;
  margin-right: 21px;
}
.ai-body{
    flex:1;
    overflow-y:auto;
    overflow-x:auto;
    margin-top:15px;
    position:relative;
}
.ai-loader{
    position:absolute;
    inset:0;
    background:rgba(255,255,255,0.6);
    backdrop-filter:blur(3px);
    display:none;
    align-items:center;
    justify-content:center;
    flex-direction:column;
    gap:15px;
    z-index:10;
}

.ai-spinner{
    width:42px;
    height:42px;
    border:4px solid rgba(0,0,0,0.1);
    border-top:4px solid #F28F32;
    border-radius:50%;
    animation:spin 0.9s linear infinite;
}

@keyframes spin{
    to{ transform:rotate(360deg); }
}

.image-picker-modal{
position:fixed;
inset:0;
background:rgba(0,0,0,0.6);
display:flex;
align-items:center;
justify-content:center;
z-index:99999;
}

.image-picker-box{
  background: linear-gradient(145deg, #fff, #e1e1e1);
width:560px;
padding:20px;
border-radius:10px;
}

.image-grid{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:10px;
margin-top:10px;
}

#imgUrlInput{
border-radius:21px;
}

.image-grid img{
width:100%;
cursor:pointer;
border:2px solid transparent;
}

.image-grid img.selected{
border:2px solid red;
}

.preview-box img{
max-width:100%;
margin-top:10px;
}

/*
image upload modal */

.image-picker-modal .modal-body {
  max-height: 64vh;
  overflow-y: auto;
  padding-right: 16px;
  padding: 11px;
  background: #ffffffb0;
  border-radius: 10px;
  border: 1px solid #ececec;
}
.image-picker-modal .modal-body::-webkit-scrollbar {
  width: 6px; /* thin scrollbar */
}

.image-picker-modal .modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.image-picker-modal .modal-body::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.image-picker-modal .modal-body::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

/* ===== Firefox ===== */
.image-picker-modal .modal-body {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}
.image-picker-modal .modal-content {

  background: linear-gradient(145deg, #fff, #e1e1e1);
  color: #fff;
  border-radius: 18px;
  border: none;
  box-shadow: 0 20px 60px rgba(0,0,0,.6);
}


.image-picker-modal .modal-header .close{
  font-size: 34px!important;
  color: #1f1f2e;
}
.image-picker-modal .modal-header .close:hover{
 color: #f4402a;
}
.image-picker-modal .modal-footer {
margin-top: 10px;
}
.image-picker-modal .modal-footer .btn{
border-radius: 25px;
}
.image-picker-modal .modal-title{
/* color: #fff; */
color: #1f1f2e;
}
#img-url{
  border-radius: 35px;
}

.image-picker-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.image-picker-tabs button {
  background: #1f1f2e;
  color: #bbb;
  border: none;
  padding: 6px 14px;
  border-radius: 999px;
}

.image-picker-tabs button.active {
  background: linear-gradient(135deg, #e39a4e, #fb1b1b);
  color: #fff;
}
#pexelsSearch, #imgUrl,#pixabaySearch{
 border-radius: 35px;
}


.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.image-grid img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid transparent;
}

.image-grid img.selected {
  border-color: #6a5cff;
}

.upload-box {
  border: 2px dashed #444;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  color: #1f1f2e;
}

.preview-box {
  margin-top: 14px;
  text-align: center;
}

.preview-box img {
  max-width: 100%;
  max-height: 180px;
  border-radius: 12px;
}

.url-row {
  display: flex;
  gap: 8px;
}

.btn-capsule {
  border-radius: 999px;
}

.hidden { display:none; }
/* Buttons */
.website-info-btn-primary {
  background: linear-gradient(135deg, #e39a4e, #fb1b1b);
  color: #fff !important;
  border: none;
  padding: 8px 30px;
  border-radius: 230px;
  font-weight: 600;
  transition: 0.3s;
  font-size: 15px;
}

.website-info-btn-primary:hover {
  background: linear-gradient(135deg, #fb1b1b, #e39a4e);
}

#ai-close-x{
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 22px;
    cursor: pointer;
    font-weight: bold;
    z-index: 20;
}

`;
document.head.appendChild(style);

// Create Modal HTML

const modal = document.createElement("div");
modal.className = "ai-modal";

modal.innerHTML = `
<div class="ai-modal-content">
<span id="ai-close-x">×</span>
    <div class="ai-tabs">
        <div class="ai-tab active" data-tab="original">Original</div>
        <div class="ai-tab" data-tab="generated">AI Generated</div>
    </div>

    <div class="ai-body">
        <div id="ai-loader" class="ai-loader">
        <div class="ai-spinner"></div>
        <p>Generating AI Content...</p>
        </div>
        <div id="ai-original" class="ai-tab-content active"></div>

        <div id="ai-generated" class="ai-tab-content"></div>

    </div>

<div class="ai-actions">
    <button id="ai-generate" class="ai-btn">Generate Content and Update Images</button>
    <button id="ai-update-images-only" class="ai-btn">Update Images only</button>
    <button id="edit-images" class="ai-btn">Edit Images</button>
    <button id="ai-apply" class="ai-btn">Apply Changes</button>

</div>

</div>
`;

document.body.appendChild(modal);
updateActionButtons("original");
// -----------------------------
// Tab Switching
// -----------------------------
document.querySelectorAll(".ai-tab").forEach(tab => {
    tab.onclick = function(){

        document.querySelectorAll(".ai-tab").forEach(t=>t.classList.remove("active"));
        document.querySelectorAll(".ai-tab-content").forEach(c=>c.classList.remove("active"));
        this.classList.add("active");
        if(this.dataset.tab === "original"){
            document.getElementById("ai-original").classList.add("active");
            updateActionButtons("original");
        }else{
            document.getElementById("ai-generated").classList.add("active");
            updateActionButtons("generated");
        }
    }
});

// Open Ai Modal to generate section
function openAIModal(){
    modal.style.display = "flex";
}
// Close Modal
$(document).on("click", "#ai-close-x", function () {
    const container = $('[data-tab="generated"]').hasClass("active")
        ? $("#ai-generated")
        : $("#ai-original");
    resetImageEditMode(container);
    updateImagesOnlyMode = false;
    delete sectionFileMap[currentSection];
    modal.style.display = "none";
});

// Generate Content Button
document.getElementById("ai-generate").onclick = async function () {
const applyBtn = document.getElementById("ai-apply");
applyBtn.style.display = "none";
let htmlContent;

const isGeneratedActive = document.querySelector('[data-tab="generated"]').classList.contains("active");

if(isGeneratedActive){
    htmlContent = document.getElementById("ai-generated").innerHTML;
}else{
    htmlContent = document.getElementById("ai-original").innerHTML;
}
    document.getElementById("ai-loader").style.display = "flex";

const selectedCategory = getCookie("selectedCategory") || "" ;
    try {
        const isHeader = currentSection.toLowerCase().includes("header");
        const isFooter = currentSection.toLowerCase().includes("footer");
        let srcType = "";
        if (isHeader || isFooter) {
        srcType = "hf";
        }
        console.log("Section:", currentSection);
        console.log("isHeader:", isHeader);
        console.log("isFooter:", isFooter);
        const response = await fetch("/ai/generate/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({
                html: htmlContent,
                sectionId: currentSection,
                categoryName: selectedCategory,
                src: srcType,
                client: getCookie("clientName"),
                project: getCookie("projectName")
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to generate content");
        }

        document.getElementById("ai-generated").innerHTML = data.generated;

        document.querySelector('[data-tab="generated"]').style.display = "block";

        sectionFileMap[currentSection] = {
            temp: data.temp_file
        };

        document.querySelector('[data-tab="generated"]').click();
        updateActionButtons("generated");
    } catch (error) {
        console.error(error);

        // Show error message in UI
        alert(error.message || "Unexpected error occurred. Please try again.");
    } finally {
        document.getElementById("ai-loader").style.display = "none";
        applyBtn.style.display = "inline-block";
    }
};

document.getElementById("ai-update-images-only").onclick = async function () {

    updateImagesOnlyMode = true;

    const htmlContent = document.getElementById("ai-original").innerHTML;

    document.getElementById("ai-generated").innerHTML = htmlContent;

    document.querySelector('[data-tab="generated"]').style.display = "block";
    document.querySelector('[data-tab="generated"]').click();

    updateActionButtons("generated");

    try {

        const formData = new FormData();

        formData.append("sectionId", currentSection);
        formData.append("html", htmlContent);
        formData.append("client", getCookie("clientName"));
        formData.append("project", getCookie("projectName"));

        const response = await fetch("/ai/save_section/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to create AI section file");
        }

        sectionFileMap[currentSection] = {
            temp: data.file
        };

    } catch (error) {
        console.error("AI section file creation failed:", error);
    }
};


// document.getElementById("ai-generate").onclick = function(){

//     const htmlContent = document.getElementById("ai-original").innerHTML;

//     AIBridge.send({
//         type:"GENERATE_TEXT",
//         payload:{ text: htmlContent }
//     });

// };

// Apply Button
function getSectionType(sectionId){
    return $("#"+sectionId).data("section-type");
}
document.getElementById("ai-apply").onclick = async function(){

    const isGeneratedActive = $('[data-tab="generated"]').hasClass("active");
    let sourceContainer = isGeneratedActive ? $("#ai-generated") : $("#ai-original");
    let generatedHTML = sourceContainer.html();
    modal.style.display = "none";

    addAIgeneratedsectionsincookies(currentSection);

    const generatedContainer = sourceContainer;
    resetImageEditMode(generatedContainer);

    let imagesData = [];
    for (let img of generatedContainer.find("img")) {
        let src = $(img).attr("src");
        try {
            let base64 = await toDataURL(src);

            imagesData.push({
                name: src.split("/").pop().split("?")[0],
                data: base64
            });

        } catch (e) {
            console.error("Image convert failed:", src);
        }
    }

    const container = $("#" + currentSection);
    let aiWrapper = container.find(".ai-generated-wrapper");
    if(!aiWrapper.length){
        aiWrapper = $('<div class="ai-generated-wrapper"></div>');
        container.append(aiWrapper);
    }

    aiWrapper.html(generatedHTML);
    container.find(".ai-toggle").show();

    const originalCheckbox = $("#" + currentSection + "_component");
    const aiCheckbox = container.find(".ai-version-checkbox");

    aiCheckbox.prop("checked", true);
    originalCheckbox.prop("checked", false);

    toggleGenerateButton(currentSection);
    container.attr("data-ai-selected", "true");

    aiWrapper.show();
    container.children("section, footer, div").first().hide();

    handleSectionSelection(originalCheckbox);

    try{
        const formData = new FormData();
        generatedHTML = getCleanHTML(sourceContainer);
        formData.append("sectionId", currentSection);
        formData.append("html", generatedHTML);
        formData.append("client", getCookie("clientName"));
        formData.append("project", getCookie("projectName"));

        const res = await fetch("/ai/save_section/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: formData
        });

        const response = await res.json();
        aiWrapper.attr("data-template", response.file);

        sectionFileMap[currentSection] = {
            ...sectionFileMap[currentSection],
            final: response.file
        };

        updateSectionTemplate(currentSection, true);

        setGlobalVariablesInLocalStorage(currentSection);

    }catch(err){
        console.error("Save failed:", err);
    }

    finally {
        modal.style.display = "none";
    }
};

function addAIgeneratedsectionsincookies(sectionId){
    const child = document.querySelector('#' + sectionId);
    const parent = child.parentElement;
    parnetTagCLassName = parent.className;

    if(parnetTagCLassName!=undefined) {
        if(parnetTagCLassName.includes("header") || parnetTagCLassName.includes("footer")) {
            let listhf = JSON.parse(getCookie("header_footer_AI_generated_sections") || "[]");

            sectionTypeStr =  parnetTagCLassName.includes("header") ? "header:" : "footer:";

            let index = listhf.findIndex(item => item.startsWith(sectionTypeStr));

            if (index !== -1) {
                listhf[index] = sectionTypeStr + sectionId;
            } else {
                listhf.push(sectionTypeStr + sectionId);
            }
            document.cookie = "header_footer_AI_generated_sections=" + JSON.stringify(listhf) + "; path=/";

        }  else if (parnetTagCLassName.includes("middle") ) {
            let list = JSON.parse(getCookie("middle_AI_generated_sections") || "[]");

            if(!list.includes(sectionId)){
                list.push(sectionId);
                document.cookie = "middle_AI_generated_sections=" + JSON.stringify(list) + "; path=/";
            }
        }
    }



}


// ON PUBLISH MOVE THE GENERATED SECTION FILES TO PAGECOMPONENTS FOLDER

async function publishProject() {
    const client = getCookie("clientName");
    const project = getCookie("projectName");
    const subcategory = "tutor"
    // or localStorage.getItem("selectedSubcategory")

    if (!client || !project || !subcategory) {
        console.error("Missing required data:", { client, project, subcategory });
        console.log("Missing publish data");
        return;
    }
    try {
        const res = await fetch("/ai/publish_project/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({
                client: client,
                project: project,
                subcategory: subcategory
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Publish error:", data);
            alert(data.error || "Publish failed");
            return;
        }

        console.log("Publish success:", data);
        alert("Project Published Successfully");

    } catch (err) {
        console.error("Publish failed:", err);
        alert("Something went wrong");
    }
}
// Start Generation
function generateContent(sectionId){

    currentSection = sectionId;

    const container = document.getElementById(sectionId);

    // ORIGINAL SECTION
    if(!originalSectionMap[sectionId]){

        let cloned = container.cloneNode(true);

        // remove builder UI
        $(cloned).find(".radio-holder").remove();

        originalSectionMap[sectionId] = cloned.innerHTML;
    }

    const originalHTML = originalSectionMap[sectionId] || "";
    const generatedWrapper = container.querySelector(".ai-generated-wrapper");
    let generatedHTML = "";
    if(generatedWrapper){
        generatedHTML = generatedWrapper.innerHTML;
        generatedText = generatedHTML;
    }else{
        generatedText = "";
    }

    document.getElementById("ai-original").innerHTML = originalHTML;
    document.getElementById("ai-generated").innerHTML = generatedHTML;
const generatedTab = document.querySelector('[data-tab="generated"]');

if(generatedHTML){
    generatedTab.style.display = "block";
    document.querySelector('[data-tab="generated"]').click();
    updateActionButtons("generated");

}else{
    generatedTab.style.display = "none";
    document.querySelector('[data-tab="original"]').click();
    updateActionButtons("original");
}
    openAIModal();
}

// Worker Response

AIBridge.onMessage(function(data){
    if(data.type === "GENERATE_TEXT_RESULT"){
        generatedText = data.payload.text;
        // alert('generatedText: '+ generatedText)
       document.getElementById("ai-generated").innerHTML = generatedText;
        // switch to generated tab
        document.querySelector('[data-tab="generated"]').click();
    }

});



//PUBLISH SITE THEN MOVE THE NEW SECTION GENERATED TO RESPECTIVE FOLDERS
async function publishSite(){

    const response = await fetch("/ai/publish/",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body:JSON.stringify({
            sections: sectionFileMap
        })
    });
    const data = await response.json();
    console.log("Published:", data.files);
}

$(document).on("change",".ai-version-checkbox",function(){
    const sectionId = $(this).data("target");
    const container = $("#"+sectionId);
    const originalCheckbox = $("#"+sectionId+"_component");
    if($(this).is(":checked")){
        originalCheckbox.prop("checked", false);
        container.children("section, footer, div").first().hide();
        container.find(".ai-generated-wrapper").show();
    }else{
        container.find(".ai-generated-wrapper").hide();
        container.children("section, footer, div").first().show();
    }

});
$(document).on("change",".section-checkbox",function(){
    const sectionId = $(this).attr("id").replace("_component","");
    const container = $("#"+sectionId);

    // uncheck AI checkbox
    container.find(".ai-version-checkbox").prop("checked",false);
    container.find(".ai-generated-wrapper").hide();
    container.children("section, footer, div").first().show();

});

// EDITING IMAGE
let allImageElements = [];


$("#edit-images").on("click", function () {

    const isGeneratedActive = $('[data-tab="generated"]').hasClass("active");
    const container = isGeneratedActive ? $("#ai-generated") : $("#ai-original");

    // store original background
    container.find("*").each(function () {
        const bg = $(this).css("background-image");
        if (bg && bg !== "none") {
            $(this).attr("data-original-bg", bg);
        }
    });

    allImageElements = [];

    container.find("img").each(function () {

        allImageElements.push({
            type: "img",
            el: this,
            src: $(this).attr("src")
        });

        $(this).css({
            outline: "2px dashed #ff5c5c",
            cursor: "pointer",
            border: "5px solid red"
        });

        $(this).off("click.imageEdit").on("click.imageEdit", function (e) {
            e.preventDefault();
            e.stopPropagation();
            currentEditingImg = this;
            openImagePicker(this);
        });

    });

    container.find("*").each(function () {

        const el = this;
        const bg = window.getComputedStyle(el).backgroundImage;

        if (bg && bg !== "none" && !bg.includes("gradient")) {

            const match = bg.match(/url\(["']?(.*?)["']?\)/);

            if (match && match[1]) {

                allImageElements.push({
                    type: "background",
                    el: el,
                    src: match[1]
                });

                $(el).css({
                    outline: "2px dashed blue",
                    cursor: "pointer"
                });

                $(this).off("click.imageEdit").on("click.imageEdit", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    currentEditingImg = this;
                    openImagePicker(this);
                });

            }
        }

    });

    imageMetaMap = new Map();


});

// pexel api for image
let selectedImageSrc = null;
let selectedFile = null;
let currentEditingImg = null;
const PEXELS_KEY = "7QPIcP3MfPcDte34Q1Vsu1lPrl0iwWFZ5GOl1NUgcLN40W6zhih4Yv5i";
function openImagePicker(targetImg) {
    currentEditingImg = targetImg;
    if ($("#imagePickerModal").length === 0) {
        const modal = $(`
        <div id="imagePickerModal" class="image-picker-modal">
            <div class="image-picker-box">
                <div class="modal-header">
                    <button class="close" data-dismiss="modal">&times;</button>
                    <h4>Select Image</h4>
                </div>

                <div class="modal-body">

                    <div class="image-picker-tabs">
                        <button class="tab-btn" data-tab="pexels">Pexels</button>
                        <button class="tab-btn" data-tab="upload">Upload</button>
                        <button class="tab-btn" data-tab="url">URL</button>
                    </div>

                    <div class="tab-content-area"></div>

                    <div class="preview-box hidden">
                        <img id="previewImage">
                    </div>

                </div>

                <div class="modal-footer">
                    <button class="btn btn-default" id="cancelImage">Cancel</button>
                    <button class="btn website-info-btn-primary" id="confirmImage">Apply</button>
                </div>
            </div>
        </div>
        `);

        $("body").append(modal);
    }

    $("#imagePickerModal").css("display", "flex");

    // FIX: always reset to Pexels
    $(".tab-btn").removeClass("active");
    $('.tab-btn[data-tab="pexels"]').addClass("active");

    selectedImageSrc = null;
    selectedFile = null;

    loadPexels();
}

// TAB SWITCH
$(document).on("click", ".tab-btn", function () {

    $(".tab-btn").removeClass("active");
    $(this).addClass("active");

    $(".preview-box").addClass("hidden");

    selectedImageSrc = null;
    selectedFile = null;

    const tab = $(this).data("tab");
    // if (tab === "assets") loadAssets();
    if (tab === "pexels") loadPexels();
    if (tab === 'pixabay') loadPixabay();
    if (tab === "upload") loadUpload();
    if (tab === "url") loadURL();
});

// -----------------------------
// ASSETS TAB
// -----------------------------
// function loadAssets() {

//     $(".tab-content-area").html(`

//         <div class="image-grid">
//             <img src="assets/images/library/sample-1.jpg">
//             <img src="assets/images/library/sample-2.jpg">
//             <img src="assets/images/library/sample-3.jpg">
//         </div>

//     `);

//     $(".image-grid img").on("click", function () {

//         $(".image-grid img").removeClass("selected");

//         $(this).addClass("selected");

//         selectedImageSrc = $(this).attr("src");
//         selectedFile = null;

//         $("#previewImage").attr("src", selectedImageSrc);

//         $(".preview-box").removeClass("hidden");

//     });

// }

// -----------------------------
// PEXELS TAB
// -----------------------------
function loadPexels() {
 $(".tab-content-area").html(`
        <input id="pexelsSearch" class="form-control" placeholder="Search images">
        <div id="pexelsResults" class="image-grid"></div>
    `);

    // AUTO LOAD FROM COOKIE
    const selectedCategory = getCookie("selectedCategory") || "";
    const formattedCategory = selectedCategory.replace(/_/g, " ");
    if (formattedCategory) {
        // set input value
        $("#pexelsSearch").val(formattedCategory);
        // fetch images automatically
        fetch(`https://api.pexels.com/v1/search?query=${formattedCategory}&per_page=6`, {
            headers: { Authorization: PEXELS_KEY }
        })
        .then(res => res.json())
        .then(res => {
            const grid = $("#pexelsResults");
            grid.html("");
            res.photos.forEach(p => {
                const img = $(`<img src="${p.src.medium}">`);
                grid.append(img);
                img.on("click", function () {
                    selectedImageSrc = $(this).attr("src");
                    $("#previewImage").attr("src", selectedImageSrc);
                    $(".preview-box").removeClass("hidden");
                });
            });
        })
        .catch(err => console.error("Pexels auto load error:", err));
    }

    $("#pexelsSearch").on("keyup", function () {
        const q = $(this).val();
        if (q.length < 3) return;
        fetch(`https://api.pexels.com/v1/search?query=${q}&per_page=6`, {
            headers: { Authorization: PEXELS_KEY }
        })
        .then(res => res.json())
        .then(res => {
            const grid = $("#pexelsResults");
            grid.html("");
            res.photos.forEach(p => {
                const img = $(`<img src="${p.src.medium}">`);
                grid.append(img);
                img.on("click", function () {
                    selectedImageSrc = $(this).attr("src");
                    $("#previewImage").attr("src", selectedImageSrc);
                    $(".preview-box").removeClass("hidden");
                });
            });
        })
        .catch(err => console.error("Pexels search error:", err));
    });
}
// Pixbay TAB
function loadPixabay() {
    $('.tab-content-area').html(`
      <input class="form-control" id="pixabaySearch" placeholder="Search images">
      <br>
      <div class="image-grid" id="pixabayResults"></div>
    `);

    $('#pixabaySearch').keyup(function () {
        const q = this.value;
        if (q.length < 3) return;

        $.ajax({
            url: `https://pixabay.com/api/?key=YOUR_API_KEY&q=${q}&image_type=photo&per_page=9`,
            success: function (res) {

                let html = '';
                res.hits.forEach(p => html += `<img src="${p.webformatURL}">`);

                $('#pixabayResults').html(html);

                $('#pixabayResults img').click(function () {
                    $('#pixabayResults img').removeClass('selected');
                    $(this).addClass('selected');

                    selectedImageSrc = this.src;
                    selectedFile = null;

                    $('#previewImage').attr('src', this.src);
                    $('.preview-box').removeClass('hidden');
                });
            }
        });
    });
}
// UPLOAD TAB
function loadUpload() {
    $(".tab-content-area").html(`
        <div class="upload-box">Click to upload</div>
        <input type="file" id="imageUploadInput" accept="image/*" style="display:none">
    `);

    $(".upload-box").on("click", function () {
        $("#imageUploadInput").click();
    });

    $("#imageUploadInput").on("change", function () {
        const file = this.files[0];
        if (!file) return;
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = function (e) {
            selectedImageSrc = e.target.result;
            $("#previewImage").attr("src", selectedImageSrc);
            $(".preview-box").removeClass("hidden");
        };
        reader.readAsDataURL(file);

    });

}


// URL TAB
function loadURL() {
    $(".tab-content-area").html(`
<div style="display:flex;
gap:20px;">
        <input id="imgUrlInput" class="form-control" placeholder="Paste image URL">
        <button id="previewUrlBtn" class="btn website-info-btn-primary">Preview</button>
</div>
    `);

    $("#previewUrlBtn").on("click", function () {
        const url = $("#imgUrlInput").val();
        if (!url) return;
        selectedImageSrc = url;
        $("#previewImage").attr("src", url);
        $(".preview-box").removeClass("hidden");
    });
}


// APPLY IMAGE
async function toDataURL(src) {
    if (src.startsWith("data:image")) return src;

    const res = await fetch(src);
    const blob = await res.blob();

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

let ai_generated_image = "";
$(document).on("click", "#confirmImage", async function () {

    if (!selectedImageSrc || !currentEditingImg) return;

    const $el = $(currentEditingImg);

    let item = null;
    for (let i of allImageElements) {
        if (i.el === currentEditingImg) {
            item = i;
            break;
        }
    }

    if (!item) {
        item = {
            type: currentEditingImg.tagName === "IMG" ? "img" : "background",
            el: currentEditingImg
        };
    }

    let oldSrc = "";

    if (item.type === "img") {
        oldSrc = $el.attr("src") || "";
    } else {
        const bg = window.getComputedStyle(currentEditingImg).backgroundImage;
        const match = bg.match(/url\(["']?(.*?)["']?\)/);
        oldSrc = match ? match[1] : "";
    }

    let originalName = $el.attr("data-original-name");
    if (!originalName) {
        let oldName = oldSrc.split("/").pop().split("?")[0] || "image";
        originalName = oldName.split(".")[0];
        $el.attr("data-original-name", originalName);
    }

    try {
        selectedImageSrc = await toDataURL(selectedImageSrc);
    } catch (e) {
        return;
    }

    let ext = "png";
    if (selectedImageSrc.includes("image/jpeg")) ext = "jpg";
    if (selectedImageSrc.includes("image/webp")) ext = "webp";

    let newImageName = originalName + "." + ext;

    if (!$el.attr("data-original-src")) {
        $el.attr("data-original-src", oldSrc);
    }

    const dims = imageMetaMap.get(currentEditingImg) || {};

if (item.type === "img") {

    $el.attr("src", selectedImageSrc);

}else {

        const el = currentEditingImg;

        el.style.backgroundImage = "none";

        setTimeout(() => {

            el.style.backgroundImage = `url('${selectedImageSrc}')`;
            el.style.backgroundPosition = "center";
            el.style.backgroundRepeat = "no-repeat";

            el.style.backgroundSize = "cover";

            if (!el.offsetHeight) {
                el.style.minHeight = dims.height ? dims.height + "px" : "200px";
            }

        }, 10);
    }

    const isGeneratedActive = $('[data-tab="generated"]').hasClass("active");
    const container = isGeneratedActive ? $("#ai-generated") : $("#ai-original");

    resetImageEditMode(container);

    ai_generated_image = newImageName;

    const formData = new FormData();
    formData.append("sectionId", currentSection);
    formData.append("client", getCookie("clientName"));
    formData.append("project", getCookie("projectName"));
    formData.append("ai_generated_image", ai_generated_image);
    formData.append("images", selectedImageSrc);
    formData.append("original_image_path", oldSrc);

    let list = (getCookie("ai_generated_section_images") || "").split(",").filter(Boolean);

    if (!list.includes(ai_generated_image)) {
        list.push(ai_generated_image);
        document.cookie = "ai_generated_section_images=" + list.join(",") + "; path=/";
    }

    let sourceContainer = isGeneratedActive ? $("#ai-generated") : $("#ai-original");

    let generatedHTML = sourceContainer.html();

    try {
        const response = await fetch("/ai/save_section/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json(); // optional, if your backend returns JSON
            // Code changes to replace AI generated section area on main page with updated html file
            const adjacentBlockOfAIGeneratedSection = $("#"+currentSection);
            if(!adjacentBlockOfAIGeneratedSection.length){
                console.warn("Container not found:", currentSection);
                return;
            }
            let aiGeneratedSection = adjacentBlockOfAIGeneratedSection.find(".ai-generated-wrapper");
            aiGeneratedSection.html(data.file);
            // Replace AI generated section area in pop-up  with updated  html file
            document.getElementById("ai-generated").innerHTML = data.file;

        } else {
            console.error("Server error:", response.status);
        }

    } catch (err) {}

    currentEditingImg = null;
    selectedImageSrc = null;
    selectedFile = null;

    $("#imagePickerModal").hide();

});

// CANCEL
$(document).on("click", "#cancelImage, .close", function () {
    $("#imagePickerModal").hide();
});

function updateActionButtons(tab){
    const generateBtn = document.getElementById("ai-generate");
    const updateImagesBtn = document.getElementById("ai-update-images-only");
    const applyBtn = document.getElementById("ai-apply");
    const editBtn = document.getElementById("edit-images");

    if(tab === "original"){
        generateBtn.innerText = "Generate Content and Update Images";
        generateBtn.style.display = "inline-block";
        updateImagesBtn.style.display = "inline-block";
        applyBtn.style.display = "none";
        editBtn.style.display = "none";
    }else{
        generateBtn.style.display = updateImagesOnlyMode ? "none" : "inline-block";
        updateImagesBtn.style.display = "none";
        generateBtn.innerText = "Regenerate";
        applyBtn.innerText = "Apply Changes";
        applyBtn.style.display = "inline-block";
        editBtn.style.display = "inline-block";
    }
}
function getCleanHTML(container){

    let clone = container.clone();

    clone.find(".radio-holder").remove();
    clone.find(".generate-btn").remove();
    clone.find(".ai-toggle").remove();

    clone.find("*").each(function(){

        // restore background
        let originalBg = $(this).attr("data-original-bg");
        if (originalBg) {
            $(this).css("background-image", originalBg);
        }

        let style = $(this).attr("style");
        if(!style) return;

        let cleaned = style
            .replace(/outline\s*:[^;]+;?/gi, "")
            .replace(/border\s*:[^;]+;?/gi, "")
            .replace(/cursor\s*:[^;]+;?/gi, "");

        cleaned = cleaned.trim();

        if(cleaned === ""){
            $(this).removeAttr("style");
        }else{
            $(this).attr("style", cleaned);
        }

    });

    clone.find("img").each(function () {
        let originalSrc = $(this).attr("data-original-src");
        if (originalSrc) {
            $(this).attr("src", originalSrc);
        }
    });

    return clone.html().trim();
}

function resetImageEditMode(container){

    container.find("*").each(function(){

        this.style.outline = "";
        this.style.border = "";
        this.style.cursor = "";

        if(this.getAttribute("style") === ""){
            this.removeAttribute("style");
        }

        $(this).off("click.imageEdit");
    });
}





