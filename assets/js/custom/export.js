function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

const SEO_STORAGE_KEY = "seoData";
function getSEOStore() {
    return JSON.parse(
        localStorage.getItem(SEO_STORAGE_KEY) || "{}"
    );
}
function savePageSEO(pageName, data) {
    const store = getSEOStore();
    store[pageName] = data;
    localStorage.setItem(
        SEO_STORAGE_KEY,
        JSON.stringify(store)
    );
}






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

function showCustomAlertBox(
    type = "error",
    message = "Something went wrong",
    onConfirm = null,
    confirmText = "OK",
    cancelText = null
) {

    injectCustomAlertCSS();

    type = (type === "success") ? "success" : "error";

    const backdrop = document.createElement("div");
    backdrop.className = "custom-alert-backdrop show";

    const popup = document.createElement("div");
    popup.className = `custom-alert-popup ${type} show`;

    popup.innerHTML = `
        <div class="custom-alert-content">
            <div class="custom-alert-message">
                ${message}
            </div>

            <div class="custom-alert-buttons"
                 style="
                    display:flex;
                    justify-content:center;
                    gap:12px;
                    margin-top:20px;
                 ">

                ${
                    cancelText
                    ? `
                        <button
                            type="button"
                            class="custom-alert-cancel-btn"
                            style="
                                background:#eee;
                                color:#333;
                                border:none;
                                padding:10px 28px;
                                border-radius:230px;
                                font-weight:600;
                                font-size:15px;
                                cursor:pointer;
                            "
                        >
                            ${cancelText}
                        </button>
                    `
                    : ""
                }

                <button
                    type="button"
                    class="custom-alert-ok-btn"
                >
                    ${confirmText}
                </button>

            </div>
        </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(popup);
    document.body.classList.add("custom-alert-open");

    function closeAlert() {
        backdrop.remove();
        popup.remove();
        document.body.classList.remove("custom-alert-open");
    }

    popup.querySelector(".custom-alert-ok-btn").onclick = function () {
        closeAlert();

        if (typeof onConfirm === "function") {
            onConfirm();
        }
    };

    const cancelBtn =
        popup.querySelector(".custom-alert-cancel-btn");

    if (cancelBtn) {
        cancelBtn.onclick = function () {
            closeAlert();
        };
    }

    backdrop.onclick = function () {
        closeAlert();
    };
}


// =========================================================


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetchFileContent(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Could not fetch ${url}: ${response.statusText}`);
    }
    return await response.blob();
}



function displayLoadingMessage() {
    const loadingMessage = document.createElement('div');
    loadingMessage.id = 'loading-message';
    loadingMessage.textContent = "Downloading in progress... Please wait.";
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



   function createHTMLFilesDataForWebsiteLinks() {
    // const SEOData = {
    //     // Local Businesses
    //     "Salon & Spa": {
    //         keywords: "salon, spa, hair care, beauty treatments, skincare",
    //         description: "Premium salon and spa services offering haircuts, styling, skincare, massages, and beauty treatments to rejuvenate and refresh."
    //     },
    //     "Gym": {
    //         keywords: "gym, fitness, workout, personal trainer, strength training",
    //         description: "State-of-the-art gyms providing fitness programs, personal training, strength training, and wellness guidance for a healthy lifestyle."
    //     },
    //     "Clinic": {
    //         keywords: "clinic, healthcare, medical services, doctor, health checkup",
    //         description: "Professional medical clinics offering general health checkups, consultations, treatments, and specialized healthcare services."
    //     },
    //     "Café": {
    //         keywords: "café, coffee, snacks, beverages, casual dining",
    //         description: "Cozy cafés providing freshly brewed coffee, delicious snacks, light meals, and a relaxing environment to unwind."
    //     },
    //     "Restaurant": {
    //         keywords: "restaurant, dining, food, cuisine, meals",
    //         description: "Restaurants offering a wide range of cuisines, fine dining experiences, and delicious meals for individuals and families."
    //     },
    //     "Real Estate Agencies": {
    //         keywords: "real estate, property, buying, selling, renting",
    //         description: "Expert real estate agencies assisting in buying, selling, and renting residential and commercial properties."
    //     },
    //     "Travel Agencies": {
    //         keywords: "travel agency, tours, vacation packages, flights, hotel bookings",
    //         description: "Professional travel agencies offering customized tour packages, flight bookings, hotel reservations, and travel planning services."
    //     },

    //     // Service Provider
    //     "Architect": {
    //         keywords: "architect, architecture services, building design, planning",
    //         description: "Professional architects providing building design, planning, 3D modeling, and construction consultancy services."
    //     },
    //     "Interior Designer": {
    //         keywords: "interior designer, home decor, interior planning, furnishings",
    //         description: "Creative interior designers delivering stylish and functional interior solutions for homes, offices, and commercial spaces."
    //     },
    //     "Photographer/Videographer": {
    //         keywords: "photographer, videographer, photography services, video production",
    //         description: "Professional photography and videography services for events, weddings, portraits, and commercial projects."
    //     },
    //     "Event Planner": {
    //         keywords: "event planner, event management, party planning, corporate events",
    //         description: "Expert event planners managing weddings, corporate events, parties, and other special occasions with seamless execution."
    //     },
    //     "Chartered Accountant": {
    //         keywords: "chartered accountant, accounting, taxation, financial advisory",
    //         description: "Certified chartered accountants offering accounting, taxation, audit, and financial advisory services for businesses and individuals."
    //     },
    //     "Company Secretary": {
    //         keywords: "company secretary, compliance, corporate governance, legal documentation",
    //         description: "Professional company secretaries ensuring corporate compliance, governance, and proper documentation for businesses."
    //     },
    //     "Advocate": {
    //         keywords: "advocate, lawyer, legal services, litigation, legal advice",
    //         description: "Experienced advocates providing legal consultation, representation, and litigation services for individuals and businesses."
    //     },
    //     "Music Coach": {
    //         keywords: "music coach, music lessons, instruments, singing lessons",
    //         description: "Professional music coaches offering lessons in instruments, vocals, and music theory for beginners and advanced learners."
    //     },
    //     "Makeup Artists": {
    //         keywords: "makeup artist, bridal makeup, beauty services, cosmetics",
    //         description: "Skilled makeup artists providing professional bridal makeup, special occasion makeup, and beauty enhancement services."
    //     },
    //     "Financial Advisors": {
    //         keywords: "financial advisor, investment, wealth management, financial planning",
    //         description: "Certified financial advisors offering investment planning, wealth management, retirement planning, and financial guidance."
    //     },

    //     // Education & Learning
    //     "Coaching Center": {
    //         keywords: "coaching center, tutoring, exam preparation, academic guidance",
    //         description: "Professional coaching centers providing subject tutoring, exam preparation, and academic guidance for students."
    //     },
    //     "Tutor": {
    //         keywords: "tutor, private lessons, education, online tutoring",
    //         description: "Experienced tutors offering private lessons and online tutoring in various subjects for all academic levels."
    //     },
    //     "Pre-school & Daycare": {
    //         keywords: "preschool, daycare, early childhood education, childcare",
    //         description: "Quality preschool and daycare services providing early childhood education, learning activities, and safe childcare."
    //     },
    //     "School": {
    //         keywords: "school, education, primary school, secondary school",
    //         description: "Educational institutions offering primary and secondary education with comprehensive curricula and extracurricular activities."
    //     },
    //     "College": {
    //         keywords: "college, higher education, undergraduate, postgraduate courses",
    //         description: "Colleges providing undergraduate, postgraduate courses, and professional programs with experienced faculty and campus facilities."
    //     },

    //     // Professional Showcase
    //     "Portfolio": {
    //         keywords: "portfolio, professional showcase, projects, work samples",
    //         description: "Personal and professional portfolios showcasing creative work, projects, achievements, and expertise for career growth."
    //     },
    //     "Influencer": {
    //         keywords: "influencer, social media, brand promotion, content creation",
    //         description: "Social media influencers creating engaging content, promoting brands, and connecting with their audience effectively."
    //     },
    //     "Blogger/Vlogger": {
    //         keywords: "blogger, vlogger, content creation, online writing, video blogging",
    //         description: "Bloggers and vloggers producing high-quality written and video content, sharing expertise, reviews, and personal experiences online."
    //     },

    //     // Health & Wellness
    //     "Fitness & Gym": {
    //         keywords: "fitness, gym, workout, personal training, health",
    //         description: "Fitness and gym services offering workout routines, personal training, wellness programs, and health improvement guidance."
    //     },
    //     "Yoga & Meditation": {
    //         keywords: "yoga, meditation, wellness, mindfulness, relaxation",
    //         description: "Yoga and meditation classes promoting physical, mental, and spiritual wellness through guided practices."
    //     },
    //     "Nutritionist": {
    //         keywords: "nutritionist, diet plan, healthy eating, weight management",
    //         description: "Professional nutritionists providing personalized diet plans, healthy eating guidance, and weight management solutions."
    //     },
    //     "Clinic": {
    //         keywords: "clinic, medical services, healthcare, treatment, consultation",
    //         description: "Clinics offering professional healthcare services, medical consultation, and treatment for various health conditions."
    //     },
    //     "Pharmacy": {
    //         keywords: "pharmacy, medicines, prescriptions, health products",
    //         description: "Pharmacies providing prescription medications, health products, and over-the-counter treatments for wellness and recovery."
    //     },
    //     "Fitness Coach": {
    //         keywords: "fitness coach, personal training, health guidance, workout plan",
    //         description: "Certified fitness coaches offering personalized workout plans, nutrition advice, and guidance for physical fitness."
    //     },

    //     // Food & Hospitality
    //     "Restaurants": {
    //         keywords: "restaurants, dining, food, cuisine, meals",
    //         description: "Restaurants offering diverse cuisines, quality dining experiences, and delicious meals for individuals, families, and groups."
    //     },
    //     "Cafes & Bakeries": {
    //         keywords: "cafe, bakery, coffee, pastries, snacks",
    //         description: "Cafes and bakeries providing freshly baked goods, coffee, pastries, and a cozy environment for relaxation."
    //     },
    //     "Catering Services": {
    //         keywords: "catering services, event catering, food delivery, party catering",
    //         description: "Professional catering services offering customized menus, food preparation, and delivery for events and gatherings."
    //     },
    //     "Hotel/Lounges": {
    //         keywords: "hotel, lounge, accommodation, hospitality, stay",
    //         description: "Hotels and lounges providing comfortable accommodations, hospitality services, and dining facilities for guests."
    //     },

    //     // Events & Entertainment
    //     "Event Planner": {
    //         keywords: "event planner, event management, wedding planning, corporate events",
    //         description: "Expert event planners managing weddings, corporate events, and private parties with creativity and flawless execution."
    //     },
    //     "Event Booking Platform": {
    //         keywords: "event booking, online platform, tickets, event management",
    //         description: "Online event booking platforms allowing easy ticketing, scheduling, and management of various events and experiences."
    //     },

    //     // Nonprofit & Community
    //     "Charity/NGO": {
    //         keywords: "charity, NGO, nonprofit, donations, social work",
    //         description: "Charity organizations and NGOs working to support communities, raise funds, and create social impact through various initiatives."
    //     },
    //     "Religious Organizations": {
    //         keywords: "religious organization, faith, spiritual services, worship",
    //         description: "Religious organizations providing spiritual guidance, community services, and places of worship for followers."
    //     },

    //     // Automotive & Transportation
    //     "Car Dealerships": {
    //         keywords: "car dealership, vehicles, car sales, new cars, used cars",
    //         description: "Car dealerships offering new and pre-owned vehicles, financing options, and after-sales services."
    //     },
    //     "Auto Repair Shops": {
    //         keywords: "auto repair, car maintenance, vehicle service, mechanic",
    //         description: "Auto repair shops providing vehicle maintenance, repair services, diagnostics, and mechanical solutions."
    //     },
    //     "Car Rentals": {
    //         keywords: "car rental, vehicle hire, transportation, travel",
    //         description: "Car rental services providing vehicles for short-term or long-term hire for personal or business travel."
    //     },
    //     "Logistics & Shipping": {
    //         keywords: "logistics, shipping, freight, delivery, transport services",
    //         description: "Logistics and shipping companies offering transport, freight forwarding, and delivery solutions for businesses and individuals."
    //     },
    //     "Rideshare Services": {
    //         keywords: "rideshare, taxi, cab service, transportation, driver",
    //         description: "Rideshare services offering convenient, on-demand transportation options with professional drivers."
    //     },

    //     // Sports & Recreation
    //     "Sports Clubs": {
    //         keywords: "sports club, fitness, team sports, recreation, activities",
    //         description: "Sports clubs providing facilities and training for team sports, recreational activities, and fitness programs."
    //     },
    //     "Sporting Goods Stores": {
    //         keywords: "sporting goods, equipment, sports store, gear",
    //         description: "Sporting goods stores offering equipment, apparel, and gear for various sports and recreational activities."
    //     },
    //     "Game Zone": {
    //         keywords: "game zone, entertainment, arcade, gaming center",
    //         description: "Game zones and arcades offering fun, interactive entertainment, and gaming experiences for all ages."
    //     },

    //     // Pets & Animals
    //     "Pet Store": {
    //         keywords: "pet store, pets, pet supplies, animals, pet care",
    //         description: "Pet stores offering a wide range of pets, food, accessories, and healthcare products for your beloved animals."
    //     },
    //     "Pet Grooming": {
    //         keywords: "pet grooming, pet care, bathing, trimming, pets",
    //         description: "Professional pet grooming services including bathing, trimming, and styling for all types of pets."
    //     },
    //     "Animal Shelters": {
    //         keywords: "animal shelter, rescue, adoption, pets, shelter",
    //         description: "Animal shelters rescuing, caring for, and facilitating adoption of homeless and abandoned animals."
    //     },

    //     // Repair & Maintenance
    //     "Fabrication": {
    //         keywords: "fabrication, metal work, welding, custom structures",
    //         description: "Professional fabrication services providing metalwork, welding, and custom structure creation for various projects."
    //     },
    //     "Plumbing": {
    //         keywords: "plumber, plumbing services, leak repair, pipe installation",
    //         description: "Expert plumbing services for residential and commercial plumbing, leak repair, and pipe installations."
    //     },
    //     "Civil Work": {
    //         keywords: "civil work, construction, building services, infrastructure",
    //         description: "Civil work services including construction, building maintenance, infrastructure projects, and structural solutions."
    //     },
    //     "Electrician": {
    //         keywords: "electrician, electrical services, wiring, installation, maintenance",
    //         description: "Professional electricians providing installation, repair, and maintenance of electrical systems for homes and businesses."
    //     },
    //     "Carpenter": {
    //         keywords: "carpenter, woodworking, furniture, repairs",
    //         description: "Skilled carpenters providing furniture making, repairs, custom woodworking, and cabinetry services."
    //     },
    //     "Cleaning Service": {
    //         keywords: "cleaning service, housekeeping, janitorial, office cleaning, home cleaning",
    //         description: "Professional cleaning services offering residential, commercial, and specialized cleaning solutions."
    //     },
    //     "Electronic Item Services": {
    //         keywords: "electronics repair, gadget service, device maintenance, tech support",
    //         description: "Expert electronic repair services for gadgets, home appliances, and electronic devices with reliable maintenance solutions."
    //     }
    // };




    var imagesNameList = "";
const themeMode = getCookie("themeMode") || "default";

let themeCSS = "";

if(themeMode==="default"){

    themeCSS="Default theme";

}
else{

    const websiteThemeColor=getCookie("websiteThemeColor") || "#FFFFFF";

    const themeData=generateThemeCSS(websiteThemeColor);

    themeCSS=themeData.css;

}

const clientEmail = getCookie("clientEmail") || "";
const clientMobile = getCookie("clientMobile") || "";
const clientAddress = getCookie("clientAddress") || "";

const clientFacebook = getCookie("clientFacebook") || "";
const clientInstagram = getCookie("clientInstagram") || "";
const clientLinkedin = getCookie("clientLinkedin") || "";
const clientTwitter = getCookie("clientTwitter") || "";
const clientYoutube = getCookie("clientYoutube") || "";
const clientPinterest = getCookie("clientPinterest") || "";
const clientWhatsapp = getCookie("clientWhatsapp") || "";
    // images from localStorage
    const logoImage = localStorage.getItem("logoImage") || "";
    const sliderImage = localStorage.getItem("sliderImage") || "";






    const globalHeaderObj = JSON.parse(getCookie('globalHeader') || "{}");
    const globalFooterObj = JSON.parse(getCookie('globalFooter') || "{}");

    const globalHeader = globalHeaderObj.id;
    const globalFooter = globalFooterObj.id;

    const headerTemplate = globalHeaderObj.template;
    //alert("Path------"+globalHeaderObj.template);


    const footerTemplate = globalFooterObj.template;

    const headerPages = JSON.parse(getCookie('HeaderPages') || "[]");

    const middleSectionsCookie = getCookie('middle_sections');
    const middleSections = {}
    if (middleSectionsCookie != undefined) {
        const middleSectionsObj = JSON.parse(middleSectionsCookie);
        for (const key in middleSectionsObj) {
            middleSections[key] = middleSectionsObj[key]
        }
    }


    const filesDetailsMap = {};



    const footerPagesCookie = getCookie('FooterPages');
    const footerPagesObj = JSON.parse(footerPagesCookie);

    let FooterPages = [];
    footerPagesObj.forEach(footerObj => {
        const footerTitle = Object.keys(footerObj)[0];
        const footerLinks = footerObj[footerTitle];
        FooterPages.push(...footerLinks);
    });

    const filteredFooterPages = FooterPages.filter(page => {
        return !headerPages.some(h =>
            h.replace(/^header_/, '').toLowerCase() === page.toLowerCase()
        );
    });
    // alert("headerTemplate"+headerTemplate);
    //   alert("footerTemplate"+footerTemplate);
    if (!headerTemplate || !footerTemplate) {
        alert('You forgot to add Header or Footer for your website so please add before proceeding further.');
        return;
    }

    const mainPages = [];
    const subPages = {};

    // // Separate main pages and subpages
    // headerPages.forEach(page => {
    //     if (page.includes('_sub_')) {
    //         const [mainPage, subPage] = page.split('_sub_');
    //         if (!subPages[mainPage]) {
    //             subPages[mainPage] = [];
    //         }
    //         subPages[mainPage].push(subPage);
    //     } else {
    //         mainPages.push(page);
    //     }
    // });


    try {
        // const headerPages = JSON.parse(getCookie('HeaderPages') || "[]");


        // const mainPages = [];
        // const subPages = {};

        headerPages.forEach(function (page) {
            if (page.includes('_sub_')) {
                const parts = page.split('_sub_');
                const main = parts[0];
                const sub = parts[1];

                if (!subPages[main]) subPages[main] = [];
                subPages[main].push(sub);
            } else {
                mainPages.push(page);
            }
        });

        if (globalHeader) {
            var headerEl = $("#" + globalHeader);
            if (headerEl.length && headerEl.find('#dynamic-header').length) {

                headerEl.find('#dynamic-header').html(
                    generateMenu(mainPages, subPages)
                );
            }
        }
    } catch (e) {
        console.error("Header refresh error:", e);
    }

    // Generate Common Header with Menus for all the pages
    let headerSection = null;

    if (headerTemplate) {
        // alert("Inside if111-----" + headerTemplate);


        const header_request_src =
            globalHeaderObj.isAI ? "ai_gen" : "section";

        const requestData = {
            request_src: header_request_src,
            section_path: headerTemplate,
            file_name: ""
        };

        $.ajax({
            // url: headerTemplate,
            // type: "GET",
            // async: false,
            url: "/fetch_html_sections/",
            type: "POST",
            data: requestData,
            async: false,
            headers: {
                "X-CSRFToken": csrftoken
            },

            success: function (html) {

                // alert("htmlNew"+html);
                // const parsed = $(html);

                // let section = null;

                // if (parsed.is('section')) {
                //     section = parsed;
                // } else if (parsed.find('section').length) {
                //     section = parsed.find('section').first();
                // } else {
                //     section = parsed;
                // }

                // WRAP PROPERLY (IMPORTANT FIX)
                headerSection = $('<div></div>').append(html);

                // Inject into DOM (hidden)
                $("#temp-header-container").remove();
                $("body").append(
                    $('<div id="temp-header-container" style="display:none;"></div>').append(headerSection)
                );

            },
            error: function () {

                console.error("Header load failed:", headerTemplate);
            }
        });

    }

    // headerSection.find('.radio-holder').remove();

    // Capture the category of the selected header
    let headerCategory = headerSection.attr('category') || "";


    if (globalHeader.includes('header-')) {
        const menuContent = generateMenu(mainPages, subPages);
        headerSection.find('#dynamic-header').html(menuContent);
    }


    try {
        const footerContent = generateFooterLinks();

        $("." + globalFooter + "_old").each(function (index) {

            const data = footerContent[index];
            if (!data) return;

            const el = $(this);

            el.find("#quick-link-title").text(data.title);

            const ul = el.find(".footer-navigation");
            ul.empty();

            data.links.forEach(function (link) {
                ul.append(
                    '<li><a href="' + link.url + '.html">' + link.name + '</a></li>'
                );
            });
        });
    } catch (e) {
        console.error("Footer refresh error:", e);
    }

    // Generate Common Footer with Menus for all the pages
    // ===== LOAD FOOTER FROM TEMPLATE =====
    let footerSection = null;
    if (footerTemplate) {

        const footer_request_src =
            globalFooterObj.isAI ? "ai_gen" : "section";

        const requestData = {
            request_src: footer_request_src,
            section_path: footerTemplate,
            file_name: ""
        };
        $.ajax({
            url: "/fetch_html_sections/",
            type: "POST",
            data: requestData,
            async: false,
            headers: {
                "X-CSRFToken": csrftoken
            },
            success: function (html) {

                const parsed = $(html);

                let section = null;

                if (parsed.is('section')) {
                    section = parsed;
                } else if (parsed.find('section').length) {
                    section = parsed.find('section').first();
                } else {
                    section = parsed; // fallback
                }

                // wrap properly
                footerSection = $('<div></div>').append(section);

                $("#temp-footer-container").remove();
                $("body").append(
                    $('<div id="temp-footer-container" style="display:none;"></div>')
                        .append(footerSection)
                );
            },
            error: function () {
                console.error("Footer load failed:", footerTemplate);
            }
        });

    }

    // ===== SAFETY =====
    if (!footerSection || !footerSection.length) {
        console.error("Footer not loaded");
        alert("Footer template failed");
        return;
    }

    // ===== APPLY FOOTER LINKS ON TEMPLATE =====
    if (globalFooter.includes('footer-')) {

        const footerContent = generateFooterLinks();

        const existingNavs = footerSection.find("." + globalFooter + "_old");

        existingNavs.each(function (index) {

            const existingNav = $(this);
            const footerData = footerContent[index];

            if (footerData) {

                existingNav.find("#quick-link-title").text(footerData.title);

                const ulElement = existingNav.find(".footer-navigation");
                ulElement.empty();

                footerData.links.forEach(link => {
                    ulElement.append(`
                    <li><a href="${link.url}.html">${link.name}</a></li>
                `);
                });
            }
        });
    }



    function addImagesToList(imageUrl) {
        const imgName = imageUrl.split("assets/images/")[1];
        // alert("Image URL: "+imageUrl + "------ Image Name: "+imgName)
        if (imgName && !imagesNameList.includes(imgName)) {
            imagesNameList += "," + imgName;
        }
    }
    var clientName = getCookie("clientName");
    var clientProjectName = getCookie("projectName");

    function replaceLogoWithText(section, projectName) {

        section.find('.generated-logo').each(function () {

            const textLogo = $(this);
            const imgLogo = textLogo.siblings('img.site-logo-img');

            textLogo.text(projectName.toUpperCase());

            imgLogo.hide();
            textLogo.show();
        });
    }



    function processImagesAndRemoveThemeClasses(section, clientName, clientProjectName) {
        // Handle images and background images

        section.find('img').each(function () {
            const oldSrc = $(this).attr("src");
            if (oldSrc && (oldSrc.endsWith(".jpeg") || oldSrc.endsWith(".JPG") || oldSrc.endsWith(".jpg") || oldSrc.endsWith(".png") || oldSrc.endsWith(".svg"))) {
                // Check if the src contains 'assets/images/' and replace it
                if (oldSrc.includes("assets/images/") ) {
                    //const newSrc = oldSrc.replace("assets/images/", `assets/clients/${clientName}/${clientProjectName}/images/`);
                    const newSrc = oldSrc.replace("assets/images/", `assets/images/`);
                    $(this).attr("src", newSrc); // Update the src attribute
                }
                addImagesToList(oldSrc); // Always add the oldSrc to the list
            }
        });

        section.find('*').each(function () {
            const backgroundImage = $(this).css("background-image");
            if (backgroundImage && backgroundImage !== 'none') {
                const imageUrl = backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                // Check if the background image URL contains 'assets/images/' and replace it
                if (imageUrl && (imageUrl.endsWith(".jpeg") || imageUrl.endsWith(".JPG") || imageUrl.endsWith(".jpg") || imageUrl.endsWith(".png") || imageUrl.endsWith(".svg"))) {
                    if (imageUrl.includes("assets/images/")) {
                        // const newImageUrl = imageUrl.replace("assets/images/", `assets/clients/${clientName}/${clientProjectName}/images/`);
                        const newImageUrl = imageUrl.replace("assets/images/", `assets/images/`);
                        $(this).css("background-image", `url(${newImageUrl})`); // Update the background-image URL
                    }
                    addImagesToList(imageUrl); // Always add the imageUrl to the list
                }
            }


        });
    }


    // Process header and footer sections
    //     processImagesAndRemoveThemeClasses(headerSection,clientName, clientProjectName);
    //     processImagesAndRemoveThemeClasses(footerSection,clientName, clientProjectName);


    // if (clientProjectName) {
    //     replaceLogoWithText(headerSection, clientProjectName);
    //     replaceLogoWithText(footerSection, clientProjectName);
    // }

    //     const headerHTML = headerSection.html();
    //     const footerHTML = footerSection.html();

    const headerClone = headerSection.clone();

    headerClone.find('.radio-holder').remove();
    processImagesAndRemoveThemeClasses(headerClone, clientName, clientProjectName);

    if (clientProjectName) {
        replaceLogoWithText(headerClone, clientProjectName);
    }

    const headerHTML = headerClone.html();


    // ===== FOOTER CLEAN COPY =====
    const footerClone = footerSection.clone();

    footerClone.find('.radio-holder').remove();
    processImagesAndRemoveThemeClasses(footerClone, clientName, clientProjectName);

    if (clientProjectName) {
        replaceLogoWithText(footerClone, clientProjectName);
    }

    const footerHTML = footerClone.html();





    // Save the header.html and footer.html content in the filesDetailsMap
    filesDetailsMap["header.html"] = headerHTML;
    filesDetailsMap["footer.html"] = footerHTML;

    // headerPages.push("default-middle_section");  // Add DUmmy entry to add default middle section
    // Iterate over the pages to generate content for each page
    headerPages.forEach(pageName => {

        const allSectionsOfPage = [];

        // Add header section in the page
        // if (globalHeader) allSectionsOfPage.push(globalHeader);

        let middleKey = null;

        const keys = Object.keys(middleSections);

        let availableMiddleSectionsForPage = middleSections[pageName] || [];

        if (availableMiddleSectionsForPage.length > 0) {

            availableMiddleSectionsForPage.forEach(section => {
                allSectionsOfPage.push(section);
            });

        } else {

            console.warn("No middle section found for", pageName, "→ using default");

            allSectionsOfPage.push({
                id: "default-middle_section",
                template: "/assets/page_components/1-DO-NOT-DELETE_Default-blank-section/default-middle_section.html" // IMPORTANT
            });
        }

        // Add footer section in the page
        // if (globalFooter) allSectionsOfPage.push(globalFooter);

        if (allSectionsOfPage.length === 0) {
            alert(`No sections selected for export for ${pageName}`);
            return;
        }

        let fileName = pageName.replace(/^(header_)/, '');

        if (fileName.includes('_sub_')) {
            fileName = fileName.split('_sub_')[1];
        }

        // convert only for file creation
        fileName = toFileName(fileName);

        let pageContent = '';
        //         allSectionsOfPage.forEach(sectionId => {

        //             const originalSection =
        //             document.getElementById(sectionId) ||
        //             document.querySelector(`[id^="${sectionId}"]`);

        //             if (!originalSection) {
        //                 console.warn("Missing section in DOM:", sectionId);
        //                 return;  //  Prevents blank pages
        //             }

        //             const sectionClone = $(originalSection).clone();
        //             sectionClone.find('.radio-holder').remove();
        //             // sectionClone.find('img').each(function() {
        //             //     const oldSrc = $(this).attr("src");
        //             //     const imgName = oldSrc.split("assets/images/")[1];
        //             //     $(this).attr("src", "assets/clients/"+clientName+"/"+clientProjectName+"/images/" + imgName);
        //             //     if(!imagesNameList.includes(imgName)){
        //             //         imagesNameList = imagesNameList + "," + imgName;
        //             //     }

        //             // });
        //             // sectionClone.find('*').each(function() {
        //             //     const classNames = $(this).attr('class');
        //             //     if (classNames) {
        //             //         classNames.split(' ').forEach((className) => {
        //             //             if (className.startsWith('theme-')) {
        //             //                 $(this).removeClass(className);
        //             //             }
        //             //         });
        //             //     }
        //             // });

        //         processImagesAndRemoveThemeClasses(sectionClone,clientName, clientProjectName);





        // sectionClone.find('.company_name').contents().filter(function () {
        //     return this.nodeType === 3 && this.nodeValue.includes("Company Name");
        // }).each(function () {
        //     this.nodeValue = this.nodeValue.replace(/Company Name/g, clientProjectName);
        // });
        //             pageContent += `${sectionClone.html()}\n`; // Append the updated HTML

        //             // pageContent += `${sectionClone.html()}\n`;
        //             // pageContent += `<div id="${sectionId}">${sectionClone.html()}</div>\n`;
        //         });


        allSectionsOfPage.forEach(section => {

            const sectionId = section.id;
            const templatePath = section.template;

            let sectionClone = null;

            const originalSection =
                  document.getElementById(sectionId) ||
                document.querySelector(`[id^="${sectionId}"]`);
                const isAI = templatePath && templatePath.includes("_aig");
                            if (originalSection && !isAI) {

                    const wrapper = $(originalSection).closest('.section-wrapper');

                    if (wrapper.length) {
                        sectionClone = wrapper.clone();
                    } else {
                        sectionClone = $(originalSection).clone();
                    }

                    sectionClone.find(".ai-generated-wrapper").remove();

                }else if (templatePath) {

                // if (templatePath.includes("aig")) {
                //     request_src = "ai_gen"
                // }
                // const requestData = {
                //     request_src: request_src,
                //     section_path: templatePath,
                //     file_name: ""
                // }
                let request_src = "section";

                if (templatePath.includes("aig")) {
                    request_src = "ai_gen";
                }

                const requestData = {
                    request_src: request_src,
                    section_path: templatePath,
                    file_name: ""
                };
                $.ajax({
                    // url: templatePath,
                    // type: "GET",
                    // async: false,
                    url: "/fetch_html_sections/",
                    type: "POST",
                    data: requestData,
                    async: false,
                    headers: {
                        "X-CSRFToken": csrftoken
                    },
                    success: function (html) {

                        const parsed = $(html);

                        let sectionEl = null;

                        if (parsed.filter('section').length) {
                            sectionEl = parsed.filter('section').first();
                        } else if (parsed.find('section').length) {
                            sectionEl = parsed.find('section').first();
                        }

                        if (sectionEl) {

                            // WRAP AI section (THIS IS THE FIX)
                            sectionClone = $('<div class="section-wrapper"></div>').append(sectionEl);

                        } else {

                            sectionClone = $('<div class="section-wrapper"></div>').append(parsed);
                        }
                    },
                    error: function () {
                        console.error("Failed to load:", templatePath);
                    }
                });

            } else if (sectionId === "default-middle_section") {
                alert(3)

                // Load default section template manually
                const defaultTemplate = "/assets/page_components/1-DO-NOT-DELETE_Default-blank-section/default-middle_section.html"; // <-- set correct path

                $.ajax({
                    url: defaultTemplate,
                    type: "GET",
                    async: false,
                    success: function (html) {
                        const parsed = $(html);

                        if (parsed.filter('section').length) {
                            sectionClone = $('<div class="section-wrapper"></div>')
                                .append(parsed.filter('section').first());
                        } else if (parsed.find('section').length) {
                            sectionClone = $('<div class="section-wrapper"></div>')
                                .append(parsed.find('section').first());
                        } else {
                            sectionClone = $('<div class="section-wrapper"></div>')
                                .append(parsed);
                        }
                    },
                    error: function () {
                        console.error("Default middle section not found");
                    }
                });

            } else {
                alert(4)
                console.error("Missing section:", sectionId);
                return;
            }
            // SAFETY CHECK
            if (!sectionClone) return;

            //  REMOVE EDIT MODE ELEMENTS
            sectionClone.find('.radio-holder').remove();

            //  PROCESS IMAGES (VERY IMPORTANT)
            processImagesAndRemoveThemeClasses(sectionClone, clientName, clientProjectName);
            sectionClone.find('footer').remove();
            sectionClone.find('[class*="footer"]').remove();
            sectionClone.find('[id*="footer"]').remove();
            //  REPLACE COMPANY NAME
            const companyElement = sectionClone.find(".company_name");
            if (companyElement.length && clientProjectName?.trim()) {
                companyElement.html(clientProjectName);
            }
            // Email
            if (clientEmail?.trim()) {
                sectionClone.find(".client_email").each(function () {
                    $(this)
                        .text(clientEmail)
                        .attr("href", "mailto:" + clientEmail);
                });
            }

            // Mobile
            if (clientMobile?.trim()) {
                const cleanMobile = clientMobile.replace(/[^\d+]/g, "");
                sectionClone.find(".client_mobile").each(function () {
                    $(this)
                        .text(clientMobile)
                        .attr("href", "tel:" + cleanMobile);
                });
            }

            // Address
            if (clientAddress?.trim()) {
                // Encode address for Google Maps URL
                const mapAddress = encodeURIComponent(clientAddress);

                sectionClone.find(".client_address").each(function () {
                    $(this)
                        .text(clientAddress)
                        .attr("href", `https://www.google.com/maps/search/?api=1&query=${mapAddress}`);
                });
            }

            // Whatsapp
            if (clientWhatsapp?.trim()) {
                sectionClone.find(".client_whatsapp").each(function () {
                    $(this).attr("href", clientWhatsapp);
                });
            }

            // Facebook
            if (clientFacebook?.trim()) {
                sectionClone.find(".client_facebook").each(function () {
                    $(this).attr("href", clientFacebook);
                });
            }

            // Instagram
            if (clientInstagram?.trim()) {
                sectionClone.find(".client_instagram").each(function () {
                    $(this).attr("href", clientInstagram);
                });
            }

            // LinkedIn
            if (clientLinkedin?.trim()) {
                sectionClone.find(".client_linkedin").each(function () {
                    $(this).attr("href", clientLinkedin);
                });
            }

            // X / Twitter
            if (clientTwitter?.trim()) {
                sectionClone.find(".client_twitter").each(function () {
                    $(this).attr("href", clientTwitter);
                });
            }

            // YouTube
            if (clientYoutube?.trim()) {
                sectionClone.find(".client_youtube").each(function () {
                    $(this).attr("href", clientYoutube);
                });
            }

            // Pinterest
            if (clientPinterest?.trim()) {
                sectionClone.find(".client_pinterest").each(function () {
                    $(this).attr("href", clientPinterest);
                });
            }



            // Logo Image
            if (logoImage && logoImage.startsWith("data:image")) {
                sectionClone.find(".client_logo").each(function () {
                    $(this).attr("src", logoImage);
                });
            }

            // Slider Image
            if (sliderImage && sliderImage.startsWith("data:image")) {
                sectionClone.find(".client_slider").each(function () {
                    $(this).attr("src", sliderImage);
                });
            }


            //  APPEND ONLY ONCE
            pageContent += `${sectionClone.html()}\n`;

        });
        let headerFont = $("." + globalHeader).css("font-family") || "'Roboto', sans-serif";

        // const seoInfo = SEOData[headerCategory] || { keywords: "", description: "" };
        let seoTitle = fileName || "Home";
        let seoDescription = "";
        let seoKeywords = "";

        try {

            const currentPageSEO =
                localStorage.getItem(`seo_${pageName}`);

            if (
                currentPageSEO &&
                typeof currentPageSEO === "string"
            ) {

                const titleMatch =
                    currentPageSEO.match(/SEO Title:\s*(.*)/i);

                const descMatch =
                    currentPageSEO.match(/Meta Description:\s*(.*)/i);

                const keywordMatch =
                    currentPageSEO.match(/Focus Keywords:\s*(.*)/i);

                function cleanSEOText(text = "") {

                    return text
                        .replace(/\*\*/g, '')
                        .replace(/^["']+|["']+$/g, '')
                        .replace(/\s+/g, ' ')
                        .trim();
                }

                seoTitle =
                    cleanSEOText(
                        titleMatch?.[1] || fileName
                    );

                seoDescription =
                    cleanSEOText(
                        descMatch?.[1] || ""
                    );

                seoKeywords =
                    cleanSEOText(
                        keywordMatch?.[1] || ""
                    );
            }

        } catch (e) {

            console.log("SEO ERROR", e);

        }

        const newPageContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="${seoDescription.replace(/"/g, '&quot;')}">
            <meta name="keywords" content="${seoKeywords.replace(/"/g, '&quot;')}">
            <base href='/'>
            <title>${seoTitle.replace(/"/g, '&quot;')}</title>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
            <link href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <link rel="stylesheet" href="assets/css/style.css">
            <link rel="stylesheet" href="assets/css/middle_sections.css">
            <link rel="stylesheet" href="assets/css/anim-effects.css">
            <link rel="stylesheet" href="assets/css/components/${globalHeader}.css">
            <link rel="stylesheet" href="assets/css/components/${globalFooter}.css">
            <link rel="stylesheet" href="assets/css/bootstrap.css">
            <link rel="stylesheet" href="assets/css/plugins.css">
	        <link rel="stylesheet" href="assets/css/custom-Imports.css">
            <link rel="stylesheet" href="assets/css/custom/editmode.css">
            <link rel="stylesheet" href="assets/css/resonsive.css">
            <link rel="stylesheet" href="/media/projects/${clientName}/${clientProjectName}/assets/css/custom-theme-color.css">
            <link rel="stylesheet" href="assets/css/custom-theme-color.css">

            	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css">
	<link rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css">
<style>
        :root {
            --site-font:${headerFont};
        }

        body,
        #wrapper,
        #wrapper *:not(i):not([class^="ri-"]):not([class*=" ri-"]) {
            font-family: var(--site-font);
        }
    </style>

<link rel="stylesheet" href="assets/css/custom-theme-colors.css">
        </head>
        <body >
            <div id="wrapper">
            <div id="header" data-src="header.html"></div>
            <div id="mainPageContent">${pageContent}</div>
            <div id="footer" data-src="footer.html"></div>

            </div>
            ${clientWhatsapp?.trim() ? `
            <a href="${clientWhatsapp}" class="whatsapp-float client_whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <i class="ri-whatsapp-line icon-float"></i>
                </a>
            ` : ""}
            <script src="assets/js/jquery.js"></script>
            <script src="assets/js/middle-section.js"></script>
            <script src="assets/js/init.js"></script>
            <script src="assets/js/plugins.js"></script>
            <script src="assets/js/jquery.main.js"></script>
            <script src="assets/js/gsap.min.js"></script>
            <script src="assets/js/ScrollTrigger.min.js"></script>
            <script src="assets/js/Observer.min.js"></script>
            <script src="assets/js/gsap.effects.js"></script>
            <script src="assets/js/common_js/send_email.js"></script>
            <script src="https://colorjs.io/dist/color.global.js"></script>
            <script src="assets/js/common_js/html_image_editor.js"></script>
            <script src="assets/js/common_js/windows_postmessage.js"></script>

            <script src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"></script>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>

            <script>
                        $(function () {

                            /* Start code to load js and css files properly on local server or production server: NOte: this is the workwround, need to fix this */
                            loadHeaderFooter("header", "/media/projects/${clientName}/${clientProjectName}/header.html");
                            loadHeaderFooter("footer", "/media/projects/${clientName}/${clientProjectName}/footer.html");
                            /*  End code */


                            /*  Start code to load js and css files properly on Githubpages  */
                            loadHeaderFooter("header", "header.html");
                            loadHeaderFooter("footer", "footer.html");
                            /* End code */

                            function getCurrentFile() {
                                let file = new URLSearchParams(location.search).get("srcReq")
                                    || location.pathname.split("/").pop()
                                    || "index.html";

                                if (!file.includes(".")) file += ".html";

                                return file.toLowerCase();
                            }

                            function loadHeaderFooter(id, file) {
                                $("#" + id).load(file, function (_, status) {
                                    if (status === "error") return;
                                    const targetid = $("#" + id);
                                    targetid.find("a").addClass("edit-site");
                                    if (id !== "header") return;
                                    let current = getCurrentFile();

                                    // Show / hide sections
                                    targetid.find(".main-header-section").toggle(current === "index.html");
                                    targetid.find(".header-breadcrumb-section").toggle(current !== "index.html");
                                    // Match page name
                                    let name = "";
                                    targetid.find(".main-navigation a").each(function () {
                                        let href = ($(this).attr("href") || "").split("/").pop().toLowerCase();
                                        if (href === current) name = $(this).text().trim();
                                    });

                                    // Apply name (fallback safe)
                                    targetid.find(".Page_name").text(
                                        name || current.replace(".html", "").replace(/_/g, " ")
                                    );
                                });
                            }

                        });
                    </script>
                        <script src="assets/js/common_js/image_uploader.js"></script>

        </body>
        </html>
    `;
        if (fileName.toLowerCase() === "home") {
            fileName = "index";
        }
        filesDetailsMap[`${fileName}.html`] = newPageContent;

    });

    // filteredFooterPages.push("default-middle_section");  // Add DUmmy entry to add default middle section

    filteredFooterPages.forEach(pageName => {
        if (headerPages.includes(pageName)) {
            console.log("Skipping duplicate footer page:", pageName);
            return;
        }
        const allSectionsOfPage = [];
        // Add header section in the page
        // if (globalHeader) allSectionsOfPage.push(globalHeader);

        let middleKey = null;

        const keys = Object.keys(middleSections);

        let availableMiddleSectionsForPage = middleSections[pageName] || [];

        if (availableMiddleSectionsForPage.length > 0) {

            availableMiddleSectionsForPage.forEach(section => {
                allSectionsOfPage.push(section);
            });

        } else {

            console.warn("No middle section found for", pageName, "→ using default");

            allSectionsOfPage.push({
                id: "default-middle_section",
                template: "/assets/page_components/1-DO-NOT-DELETE_Default-blank-section/default-middle_section.html" // IMPORTANT
            });
        }

        if (allSectionsOfPage.length === 0) {
            alert(`No sections selected for export for ${pageName}`);
            return;
        }


        // Add footer section in the page
        // if (globalFooter) allSectionsOfPage.push(globalFooter);

        if (allSectionsOfPage.length === 0) {
            alert(`No sections selected for export for ${pageName}`);
            return;
        }

        let fileName = pageName.replace(/^footer_/, "");

        if (fileName.includes("_sub_")) {
            fileName = fileName.split("_sub_")[1];
        }

        //  convert only for file creation
        fileName = toFileName(fileName);


        let pageContent = '';
        var clientName = getCookie("clientName");
        var clientProjectName = getCookie("projectName");


        // allSectionsOfPage.forEach(sectionId => {

        //         // Try exact ID or prefix match
        //         let originalSection =
        //             document.getElementById(sectionId) ||
        //             document.querySelector(`[id^="${sectionId}"]`);

        //         if (!originalSection) {
        //             console.warn("Missing section in DOM:", sectionId);
        //             return;
        //         }

        //         const sectionClone = $(originalSection).clone();

        //         sectionClone.find(".radio-holder").remove();

        //         processImagesAndRemoveThemeClasses(sectionClone, clientName, clientProjectName);

        //         sectionClone.find(".company_name").contents().filter(function () {
        //             return this.nodeType === 3 &&
        //                    this.nodeValue.includes("Company Name");
        //         }).each(function () {
        //             this.nodeValue = this.nodeValue.replace(/Company Name/g, clientProjectName);
        //         });

        //         pageContent += `${sectionClone.html()}\n`;
        //     });

        allSectionsOfPage.forEach(section => {

            const sectionId = section.id;
            const templatePath = section.template;

            let sectionClone = null;

            const originalSection =
                document.getElementById(sectionId) ||
                document.querySelector(`[id^="${sectionId}"]`);

            //  CASE 1: DOM exists
            if (originalSection) {
                sectionClone = $(originalSection).clone();

                //  CASE 2: Load from template
            } else if (templatePath) {

                $.ajax({
                    url: templatePath,
                    type: "GET",
                    async: false,
                    success: function (html) {
                        const parsed = $(html);

                        //If section tag exists → use it
                        if (parsed.filter('section').length) {
                            sectionClone = parsed.filter('section');
                        }
                        else if (parsed.find('section').length) {
                            sectionClone = parsed.find('section').first();
                        }
                        else {
                            //fallback (wrap manually)
                            sectionClone = $('<section></section>').append(parsed);
                        }
                    },
                    error: function () {
                        console.error("Failed to load:", templatePath);
                    }
                });

            } else {
                console.error("Missing section:", sectionId);
                return;
            }

            if (!sectionClone) return;

            //  CLEAN EDIT MODE UI
            sectionClone.find(".radio-holder").remove();

            //  PROCESS IMAGES (THIS FIXES YOUR BROKEN IMAGE ISSUE)
            processImagesAndRemoveThemeClasses(sectionClone, clientName, clientProjectName);

            //  REPLACE COMPANY NAME
            const companyElement = sectionClone.find(".company_name");
            if (companyElement.length && clientProjectName?.trim()) {
                companyElement.html(clientProjectName);
            }
            // Email
            if (clientEmail?.trim()) {
                sectionClone.find(".client_email").each(function () {
                    $(this)
                        .text(clientEmail)
                        .attr("href", "mailto:" + clientEmail);
                });
            }

            // Mobile
            if (clientMobile?.trim()) {
                const cleanMobile = clientMobile.replace(/[^\d+]/g, "");
                sectionClone.find(".client_mobile").each(function () {
                    $(this)
                        .text(clientMobile)
                        .attr("href", "tel:" + cleanMobile);
                });
            }

            // Address
            if (clientAddress?.trim()) {

                const mapAddress = encodeURIComponent(clientAddress);

                sectionClone.find(".client_address").each(function () {
                    $(this)
                        .text(clientAddress)
                        .attr("href", `https://www.google.com/maps/search/?api=1&query=${mapAddress}`);
                });
            }


            // Whatsapp
            if (clientWhatsapp?.trim()) {
                sectionClone.find(".client_whatsapp").each(function () {
                    $(this).attr("href", clientWhatsapp);
                });
            }

        // Facebook
        if (clientFacebook?.trim()) {
            sectionClone.find(".client_facebook").each(function () {
                $(this).attr("href", clientFacebook);
            });
        }

        // Instagram
        if (clientInstagram?.trim()) {
            sectionClone.find(".client_instagram").each(function () {
                $(this).attr("href", clientInstagram);
            });
        }

        // LinkedIn
        if (clientLinkedin?.trim()) {
            sectionClone.find(".client_linkedin").each(function () {
                $(this).attr("href", clientLinkedin);
            });
        }

        // X / Twitter
        if (clientTwitter?.trim()) {
            sectionClone.find(".client_twitter").each(function () {
                $(this).attr("href", clientTwitter);
            });
        }

        // YouTube
        if (clientYoutube?.trim()) {
            sectionClone.find(".client_youtube").each(function () {
                $(this).attr("href", clientYoutube);
            });
        }

        // Pinterest
        if (clientPinterest?.trim()) {
            sectionClone.find(".client_pinterest").each(function () {
                $(this).attr("href", clientPinterest);
            });
        }

            // Logo Image
            if (logoImage && logoImage.startsWith("data:image")) {
                sectionClone.find(".client_logo").each(function () {
                    $(this).attr("src", logoImage);
                });
            }

            // Slider Image
            if (sliderImage && sliderImage.startsWith("data:image")) {
                sectionClone.find(".client_slider").each(function () {
                    $(this).attr("src", sliderImage);
                });
            }

            //  FINAL APPEND
            pageContent += `${sectionClone.html()}\n`;

        });
        let headerFont = $("." + globalHeader).css("font-family") || "'Roboto', sans-serif";
        // const seoInfo = SEOData[headerCategory] || { keywords: "", description: "" };
        let seoTitle = fileName || "Home";
        let seoDescription = "";
        let seoKeywords = "";

        try {

            const currentPageSEO =
                localStorage.getItem(`seo_${pageName}`);

            if (
                currentPageSEO &&
                typeof currentPageSEO === "string"
            ) {

                const titleMatch =
                    currentPageSEO.match(/SEO Title:\s*(.*)/i);

                const descMatch =
                    currentPageSEO.match(/Meta Description:\s*(.*)/i);

                const keywordMatch =
                    currentPageSEO.match(/Focus Keywords:\s*(.*)/i);

                function cleanSEOText(text = "") {

                    return text
                        .replace(/\*\*/g, '')
                        .replace(/^["']+|["']+$/g, '')
                        .replace(/\s+/g, ' ')
                        .trim();
                }

                seoTitle =
                    cleanSEOText(
                        titleMatch?.[1] || fileName
                    );

                seoDescription =
                    cleanSEOText(
                        descMatch?.[1] || ""
                    );

                seoKeywords =
                    cleanSEOText(
                        keywordMatch?.[1] || ""
                    );
            }

        } catch (e) {

            console.log("SEO ERROR", e);

        }

        const newPageContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="${seoDescription.replace(/"/g, '&quot;')}">
            <meta name="keywords" content="${seoKeywords.replace(/"/g, '&quot;')}">
            <base href='/'>
            <title>${seoTitle.replace(/"/g, '&quot;')}</title>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
              <link href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <link rel="stylesheet" href="assets/css/style.css">
            <link rel="stylesheet" href="assets/css/middle_sections.css">
            <link rel="stylesheet" href="assets/css/anim-effects.css">
            <link rel="stylesheet" href="assets/css/components/${globalHeader}.css">
            <link rel="stylesheet" href="assets/css/components/${globalFooter}.css">
            <link rel="stylesheet" href="assets/css/bootstrap.css">
            <link rel="stylesheet" href="assets/css/plugins.css">
            <link rel="stylesheet" href="assets/css/custom-Imports.css">
            <link rel="stylesheet" href="assets/css/custom/editmode.css">
            <link rel="stylesheet" href="assets/css/resonsive.css">
            <link rel="stylesheet" href="/media/projects/${clientName}/${clientProjectName}/assets/css/custom-theme-color.css">
            <link rel="stylesheet" href="assets/css/custom-theme-color.css">

            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css">
	<link rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css">
    <link rel="stylesheet" href="assets/css/custom-theme-colors.css">

<style>
        :root {
            --site-font:${headerFont};
        }

        body,
        #wrapper,
        #wrapper *:not(i):not([class^="ri-"]):not([class*=" ri-"]) {
            font-family: var(--site-font);
        }
    </style>

        </head>
       <body >
            <div id="wrapper">
            <div id="header" data-src="header.html"></div>
            <div id="mainPageContent">${pageContent}</div>
            <div id="footer" data-src="footer.html"></div>

            </div>
            ${clientWhatsapp?.trim() ? `
            <a href="${clientWhatsapp}" class="whatsapp-float client_whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <i class="ri-whatsapp-line icon-float"></i>
            </a>
        ` : ""}
            <script src="assets/js/jquery.js"></script>
            <script src="assets/js/middle-section.js"></script>
            <script src="assets/js/init.js"></script>
            <script src="assets/js/plugins.js"></script>
            <script src="assets/js/jquery.main.js"></script>
            <script src="assets/js/gsap.min.js"></script>
            <script src="assets/js/ScrollTrigger.min.js"></script>
            <script src="assets/js/Observer.min.js"></script>
            <script src="assets/js/gsap.effects.js"></script>
            <script src="https://colorjs.io/dist/color.global.js"></script>

            <script src="assets/js/common_js/send_email.js"></script>

            <script src="assets/js/common_js/html_image_editor.js"></script>
            <script src="assets/js/common_js/windows_postmessage.js"></script>

            <script src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"></script>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>

            <script>
                        $(function () {

                            /* Start code to load js and css files properly on local server or production server: NOte: this is the workwround, need to fix this */
                            loadHeaderFooter("header", "/media/projects/${clientName}/${clientProjectName}/header.html");
                            loadHeaderFooter("footer", "/media/projects/${clientName}/${clientProjectName}/footer.html");
                            /*  End code */

                            /*  Start code to load js and css files properly on Githubpages  */
                            loadHeaderFooter("header", "header.html");
                            loadHeaderFooter("footer", "footer.html");
                            /* End code */

                            function getCurrentFile() {
                                let file = new URLSearchParams(location.search).get("srcReq")
                                    || location.pathname.split("/").pop()
                                    || "index.html";

                                if (!file.includes(".")) file += ".html";

                                return file.toLowerCase();
                            }

                            function loadHeaderFooter(id, file) {
                                $("#" + id).load(file, function (_, status) {
                                    if (status === "error") return;
                                    const targetid = $("#" + id);
                                    targetid.find("a").addClass("edit-site");
                                    if (id !== "header") return;
                                    let current = getCurrentFile();

                                    // Show / hide sections
                                    targetid.find(".main-header-section").toggle(current === "index.html");
                                    targetid.find(".header-breadcrumb-section").toggle(current !== "index.html");
                                    // Match page name
                                    let name = "";
                                    targetid.find(".main-navigation a").each(function () {
                                        let href = ($(this).attr("href") || "").split("/").pop().toLowerCase();
                                        if (href === current) name = $(this).text().trim();
                                    });

                                    // Apply name (fallback safe)
                                    targetid.find(".Page_name").text(
                                        name || current.replace(".html", "").replace(/_/g, " ")
                                    );
                                });
                            }

                        });
                    </script>
                        <script src="assets/js/common_js/image_uploader.js"></script>

        </body>
        </html>
    `;
        filesDetailsMap[`${fileName}.html`] = newPageContent;

    });
    filesDetailsMap["imagesNameList"] = imagesNameList;


    // alert("Theme Css before creating theme.css: " + JSON.stringify(themeCSS));
    console.log("websiteThemeColor =", getCookie("websiteThemeColor"));


    let requiredCSS = new Set();

    requiredCSS.add("assets/css/style.css");
    requiredCSS.add("assets/css/middle_sections.css");
    requiredCSS.add("assets/css/anim-effects.css");
    requiredCSS.add("assets/css/bootstrap.css");
    requiredCSS.add("assets/css/plugins.css");
    requiredCSS.add("assets/css/custom-Imports.css");
    requiredCSS.add("assets/css/resonsive.css");

    if (globalHeader) {
        requiredCSS.add(
            `assets/css/components/${globalHeader}.css`
        );
    }

    if (globalFooter) {
        requiredCSS.add(
            `assets/css/components/${globalFooter}.css`
        );
    }

    function addMiddleSectionCSS(pageList) {
        pageList.forEach(pageName => {
            let availableMiddleSectionsForPage = middleSections[pageName] || [];
            availableMiddleSectionsForPage.forEach(section => {
                if (section.id) {
                    requiredCSS.add(
                        `assets/css/components/${section.id}.css`
                    );
                }
            });
        });
    }

    addMiddleSectionCSS(headerPages);
    addMiddleSectionCSS(filteredFooterPages);




    // let excludedJS = new Set();

    // excludedJS.add("assets/js/editmode.js");
    // excludedJS.add("assets/js/editModeScript.js");
    // excludedJS.add("assets/js/export.js");
    // excludedJS.add("assets/js/main.js");
    // excludedJS.add("assets/js/preview-site.js");

    // window.excludedJSFiles = Array.from(excludedJS);

    // alert("excludedjsfiles-----\n" + excludedjsfiles.join("\n"));

    // // filesDetailsMap["excludedJSFiles"] = excludedjsfiles;


    // window.requiredCSSFiles = Array.from(requiredCSS);

    // alert("cssFilesArray-----"+ cssFilesArray.join("\n"));

    // filesDetailsMap["requiredCSSFiles"] = cssFilesArray;

    uploadFilesData(filesDetailsMap);
}
function uploadFilesData(filesDetailsMap) {
    displayLoadingMessage();
    $("#publishClienthWebsite").show();
    $("#publishBtnSales").show();


const themeMode = getCookie("themeMode") || "default";

let themeCSS = "";

if (themeMode === "default") {

    themeCSS = "Default theme";

} else {

    const websiteThemeColor = getCookie("websiteThemeColor") || "#FFFFFF";

    const themeData = generateThemeCSS(websiteThemeColor);

    themeCSS = themeData.css;

}


    filesDetailsMap["clientName"] = getCookie("clientName");
    filesDetailsMap["clientProjectName"] = getCookie("projectName");
    filesDetailsMap["themeCSS"] = themeCSS;
    filesDetailsMap["Is_ai_generated_image_processed"] =
    getCookie("Is_ai_generated_image_processed") || "no";


    console.log(
        "Is_ai_generated_image_processed:",
        filesDetailsMap["Is_ai_generated_image_processed"]
    );
    // filesDetailsMap["reqFor"] =  "preview";
    console.log("clientName:", getCookie("clientName"));
    console.log("projectName:", getCookie("projectName"));
    $.ajax({
        type: 'POST',
        url: "indexOld/",
        dataType: "text",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(filesDetailsMap),
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": getCookie("csrftoken"),  // don't forget to include the 'getCookie' function
        },
        success: function (data) {
            //    showCustomAlertBox('success', 'Uploaded the data');
            //   alert("Uploaded the data");
            $('#loading-message').remove();
            // Clear all cookies
            // clearAllCookies();
            // location.reload();
            // $('#openIndex').trigger('click', [getCookie("clientName"), getCookie("projectName"),true]);
            openPreview();
        },
        error: function (xhr, errmsg, err) {
            console.log("Error----" + xhr.responseText);
            $('#loading-message').remove();
        }
    });
}
// for preview in mobile and desktop view in one frame
function openPreview() {

    var filename = "index.html";
    var clientName = getCookie('clientName');
    var clientProjectName = getCookie('projectName');
// alert("middle_AI_generated_sections---"+ getCookie('middle_AI_generated_sections'));

    setCookie('preview', 'true', 7);
    var newTab = window.open("", "_blank");
    $.ajax({
        type: 'POST',
        url: "es/",
        data: {
            clientName: clientName,
            clientProjectName: clientProjectName,
            srcReq: filename
        },
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        },

        success: function (data) {
            injectPreviewShell(newTab, data);
            // var newTab = window.open(`/es/?srcReq=${filename}`, "_blank");

            // var interval = setInterval(function () {
            //     try {
            //         if (newTab.document && newTab.document.readyState === 'complete') {
            //             clearInterval(interval);
            //             injectPreviewShell(newTab, data);
            //         }
            //     } catch (e) {}
            // }, 50);
        },
        error: function (err) {
            alert(err.responseJSON?.errorMessage || 'Something went wrong');
        }
    });

    return false;

    /* ================= PREVIEW SHELL ================= */

    function injectPreviewShell(newTab, pageHtml) {
        const iconLink = newTab.document.createElement("link");
        iconLink.rel = "stylesheet";
        iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css";
        newTab.document.head.appendChild(iconLink);
        newTab.document.body.innerHTML = `
                    <style>
                    body {
                        margin: 0;
                        background: #1f222b;
                        font-family: system-ui, -apple-system, Segoe UI;
                        height: 100vh;
                        overflow: hidden;
                    }

                    .preview-topbar {
                        height: 56px;
                        background: #2a2d38;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 14px;
                        border-bottom: 1px solid rgba(255,255,255,.1);
                    }

                    .preview-btn {
                        width: 42px;
                        height: 42px;
                        border-radius: 10px;
                        border: none;
                        background: #3a3f55;
                        color: #fff;
                        cursor: pointer;
                        font-size: 18px;
                        opacity: .6;
                    }

                    .preview-btn.active {
                        background: linear-gradient(135deg, #e39a4e, #fb1b1b);
                        opacity: 1;
                    }

                    .preview-body {
                        height: calc(100vh - 56px);
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        padding: 20px;
                        overflow: auto;
                    }

                    .desktop-frame {
                        width: 100%;
                        height: 100%;
                    }

                    .mobile-frame {
                        width: 390px;
                        height: calc(100vh - 56px - 40px);
                        max-height: 720px;
                        background: #000;
                        border-radius: 30px;
                        padding: 10px;
                        box-shadow: 0 25px 60px rgba(0,0,0,.6);
                    }

                    iframe {
                        width: 100%;
                        height: 93%;
                        border: none;
                        background: #fff;
                        border-radius: 22px;
                    }

                    .hidden { display: none; }
                    .preview-btn {
                        position: relative;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    /* ================= Tooltip Base ================= */

                    .preview-btn::after {
                        content: attr(data-tooltip);
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%) translateX(0) scale(.95);
                        background: #333749;
                        color: #fff;
                        padding: 7px 14px;
                        font-size: 13px;
                        border-radius: 10px;
                        white-space: nowrap;
                        opacity: 0;
                        pointer-events: none;
                        transition: all .25s ease;
                        box-shadow: 0 12px 30px rgba(0,0,0,.4);
                        z-index: 1000;
                        margin-left: 2px;
                    }

                    /* Show on hover */
                    .preview-btn:hover::after {
                        opacity: 1;
                        transform: translateY(-50%) scale(1);
                    }

                    /* ================= Positioning ================= */

                    /* Desktop → Tooltip on LEFT */
                    .preview-btn[data-position="left"]::after {
                        right: 115%;
                    }

                    /* Mobile → Tooltip on RIGHT */
                    .preview-btn[data-position="right"]::after {
                        left: 115%;
                    }

                    /* ================= Arrow (Notch) ================= */

                    .preview-btn::before {
                        content: "";
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%) scale(.9);
                        width: 0;
                        height: 0;
                        opacity: 0;
                        transition: all .25s ease;
                        z-index: 999;
                    }

                    /* Show arrow on hover */
                    .preview-btn:hover::before {
                        opacity: 1;
                        transform: translateY(-50%) scale(1);
                    }

                    /* Arrow for Desktop (right side of tooltip) */
                    .preview-btn[data-position="left"]::before {
                        right: 99%;
                        border-top: 6px solid transparent;
                        border-bottom: 6px solid transparent;
                        border-left: 8px solid #404459;
                    }

                    /* Arrow for Mobile (left side of tooltip) */
                    .preview-btn[data-position="right"]::before {
                        left: 99%;
                        border-top: 6px solid transparent;
                        border-bottom: 6px solid transparent;
                        border-right: 8px solid #404459;
                    }

                    </style>

                    <div class="preview-topbar">
                        <button id="desktopBtn"
                            class="preview-btn active"
                            data-tooltip="Desktop Preview"
                            data-position="left">
                            <i class="bi bi-display"></i>
                        </button>

                        <button id="mobileBtn"
                            class="preview-btn"
                            data-tooltip="Mobile Preview"
                            data-position="right">
                            <i class="bi bi-phone"></i>
                        </button>
                    </div>


                    <div class="preview-body">
                        <div id="desktopView" class="desktop-frame">
                            <iframe id="desktopIframe"></iframe>
                        </div>

                        <div id="mobileView" class="mobile-frame hidden">
                            <iframe id="mobileIframe"></iframe>
                        </div>
                    </div>
                `;

        const desktopIframe = newTab.document.getElementById('desktopIframe');
        const mobileIframe = newTab.document.getElementById('mobileIframe');

        desktopIframe.onload = () => hideTopBar(desktopIframe.contentDocument);
        mobileIframe.onload = () => hideTopBar(mobileIframe.contentDocument);

        desktopIframe.contentDocument.open();
        desktopIframe.contentDocument.write(pageHtml);
        desktopIframe.contentDocument.close();

        mobileIframe.contentDocument.open();
        mobileIframe.contentDocument.write(pageHtml);
        mobileIframe.contentDocument.close();

        const desktopBtn = newTab.document.getElementById('desktopBtn');
        const mobileBtn = newTab.document.getElementById('mobileBtn');
        const desktopView = newTab.document.getElementById('desktopView');
        const mobileView = newTab.document.getElementById('mobileView');

        desktopBtn.onclick = () => {
            desktopView.classList.remove('hidden');
            mobileView.classList.add('hidden');
            desktopBtn.classList.add('active');
            mobileBtn.classList.remove('active');
        };

        mobileBtn.onclick = () => {
            mobileView.classList.remove('hidden');
            desktopView.classList.add('hidden');
            mobileBtn.classList.add('active');
            desktopBtn.classList.remove('active');
        };
    }

    function hideTopBar(doc) {
        let tries = 0;
        const i = setInterval(() => {
            const bar = doc.getElementById('top-bar');
            if (bar) {
                bar.style.display = 'none';
                clearInterval(i);
            }
            if (++tries > 50) clearInterval(i);
        }, 100);
    }
}




// function openPreview(){
//     //alert('hello...........')
//       var filename = "index.html";
//         var clientName = getCookie('clientName');
//         var clientProjectName = getCookie('projectName');
//         setCookie('preview','true',7)

//         $.ajax({
//             type: 'POST',
//             url: "es/",
//             data: {
//             'clientName': clientName,
//             'clientProjectName': clientProjectName,
//             'srcReq': filename,
//             },
//             headers: {
//                  "X-Requested-With": "XMLHttpRequest",
//             },
//             success: function (data) {
//                 console.log('data: ', data)
//                 window.open(`/es/?srcReq=${filename}`, "_blank");


//             },
//             error: function (data, errmsg, err) {
//                 alert(data.responseJSON.errorMessage);
//             }
//           });
//           return false;
//  }





// removed space from page name
function toFileName(name) {
    return name.trim().replace(/\s+/g, "_");
}

// Convert file name back to display format
function toDisplayName(name) {
    return name.replace(/_/g, " ");
}




function cleanPageName(pageName) {
    if (pageName.startsWith('header_')) {
        return pageName.replace(/^header_/, '');
    }
    return null;
}

// Generate menu content dynamically based on main and subpages
function generateMenu(mainPages, subPages) {
    let menuContent = '<ul class="nav navbar-nav navbar-right main-navigation text-uppercase font-lato">';
    mainPages.forEach(mainPage => {
        const cleanedMainPage = cleanPageName(mainPage);
        if (cleanedMainPage) {
            if (["home", "index"].includes(cleanedMainPage.toLowerCase())) {
                menuContent += `<li><a href="index.html">Home</a></li>`;
            } else if (subPages[mainPage]) {
                // Generate dropdown for subpages under the main page
                menuContent += `
                    <li class="dropdown">
                        <a href="${cleanedMainPage}.html" class="dropdown-toggle" role="button"
                            aria-haspopup="true" aria-expanded="false">${cleanedMainPage}</a>
                        <ul class="dropdown-menu">
                        ${subPages[mainPage].map(subPage =>
                    `<li><a href="${toFileName(subPage)}.html">${toDisplayName(subPage)}</a></li>`
                ).join('')}
                        </ul>
                    </li>`;
            } else {

                // space removed from page
                // const cleanedMainPageWithoutSpace = cleanedMainPage.replace(/ /g, "_");
                // menuContent += `<li><a href="${cleanedMainPageWithoutSpace}.html">${cleanedMainPage}</a></li>`;

                menuContent += `<li><a href="${toFileName(cleanedMainPage)}.html">${toDisplayName(cleanedMainPage)}</a></li>`;
            }
        }
    });
    menuContent += '</ul>';
    return menuContent;
}


// Clean footer page names by removing the "footer_" prefix
function cleanFooterName(pageName) {
    // Only clean the name if it starts with "footer_"
    if (pageName.startsWith('footer_')) {
        return pageName.replace(/^footer_/, '');
    }
    return null;
}




function generateFooterLinks() {
    const footerPagesCookie = getCookie('FooterPages');
    const footerPagesObj = JSON.parse(footerPagesCookie);

    let footerContent = [];

    footerPagesObj.forEach(footerMenuObj => {
        const footerTitle = Object.keys(footerMenuObj)[0];
        const footerLinks = footerMenuObj[footerTitle];

        const footerData = {
            title: footerTitle,
            links: footerLinks.map(link => {
                return {
                    name: toDisplayName(link),
                    url: toFileName(link)
                };
            })
        };

        footerContent.push(footerData);  // Add footer data to the content array
    });

    return footerContent;
}







// On export button click
$(document).off('click.exportSEO', '#export-btn').on('click.exportSEO', '#export-btn', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const clientName = getCookie("clientName");
    const projectName = getCookie("projectName");

    if (!clientName || !projectName) {
        alert("Client and Project details missing. Please fill them first.");
        return;
    }

    const hasSEOData =
        typeof seoGeneratedData !== "undefined" &&
        seoGeneratedData &&
        typeof seoGeneratedData === "object" &&
        Object.keys(seoGeneratedData).length > 0;

    if (!hasSEOData) {
        createHTMLFilesDataForWebsiteLinks();
        return;
    }

    const oldPopup = document.getElementById("seo-export-warning");
    if (oldPopup) {
        oldPopup.remove();
    }

    const popup = document.createElement("div");
    popup.id = "seo-export-warning";

    popup.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999999;
        font-family:'quicksand', sans-serif;
    `;

    popup.innerHTML = `
        <div style="
            width: 420px;
            max-width: calc(100% - 30px);
            background: #fff;
            border-radius: 14px;
            padding: 28px;
            box-sizing: border-box;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.25);

        ">
            <div style="
                font-size: 18px;
                font-weight: 600;
                color: #222;
                margin-bottom: 12px;
            ">
                Warning
            </div>

            <div style="
                font-size: 14px;
                line-height: 1.6;
                color: #555;
                margin-bottom: 24px;
                font-family:'quicksand', sans-serif;
            ">
                Your generated SEO data will be lost if you continue.
                Do you want to go ahead?
            </div>

            <div style="
                display: flex;
                justify-content: center;
                gap: 12px;
            ">
                <button type="button" id="seo-export-cancel" style="
                    min-width: 110px;
                    padding: 8px 20px;
                    border: 1px solid #ddd;
                    border-radius: 30px;
                    background: #f5f5f5;
                    color: #333;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    Cancel
                </button>

                <button type="button" id="seo-export-go-ahead" style="
                    min-width: 110px;
                    padding: 8px 20px;
                    border: none;
                    border-radius: 30px;
                    background: #222;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    background: linear-gradient(135deg, #e39a4e, #fb1b1b);
                ">
                    Go Ahead
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById("seo-export-cancel").onclick = function () {
        popup.remove();
    };

    document.getElementById("seo-export-go-ahead").onclick = function () {
        seoGeneratedData = {};
        seoDataCapture = "No";
        window.seoGenerated = false;

        popup.remove();

        createHTMLFilesDataForWebsiteLinks();
    };
});

// $('#export-btn').on('click', function () {

//     const clientName = getCookie("clientName");
//     const projectName = getCookie("projectName");
//     if (clientName && projectName) {

//         // $('#exportModal').modal('hide');
//         createHTMLFilesDataForWebsiteLinks();
//     } else {
//         alert('Please enter both client and project names.');
//     }
// });



// Function to clear all cookies
function clearAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const cookieName = cookie.split("=")[0].trim();
        document.cookie = cookieName + "=;expires=" + new Date(0).toUTCString() + ";path=/";
    }
}
// Clear input fields after export
document.getElementById('clientName').value = "";
document.getElementById('projectName').value = "";


