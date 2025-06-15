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

// --- FETCH HELPERS ---
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

// --- HASH TAB NAVIGATION ---
function applyHashNavigation() {
    const hash = window.location.hash.slice(1); // remove '#'
    if (!hash) return;

    for (const project of projects) {
        const projectId = project.id;
        const matchTabIndex = project.tabs.findIndex(tab => tab.hash === hash);
        if (matchTabIndex !== -1) {
            const projectElement = document.getElementById(projectId);
            if (!projectElement) return;

            projectElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

            const tabButtons = projectElement.querySelectorAll('.tab-btn');
            const tabPanels = projectElement.querySelectorAll('.tab-panel');
            tabButtons.forEach((b, i) => {
                b.classList.toggle('active', i === matchTabIndex);
                tabPanels[i].hidden = i !== matchTabIndex;
            });

            break;
        }
    }
}

// --- MAIN LOAD FUNCTION ---
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
        if (!metadata || !metadata.name || !metadata.imageFile || !Array.isArray(metadata.tags)) {
            console.warn(`Invalid metadata.json for project: ${dir.name}`);
            continue;
        }

        let tabs = [];
        if (Array.isArray(metadata.tabs) && metadata.tabs.length > 0) {
            for (const tab of metadata.tabs) {
                if (tab.title && tab.file && tab.hash) {
                    const tabMd = await fetchText(`${baseRawUrl}/${tab.file}`);
                    const tabHtml = marked.parse(tabMd);
                    tabs.push({
                        title: tab.title,
                        content: tabHtml,
                        hash: tab.hash
                    });
                }
            }
        } else {
            const readmeMd = await fetchText(`${baseRawUrl}/README.md`);
            tabs.push({
                title: "Project Overview",
                content: marked.parse(readmeMd),
                hash: `${dir.name}-overview`
            });
        }

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
    renderTagsFilter();
    renderProjects();
    applyHashNavigation();
}

// --- TAG FILTER UI ---
function renderTagsFilter() {
    tagsFilterEl.querySelectorAll('.tag').forEach(t => t.remove());
    selectedTags.clear();

    const tagsArray = Array.from(allTags).sort();
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
            pressed ? selectedTags.delete(tag) : selectedTags.add(tag);
            renderProjects();
        });
        tagsFilterEl.insertBefore(btn, showMoreBtn);
    });
    tagsFilterEl.classList.remove("collapsed");
}

// --- RENDER PROJECTS ---
function renderProjects() {
    projectsListEl.innerHTML = "";

    let filteredProjects = selectedTags.size === 0
        ? projects
        : projects.filter(proj => proj.tags.some(tag => selectedTags.has(tag)));

    if (filteredProjects.length === 0) {
        projectsListEl.innerHTML = "<p>No projects match the selected tags.</p>";
        return;
    }

    filteredProjects.forEach(proj => {
        const projEl = document.createElement("article");
        projEl.className = "project";
        projEl.id = proj.id;

        // Image
        const imageWrapper = document.createElement("div");
        imageWrapper.className = "project-image-wrapper";
        const imgEl = document.createElement("img");
        imgEl.src = proj.imageUrl;
        imgEl.alt = `Screenshot of ${proj.name}`;
        imageWrapper.appendChild(imgEl);

        // Content
        const contentEl = document.createElement("div");
        contentEl.className = "project-content";

        const tabsHeader = document.createElement("div");
        tabsHeader.className = "tabs-header";
        const tabsContent = document.createElement("div");
        tabsContent.className = "tabs-content";

        proj.tabs.forEach((tab, idx) => {
            // Tab button
            const tabBtn = document.createElement("button");
            tabBtn.className = "tab-btn";
            tabBtn.type = "button";
            tabBtn.textContent = tab.title;
            if (idx === 0) tabBtn.classList.add("active");

            tabBtn.addEventListener("click", () => {
                tabsHeader.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                tabsContent.querySelectorAll(".tab-panel").forEach(p => p.hidden = true);

                tabBtn.classList.add("active");
                tabPanel.hidden = false;

                // Update hash in address bar
                history.replaceState(null, '', `#${tab.hash}`);
            });

            tabsHeader.appendChild(tabBtn);

            // Tab content
            const tabPanel = document.createElement("div");
            tabPanel.className = "tab-panel";
            tabPanel.innerHTML = tab.content;
            tabPanel.hidden = idx !== 0;
            tabsContent.appendChild(tabPanel);
        });

        contentEl.appendChild(tabsHeader);
        contentEl.appendChild(tabsContent);

        // Tags
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
    });
}

// --- SPINNER LOADING ---
const spinner = document.createElement("div");
spinner.id = "loading-spinner";
spinner.innerHTML = `<div class="spinner"></div>`;
projectsListEl.before(spinner);

// --- MAIN ---
async function main() {
    spinner.style.display = "block";
    await loadProjects();
    spinner.style.display = "none";
}

main();
