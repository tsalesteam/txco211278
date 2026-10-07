

// ==============start of loader code========================

function showProjectLoader(message = "Uploading changes, please wait…") {
    // If loader already exists, just update message and show
    let loader = $('#project-loader');
    if (!loader.length) {
        // Create the loader dynamically
        loader = $(`
            <div id="project-loader">
                <div class="pl-circle"></div>
                <div class="pl-text">${message}</div>
            </div>
        `).appendTo('body');

        // Inject CSS dynamically if not present
        if (!$('#project-loader-styles').length) {
            const css = `
                #project-loader {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #0f172ae3;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    z-index: 99999;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.4s ease;
                }

                #project-loader.active {
                    opacity: 1;
                    pointer-events: all;
                }

                .pl-circle {
                    width: 80px;
                    height: 80px;
                    border: 6px solid #64748b;
                    border-top-color: #38bdf8;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 12px;
                }

                .pl-text {
                    color: #e2e8f0;
                    font-size: 18px;
                    letter-spacing: 1px;
                    font-family: sans-serif;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            $('<style>', { id: 'project-loader-styles', text: css }).appendTo('head');
        }
    }

    // Update message and show
    loader.find('.pl-text').text(message);
    loader.addClass('active');
}

function hideProjectLoader() {
    const loader = $('#project-loader');
    loader.removeClass('active');
}

// ==============end of loader========================


// Listen for messages from parent (windows_postmessage.js will post them)
window.addEventListener("message", (event) => {
    // Only accept messages from parent
    if (event.origin !== "http://127.0.0.1:8000") return;

    // Save feature state
    localStorage.setItem("featureEnabled", event.data.message);

    if (event.data.message !== "false") {
        // Only create buttons once and safely after DOM is ready
        if (!document.getElementById("buttonContainer")) {
            setTimeout(() => createButtons(), 0);
        }
    } else {
        showCustomAlertBox('error', 'Feature is disabled');
    }
});


// ==============start of loader code========================

function showProjectLoader(message = "Uploading changes, please wait…") {
    // If loader already exists, just update message and show
    let loader = $('#project-loader');
    if (!loader.length) {
        // Create the loader dynamically
        loader = $(`
            <div id="project-loader">
                <div class="pl-circle"></div>
                <div class="pl-text">${message}</div>
            </div>
        `).appendTo('body');

        // Inject CSS dynamically if not present
        if (!$('#project-loader-styles').length) {
            const css = `
                #project-loader {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #0f172ae3;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    z-index: 99999;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.4s ease;
                }

                #project-loader.active {
                    opacity: 1;
                    pointer-events: all;
                }

                .pl-circle {
                    width: 80px;
                    height: 80px;
                    border: 6px solid #64748b;
                    border-top-color: #38bdf8;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 12px;
                }

                .pl-text {
                    color: #e2e8f0;
                    font-size: 18px;
                    letter-spacing: 1px;
                    font-family: sans-serif;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            $('<style>', { id: 'project-loader-styles', text: css }).appendTo('head');
        }
    }

    // Update message and show
    loader.find('.pl-text').text(message);
    loader.addClass('active');
}

function hideProjectLoader() {
    const loader = $('#project-loader');
    loader.removeClass('active');
}

// ==============end of loader========================




// ==============Custom alert========================
function injectCustomAlertCSS() {
    if (document.getElementById('custom-alert-style')) return;

    const style = document.createElement('style');
    style.id = 'custom-alert-style';
    style.innerHTML = `
        .custom-alert-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            z-index: 99997;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .custom-alert-backdrop.show {
            opacity: 1;
        }

        .custom-alert-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -60%) scale(0.95);
            opacity: 0;
            z-index: 99998;
            width: 100%;
            max-width: 420px;
            font-family: 'Quicksand', sans-serif;
            transition: transform 0.35s ease, opacity 0.35s ease;
            pointer-events: none;
        }

        .custom-alert-popup.show {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
            pointer-events: auto;
        }

        .custom-alert-content {
            background: #fff;
            border-radius: 14px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.35);
            text-align: center;
            padding: 30px 26px;
        }

        .custom-alert-message {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 22px;
        }

        .custom-alert-popup.success .custom-alert-message {
            color: #28a745;
        }

        .custom-alert-popup.error .custom-alert-message {
            color: #dc3545;
        }

        .custom-alert-ok-btn {
            background: linear-gradient(135deg, #e39a4e, #fb1b1b);
            color: #fff;
            border: none;
            padding: 10px 36px;
            border-radius: 230px;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: opacity 0.3s ease;
        }

        .custom-alert-ok-btn:hover {
            opacity: 0.9;
        }

        body.custom-alert-open {
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
}

function showCustomAlertBox(type = 'error', message = 'Something went wrong', onOk) {

    injectCustomAlertCSS();

    // normalize type
    type = (type === 'success') ? 'success' : 'error';

    // fallback message safety
    if (!message || message.trim() === '') {
        message = 'Something went wrong';
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'custom-alert-backdrop show';

    const popup = document.createElement('div');
    popup.className = `custom-alert-popup ${type} show`;

    popup.innerHTML = `
        <div class="custom-alert-content">
            <div class="custom-alert-message">${message}</div>
            <button class="custom-alert-ok-btn">OK</button>
        </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(popup);
    document.body.classList.add('custom-alert-open');

    function close() {
        backdrop.remove();
        popup.remove();
        document.body.classList.remove('custom-alert-open');
        if (typeof onOk === 'function') onOk();
    }

    popup.querySelector('.custom-alert-ok-btn').onclick = close;
    backdrop.onclick = close;
}

// =========================================================


/* =========================================================
   CONFIG
========================================================= */
const KNOWN_STABLE_ANCHORS = [
  "#page-content",".pageWrapper","#main","main","#content","#root"
];
const VOLATILE_RE = /(active|current|open|close|show|hide|hidden|visible|slick|swiper|lazy|clone|tmp|draggable|loading|loaded|mount|hydr|portal)/i;
const DEBUG = true;

/* =========================================================
   HELPERS
========================================================= */
function cleanText(t){
  if(!t) return "";
  return t
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function cssEscapeSafe(ident=""){
  if (window.CSS && CSS.escape) return CSS.escape(ident);
  return String(ident).replace(/([^\w-])/g,"\\$1");
}

function getStableId(el){
  return (el.id && !VOLATILE_RE.test(el.id)) ? el.id : "";
}

function getStableClasses(el){
  return Array.from(el.classList||[]).filter(c=>!VOLATILE_RE.test(c));
}

function jaccard(aArr,bArr){
  const A=new Set((aArr||[]).filter(Boolean));
  const B=new Set((bArr||[]).filter(Boolean));
  if(!A.size && !B.size) return 0;
  let inter=0; for(const v of A) if(B.has(v)) inter++;
  return inter/(A.size+B.size-inter);
}

function ancestorSignature(el, root){
  const sig=[]; let node=el.parentElement; let guard=0;
  while(node && node!==root && node.tagName && node.tagName!=="HTML" && guard++<8){
    sig.push({tag:node.tagName, classes:getStableClasses(node), id:getStableId(node)});
    node=node.parentElement;
  }
  return sig;
}

function nthPath(fromEl, root){
  if(!fromEl || !root) return "";
  const parts=[]; let node=fromEl; let guard=0;
  while(node && node!==root && node.nodeType===1 && guard++<15){
    const tag=node.tagName.toLowerCase();
    let idx=1, sib=node;
    while((sib=sib.previousElementSibling) && sib.tagName===node.tagName) idx++;
    parts.push(`${tag}:nth-of-type(${idx})`);
    node=node.parentElement;
  }
  return parts.reverse().join(" > ");
}

function findStableAnchorSelector(el){
  let node = el;
  while(node && node!==document.body){
    const id = getStableId(node);
    if (id) return `#${cssEscapeSafe(id)}`;
    node = node.parentElement;
  }
  for(const sel of KNOWN_STABLE_ANCHORS){
    const a = el.closest(sel);
    if(a) return sel;
  }
  return "body";
}

function getDynamicSourceFile(el){
  let node=el;
  while(node && node!==document.body){
    if(node.dataset && node.dataset.src){
      return node.dataset.src;
    }
    node=node.parentElement;
  }
  return window.location.pathname.split('/').pop() || "index.html";
}

/* =========================================================
   LOAD ORIGINAL HTML
========================================================= */
let originalHTML=null;
let modifiedHTML=null;
const includeCache = new Map();

fetch(window.location.href,{cache:"no-store"})
 .then(r=>r.text())
 .then(html=>{
   originalHTML=html;
   DEBUG&&console.log(" Original HTML loaded.");
 })
 .catch(err=>console.error(" Error loading original HTML:",err));

/* =========================================================
   EDIT MODE + CHANGE CAPTURE
========================================================= */
let changeLog=[];
let latestByKey=new Map();
const ELEMENT_ORIG = new WeakMap();
const ELEMENT_LATEST = new WeakMap();
const ELEMENT_UID = new WeakMap();
let ELEMENT_UID_COUNTER = 1;
const pendingTimers = new WeakMap();

function getElementUid(el){
  if(ELEMENT_UID.has(el)) return ELEMENT_UID.get(el);
  const uid='el_'+(ELEMENT_UID_COUNTER++);
  ELEMENT_UID.set(el, uid);
  return uid;
}

function resolveEditableElementFromTextNode(node){
  let el=node.parentElement;
  while(el && el!==document.body){
    if(el.isContentEditable) return el;
    el=el.parentElement;
  }
  return null;
}

function enableTextEditing(){

  document.getElementById('updateHTMLBtn').style.display = 'block';
  document.getElementById('enableEditingBtn').style.display = 'none';
  document.getElementById('saveChangesBtn').style.display = 'block';
  document.getElementById('cancelEditBtn').style.display = 'block';

  // Start text editing
  const sel='*:not(script):not(style):not(noscript):not(head):not(title):not(meta):not(link)';
  document.querySelectorAll(sel).forEach(el=>{
    const t = cleanText(el.innerHTML);
    if(!t) return;
    if(!ELEMENT_ORIG.has(el)) ELEMENT_ORIG.set(el,t);
    if(!ELEMENT_LATEST.has(el)) ELEMENT_LATEST.set(el,t);

    el.contentEditable="true";
    el.style.outline="1px dashed #0088ff";
    el.style.minHeight="1em";
    el.style.cursor="text";

    el.addEventListener("input",()=>scheduleChange(el));
  });

  if(!window.MO){
    window.MO=new MutationObserver(records=>{
      for(const r of records){
        if(r.type==="characterData"){
          const el=resolveEditableElementFromTextNode(r.target);
          if(el) scheduleChange(el);
        }
      }
    });
    window.MO.observe(document.body,{characterData:true,subtree:true});
  }
  // showCustomAlertBox('success', 'Editing enabled for all visible text elements.');
  console.log(" Editing enabled for all visible text elements.");

  // End text editing

  wrapper = $('#wrapper').addClass('editableSection');
  wrapper.find('*').not('.link-to-dropdown-container *').addClass('editable');
  wrapper.find('img').addClass('editable-image');
  wrapper.find('img').addClass('updateImg');

  // code to call on click event of the tags which has background image or background url
  wrapper.find('*').each(function() {
      const styleAttr = $(this).attr('style');
      if (styleAttr && /background[^;]*url\(/i.test(styleAttr)) {
          $(this).addClass('updateImg editable-image');
      }
  });




}

function scheduleChange(el){
  const prevTimer=pendingTimers.get(el);
  if(prevTimer) clearTimeout(prevTimer);
  const timer=setTimeout(()=>recordChange(el),300);
  pendingTimers.set(el,timer);
}

function recordChange(el){
  const newText=cleanText(el.innerHTML.replace(/<br\s*\/?>/gi,"\n"));
  const oldText=ELEMENT_LATEST.get(el) || ELEMENT_ORIG.get(el) || "";
  if(newText===oldText){ pendingTimers.delete(el); return; }

  const sourceFile=getDynamicSourceFile(el);
  const anchorSel=findStableAnchorSelector(el);
  const classSig=getStableClasses(el);
  const id=getStableId(el);
  const root=document.querySelector(anchorSel) || document.body;
  const ancSig=ancestorSignature(el,root);
  const nth=nthPath(el,root);
  const tag=el.tagName;
  const key=getElementUid(el);

  if(latestByKey.has(key)){
    const idx=latestByKey.get(key);
    changeLog[idx].newText=newText;
    changeLog[idx].ts=Date.now();
  } else {
    const entry={
      uid:key,sourceFile,anchorSel,tag,oldText,newText,classSig,id,ancSig,nth,ts:Date.now()
    };
    latestByKey.set(key,changeLog.push(entry)-1);
  }

  ELEMENT_LATEST.set(el,newText);
  pendingTimers.delete(el);

  DEBUG&&console.log(" Change recorded:", changeLog[changeLog.length-1]);
}

/* =========================================================
   APPLY TEXT UPDATE
========================================================= */
function applyTextUpdate(target,newText){
  target.innerHTML = newText.replace(/\n/g,"<br>");
}

/* =========================================================
   UPDATE ORIGINAL FILES
========================================================= */
async function updateOriginalHTMLWithTextChanges(){
  if(!changeLog.length){
    showCustomAlertBox('error', 'No text changes detected.');
    console.log("No text changes detected.");
    return; }

  const filesToUpdate = new Map();
  for(const ch of changeLog){
    if(!filesToUpdate.has(ch.sourceFile)) filesToUpdate.set(ch.sourceFile, []);
    filesToUpdate.get(ch.sourceFile).push(ch);
  }

  for(const [file,changes] of filesToUpdate.entries()){
    DEBUG && console.log("Processing file:", file);
    let htmlText = includeCache.has(file)
      ? includeCache.get(file)
      : await fetch(file).then(r=>r.text()).catch(()=>originalHTML);

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const root = doc.body || doc;

    let updated=0;
    for(const ch of changes){
      let target=null;

      if(ch.id) target=root.querySelector(`#${cssEscapeSafe(ch.id)}`);
      if(!target && ch.classSig && ch.classSig.length){
        const clsSel = ch.classSig.map(c=>'.'+cssEscapeSafe(c)).join('');
        const cands = root.querySelectorAll(`${ch.tag}${clsSel}`);
        target = Array.from(cands).find(e=>cleanText(e.innerHTML)===ch.oldText);
      }
      if(!target && ch.nth){
        const sel=`${ch.anchorSel} ${ch.nth}`;
        target=root.querySelector(sel);
      }
      if(!target){
        const cands=Array.from(root.getElementsByTagName(ch.tag));
        target=cands.find(e=>cleanText(e.innerHTML)===ch.oldText);
      }

      if(target){
        applyTextUpdate(target,ch.newText);
        updated++;
      }
    }

    const newHTML="<!DOCTYPE html>\n"+doc.documentElement.outerHTML;
    includeCache.set(file,newHTML);
    DEBUG && console.log(` Updated ${updated} items in ${file}`);
  }

  modifiedHTML=includeCache;
  showCustomAlertBox('error', 'All changes applied locally..');
  console.log(" All changes applied locally.");
}

/* =========================================================
   DOWNLOAD FILES
========================================================= */
function downloadFile(filename,text){
  const blob=new Blob([text],{type:"text/html"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadAllUpdatedFiles(){
  if(!modifiedHTML || !(modifiedHTML instanceof Map)){
    showCustomAlertBox('error', 'No updated files to download.');
    console.log("No updated files to download.");
    return;
  }
  modifiedHTML.forEach((html,file)=>{
    downloadFile(file,html);
  });
  showCustomAlertBox('error', 'All updated files downloaded successfully.');
  console.log(" All updated files downloaded successfully.");
}

/* =========================================================
   PUSH TO GITHUB
========================================================= */
async function waitForWorkflowCompletion(owner, repo, token, commitSha){

  const headers = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json"
  };

  let runId = null;

  // wait until workflow run is created
  while(!runId){

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs?head_sha=${commitSha}`,
      {headers}
    );

    const data = await res.json();

    if(data.workflow_runs && data.workflow_runs.length > 0){
      runId = data.workflow_runs[0].id;
      console.log("Workflow started:", runId);
      break;
    }

    console.log("Waiting for workflow to appear...");
    await new Promise(r=>setTimeout(r,5000));
  }

  // now monitor workflow
  while(true){

    const runRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}`,
      {headers}
    );

    const runData = await runRes.json();

    console.log("Workflow status:", runData.status);

    if(runData.status === "completed"){

      if(runData.conclusion === "success"){
        return true;
      }

      throw new Error("GitHub Action failed");
    }

    await new Promise(r=>setTimeout(r,5000));
  }

}

async function saveAndPushChanges(){

  if(!modifiedHTML || !(modifiedHTML instanceof Map)){
    showCustomAlertBox('error','No modified files detected.');
    return;
  }

  const OWNER = localStorage.getItem('owner');
  const REPO = localStorage.getItem('repo_name');
  const BRANCH = "main";
  const token = localStorage.getItem('feature_key');

  const headers = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json"
  };

  showProjectLoader("Uploading changes, please wait…");

  try{

    // ---------------------------
    // 1️⃣ Get latest branch ref
    // ---------------------------

    const refRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`,
      { headers }
    );

    const refData = await refRes.json();
    const latestCommitSha = refData.object.sha;

    // ---------------------------
    // 2️⃣ Get commit details
    // ---------------------------

    const commitRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/commits/${latestCommitSha}`,
      { headers }
    );

    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    const treeItems = [];

    // ---------------------------
    // 3️⃣ Add HTML files
    // ---------------------------

    for(const [filePath, html] of modifiedHTML.entries()){

      const cleanPath = filePath.replace(/^\/+/,"");

      treeItems.push({
        path: cleanPath,
        mode: "100644",
        type: "blob",
        content: html
      });

    }

    // ---------------------------
    // 4️⃣ Upload images as blobs
    // ---------------------------

    if(window.imageChangeLog && imageChangeLog.size > 0){

      for(const [repoImagePath,data] of imageChangeLog.entries()){

        const cleanPath = repoImagePath.replace(/^\/+/,"");

        const base64 = await new Promise((resolve,reject)=>{
          const reader = new FileReader();
          reader.readAsDataURL(data.file);
          reader.onload = ()=>resolve(reader.result.split(",")[1]);
          reader.onerror = reject;
        });

        // Create blob
        const blobRes = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/git/blobs`,
          {
            method:"POST",
            headers,
            body:JSON.stringify({
              content: base64,
              encoding: "base64"
            })
          }
        );

        const blobData = await blobRes.json();

        if(!blobData.sha){
          console.error("Blob creation failed", blobData);
          throw new Error("Image blob creation failed");
        }

        treeItems.push({
          path: cleanPath,
          mode: "100644",
          type: "blob",
          sha: blobData.sha
        });

      }

      
    }

    if(treeItems.length === 0){
      throw new Error("No files changed.");
    }

    // ---------------------------
    // 5️⃣ Create tree
    // ---------------------------

    const treeRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/trees`,
      {
        method:"POST",
        headers,
        body:JSON.stringify({
          base_tree: baseTreeSha,
          tree: treeItems
        })
      }
    );

    const treeData = await treeRes.json();

    if(!treeRes.ok){
      console.error("Tree API error:", treeData);
      throw new Error("Tree creation failed");
    }

    // ---------------------------
    // 6️⃣ Create commit
    // ---------------------------

    const commitRes2 = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/commits`,
      {
        method:"POST",
        headers,
        body:JSON.stringify({
          message:"Website update via browser editor",
          tree: treeData.sha,
          parents:[latestCommitSha]
        })
      }
    );

    const newCommit = await commitRes2.json();

    if(!commitRes2.ok){
      console.error("Commit API error:", newCommit);
      throw new Error("Commit creation failed");
    }

    // ---------------------------
    // 7️⃣ Update branch ref
    // ---------------------------

    const refUpdate = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
      {
        method:"PATCH",
        headers,
        body:JSON.stringify({
          sha:newCommit.sha
        })
      }
    );

    const refUpdateData = await refUpdate.json();

    if(!refUpdate.ok){
      console.error("Ref update error:", refUpdateData);
      throw new Error("Branch update failed");
    }

    // wait for GitHub Action deployment
   await waitForWorkflowCompletion(OWNER, REPO, token, newCommit.sha);
    
   showCustomAlertBox('success','Deployment completed successfully.');
   imageChangeLog.clear();

  }
  catch(err){

    console.error("Git push error:",err);
    showCustomAlertBox('error','Deployment failed.');

  }
  finally{

    hideProjectLoader();

  }

}

// async function saveAndPushChanges(){

//   if(!modifiedHTML || !(modifiedHTML instanceof Map)){
//     showCustomAlertBox('error', 'No modified files detected.');
//     return;
//   }

//   const OWNER = localStorage.getItem('owner');
//   const REPO = localStorage.getItem('repo_name');
//   const BRANCH = "main";
//   const token = localStorage.getItem('feature_key');

//   const headers = {
//     "Authorization": `token ${token}`,
//     "Accept": "application/vnd.github.v3+json",
//     "Content-Type": "application/json"
//   };

//   //  SHOW LOADER ONCE
//   showProjectLoader("Uploading changes, please wait…");

//   try {

//     // ================= PUSH HTML FILES =================
//     for(const [filePath, html] of modifiedHTML.entries()){
//       try{

//         const getUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`;
//         const fileData = await fetch(getUrl,{headers}).then(r=>r.json());
//         if(!fileData.sha) throw new Error("SHA not found for "+filePath);

//         const payload = {
//           message:`Update ${filePath} via browser editor`,
//           content:btoa(unescape(encodeURIComponent(html))),
//           branch:BRANCH,
//           sha:fileData.sha
//         };

//         const response = await fetch(getUrl,{
//           method:"PUT",
//           headers,
//           body:JSON.stringify(payload)
//         });

//         if(response.ok){
//           console.log(`${filePath} pushed.`);
//         } else {
//           console.error(`Failed to push ${filePath}`);
//         }

//       }catch(err){
//         console.error("HTML push error:",err);
//       }
//     }

//     // ================= PUSH STAGED IMAGES =================
//     if (window.imageChangeLog && imageChangeLog.size > 0) {

//       for (const [repoImagePath, data] of imageChangeLog.entries()) {

//         try {

//           const base64 = await new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.readAsDataURL(data.file);
//             reader.onload = () => resolve(reader.result);
//             reader.onerror = reject;
//           });

//           const getUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${repoImagePath}`;
//           const fileData = await fetch(getUrl, { headers }).then(r => r.json());

//           const payload = {
//             message: `Update ${repoImagePath} via browser editor`,
//             content: base64.split(",")[1],
//             branch: BRANCH,
//             sha: fileData.sha
//           };

//           await fetch(getUrl, {
//             method: "PUT",
//             headers,
//             body: JSON.stringify(payload)
//           });

//           console.log("Image pushed:", repoImagePath);

//         } catch (err) {
//           console.error("Image push failed:", repoImagePath, err);
//         }
//       }

//       imageChangeLog.clear();
//     }

//     // document.getElementById('rollback').style.display = 'block';

//     showCustomAlertBox('success', 'All changes deployed successfully.');

//   }
//   catch (globalError) {

//     console.error("Global push error:", globalError);
//     showCustomAlertBox('error', 'Something went wrong while deploying.');

//   }
//   finally {
//     // ALWAYS HIDE LOADER (even if error happens)
//     hideProjectLoader();

//   }
// }


function disableEditMode(){

    document.querySelectorAll('[contenteditable="true"]').forEach(el=>{
        el.contentEditable="false";
        el.style.outline="none";
        el.style.cursor="default";
    });

    $('.editable').removeClass('editable');
    $('.editable-image').removeClass('editable-image');
    $('.updateImg').removeClass('updateImg');
    $('#wrapper').removeClass('editableSection');

    document.getElementById('updateHTMLBtn').style.display = 'none';
    document.getElementById('saveChangesBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';
    // document.getElementById('rollback').style.display = 'none';
    document.getElementById('enableEditingBtn').style.display = 'block';

    // showCustomAlertBox('success', 'Edit mode disabled.');
}
/* =========================================================
   UI BUTTONS
========================================================= */
window.enableTextEditing=enableTextEditing;
window.saveAndPushChanges=saveAndPushChanges;
window.updateOriginalHTMLWithTextChanges=updateOriginalHTMLWithTextChanges;
window.downloadAllUpdatedFiles=downloadAllUpdatedFiles;

// document.addEventListener('DOMContentLoaded', function () {
//   if (localStorage.getItem("featureEnabled")==="load buttons") createButtons();
// });

function createButtons(){
  const buttonContainer=document.createElement('div');
  buttonContainer.id='buttonContainer';
  Object.assign(buttonContainer.style,{
    display:'flex',justifyContent:'center',alignItems:'center',
    flexWrap:'wrap',gap:'15px',marginTop:'20px',marginBottom:'30px'
  });

  const enableEditingBtn=createButton('Enable Edit Mode','enableEditingBtn',enableTextEditing);
  const updateHTMLBtn=createButton('Save Changes','updateHTMLBtn',updateOriginalHTMLWithTextChanges);
  // const downloadBtn=createButton('Download Updated Files','downloadBtn',downloadAllUpdatedFiles);
  const saveChangesBtn=createButton('Publish Changes','saveChangesBtn',saveAndPushChanges);
  const rollback=createButton('rollback changes','rollback');
    const cancelBtn = createButton('Cancel Edit Mode','cancelEditBtn',disableEditMode);

  [enableEditingBtn,updateHTMLBtn,rollback,saveChangesBtn,cancelBtn].forEach(b=>buttonContainer.appendChild(b));
  document.body.prepend(buttonContainer);
}

function createButton(text,id,handler){
  const btn=document.createElement('button');
  btn.textContent=text;
  btn.id=id;
  btn.addEventListener('click',handler);
  btn.classList.add('button-29')

  if (text != "Enable Edit Mode") {
    btn.style ='display:none'
  };

  // btn.addEventListener('click', () => toggleEditableClasses(true));

  Object.assign(btn.style,{
    padding:'12px 24px',fontSize:'16px',cursor:'pointer',
    border:'1px solid #ccc',borderRadius:'15px',
    // backgroundColor:'#4CAF50',color:'white',
    // transition:'background-color 0.3s ease'
  });
  btn.addEventListener('mouseover',()=>btn.style.backgroundColor='#45a049');
  btn.addEventListener('mouseout',()=>btn.style.backgroundColor='#4CAF50');
  return btn;
}
