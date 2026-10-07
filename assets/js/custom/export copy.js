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
const SEOData = {
    // Local Businesses
    "Salon & Spa": {
        keywords: "salon, spa, hair care, beauty treatments, skincare",
        description: "Premium salon and spa services offering haircuts, styling, skincare, massages, and beauty treatments to rejuvenate and refresh."
    },
    "Gym": {
        keywords: "gym, fitness, workout, personal trainer, strength training",
        description: "State-of-the-art gyms providing fitness programs, personal training, strength training, and wellness guidance for a healthy lifestyle."
    },
    "Clinic": {
        keywords: "clinic, healthcare, medical services, doctor, health checkup",
        description: "Professional medical clinics offering general health checkups, consultations, treatments, and specialized healthcare services."
    },
    "Café": {
        keywords: "café, coffee, snacks, beverages, casual dining",
        description: "Cozy cafés providing freshly brewed coffee, delicious snacks, light meals, and a relaxing environment to unwind."
    },
    "Restaurant": {
        keywords: "restaurant, dining, food, cuisine, meals",
        description: "Restaurants offering a wide range of cuisines, fine dining experiences, and delicious meals for individuals and families."
    },
    "Real Estate Agencies": {
        keywords: "real estate, property, buying, selling, renting",
        description: "Expert real estate agencies assisting in buying, selling, and renting residential and commercial properties."
    },
    "Travel Agencies": {
        keywords: "travel agency, tours, vacation packages, flights, hotel bookings",
        description: "Professional travel agencies offering customized tour packages, flight bookings, hotel reservations, and travel planning services."
    },

    // Service Provider
    "Architect": {
        keywords: "architect, architecture services, building design, planning",
        description: "Professional architects providing building design, planning, 3D modeling, and construction consultancy services."
    },
    "Interior Designer": {
        keywords: "interior designer, home decor, interior planning, furnishings",
        description: "Creative interior designers delivering stylish and functional interior solutions for homes, offices, and commercial spaces."
    },
    "Photographer/Videographer": {
        keywords: "photographer, videographer, photography services, video production",
        description: "Professional photography and videography services for events, weddings, portraits, and commercial projects."
    },
    "Event Planner": {
        keywords: "event planner, event management, party planning, corporate events",
        description: "Expert event planners managing weddings, corporate events, parties, and other special occasions with seamless execution."
    },
    "Chartered Accountant": {
        keywords: "chartered accountant, accounting, taxation, financial advisory",
        description: "Certified chartered accountants offering accounting, taxation, audit, and financial advisory services for businesses and individuals."
    },
    "Company Secretary": {
        keywords: "company secretary, compliance, corporate governance, legal documentation",
        description: "Professional company secretaries ensuring corporate compliance, governance, and proper documentation for businesses."
    },
    "Advocate": {
        keywords: "advocate, lawyer, legal services, litigation, legal advice",
        description: "Experienced advocates providing legal consultation, representation, and litigation services for individuals and businesses."
    },
    "Music Coach": {
        keywords: "music coach, music lessons, instruments, singing lessons",
        description: "Professional music coaches offering lessons in instruments, vocals, and music theory for beginners and advanced learners."
    },
    "Makeup Artists": {
        keywords: "makeup artist, bridal makeup, beauty services, cosmetics",
        description: "Skilled makeup artists providing professional bridal makeup, special occasion makeup, and beauty enhancement services."
    },
    "Financial Advisors": {
        keywords: "financial advisor, investment, wealth management, financial planning",
        description: "Certified financial advisors offering investment planning, wealth management, retirement planning, and financial guidance."
    },

    // Education & Learning
    "Coaching Center": {
        keywords: "coaching center, tutoring, exam preparation, academic guidance",
        description: "Professional coaching centers providing subject tutoring, exam preparation, and academic guidance for students."
    },
    "Tutor": {
        keywords: "tutor, private lessons, education, online tutoring",
        description: "Experienced tutors offering private lessons and online tutoring in various subjects for all academic levels."
    },
    "Pre-school & Daycare": {
        keywords: "preschool, daycare, early childhood education, childcare",
        description: "Quality preschool and daycare services providing early childhood education, learning activities, and safe childcare."
    },
    "School": {
        keywords: "school, education, primary school, secondary school",
        description: "Educational institutions offering primary and secondary education with comprehensive curricula and extracurricular activities."
    },
    "College": {
        keywords: "college, higher education, undergraduate, postgraduate courses",
        description: "Colleges providing undergraduate, postgraduate courses, and professional programs with experienced faculty and campus facilities."
    },

    // Professional Showcase
    "Portfolio": {
        keywords: "portfolio, professional showcase, projects, work samples",
        description: "Personal and professional portfolios showcasing creative work, projects, achievements, and expertise for career growth."
    },
    "Influencer": {
        keywords: "influencer, social media, brand promotion, content creation",
        description: "Social media influencers creating engaging content, promoting brands, and connecting with their audience effectively."
    },
    "Blogger/Vlogger": {
        keywords: "blogger, vlogger, content creation, online writing, video blogging",
        description: "Bloggers and vloggers producing high-quality written and video content, sharing expertise, reviews, and personal experiences online."
    },

    // Health & Wellness
    "Fitness & Gym": {
        keywords: "fitness, gym, workout, personal training, health",
        description: "Fitness and gym services offering workout routines, personal training, wellness programs, and health improvement guidance."
    },
    "Yoga & Meditation": {
        keywords: "yoga, meditation, wellness, mindfulness, relaxation",
        description: "Yoga and meditation classes promoting physical, mental, and spiritual wellness through guided practices."
    },
    "Nutritionist": {
        keywords: "nutritionist, diet plan, healthy eating, weight management",
        description: "Professional nutritionists providing personalized diet plans, healthy eating guidance, and weight management solutions."
    },
    "Clinic": {
        keywords: "clinic, medical services, healthcare, treatment, consultation",
        description: "Clinics offering professional healthcare services, medical consultation, and treatment for various health conditions."
    },
    "Pharmacy": {
        keywords: "pharmacy, medicines, prescriptions, health products",
        description: "Pharmacies providing prescription medications, health products, and over-the-counter treatments for wellness and recovery."
    },
    "Fitness Coach": {
        keywords: "fitness coach, personal training, health guidance, workout plan",
        description: "Certified fitness coaches offering personalized workout plans, nutrition advice, and guidance for physical fitness."
    },

    // Food & Hospitality
    "Restaurants": {
        keywords: "restaurants, dining, food, cuisine, meals",
        description: "Restaurants offering diverse cuisines, quality dining experiences, and delicious meals for individuals, families, and groups."
    },
    "Cafes & Bakeries": {
        keywords: "cafe, bakery, coffee, pastries, snacks",
        description: "Cafes and bakeries providing freshly baked goods, coffee, pastries, and a cozy environment for relaxation."
    },
    "Catering Services": {
        keywords: "catering services, event catering, food delivery, party catering",
        description: "Professional catering services offering customized menus, food preparation, and delivery for events and gatherings."
    },
    "Hotel/Lounges": {
        keywords: "hotel, lounge, accommodation, hospitality, stay",
        description: "Hotels and lounges providing comfortable accommodations, hospitality services, and dining facilities for guests."
    },

    // Events & Entertainment
    "Event Planner": {
        keywords: "event planner, event management, wedding planning, corporate events",
        description: "Expert event planners managing weddings, corporate events, and private parties with creativity and flawless execution."
    },
    "Event Booking Platform": {
        keywords: "event booking, online platform, tickets, event management",
        description: "Online event booking platforms allowing easy ticketing, scheduling, and management of various events and experiences."
    },

    // Nonprofit & Community
    "Charity/NGO": {
        keywords: "charity, NGO, nonprofit, donations, social work",
        description: "Charity organizations and NGOs working to support communities, raise funds, and create social impact through various initiatives."
    },
    "Religious Organizations": {
        keywords: "religious organization, faith, spiritual services, worship",
        description: "Religious organizations providing spiritual guidance, community services, and places of worship for followers."
    },

    // Automotive & Transportation
    "Car Dealerships": {
        keywords: "car dealership, vehicles, car sales, new cars, used cars",
        description: "Car dealerships offering new and pre-owned vehicles, financing options, and after-sales services."
    },
    "Auto Repair Shops": {
        keywords: "auto repair, car maintenance, vehicle service, mechanic",
        description: "Auto repair shops providing vehicle maintenance, repair services, diagnostics, and mechanical solutions."
    },
    "Car Rentals": {
        keywords: "car rental, vehicle hire, transportation, travel",
        description: "Car rental services providing vehicles for short-term or long-term hire for personal or business travel."
    },
    "Logistics & Shipping": {
        keywords: "logistics, shipping, freight, delivery, transport services",
        description: "Logistics and shipping companies offering transport, freight forwarding, and delivery solutions for businesses and individuals."
    },
    "Rideshare Services": {
        keywords: "rideshare, taxi, cab service, transportation, driver",
        description: "Rideshare services offering convenient, on-demand transportation options with professional drivers."
    },

    // Sports & Recreation
    "Sports Clubs": {
        keywords: "sports club, fitness, team sports, recreation, activities",
        description: "Sports clubs providing facilities and training for team sports, recreational activities, and fitness programs."
    },
    "Sporting Goods Stores": {
        keywords: "sporting goods, equipment, sports store, gear",
        description: "Sporting goods stores offering equipment, apparel, and gear for various sports and recreational activities."
    },
    "Game Zone": {
        keywords: "game zone, entertainment, arcade, gaming center",
        description: "Game zones and arcades offering fun, interactive entertainment, and gaming experiences for all ages."
    },

    // Pets & Animals
    "Pet Store": {
        keywords: "pet store, pets, pet supplies, animals, pet care",
        description: "Pet stores offering a wide range of pets, food, accessories, and healthcare products for your beloved animals."
    },
    "Pet Grooming": {
        keywords: "pet grooming, pet care, bathing, trimming, pets",
        description: "Professional pet grooming services including bathing, trimming, and styling for all types of pets."
    },
    "Animal Shelters": {
        keywords: "animal shelter, rescue, adoption, pets, shelter",
        description: "Animal shelters rescuing, caring for, and facilitating adoption of homeless and abandoned animals."
    },

    // Repair & Maintenance
    "Fabrication": {
        keywords: "fabrication, metal work, welding, custom structures",
        description: "Professional fabrication services providing metalwork, welding, and custom structure creation for various projects."
    },
    "Plumbing": {
        keywords: "plumber, plumbing services, leak repair, pipe installation",
        description: "Expert plumbing services for residential and commercial plumbing, leak repair, and pipe installations."
    },
    "Civil Work": {
        keywords: "civil work, construction, building services, infrastructure",
        description: "Civil work services including construction, building maintenance, infrastructure projects, and structural solutions."
    },
    "Electrician": {
        keywords: "electrician, electrical services, wiring, installation, maintenance",
        description: "Professional electricians providing installation, repair, and maintenance of electrical systems for homes and businesses."
    },
    "Carpenter": {
        keywords: "carpenter, woodworking, furniture, repairs",
        description: "Skilled carpenters providing furniture making, repairs, custom woodworking, and cabinetry services."
    },
    "Cleaning Service": {
        keywords: "cleaning service, housekeeping, janitorial, office cleaning, home cleaning",
        description: "Professional cleaning services offering residential, commercial, and specialized cleaning solutions."
    },
    "Electronic Item Services": {
        keywords: "electronics repair, gadget service, device maintenance, tech support",
        description: "Expert electronic repair services for gadgets, home appliances, and electronic devices with reliable maintenance solutions."
    }
};

    var imagesNameList = "";
    const globalHeader = getCookie('globalHeader');
    const globalFooter = getCookie('globalFooter');
    const headerPages = JSON.parse(getCookie('HeaderPages'));

    const middleSectionsCookie = getCookie('middle_sections');
    const middleSections = {}
    if(middleSectionsCookie != undefined) {
        const middleSectionsObj = JSON.parse(middleSectionsCookie);
        for(const key in middleSectionsObj){
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

    const filteredFooterPages = FooterPages.filter(page => !headerPages.includes(page));
    if (globalHeader.indexOf("header")!=0 || globalFooter.indexOf("footer")!=0) {
       alert('You forgot to add Header or Footer for your website so please add before proceeding further.');
        return;
    }

    const mainPages = [];
    const subPages = {};

    // Separate main pages and subpages
    headerPages.forEach(page => {
        if (page.includes('_sub_')) {
            const [mainPage, subPage] = page.split('_sub_');
            if (!subPages[mainPage]) {
                subPages[mainPage] = [];
            }
            subPages[mainPage].push(subPage);
        } else {
            mainPages.push(page);
        }
    });
    // Generate Common Header with Menus for all the pages
    const headerSection = $(`#${globalHeader}`);
    headerSection.find('.radio-holder').remove();

    // Capture the category of the selected header
    let headerCategory = headerSection.attr('category') || "";


    if (globalHeader.includes('header-')) {
        const menuContent = generateMenu(mainPages, subPages);
        headerSection.find('#dynamic-header').html(menuContent);
    }

    // Generate Common Footer with Menus for all the pages
    const footerSection = $(`#${globalFooter}`);
    footerSection.find('.radio-holder').remove();

    if (globalFooter.includes('footer-')) {
        const footerContent = generateFooterLinks();

        // Loop through each nav and update the content
        const existingNavs = $("." + globalFooter + "_old");

        existingNavs.each(function(index) {
            const existingNav = $(this);
            const footerData = footerContent[index];

            if (footerData) {
                existingNav.find("#quick-link-title").text(footerData.title);

                // Replace the links inside the <ul> element
                const ulElement = existingNav.find(".footer-navigation");
                ulElement.empty();  // Clear current list items

                // Add new list items
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
        if (imgName && !imagesNameList.includes(imgName)) {
            imagesNameList += "," + imgName;
        }
    }
    var clientName = getCookie("clientName");
    var clientProjectName =  getCookie("projectName");
    function processImagesAndRemoveThemeClasses(section, clientName, clientProjectName) {
        // Handle images and background images

        section.find('img').each(function() {
            const oldSrc = $(this).attr("src");
            if (oldSrc && (oldSrc.endsWith(".jpeg") || oldSrc.endsWith(".JPG") || oldSrc.endsWith(".jpg") || oldSrc.endsWith(".png") || oldSrc.endsWith(".svg"))) {
                // Check if the src contains 'assets/images/' and replace it
                if (oldSrc.includes("assets/images/")) {
                    //const newSrc = oldSrc.replace("assets/images/", `assets/clients/${clientName}/${clientProjectName}/images/`);
                    const newSrc = oldSrc.replace("assets/images/", `assets/images/`);
                    $(this).attr("src", newSrc); // Update the src attribute
                }
                addImagesToList(oldSrc); // Always add the oldSrc to the list
            }
        });

        section.find('*').each(function() {
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

            // Remove theme classes
            const classNames = $(this).attr('class');
            if (classNames) {
                classNames.split(' ').forEach((className) => {
                    if (className.startsWith('theme-')) {
                        $(this).removeClass(className);
                    }
                });
            }
        });
    }


    // Process header and footer sections
    processImagesAndRemoveThemeClasses(headerSection,clientName, clientProjectName);
    processImagesAndRemoveThemeClasses(footerSection,clientName, clientProjectName);

    const headerHTML = headerSection.html();
    const footerHTML = footerSection.html();

    // Save the header.html and footer.html content in the filesDetailsMap
    filesDetailsMap["header.html"] = headerHTML;
    filesDetailsMap["footer.html"] = footerHTML;

    // headerPages.push("default-middle_section");  // Add DUmmy entry to add default middle section
    // Iterate over the pages to generate content for each page
    headerPages.forEach(pageName => {

        const allSectionsOfPage = [];

        // Add header section in the page
        // if (globalHeader) allSectionsOfPage.push(globalHeader);

        // Add mid sections in the page
            let middleKey = null;
            if (middleSections["header_" + pageName]) {
                middleKey = "header_" + pageName;

            // Try pageName as fallback
            } else if (middleSections[pageName]) {
                middleKey = pageName;
            }

            if (middleKey && middleSections[middleKey].length > 0) {
                const availableMiddleSectionsForPage = middleSections[middleKey];
                availableMiddleSectionsForPage.forEach(sectionId => {
                    allSectionsOfPage.push(sectionId);
                });
            } else {
                console.warn("No middle section found for", pageName, " → using default");
                allSectionsOfPage.push("default-middle_section");
            }

        // Add footer section in the page
        // if (globalFooter) allSectionsOfPage.push(globalFooter);

        if (allSectionsOfPage.length === 0) {
            alert(`No sections selected for export for ${pageName}`);
            return;
        }

        let fileName = pageName;
        fileName = fileName.replace(/^(header_)/, ''); // Clean up prefix

        if (fileName.includes('_sub_')) {
            fileName = fileName.split('_sub_')[1];
        }

        let pageContent = '';
        allSectionsOfPage.forEach(sectionId => {

            const originalSection =
            document.getElementById(sectionId) ||
            document.querySelector(`[id^="${sectionId}"]`);

            if (!originalSection) {
                console.warn("Missing section in DOM:", sectionId);
                return;  //  Prevents blank pages
            }

            const sectionClone = $(originalSection).clone();
            sectionClone.find('.radio-holder').remove();
            // sectionClone.find('img').each(function() {
            //     const oldSrc = $(this).attr("src");
            //     const imgName = oldSrc.split("assets/images/")[1];
            //     $(this).attr("src", "assets/clients/"+clientName+"/"+clientProjectName+"/images/" + imgName);
            //     if(!imagesNameList.includes(imgName)){
            //         imagesNameList = imagesNameList + "," + imgName;
            //     }

            // });
            // sectionClone.find('*').each(function() {
            //     const classNames = $(this).attr('class');
            //     if (classNames) {
            //         classNames.split(' ').forEach((className) => {
            //             if (className.startsWith('theme-')) {
            //                 $(this).removeClass(className);
            //             }
            //         });
            //     }
            // });

        processImagesAndRemoveThemeClasses(sectionClone,clientName, clientProjectName);





sectionClone.find('.company_name').contents().filter(function () {
    return this.nodeType === 3 && this.nodeValue.includes("Company Name");
}).each(function () {
    this.nodeValue = this.nodeValue.replace(/Company Name/g, clientProjectName);
});
            pageContent += `${sectionClone.html()}\n`; // Append the updated HTML

            // pageContent += `${sectionClone.html()}\n`;
            // pageContent += `<div id="${sectionId}">${sectionClone.html()}</div>\n`;
        });

    let headerFont = $("." + globalHeader).css("font-family") || "'Roboto', sans-serif";

    const seoInfo = SEOData[headerCategory] || {keywords: "", description: ""};

        const newPageContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="${seoInfo.description}">
            <meta name="keywords" content="${seoInfo.keywords}">
            <base href='/'>
            <title>${fileName}</title>
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
            	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css">
	<link rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css">
        <style>
            :root {
                --site-font: ${headerFont};
            }
            body, #wrapper, #wrapper * {
                font-family: var(--site-font) !important;
            }
        </style>
        </head>
        <body class="${selectedThemeClass}">
            <div id="wrapper">
            <div id="header" data-src="header.html"></div>
            <div id="mainPageContent">${pageContent}</div>
            <div id="footer" data-src="footer.html"></div>

            </div>
            <script src="assets/js/jquery.js"></script>
            <script src="assets/js/init.js"></script>
            <script src="assets/js/plugins.js"></script>
            <script src="assets/js/jquery.main.js"></script>
            <script src="assets/js/gsap.min.js"></script>
            <script src="assets/js/ScrollTrigger.min.js"></script>
            <script src="assets/js/Observer.min.js"></script>
            <script src="assets/js/gsap.effects.js"></script>
            <script src="assets/js/common_js/send_email.js"></script>

            <script src="assets/js/common_js/html_image_editor.js"></script>
            <script src="assets/js/common_js/windows_postmessage.js"></script>

            <script src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"></script>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>

            <script>
                var fileName = document.title || "index";

                $(document).ready(function () {
                /* Start code to load js and css files properly on local server or production server: NOte: this is the workwround, need to fix this */
                loadHeaderFooter("header", "client-assets/${clientName}/${clientProjectName}/header.html");
                loadHeaderFooter("footer", "client-assets/${clientName}/${clientProjectName}/footer.html");
                /*  End code */

                /*  Start code to load js and css files properly on Githubpages  */
                loadHeaderFooter("header", "header.html");
                loadHeaderFooter("footer", "footer.html");
                /* End code */

                });

                function loadHeaderFooter(id, file) {
                    $("#" + id).load(file, function (response, status, xhr) {
                        if (status === "error") {
                            console.error("Error loading " + file + ":", xhr.status, xhr.statusText);
                            return;
                        }

                        $("#" + id).find("a").addClass("edit-site");

                        if (id === "header") {
                            if (fileName.toLowerCase() === "index" || fileName.toLowerCase() === "home") {
                                $("#" + id).find(".main-header-section").css("display", "inline-block");
                            } else {
                                $("#" + id).find(".main-header-section").css("display", "none");
                                $("#" + id).find(".header-breadcrumb-section").css("display", "inline-block");
                                $("#" + id).find(".header-breadcrumb-section .Page_name")
                                    .text(fileName.charAt(0).toUpperCase() + fileName.slice(1));
                            }
                        }
                    });
                }
            </script>
                        <script src="assets/js/middle-section.js"></script>
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

        // Add mid sections in the page
       let middleKey = null;
    // Try footer_<pageName>
    if (middleSections["footer_" + pageName]) {
        middleKey = "footer_" + pageName;

    // Try header_<pageName> (fallback)
    } else if (middleSections["header_" + pageName]) {
        middleKey = "header_" + pageName;

    // Try plain pageName
    } else if (middleSections[pageName]) {
        middleKey = pageName;
    }


 if (middleKey && middleSections[middleKey].length > 0) {
        middleSections[middleKey].forEach(sectionId => {
            allSectionsOfPage.push(sectionId);
        });
    } else {
        console.warn("No middle section for FOOTER page:", pageName);
        allSectionsOfPage.push("default-middle_section");
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


        let pageContent = '';
        var clientName = getCookie("clientName");
        var clientProjectName =  getCookie("projectName");


allSectionsOfPage.forEach(sectionId => {

        // Try exact ID or prefix match
        let originalSection =
            document.getElementById(sectionId) ||
            document.querySelector(`[id^="${sectionId}"]`);

        if (!originalSection) {
            console.warn("Missing section in DOM:", sectionId);
            return;
        }

        const sectionClone = $(originalSection).clone();

        sectionClone.find(".radio-holder").remove();

        processImagesAndRemoveThemeClasses(sectionClone, clientName, clientProjectName);

        sectionClone.find(".company_name").contents().filter(function () {
            return this.nodeType === 3 &&
                   this.nodeValue.includes("Company Name");
        }).each(function () {
            this.nodeValue = this.nodeValue.replace(/Company Name/g, clientProjectName);
        });

        pageContent += `${sectionClone.html()}\n`;
    });
    let headerFont = $("." + globalHeader).css("font-family") || "'Roboto', sans-serif";
    const seoInfo = SEOData[headerCategory] || {keywords: "", description: ""};

        const newPageContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="${seoInfo.description}">
            <meta name="keywords" content="${seoInfo.keywords}">
            <base href='/'>

            <title>${fileName}</title>
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


            	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css">
	<link rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css">
                <style>
            :root {
                --site-font: ${headerFont};
            }
            body, #wrapper, #wrapper * {
                font-family: var(--site-font) !important;
            }
        </style>
        </head>
       <body class="${selectedThemeClass}">
            <div id="wrapper">
            <div id="header" data-src="header.html"></div>
            <div id="mainPageContent">${pageContent}</div>
            <div id="footer" data-src="footer.html"></div>

            </div>
            <script src="assets/js/jquery.js"></script>
            <script src="assets/js/init.js"></script>
            <script src="assets/js/plugins.js"></script>
            <script src="assets/js/jquery.main.js"></script>
            <script src="assets/js/gsap.min.js"></script>
            <script src="assets/js/ScrollTrigger.min.js"></script>
            <script src="assets/js/Observer.min.js"></script>
            <script src="assets/js/gsap.effects.js"></script>


            <script src="assets/js/common_js/send_email.js"></script>

            <script src="assets/js/common_js/html_image_editor.js"></script>
            <script src="assets/js/common_js/windows_postmessage.js"></script>

            <script src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"></script>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>

            <script>
                var fileName = document.title || "index";

                $(document).ready(function () {
                /* Start code to load js and css files properly on local server or production server: NOte: this is the workwround, need to fix this */
                loadHeaderFooter("header", "client-assets/${clientName}/${clientProjectName}/header.html");
                loadHeaderFooter("footer", "client-assets/${clientName}/${clientProjectName}/footer.html");
                /*  End code */

                /*  Start code to load js and css files properly on Githubpages  */
                loadHeaderFooter("header", "header.html");
                loadHeaderFooter("footer", "footer.html");
                /* End code */

                });

                function loadHeaderFooter(id, file) {
                    $("#" + id).load(file, function (response, status, xhr) {
                        if (status === "error") {
                            console.error("Error loading " + file + ":", xhr.status, xhr.statusText);
                            return;
                        }

                        $("#" + id).find("a").addClass("edit-site");

                        if (id === "header") {
                            if (fileName.toLowerCase() === "index" || fileName.toLowerCase() === "home") {
                                $("#" + id).find(".main-header-section").css("display", "inline-block");
                            } else {
                                $("#" + id).find(".main-header-section").css("display", "none");
                                $("#" + id).find(".header-breadcrumb-section").css("display", "inline-block");
                                $("#" + id).find(".header-breadcrumb-section .Page_name")
                                    .text(fileName.charAt(0).toUpperCase() + fileName.slice(1));
                            }
                        }
                    });
                }
            </script>
                        <script src="assets/js/middle-section.js"></script>
                        <script src="assets/js/common_js/image_uploader.js"></script>

        </body>
        </html>
    `;
    filesDetailsMap[`${fileName}.html`] = newPageContent;

    });
    filesDetailsMap["imagesNameList"] = imagesNameList;
    uploadFilesData(filesDetailsMap);
}
function uploadFilesData(filesDetailsMap) {
    displayLoadingMessage();
 $("#uploadBtn").show();
    filesDetailsMap["clientName"] =  getCookie("clientName");
    filesDetailsMap["clientProjectName"] =  getCookie("projectName");
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
           showCustomAlertBox('success', 'Uploaded the data');
        //   alert("Uploaded the data");
          $('#loading-message').remove();
            // Clear all cookies
            // clearAllCookies();
            // location.reload();
        // $('#openIndex').trigger('click', [getCookie("clientName"), getCookie("projectName"),true]);
        openPreview();
        },
        error: function (xhr, errmsg, err) {
            console.log("Error----"+ xhr.responseText);
            $('#loading-message').remove();
        }
      });
}
// for preview in mobile and desktop view in one frame
        function openPreview() {

            var filename = "index.html";
            var clientName = getCookie('clientName');
            var clientProjectName = getCookie('projectName');

            setCookie('preview', 'true', 7);

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

                    var newTab = window.open(`/es/?srcReq=${filename}`, "_blank");

                    var interval = setInterval(function () {
                        try {
                            if (newTab.document && newTab.document.readyState === 'complete') {
                                clearInterval(interval);
                                injectPreviewShell(newTab, data);
                            }
                        } catch (e) {}
                    }, 50);
                },
                error: function (err) {
                    alert(err.responseJSON?.errorMessage || 'Something went wrong');
                }
            });

            return false;

            /* ================= PREVIEW SHELL ================= */

            function injectPreviewShell(newTab, pageHtml) {

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
                        background: #5865f2;
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
                        height: 100%;
                        border: none;
                        background: #fff;
                        border-radius: 22px;
                    }

                    .hidden { display: none; }
                    </style>

                    <div class="preview-topbar">
                        <button id="desktopBtn" class="preview-btn active">🖥️</button>
                        <button id="mobileBtn" class="preview-btn">📱</button>
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
                const mobileIframe  = newTab.document.getElementById('mobileIframe');

                desktopIframe.onload = () => hideTopBar(desktopIframe.contentDocument);
                mobileIframe.onload  = () => hideTopBar(mobileIframe.contentDocument);

                desktopIframe.contentDocument.open();
                desktopIframe.contentDocument.write(pageHtml);
                desktopIframe.contentDocument.close();

                mobileIframe.contentDocument.open();
                mobileIframe.contentDocument.write(pageHtml);
                mobileIframe.contentDocument.close();

                const desktopBtn = newTab.document.getElementById('desktopBtn');
                const mobileBtn  = newTab.document.getElementById('mobileBtn');
                const desktopView = newTab.document.getElementById('desktopView');
                const mobileView  = newTab.document.getElementById('mobileView');

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
                            ${subPages[mainPage].map(subPage => `<li><a href="${subPage}.html">${subPage}</a></li>`).join('')}
                        </ul>
                    </li>`;
            } else {
                menuContent += `<li><a href="${cleanedMainPage}.html">${cleanedMainPage}</a></li>`;
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
                return { name: link, url: link };
            })
        };

        footerContent.push(footerData);  // Add footer data to the content array
    });

    return footerContent;
}


// Theme Selector code
            let selectedThemeClass = '';

            const themes = {
            'theme-1': { primary: '#0f6979', secondary: '#ffc000', tertiary: '#ffffff' },
            'theme-2': { primary: '#283259', secondary: '#1da6a6', tertiary: '#ffffff' },
            'theme-3': { primary: '#1d4d13', secondary: '#f4a300', tertiary: '#ffffff' },
            'theme-4': { primary: '#ffc000', secondary: '#ffffff', tertiary: '#000000' },
            'theme-5': { primary: '#f0f8ff', secondary: '#59bb2c', tertiary: '#000000' },
            'theme-6': { primary: '#0caa85', secondary: '#f4a300', tertiary: '#ffffff' },
            };

            // Function to update the theme color preview
            function updateThemePreview(theme) {
            const colors = themes[theme] || { primary: '#ffffff', secondary: '#000000', tertiary: '#ffffff' };
            $('#theme-preview .primary').css('background-color', colors.primary);
            $('#theme-preview .secondary').css('background-color', colors.secondary);
            $('#theme-preview .tertiary').css('background-color', colors.tertiary);
            }

            // When dropdown value changes
            $('#theme-dropdown').on('change', function () {
            selectedThemeClass = $(this).val();
            if (selectedThemeClass) {
                updateThemePreview(selectedThemeClass);
                $('#theme-preview').show();
            } else {
                $('#theme-preview').hide();
            }
            });

            // When switching to the Theme tab
            $('a[href="#tab-theme"]').on('shown.bs.tab', function () {
            // Set default theme if none selected
            if (!selectedThemeClass) {
                selectedThemeClass = 'theme-1';
                $('#theme-dropdown').val('theme-1');
            }
            updateThemePreview(selectedThemeClass);
            $('#theme-preview').show();
            });

            // On export button click
            $('#export-btn').off('click').on('click', function () {

                const clientName = getCookie("clientName");
                const projectName = getCookie("projectName");
                let theme = selectedThemeClass || 'theme-1';

                if (!clientName || !projectName) {
                    alert("Client and Project details missing. Please fill them first.");
                    return;
                }

                if (!theme) {
                    theme = 'theme-1';
                    setCookie('selectedTheme', theme, 7);
                    console.log('No theme selected. Defaulting to theme-1.');
                }

                // preview handled by preview shell now
                createHTMLFilesDataForWebsiteLinks(theme);
            });




                    $('#preview-mobile-btn').off('click').on('click', function () { //New code

                        const clientName = getCookie("clientName");
                        const projectName = getCookie("projectName");
                        let theme = selectedThemeClass || 'theme-1';

                        if (!clientName || !projectName) {
                            alert("Client and Project details missing. Please fill them first.");
                            return;
                        }

                        if (!theme) {
                            theme = 'theme-1';
                            setCookie('selectedTheme', theme, 7);
                            console.log('No theme selected. Defaulting to theme-1.');
                        }

                        setCookie('previewMode', 'mobile', 1);
                        createHTMLFilesDataForWebsiteLinks(theme);
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


