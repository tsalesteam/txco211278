//Pagination
$(document).on("click", ".pagination-btn", function () {

	const page = $(this).data("page");
	const type = $(this).data("type");
	// alert("page---"+page+" type-----"+type)

	let requestData = {
		page: page,
		type: type
	};

	// COMMON CATEGORY LOGIC (FOR ALL TYPES)
	let category = "All";

	if ($('.all-main-category.active-orange').length > 0) {
		category = "All";
	}
	else if ($('#categoryDropdownMenu ul li.active-sub a').length > 0) {
		category = $('#categoryDropdownMenu ul li.active-sub a').data('value');
	}
	else {
		category = $('#categoryDropdownButton .selected-category').text().trim() || "All";
	}

	console.log("Final category:", category);

	// SEND CATEGORY FOR ALL TYPES
	requestData.category = category;

	// ONLY FOR MIDDLE → ADD SUBSECTION
	if (type === "middle") {

		let subsection = "All";

		const sectionFilterVisible = $("#section-filter").is(":visible");

		if (sectionFilterVisible && $('#section-filter .dropdown-menu li.active a').length > 0) {
			subsection = $('#section-filter .dropdown-menu li.active a').data('value');
		}

		console.log("Final subsection:", subsection);

		requestData.subsection = subsection;
	}

	console.log("FINAL REQUEST:", requestData);

	$.ajax({
		url: "/wb/",
		type: "POST",
		data: requestData,
		success: function (res) {

			$(".headers_container").html(res.headers_html);
			$(".middle_sections_container").html(res.middles_html);
			$(".footers_container").html(res.footers_html);

			$(".pagination-container").html(res.pagination_html);

			loadAllRequiredContents();
			applyPageTypeView();
			setTimeout(function () {
				restoreHeaderFooterSelection();
				restoreMiddleSectionsForCurrentPage();
			}, 800);
		}
	});

});

document.addEventListener("DOMContentLoaded", function () {
	loadAllRequiredContents();

	applyPageTypeView();
	setTimeout(function () {
		restoreHeaderFooterSelection();
		restoreMiddleSectionsForCurrentPage();
	}, 800);
});

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

function showCustomAlertBox(type, message) {

	injectCustomAlertCSS();

	const backdrop = $('<div class="custom-alert-backdrop"></div>');
	const popup = $(`
        <div class="custom-alert-popup ${type}">
            <div class="custom-alert-content">
                <div class="custom-alert-message">${message}</div>
                <button class="custom-alert-ok-btn">OK</button>
            </div>
        </div>
    `);

	$('body').append(backdrop).append(popup);

	setTimeout(() => {
		backdrop.addClass('show');
		popup.addClass('show');
		$('body').addClass('custom-alert-open');
	}, 10);

	function closeAlert() {
		backdrop.removeClass('show');
		popup.removeClass('show');
		$('body').removeClass('custom-alert-open');

		setTimeout(() => {
			backdrop.remove();
			popup.remove();
		}, 300);
	}

	popup.find('.custom-alert-ok-btn').on('click', closeAlert);
	backdrop.on('click', closeAlert);
}

// =========================================================

document.addEventListener("DOMContentLoaded", function () {


	let selectedTemplate = null; // holds clicked template name
	let selectedTemplate_ID = null; // holds clicked template id

	// ===== Capture which template was selected =====
	document.addEventListener("click", function (e) {

		if (e.target.classList.contains("use-template-btn")) {

			selectedTemplate = e.target.getAttribute("data-template_name");
			selectedTemplate_ID = e.target.getAttribute("data-template_id");

			// Restore saved values
			$('#clientName').val('');
			$('#projectName').val('');


			$('#clientEmail').val(getCookie('clientEmail') || '');
			$('#clientMobile').val(getCookie('clientMobile') || '');
			$('#clientAddress').val(getCookie('clientAddress') || '');

// Social Media
			$('#facebook').val(getCookie('clientFacebook') || '');
			$('#instagram').val(getCookie('clientInstagram') || '');
			$('#linkedin').val(getCookie('clientLinkedin') || '');
			$('#twitter').val(getCookie('clientTwitter') || '');
			$('#youtube').val(getCookie('clientYoutube') || '');
			// $('#pinterest').val(getCookie('clientPinterest') || '');
			$('#whatsapp').val(getCookie('clientWhatsapp') || '');
			const savedTheme = getCookie(
				"websiteThemeColor"
			);

			if (savedTheme) {

				$("#themePicker").val(savedTheme);

			}
			$('a[href="#tab-theme"]').parent().hide();
			 $('#category_filter_wrapper').hide();
			$('#clientsDetailsModel').modal('show');
		}
	});



	// ===== Client Details Submission =====
	$('#submitclientsDetails').on('click', function () {
	// if (selectedTemplate && selectedTemplate_ID) {
	// 		startCreatingWebsiteProcess();
	// 		return;
	// 	}
		var userPaymentStatusCheck = $("#userPaymentStatusCheck");
		//alert(userPaymentStatusCheck.length);

		if (userPaymentStatusCheck.length) {
			checkUserAndPaymentStatus().then(function (result) {
				if (result) {
					startCreatingWebsiteProcess();
				} else {
					console.log("User OR Payment is not found")
				}
			});
		} else { // For Sales Manager or user role for whom trail website creation is allowed
			startCreatingWebsiteProcess();
		}

	});

	function startCreatingWebsiteProcess() {
		const selectedOption = $('input[name="templateOption"]:checked').val();
		const clientName = $('#clientName').val().trim();
		const projectName = $('#projectName').val().trim();
		const resultDiv = document.getElementById("result1");
		const resultDiv2 = document.getElementById("result2");
		const exportBtn = $('#openIndex');
		const backbutton = $('#backBtn');


		const projectNameRegex = /^[a-z](?:[a-z-]{0,10}[a-z])?$/;

		if (!projectNameRegex.test(projectName)) {
			showCustomAlertBox("error", "Invalid project name. Use 1-10 lowercase letters and dashes only. It cannot start or end with a dash.")
			return; // stop execution
		}

		// Continue if valid
		console.log("Project name is valid");
		backbutton.hide();
		exportBtn.hide();
		function showLoader() {
			document.getElementById("project-loader").classList.add("active");
		}

		function hideLoader() {
			document.getElementById("project-loader").classList.remove("active");
		}



		// ===== Validation =====
		if (!clientName || !projectName) {
			showCustomAlertBox('error', 'Please fill out both fields.');
			console.log("Please fill out both fields.");
			return;
		}




		// to store Additional details of client

		// Category
		// const selectedCategory = window.selectedSubCategory || "";
		let selectedCategory = (window.selectedSubCategory || "").replace(/_/g, " ");

		if (!selectedCategory && window.customCategoryInput) {
			selectedCategory = window.customCategoryInput;
		}




		// Advanced fields
const email = $('#clientEmail').val()?.trim() || "";
const mobile = $('#clientMobile').val()?.trim() || "";
const address = $('#clientAddress').val()?.trim() || "";

// const selectedThemeColor =
//     window.selectedThemeColor ||
//     $("#themePicker").val() ||
//     "#b57b09";
let themeData = generateThemeCSS(selectedThemeColor);

let themeCSS = themeData.css;

if (selectedThemeColor) {
    setCookie("websiteThemeColor", selectedThemeColor, 30);
} else {
    deleteCookie("websiteThemeColor");
}
		const clientDetailsData = {
    // client_details: {
    //     company_name: clientName || "",
    //     phone_number: mobile || "",
    //     address: address || "",
    //     email: email || "",
	// 	client_name_for_wb:clientName || "",
    // 	client_project_name_for_wb:projectName || ""
    // },
    client_details: {
        company_name: clientName || "",
        client_mobile: mobile || "",
        client_address: address || "",
        client_email: email || "",
		client_name_for_wb:clientName || "",
    	client_project_name_for_wb:projectName || ""
    },

    social_media_details: {
        client_facebook: $("#facebook").val()?.trim() || "",
        client_instagram: $("#instagram").val()?.trim() || "",
        client_linkedin: $("#linkedin").val()?.trim() || "",
        client_twitter: $("#twitter").val()?.trim() || "",
        client_youtube: $("#youtube").val()?.trim() || "",
        client_pinterest: $("#pinterest").val()?.trim() || "",
		client_whatsapp: $("#whatsapp").val()?.trim() || ""
    },

	theme_colors_details: {
		primary: themeData.primary,
		secondary: themeData.secondary,
		light: themeData.light,
		bg: themeData.bg,
		border: themeData.border,
		accent: themeData.accent,
		text: themeData.text
	}
	};
		// Files
		// const logoFile = document.getElementById('logoUpload').files[0];
		// const sliderFile = document.getElementById('sliderUpload').files[0];


		// ===== FUNCTION: Convert image to base64 =====
		// function fileToBase64(file) {
		// 	return new Promise((resolve, reject) => {
		// 		if (!file) return resolve("");

		// 		const reader = new FileReader();
		// 		reader.onload = () => resolve(reader.result);
		// 		reader.onerror = error => reject(error);
		// 		reader.readAsDataURL(file);
		// 	});
		// }
		setCookie("selectedCategory", selectedCategory, 7);
		setCookie("clientEmail", email, 7);
		setCookie("clientMobile", mobile, 7);
		setCookie("clientAddress", address, 7);

	setCookie("clientFacebook", $("#facebook").val().trim(), 7);
	setCookie("clientInstagram", $("#instagram").val().trim(), 7);
	setCookie("clientLinkedin", $("#linkedin").val().trim(), 7);
	setCookie("clientTwitter", $("#twitter").val().trim(), 7);
	setCookie("clientYoutube", $("#youtube").val().trim(), 7);
	// setCookie("clientPinterest", $("#pinterest").val().trim(), 7);
	setCookie("clientWhatsapp", $("#whatsapp").val().trim(), 7);
	console.log("Theme being saved:", selectedThemeColor);
	console.log("Cookie:", getCookie("websiteThemeColor"));
		// alert("Theme Css: " + JSON.stringify(themeCSS));
		// setCookie("logoImage", logoBase64, 7);
		// setCookie("sliderImage", sliderBase64, 7);
		// ===== STORE EVERYTHING =====
		// Promise.all([
		// 	fileToBase64(logoFile),
		// 	fileToBase64(sliderFile)
		// ]).then(([logoBase64, sliderBase64]) => {

		// 	// Store in cookies
		// 	setCookie("selectedCategory", selectedCategory, 7);
		// 	setCookie("clientEmail", email, 7);
		// 	setCookie("clientMobile", mobile, 7);
		// 	setCookie("clientAddress", address, 7);
		// 	setCookie("logoImage", logoBase64, 7);
		// 	setCookie("sliderImage", sliderBase64, 7);

		// 	console.log("All data stored successfully");

		// }).catch(err => {
		// 	console.error("File conversion error:", err);
		// });

		// -------------------------------------------------

		// ===== Set Cookies =====
		setCookie("clientName", clientName, 7);
		setCookie("projectName", projectName, 7);
		setCookie("template_name", selectedTemplate, 7);
		setCookie("template_ID", selectedTemplate_ID, 7);
		setCookie("templateMode", selectedOption, 7);  // to save mode on reload


		// ===== Hide Modal & UI Adjustments =====
		$('#clientsDetailsModel').modal('hide');
		$('#createWebsite').hide();
		$('.form-group.text-center').hide();

		// ===== Display client/project info =====
		$('.client_Name').text(clientName);
		$('.project_Name').text(projectName);
		$('#clientDetailsDisplay').show();
		$('#deleteCurrentProject').show();
		$('#page-type-section').show();

		// Automatically open the accordion and select header
		$("#page-type-section .accordion-header").trigger("click");
		$('.pages-for[value="header"]').prop('checked', true).trigger('click');
		$('.Template-selector-container').hide();

		// ===== Show/hide sections based on option =====
		if (selectedOption === 'existing') {
			$('#templates').show();
			$('#wrapper').hide();
			$('#page-type-section').hide();
		} else {
			$('#wrapper').show();
			$('#templates').hide();
		}

		// ===== Overlay handling =====
		if (typeof $overlay !== "undefined") {
			$overlay.hide();
			$('#overlayStatus').val('disabled');
			$wrapper.css('pointer-events', 'auto');
			$('#headerMenuActionButtons').show();
		}
		//show hide preview and back button
		// showActionButtons(selectedOption);

		// ===== Handle Template Cloning (Existing) =====
		if (selectedOption === 'existing') {
			if (CURRENT_MODE !== "customize" && !selectedTemplate) {
				showCustomAlert("Please select a template first.");
				return;
			}

			// resultDiv.innerHTML = "Building your website....just a moment.";

			resultDiv.innerHTML = `
					<div class="publish-status-box">
						<h3>Generating ...</h3>
						<div class="info-box">
						You don't need to wait here. Check your work in the
						<a href="{% url 'website_management' %}" target="_blank">Website Management</a> after 5 minutes.
						</div>
					</div>
					`;

			showLoader();
			setCookie("websiteBuildCompleted", "false", 7);

			// alert(JSON.stringify(clientDetailsData, null, 4));
				console.log(clientDetailsData);

			fetch("/clone_template/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					template_name: selectedTemplate,
					template_id: selectedTemplate_ID,
					client_name: clientName,
					client_project_name: projectName,
					theme_css: themeCSS,
					client_data: clientDetailsData,

				}),
			})
				.then((response) => response.json())
				.then((data) => {

					if (data.status === 202 && data.task_id) {

						const taskId = data.task_id;

						// resultDiv2.innerHTML = `<p><strong>${data.message || "Building started..."}</strong></p>`;

						// Optional: show launch/back button immediately
						backbutton.show();
						$('#launchBtn').show();
						$("#clientProjectdetail").modal("hide");


						const interval = setInterval(() => {


							fetch(`/task_status/${taskId}/`)
								.then(res => res.json())
								.then(statusData => {

									if (statusData.state === "SUCCESS") {

										clearInterval(interval);
										hideLoader();

										const result = statusData.data;
										setCookie("websiteBuildCompleted", "true", 7);
										// resultDiv2.innerHTML = `
										// 	<p style="color:green;">
										// 		<strong>${result.message}</strong>
										// 	</p>
										// 	<p>Site URL: ${result.site_url}</p>
										// `;
										showSuccessAlertModal(
											result.message || "Website Published Successfully!",
											result.site_url
										);
										$("#successAlertWrapper #launchBtn").show();
										console.log("Received site_url:", result.site_url);

										if (result.site_url) {
											exportBtn
												.off("click")
												.on("click", function () {
													window.open(result.site_url, "_blank");
												})
												.show();
										}


									}

									if (statusData.state === "FAILURE") {
										setCookie("websiteBuildCompleted", "false", 7);
										clearInterval(interval);
										hideLoader();

										resultDiv2.innerHTML = `
													<p style="color:red;">
														Website creation failed.
													</p>
												`;

										exportBtn.hide();
									}

								})
								.catch((error) => {
									clearInterval(interval);
									hideLoader();
									console.error("Polling failed:", error);
									resultDiv2.innerHTML = `
												<p style="color:red;">
													Error checking task status.
												</p>
											`;
								});


						}, 4000);

					} else {
						hideLoader();
						resultDiv2.innerHTML = `<p style="color:red;">Error: ${data.message}</p>`;
						exportBtn.hide();
						backbutton.show();
					}
				})

		} else {
			hideLoader();
			console.log("Customize page selected");
		}
	}
});

$('#launchBtn').on('click', function () {
	$('#launchSiteModal').modal('show');
	$('#client_check').show();
});

$('#checkBtn').on('click', function () {

	const email = $('#client_email').val().trim();
	const phone_number = $('#phone_number').val().trim();

	$.ajax({
		url: "/check_user_and_payment/",
		type: "POST",
		data: { email, phone_number },
		success: function (response) {
			console.log(response);

			// Hide both action buttons first
			$("#launchProject").hide();
			$("#checkoutBtn").hide();

			let msg = "";

			// 1ï¸ User + Payment found
			if (response.status === 200) {
				msg = "User and payment found!";
				$("#launchProject").show();

				// Set launch action dynamically
				$("#launchProject").off().on("click", function () {
					launch(response.user_id, response.client_payment_id);
					$("#launchProject").hide();
				});
			}

			// 2ï¸ User exists BUT payment NOT found
			else if (response.status === 204) {
				msg = "User exists, but no payment found. Please continue with checkout.";
				$("#checkoutBtn").show();

				$("#checkoutBtn").off().on("click", function () {
					const user_id = response.user_id;
					const template_id = getCookie("template_ID");

					if (!template_id || template_id === "null" || template_id === "undefined") {
						$("#modalMessage").text("You haven't selected the template").show();
						return;
					}

					if (!user_id || user_id === "null" || user_id === "undefined") {
						$("#modalMessage").text("Client not Found Please Try again").show();
						return;
					}


					// Create a form dynamically
					const form = document.createElement("form");
					form.method = "POST";
					form.action = "/checkout/";
					form.target = "_blank";

					// Add user_id
					const userInput = document.createElement("input");
					userInput.type = "hidden";
					userInput.name = "user_id";
					userInput.value = user_id;
					form.appendChild(userInput);

					// Add template_id
					const templateInput = document.createElement("input");
					templateInput.type = "hidden";
					templateInput.name = "template_id";
					templateInput.value = template_id;
					form.appendChild(templateInput);

					document.body.appendChild(form);
					form.submit();
					document.body.removeChild(form);
					$("#checkoutBtn").hide();
				});

			}

			// 3ï¸ User does NOT exist
			else if (response.status === 404) {
				msg = "User not found! Please complete checkout.";
				$("#checkoutBtn").show();

				$("#checkoutBtn").off().on("click", function () {
					const template_id = getCookie("template_ID");
					if (!template_id || template_id === "null" || template_id === "undefined") {
						$("#modalMessage").text("You haven't selected the template").show();
						return;
					}

					// Create a form dynamically
					const form = document.createElement("form");
					form.method = "POST";
					form.action = "/checkout/";
					form.target = "_blank";

					// Add template_id
					const templateInput = document.createElement("input");
					templateInput.type = "hidden";
					templateInput.name = "template_id";
					templateInput.value = template_id;
					form.appendChild(templateInput);

					document.body.appendChild(form);
					form.submit();
					document.body.removeChild(form);
					$("#checkoutBtn").hide();
				});
			}

			// Show message inside modal
			$("#modalMessage")
				.removeClass("alert-info alert-danger alert-warning alert-success")
				.addClass(response.status === 200 ? "alert-success" : "alert-danger")
				.text(msg)
				.show();
			// $("#modalMessage").text(msg).show();
			// setTimeout(function () {
			// 	$("#modalMessage").fadeOut();
			// }, 5000);
		},

		error: function () {
			$("#modalMessage")
				.removeClass("alert-info alert-success alert-warning")
				.addClass("alert-danger")
				.text("Something went wrong!")
				.show();

			// setTimeout(function () {
			// 	$("#modalMessage").fadeOut();
			// }, 3000);
		}
	});

});
$(document).on('click', '#previewWebsiteBtn', function () {
	if (window.lastPublishedSiteURL) {
		window.open(window.lastPublishedSiteURL, '_blank');
	}
});

function showSuccessAlertModal(message, siteUrl) {

	// cleanup if already exists
	const existing = document.getElementById('successAlertWrapper');
	if (existing) existing.remove();

	const modalHtml = `
        <div class="success-alert-backdrop" id="successAlertWrapper">
            <div class="success-alert-modal">
                <div class="modal-content text-center">
                    <div class="modal-body">
                        <div class="success-crackers">
                            <img src="assets/images/custom/success_crackers.gif" alt="Success Celebration">
                        </div>

                        <h4>${message}</h4>
                        <p>Your website is live and ready to preview.</p>
						<div style="display:flex; gap:30px;justify-content: center;">
							<button class="btn success-preview-btn" id="launchBtn" style="display:none;">
								Launch to Live Server
							</button>
							<button class="btn success-preview-btn" id="previewWebsiteBtn">
								Preview Website
							</button>
						</div>

                    </div>
                </div>
            </div>
        </div>
    `;

	document.body.insertAdjacentHTML('beforeend', modalHtml);

	window.lastPublishedSiteURL = siteUrl;

	// animate in
	requestAnimationFrame(() => {
		document.getElementById('successAlertWrapper').classList.add('active');
	});

	// preview button
	document.getElementById('previewWebsiteBtn').onclick = function () {
		if (window.lastPublishedSiteURL) {
			window.open(window.lastPublishedSiteURL, '_blank');
		}
		closeSuccessAlertModal();
	};

	// close on backdrop click
	document.getElementById('successAlertWrapper').addEventListener('click', function (e) {
		if (e.target === this) closeSuccessAlertModal();
	});
}

function closeSuccessAlertModal() {
	const wrapper = document.getElementById('successAlertWrapper');
	if (!wrapper) return;

	wrapper.classList.remove('active');
	setTimeout(() => wrapper.remove(), 350);
}



//launch website on production
window.launch = function (client_id = null, payment_id = null) {

	$('#launchSiteModal').modal('hide');
	$('#client_check').hide();

	const client_name = getCookie("clientName");
	const project_name = getCookie("projectName");
	const resultDiv = document.getElementById("result1");
	const resultDiv2 = document.getElementById("result2");
	const template_name = getCookie('template_name');
	const template_id = getCookie('template_ID');
	const exportBtn = $('#openIndex');


	function showLoader() {
		document.getElementById("project-loader").classList.add("active");
	}

	function hideLoader() {
		document.getElementById("project-loader").classList.remove("active");
	}

	resultDiv.textContent = "Launching Your website Please wait...";

	if (!client_name || !project_name) {
		resultDiv2.textContent = "Please enter a client and project name.";
		return;
	}

	showLoader();

	fetch("/clone_template/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			launch: true,
			client_id: client_id,
			payment_id: payment_id,
			client_name: client_name,
			client_project_name: project_name,
			template_name: template_name,
			template_id: template_id,
		}),
	})
		.then((res) => res.json())
		.then((data) => {
				alert("data.status: " + data.status);
				alert("data.task_id: " + data.task_id);
			if (data.status === 202 && data.task_id) {

				const taskId = data.task_id;

				//resultDiv2.textContent = "Deployment started... Please wait.";

				// Start polling
				const interval = setInterval(() => {

					fetch(`/task_status/${taskId}/`)
						.then(res => res.json())
						.then(statusData => {

							if (statusData.state === "SUCCESS") {
								clearInterval(interval);
								hideLoader();

								const result = statusData.data;

								showSuccessAlertModal(
									result.message || "Website Published Successfully!",
									result.site_url
								);

								$('#launchBtn').hide();

								//resultDiv2.innerHTML = `Site URL: ${result.site_url}`;
								exportBtn
									.off("click") // remove any previous click handlers
									.on("click", function () {
										window.open(result.site_url, "_blank");
									})
								sessionStorage.setItem("lastUploadSiteURL", result.site_url);
								clearAllCookies();
							}

							if (statusData.state === "FAILURE") {
								clearInterval(interval);
								hideLoader();
								resultDiv2.textContent = "Deployment failed.";
							}

						})
						.catch((err) => {
							clearInterval(interval);
							hideLoader();
							resultDiv2.textContent = "Error checking task status.";
						});

				}, 4000); // Poll every 4 seconds

			} else {
				hideLoader();
				resultDiv2.innerHTML = data.message || "Something went wrong.";
			}
		})
		.catch((err) => {
			hideLoader();
			resultDiv2.textContent = `Error: ${err.message}`;
		});
};





// Global variables to store current user/payment info
let currentUserId = null;
let currentPaymentId = null;
let currentUserStatus = null;

// Check button click
$('#checkBtn_from_custom_template').on('click', function () {
	checkUserAndPaymentStatus();
});

function checkUserAndPaymentStatus() {

	const email = $('#client_email_from_custom_template').val().trim();
	const phone_number = $('#phone_number_from_custom_template').val().trim();

	return $.ajax({
		url: "/check_user_and_payment/",
		type: "POST",
		data: { email, phone_number }
	})
		.then(function (response) {
			console.log(response);

			$("#publishBtn").hide();
			$("#checkoutBtn_from_custom_template").hide();

			currentUserId = response.user_id || null;
			currentPaymentId = response.client_payment_id || null;
			currentUserStatus = response.status;

			let msg = "";
			if (response.status === 200) {
				msg = "Client exists and found successful payment transaction for this client!";
				$("#publishBtn").show();
			} else if (response.status === 204) {
				msg = "Client exists but user didn't make the payment so far. Please request client to make the payment first.";
				$("#checkoutBtn_from_custom_template").show();
			} else if (response.status === 404) {
				msg = "Client doesn't exist. Please subscribe the package on pricing page and proceed.";
				$("#checkoutBtn_from_custom_template").show();
			}

			$("#modalMessage_from_custom_template")
				.removeClass("alert-info alert-danger alert-warning alert-success")
				.addClass(response.status === 200 ? "alert-success" : "alert-danger")
				.text(msg)
				.show();

			return response.status === 200;  // success
		})
		.catch(function () {
			$("#modalMessage_from_custom_template")
				.removeClass("alert-info alert-success alert-warning")
				.addClass("alert-danger")
				.text("Something went wrong!")
				.show();

			return false;  // error
		});
}


function openGenerateSeoPublishModal(publishFunction) {

    window.pendingPublishFunction = publishFunction;

    if (seoDataCapture === "Yes" && Object.keys(seoGeneratedData).length) {

        window.seoGenerated = true;

        $('input[name="generateSeoBeforePublish"][value="yes"]')
            .prop("checked", true);

        $('input[name="generateSeoBeforePublish"][value="no"]')
            .prop("checked", false);

        $(".seo-publish-radio").removeClass("active");

        $('input[name="generateSeoBeforePublish"][value="yes"]')
            .closest(".seo-publish-radio")
            .addClass("active");

        $("#seoPublishForm")
            .stop(true, true)
            .show();

        prefillSeoPublishForm();

    } else {

        window.seoGenerated = false;

        $('input[name="generateSeoBeforePublish"][value="no"]')
            .prop("checked", true);

        $('input[name="generateSeoBeforePublish"][value="yes"]')
            .prop("checked", false);

        $(".seo-publish-radio").removeClass("active");

        $('input[name="generateSeoBeforePublish"][value="no"]')
            .closest(".seo-publish-radio")
            .addClass("active");

        $("#seoPublishForm")
            .stop(true, true)
            .hide();
    }

    const modal = $("#generateSeoPublishModal");

    if (!modal.length) {
        console.error("Generate SEO modal not found");
        return;
    }

    modal.appendTo("body");

    modal.modal({
        backdrop: "static",
        keyboard: false,
        show: true
    });
}
$(document).on("click", "#publishClienthWebsite", function (e) {

    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId || !currentPaymentId) {

        showCustomAlertBox(
            "error",
            "Client payment information is not available."
        );

        return;
    }

    openGenerateSeoPublishModal(function () {

        publishWebsite(
            currentUserId,
            currentPaymentId
        );

        $("#publishBtn").hide();
    });

});


$(document).on("click", "#publishBtnSales", function (e) {

    e.preventDefault();
    e.stopPropagation();

    openGenerateSeoPublishModal(function () {

        publishWebsite(
            currentUserId
        );

    });

});
// Checkout button click (bind once)
$("#checkoutBtn_from_custom_template").on("click", function () {
	const client_name = getCookie("clientName");
	const project_name = getCookie("projectName");

	if (!client_name) {
		$("#modalMessage").text("Please Enter Client Name").show();
		return;
	}
	if (!project_name) {
		$("#modalMessage").text("Please Enter Project Name").show();
		return;
	}

	// create dynamic form
	const form = document.createElement("form");
	form.method = "POST";
	form.action = "/checkout_customize_template/";
	form.target = "_blank";

	if (currentUserId) {

		const userInput = document.createElement("input");
		userInput.type = "hidden";
		userInput.name = "user_id";
		userInput.value = currentUserId;
		form.appendChild(userInput);
	}

	const clientInput = document.createElement("input");
	clientInput.type = "hidden";
	clientInput.name = "client_name";
	clientInput.value = client_name;
	form.appendChild(clientInput);

	const projectInput = document.createElement("input");
	projectInput.type = "hidden";
	projectInput.name = "project_name";
	projectInput.value = project_name;
	form.appendChild(projectInput);

	document.body.appendChild(form);
	form.submit();
	document.body.removeChild(form);

	$("#checkoutBtn_from_custom_template").hide();
});


window.publishWebsite = function (client_id, payment_id) {
	// alert("payment_id----"+ payment_id);
	// if(payment_id!="") {

	// 	$('#PublishSiteModal').modal('hide');
	// 	$('#client_check_from_custom_template').hide();
	// }

	const client_name = getCookie("clientName");
	const project_name = getCookie("projectName");
	const resultDiv2 = document.getElementById("result2");
	const resultDiv = document.getElementById("result1");

	function showLoader() {
		document.getElementById("project-loader").classList.add("active");
	}

	function hideLoader() {
		document.getElementById("project-loader").classList.remove("active");
	}
	// Show spinner
	resultDiv.textContent = "Launching Your website Please wait...";


	if (!client_name || !project_name) {
		resultDiv2.textContent = "Please enter a client and project name.";
		return;
	}
	showLoader();

	fetch("/create_website/", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},

		body: new URLSearchParams({
			client_name: client_name,
			project_name: project_name,
			client_id: client_id,
			client_payment_id: payment_id
		}),
	})
		// .then((res) => res.json())
		// .then((data) => {

		// 	if (data.status === 202 && data.result) {
		// 		hideLoader();
		// 		//  Show success message
		// 		// resultDiv2.innerHTML = `${data.result} <br/> Site URL: ${data.site_url}`;
		// 		// console.log('result' + data.result)
		// 		// console.log(data.site_url)
		// 		//  Clear cookies
		// 		// clearAllCookies();

		// 		// //  Save response in sessionStorage for showing after reload
		// 		// sessionStorage.setItem("lastUploadResult", JSON.stringify({
		// 		// 	client_name,
		// 		// 	project_name,
		// 		// 	site_url: data.site_url,
		// 		// 	result: data.result
		// 		// }));
		// 		//pop up  dada.site url
		// 			showSuccessAlertModal(
		// 				data.message,
		// 				data.site_url
		// 			);

		// 		//  Reload the page after short delay to show updated session message
		// 		setTimeout(() => {
		// 			location.reload();
		// 		}, 2000);

		// 	} else {
		// 		hideLoader();
		// 		//  Show failure message
		// 		resultDiv2.innerHTML = `something went wrong !`;
		// 		console.log('data.error_message: ' + data.error)
		// 	}
		// })
		.then((res) => res.json())
		.then((data) => {
			if (data.status === 202 && data.task_id) {
				const taskId = data.task_id;

				resultDiv2.textContent = "Deployment started! Your site will be ready shortly.";

				const interval = setInterval(() => {


					fetch(`/task_status/${taskId}/`)
						.then(res => res.json())
						.then(statusData => {

							if (statusData.state === "SUCCESS") {
								clearInterval(interval);
								hideLoader();
								clearAllCookies();
								$('#PublishSiteModal').modal('hide');
								const result = statusData.data;

								resultDiv2.innerHTML = `
											<p style="color:green;">
												<strong>${result.message}</strong>
											</p>
											<p>Site URL: ${result.site_url}</p>
										`;

								sessionStorage.setItem("lastUploadResult", JSON.stringify({
									client_name,
									project_name,
									site_url: result.site_url,

								}));

								showSuccessAlertModal(
									result.message || "Website Published Successfully!",
									result.site_url
								);
								setTimeout(() => {
									location.reload();
								}, 3000);

							}

							if (statusData.state === "FAILURE") {
								// clearInterval(interval);
								clearInterval(interval);
								hideLoader();

								resultDiv2.innerHTML = `
											<p style="color:red;">
												Deployment failed.
											</p>
										`;
							}

						})
						.catch((err) => {
							// clearInterval(interval);
							clearInterval(interval);
							hideLoader();
							resultDiv2.textContent = "Error checking task status.";
						});

				}, 4000); // poll every 4 seconds

			} else {

				$('#client_check_from_custom_template').show();
				$("#modalMessage_from_custom_template").textContent = "Foudn Error";
				hideLoader();
				resultDiv2.textContent = "Something went wrong!";
				console.log('Error from server:', data.error || data);
			}
		})
		.catch((err) => {
			$('#client_check_from_custom_template').show();
			$("#modalMessage_from_custom_template").textContent = "Foudn Error";
			hideLoader();
			resultDiv2.innerHTML = "Something went wrong!";
		});

}





//  On page load, show last upload info if available
window.addEventListener("load", function () {
	const resultDiv2 = document.getElementById("result2");
	const exportBtn = $('#export-btn');
	const backbutton = $('#backBtn'); const lastUpload = sessionStorage.getItem("lastUploadResult");
	if (lastUpload) {
		const data = JSON.parse(lastUpload);

		if (data.site_url) {
			exportBtn
				.off("click") // remove any previous click handlers
				.on("click", function () {
					window.open(data.site_url, "_blank");
				})
				.show(); // show the preview button
			backbutton.show();

		} else {
			exportBtn.hide(); // hide if no URL available
			backbutton.hide();
		}
		// Optionally, clear it after showing once:
		sessionStorage.removeItem("lastUploadResult");
	}
});


//  Helper: clear all cookies
function clearAllCookies() {
	const cookies = document.cookie.split("; ");
	for (const cookie of cookies) {
		const eqPos = cookie.indexOf("=");
		const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
		document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
	}
}


function deleteRepo(id) {
	projectID = sessionStorage.getItem('projectID')
	console.log('projectID: ' + projectID)
	$.ajax({
		url: `/delete_repo/${id}`,
		method: 'POST',
		data: {},
		success: function (res) {
			if (res.status == 'success') {
				// alert('Successfully deleted.')
				Swal.fire({
					title: "Successfully deleted.",
					icon: "success",
					draggable: false
				});

			} else {
				// alert('Something went wrong...')
				Swal.fire({
					icon: "error",
					title: "Oops...",
					text: "Something went wrong!",
				});
			}
		},
		error: function (xhr) {
			// alert("Error checking status: " + xhr.responseText);
			Swal.fire({
				icon: "error",
				title: "Oops...",
				text: "Something went wrong!",
			});

		}
	});
}


$('#PublishSiteModal').on('hidden.bs.modal', function () {
	// Hide and clear message
	$('#modalMessage_from_custom_template')
		.hide()
		.text('');
	$("#publishBtn").hide();
	$("#checkoutBtn_from_custom_template").hide();

	// Clear input fields
	$('#client_email_from_custom_template').val('');
	$('#phone_number_from_custom_template').val('');
});

$('#launchSiteModal').on('hidden.bs.modal', function () {
	// Hide and clear message
	$('#modalMessage')
		.hide()
		.text('');
	$("#checkoutBtn").hide();
	$("#launchProject").hide();
	// Clear input fields
	$('#client_email').val('');
	$('#phone_number').val('');
});





$(document).ready(function () {

	const menu = $("#tgCategoryDropdownMenu");
	const selected = $(".tg-selected-category");

	categories.forEach(function (cat, index) {

		// MAIN CATEGORY
		const mainItem = $(`
            <li>
                <div class="tg-main-category" data-index="${index}">
					<span>
					<i class="${cat.icon}" style="margin-right:10px;"></i>
					${cat.title.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
				   </span>
                    ${cat.sub.length ? '<i class="ri-arrow-right-s-line tg-arrow"></i>' : ''}
                </div>
            </li>
        `);

		menu.append(mainItem);

		// SUBCATEGORIES
		if (cat.sub.length > 0) {

			const subList = $('<li class="tg-sub-list"></li>');

			cat.sub.forEach(function (sub) {
				subList.append(`
					<div class="tg-sub-item" data-filter="${sub}">
						${sub.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
					</div>
                `);
			});

			menu.append(subList);
		}
	});

	// COLLAPSE / EXPAND MAIN CATEGORY
	$(document).on("click", ".tg-main-category", function (e) {

		const currentSub = $(this).parent().next(".tg-sub-list");
		$(".tg-sub-list").not(currentSub).slideUp();
		$(".tg-arrow").not($(this).find(".tg-arrow")).removeClass("tg-rotate");

		currentSub.slideToggle(200);
		$(this).find(".tg-arrow").toggleClass("tg-rotate");

		if ($(this).text().trim() === "All") {
			$(".template-item").fadeIn();
			selected.html('<i class="ri-grid-fill" style="margin-right:8px;"></i>All');
		}
	});

	$(document).on("click", ".tg-sub-item", function (e) {

		e.stopPropagation();

		const filter = $(this).data("filter");

		$(".template-item").hide();

		const matchedItems = $(`.template-item[data-subcategory="${filter}"]`);

		if (matchedItems.length > 0) {
			matchedItems.fadeIn();
			$(".no-template-message").hide();
		} else {
			$(".no-template-message").fadeIn();
		}

		selected.text(filter);
	});
	$(document).on('click', '#tgCategoryDropdownMenu', function (e) {
		e.stopPropagation();
	});


});



// page to stay on the same page on refresh or if we chnage the tab
document.addEventListener("DOMContentLoaded", function () {

	const clientName = getCookie("clientName");
	const projectName = getCookie("projectName");
	let templateMode = getCookie("templateMode");
	if (!templateMode) templateMode = "customize";
	if (clientName && projectName) {

		$('.client_Name').text(clientName);
		$('.project_Name').text(projectName);

		$('#clientDetailsDisplay').show();
		$('#deleteCurrentProject').show();
		$('.Template-selector-container').hide();

		if (templateMode === "existing") {

			const buildCompleted = getCookie("websiteBuildCompleted");

			if (buildCompleted === "true") {

				$('#templates').show();
				$('#wrapper').hide();
				$('#page-type-section').hide();

				$('#launchBtn').show();
				$('#backBtn').show();

			} else {

				// Show default page
				$('#clientDetailsDisplay').hide();
				$('#launchBtn').hide();
				$('#backBtn').hide();

				$('#page-type-section').hide();

				$('.Template-selector-container').show();

				$('#templates').show();
				$('#wrapper').hide();
			}
		}
		else {

			$('#wrapper').show();
			$('#templates').hide();
			$('#page-type-section').show();

			$("#page-type-section .accordion-header").trigger("click");

			//  restore header/footer selection
			const savedHeader = getCookie(GLOBAL_HEADER_COOKIE);
			const savedFooter = getCookie(GLOBAL_FOOTER_COOKIE);

			if (savedHeader) {
				CURRENT_MODE = 'header';
				$('.pages-for[value="header"]')
					.prop('checked', true)
					.trigger('click');
			}
			else if (savedFooter) {
				CURRENT_MODE = 'footer';
				$('.pages-for[value="footer"]')
					.prop('checked', true)
					.trigger('click');
			}

			//  load correct UI
			setTimeout(() => {

				if (CURRENT_MODE) {
					applyPageTypeView();
					ChoosePagesForHeaderFooter(CURRENT_MODE);
				}

			}, 300);
		}
	}
});



// to push middle section data
document.addEventListener("DOMContentLoaded", function () {

	let data = [];

	document.querySelectorAll(".middle_sections_container .component").forEach(el => {
		data.push({
			id: el.id,
			template: el.getAttribute("data-template"),
			category: el.getAttribute("category"),
			subsection: el.getAttribute("subsection")
		});
	});

	// console.log("MIDDLE SECTIONS DATA:", data);

	// alert(JSON.stringify(data, null, 2));

});






(function () {
	function showMiddleHTML(source) {
		const container = document.querySelector(".middle_sections_container");

		if (!container) {
			alert("Middle container not found");
			return;
		}

		const rawHTML = container.innerHTML;

		// console.log("MIDDLE HTML---------- (" + source + "):\n", rawHTML);
		// alert("MIDDLE HTML (" + source + "):\n\n" + rawHTML);
	}

	document.addEventListener("DOMContentLoaded", function () {
		showMiddleHTML("ON LOAD");
	});

	$(document).ajaxComplete(function () {
		setTimeout(function () {
			showMiddleHTML("AFTER AJAX");
		}, 300);
	});

})();






//  modal Advanced details Communication Details and Visualization
$(document).ready(function () {
	$('.website-info-section-title').on('click', function () {
		var target = $($(this).data('target'));
		if (target.hasClass('in')) {
			return;
		}
		$('.collapse.in').collapse('hide');
		target.collapse('show');
	});
	$('.collapse').on('show.bs.collapse', function () {
		$(this).prev('.website-info-section-title').find('.collapse-arrow')
			.removeClass('ri-arrow-down-s-line')
			.addClass('ri-arrow-up-s-line');
	});

	$('.collapse').on('hide.bs.collapse', function () {
		$(this).prev('.website-info-section-title').find('.collapse-arrow')
			.removeClass('ri-arrow-up-s-line')
			.addClass('ri-arrow-down-s-line');
	});
});




// Clients details modal category driopdown
$(document).ready(function () {

	loadModalCategoryDropdown();

	const dropdown = $('#modal-category-filter');
	const button = $('#modalDropdownBtn');

	button.on('click', function (e) {
		e.preventDefault();
		e.stopPropagation();

		dropdown.toggleClass('open');
	});

	$(document).on('click', function (e) {
		if (!$(e.target).closest('#modal-category-filter').length) {
			dropdown.removeClass('open');
		}
	});

});


function loadModalCategoryDropdown() {

	const menu = $("#modalCategoryDropdownMenu");
	menu.empty();

	categories.forEach(function (cat, index) {

		if (cat.title && cat.title.toLowerCase() === "all") return;

		const mainItem = $(`
            <li>
                <div class="tg-main-category" data-index="${index}">
                    <span>
                        <i class="${cat.icon}" style="margin-right:10px;"></i>
                        ${cat.title.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                    ${cat.sub.length ? '<i class="ri-arrow-right-s-line tg-arrow"></i>' : ''}
                </div>
            </li>
        `);

		menu.append(mainItem);

		if (cat.sub && cat.sub.length > 0) {

			const subList = $('<li class="tg-sub-list"></li>');

			cat.sub.forEach(function (sub) {
				subList.append(`
                    <div class="tg-sub-item" data-value="${sub}">
                        ${sub.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </div>
                `);
			});

			menu.append(subList);
		}
	});
}



// MAIN CATEGORY
$(document).on("click", "#modalCategoryDropdownMenu .tg-main-category", function (e) {
	e.preventDefault();
	e.stopImmediatePropagation();

	const currentSub = $(this).parent().next(".tg-sub-list");

	$("#modalCategoryDropdownMenu .tg-sub-list")
		.not(currentSub)
		.stop(true, true)
		.slideUp();

	$("#modalCategoryDropdownMenu .tg-arrow")
		.not($(this).find(".tg-arrow"))
		.removeClass("tg-rotate");

	currentSub.stop(true, true).slideToggle(200);
	$(this).find(".tg-arrow").toggleClass("tg-rotate");
});


// SUB CATEGORY
$(document).on("click", "#modalCategoryDropdownMenu .tg-sub-item", function (e) {
	e.preventDefault();
	e.stopImmediatePropagation();

	const value = $(this).data("value");

	$("#modalSelectedCategory").text(
		value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
	);

	window.selectedSubCategory = value;

	console.log("Selected:", value);

	$('#modal-category-filter').removeClass('open');
});
$(document).on('click', '#modal-category-filter', function (e) {
	e.stopPropagation();
});

$('#modalDropdownBtn').on('click', function () {

	const dropdown = $('#modalCategoryDropdownMenu');

	if ($('#categorySearchInput').length === 0) {

		const searchBox = `
<li class="px-3 pb-2">
    <div class="position-relative">
        <i class="fa fa-search search-icon"></i>
        <input type="text"
               id="categorySearchInput"
               class="form-control search-input"
               placeholder="Search subcategory...">
    </div>
</li>
        `;

		dropdown.prepend(searchBox);
	}
});
$(document).on('keyup', '#categorySearchInput', function () {

	const value = $(this).val().toLowerCase().trim();
	let matchFound = false;

	$('.tg-sub-item').each(function () {
		const text = $(this).text().toLowerCase();

		if (text.includes(value)) {
			$(this).show();
			$(this).closest('.tg-sub-list').show();
			matchFound = true;
		} else {
			$(this).hide();
		}
	});

	$('.tg-main-category').each(function () {
		const subList = $(this).next('.tg-sub-list');

		if (subList.find('.tg-sub-item:visible').length === 0) {
			$(this).hide();
		} else {
			$(this).show();
		}
	});

	$('#customCategoryOption').remove();

	if (!matchFound && value !== "") {

		const customOption = `
            <li id="customCategoryOption" class="px-3 py-2" style="cursor:pointer; color:#ff7a00;">
                Use "<strong>${value}</strong>"
            </li>
        `;

		$('#modalCategoryDropdownMenu').append(customOption);

		window.customCategoryInput = value;

	} else {
		window.customCategoryInput = "";
	}
});
$(document).on('click', '#customCategoryOption', function () {

	const value = window.customCategoryInput;

	if (!value) return;

	window.selectedSubCategory = value;

	$('#modalSelectedCategory').html(`
        <i class="ri-grid-fill" style="margin-right:8px;"></i>
        ${value}
    `);

	$('#modal-category-filter').removeClass('open');
});
$('#modalDropdownBtn').on('click', function () {
	setTimeout(() => {
		$('#categorySearchInput').val('');
		$('.tg-sub-item').show();
		$('.tg-main-category').show();
	}, 100);
});

// const logo = localStorage.getItem("logoImage");
// console.log(logo);

// const img = document.createElement("img");
// img.src = logo;
// img.style.width = "150px";
// document.body.appendChild(img);









// generate logo using pollination


const POLLINATIONS_AI_KY = "";

let currentLogoUrl = "";

$("#showUploadLogo").click(function () {

	$(this).addClass("active");

	$("#showGenerateLogo")
		.removeClass("active");

	$("#uploadLogoSection")
		.show();

	$("#generateLogoSection")
		.hide();
});

$("#showGenerateLogo").click(function () {

	$(this).addClass("active");

	$("#showUploadLogo")
		.removeClass("active");

	$("#uploadLogoSection")
		.hide();

	$("#generateLogoSection")
		.show();
});

function generateLogo() {

	const category =
		$("#companyCategory")
			.val()
			.trim();

	const description =
		$("#companyDescription")
			.val()
			.trim();

	const btn =
		$("#createLogoBtn");

	btn.prop("disabled", true)
		.text("Generating...");

	const prompt = `
professional minimalist logo symbol,
modern startup brand mark,
premium vector icon,
flat geometric design,
creative negative space symbol,
clean abstract logo,
luxury branding,
high quality dribbble style,
behance featured branding,
simple modern icon,
orange and black color palette,

transparent background,
PNG transparent logo,
isolated symbol,
no background,
alpha background,


create a symbol that visually represents:
Business Category: ${category}

Company Description:
${description}

Important Instructions:
- generate ONLY logo symbol
- NO text
- NO typography
- NO letters
- NO words
- no mockup
- no business card
- no background objects
- centered symbol only
- create meaningful icon related to company niche
- modern startup branding style
- scalable vector style
`;

	const imageUrl =
		"https://image.pollinations.ai/prompt/" +
		encodeURIComponent(prompt) +
		"?width=1024" +
		"&height=1024" +
		"&model=sdxl" +
		"&enhance=true" +
		"&nologo=true" +
		"&transparent=true" +
		"&background=transparent" +
		"&format=png" +
		"&apikey=" +
		POLLINATIONS_AI_KY +
		"&seed=" +
		Date.now();

	currentLogoUrl =
		imageUrl;

	const img =
		document.getElementById(
			"generatedLogoPreview"
		);

	img.onload =
		function () {

			btn.prop("disabled", true)
				.text("Logo Generated");

			$("#logoPreviewWrapper")
				.fadeIn();
		};

	img.onerror =
		function () {

			btn.prop("disabled", false)
				.text("Generate Logo");

			alert(
				"Failed to generate logo"
			);
		};

	img.src =
		imageUrl;
}

$("#createLogoBtn").click(function () {

	generateLogo();
});

$("#downloadLogoBtn").on(
	"click",
	async function () {

		if (!currentLogoUrl) {

			alert(
				"Generate logo first"
			);

			return;
		}

		try {

			const response =
				await fetch(
					currentLogoUrl
				);

			const blob =
				await response.blob();

			const url =
				URL.createObjectURL(
					blob
				);

			const a =
				document.createElement(
					"a"
				);

			a.href =
				url;

			a.download =
				"logo.png";

			document.body
				.appendChild(a);

			a.click();

			a.remove();

			URL.revokeObjectURL(
				url
			);

		} catch (err) {

			console.log(err);

			alert(
				"Download failed"
			);
		}
	}
);
$("#logoUpload").on(
	"change",
	function (e) {

		const file =
			e.target.files[0];

		if (!file) return;

		const reader =
			new FileReader();

		reader.onload =
			function (event) {

				currentLogoUrl =
					event.target.result;

				$("#generatedLogoPreview")
					.attr(
						"src",
						event.target.result
					);

				$("#logoPreviewWrapper")
					.fadeIn();
			};

		reader.readAsDataURL(file);
	}
);









// Generate SEO using grok API


let GR_API_KY = "";
let seoDataCapture = "No";
let seoGeneratedData = {};

$(document).ready(function () {

	$(document).on("click", ".seo-btn", function () {

		const pageName = $(this).data("page") || "Page";

		if (!$("#seoModal").length) {
			console.log("SEO modal not found");
			return;
		}

		$("#seoPageName").val(pageName);

		$("#seoGenerateLoader").removeClass("active");
$("#seoOutputWrapper").hide();
$("#saveSeoBtn").hide();

		const savedSeo = localStorage.getItem(`seo_${pageName}`);

		if (savedSeo && savedSeo.trim() !== "") {

			$("#fullSeoOutput").val(savedSeo);
			$("#seoOutputWrapper").show();
			$("#saveSeoBtn").show();

		} else {

			$("#fullSeoOutput").val("");
		}

		$("#seoModal").modal("show");

	});

$(document).on("click", "#generateSeoPublishBtn", async function () {

    const btn = $(this);
    const loader = $("#seoGenerateLoader");
    const statusBox = $("#seoPublishStatus");

    if (btn.prop("disabled")) {
        return;
    }

    btn
        .prop("disabled", true)
        .html(`
            <i class="fa fa-spinner fa-spin"></i>
            Generating...
        `);

    $("#publishToServerBtn").prop("disabled", true);

    statusBox
        .hide()
        .removeClass("success error")
        .text("");

    loader.addClass("active");

    try {

        await updateSEO();

        seoGeneratedData = {
            ...getSeoPublishBusinessData(),
            domain: $("#seoClientDomain").val()?.trim() || ""
        };

        seoDataCapture = "Yes";
        window.seoGenerated = true;

        console.log("SEO DATA:", seoGeneratedData);

        loader.removeClass("active");

        btn
            .prop("disabled", true)
            .html(`
                <i class="ri-check-line"></i>
                Generated
            `);

        $("#publishToServerBtn")
            .prop("disabled", false);

    } catch (error) {

        console.error(error);

        loader.removeClass("active");

        btn
            .prop("disabled", false)
            .html(`
                <i class="ri-magic-line"></i>
                Generate SEO
            `);

        $("#publishToServerBtn")
            .prop("disabled", true);
    }
});

	$(document).on("click", "#saveSeoBtn", function () {

		const pageName = $("#seoPageName").val();

		const seoContent = $("#fullSeoOutput").val();

		localStorage.setItem(
			`seo_${pageName}`,
			seoContent
		);

		alert("SEO Saved Successfully");

		$("#seoModal").modal("hide");

	});

});


if (
	getCookie("templateMode") === "existing" &&
	getCookie("websiteBuildCompleted") === "true"
) {
	$('#clientDetailsDisplay').hide();
	$('#page-type-section').hide();
}



$(document).ready(function () {

    // Toggle sections based on radio selection
    $("input[name='logoOption']").on("change", function () {

        if ($(this).val() === "upload") {

            $("#uploadLogoSection").show();
            $("#updateLogoBtn").show();

            $("#generateLogoSection").hide();

        } else {

            $("#uploadLogoSection").hide();
            $("#updateLogoBtn").hide();

            $("#generateLogoSection").show();

        }

    });

    $("#updateLogoBtn").on("click", function () {
		// alert("click logo button")
        uploadLogo();
    });


    $("#createLogoBtn").on("click", function () {
		// alert("Generate logo")
        generateLogo();
    });

});

function updateLogoRadioUI() {
    $(".logo-mode-box .theme-radio").removeClass("active");
    $("input[name='logoOption']:checked")
        .closest(".theme-radio")
        .addClass("active");
}

$(document).ready(function () {

    updateLogoRadioUI();

    $("input[name='logoOption']").on("change", function () {

        updateLogoRadioUI();

        if ($(this).val() === "upload") {
            $("#uploadLogoSection").show();
            $("#updateLogoBtn").show();
            $("#generateLogoSection").hide();
        } else {
            $("#uploadLogoSection").hide();
            $("#updateLogoBtn").hide();
            $("#generateLogoSection").show();
        }

    });

});




// Upload Logo
function uploadLogo() {

    var file = $("#logoUpload")[0].files[0];

    if (!file) {
		showCustomAlertBox("error", "Please select a logo.")
        return;
    }

	var client_name = $("#clientName").val();
	var project_name = $("#projectName").val();


		if (!client_name || !project_name) {
			showCustomAlertBox("error", "Invalid project name. Use 1-10 lowercase letters and dashes only. It cannot start or end with a dash.")
			return;
		}

    var formData = new FormData();
	formData.append("logo", file);
	formData.append("client_name", client_name);
	formData.append("project_name", project_name);

    $.ajax({
        url: "/upload-logo/",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        success: function (response) {

            // alert(response.message);
			showCustomAlertBox("success", response.message)
            console.log(response);

        },
        error: function (xhr) {

            alert("Logo upload failed.");

            console.log(xhr);

        }
    });

}


// Generate AI Logo
function generateLogo() {

    var category = $("#companyCategory").val();
    var description = $("#companyDescription").val();

    $.ajax({

        url: "/generate-logo/",
        type: "POST",
        contentType: "application/json",

        data: JSON.stringify({
            category: category,
            description: description
        }),

        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },

        success: function (response) {

            alert(response.message);

            console.log(response);

            // Example:
            // $("#generatedLogoPreview").attr("src", response.logo_url);
            // $("#logoPreviewWrapper").show();

        },

        error: function (xhr) {

            alert("Logo generation failed.");

            console.log(xhr);

        }

    });

}

$('#closeUseExistingTemplatePrompt').on('click', function () {

	var client_name = $("#clientName").val();
	var project_name = $("#projectName").val();
	//alert("click close button----"+client_name+"---"+project_name)
$('#clientsDetailsModel').modal('hide');
    $.ajax({
        url: "/remove-logo/",
        type: "POST",
		data: {
			client_name: client_name,
			project_name: project_name
		},

        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },

		success: function (response) {

			console.log(response);

			if (response.status === true) {
				showCustomAlertBox("success", response.message);
			} else {
				showCustomAlertBox("error", response.message);
			}
		}
    });


});



// updateSEO();

function getSeoPublishBusinessData() {

    function value(id) {
        return $("#" + id).val()?.trim() || "";
    }

    function commaSeparatedValues(id) {
        return value(id)
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== "");
    }

    return {
        name: value("seoBusinessName"),

        type: value("seoBusinessType"),

        description: value("seoBusinessDescription"),

        contact: {
            phone: value("seoContactPhone"),
            email: value("seoContactEmail")
        },

        address: {
            street: value("seoAddressStreet"),
            city: value("seoAddressCity"),
            state: value("seoAddressState"),
            postal_code: value("seoAddressPostalCode"),
            country: value("seoAddressCountry")
        },

        services: commaSeparatedValues("seoServices"),

        products: commaSeparatedValues("seoProducts"),

        areas_served: commaSeparatedValues("seoAreasServed"),

		hours: {
			Monday: value("seoWeekdays"),
			Tuesday: value("seoWeekdays"),
			Wednesday: value("seoWeekdays"),
			Thursday: value("seoWeekdays"),
			Friday: value("seoWeekdays"),
			Saturday: value("seoSaturday"),
			Sunday: value("seoSunday")
		},

        social_profiles: [
            value("seoFacebook"),
            value("seoInstagram"),
            value("seoLinkedin"),
            value("seoYoutube")
        ].filter(item => item !== ""),

        additional_information: value("seoAdditionalInformation")
    };
}

async function updateSEO() {

    const clientDomain =
        $("#seoClientDomain").val()?.trim() || "";

    const clientName =
        getCookie("clientName") || "";

    const projectName =
        getCookie("projectName") || "";

    const businessData =
        getSeoPublishBusinessData();

    if (!clientDomain) {
        isValidDomain(clientDomain);
    }

    if (!businessData.name) {
        throw new Error("Please enter the business name.");
    }

    const response = await fetch("/optimizeseo//", {
        method: "POST",

        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-CSRFToken": getCookie("csrftoken")
        },

        body: new URLSearchParams({
            client_domain: clientDomain,
            client_name: clientName,
            project_name: projectName,
            client_details: JSON.stringify(businessData)
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            data.message ||
            "SEO optimization failed"
        );
    }

    return data;
}

function prefillSeoPublishForm() {

    if (
        seoDataCapture === "Yes" &&
        seoGeneratedData &&
        Object.keys(seoGeneratedData).length
    ) {

        $("#seoClientDomain").val(seoGeneratedData.domain || "");
        $("#seoBusinessName").val(seoGeneratedData.name || "");
        $("#seoBusinessType").val(seoGeneratedData.type || "");
        $("#seoBusinessDescription").val(seoGeneratedData.description || "");

        $("#seoContactPhone").val(seoGeneratedData.contact?.phone || "");
        $("#seoContactEmail").val(seoGeneratedData.contact?.email || "");

        $("#seoAddressStreet").val(seoGeneratedData.address?.street || "");
        $("#seoAddressCity").val(seoGeneratedData.address?.city || "");
        $("#seoAddressState").val(seoGeneratedData.address?.state || "");
        $("#seoAddressPostalCode").val(seoGeneratedData.address?.postal_code || "");
        $("#seoAddressCountry").val(seoGeneratedData.address?.country || "");

        $("#seoServices").val(
            (seoGeneratedData.services || []).join(", ")
        );

        $("#seoProducts").val(
            (seoGeneratedData.products || []).join(", ")
        );

        $("#seoAreasServed").val(
            (seoGeneratedData.areas_served || []).join(", ")
        );

        const hours = seoGeneratedData.hours || {};

        $("#seoWeekdays").val(
            hours.Monday ||
            hours.Tuesday ||
            hours.Wednesday ||
            hours.Thursday ||
            hours.Friday ||
            ""
        );

        $("#seoSaturday").val(hours.Saturday || "");
        $("#seoSunday").val(hours.Sunday || "");

        const social = seoGeneratedData.social_profiles || [];

        $("#seoFacebook").val(social[0] || "");
        $("#seoInstagram").val(social[1] || "");
        $("#seoLinkedin").val(social[2] || "");
        $("#seoYoutube").val(social[3] || "");

        $("#seoAdditionalInformation").val(
            seoGeneratedData.additional_information || ""
        );

        return;
    }

    const clientName = getCookie("clientName") || "";
    const clientEmail = getCookie("clientEmail") || "";
    const clientMobile = getCookie("clientMobile") || "";
    const clientAddress = getCookie("clientAddress") || "";

    const clientFacebook = getCookie("clientFacebook") || "";
    const clientInstagram = getCookie("clientInstagram") || "";
    const clientLinkedin = getCookie("clientLinkedin") || "";
    const clientYoutube = getCookie("clientYoutube") || "";

    const selectedCategory = getCookie("selectedCategory") || "";

    $("#seoBusinessName").val(clientName);
    $("#seoBusinessType").val(selectedCategory);

    $("#seoContactEmail").val(clientEmail);
    $("#seoContactPhone").val(clientMobile);

    $("#seoAddressStreet").val(clientAddress);

    $("#seoFacebook").val(clientFacebook);
    $("#seoInstagram").val(clientInstagram);
    $("#seoLinkedin").val(clientLinkedin);
    $("#seoYoutube").val(clientYoutube);

    if (!$("#seoWeekdays").val()) {
        $("#seoWeekdays").val("09:00-18:00");
    }

    if (!$("#seoSaturday").val()) {
        $("#seoSaturday").val("09:00-14:00");
    }

    if (!$("#seoSunday").val()) {
        $("#seoSunday").val("Closed");
    }
}

$(document).on(
    "change",
    'input[name="generateSeoBeforePublish"]',
    function () {

        const selected =
            $('input[name="generateSeoBeforePublish"]:checked').val();

        $(".seo-publish-radio").removeClass("active");

        $(this)
            .closest(".seo-publish-radio")
            .addClass("active");

        if (selected === "yes") {

            prefillSeoPublishForm();

            $("#seoPublishForm")
                .stop(true, true)
                .slideDown(250);

            $("#generateSeoPublishBtn")
                .show()
                .prop("disabled", false)
                .html(`
                    <i class="ri-magic-line"></i>
                    Generate SEO
                `);

            $("#publishToServerBtn")
                .prop("disabled", true)
                .html(`
                    <i class="ri-upload-cloud-2-line"></i>
                    Publish to Server
                `);

            $("#seoGenerateLoader")
    .removeClass("active");

            $("#seoPublishStatus")
                .hide()
                .removeClass("success error")
                .text("");

            window.seoGenerated = seoDataCapture === "Yes";

        } else {

            $("#seoPublishForm")
                .stop(true, true)
                .slideUp(200);

            $("#generateSeoPublishBtn")
                .hide()
                .prop("disabled", false);

            $("#publishToServerBtn")
                .prop("disabled", false)
                .html(`
                    <i class="ri-upload-cloud-2-line"></i>
                    Publish to Server
                `);

            $("#seoGenerateLoader").removeClass("active");

            $("#seoPublishStatus")
                .hide()
                .removeClass("success error")
                .text("");

            window.seoGenerated = false;
			seoDataCapture = "No";
			seoGeneratedData = {};
        }
    }
);
$(document).on("click", "#publishToServerBtn", function () {

    const btn = $(this);

    const seoOption =
        $('input[name="generateSeoBeforePublish"]:checked').val();

    if (seoOption === "yes" && !window.seoGenerated) {
        return;
    }

    if (btn.prop("disabled")) {
        return;
    }

    btn
        .prop("disabled", true)
        .html(`
            <i class="fa fa-spinner fa-spin"></i>
            Publishing...
        `);

    $("#generateSeoPublishModal").modal("hide");

    if (typeof window.pendingPublishFunction === "function") {

        const publishFunction =
            window.pendingPublishFunction;

        window.pendingPublishFunction = null;

        publishFunction();

    } else {

        btn
            .prop("disabled", false)
            .html(`
                <i class="ri-upload-cloud-2-line"></i>
                Publish to Server
            `);
    }
});

$(document).on("input", "#seoClientDomain", function () {

    const domainInput = $(this);
    const domain = domainInput.val().trim().toLowerCase();
    const projectName = (getCookie("projectName") || "").trim().toLowerCase();
    const errorBox = $("#seoClientDomainError");

    if (!domain || !projectName) {
        errorBox.hide().removeClass("valid").text("");
        domainInput.removeClass("seo-domain-error seo-domain-valid");
        return;
    }

    const domainText = domain
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0];

    const projectText = projectName
        .replace(/[\s\-_]+/g, "");

    const domainWithoutExtension = domainText
        .split(".")[0]
        .replace(/[\-_]+/g, "");

    const isValid = domainWithoutExtension.includes(projectText);

    if (!isValid) {

        errorBox
            .removeClass("valid")
            .text("Domain should include the full project name: " + projectName)
            .show();

        domainInput
            .removeClass("seo-domain-valid")
            .addClass("seo-domain-error");

    } else {

        errorBox
            .addClass("valid")
            .text("Valid domain")
            .show();

        domainInput
            .removeClass("seo-domain-error")
            .addClass("seo-domain-valid");
    }
});


function isValidDomain(clientDomain) {
    clientDomain = clientDomain.trim().toLowerCase();

    // Remove protocol if user enters it
    clientDomain = clientDomain.replace(/^https?:\/\//, '');

    // Remove path
    clientDomain = clientDomain.split('/')[0];

    // Domain validation
    var regex = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

    return regex.test(clientDomain);
}