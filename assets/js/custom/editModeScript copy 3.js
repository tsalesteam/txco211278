

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
            background: linear-gradient(90deg, #F28F32 0%, #a73729 100%);
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

function showCustomAlertBox(type = 'error', message = 'Something went wrong', onOk, showYesNo = false) {

    injectCustomAlertCSS();

    type = (type === 'success') ? 'success' : 'error';

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

        ${showYesNo
            ? `
                <div style="display:flex;gap:10px;justify-content:center">
                    <button class="custom-alert-ok-btn yes-btn">Yes</button>
                    <button class="custom-alert-ok-btn no-btn">No</button>
                </div>
            `
            : `
                <button class="custom-alert-ok-btn">OK</button>
            `
        }
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

    if (showYesNo) {

        popup.querySelector('.yes-btn').onclick = close;

        popup.querySelector('.no-btn').onclick = function () {
            backdrop.remove();
            popup.remove();
            document.body.classList.remove('custom-alert-open');
        };

    } else {

        popup.querySelector('.custom-alert-ok-btn').onclick = close;
        backdrop.onclick = close;

    }
}

// =========================================================


var changedFiles = new Set();
const mediaFilesDetail = [];
let pendingMediaUpdates = {};
let isDragMode = false;
let selectedSections = new Set();
let selectedSectionHtmlMap = {};

let selectedSectionImages = [];
let removedSectionImages = [];

function getSectionImages(section) {
    const images = [];

    $(section).find('img').each(function () {
        const src = $(this).attr('src') || $(this).attr('data-original-src');

        if (src && /\.(jpg|jpeg|png|svg|JPG)$/i.test(src.split('?')[0])) {
            // images.push(src);
            images.push(src.split('/').pop().split('?')[0]);
        }
    });

    $(section).find('*').each(function () {
        const style = $(this).attr('style') || '';
        const backgroundImage = $(this).css('background-image') || '';

        [style, backgroundImage].forEach(function (value) {
            const matches =
                value.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi) || [];

            matches.forEach(function (match) {
                const url = match
                    .replace(/^.*?url\(\s*['"]?/i, '')
                    .replace(/['"]?\s*\)$/i, '');

                if (url && /\.(jpg|jpeg|png|svg|JPG)$/i.test(url.split('?')[0])) {
                    // images.push(url);
                    images.push(url.split('/').pop().split('?')[0]);
                }
            });
        });
    });

    return [...new Set(images)];
}


function syncChangedFilesToSession() {
    sessionStorage.setItem(
        "changedFiles",
        JSON.stringify(Array.from(changedFiles))
    );

    sessionStorage.setItem(
        "mediaFilesDetail",
        JSON.stringify(mediaFilesDetail)
    );

}

function loadChangedFilesFromSession() {
    const stored = sessionStorage.getItem("changedFiles");
    if (stored) {
        try {
            changedFiles = new Set(JSON.parse(stored));
        } catch (e) {
            console.warn("Failed to restore changedFiles", e);
            changedFiles = new Set();
        }
    }

    // Restore mediaFilesDetail
    const storedMediaFiles = sessionStorage.getItem("mediaFilesDetail");
    if (storedMediaFiles) {
        try {
            const parsedMediaFiles = JSON.parse(storedMediaFiles);

            mediaFilesDetail.length = 0;
            mediaFilesDetail.push(...parsedMediaFiles);

        } catch (e) {
            console.warn("Failed to restore mediaFilesDetail", e);

            mediaFilesDetail.length = 0;
        }
    }
}

function clearChangedFilesSession() {
    changedFiles.clear();
    sessionStorage.removeItem("changedFiles");
}


$(document).ready(function () {

    // Dropdown functionality
    $(document).off("click.categoryDropdown");
    $(document).off("click.sectionDropdown");
    $(document).off("click.categoryMenu");
    $(document).off("click.sectionMenu");
    $(document).off("click.dropdownOutside");

    // Category dropdown
    $(document).on("click.categoryDropdown", "#categoryDropdownButton", function (e) {

        e.preventDefault();
        e.stopPropagation();

        $("#categoryDropdownMenu").toggle();

        $("#section-filter .dropdown-menu").hide();
    });

    // Category submenu
    $(document).on("click.categoryMenu", ".tg-main-category", function (e) {

        e.preventDefault();
        e.stopPropagation();

        const subMenu = $(this).next(".tg-sub-list");

        $(".tg-sub-list").not(subMenu).slideUp(200);

        subMenu.slideToggle(200);
    });

    // Select category
    $(document).on("click.categoryMenu", ".middleSectionFilter[data-type='main_category']", function (e) {

        e.preventDefault();
        e.stopPropagation();

        $("#categoryDropdownButton").html(`
        <span class="selected-category">
            <i class="ri-grid-fill" style="margin-right:10px;"></i>
            ${$(this).text().trim()}
        </span>
        <span class="caret"></span>
    `);

        $("#categoryDropdownMenu").hide();
    });

    // Section dropdown
    $(document).on("click.sectionDropdown", "#section-filter .dropdown-toggle", function (e) {

        e.preventDefault();
        e.stopPropagation();

        $("#section-filter .dropdown-menu").toggle();

        $("#categoryDropdownMenu").hide();
    });

    // Select section
    $(document).on("click.sectionMenu", "#section-filter .dropdown-menu a", function (e) {

        e.preventDefault();
        e.stopPropagation();

        $("#section-filter .dropdown-toggle").html(`
        ${$(this).text().trim()}
        <span class="caret"></span>
    `);

        $("#section-filter .dropdown-menu").hide();
    });

    // Outside click
    $(document).on("click.dropdownOutside", function (e) {

        if (!$(e.target).closest("#category-filter").length) {
            $("#categoryDropdownMenu").hide();
            $(".tg-sub-list").hide();
        }

        if (!$(e.target).closest("#section-filter").length) {
            $("#section-filter .dropdown-menu").hide();
        }
    });












    console.log("categories loaded", window.categories);


    loadChangedFilesFromSession();
    var uploadChanges = $('<button onclick="uploadeditedproject()" class="publish_chnages_btn" id="publish_chnages_btn" style="display:none">Publish Changes</button>').appendTo(topBar);

    if (changedFiles.size > 0) {
        uploadChanges.show();
    }
    console.log("Restored changed files:", Array.from(changedFiles));


    // alert("EditModeScript loaded");
    // Initialization
    var wrapper = $('#wrapper').addClass('editableSection');
    var topBar = $('<div>', { id: 'top-bar', class: 'top-bar' }).insertBefore(wrapper);
    // var imageUpload = $('<input type="file" id="image-upload" class="hidden" accept="image/*" />').appendTo('body');
    $('<form method="post" id="imgForm" class="hidden" enctype="multipart/form-data">').appendTo('body');
    $('<input type="file" name="imgFile" id="image-upload" class="hidden">').appendTo('#imgForm');
    $('<input type="text" class="hidden formFieldFileName" name="imgFileName" value="">').appendTo('#imgForm');
    $('<input type="text" class="hidden selectedPageName" name="selectedPageName" value="">').appendTo('body');


    $('<input type="text" class="hidden selectedPageName" name="selectedPageName" value="">').appendTo('body');


    const token = localStorage.getItem('feature_key');
    const repoOwner = localStorage.getItem('owner');
    const repoName = localStorage.getItem('repo_name');
    const branch = "main";

    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
    }

    async function getLatestSha(filePath) {
        try {
            const res = await fetch(
                `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`,
                {
                    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github+json" }
                }
            );
            if (res.ok) return (await res.json()).sha;
        } catch {
            console.warn("Could not fetch latest SHA for", filePath);
        }
        return null;
    }

    function extractRepoPath(imgSrc) {
        // Ensure we always end up with: "assets/images/filename.ext"
        return imgSrc
            .replace(/^https?:\/\/[^/]+\//, '')   // remove domain (e.g., https://domain.com/)
            .replace(/^testing\//, '')            // remove any "testing/" prefix if present
            .replace(/^\/+/, '')                  // remove leading slashes
            .replace(/^.*?(assets\/)/, 'assets/'); // trim everything before "assets/"
    }
    var isEditingContent = false;
    var isEditingImages = false;



    function getCurrentPageName() {
        const srcReq = new URLSearchParams(window.location.search).get('srcReq');
        return srcReq || $(".selectedPageName").val() || "index.html";
    }

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    function urlToFile(url, filename, callback) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(function (blob) {
                const file = new File([blob], filename, { type: blob.type });
                callback(file);
            }, 'image/jpeg');
        };
        img.onerror = function () {
            showCustomAlertBox('error', 'Cannot load image from URL. Make sure it allows cross-origin access.');
            console.log('Cannot load image from URL. Make sure it allows cross-origin access.');
        };
        img.src = url;
    }


    /* ---------------- IMAGE PICKER ---------------- */
    const PEXELS_KEY = "7QPIcP3MfPcDte34Q1Vsu1lPrl0iwWFZ5GOl1NUgcLN40W6zhih4Yv5i";
    let selectedImageSrc = null;
    let selectedFile = null;

    function openImagePicker(targetEl) {
        if (!$('#imagePickerModal').length) {
            $('<div id="imagePickerModal" class="modal image-picker-modal fade"></div>').appendTo('body');
        }

        const isVideo = $(targetEl).is('video');

        let modalContent = '';

        if (isVideo) {

            modalContent = `
    <div class="modal-dialog">
      <div class="modal-content">

        <div class="modal-header">
          <button class="close" data-dismiss="modal">&times;</button>
          <h4>Upload Video</h4>
        </div>

        <div class="modal-body">

          <div class="tab-content-area">
            <div class="upload-box video-upload-box">
                Click to upload video
            </div>
          </div>

          <div class="preview-box hidden"></div>

        </div>

        <div class="modal-footer">
          <button class="btn btn-default" data-dismiss="modal">Cancel</button>
          <button class="btn website-info-btn-primary" id="confirmImage">Submit</button>
        </div>

      </div>
    </div>
    `;

        } else {

            modalContent = `
    <div class="modal-dialog">
      <div class="modal-content">

        <div class="modal-header">
          <button class="close" data-dismiss="modal">&times;</button>
          <h4>Select Image</h4>
        </div>

        <div class="modal-body">

          <div class="image-picker-tabs">
            <button class="tab-btn active" data-tab="assets">Assets</button>
            <button class="tab-btn" data-tab="pexels">Pexels</button>
            <button class="tab-btn" data-tab="pixabay">Pixabay</button>
            <button class="tab-btn" data-tab="upload">Upload</button>
            <button class="tab-btn" data-tab="url">URL</button>
          </div>

          <div class="tab-content-area"></div>

          <div class="preview-box hidden">
            <img id="previewImage">
          </div>

        </div>

        <div class="modal-footer">
          <button class="btn btn-default" data-dismiss="modal">Cancel</button>
          <button class="btn website-info-btn-primary" id="confirmImage">Submit</button>
        </div>

      </div>
    </div>
    `;
        }

        $('#imagePickerModal')
            .data('imageElement', targetEl)
            .html(modalContent)
            .modal('show');

        if (isVideo) {

            $('.video-upload-box').click(function () {



                const currentVideoSrc = $(targetEl).find('source').attr('src');

                if (currentVideoSrc) {

                    let cleanSrc = currentVideoSrc.split('?')[0];

                    const relativePath = cleanSrc
                        .replace(window.location.origin + '/', '')
                        .replace(/^media\/projects\/[^/]+\/[^/]+\//, '')
                        .replace(/^\/+/, '');

                    $(targetEl).attr('data-original-src', relativePath);
                }

                $('#image-upload')
                    .attr('accept', 'video/*')
                    .off('change')
                    .on('change.videoUpload', function () {

                        const file = this.files[0];

                        if (!file) return;
                        const maxSize = 10 * 1024 * 1024;

                        if (file.size > maxSize) {


                            alert("Video must be less than 10 MB");
                            console.log("VIDEO REJECTED > 10MB");

                            $(this).val('');

                            selectedFile = null;

                            return;
                        }

                        selectedFile = file;
                        selectedImageSrc = null;



                        const reader = new FileReader();

                        reader.onload = function (e) {

                            $('.preview-box')
                                .html(`
                <video controls style="width:100%">
                    <source src="${e.target.result}" type="${file.type}">
                </video>
            `)
                                .removeClass('hidden');

                        };

                        reader.readAsDataURL(file);
                    })
                    .click();
            });

        } else {

            loadAssets();

            $('.tab-btn').click(function () {

                $('.tab-btn').removeClass('active');
                $(this).addClass('active');
                $('.preview-box').addClass('hidden');
                selectedImageSrc = null;
                selectedFile = null;

                const tab = $(this).data('tab');

                if (tab === 'assets') loadAssets();
                if (tab === 'pexels') loadPexels();
                if (tab === 'pixabay') loadPixabay();
                if (tab === 'upload') loadUpload();
                if (tab === 'url') loadURL();
            });
        }

        $('#confirmImage').off().on('click', function () {

            const el = $('#imagePickerModal').data('imageElement');
            // const originalPath = $(el).attr('data-original-src');
            // alert(originalPath)

            // if (!originalPath) {
            //     showCustomAlertBox('error', 'data-original-src missing on media');
            //     console.log("data-original-src missing on image");
            //     return;
            // }
            var originalPath = $(el).attr('src');

            if ($(el).is('video')) {
                originalPath = $(el).find('source').attr('src');
            } else {
                const bgImage = $(el).css('background-image');
                if (bgImage && bgImage.includes('url(')) {
                    originalPath = bgImage
                        .replace(/^url\(["']?/, '')
                        .replace(/["']?\)$/, '');
                }
            }

            //alert("originalPath----"+originalPath)

            if (!originalPath) {
                showCustomAlertBox('error', 'Image src is missing on media');
                console.log("data-original-src missing on image");
                return;
            }

            const last_part = originalPath.split('/').pop();
            const filename = last_part.includes("?") ? last_part.split("?")[0] : last_part;


            if (selectedFile) {

                // for image upload
                // for video upload
                createPendingMediaDataList(new File([selectedFile], filename, { type: selectedFile.type }), el, originalPath);

            } else if (selectedImageSrc) {

                // for image URL / assets / pexels
                fetch(selectedImageSrc)
                    .then(res => res.blob())
                    .then(blob => {
                        createPendingMediaDataList(new File([blob], filename, { type: blob.type }), el, originalPath);
                    });
            }
            $('#imagePickerModal').modal('hide');
        });


    }

    /* ---------------- ASSETS ---------------- */
    function loadAssets() {
        $('.tab-content-area').html(`
      <div class="image-grid">
        <img src="assets/images/library/sample-1.jpg">
        <img src="assets/images/library/sample-2.jpg">
        <img src="assets/images/library/sample-3.jpg">
      </div>
    `);

        $('.image-grid img').click(function () {
            $('.image-grid img').removeClass('selected');
            $(this).addClass('selected');

            selectedImageSrc = this.src;
            selectedFile = null;

            // const relativePath = $(this).attr('src');
            const relativePath = this.src.split('/client-assets/')[1];

            const targetEl = $('#imagePickerModal').data('imageElement');
            $(targetEl).attr('data-original-src', relativePath);

            $('#previewImage').attr('src', this.src);
            $('.preview-box').removeClass('hidden');
        });
    }

    // /* ---------------- PEXELS ---------------- */
    // const BASE_URL = 'https://turnr.co.in';

    // function getPexelsKey() {
    //   return new Promise((resolve, reject) => {
    //     $.ajax({
    //       url: `${BASE_URL}/get_pexels/`,
    //       type: 'POST',
    //       dataType: 'json',
    //       success: function (response) {
    //         if (response.status === 200) {
    //           resolve(response.key);
    //         } else {
    //           reject('Error: ' + response.message);
    //         }
    //       },
    //       error: function () {
    //         reject('Error fetching API key');
    //       }
    //     });
    //   });
    // }


    // function loadPexels() {
    //   getPexelsKey().then(PEXELS_KEY => {
    //     $('.tab-content-area').html(`
    //       <input class="form-control" id="pexelsSearch" placeholder="Search images">
    //       <br>
    //       <div class="image-grid" id="pexelsResults"></div>
    //     `);

    //     $('#pexelsSearch').keyup(function () {
    //       const q = this.value;
    //       if (q.length < 3) return;

    //       $.ajax({
    //         url: `https://api.pexels.com/v1/search?query=${q}&per_page=9`,
    //         headers: { Authorization: PEXELS_KEY },
    //         success: function (res) {
    //           let html = '';
    //           res.photos.forEach(p => html += `<img src="${p.src.medium}">`);
    //           $('#pexelsResults').html(html);

    //           $('#pexelsResults img').click(function () {
    //             $('#pexelsResults img').removeClass('selected');
    //             $(this).addClass('selected');

    //             selectedImageSrc = this.src;
    //             selectedFile = null;

    //             $('#previewImage').attr('src', this.src);
    //             $('.preview-box').removeClass('hidden');
    //           });
    //         }
    //       });
    //     });
    //   }).catch((error) => {
    //     console.error('Error fetching Pexels API key:', error);
    //   });
    // }
    /* ---------------- pexel ---------------- */

    function loadPexels() {
        $('.tab-content-area').html(`
      <input class="form-control" id="pexelsSearch" placeholder="Search images">
      <br>
      <div class="image-grid" id="pexelsResults"></div>
    `);

        $('#pexelsSearch').keyup(function () {
            const q = this.value;
            if (q.length < 3) return;

            $.ajax({
                url: `https://api.pexels.com/v1/search?query=${q}&per_page=9`,
                headers: { Authorization: PEXELS_KEY },
                success: function (res) {
                    let html = '';
                    res.photos.forEach(p => html += `<img src="${p.src.medium}">`);
                    $('#pexelsResults').html(html);

                    $('#pexelsResults img').click(function () {
                        $('#pexelsResults img').removeClass('selected');
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

    /* ---------------- pixabay ---------------- */

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
    /* ---------------- UPLOAD ---------------- */
    function loadUpload() {
        $('.tab-content-area').html(`
      <div class="upload-box">Click to upload</div>
    `);
        $('#image-upload').attr('accept', 'image/*');
        $('.upload-box').click(() => $('#image-upload').click());

        $('#image-upload').off('change').on('change.mediaUpload', function () {
            const file = this.files[0];
            if (!file) return;

            selectedFile = file;
            selectedImageSrc = null;

            $('.formFieldFileName').val(file.name);

            const reader = new FileReader();
            reader.onload = e => {
                if (file.type.startsWith('video/')) {

                    $('.preview-box').html(`
                        <video controls style="width:100%">
                            <source src="${e.target.result}">
                        </video>
                    `);

                } else {

                    $('.preview-box').html(`
                        <img id="previewImage" src="${e.target.result}">
                    `);
                }

                $('.preview-box').removeClass('hidden');
            };
            reader.readAsDataURL(file);
        });
    }

    /* ---------------- URL ---------------- */
    function loadURL() {
        $('.tab-content-area').html(`
      <div style="display:flex; gap:10px">
        <input class="form-control" id="imgUrl" placeholder="Paste image URL">
        <button class="btn website-info-btn-primary" id="previewUrl">Preview</button>
      </div>
    `);

        $('#previewUrl').click(function () {
            const url = $('#imgUrl').val();
            if (!url) return;

            selectedImageSrc = url;
            selectedFile = null;

            $('#previewImage').attr('src', url);
            $('.preview-box').removeClass('hidden');
        });
    }

    /* ---------------- OPEN PICKER ---------------- */
    $(document).on('click', '.updateImg', function (e) {

        if ($(e.target).closest('.add-section-above, .add-section-below').length) {
            return;
        }

        if ($(this).closest('#dynamicModal').length) return;

        if (!isEditingContent) return;

        e.preventDefault();
        openImagePicker(this);

    });

    $(document).on('click', '.generated-logo', function (e) {

        if (!isEditingContent) return;

        e.preventDefault();
        e.stopPropagation();

        const container = $(this).parent();
        const logoImg = container.find('.site-logo-img').first();

        if (!logoImg.length) return;

        openImagePicker(logoImg[0]);
    });
    $(document).on('click', '.site-logo-img.updateImg', function (e) {

        if ($(this).closest('#dynamicModal').length) return;

        if (!isEditingContent) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        openImagePicker(this);

    });
    /* ---------------- CLEANUP ---------------- */
    $(document).on('hidden.bs.modal', '#imagePickerModal', function () {
        $(this).remove();
        selectedImageSrc = null;
        selectedFile = null;
    });


    // $(document).on('click', '.updateImg', function () {
    //   let imgName = "default";
    //   if ($(this).attr("src")) {
    //     imgName = $(this).attr("src");
    //   } else {
    //     const bgImg = $(this).css('background-image');
    //     if (bgImg && bgImg.includes('url(')) {
    //       imgName = bgImg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    //     }
    //   }

    //   if (imgName.includes("?")) imgName = imgName.split("?")[0];

    //   $(".formFieldFileName").val(imgName);
    //   $("#image-upload").data('imageElement', this);
    //   $("#image-upload").click();
    // });
    // $("#image-upload").on('change', function () {
    //     uploadImgData();

    // });


    // async function uploadImgData() {
    //     const fileInput = $("#image-upload")[0];
    //     const file = fileInput.files[0];
    //     if (!file) return alert("No file selected!");

    //     const imgName = $(".formFieldFileName").val();
    //     alert('imgName: '+ imgName)
    //     const element = $("#image-upload").data("imageElement");

    //     // Convert to base64
    //     const base64 = await toBase64(file);
    //     const repoImagePath = extractRepoPath(imgName);
    //     alert('repoImagePath: '+ repoImagePath)

    //     if (!repoImagePath) {
    //         alert(" Unable to determine GitHub path for image!");
    //         return;
    //     }

    //     // Get latest SHA from GitHub
    //     const sha = await getLatestSha(repoImagePath);
    //     const commitMessage = `Update ${repoImagePath} via web editor`;

    //     // Upload to GitHub
    //     const response = await fetch(
    //         `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${repoImagePath}`,
    //         {
    //         method: "PUT",
    //         headers: {
    //             Authorization: `token ${token}`,
    //             Accept: "application/vnd.github+json",
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //             message: commitMessage,
    //             content: base64.split(",")[1],
    //             sha: sha,
    //             branch: branch,
    //         }),
    //         }
    //     );

    //     const result = await response.json();

    //     if (result.content && result.commit) {
    //         console.log(" GitHub image updated:", repoImagePath);

    //         // Fetch the latest file (optional: add ?t=timestamp to bust cache)
    //         const newSrc = `${imgName}?${Date.now()}`;
    //         if (element.tagName === "IMG") {
    //         $(element).attr("src", newSrc);
    //         } else {
    //         $(element).css("background-image", `url(${newSrc})`);
    //         }

    //         alert(" Image updated on GitHub!");
    //     } else {
    //         alert(" Upload failed: " + (result.message || "Unknown error"));
    //     }

    //     // Reset file input
    //     fileInput.value = "";
    //     }





    // Create top bar buttons
    var enableEditMode = $('<button id="enable-editmode">Enable Edit Mode</button>').appendTo(topBar);
    var revertLastMadeChanges = $('<button onclick="revertLastMadeChanges()" class="revert_chnages_btn" style="display:none">Revert Last Change</button>').appendTo(topBar);
    if (getCookie("has_last_change_made") === "true") {
        revertLastMadeChanges.show();
    }

    var uploadChanges = $('<button onclick="uploadeditedproject()" class="publish_chnages_btn" id="publish_chnages_btn" style="display:none">Publish Changes</button>').appendTo(topBar);

    // restore button state after reload
    if (changedFiles && changedFiles.size > 0) {
        uploadChanges.show();
    }

    if (getCookie("has_last_change_made") === "true") {
        revertLastMadeChanges.show();
    }
    var saveChanges = $('<button id="save-changes" class="hidden" disabled>Save Changes</button>').appendTo(topBar);


    var cancelEdit = $('<button id="cancel-edit" class="hidden">Cancel</button>').appendTo(topBar);

    // var generateContent = $('<button id="generate-content" class="hidden">Enable Generate Content</button>').appendTo(topBar);
    var aiBotImageHtml = '<img class="aiBotImage" src="assets/images/AiBot.png" alt="AiBot" title="Generate content with AiBot" />';
    var topCenterActions = $('<div class="top-center-actions"></div>').appendTo(topBar);
    var enableDragMode = $('<button id="enable-dragmode">Drag & Drop Section</button>').appendTo(topCenterActions);
    var changeThemeBtn = $('<button id="change-theme" class="hidden">Update Theme</button>').appendTo(topCenterActions);
    var updateSeoBtn = $('<button id="update-seo-btn" class="hidden">Update SEO</button>').appendTo(topCenterActions);

    function toggleEditableClasses(enable) {
        isEditingContent = enable;
        if (enable) {
            // alert('enabled --------');
            wrapper.find('*').not('.link-to-dropdown-container *').addClass('editable');
            wrapper.find('img').addClass('editable-image');
            wrapper.find('img').addClass('updateImg');
            wrapper.find('.generated-logo').addClass('updateTextLogo');
            wrapper.find('video').addClass('editable-video updateImg');
            wrapper.find('*').each(function () {
                const styleAttr = $(this).attr('style');
                if (styleAttr && /background[^;]*url\(/i.test(styleAttr)) {
                    $(this).addClass('updateImg editable-image');
                }
            });

            wrapper.find('a.editable').on('click.editable', handleAnchorEdit);
            $(document).on('click', '.editable', function (e) {
                e.stopPropagation();
                $('.editable').removeClass('activeEditor');
                $(this).addClass('activeEditor');
            });
            $('.section-wrapper').each(function () {
                addActionButtons($(this));
            });

            $('a.edit-site').removeClass('edit-site');

            // generateContent.removeClass('hidden');

            var elementsToUpdate = [];

            $('#wrapper').find('p, h1, h2, h3, h4, h5, h6, span').each(function () {
                var textContent = $(this).text().trim();
                if (textContent.length > 200) {
                    var charCount = textContent.length;
                    $(this).addClass('aiContentGeneration');
                    $(this).attr('cntVal', 'char_cnt_' + charCount);
                    elementsToUpdate.push($(this));
                }
            });

            elementsToUpdate.forEach(function (element) {
                element.append(aiBotImageHtml);
            });
            $('.aiBotImage').each(function () {
                $(this).addClass('jumping');
            });
            enableSocialLinkEditing();  // for socail media links

        } else {
            wrapper.find('*').removeClass('editable');
            wrapper.find('img').removeClass('editable-image').off('click');
            wrapper.find('*').removeAttr('contenteditable');
            wrapper.find('a.editable').off('click.editable');
            wrapper.find('video').removeClass('editable-video updateVideo');
            wrapper.find('.updateBgImg').removeClass('editable-image updateBgImg');
            $('.link-to-btn').remove();
            $('.link-to-dropdown-container').remove();
            $('.add-section-above, .add-section-below ,.remove-section-btn').remove();
            // generateContent.addClass('hidden');
            $('#wrapper').find('p, h1, h2, h3, h4, h5, h6, span').each(function () {
                $(this).removeClass('aiContentGeneration');
                $(this).removeAttr('cntVal');
                $(this).find('.aiBotImage').remove();
            });

        }
    }
    //Cancel edit mode
    cancelEdit.on('click', function () {

        showCustomAlertBox(
            'error',
            'Are you sure you want to cancel edit mode? Your changes will not be saved.',
            function () {

                $('#wrapper').html(window.originalPageHTML);
                isEditingContent = false;
                isEditingImages = false;
                isDragMode = false;
                $('body').removeClass('drag-mode');
                $('body').removeClass('dragging-active');

                toggleEditableClasses(false);

                $('a').each(function () {
                    var currentHrefCustom = $(this).attr('hrefcustom');
                    if (currentHrefCustom) {
                        $(this).attr('href', currentHrefCustom);
                        $(this).removeAttr('hrefcustom');
                    }
                });

                wrapper.find('.editable').removeAttr('contenteditable');
                $('.activeEditor').removeClass('activeEditor');
                wrapper.removeClass('edit-mode');

                enableEditMode.removeClass('hidden');
                enableDragMode.removeClass('hidden');
                saveChanges.addClass('hidden').prop('disabled', true);
                cancelEdit.addClass('hidden');
                updateSeoBtn.addClass('hidden');
                changeThemeBtn.addClass('hidden');
                $('a').addClass('edit-site').css('cursor', 'pointer');
                pendingMediaUpdates = {};
            },
            true
        );

    });



    // generateContent.on('click', function() {
    //     if ($(this).text() === 'Enable Generate Content') {
    //         $(this).text('Disable Generate Content');

    //         // Prepare the elements and append AI Bot images in a batch
    //         var elementsToUpdate = [];

    //         $('#wrapper').find('p, h1, h2, h3, h4, h5, h6, span').each(function() {
    //             var textContent = $(this).text().trim();

    //             if (textContent.length > 200) {
    //                 var charCount = textContent.length;

    //                 $(this).addClass('aiContentGeneration');
    //                 $(this).attr('cntVal', 'char_cnt_' + charCount);
    //                 elementsToUpdate.push($(this)); // Store the elements to update
    //             }
    //         });

    //         // Once all elements are collected, append AI Bot images in one go
    //         elementsToUpdate.forEach(function(element) {
    //             element.append(aiBotImageHtml);
    //         });

    //         // Add animation for the AI Bot image
    //         $('.aiBotImage').each(function() {
    //             $(this).addClass('jumping');
    //         });

    //     } else {
    //         $(this).text('Enable Generate Content');

    //         $('#wrapper').find('p, h1, h2, h3, h4, h5, h6, span').each(function() {
    //             $(this).removeClass('aiContentGeneration');
    //             $(this).removeAttr('cntVal');
    //             $(this).find('.aiBotImage').remove();
    //         });
    //     }
    // });



    // for the AI Bot image tooltip
    var isAudioPlaying = false;
    var tooltipTimeout = null;
    var isTooltipVisible = false;

    $(document).on('mouseenter', '.aiBotImage', function () {
        if (!isAudioPlaying) {
            isAudioPlaying = true;
            var audio = new Audio('assets/aiBotAudio.mp3');
            audio.play();

            audio.onended = function () {
                isAudioPlaying = false;
            };
        }

        if (isTooltipVisible) return;

        var $aiBotImage = $(this);
        var imagePosition = $aiBotImage.offset();

        var $tooltip = $('<div class="ai-tooltip">Generate Content with AiBot</div>');

        $('body').append($tooltip);
        $tooltip.css({
            position: 'absolute',
            top: imagePosition.top - $tooltip.outerHeight() - 40,
            left: imagePosition.left + ($aiBotImage.outerWidth() / 2) - ($tooltip.outerWidth() / 2),
            opacity: 0,
            visibility: 'visible',
            transition: 'opacity 0.3s ease-in-out',
            backgroundColor: '#26C8D0',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
            animation: 'jump-tooltip 1s ease-in-out infinite'
        });

        $tooltip.css('opacity', 1);
        isTooltipVisible = true;

        tooltipTimeout = setTimeout(function () {
            if (!isTooltipVisible) {
                $tooltip.remove();
            }
        }, 3000);

        $aiBotImage.on('mouseleave', function () {
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
            }
            isTooltipVisible = false;
            $tooltip.remove();
        });
    });





    let modelReady = false;
    /* ---------- AI STATUS HANDLING ---------- */
    function showModalSpinner(message = "Loading AI model…") {
        if ($("#aiModalSpinner").length) {
            $("#aiModalSpinner .ai-loading-text").text(message);
            return;
        }

        const spinnerHtml = `
        <div id="aiModalSpinner" class="ai-modal-spinner">
            <div class="ai-spinner"></div>
            <div class="ai-loading-text">${message}</div>
        </div>
    `;

        $(".ai-modal-content").append(spinnerHtml);
    }

    function hideModalSpinner() {
        $("#aiModalSpinner").remove();
    }


    (function injectModalSpinnerCSS() {
        if ($("#aiModalSpinnerStyles").length) return;

        const css = `
        .ai-modal-content {
            position: relative;
        }

        /* Overlay blocks everything */
        .ai-modal-spinner {
            position: absolute;
            inset: 0;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            z-index: 20;
            backdrop-filter: blur(1.5px);
            pointer-events: auto; /* blocks modal */
        }

        /* Spinner itself should NOT intercept clicks */
        .ai-modal-spinner * {
            pointer-events: none;
        }

        /* Close button MUST be above overlay */
        .ai-close {
            align-self: flex-start;
            margin-right: auto; /* push left */
            margin-left: 0;
            z-index: 30;
        }


        /* Spinner styling */
        .ai-spinner {
            width: 42px;
            height: 42px;
            border: 4px solid rgba(0,0,0,0.25);
            border-top-color: #000;
            border-radius: 50%;
            animation: aiSpin 0.9s linear infinite;
        }

        @keyframes aiSpin {
            to { transform: rotate(360deg); }
        }

    `;

        $("<style>", {
            id: "aiModalSpinnerStyles",
            text: css
        }).appendTo("head");
    })();

    // Attach a single listener for AIBridge messages
    AIBridge.onMessage(data => {

        if (data.type === "MODEL_LOADING") {
            showModalSpinner(data.payload.cached
                ? `Using cached model: ${data.payload.model}`
                : `Loading model: ${data.payload.model}… Please wait`);
            $("#generateContentBtn").prop("disabled", true);
        }

        if (data.type === "MODEL_READY") {
            hideModalSpinner();
            $("#generateContentBtn").prop("disabled", false).text("Generate");
        }

        if (data.type === "GENERATE_TEXT") {
            showModalSpinner("Generating content…");
        }

        if (data.type === "GENERATE_TEXT_RESULT") {
            hideModalSpinner();
            $("#contentTextArea").val(data.payload.text);
            $("#generateContentBtn").prop("disabled", false).text("Generate");
        }
    });

    /* ----------------- GENERATE BUTTON ----------------- */
    $(document).on('click', '#generateContentBtn', function () {
        const inputText = $("#topicInput").val().trim();
        if (!inputText) return;
        showModalSpinner("Generating content…");
        $("#contentTextArea").val("Generating...");
        $(this).prop("disabled", true).text("Generating...");

        AIBridge.send({
            type: "GENERATE_TEXT",
            payload: { text: inputText }
        });
    });

    /* ----------------- MODEL SWITCH ----------------- */
    $(document).on("change", "#modelSwitcher", function () {
        const selectedModel = this.value;

        showModalSpinner(`Switching to ${selectedModel}… Please wait`);
        AIBridge.setModel(selectedModel);
    });

    /* ----------------- MODAL CREATION ----------------- */
    $(document).on('click', '.aiBotImage', function () {

        const parentElement = $(this).closest('p, h1, h2, h3, h4, h5, h6, span');
        let currentContent = parentElement.contents().filter(function () {
            return this.nodeType === 3;
        }).first().text().trim();
        currentContent = currentContent.replace(/\s+/g, ' ').trim();

        const modalHtml = `
        <div id="aiContentModal" class="ai-modal">
            <div class="ai-modal-content">
                <span class="ai-close">&times;</span>
                <div class="ai-header">
                    <h1 class="ai-modal-title">AI Content Generator</h1>
                    <p class="ai-subtitle">Describe your topic and let AI create engaging content</p>
                </div>
                <div class="ai-model-switcher">
                    <label class="ai-label">AI Model</label>
                    <select id="modelSwitcher" class="ai-input-field">
                        <option value="Xenova/flan-t5-base">Flan-T5 Base</option>
                        <option value="Xenova/LaMini-Flan-T5-783M">LaMini Flan-T5 783M</option>
                    </select>
                </div>
                <div class="ai-input-area">
                    <label class="ai-label">Topic or Keyword</label>
                    <div class="ai-input-group">
                        <textarea id="topicInput" class="ai-input-field" placeholder="Type your topic...">${currentContent}</textarea>
                        <button id="generateContentBtn" class="ai-btn ai-btn-primary">Generate</button>
                    </div>
                </div>
                <label class="ai-label">Generated Content</label>
                <div class="ai-textarea-wrapper">
                    <textarea id="contentTextArea" class="ai-textarea" rows="6"></textarea>
                </div>
                <div class="ai-modal-actions">
                    <button id="submitContent" class="ai-btn ai-btn-secondary">Submit</button>
                </div>
            </div>
        </div>
    `;

        $('body').append(modalHtml);

        const modal = document.getElementById("aiContentModal");
        modal.style.display = "block";
        modal.currentElement = parentElement;

        $(".ai-close").on('click', function () {
            modal.style.display = "none";
            $("#aiContentModal").remove();
        });

        showModalSpinner("Loading AI model…");
        AIBridge.loadModel();

        $("#submitContent").on('click', function () {
            const updatedContent = $("#contentTextArea").val();
            parentElement.contents().filter(function () {
                return this.nodeType === 3;
            }).first().replaceWith(updatedContent);

            modal.style.display = "none";
            $("#aiContentModal").remove();
        });
    });



    // Handle editing
    function handleAnchorEdit(e) {

        if (!isEditingContent) return;

        // Ignore generated logo
        if ($(e.target).closest('.generated-logo').length) {
            return;
        }

        //  Ignore logo image clicks
        if ($(e.target).closest('.site-logo-img').length) {
            return;
        }

        // Ignore social icons
        if ($(this).hasClass('editable-social')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const anchor = $(this);

        clearPreviousDropdowns();

        if (!anchor.find('.link-to-btn').length) {

            const linkToButton = $(`
            <button class="link-to-btn">
                <img src="assets/images/custom/pencil-icon.png" alt="Edit">
            </button>
        `);

            anchor.append(linkToButton);

            linkToButton.on('click', function (e) {
                e.stopPropagation();
                createDropdown(anchor);
            });
        }
    }
    // Clear previous dropdowns
    function clearPreviousDropdowns() {
        $('#wrapper a.editable').find('.link-to-btn').remove();
        $('#wrapper a.editable').next('.link-to-dropdown-container').remove();
    }

    // Create dropdown for editing anchor
    function createDropdown(anchor) {
        var dropdownOptions = generateDropdownOptions();

        var dropdownHTML = `
        <div class="link-to-dropdown-container">
            <div>
                <h5>Edit Text:</h5>
                <input
                    type="text"
                    class="anchor-text-input"
                    placeholder="Edit your anchor text here..."
                />
            </div>

            <div>
                <h5>Linked to Page:</h5>
                <select class="link-to-dropdown">${dropdownOptions}</select>
            </div>

            <div class="edit-button-container">
                <button class="close-anchor-edit">Close</button>
                <button class="submit-link">Submit</button>
            </div>
        </div>
    `;

        anchor.after(dropdownHTML);

        initializeInputEditor(anchor);


        var container = anchor.next('.link-to-dropdown-container');
        var dropdown = container.find('.link-to-dropdown');

        var currentHref = normalizeUrl(
            anchor.attr('hrefcustom') || anchor.attr('href')
        );

        dropdown.find('option').each(function () {
            if (normalizeUrl($(this).val()) === currentHref) {
                dropdown.val($(this).val());
            }
        });

        dropdown.val(currentHref);
    }
    function normalizeUrl(url) {
        return (url || '').replace(/^\/+/, '').trim();
    }
    // Generate dropdown options from dynamic-header
    function generateDropdownOptions() {
        var options = '';
        $('#dynamic-header li a').each(function () {
            var hrefValue = $(this).attr('hrefcustom') || $(this).attr('href');
            var linkText = $(this).text();
            options += `<option value="${hrefValue}">${linkText}</option>`;
        });
        return options;
    }


    // Initialize input-based editor
    function initializeInputEditor(anchor) {
        var container = anchor.next('.link-to-dropdown-container');
        var textInput = container.find('.anchor-text-input');

        // Set existing anchor text in input
        textInput.val(anchor.text().trim());

        // Submit button
        container.find('.submit-link').on('click', function () {
            var dropdown = container.find('.link-to-dropdown');
            var newHref = dropdown.val();
            var newText = textInput.val().trim();

            if (!newText) {
                showCustomAlertBox('error', 'Anchor text cannot be empty!');
                return;
            }

            // Update clicked anchor
            anchor
                .attr('hrefcustom', newHref)
                .attr('data-selected-link', newHref)
                .text(newText);

            //   Update header menu also
            $('#dynamic-header li a').each(function () {
                if ($(this).text().trim() === newText) {
                    $(this).attr('hrefcustom', newHref);
                }
            });

            container.remove();
            showCustomAlertBox('success', 'Anchor updated successfully!');
        });

        // Close button
        container.find('.close-anchor-edit').on('click', function (e) {
            e.stopPropagation();
            container.remove();
            anchor.find('.link-to-btn').remove();
        });
    }

    // Set selected value for dropdown
    function setDropdownSelectedValue(anchor) {
        var currentHref = anchor.attr('hrefcustom');
        $('.link-to-dropdown').val(currentHref);
    }

    // Edit mode functionality
    enableEditMode.on('click', function () {
        originalHeaderContent = $('#header').html();
        originalFooterContent = $('#footer').html();
        window.originalPageHTML = $('#wrapper').html();
        isEditingContent = true;
        isEditingImages = true;
        toggleEditableClasses(true);
        changeThemeBtn.removeClass('hidden');
        updateSeoBtn.removeClass('hidden');
        wrapper.addClass('edit-mode').find('.editable').attr('contenteditable', true);
        //handleImageClick();
        //configureImageUpload();
        $('a').removeClass('edit-site');
        $('a').each(function () {
            var currentHref = $(this).attr('href');
            $(this).attr('hrefcustom', currentHref);
            $(this).removeAttr('href'); // Remove the original href attribute
        });
        enableEditMode.addClass('hidden');
        enableDragMode.addClass('hidden');

        saveChanges.removeClass('hidden').prop('disabled', false);
        cancelEdit.removeClass('hidden');
        updateSeoBtn.removeClass('hidden');
        $('a').on('click', function (event) {
            if (isEditingContent) {
                event.preventDefault();
            }
        });
    });





enableDragMode.on('click', function () {

    window.originalPageHTML = $('#wrapper').html();

    $('body').addClass('drag-mode');
    $('body').addClass('dragging-active');

    isDragMode = true;

    isEditingContent = false;
    toggleEditableClasses(false);

    changeThemeBtn.addClass('hidden');
    updateSeoBtn.addClass('hidden');

    initDragAndDrop();

    enableEditMode.addClass('hidden');
    enableDragMode.addClass('hidden');

    saveChanges.removeClass('hidden').prop('disabled', false);
    cancelEdit.removeClass('hidden');
});

    function displayLoadingMessage() {
        var loadingMessage = document.createElement('div');
        loadingMessage.id = 'loading-message';
        loadingMessage.textContent = "Uploading in progress... Please wait.";
        loadingMessage.style.position = 'fixed';
        loadingMessage.style.top = '50%';
        loadingMessage.style.left = '50%';
        loadingMessage.style.transform = 'translate(-50%, -50%)';
        loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        loadingMessage.style.color = 'white';
        loadingMessage.style.padding = '20px';
        loadingMessage.style.zIndex = '1000';
        document.body.appendChild(loadingMessage);
    }

    $(document).ready(function () {
        let changesInHeader = false;
        let changesInFooter = false;
        let changesInMainContent = false;

        // Store the original content to compare changes
        let originalHeaderContent = '';
        let originalFooterContent = '';

        $(window).on('load', function () {
            originalHeaderContent = $('#header').html();
            originalFooterContent = $('#footer').html();
        });

        // Monitor changes in the footer using keypress
        $('#footer').on('input keypress', function () {
            changesInFooter = true;
        });

        // Function to observe changes in header and main content
        function observeChanges() {
            const headerObserver = new MutationObserver(function (mutationsList) {
                mutationsList.forEach(function (mutation) {
                    if (mutation.type === 'childList' || mutation.type === 'subtree') {
                        changesInHeader = true;
                    }
                });
            });

            const mainContentObserver = new MutationObserver(function (mutationsList) {
                mutationsList.forEach(function (mutation) {
                    if (mutation.type === 'childList' || mutation.type === 'subtree') {
                        changesInMainContent = true;
                    }
                });
            });
            headerObserver.observe(document.getElementById('header'), { childList: true, subtree: true });
            mainContentObserver.observe(document.getElementById('mainPageContent'), { childList: true, subtree: true });
        }
        observeChanges();

        // reset the flags and update original content after save
        function resetChangeFlags() {
            originalHeaderContent = $('#header').html();
            originalFooterContent = $('#footer').html();
            changesInHeader = false;
            changesInFooter = false;
            changesInMainContent = false;
        }







        saveChanges.on('click', function () {

            $('#themePanel').hide();
            $('.selectedPageName').remove();
            $('[id="top-bar"]').not(':first').remove();
            $('#page-header').removeClass('sticky-active');
            $('#wrapper').removeClass('editableSection');
            const scriptSrcsToDedup = [
                // 'assets/js/middle-section.js',
                '/assets/css/custom/editmode.js',
                '/assets/ai_model_bridge.js',
                '/assets/js/custom/main.js',
                '/assets/js/custom/editModeScript.js'
            ];

            scriptSrcsToDedup.forEach(src => {
                const $scripts = $(`script[src="${src}"]`);
                $scripts.not(':first').remove();
            });



            isEditingContent = false;
            isEditingImages = false;
            toggleEditableClasses(false);
            changeThemeBtn.addClass('hidden');
            updateSeoBtn.addClass('hidden');
            isDragMode = false;
            $('body').removeClass('drag-mode');
            $('body').removeClass('dragging-active');
            enableDragMode.removeClass('hidden');

            // Restore original href attributes
            $('a').each(function () {
                var currentHrefCustom = $(this).attr('hrefcustom');
                if (currentHrefCustom) {
                    $(this).attr('href', currentHrefCustom);
                    $(this).removeAttr('hrefcustom');
                }
            });



            wrapper.find('.editable').removeAttr('contenteditable');
            $('.activeEditor').removeClass('activeEditor');
            wrapper.removeClass('edit-mode');

            // Hide edit buttons and show save changes button
            enableEditMode.removeClass('hidden');
            saveChanges.addClass('hidden').prop('disabled', true);
            updateSeoBtn.addClass('hidden');
            $('#image-upload').remove();
            $('a.edit-site').removeClass('edit-site');
            $('a').addClass('edit-site').css('cursor', 'pointer');
            var SliderContentOldHTML = localStorage.getItem('dynamicSliderContent');
            var dynamicSliderWrapper = $('.dynamic-slider-wrapper');
            if (dynamicSliderWrapper.length && SliderContentOldHTML) {
                dynamicSliderWrapper.html(SliderContentOldHTML);
            }


            const addressEl = document.querySelector('.business-address');
            if (addressEl) {
                const newAddress = addressEl.innerText.trim();

                if (newAddress && newAddress !== originalBusinessAddress) {
                    updateGoogleMapFromAddress();
                    originalBusinessAddress = newAddress; // reset after save
                    changesInMainContent = true; // ensure save
                }
            }


            Object.values(pendingMediaUpdates).forEach(item => {
                if ($(item.element).is('img')) {
                    $(item.element).attr('src', item.oldFilePath);
                } else if ($(item.element).is('video')) {
                    $(item.element).find('source').attr('src', item.oldFilePath);
                } else {
                    $(item.element).css('background-image', `url(${item.oldFilePath})`);
                }
            });
            // Clone the HTML and clean up
            $('*').each(function () {
                const style = $(this).attr('style');

                if (style && style.includes('background-image')) {
                    const newStyle = style.replace(
                        /(background-image\s*:\s*url\(\s*['"]?)https?:\/\/127\.0\.0\.1:8000\//g,
                        '$1'
                    );

                    $(this).attr('style', newStyle);
                }
            });

            var editedHTML = $('html').clone();
            editedHTML.find('meta[name="description"]').attr(
                'content',
                $('meta[name="description"]').attr('content')
            );

            editedHTML.find('meta[name="keywords"]').attr(
                'content',
                $('meta[name="keywords"]').attr('content')
            );

            const seoTitle = $('title').attr('data-seo-title');

            editedHTML.find('title').text(
                seoTitle || $('title').text()
            );
            editedHTML.find('.editable, .editable-image').removeClass('editable editable-image');
            editedHTML.find('a.edit-site').removeClass('edit-site');
            editedHTML.find('#imgForm').remove();
            editedHTML.find('.selectedPageName').remove();
            editedHTML.find('#page-header').removeClass('sticky-active');
            editedHTML.find('#wrapper').removeClass('editableSection');
            editedHTML.find('script[data-editor="true"]').remove();
            editedHTML.find('link[href*="/assets/css/custom/editmode.css"]').remove();
            editedHTML.find('#top-bar').remove();
            editedHTML.find('#themePanel').remove();

            editedHTML.find('#seoSettingsModal').remove();
            editedHTML.find('#seoModalStyle').remove();

            editedHTML.find('#aiModalSpinnerStyles').remove();
            editedHTML.find('#aiModalSpinner').remove();

            editedHTML.find('#project-loader-styles').remove();

            editedHTML.find('#custom-alert-style').remove();
            // SCRIPTS WHICH HAVE BEEN ADDED FROM THE BACKEND HAS TO BE REMOVE BEFORE SAVE
            // editedHTML.find('script[src*="editmode"]').remove();
            // editedHTML.find('script[src*="editModeScript"]').remove();
            // editedHTML.find('script[src*="main.js"]').remove();
            // editedHTML.find('script[src*="jquery"]').remove();
            // editedHTML.find('script[src*="bootstrap"]').remove();
            // editedHTML.find('form#imgForm').remove();
            // REMOVE CODE OF SCRIPT END

            // remove tempory added hidden fields for img, pagename and file name
            // $editedHTML.find('form#imgForm').remove();
            // $editedHTML.find('input.selectedPageName[type="hidden"]').remove();
            // $editedHTML.find('input.formFieldFileName').remove();
            // remove tempory added base urls for loading project locally
            // editedHTML.find('head base').remove();
            // editedHTML.find('head base').remove();// removing the base <base href="/">
            // Remove unique IDs and buttons from each section-wrapper
            $('.section-wrapper').each(function () {
                $(this).removeAttr('id');
                $(this).find('.add-section-above, .add-section-below').remove();
            });

            // ---------------- IMAGE PATH FIX ----------------
            // Convert all img src to relative paths for backend
            // editedHTML.find('img').each(function() {
            //     const originalPath = $(this).attr('data-original-src'); // relative path
            //     if (originalPath) {
            //         $(this).attr('src', originalPath); // save relative path to backend
            //     }
            // });


            const filesDetailsMap = {};
            filesDetailsMap["selectedSectionImages"] = selectedSectionImages;
            filesDetailsMap["removedSectionImages"] = removedSectionImages;


            //             alert(
            //     "Add sections image list final:\n" +
            //     JSON.stringify(selectedSectionImages, null, 2) +
            //     "\n\nRemove section Image list final:\n" +
            //     JSON.stringify(removedSectionImages, null, 2)
            // );
            // Check if the header has changed, and if it has, add it to the filesDetailsMap
            if ($('#header').html() !== originalHeaderContent) {
                var editedHeader = $('#header').html();
                filesDetailsMap["header.html"] = editedHeader;
                changedFiles.add("header.html");
                syncChangedFilesToSession();

            }

            // Check if footer content has changed using keypress or input**
            if ($('#footer').html() !== originalFooterContent) {
                var editedFooter = $('#footer').html();
                filesDetailsMap["footer.html"] = editedFooter;
                changedFiles.add("footer.html");
                syncChangedFilesToSession();

            }

            // Check if main content has changed
            if (changesInMainContent) {
                editedHTML.find('#header').html('');
                editedHTML.find('#footer').html('');
                editedHTML.find('input[type="text"].hidden.selectedPageName').remove();

                // var fileName = $(".selectedPageName").val() || "index.html";
                var fileName = getCurrentPageName();
                const seoTitle = $('title').attr('data-seo-title');

                editedHTML.find("style").filter(function () {
    const css = $(this).html() || "";

                    return css.includes(".seo-modal-overlay") ||
                        css.includes(".seo-modal-box") ||
                        css.includes(".seo-modal-header") ||
                        css.includes("#saveSeoUpdate") ||
                        css.includes(".seo-modal-footer") ||
                        css.includes(".ai-modal-spinner") ||
                        css.includes(".ai-spinner") ||
                        css.includes(".ai-loading-text");
                }).remove();

                editedHTML.find("#seoSettingsModal").remove();
                editedHTML.find("#aiModalSpinner").remove();
                filesDetailsMap[fileName] = editedHTML.prop('outerHTML');
                changedFiles.add(fileName);
                syncChangedFilesToSession();

                console.log("changedFiles", changedFiles)
                changesInMainContent = false;
            }


            // Call the function to save change
            syncChangedFilesToSession();

            editClientSite(filesDetailsMap);

            // show publish button if there are changes
            if (Object.keys(filesDetailsMap).length > 0) {
                $('#publish_chnages_btn').show();
            }
            topBar.removeClass('hidden');

            // Reset flags after saving
            resetChangeFlags();
            cancelEdit.addClass('hidden');
        });
        let originalBusinessAddress = '';

        $(document).ready(function () {
            const addressEl = document.querySelector('.business-address');
            if (addressEl) {
                originalBusinessAddress = addressEl.innerText.trim();
            }
        });
        resetChangeFlags();
    });

    function updateGoogleMapFromAddress() {
        const addressEl = document.querySelector('.business-address');
        const mapIframe = document.querySelector('iframe[data-map="true"]');

        if (!addressEl || !mapIframe) return;

        const address = addressEl.innerText.trim();
        if (!address) return;

        const encoded = encodeURIComponent(address);

        mapIframe.setAttribute('data-address', address);
        mapIframe.setAttribute(
            'src',
            `https://maps.google.com/maps?q=${encoded}&z=15&output=embed`
        );
    }


    // Platform domain rules (for Social media) //New code
    const SOCIAL_DOMAIN_RULES = {
        facebook: ['facebook.com', 'fb.com'],
        instagram: ['instagram.com'],
        youtube: ['youtube.com', 'youtu.be'],
        twitter: ['twitter.com', 'x.com'],
        linkedin: ['linkedin.com'],
        whatsapp: ['wa.me', 'whatsapp.com']
    };

    // Enable social link editing in edit mode(for Social media)
    function enableSocialLinkEditing() {

        // Prevent duplicate bindings
        $(document).off('click.socialEdit');

        // Handle social icon click
        $(document).on('click.socialEdit', '.editable-social', function (e) {

            if (!isEditingContent) return;

            e.preventDefault();
            e.stopImmediatePropagation();
            changesInMainContent = true;
            // Remove existing editor
            $('.social-link-editor').remove();

            const $link = $(this);
            const platform = $link.data('platform');
            const currentHref = $link.attr('hrefcustom') || $link.attr('href') || '';  // New code
            const offset = $link.offset();

            const editor = $(`
            <div class="social-link-editor">
                <input type="text" value="${currentHref}" placeholder="Enter ${platform} link" />
                <button type="button">Update</button>
            </div>
        `);

            $('body').append(editor);

            const editorWidth = editor.outerWidth();
            const editorHeight = editor.outerHeight();
            const iconWidth = $link.outerWidth();

            editor.css({
                top: offset.top - editor.outerHeight() - 68,
                left: offset.left - 10
            });

            editor.on('click', function (ev) {
                ev.stopPropagation();
            });

            // Update link
            editor.find('button').on('click', function () {
                const newHref = editor.find('input').val().trim();
                if (!newHref) return;

                $link.attr('hrefcustom', newHref);
                $link.attr('href', 'javascript:void(0)');
                changesInFooter = true;
                editor.remove();

            });
        });

        $(document).on('click.socialEdit', function () {
            $('.social-link-editor').remove();
        });
    }



    function editClientSite(filesDetailsMap) {

        filesDetailsMap["clientName"] =
            getCookie("clientName");

        filesDetailsMap["clientProjectName"] =
            getCookie("clientProjectName");

        filesDetailsMap["pageName"] =
            getCurrentPageName();




        const savedTheme = getSavedThemeData();


        filesDetailsMap["themeCSS"] =
            savedTheme.mode === "custom" && savedTheme.colors
                ? generateThemeCSS(savedTheme.colors)
                : "";
        alert("themeCSS:\n\n" + filesDetailsMap["themeCSS"]);




        var filename =
            filesDetailsMap["pageName"];

        setCookie(
            "preview",
            "false",
            7
        );


        const formData =
            new FormData();


        formData.append(
            "metaData",
            JSON.stringify(filesDetailsMap)
        );

        Object.keys(pendingMediaUpdates).forEach((key) => {

            const item =
                pendingMediaUpdates[key];

            formData.append(
                "mediaDataFiles",
                item.file
            );

            if (!mediaFilesDetail.includes(key)) {

                mediaFilesDetail.push(key);
            }

        });


        syncChangedFilesToSession();


        $.ajax({

            type: "POST",

            url: "/ucs/",

            data: formData,

            processData: false,

            contentType: false,

            headers: {
                "X-CSRFToken":
                    getCookie("csrftoken")
            },

            success: function (data) {

                showCustomAlertBox(
                    "success",
                    "Changes Saved Successfully",
                    function () {

                        console.log(
                            "Changes Saved Successfully"
                        );

                        $("#loading-message")
                            .remove();

                        location.href =
                            `/es/?srcReq=${filename}&v=${new Date().getTime()}`;
                    }
                );

            },

            error: function (
                xhr,
                errmsg,
                err
            ) {

                showCustomAlertBox(
                    "error"
                );

                console.log(
                    "Error----" +
                    xhr.responseText
                );

                $("#loading-message")
                    .remove();
            }
        });
    }


    function editClientSite_old(filesDetailsMap) {
        filesDetailsMap["clientName"] = getCookie("clientName");
        filesDetailsMap["clientProjectName"] = getCookie("clientProjectName");
        filesDetailsMap["pageName"] = $(".selectedPageName").val() || "index.html";
        // alert(getCookie("clientName"));
        //  alert(getCookie("clientProjectName"));
        // alert( $(".formFieldFileName").val());
        // filesDetailsMap["currentSelectedPage"] = getCookie("projectName");
        var filename = filesDetailsMap["pageName"]
        setCookie('preview', 'false', 7)

        // Upload all updated images
        //  uploadPendingMediaFiles();


        $.ajax({
            type: 'POST',
            url: "/ucs/",
            dataType: "text",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(filesDetailsMap),
            headers: {
                "X-CSRFToken": getCookie('csrftoken')
            },
            success: function (data) {

                showCustomAlertBox(
                    'success',
                    'Changes Saved Successfully',
                    function () {
                        console.log("Changes Saved Successfully");
                        $('#loading-message').remove();

                        // window.location.href = `/es/?srcReq=${filename}`;
                        location.reload();
                    }
                );

            },
            error: function (xhr, errmsg, err) {
                showCustomAlertBox('error');
                console.log("Error----" + xhr.responseText);
                $('#loading-message').remove();
            }
        });
    }




    $(document).on('click', '#AddNewSection', function () {

        if (!isEditingContent) {
            // alert("Please Enable Edit Mode");
            showCustomAlertBox('error', 'Please Enable Edit Mode');
            return;
        }

        selectedSections.clear();
        selectedSectionHtmlMap = {};

        window.currentTargetSection = $('#middle_section_default');
        window.currentInsertPosition = 'below';

        createAndShowModal();
    });
    // Add section part
    // $('#AddNewSection').click(function() {
    //     if (isEditingContent) {
    //         createAndShowModal();
    //     } else {
    //         // Create the modal HTML structure dynamically
    //         var modalHTML = `
    //         <div id="alertDialog" class="custom-modal" style="display:none;">
    //             <div class="custom-modal-content">
    //                 <div class="custom-modal-header">
    //                     <span class="custom-modal-icon">!</span>
    //                     <h2>Please enable editing mode</h2>
    //                 </div>
    //                 <div class="custom-modal-body">
    //                     <p>You need to enable editing mode before adding new sections. </p>
    //                 </div>
    //                 <div class="custom-modal-footer">
    //                     <button id="cancelBtn" class="btn cancel">Close</button>
    //                 </div>
    //             </div>
    //         </div>
    //         `;

    //         $('body').append(modalHTML);

    //         $('#alertDialog').fadeIn();

    //         $('#cancelBtn').click(function() {
    //             $('#alertDialog').fadeOut(function() {
    //                 $('#alertDialog').remove();
    //             });
    //         });

    //     }
    // });



    function createAndShowModal() {
        if ($('#dynamicModal').length) {
            $('#imagePickerModal').modal('hide');
            $('#dynamicModal').modal('show');

            return;
        }

        const modalHtml = `
        <div class="modal fade" id="dynamicModal" tabindex="-1" aria-labelledby="dynamicModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="select-section-top-btns">
                            <button type="button" class="btn custombtn" id="saveSection">Save Section</button>
                            <button type="button" class="btn customClosebtn" id="closeModal" data-dismiss="modal">Close</button>
                        </div>
                        <h4 class="modal-title w-100 text-center">Add a New Section</h4>
                    </div>
                    <div class="modal-body" id="modalBodyContent">
                        <div class="container-viewport" id="add_section_container">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
        $('body').append(modalHtml);
        $('#dynamicModal').modal('show');
        $('#dynamicModal').on('shown.bs.modal', function () {
            $('body').addClass('section-editing');
            CURRENT_MODE = 'design';

            $('#multi-filter-container').show();
            $('#category-filter').show();
            $('#section-filter').show();

            enableRadioButtons();

            $.ajax({
                url: '/fms/',
                type: 'POST',
                data: {
                    category: 'All',
                    subsection: 'allsections',
                    request_src: "addSectonPopup"
                },
                beforeSend: function () {
                    showSectionLoader();
                },
                success: function (response) {
                    // alert(response)
                    $('#add_section_container').html(response);
                    $('#dynamicModal').find('#default-middle_section_component').hide();
                    $('#add_section_container .component').each(function () {
                        const elementId = $(this).attr('id');
                        const middleSectionCategoryId = $(this).attr('subsection');
                        addCheckbox(elementId, middleSectionCategoryId);
                    });
                    $('.section-checkbox').each(function () {
                        if (selectedSections.has($(this).val())) {
                            $(this).prop('checked', true);
                        }
                    });
                    //$(".pagination-container").html(response.pagination_html);
                    //s$(".#categories_filter_container").html(response.categories_and_subcategories_html);
                    $('#no-components-message').hide();
                    loadAllRequiredContents();
                    if ($('#middle_sections_container .component').length > 0) {
                        $('#no-components-message').hide();
                    } else {
                        $('#no-components-message').show();
                    }
                    $("#default-middle_section").hide();
                    applyPageTypeView();
                    hideSectionLoader();

                }
            });

        });




        $(document).off('click', '#saveSection');

        $(document).on('click', '#saveSection', handleSaveSection);
        $(document).on('click', '#closeModal', function () {
            $('#dynamicModal').modal('hide');
        });

        $('#dynamicModal').on('hidden.bs.modal', function () {
            $('body').removeClass('section-editing');
            $(this).remove();
        });


    }
















    function enableRadioButtons() {
        document.querySelectorAll('.radio-holder').forEach(radioHolder => {
            radioHolder.classList.remove('disabled');
            const inputElement = radioHolder.querySelector('input');
            if (inputElement) {
                inputElement.removeAttribute('disabled');
            }
        });
    }

    $(document).on('change', '.section-checkbox', function () {
        const id = $(this).val();

        if ($(this).is(':checked')) {

            selectedSections.add(id);

            const section = $("#" + id).clone(true, true);
            selectedSectionHtmlMap[id] = section;

            selectedSectionImages = [
                ...new Set([
                    ...selectedSectionImages,
                    ...getSectionImages(section)
                ])
            ];

            removedSectionImages = removedSectionImages.filter(function (img) {
                return !selectedSectionImages.includes(img);
            });

        } else {

            selectedSections.delete(id);
            delete selectedSectionHtmlMap[id];

            selectedSectionImages = [];

            Object.values(selectedSectionHtmlMap).forEach(function (section) {
                selectedSectionImages.push(
                    ...getSectionImages(section)
                );
            });

            selectedSectionImages = [
                ...new Set(selectedSectionImages)
            ];
        }

        console.log("Selected Section Images:", selectedSectionImages);
        // console.log("Removed Section Images:", removedSectionImages);

        // alert(
        //     "Selected Section Images:\n" + JSON.stringify(selectedSectionImages, null, 2)
        // );

    });

    $(document).on('click', '.add-section-above, .add-section-below', function () {

        if (!isEditingContent) return;

        const action = $(this).data('action');

        const targetSection = $(this).closest('.section-wrapper');

        window.currentTargetSection = targetSection;

        window.currentInsertPosition = action;

        createAndShowModal();

    });



    function handleSaveSection() {
        if (!isEditingContent) return;
        const selectedIds = Array.from(selectedSections);
        // alert(selectedIds.join(', '));
        if (selectedIds.length === 0) {
            showCustomAlertBox('error', 'Please select at least one section');
            return;
        }

        selectedIds.forEach(function (sectionId) {
            const sourceSection = selectedSectionHtmlMap[sectionId];
            if (!sourceSection.length) {
                console.log("Section not found:", sectionId);
                return;
            }

            const actualSection = sourceSection.find('section.section-wrapper').first();

            if (!actualSection.length) {
                console.log("Actual section not found");
                return;
            }

            const clonedSection = actualSection.clone(true, true);
            clonedSection.find('[class*="anim-"]').attr('style', '');
            clonedSection.find('.radio-holder').remove();
            const uniqueId = generateUniqueId();

            clonedSection.attr('id', uniqueId);

            clonedSection.addClass('section-wrapper');

            addActionButtons(clonedSection);

            if (
                window.currentTargetSection &&
                window.currentTargetSection.attr('id') === 'middle_section_default'
            ) {

                $('#middle_section_default').hide();

                $('#middle_section_default').after(clonedSection);

            } else if (window.currentInsertPosition === 'above') {

                window.currentTargetSection.before(clonedSection);

            } else {

                window.currentTargetSection.after(clonedSection);

            }

            window.currentTargetSection = clonedSection;

            //to make added classes tomkae img/video editabke for added section
            clonedSection.find('*').addClass('editable');
            clonedSection.find('img')
                .addClass('editable-image updateImg');

            clonedSection.find('video')
                .addClass('editable-video updateImg')
                .css('cursor', 'pointer');


            const selectedPage = $('#localStorageTagName').val() || "index.html";

            let middleSectionsObject = {};

            try {
                middleSectionsObject = JSON.parse(
                    getCookie(GLOBAL_MIDDLE_SECTIONS_COOKIE) || "{}"
                );
            } catch (e) {
                middleSectionsObject = {};
            }

            if (!middleSectionsObject[selectedPage]) {
                middleSectionsObject[selectedPage] = [];
            }

            const alreadyExists = middleSectionsObject[selectedPage].some(
                sec => sec.id === sectionId
            );

            if (!alreadyExists) {

                const templatePath =
                    sourceSection.attr("data-template") ||
                    sectionFileMap?.[sectionId]?.original ||
                    "";

                middleSectionsObject[selectedPage].push({
                    id: sectionId,
                    template: templatePath
                });

                setCookie(
                    GLOBAL_MIDDLE_SECTIONS_COOKIE,
                    JSON.stringify(middleSectionsObject),
                    7
                );
            }

        });
        selectedSections.clear();
        selectedSectionHtmlMap = {};
        $('#dynamicModal').modal('hide');
        showCustomAlertBox('success', 'Section added successfully');

    }

    function getFileNameFromImgSrc(imgEl) {
        let src = $(imgEl).attr('src');
        if (src.includes('?')) src = src.split('?')[0];
        return src.substring(src.lastIndexOf('/') + 1);
    }

    function getSanitizedImgPath(imgEl) {
        let src = imgEl.src;
        if (!src) return null;

        const url = new URL(src, window.location.origin);

        let pathname = url.pathname.replace(/^\/+/, '');

        return pathname;
    }


    function uploadImagesFromAddedSections() {

        const clientName = getCookie('clientName');
        const clientProjectName = getCookie('clientProjectName');

        if (!clientName || !clientProjectName) {
            showCustomAlertBox('error', 'clientName or clientProjectName missing in cookies');
            console.log("clientName or clientProjectName missing in cookies");
            return;
        }

        const formData = new FormData();
        formData.append('clientName', clientName);
        formData.append('clientProjectName', clientProjectName);

        let uploadPromises = [];
        let imageElements = [];

        $('.section-wrapper[data-new-section="true"]').each(function () {

            $(this).find('img').each(function () {

                const imgEl = this;
                const imgSrc = imgEl.src;

                if (!imgSrc || imgSrc.startsWith('data:')) return;

                let image_to_save = getSanitizedImgPath(imgEl);

                changedFiles.add(image_to_save);
                syncChangedFilesToSession();

                const promise = new Promise((resolve) => {

                    urlToFile(imgSrc, getFileNameFromImgSrc(imgEl), function (file) {

                        formData.append('imgFiles', file);
                        formData.append('imgFileNames', getFileNameFromImgSrc(imgEl));

                        imageElements.push(imgEl);

                        resolve();
                    });

                });

                uploadPromises.push(promise);
            });

            $(this).removeAttr('data-new-section');
        });

        // AFTER ALL FILES ARE READY
        Promise.all(uploadPromises).then(() => {

            if (uploadPromises.length === 0) return;

            console.log('------------------------bulk upload started');

            $.ajax({
                type: "POST",
                url: "/fuos/",
                data: formData,
                processData: false,
                contentType: false,
                success: function () {

                    console.log('------------------------bulk upload success');

                    // refresh all images AFTER upload
                    imageElements.forEach(function (imgEl) {

                        const basePath = getBasePathFromImgSrc(imgEl);
                        const fileName = getFileNameFromImgSrc(imgEl);

                        if (basePath && fileName) {
                            $(imgEl).attr(
                                'src',
                                basePath + fileName + '?' + Date.now()
                            );
                        }

                    });
                },
                error: function (xhr) {
                    console.error("Bulk image upload failed:", xhr.responseText);
                }
            });

        });
    }


    // Ensure event is attached once to avoid repeated execution
    $(document).ready(function () {
        $('#saveSection').off('click').on('click', handleSaveSection);
        // alert("save section clicked");
    });




    function handleSectionFilter() {
        let selectedSection = $(this).data('value');
        $('#section-filter button').text($(this).text());
        $('#section-filter .dropdown-menu li').removeClass('active');
        $(this).parent().addClass('active');
        let sectionsFound = false;
        if (selectedSection === 'all') {
            $('.middle_sections_container .component').show();
            $('#modalBodyContent').height('auto');
        } else {
            $('.middle_sections_container .component').each(function () {
                let sectionId = $(this).attr('id');
                if (sectionId && sectionId.includes(selectedSection)) {
                    $(this).show();
                    sectionsFound = true;
                } else {
                    $(this).hide();
                }
            });
            if (!sectionsFound) {
                $('.middle_sections_container').html(`<div class="no-sections-message">No sections are available for the "${$(this).text()}" category.</div>`);
                $('#modalBodyContent').height('100vh');
                $('#modalBodyContent').height('auto');
            }
        }
    }


    function handleAddSectionButton() {
        const action = $(this).data('action');
        const targetWrapper = $(this).closest('.section-wrapper');
        const targetId = targetWrapper.attr('id');

        if (!targetId) return;

        $('#saveSection').data('target-id', targetId);
        $('#saveSection').data('action', action);
        createAndShowModal();
    }


    function addActionButtons(sectionWrapper) {
        // Ensure section has an ID
        if (!sectionWrapper.attr('id')) {
            sectionWrapper.attr('id', generateUniqueId());
        }

        const sectionId = sectionWrapper.attr('id');

        // Remove all old buttons and wrappers first
        sectionWrapper.find('.add-section-above, .add-section-below, .remove-section-btn-wrapper, .remove-section-btn').remove();

        //  Create all button HTML (only add wrapper if it contains the button)
        const addAboveButtonHtml = `
        <button class="add-section-above" style="position:absolute; left:47%; top:25px; z-index:999;"
            data-target-id="${sectionId}" data-action="above">
            Add Section Above
            <span><img src="assets/images/arrow_up.png" style="width:20px; height:20px;"/></span>
        </button>
    `;
        const addBelowButtonHtml = `
        <button class="add-section-below" style="position:absolute; left:47%; bottom:22px; z-index:999;"
            data-target-id="${sectionId}" data-action="below">
            Add Section Below
            <span><img src="assets/images/arrow_down.png" style="width:20px; height:20px;"/></span>
        </button>
    `;
        const removeButtonHtml = `
        <button class="remove-section-btn" data-target-id="${sectionId}"
            style="position:absolute; top:5px; right:10px; z-index:999;">&times;</button>
    `;

        sectionWrapper.append($(addAboveButtonHtml));
        sectionWrapper.append($(addBelowButtonHtml));
        sectionWrapper.append($(removeButtonHtml));

        sectionWrapper.find('.remove-section-btn-wrapper:empty').remove();

        sectionWrapper.find('.add-section-above, .add-section-below').off('click').on('click', handleAddSectionButton);
        sectionWrapper.find('.remove-section-btn').off('click').on('click', handleRemoveSection);
    }


    function handleRemoveSection(e) {
        e.stopPropagation();

        const sectionId = $(this).data('target-id');
        const section = $('#' + sectionId);

        if (confirm('Are you sure you want to remove this section?')) {

            const currentSection = $(this).closest('.section-wrapper');

            removedSectionImages = [
                ...new Set([
                    ...removedSectionImages,
                    ...getSectionImages(currentSection)
                ])
            ];
            // alert(
            //     "Removed Section Images:\n" +
            //     JSON.stringify(removedSectionImages, null, 2)
            // );

            currentSection.remove();

            console.log("Removed Section Images:", removedSectionImages);

            setTimeout(function () {

                const customSections = $('#mainPageContent')
                    .find('.section-wrapper')
                    .not('#middle_section_default');

                if (customSections.length === 0) {

                    $('#middle_section_default')
                        .removeAttr('style')
                        .css('display', 'block')
                        .show();

                }

            }, 10);
        }
    }

    function generateUniqueId() {
        return 'section-' + Math.random().toString(36).substring(2, 15);
    }


    function toggleDefaultMiddleSection() {
        const mainPageContent = $('#mainPageContent');

        const realSections = mainPageContent.children().not('#middle_section_default');

        if (realSections.length > 0) {
            mainPageContent.find('#middle_section_default').remove();
        } else {
            if (mainPageContent.find('#middle_section_default').length === 0) {
                mainPageContent.append(`
                <div id="middle_section_default">
                    <!-- Default Section Content -->
                </div>
            `);
            }
        }
    }

});



function getCookie(name) {
    const cookies = document.cookie.split("; ");

    for (let i = 0; i < cookies.length; i++) {
        const parts = cookies[i].split("=");
        const key = parts.shift();
        const value = parts.join("=");

        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
}
function refreshMapFromStoredAddress() {// New code
    const mapIframe = document.querySelector('iframe[data-map="true"]');
    if (!mapIframe) return;

    const address = mapIframe.getAttribute('data-address');
    if (!address) return;

    mapIframe.src =
        `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

$(document).ready(function () { // New code
    refreshMapFromStoredAddress();
});

//loader for uploadeditedproject
function showProjectLoader(message = "Uploading changes, please wait…") {
    let loader = $('#project-loader');
    if (!loader.length) {
        loader = $(`
            <div id="project-loader">
                <div class="pl-circle"></div>
                <div class="pl-text">${message}</div>
            </div>
        `).appendTo('body');

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

    loader.find('.pl-text').text(message);
    loader.addClass('active');
}

function hideProjectLoader() {
    const loader = $('#project-loader');
    loader.removeClass('active');
}

//end of loader of code


function uploadeditedproject() {


    loadChangedFilesFromSession();
    const projectId = getCookie("UpdateContentAddSectionprojectId");
    const clientName = getCookie("clientName");
    const clientProjectName = getCookie("clientProjectName");
    // alert('Changes are uploading please wait');
    showProjectLoader("Uploading changes, please wait…");
    //alert("mediaFilesDetail----"+JSON.stringify(mediaFilesDetail))


    //  SHOW LOADER
    $('#project-loader').addClass('active');
    $.ajax({
        url: `/uploadeditedproject/${projectId}/`,
        type: "POST",
        data: {
            client_name: clientName,
            client_project_name: clientProjectName,
            changed_files: JSON.stringify(Array.from(changedFiles)),
            media_files: JSON.stringify(mediaFilesDetail)

        },
        beforeSend: function () {
            console.log("Uploading changes...");
        },
        success: function (response) {
            // HIDE LOADER
            hideProjectLoader();
            if (response.status === 200) {

                showCustomAlertBox(
                    'success',
                    'Changes has been pushed to Server Successfully',
                    function () {

                        console.log(response.message);

                        // reset ONLY after successful upload
                        clearChangedFilesSession();
                        $('#publish_chnages_btn').hide();

                        window.location.href = "/website_management/";

                    }
                );

            } else {
                showCustomAlertBox('error', response.message || 'Upload failed');
                console.log(response.message || "Upload failed");
            }

        },
        error: function (xhr) {
            // HIDE LOADER
            hideProjectLoader();
            console.error(xhr.responseText);
            showCustomAlertBox('error');
            console.log("Server error occurred");
        }
    });
}

function revertLastMadeChanges() {

    showCustomAlertBox(
        'error',
        'Are you sure you want to undo your last changes? This will restore the previous version of your website',
        function () {

            const projectId = getCookie("UpdateContentAddSectionprojectId");
            const clientName = getCookie("clientName");
            const clientProjectName = getCookie("clientProjectName");
            // alert("inside revert")
            if (!projectId || !clientName || !clientProjectName) {

                showCustomAlertBox(
                    'error',
                    'Unable to revert changes. Project information is missing.'
                );

                return;
            }

            // SHOW SAME LOADER AS PUBLISH
            showProjectLoader("Reverting last changes, please wait…");

            $.ajax({
                url: "/revertchanges/",
                type: "POST",
                data: {
                    project_id: projectId,
                    client_name: clientName,
                    client_project_name: clientProjectName
                },

                success: function (response) {

                    // HIDE LOADER
                    hideProjectLoader();

                    if (response.status === 200) {

                        setCookie("has_last_change_made", "false", 7);

                        showCustomAlertBox(
                            'success',
                            'Last change has been reverted successfully.',
                            function () {
                                location.reload();
                            }
                        );

                    } else {

                        showCustomAlertBox(
                            'error',
                            response.message || 'Unable to revert the last change.'
                        );
                    }
                },

                error: function (xhr) {

                    console.error(
                        "Revert changes error:",
                        xhr.responseText
                    );

                    // HIDE LOADER
                    hideProjectLoader();

                    showCustomAlertBox(
                        'error',
                        'Failed to revert the last change. Please try again.'
                    );
                }
            });
        },
        true
    );
}


function initDragAndDrop() {
    let dragged = null;
    let placeholder = null;
    let offsetY = 0;
    let ghost = null;

    const container = document.getElementById('mainPageContent');

    // ===== SCROLL ARROWS =====
    const scrollTopArrow = document.createElement('div');
    scrollTopArrow.className = 'scroll-arrow top';
    scrollTopArrow.innerHTML = "⬆";

    const scrollBottomArrow = document.createElement('div');
    scrollBottomArrow.className = 'scroll-arrow bottom';
    scrollBottomArrow.innerHTML = "⬇";

    document.body.appendChild(scrollTopArrow);
    document.body.appendChild(scrollBottomArrow);

    document.querySelectorAll('.section-wrapper').forEach(section => {

        section.addEventListener('mousedown', dragStart);

    });

    function dragStart(e) {
        if (!isDragMode) return;

        e.preventDefault();

        dragged = this;

        const rect = this.getBoundingClientRect();
        offsetY = e.clientY - rect.top;

        placeholder = document.createElement('div');
        placeholder.className = 'section-placeholder';
        placeholder.innerHTML = `<div class="placeholder-text">⬇ Drop Here ⬇</div>`;

        this.parentNode.insertBefore(placeholder, this);

        ghost = this.cloneNode(true);
        ghost.classList.add('drag-ghost');

        document.body.appendChild(ghost);

        ghost.style.width = rect.width + "px";
        ghost.style.left = rect.left + "px";
        ghost.style.top = rect.top + "px";

        this.classList.add('picked-up');
        document.body.classList.add('dragging-active');
    }

    document.addEventListener('mousemove', function (e) {
        if (!dragged || !ghost || !isDragMode) return;
        ghost.style.top = (e.clientY - offsetY) + "px";
        const mouseY = e.clientY;

        if (mouseY < 120) {
            window.scrollBy(0, -20);
            scrollTopArrow.style.display = 'block';
        } else {
            scrollTopArrow.style.display = 'none';
        }

        if (mouseY > window.innerHeight - 120) {
            window.scrollBy(0, 20);
            scrollBottomArrow.style.display = 'block';
        } else {
            scrollBottomArrow.style.display = 'none';
        }

        const sections = [...container.querySelectorAll('.section-wrapper:not(.picked-up)')];

        let target = null;

        for (let section of sections) {
            const rect = section.getBoundingClientRect();
            if (mouseY < rect.top + rect.height / 2) {
                target = section;
                break;
            }
        }

        if (target) {
            container.insertBefore(placeholder, target);
        } else {
            container.appendChild(placeholder);
        }
    });

    document.addEventListener('mouseup', function () {
        if (!dragged || !isDragMode) return;
        container.insertBefore(dragged, placeholder);
        dragged.classList.remove('picked-up');
        placeholder.remove();
        ghost.remove();
        scrollTopArrow.style.display = 'none';
        scrollBottomArrow.style.display = 'none';
        document.body.classList.remove('dragging-active');
        dragged = null;
        placeholder = null;
        ghost = null;
    });
}


var selectedCategory = "All"
var subsection = "allsections"
var page = 1

$(document).on("click", ".addSectionPaginationBtn, .middleSectionFilter", function (e) {

    var filterType = $(this).attr("data-type");
    page = 1;

    if (filterType == "main_category") {
        selectedCategory = $(this).attr("data-value");
    } else if (filterType == "sub_section") {
        subsection = $(this).attr("data-value");
    } else if (filterType == "pagination") {
        //alert("Pagination called");
        page = $(this).data("page");
    }

    // alert("CATEGORY----"+selectedCategory+" subsection----"+subsection + " Page----"+page)

    $.ajax({
        url: '/fms/',
        type: 'POST',
        data: {
            category: selectedCategory,
            subsection: subsection,
            request_src: "addSectonFilter",
            page: page
        },
        beforeSend: function () {
            showSectionLoader();
        },
        success: function (response) {

            $('.display_middle_sections').html(response.middles_html);
            $('#dynamicModal').find('#default-middle_section_component').hide();
            let totalLazyLoad = $('.lazy-load').length;
            let loadedCount = 0;
            if (totalLazyLoad === 0) {
                applyCheckboxes();
            }
            $('.lazy-load').each(function () {
                const element = $(this);
                const template = element.data('template');
                $.get(template, function (html) {
                    element.html(html);
                    loadedCount++;
                    if (loadedCount === totalLazyLoad) {
                        applyCheckboxes();
                    }
                });

            });
            function applyCheckboxes() {
                $('.display_middle_sections .component').each(function () {
                    const elementId = $(this).attr('id');
                    const middleSectionCategoryId = $(this).attr('subsection');
                    addCheckbox(elementId, middleSectionCategoryId);
                });
            }
            $('.pagination-container').html(response.pagination_html);
            hideSectionLoader();
        }
    });

});


// Create Pending Media data list for images/Video
function createPendingMediaDataList(file, originalEl, originalPath) {


    // alert("originalPath-----"+originalPath);
    originalFileName = file.name;
    // alert("originalFileName----"+originalFileName)


    pendingMediaUpdates[originalFileName] = {
        oldFileName: originalFileName,
        oldFilePath: originalPath,
        file: file,
        fileType: file.type,
        element: originalEl
    };

    const updatedMediaList = [];
    const previewPromises = [];

    Object.keys(pendingMediaUpdates).forEach((key) => {
        const item = pendingMediaUpdates[key];
        const promise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function (e) {

                updatedMediaList.push(
                    item.oldFileName + ":" + e.target.result
                );

                resolve();
            };
            reader.readAsDataURL(item.file);
        });
        previewPromises.push(promise);
    });

    const localPreview = URL.createObjectURL(file);

    Promise.all(previewPromises).then(() => {
        console.log(
            "UPDATED MEDIA LIST:",
            updatedMediaList.join(",")
        );
    });
    if ($(originalEl).is('video')) {

        $(originalEl)
            .find('source')
            .attr('src', localPreview);

        originalEl.load();

        setTimeout(() => {
            originalEl.play();
        }, 300);

    } else if ($(originalEl).is('img')) {

        $(originalEl).attr('src', localPreview);

    } else {

        $(originalEl).css(
            'background-image',
            `url("${localPreview}")`
        );
    }
    changedFiles.add(cleanOriginalSrc);

    syncChangedFilesToSession();
}


function showSectionLoader() {
    $('#sectionLoader').show();
}

function hideSectionLoader() {
    $('#sectionLoader').hide();
}



let selectedThemeColor = null;
let selectedThemeMode = "default";
let pendingThemeColor = null;
let pendingThemeMode = "default";

function hexToRgb(hex) {
    hex = String(hex || "").replace("#", "").trim();

    if (hex.length === 3) {
        hex = hex.split("").map(function (c) {
            return c + c;
        }).join("");
    }

    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        return null;
    }

    const num = parseInt(hex, 16);

    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(function (value) {
        return Math.max(0, Math.min(255, Math.round(value)))
            .toString(16)
            .padStart(2, "0");
    }).join("");
}

function getLuminance(hex) {
    const rgb = hexToRgb(hex);

    if (!rgb) {
        return 0;
    }

    const values = [rgb.r, rgb.g, rgb.b].map(function (value) {
        value = value / 255;

        return value <= 0.03928
            ? value / 12.92
            : Math.pow((value + 0.055) / 1.055, 2.4);
    });

    return (
        values[0] * 0.2126 +
        values[1] * 0.7152 +
        values[2] * 0.0722
    );
}

function getContrastRatio(color1, color2) {
    const luminance1 = getLuminance(color1);
    const luminance2 = getLuminance(color2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
}

function getContrastColor(background) {
    const white = "#ffffff";
    const black = "#111111";

    const whiteContrast = getContrastRatio(background, white);
    const blackContrast = getContrastRatio(background, black);

    return whiteContrast >= blackContrast ? white : black;
}

function lightenColor(hex, amount) {
    const rgb = hexToRgb(hex);

    if (!rgb) {
        return null;
    }

    return rgbToHex(
        rgb.r + (255 - rgb.r) * amount,
        rgb.g + (255 - rgb.g) * amount,
        rgb.b + (255 - rgb.b) * amount
    );
}

function darkenColor(hex, amount) {
    const rgb = hexToRgb(hex);

    if (!rgb) {
        return null;
    }

    return rgbToHex(
        rgb.r * (1 - amount),
        rgb.g * (1 - amount),
        rgb.b * (1 - amount)
    );
}

function generateThemeData(baseColor) {
    if (!baseColor) {
        return null;
    }

    baseColor = baseColor.toLowerCase().trim();

    if (!/^#[0-9a-f]{6}$/.test(baseColor)) {
        return null;
    }

    const primary = baseColor;

    const secondary = darkenColor(primary, 0.20);

    const light = lightenColor(primary, 0.88);

    const bg = lightenColor(primary, 0.97);

    const border = lightenColor(primary, 0.70);

    const accent = lightenColor(primary, 0.15);

    return {
        primary: primary,
        secondary: secondary,
        light: light,
        bg: bg,
        border: border,
        accent: accent,
        text: getContrastColor(bg)
    };
}

function generateThemeCSS(themeData) {
    if (!themeData) {
        return "";
    }

    return `
:root {
    --primary: ${themeData.primary};
    --secondary: ${themeData.secondary};
    --light: ${themeData.light};
    --bg: ${themeData.bg};
    --border: ${themeData.border};
    --accent: ${themeData.accent};
    --text: ${themeData.text};
}
`;
}

function setThemeEditorVariables(themeData) {
    if (!themeData) {
        return;
    }

    document.documentElement.style.setProperty("--primary", themeData.primary);
    document.documentElement.style.setProperty("--secondary", themeData.secondary);
    document.documentElement.style.setProperty("--light", themeData.light);
    document.documentElement.style.setProperty("--bg", themeData.bg);
    document.documentElement.style.setProperty("--border", themeData.border);
    document.documentElement.style.setProperty("--accent", themeData.accent);
    document.documentElement.style.setProperty("--text", themeData.text);
}

function applyThemeToEditor(themeData) {
    if (!themeData) {
        removeThemeFromEditor();
        return;
    }

    let styleElement = document.getElementById("editorThemeStyle");

    if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = "editorThemeStyle";
        document.head.appendChild(styleElement);
    }

    styleElement.innerHTML = generateThemeCSS(themeData);
}

function removeThemeFromEditor() {
    const styleElement = document.getElementById("editorThemeStyle");

    if (styleElement) {
        styleElement.remove();
    }

    document.documentElement.style.removeProperty("--primary");
    document.documentElement.style.removeProperty("--secondary");
    document.documentElement.style.removeProperty("--light");
    document.documentElement.style.removeProperty("--bg");
    document.documentElement.style.removeProperty("--border");
    document.documentElement.style.removeProperty("--accent");
    document.documentElement.style.removeProperty("--text");
}

function saveThemeToCookies(mode, color, themeData) {
    if (mode === "custom" && color && themeData) {
        setCookie(
            "websiteThemeMode",
            "custom",
            30
        );

        setCookie(
            "websiteThemeColor",
            color,
            30
        );

        setCookie(
            "websiteThemeData",
            JSON.stringify(themeData),
            30
        );
    } else {
        deleteCookie("websiteThemeMode");
        deleteCookie("websiteThemeColor");
        deleteCookie("websiteThemeData");
    }
}

function getSavedThemeData() {
    const mode = getCookie("websiteThemeMode");
    const color = getCookie("websiteThemeColor");
    const savedThemeData = getCookie("websiteThemeData");

    if (mode !== "custom" || !color) {
        return {
            mode: "default",
            color: null,
            colors: null
        };
    }

    let colors = null;

    if (savedThemeData) {
        try {
            colors = JSON.parse(savedThemeData);
        } catch (e) {
            colors = null;
        }
    }

    if (!colors) {
        colors = generateThemeData(color);
    }

    if (!colors) {
        return {
            mode: "default",
            color: null,
            colors: null
        };
    }

    return {
        mode: "custom",
        color: color,
        colors: colors
    };
}

function createThemePanel() {
    if ($("#themePanel").length) {
        initializeThemePanel();
        return;
    }

    const savedTheme = getSavedThemeData();

    selectedThemeMode = savedTheme.mode;
    selectedThemeColor = savedTheme.color;
    pendingThemeMode = selectedThemeMode;
    pendingThemeColor = selectedThemeColor;

    const panelHtml = `
<div id="themePanel" class="theme-panel" style="display:none;">
    <div class="theme-panel-header">
        <div>
            <h4>Change Theme</h4>
            <p>Choose the color style for your website</p>
        </div>

        <button type="button" id="closeThemePanel" class="theme-close-btn">
            &times;
        </button>
    </div>

    <div class="theme-toggle">
        <button type="button" class="theme-tab" data-tab="default">
            Default
        </button>

        <button type="button" class="theme-tab" data-tab="custom">
            Custom
        </button>

        <span class="toggle-indicator"></span>
    </div>

    <div class="theme-section" id="themeDefault">
        <div class="theme-option-card">
            <div class="theme-option-icon">
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div class="theme-option-content">
                <h5>Default Theme</h5>
                <p>
                    Keep the website's original colors and styling.
                </p>
            </div>

            <div class="theme-selected-check" id="defaultThemeCheck">
                ✓
            </div>
        </div>
    </div>

    <div class="theme-section" id="themeCustom">
        <div class="theme-custom-card">
            <div class="theme-custom-title">
                <div>
                    <h5>Custom Theme</h5>
                    <p>
                        Select one main color and matching theme colors will be generated automatically.
                    </p>
                </div>
            </div>

            <div class="theme-color-picker-wrapper">
                <label>Select Theme Color</label>

                <div class="fancy-theme-picker">
                    <button type="button" id="themePickerButton" class="theme-picker-button">
                        <span id="themePickerPreview"></span>
                        <span>
                            <strong>Choose a color</strong>
                            <small id="themePickerValue">No color selected</small>
                        </span>
                        <i class="ri-palette-line"></i>
                    </button>

                    <input type="color" id="nativeThemeColorPicker" value="#b57b09" style="position:absolute;opacity:0;width:1px;height:1px;pointer-events:none;">

                    <input type="hidden" id="themePicker">
                    <input type="hidden" id="themeColorText">
                </div>
            </div>
        </div>
    </div>

    <div class="theme-panel-footer">
        <button
            type="button"
            id="applyThemeBtn"
            class="btn website-info-btn-primary">
            Update Theme
        </button>
    </div>
</div>
`;

    $("body").append(panelHtml);

    initializeThemePanel();
    initializeFancyThemePicker();
}

function initializeThemePanel() {
    const $panel = $("#themePanel");


    if (!$panel.length) {
        return;
    }

    const savedTheme = getSavedThemeData();

    selectedThemeMode = savedTheme.mode || "default";
    selectedThemeColor = savedTheme.color || null;

    pendingThemeMode = selectedThemeMode;
    pendingThemeColor = selectedThemeColor;

    $(".theme-tab").removeClass("active");
    $(`.theme-tab[data-tab="${pendingThemeMode}"]`).addClass("active");

    $(".theme-section").removeClass("active");

    if (pendingThemeMode === "custom") {
        $("#themeCustom").addClass("active");
    } else {
        pendingThemeMode = "default";
        $("#themeDefault").addClass("active");
        $(".theme-tab").removeClass("active");
        $('.theme-tab[data-tab="default"]').addClass("active");
    }

    if (
        pendingThemeColor &&
        /^#[0-9A-Fa-f]{6}$/.test(pendingThemeColor)
    ) {
        const color = pendingThemeColor.toLowerCase();

        $("#themePicker").val(color);
        $("#themeColorText").val(color);
        $("#themePickerPreview").css("background", color);
        $("#themePickerValue").text(color);

        if (themePickrInstance) {
            try {
                themePickrInstance.setColor(color, true);
            } catch (e) {
                console.warn("Unable to set Pickr color:", e);
            }
        }
    } else {
        pendingThemeColor = null;

        $("#themePicker").val("");
        $("#themeColorText").val("");

        $("#themePickerPreview").css(
            "background",
            "linear-gradient(135deg,#f3f4f6,#ffffff)"
        );

        $("#themePickerValue").text("No color selected");

        if (themePickrInstance) {
            try {
                themePickrInstance.setColor(null, true);
            } catch (e) {
                console.warn("Unable to clear Pickr color:", e);
            }
        }
    }

    updateThemeSelection();

    if (
        pendingThemeMode === "custom" &&
        document.getElementById("themePickerButton")
    ) {
        if (
            typeof Pickr !== "undefined" &&
            !themePickrInstance
        ) {
            initializeFancyThemePicker();
        }
    }


}


function updateThemeSelection() {
    $("#defaultThemeCheck").hide();

    if (pendingThemeMode === "default") {
        $("#defaultThemeCheck").show();
    }
}

function openThemePanel() {
    createThemePanel();
    initializeThemePanel();
    initializeFancyThemePicker();
    $("#themePanel").stop(true, true).show();
}

function closeThemePanel() {
    $("#themePanel").stop(true, true).hide();

    if (themePickrInstance) {
        themePickrInstance.hide();
    }
}
$(document).off("click.themeButton", "#change-theme");

$(document).on(
    "click.themeButton",
    "#change-theme",
    function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openThemePanel();
    }
);

$(document).off("click.themeTabs", "#themePanel .theme-tab");

$(document).on(
    "click.themeTabs",
    "#themePanel .theme-tab",
    function (e) {
        e.preventDefault();
        e.stopPropagation();

        const tab = $(this).data("tab");

        pendingThemeMode = tab;

        $(".theme-tab")
            .removeClass("active");

        $(this)
            .addClass("active");

        $(".theme-section")
            .removeClass("active");

        if (tab === "custom") {
            $("#themeCustom").addClass("active");

            if (pendingThemeColor) {
                $("#themePicker").val(pendingThemeColor);
                $("#themeColorText").val(pendingThemeColor);
            }
        } else {
            $("#themeDefault").addClass("active");
        }

        updateThemeSelection();
    }
);

let themePickrInstance = null;

function initializeFancyThemePicker() {
    const picker = document.getElementById("nativeThemeColorPicker");
    const button = document.getElementById("themePickerButton");


    if (!picker || !button) return;

    if (pendingThemeColor && /^#[0-9A-Fa-f]{6}$/.test(pendingThemeColor)) {
        picker.value = pendingThemeColor;
        $("#themePickerPreview").css("background", pendingThemeColor);
        $("#themePickerValue").text(pendingThemeColor);
    }

    $(button).off("click.themePicker").on("click.themePicker", function (e) {
        e.preventDefault();
        picker.click();
    });

    $(picker).off("input.themePicker").on("input.themePicker", function () {
        const color = this.value.toLowerCase();

        pendingThemeColor = color;
        $("#themePicker").val(color);
        $("#themeColorText").val(color);
        $("#themePickerPreview").css("background", color);
        $("#themePickerValue").text(color);
    });


}


$(document).off("input.themeText", "#themeColorText");

$(document).on(
    "input.themeText",
    "#themeColorText",
    function (e) {
        e.stopPropagation();

        let color = $(this).val().trim();

        if (!color) {
            pendingThemeColor = null;
            return;
        }

        if (!color.startsWith("#")) {
            color = "#" + color;
        }

        if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
            pendingThemeColor = color.toLowerCase();
            $("#themePicker").val(pendingThemeColor);
        }
    }
);

$(document).off("click.themeApply", "#applyThemeBtn");

$(document).on(
    "click.themeApply",
    "#applyThemeBtn",
    function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (pendingThemeMode === "default") {
            selectedThemeMode = "default";
            selectedThemeColor = null;

            saveThemeToCookies(
                "default",
                null,
                null
            );

            removeThemeFromEditor();
            closeThemePanel();

            showCustomAlertBox(
                "success",
                "Default theme selected successfully!"
            );

            return;
        }

        let color = pendingThemeColor;

        if (!color && themePickrInstance) {
            const currentColor = themePickrInstance.getColor();

            if (currentColor) {
                color = currentColor.toHEXA().toString(6).toLowerCase();
            }
        }

        if (!color) {
            color = $("#themePicker").val();
        }

        if (!color) {
            color = $("#themeColorText").val().trim();
        }

        if (color && !color.startsWith("#")) {
            color = "#" + color;
        }

        if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            showCustomAlertBox(
                "error",
                "Please select a valid theme color."
            );
            return;
        }

        color = color.toLowerCase();

        pendingThemeColor = color;

        const themeData = generateThemeData(color);

        if (!themeData) {
            showCustomAlertBox(
                "error",
                "Unable to generate theme colors."
            );
            return;
        }

        selectedThemeMode = "custom";
        selectedThemeColor = color;

        saveThemeToCookies(
            "custom",
            selectedThemeColor,
            themeData
        );

        applyThemeToEditor(themeData);

        closeThemePanel();

        showCustomAlertBox(
            "success",
            "Custom theme updated successfully!"
        );
    }
);
$(document).off("click.themeClose", "#closeThemePanel");

$(document).on(
    "click.themeClose",
    "#closeThemePanel",
    function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        closeThemePanel();
    }
);

$(document).off("click.themeOutside");

$(document).on(
    "click.themeOutside",
    function (e) {
        if (!$("#themePanel").is(":visible")) {
            return;
        }

        if ($(e.target).closest("#themePanel, #change-theme").length) {
            return;
        }

        closeThemePanel();
    }
);

function initializeSavedWebsiteTheme() {
    const savedTheme = getSavedThemeData();

    selectedThemeMode = savedTheme.mode;
    selectedThemeColor = savedTheme.color;

    if (
        savedTheme.mode === "custom" &&
        savedTheme.color &&
        savedTheme.colors
    ) {
        applyThemeToEditor(savedTheme.colors);
    } else {
        removeThemeFromEditor();
    }
}

initializeSavedWebsiteTheme();






let currentSeoData = {};
let seoGeneratedData = {};

function getSeoPageFilename() {
    if (typeof getCurrentPageName === "function") {
        return getCurrentPageName() || "index.html";
    }

    var pageName =
        $(".selectedPageName").val() ||
        $(".selectedPageName").text() ||
        window.currentPageName ||
        "index.html";

    pageName = String(pageName).trim();

    if (!pageName) {
        pageName = "index.html";
    }

    if (!/\.html$/i.test(pageName)) {
        pageName += ".html";
    }

    return pageName;
}

function getExistingSeoData() {

    var title =
        $("title").attr("data-seo-title") ||
        $("title").text().trim() ||
        document.title ||
        "";

    var description =
        $('meta[name="description"]').attr("content") ||
        "";

    var canonical =
        $('link[rel="canonical"]').attr("href") ||
        "";

    var robots =
        $('meta[name="robots"]').attr("content") ||
        "index,follow";

    var robotsParts =
        robots.toLowerCase().split(",");

    var index =
        robotsParts.indexOf("noindex") === -1;

    var follow =
        robotsParts.indexOf("nofollow") === -1;

    var socialTitle =
        $('meta[property="og:title"]').attr("content") ||
        title;

    var socialDescription =
        $('meta[property="og:description"]').attr("content") ||
        description;

    var socialImage =
        $('meta[property="og:image"]').attr("content") ||
        "";

    var twitterCard =
        $('meta[name="twitter:card"]').attr("content") ||
        "summary_large_image";

    var schema = {};

    var schemaTag =
        $('script[type="application/ld+json"]').first();

    if (schemaTag.length) {

        try {

            schema =
                JSON.parse(
                    schemaTag.text().trim()
                );

        } catch (error) {

            schema = {};

        }
    }

    var filename =
        getSeoPageFilename();

    var slug =
        filename
            .replace(/\.html$/i, "")
            .replace(/^index$/i, "");

    return {
        title: title,
        description: description,
        keywords: [],
        canonical: canonical,
        slug: slug,

        robots: {
            index: index,
            follow: follow
        },

        social: {
            title: socialTitle,
            description: socialDescription,
            image: socialImage,
            twitter_card: twitterCard
        },

        schema: schema
    };
}

function getStoredSeoData() {

    var filename =
        getSeoPageFilename();

    try {

        var stored =
            localStorage.getItem("seo_data");

        if (!stored) {
            return getExistingSeoData();
        }

        var parsed =
            JSON.parse(stored);

        if (
            parsed &&
            parsed[filename]
        ) {

            return mergeSeoData(
                getExistingSeoData(),
                parsed[filename]
            );
        }

    } catch (error) {

        console.warn(
            "SEO localStorage read error:",
            error
        );

    }

    return getExistingSeoData();
}

function mergeSeoData(defaultData, savedData) {

    defaultData =
        defaultData || {};

    savedData =
        savedData || {};

    return {

        ...defaultData,
        ...savedData,

        robots: {
            ...(defaultData.robots || {}),
            ...(savedData.robots || {})
        },

        social: {
            ...(defaultData.social || {}),
            ...(savedData.social || {})
        },

        schema:
            savedData.schema ||
            defaultData.schema ||
            {}
    };
}

function saveSeoDataLocal(data) {

    var filename =
        getSeoPageFilename();

    var allSeoData = {};

    try {

        allSeoData =
            JSON.parse(
                localStorage.getItem("seo_data") ||
                "{}"
            );

    } catch (error) {

        allSeoData = {};

    }

    allSeoData[filename] = data;

    localStorage.setItem(
        "seo_data",
        JSON.stringify(allSeoData)
    );

    seoGeneratedData[filename] =
        data;

    currentSeoData =
        data;
}

function createSeoModal() {

    if ($("#seoSettingsModal").length) {
        return;
    }

    var modalHTML = `
<div id="seoSettingsModal"
     class="modal fade seo-settings-modal"
     tabindex="-1"
     role="dialog">

    <div class="modal-dialog seo-modal-dialog"
         role="document">

        <div class="modal-content seo-modal-content">

            <div class="modal-header seo-modal-header">

                <div>
                    <h4 class="seo-modal-title">
                        SEO Settings
                    </h4>

                    <p class="seo-modal-subtitle">
                        Optimize your page SEO, technical settings and business information
                    </p>
                </div>

                <button type="button"
                        class="close seo-modal-close"
                        data-dismiss="modal">
                    &times;
                </button>

            </div>

            <div class="seo-tabs">

                <button type="button"
                        class="seo-tab active"
                        data-seo-tab="basic">

                    <i class="ri-seo-line"></i>
                    Basic SEO

                </button>

                <button type="button"
                        class="seo-tab"
                        data-seo-tab="technical">

                    <i class="ri-settings-4-line"></i>
                    Technical SEO

                </button>

                <button type="button"
                        class="seo-tab"
                        data-seo-tab="business">

                    <i class="ri-building-4-line"></i>
                    Business SEO

                </button>

            </div>

            <div class="seo-modal-body">

                <!-- BASIC SEO -->

                <div class="seo-tab-panel active"
                     data-seo-panel="basic">

                    <div class="seo-collapse open">

                        <button type="button"
                                class="seo-collapse-header">

                            <span>
                                <i class="ri-file-text-line"></i>
                                Page SEO
                            </span>

                            <i class="ri-arrow-up-s-line"></i>

                        </button>

                        <div class="seo-collapse-body">

                            <div class="seo-form-grid">

                                <div class="seo-form-group seo-full">

                                    <label>SEO Title</label>

                                    <div class="seo-generate-row">

                                        <input type="text"
                                               id="seo-title"
                                               class="form-control"
                                               placeholder="Professional Web Design Services">

                                        <button type="button"
                                                class="seo-field-generate"
                                                data-field="title">
                                            Generate
                                        </button>

                                    </div>

                                </div>

                                <div class="seo-form-group seo-full">

                                    <label>Meta Description</label>

                                    <div class="seo-generate-row">

                                        <textarea id="seo-description"
                                                  class="form-control"
                                                  rows="4"
                                                  placeholder="Professional web design and development services..."></textarea>

                                        <button type="button"
                                                class="seo-field-generate"
                                                data-field="description">
                                            Generate
                                        </button>

                                    </div>

                                </div>

                                <div class="seo-form-group seo-full">

                                    <label>Target Keywords</label>

                                    <div class="seo-keyword-box">

                                        <div id="seo-keywords"
                                             class="seo-keywords">
                                        </div>

                                        <input type="text"
                                               id="seo-keyword-input"
                                               class="form-control"
                                               placeholder="Type keyword and press Enter">

                                    </div>

                                    <small class="seo-help">
                                        SEO planning field only. This will not create a meta keywords tag.
                                    </small>

                                </div>

                                <div class="seo-form-group">

                                    <label>Canonical URL</label>

                                    <input type="text"
                                           id="seo-canonical"
                                           class="form-control"
                                           placeholder="https://example.com/services">

                                </div>

                                <div class="seo-form-group">

                                    <label>SEO Slug</label>

                                    <input type="text"
                                           id="seo-slug"
                                           class="form-control"
                                           placeholder="services">

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="seo-collapse">

                        <button type="button"
                                class="seo-collapse-header">

                            <span>
                                <i class="ri-share-forward-line"></i>
                                Social Sharing
                            </span>

                            <i class="ri-arrow-down-s-line"></i>

                        </button>

                        <div class="seo-collapse-body">

                            <div class="seo-form-grid">

                                <div class="seo-form-group seo-full">

                                    <label>Social Title</label>

                                    <div class="seo-generate-row">

                                        <input type="text"
                                               id="seo-social-title"
                                               class="form-control">

                                        <button type="button"
                                                class="seo-field-generate"
                                                data-field="social_title">
                                            Generate
                                        </button>

                                    </div>

                                </div>

                                <div class="seo-form-group seo-full">

                                    <label>Social Description</label>

                                    <div class="seo-generate-row">

                                        <textarea id="seo-social-description"
                                                  class="form-control"
                                                  rows="3"></textarea>

                                        <button type="button"
                                                class="seo-field-generate"
                                                data-field="social_description">
                                            Generate
                                        </button>

                                    </div>

                                </div>

                                <div class="seo-form-group">

                                    <label>Social Image</label>

                                    <div class="seo-image-input">

                                        <input type="text"
                                               id="seo-social-image"
                                               class="form-control"
                                               placeholder="Image URL">

                                    </div>

                                </div>

                                <div class="seo-form-group">

                                    <label>Twitter Card</label>

                                    <select id="seo-twitter-card"
                                            class="form-control">

                                        <option value="summary_large_image">
                                            Summary Large Image
                                        </option>

                                        <option value="summary">
                                            Summary
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="seo-collapse">

                        <button type="button"
                                class="seo-collapse-header">

                            <span>
                                <i class="ri-code-s-slash-line"></i>
                                Schema
                            </span>

                            <i class="ri-arrow-down-s-line"></i>

                        </button>

                        <div class="seo-collapse-body">

                            <div class="seo-form-grid">



                                <div class="seo-form-group seo-full">

                                    <label>
                                        Custom Schema / JSON-LD
                                    </label>

                                    <textarea id="seo-custom-schema"
                                              class="form-control seo-json-editor"
                                              rows="9"
                                                                            placeholder='{
                                    "@context": "https://schema.org",
                                    "@type": "WebPage"
                                }'></textarea>

                                </div>

                            </div>


                            <div class="seo-google-preview">

                                <div class="seo-preview-title">
                                    Google Preview
                                </div>

                                <div class="seo-google-preview-box">

                                    <div id="seo-google-title"
                                         class="seo-google-title">
                                        Professional Web Design Services
                                    </div>

                                    <div id="seo-google-url"
                                         class="seo-google-url">
                                        example.com › services
                                    </div>

                                    <div id="seo-google-description"
                                         class="seo-google-description">
                                        Professional web design and development services.
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- TECHNICAL SEO -->

                <div class="seo-tab-panel"
                     data-seo-panel="technical">

                    <div class="seo-collapse open">

                        <button type="button"
                                class="seo-collapse-header">

                            <span>
                                <i class="ri-robot-line"></i>
                                Indexing
                            </span>

                            <i class="ri-arrow-up-s-line"></i>

                        </button>

                        <div class="seo-collapse-body">

                            <div class="seo-form-grid">

                                <div class="seo-form-group">

                                    <label>
                                        Search Engine Indexing
                                    </label>

                                    <select id="seo-indexing"
                                            class="form-control">

                                        <option value="index">
                                            Index
                                        </option>

                                        <option value="noindex">
                                            Noindex
                                        </option>

                                    </select>

                                </div>

                                <div class="seo-form-group">

                                    <label>
                                        Link Following
                                    </label>

                                    <select id="seo-following"
                                            class="form-control">

                                        <option value="follow">
                                            Follow
                                        </option>

                                        <option value="nofollow">
                                            Nofollow
                                        </option>

                                    </select>

                                </div>

                                <div class="seo-form-group seo-full">

                                    <label>Robots Meta</label>

                                    <div id="seo-robots-preview"
                                         class="seo-robots-preview">
                                        index,follow
                                    </div>

                                </div>

                                <div class="seo-form-group seo-full">

                                    <label>
                                        Canonical URL
                                    </label>

                                    <input type="text"
                                           id="seo-technical-canonical"
                                           class="form-control"
                                           placeholder="Uses Basic SEO canonical">

                                </div>

                                <div class="seo-form-group">

                                    <label>XML Sitemap</label>

                                    <select id="seo-sitemap"
                                            class="form-control">

                                        <option value="automatic">
                                            Automatic
                                        </option>

                                        <option value="included">
                                            Included
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="seo-collapse">

                        <button type="button"
                                class="seo-collapse-header">

                            <span>
                                <i class="ri-checkbox-circle-line"></i>
                                Page Structure
                            </span>

                            <i class="ri-arrow-down-s-line"></i>

                        </button>

                        <div class="seo-collapse-body">

                            <div class="seo-validation-list">

                                <div id="seo-h1-status"
                                     class="seo-validation-item">
                                </div>

                                <div id="seo-title-status"
                                     class="seo-validation-item">
                                </div>

                                <div id="seo-description-status"
                                     class="seo-validation-item">
                                </div>

                                <div id="seo-images-status"
                                     class="seo-validation-item">
                                </div>

                                <div id="seo-links-status"
                                     class="seo-validation-item">
                                </div>

                                <div id="seo-language-status"
                                     class="seo-validation-item">
                                </div>

                                <div id="seo-viewport-status"
                                     class="seo-validation-item">
                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="seo-collapse">

                        <button type="button"
                                class="seo-collapse-header">

                            <span>
                                <i class="ri-image-line"></i>
                                Image SEO
                            </span>

                            <i class="ri-arrow-down-s-line"></i>

                        </button>

                        <div class="seo-collapse-body">

                            <div id="seo-image-list"
                                 class="seo-image-list">
                            </div>

                        </div>

                    </div>


                    <div class="seo-collapse">

                        <button type="button"
                                class="seo-collapse-header">

                            <span>
                                <i class="ri-file-settings-line"></i>
                                Technical Files
                            </span>

                            <i class="ri-arrow-down-s-line"></i>

                        </button>

                        <div class="seo-collapse-body">

                            <div class="seo-technical-file">

                                <div>
                                    <strong>Sitemap</strong>
                                    <span class="seo-good">
                                        ✓ sitemap.xml generated
                                    </span>
                                </div>

                                <div>
                                    <strong>Robots.txt</strong>
                                    <span class="seo-good">
                                        ✓ robots.txt generated
                                    </span>
                                </div>

                                <div>
                                    <strong>Canonical URLs</strong>
                                    <span class="seo-good">
                                        ✓ Configured
                                    </span>
                                </div>

                            </div>

                            <div class="seo-sitemap-url">

                                <label>Sitemap URL</label>

                                <div>
                                    ${window.location.origin}/sitemap.xml
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- BUSINESS SEO -->

                <div class="seo-tab-panel"
                     data-seo-panel="business">

                    <div class="seo-collapse open">

                        <button type="button"
                                class="seo-collapse-header">

                            <span>
                                <i class="ri-building-line"></i>
                                Business Information
                            </span>

                            <i class="ri-arrow-up-s-line"></i>

                        </button>

                        <div class="seo-collapse-body">

                            <div class="seo-form-grid">

                                <div class="seo-form-group">

                                    <label>Business Name</label>

                                    <input id="seo-business-name"
                                           class="form-control"
                                           placeholder="ABC Web Solutions">

                                </div>

                                <div class="seo-form-group">

                                    <label>Business Type</label>

                                    <select id="seo-business-type"
                                            class="form-control">

                                        <option value="LocalBusiness">
                                            LocalBusiness
                                        </option>

                                        <option value="Organization">
                                            Organization
                                        </option>

                                        <option value="ProfessionalService">
                                            ProfessionalService
                                        </option>

                                    </select>

                                </div>

                                <div class="seo-form-group">

                                    <label>Phone</label>

                                    <input id="seo-business-phone"
                                           class="form-control"
                                           placeholder="+91">

                                </div>

                                <div class="seo-form-group">

                                    <label>Email</label>

                                    <input id="seo-business-email"
                                           class="form-control"
                                           placeholder="hello@example.com">

                                </div>

                                <div class="seo-form-group seo-full">

                                    <label>Website</label>

                                    <input id="seo-business-website"
                                           class="form-control"
                                           placeholder="https://example.com">

                                </div>

                                <div class="seo-form-group">

                                    <label>Logo</label>

                                    <input id="seo-business-logo"
                                           class="form-control"
                                           placeholder="Logo URL">

                                </div>

                                <div class="seo-form-group">

                                    <label>Business Image</label>

                                    <input id="seo-business-image"
                                           class="form-control"
                                           placeholder="Business image URL">

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="seo-collapse">

                        <button type="button"
                                class="seo-collapse-header">

                            <span>
                                <i class="ri-map-pin-line"></i>
                                Business Address
                            </span>

                            <i class="ri-arrow-down-s-line"></i>

                        </button>

                        <div class="seo-collapse-body">

                            <div class="seo-form-grid">

                                <div class="seo-form-group seo-full">

                                    <label>Street Address</label>

                                    <input id="seo-business-street"
                                           class="form-control">

                                </div>

                                <div class="seo-form-group">

                                    <label>City</label>

                                    <input id="seo-business-city"
                                           class="form-control">

                                </div>

                                <div class="seo-form-group">

                                    <label>State / Region</label>

                                    <input id="seo-business-state"
                                           class="form-control">

                                </div>

                                <div class="seo-form-group">

                                    <label>Postal Code</label>

                                    <input id="seo-business-postal"
                                           class="form-control">

                                </div>

                                <div class="seo-form-group">

                                    <label>Country</label>

                                    <input id="seo-business-country"
                                           class="form-control">

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="seo-collapse">

                        <button type="button"
                                class="seo-collapse-header">

                            <span>
                                <i class="ri-map-2-line"></i>
                                Contact & Location
                            </span>

                            <i class="ri-arrow-down-s-line"></i>

                        </button>

                        <div class="seo-collapse-body">

                            <div class="seo-form-grid">

                                <div class="seo-form-group">

                                    <label>Latitude</label>

                                    <input id="seo-business-latitude"
                                           class="form-control">

                                </div>

                                <div class="seo-form-group">

                                    <label>Longitude</label>

                                    <input id="seo-business-longitude"
                                           class="form-control">

                                </div>

                                <div class="seo-form-group">

                                    <label>Price Range</label>

                                    <input id="seo-business-price"
                                           class="form-control"
                                           placeholder="$ - $$$$">

                                </div>

                                <div class="seo-form-group">

                                    <label>Opening Hours</label>

                                    <input id="seo-business-hours"
                                           class="form-control"
                                           placeholder="Mon-Fri 09:00-18:00">

                                </div>

                            </div>

                        </div>

                    </div>



                </div>

            </div>

            <div class="seo-modal-footer">
                <button type="button"
                        id="seo-generate-btn"
                        class="seo-generate-main-btn">

                    <i class="ri-sparkling-2-line"></i>
                    Generate SEO

                </button>



            </div>

        </div>

    </div>

</div>
`;

$("body").append(modalHTML);

$(".seo-field-generate").remove();

$("#seo-title").attr(
    "placeholder",
    "Best Web Design Company in Nagpur | ABC Web Solutions"
);

$("#seo-description").attr(
    "placeholder",
    "Discover professional web design, development and digital marketing services for businesses in Nagpur."
);

$("#seo-keyword-input").attr(
    "placeholder",
    "web design, website development, SEO services"
);

$("#seo-canonical").attr(
    "placeholder",
    "https://www.example.com/services/web-design"
);

$("#seo-slug").attr(
    "placeholder",
    "web-design-services"
);

$("#seo-social-title").attr(
    "placeholder",
    "Create a Professional Website with ABC Web Solutions"
);

$("#seo-social-description").attr(
    "placeholder",
    "Professional website design and development services to help your business grow online."
);

$("#seo-social-image").attr(
    "placeholder",
    "https://www.example.com/assets/images/social-share.jpg"
);

$("#seo-technical-canonical").attr(
    "placeholder",
    "https://www.example.com/about-us"
);

$("#seo-custom-schema").attr(
    "placeholder",
    '{\n    "@context": "https://schema.org",\n    "@type": "WebPage",\n    "name": "Your Page Name"\n}'
);

$("#seo-business-name").attr(
    "placeholder",
    "ABC Web Solutions"
);

$("#seo-business-phone").attr(
    "placeholder",
    "+91 9876543210"
);

$("#seo-business-email").attr(
    "placeholder",
    "hello@example.com"
);

$("#seo-business-website").attr(
    "placeholder",
    "https://www.example.com"
);

$("#seo-business-logo").attr(
    "placeholder",
    "https://www.example.com/assets/images/logo.png"
);

$("#seo-business-image").attr(
    "placeholder",
    "https://www.example.com/assets/images/business.jpg"
);

$("#seo-business-street").attr(
    "placeholder",
    "123 Main Street, Near City Center"
);

$("#seo-business-city").attr(
    "placeholder",
    "Nagpur"
);

$("#seo-business-state").attr(
    "placeholder",
    "Maharashtra"
);

$("#seo-business-postal").attr(
    "placeholder",
    "440001"
);

$("#seo-business-country").attr(
    "placeholder",
    "India"
);

$("#seo-business-latitude").attr(
    "placeholder",
    "21.1458"
);

$("#seo-business-longitude").attr(
    "placeholder",
    "79.0882"
);

$("#seo-business-price").attr(
    "placeholder",
    "$$ or $ - $$$$"
);

$("#seo-business-hours").attr(
    "placeholder",
    "Mon-Fri 09:00-18:00, Sat 10:00-14:00"
);
}

function populateSeoModal(data) {

    data =
        mergeSeoData(
            getExistingSeoData(),
            data
        );

    $("#seo-title")
        .val(data.title || "");

    $("#seo-description")
        .val(data.description || "");

    $("#seo-canonical")
        .val(data.canonical || "");

    $("#seo-slug")
        .val(data.slug || "");

    $("#seo-indexing")
        .val(
            data.robots.index
                ? "index"
                : "noindex"
        );

    $("#seo-following")
        .val(
            data.robots.follow
                ? "follow"
                : "nofollow"
        );

    $("#seo-social-title")
        .val(
            data.social.title || ""
        );

    $("#seo-social-description")
        .val(
            data.social.description || ""
        );

    $("#seo-social-image")
        .val(
            data.social.image || ""
        );

    $("#seo-twitter-card")
        .val(
            data.social.twitter_card ||
            "summary_large_image"
        );

    $("#seo-technical-canonical")
        .val(
            data.canonical || ""
        );

    $("#seo-business-name")
        .val(
            data.business?.name || ""
        );

    $("#seo-business-type")
        .val(
            data.business?.type ||
            "LocalBusiness"
        );

    $("#seo-business-phone")
        .val(
            data.business?.phone || ""
        );

    $("#seo-business-email")
        .val(
            data.business?.email || ""
        );

    $("#seo-business-website")
        .val(
            data.business?.website ||
            window.location.origin
        );

    // $("#seo-business-logo")
    //     .val(
    //         data.business?.logo || ""
    //     );

    // $("#seo-business-image")
    //     .val(
    //         data.business?.image || ""
    //     );

    $("#seo-business-street")
        .val(
            data.business?.street || ""
        );

    $("#seo-business-city")
        .val(
            data.business?.city || ""
        );

    $("#seo-business-state")
        .val(
            data.business?.state || ""
        );

    $("#seo-business-postal")
        .val(
            data.business?.postal_code || ""
        );

    $("#seo-business-country")
        .val(
            data.business?.country || ""
        );

    $("#seo-business-latitude")
        .val(
            data.business?.latitude || ""
        );

    $("#seo-business-longitude")
        .val(
            data.business?.longitude || ""
        );

    $("#seo-business-price")
        .val(
            data.business?.price_range || ""
        );

    $("#seo-business-hours")
        .val(
            data.business?.opening_hours || ""
        );

    $("#seo-keywords").empty();

    if (
        Array.isArray(data.keywords)
    ) {

        data.keywords.forEach(
            function (keyword) {
                addSeoKeyword(keyword);
            }
        );

    }

    var schemaText = "";

    if (
        data.schema &&
        Object.keys(data.schema).length
    ) {

        try {

            schemaText =
                JSON.stringify(
                    data.schema,
                    null,
                    4
                );

        } catch (error) {

            schemaText = "";

        }
    }

    $("#seo-custom-schema")
        .val(schemaText);

    if (
        data.schema &&
        data.schema["@type"]
    ) {

        $("#seo-schema-type")
            .val(
                data.schema["@type"]
            );

    }

    updateSeoGooglePreview();

    updateRobotsPreview();

    updateSeoValidation();

    renderSeoImages();
}

function addSeoKeyword(keyword) {

    keyword =
        String(keyword || "")
            .trim();

    if (!keyword) {
        return;
    }

    var exists = false;

    $("#seo-keywords .seo-keyword-tag")
        .each(function () {

            if (
                String(
                    $(this).attr("data-value") ||
                    ""
                ).toLowerCase() ===
                keyword.toLowerCase()
            ) {

                exists = true;

            }

        });

    if (exists) {
        return;
    }

    var safeKeyword =
        $("<div>")
            .text(keyword)
            .html();

    $("#seo-keywords").append(`
        <span class="seo-keyword-tag"
              data-value="${safeKeyword}">

            ${safeKeyword}

            <button type="button"
                    class="seo-remove-keyword">
                ×
            </button>

        </span>
    `);
}

function collectKeywords() {

    var keywords = [];

    $("#seo-keywords .seo-keyword-tag")
        .each(function () {

            var value =
                $(this).attr("data-value");

            if (value) {
                keywords.push(value);
            }

        });

    return keywords;
}

function collectBusinessData() {

    return {

        name:
            $("#seo-business-name")
                .val()
                .trim(),

        type:
            $("#seo-business-type")
                .val(),

        phone:
            $("#seo-business-phone")
                .val()
                .trim(),

        email:
            $("#seo-business-email")
                .val()
                .trim(),

        website:
            $("#seo-business-website")
                .val()
                .trim(),

        // logo:
        //     $("#seo-business-logo")
        //         .val()
        //         .trim(),

        // image:
        //     $("#seo-business-image")
        //         .val()
        //         .trim(),

        street:
            $("#seo-business-street")
                .val()
                .trim(),

        city:
            $("#seo-business-city")
                .val()
                .trim(),

        state:
            $("#seo-business-state")
                .val()
                .trim(),

        postal_code:
            $("#seo-business-postal")
                .val()
                .trim(),

        country:
            $("#seo-business-country")
                .val()
                .trim(),

        latitude:
            $("#seo-business-latitude")
                .val()
                .trim(),

        longitude:
            $("#seo-business-longitude")
                .val()
                .trim(),

        price_range:
            $("#seo-business-price")
                .val()
                .trim(),

        opening_hours:
            $("#seo-business-hours")
                .val()
                .trim()

    };
}

function collectSeoData() {

    var schema = {};

    var schemaText =
        $("#seo-custom-schema")
            .val()
            .trim();

    if (schemaText) {

        try {

            schema =
                JSON.parse(schemaText);

        } catch (error) {

            schema = {
                "@context": "https://schema.org",
                "@type":
                    $("#seo-schema-type")
                        .val() ||
                    "WebPage"
            };

        }

    } else {

        schema = {
            "@context": "https://schema.org",
            "@type":
                $("#seo-schema-type")
                    .val() ||
                "WebPage"
        };

    }

    var canonical =
        $("#seo-canonical")
            .val()
            .trim();

    if (
        !canonical
    ) {

        canonical =
            $("#seo-technical-canonical")
                .val()
                .trim();

    }

    return {

        title:
            $("#seo-title")
                .val()
                .trim(),

        description:
            $("#seo-description")
                .val()
                .trim(),

        keywords:
            collectKeywords(),

        canonical:
            canonical,

        robots: {

            index:
                $("#seo-indexing")
                    .val() === "index",

            follow:
                $("#seo-following")
                    .val() === "follow"

        },

        social: {

            title:
                $("#seo-social-title")
                    .val()
                    .trim(),

            description:
                $("#seo-social-description")
                    .val()
                    .trim(),

            image:
                $("#seo-social-image")
                    .val()
                    .trim(),

            twitter_card:
                $("#seo-twitter-card")
                    .val() ||
                "summary_large_image"

        },

        schema:
            schema,

        business:
            collectBusinessData()

    };
}

function updateSeoGooglePreview() {

    var title =
        $("#seo-title")
            .val()
            .trim() ||
        "Professional Web Design Services";

    var description =
        $("#seo-description")
            .val()
            .trim() ||
        "Professional web design and development services.";

    var canonical =
        $("#seo-canonical")
            .val()
            .trim() ||
        "https://example.com/services";

    var displayUrl =
        canonical;

    try {

        var url =
            new URL(canonical);

        displayUrl =
            url.hostname +
            " › " +
            url.pathname
                .replace(/^\/|\/$/g, "");

    } catch (error) { }

    $("#seo-google-title")
        .text(title);

    $("#seo-google-url")
        .text(displayUrl);

    $("#seo-google-description")
        .text(description);
}

function updateRobotsPreview() {

    var index =
        $("#seo-indexing")
            .val() === "index";

    var follow =
        $("#seo-following")
            .val() === "follow";

    $("#seo-robots-preview")
        .text(
            (index ? "index" : "noindex") +
            "," +
            (follow ? "follow" : "nofollow")
        );
}

function updateSeoValidation() {

    var h1Count =
        $("#wrapper h1").length;

    var title =
        $("title")
            .text()
            .trim();

    var description =
        $('meta[name="description"]')
            .attr("content") ||
        "";

    var images =
        $("#wrapper img");

    var imageCount =
        images.length;

    var altCount =
        $("#wrapper img[alt]")
            .filter(function () {
                return $(this)
                    .attr("alt")
                    .trim()
                    .length > 0;
            })
            .length;

    var links =
        $("#wrapper a");

    var linkCount =
        links.length;

    var hrefCount =
        links.filter(function () {
            return !!$(this).attr("href");
        }).length;

    var language =
        document.documentElement
            .getAttribute("lang") ||
        "en";

    var viewport =
        $('meta[name="viewport"]')
            .length > 0;

    $("#seo-h1-status").html(
        h1Count === 1
            ? '<span class="seo-status-good">✓</span> One H1 found'
            : '<span class="seo-status-warning">!</span> ' +
            h1Count +
            ' H1 tags found'
    );

    $("#seo-title-status").html(
        title
            ? '<span class="seo-status-good">✓</span> Title configured'
            : '<span class="seo-status-warning">!</span> Title missing'
    );

    $("#seo-description-status").html(
        description
            ? '<span class="seo-status-good">✓</span> Description configured'
            : '<span class="seo-status-warning">!</span> Description missing'
    );

    $("#seo-images-status").html(
        imageCount === altCount
            ? '<span class="seo-status-good">✓</span> ' +
            imageCount +
            '/' +
            imageCount +
            ' images have alt text'
            : '<span class="seo-status-warning">!</span> ' +
            altCount +
            '/' +
            imageCount +
            ' images have alt text'
    );

    $("#seo-links-status").html(
        linkCount === hrefCount
            ? '<span class="seo-status-good">✓</span> All links have href'
            : '<span class="seo-status-warning">!</span> ' +
            (linkCount - hrefCount) +
            ' links missing href'
    );

    $("#seo-language-status").html(
        '<span class="seo-status-good">✓</span> ' +
        language
    );

    $("#seo-viewport-status").html(
        viewport
            ? '<span class="seo-status-good">✓</span> Configured'
            : '<span class="seo-status-warning">!</span> Missing'
    );
}

function renderSeoImages() {

    var container =
        $("#seo-image-list");

    if (!container.length) {
        return;
    }

    container.empty();

    var images =
        $("#wrapper img");

    if (!images.length) {

        container.html(`
            <div class="seo-empty-state">
                No images found on this page.
            </div>
        `);

        return;
    }

    images.each(function (index) {

        var img =
            $(this);

        var src =
            img.attr("src") || "";

        var alt =
            img.attr("alt") || "";

        var loading =
            img.attr("loading") ||
            "lazy";

        var decoding =
            img.attr("decoding") ||
            "async";

        var safeAlt =
            $("<div>")
                .text(alt)
                .html();

        var safeSrc =
            $("<div>")
                .text(src)
                .html();

        container.append(`

            <div class="seo-image-row">

                <div class="seo-image-thumb">

                    <img src="${safeSrc}"
                         alt="">

                </div>

                <div class="seo-image-content">

                    <label>
                        Alt Text
                    </label>

                    <input type="text"
                           class="form-control seo-image-alt"
                           data-index="${index}"
                           value="${safeAlt}"
                           placeholder="Professional web design team">

                    <div class="seo-image-options">

                        <div>

                            <label>
                                Lazy Loading
                            </label>

                            <select class="form-control seo-image-loading"
                                    data-index="${index}">

                                <option value="lazy"
                                    ${loading === "lazy" ? "selected" : ""}>
                                    Automatic
                                </option>

                                <option value="eager"
                                    ${loading === "eager" ? "selected" : ""}>
                                    Eager
                                </option>

                            </select>

                        </div>

                        <div>

                            <label>
                                Image Decoding
                            </label>

                            <select class="form-control seo-image-decoding"
                                    data-index="${index}">

                                <option value="async"
                                    ${decoding === "async" ? "selected" : ""}>
                                    Async
                                </option>

                                <option value="sync"
                                    ${decoding === "sync" ? "selected" : ""}>
                                    Sync
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

            </div>

        `);

    });
}

function applySeoImageChanges() {

    $(".seo-image-row")
        .each(function () {

            var index =
                $(this)
                    .find(".seo-image-alt")
                    .data("index");

            var image =
                $("#wrapper img")
                    .eq(index);

            if (!image.length) {
                return;
            }

            var alt =
                $(this)
                    .find(".seo-image-alt")
                    .val()
                    .trim();

            var loading =
                $(this)
                    .find(".seo-image-loading")
                    .val();

            var decoding =
                $(this)
                    .find(".seo-image-decoding")
                    .val();

            image.attr(
                "alt",
                alt
            );

            image.attr(
                "loading",
                loading
            );

            image.attr(
                "decoding",
                decoding
            );

        });
}

function generateSeoAlert() {

    applySeoImageChanges();

    var filename = getSeoPageFilename();

    var data = collectSeoData();

    var allFormData = {};

    $("#seoSettingsModal")
        .find("input, textarea, select")
        .each(function () {

            var $field = $(this);

            var id = $field.attr("id");

            if (id) {

                var value = $field.val();

                if ($field.is("select")) {
                    allFormData[id] = value;
                } else {
                    allFormData[id] = value || "";
                }

                return;
            }

            if ($field.hasClass("seo-image-alt")) {

                var index = $field.data("index");

                if (!allFormData.image_seo) {
                    allFormData.image_seo = {};
                }

                if (!allFormData.image_seo[index]) {
                    allFormData.image_seo[index] = {};
                }

                allFormData.image_seo[index].alt =
                    $field.val() || "";

                return;
            }

            if ($field.hasClass("seo-image-loading")) {

                var loadingIndex = $field.data("index");

                if (!allFormData.image_seo) {
                    allFormData.image_seo = {};
                }

                if (!allFormData.image_seo[loadingIndex]) {
                    allFormData.image_seo[loadingIndex] = {};
                }

                allFormData.image_seo[loadingIndex].loading =
                    $field.val() || "";

                return;
            }

            if ($field.hasClass("seo-image-decoding")) {

                var decodingIndex = $field.data("index");

                if (!allFormData.image_seo) {
                    allFormData.image_seo = {};
                }

                if (!allFormData.image_seo[decodingIndex]) {
                    allFormData.image_seo[decodingIndex] = {};
                }

                allFormData.image_seo[decodingIndex].decoding =
                    $field.val() || "";

            }

        });

    allFormData.target_keywords = collectKeywords();

    allFormData.page = {
        filename: filename
    };

    var seoData = {};

    seoData[filename] = {
        title: data.title || "",
        description: data.description || "",
        keywords: data.keywords || [],
        canonical: data.canonical || "",
        slug: $("#seo-slug").val().trim(),

        robots: {
            index: !!data.robots.index,
            follow: !!data.robots.follow
        },

        social: {
            title: data.social.title || "",
            description: data.social.description || "",
            image: data.social.image || "",
            twitter_card:
                data.social.twitter_card ||
                "summary_large_image"
        },

        technical: {
            canonical:
                $("#seo-technical-canonical")
                    .val()
                    .trim(),

            sitemap:
                $("#seo-sitemap")
                    .val()
        },

        schema: data.schema || {},

        business: {
            name:
                $("#seo-business-name")
                    .val()
                    .trim(),

            type:
                $("#seo-business-type")
                    .val(),

            phone:
                $("#seo-business-phone")
                    .val()
                    .trim(),

            email:
                $("#seo-business-email")
                    .val()
                    .trim(),

            website:
                $("#seo-business-website")
                    .val()
                    .trim(),

            logo:
                $("#seo-business-logo")
                    .val()
                    .trim(),

            image:
                $("#seo-business-image")
                    .val()
                    .trim(),

            street:
                $("#seo-business-street")
                    .val()
                    .trim(),

            city:
                $("#seo-business-city")
                    .val()
                    .trim(),

            state:
                $("#seo-business-state")
                    .val()
                    .trim(),

            postal_code:
                $("#seo-business-postal")
                    .val()
                    .trim(),

            country:
                $("#seo-business-country")
                    .val()
                    .trim(),

            latitude:
                $("#seo-business-latitude")
                    .val()
                    .trim(),

            longitude:
                $("#seo-business-longitude")
                    .val()
                    .trim(),

            price_range:
                $("#seo-business-price")
                    .val()
                    .trim(),

            opening_hours:
                $("#seo-business-hours")
                    .val()
                    .trim()
        },

        image_seo:
            allFormData.image_seo || {}
    };

    seoGeneratedData[filename] =
        seoData[filename];

    currentSeoData =
        seoData[filename];

    saveSeoDataLocal(
        seoData[filename]
    );

    allFormData.generated_seo_data =
        seoData[filename];

    alert(
        "SEO DATA FOR: " +
        filename +
        "\n\n" +
        JSON.stringify(
            allFormData,
            null,
            4
        )
    );

    return seoData;
}

function openSeoModal() {

    createSeoModal();

    var filename =
        getSeoPageFilename();

    currentSeoData =
        getStoredSeoData();

    populateSeoModal(
        currentSeoData
    );

    $("#seoSettingsModal")
        .modal({
            backdrop: true,
            keyboard: true,
            show: true
        });
}

$(document).on(
    "click",
    "#update-seo-btn",
    function (e) {

        e.preventDefault();
        e.stopPropagation();

        if (
            typeof isEditingContent !==
            "undefined" &&
            !isEditingContent
        ) {
            return;
        }

        openSeoModal();

    }
);

$(document).on(
    "click",
    ".seo-tab",
    function () {

        var tab =
            $(this)
                .data("seo-tab");

        $(".seo-tab")
            .removeClass("active");

        $(this)
            .addClass("active");

        $(".seo-tab-panel")
            .removeClass("active");

        $(
            '.seo-tab-panel[data-seo-panel="' +
            tab +
            '"]'
        )
            .addClass("active");

        if (
            tab === "technical"
        ) {

            renderSeoImages();

            updateSeoValidation();

        }

    }
);

$(document).on(
    "click",
    ".seo-collapse-header",
    function () {

        var collapse =
            $(this)
                .closest(".seo-collapse");

        collapse.toggleClass("open");

        collapse
            .find(".seo-collapse-body")
            .first()
            .stop(true, true)
            .slideToggle(180);

        var icon =
            collapse
                .find(".seo-collapse-header > i")
                .first();

        if (
            collapse.hasClass("open")
        ) {

            icon.attr(
                "class",
                "ri-arrow-up-s-line"
            );

        } else {

            icon.attr(
                "class",
                "ri-arrow-down-s-line"
            );

        }

    }
);

$(document).on(
    "keydown",
    "#seo-keyword-input",
    function (e) {

        if (
            e.key === "Enter"
        ) {

            e.preventDefault();

            addSeoKeyword(
                $(this).val()
            );

            $(this).val("");

        }

    }
);

$(document).on(
    "click",
    ".seo-remove-keyword",
    function () {

        $(this)
            .closest(".seo-keyword-tag")
            .remove();

    }
);

$(document).on(
    "input",
    "#seo-title, #seo-description, #seo-canonical",
    function () {

        updateSeoGooglePreview();

    }
);

$(document).on(
    "change",
    "#seo-indexing, #seo-following",
    function () {

        updateRobotsPreview();

    }
);

$(document).on(
    "click",
    ".seo-field-generate",
    function () {

        var field =
            $(this)
                .data("field");

        var title =
            $("#seo-title")
                .val()
                .trim();

        var description =
            $("#seo-description")
                .val()
                .trim();

        var pageName =
            getSeoPageFilename()
                .replace(
                    /\.html$/i,
                    ""
                );

        if (
            field === "title" &&
            !title
        ) {

            $("#seo-title")
                .val(
                    pageName === "index"
                        ? "Professional Web Design Services"
                        : pageName
                            .replace(/[-_]/g, " ")
                            .replace(/\b\w/g, function (c) {
                                return c.toUpperCase();
                            })
                );

        }

        if (
            field === "description" &&
            !description
        ) {

            $("#seo-description")
                .val(
                    "Explore professional " +
                    pageName.replace(
                        /[-_]/g,
                        " "
                    ) +
                    " services designed to help businesses grow online."
                );

        }

        if (
            field === "social_title"
        ) {

            $("#seo-social-title")
                .val(
                    title ||
                    $("#seo-title")
                        .val()
                        .trim()
                );

        }

        if (
            field === "social_description"
        ) {

            $("#seo-social-description")
                .val(
                    description ||
                    $("#seo-description")
                        .val()
                        .trim()
                );

        }

        updateSeoGooglePreview();

    }
);

$(document).on(
    "click",
    "#seo-generate-btn",
    function () {

        generateSeoAlert();

        updateRobotsPreview();

        updateSeoGooglePreview();

        updateSeoValidation();

    }
);


