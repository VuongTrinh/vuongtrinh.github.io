const githubUser = "vuongtrinh";
const githubRepo = "vuongtrinh.github.io";
const githubBranch = "main";
const projectsPath = "projects";

let projects = [];
let allTags = new Set();
let selectedTags = new Set();

const projectsListEl = document.getElementById("projects-list");
const tagsFilterEl = document.getElementById("tags-filter");
const showMoreBtn = document.getElementById("show-more-btn");

const VISIBLE_TAGS_LIMIT = 8;

async function fetchJSON(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        console.warn("Fetch error:", url, e);
        return null;
    }
}

async function fetchText(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.text();
    } catch (e) {
        console.warn("Fetch error:", url, e);
        return "";
    }
}

function applyHashNavigation() {
    const hash = window.location.hash.substring(1);
    const mapping = tabHashMap[hash];
    if (!mapping) return;

    const { tabTitle } = mapping;

    // Find the first .project-card that contains a matching tab title
    const projectCards = document.querySelectorAll('.project-card');
    for (const card of projectCards) {
        const tabButtons = card.querySelectorAll('.tab-button');
        for (const btn of tabButtons) {
            if (btn.textContent.trim() === tabTitle) {
                const expandButton = card.querySelector('.expand-project');
                if (expandButton && !card.classList.contains('expanded')) {
                    expandButton.click();
                }

                // Wait until tab buttons are available after expansion
                const tryActivateTab = setInterval(() => {
                    const visibleTabs = card.querySelectorAll('.tab-button');
                    const match = [...visibleTabs].find(b => b.textContent.trim() === tabTitle);
                    if (match) {
                        match.click();
                        clearInterval(tryActivateTab);
                    }
                }, 100);

                return;
            }
        }
    }
}



const tabHashMap = {};

function buildTabHashMap(projectsMetadata) {
    projectsMetadata.forEach(project => {
        if (!project.tabs) return;

        project.tabs.forEach(tab => {
            if (typeof tab === 'object' && tab.hash) {
                tabHashMap[tab.hash] = {
                    tabTitle: tab.title
                };
            }
        });
    });
}


async function loadProjects() {
    const apiUrl = `https://api.github.com/repos/${githubUser}/${githubRepo}/contents/${projectsPath}?ref=${githubBranch}`;
    const folders = await fetchJSON(apiUrl);
    if (!folders) {
        projectsListEl.innerHTML = "<p>Failed to load projects.</p>";
        return;
    }

    const projectDirs = folders.filter(item => item.type === "dir");
    const projectsLoaded = [];

    for (const dir of projectDirs) {
        const baseRawUrl = `https://raw.githubusercontent.com/${githubUser}/${githubRepo}/${githubBranch}/${projectsPath}/${dir.name}`;
        const metadataUrl = `${baseRawUrl}/metadata.json`;

        const metadata = await fetchJSON(metadataUrl);
        if (!metadata) {
            console.warn(`No metadata.json for project: ${dir.name}`);
            continue;
        }

        if (!metadata.name || !metadata.imageFile || !Array.isArray(metadata.tags)) {
            console.warn(`Invalid metadata.json format for project: ${dir.name}`);
            continue;
        }


        // Tabs handling - fetch content for each tab if tabs defined in metadata
        let tabs = [];
        if (Array.isArray(metadata.tabs) && metadata.tabs.length > 0) {
            for (const tab of metadata.tabs) {
                if (tab.title && tab.file) {
                    const tabMd = await fetchText(`${baseRawUrl}/${tab.file}`);
                    const tabHtml = marked.parse(tabMd);
                    tabs.push({
                        title: tab.title,
                        content: tabHtml
                    });
                }
            }
        } else {
            // fallback - if no tabs, just one tab "Project Overview" from README.md
            const readmeMd = await fetchText(`${baseRawUrl}/README.md`);
            tabs.push({
                title: "Project Overview",
                content: marked.parse(readmeMd)
            });
        }

        // Collect all tags for filter
        metadata.tags.forEach(tag => allTags.add(tag));

        const project = {
            id: dir.name,
            name: metadata.name,
            imageUrl: `${baseRawUrl}/${metadata.imageFile}`,
            tags: metadata.tags,
            tabs: tabs
        };

        projectsLoaded.push(project);
    }

    projects = projectsLoaded;
    buildTabHashMap(projects);
    renderTagsFilter();
    renderProjects();
    applyHashNavigation();

}

function renderTagsFilter() {
    tagsFilterEl.querySelectorAll('.tag').forEach(t => t.remove());
    selectedTags.clear();

    const tagsArray = Array.from(allTags).sort((a, b) => a.localeCompare(b));

    tagsArray.forEach(tag => {
        const btn = document.createElement("button");
        btn.className = "tag";
        btn.textContent = tag;
        btn.type = "button";
        btn.setAttribute("aria-pressed", "false");
        btn.addEventListener("click", () => {
            const pressed = btn.getAttribute("aria-pressed") === "true";
            btn.setAttribute("aria-pressed", String(!pressed));
            btn.classList.toggle("selected", !pressed);
            if (!pressed) selectedTags.add(tag);
            else selectedTags.delete(tag);
            renderProjects();
        });
        tagsFilterEl.insertBefore(btn, showMoreBtn);
    });
    tagsFilterEl.classList.remove("collapsed");

    // if (tagsArray.length > VISIBLE_TAGS_LIMIT) {
    //     tagsFilterEl.classList.add("collapsed");
    //     showMoreBtn.hidden = false;
    //     showMoreBtn.textContent = "Show more tags";
    //     showMoreBtn.setAttribute("aria-expanded", "false");
    // } else {
    //     tagsFilterEl.classList.remove("collapsed");
    //     showMoreBtn.hidden = true;
    // }
    // showMoreBtn.hidden = true;
}

function renderProjects() {
    projectsListEl.innerHTML = "";

    let filteredProjects = projects;

    if (selectedTags.size > 0) {
        filteredProjects = projects.filter(proj =>
            proj.tags.some(tag => selectedTags.has(tag))
        );
    }

    if (filteredProjects.length === 0) {
        projectsListEl.innerHTML = "<p>No projects match the selected tags.</p>";
        return;
    }

    filteredProjects.forEach(proj => {
        const projEl = document.createElement("article");
        projEl.className = "project";

        // Left side: image
        const imageWrapper = document.createElement("div");
        imageWrapper.className = "project-image-wrapper";
        const imgEl = document.createElement("img");
        imgEl.src = proj.imageUrl;
        imgEl.alt = `Screenshot of ${proj.name}`;
        imageWrapper.appendChild(imgEl);
        // Right side: tab container
        const contentEl = document.createElement("div");
        contentEl.className = "project-content";

        // Title
        // const titleEl = document.createElement("h3");
        // titleEl.className = "project-title";
        // titleEl.textContent = proj.name;

        // contentEl.appendChild(titleEl);

        // Tabs UI

        // Tabs headers (buttons)
        const tabsHeader = document.createElement("div");
        tabsHeader.className = "tabs-header";

        // Tabs content container
        const tabsContent = document.createElement("div");
        tabsContent.className = "tabs-content";

        proj.tabs.forEach((tab, idx) => {
            // Tab button
            const tabBtn = document.createElement("button");
            tabBtn.className = "tab-btn";
            tabBtn.type = "button";
            tabBtn.textContent = tab.title;
            if (idx === 0) {
                tabBtn.classList.add("active");
            }

            tabBtn.addEventListener("click", () => {
                // Remove active from all buttons
                tabsHeader.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                // Hide all contents
                tabsContent.querySelectorAll(".tab-panel").forEach(panel => panel.hidden = true);

                // Activate current
                tabBtn.classList.add("active");
                tabPanel.hidden = false;


            });

            tabsHeader.appendChild(tabBtn);

            // Tab content panel
            const tabPanel = document.createElement("div");
            tabPanel.className = "tab-panel";
            tabPanel.innerHTML = tab.content;
            tabPanel.hidden = idx !== 0;

            tabsContent.appendChild(tabPanel);
        });

        contentEl.appendChild(tabsHeader);
        contentEl.appendChild(tabsContent);

        // Tags below tabs
        const tagsEl = document.createElement("div");
        tagsEl.className = "project-tags";
        proj.tags.forEach(t => {
            const span = document.createElement("span");
            span.className = "tag";
            span.textContent = t;
            tagsEl.appendChild(span);
        });

        contentEl.appendChild(tagsEl);

        projEl.appendChild(imageWrapper);
        projEl.appendChild(contentEl);

        projectsListEl.appendChild(projEl);
        // // Get the first tab panel inside this project
        // const firstTabPanel = projEl.querySelector(".tab-panel:not([hidden])") || projEl.querySelector(".tab-panel");
        // const imageWrapperEl = projEl.querySelector(".project-image-wrapper");

        // if (firstTabPanel && imageWrapperEl) {
        //     const height = firstTabPanel.offsetHeight;
        //     imageWrapperEl.style.height = height + "px";
        // }



    });
    // After all projects are rendered, fix image heights:
    //fixImageWrapperHeight();
}

function fixImageWrapperHeight() {
    document.querySelectorAll(".project").forEach(project => {
        const content = project.querySelector(".project-content");
        const imageWrapper = project.querySelector(".project-image-wrapper");
        if (content && imageWrapper) {
            // Find the currently visible tab panel
            const visibleTabPanel = content.querySelector(".tab-panel:not([hidden])") || content.querySelector(".tab-panel");
            if (visibleTabPanel) {
                // Get the height of the visible tab panel
                const height = visibleTabPanel.offsetHeight;
                // Set the image wrapper height to this height (in px)
                imageWrapper.style.height = height + "px";
            }
        }
    });
}

function isSvgImage(src) {
    return src.trim().toLowerCase().endsWith('.svg');
}

// Show more / Show less tags button
// showMoreBtn.addEventListener("click", () => {
//     const isExpanded = showMoreBtn.getAttribute("aria-expanded") === "true";
//     if (isExpanded) {
//         tagsFilterEl.classList.add("collapsed");
//         showMoreBtn.textContent = "Show more tags";
//         showMoreBtn.setAttribute("aria-expanded", "false");
//     } else {
//         tagsFilterEl.classList.remove("collapsed");
//         showMoreBtn.textContent = "Show fewer tags";
//         showMoreBtn.setAttribute("aria-expanded", "true");
//     }
// });

// Show spinner while loading
const spinner = document.createElement("div");
spinner.id = "loading-spinner";
spinner.innerHTML = `<div class="spinner"></div>`;
projectsListEl.before(spinner);

async function main() {
    spinner.style.display = "block";
    await loadProjects();
    spinner.style.display = "none";
}

main();
