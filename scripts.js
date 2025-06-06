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
        const readmeUrl = `${baseRawUrl}/README.md`;

        const metadata = await fetchJSON(metadataUrl);
        if (!metadata) {
          console.warn(`No metadata.json for project: ${dir.name}`);
          continue;
        }

        if (!metadata.name || !metadata.imageFile || !Array.isArray(metadata.tags)) {
          console.warn(`Invalid metadata.json format for project: ${dir.name}`);
          continue;
        }

        const markdownContent = await fetchText(readmeUrl);

        const project = {
          id: dir.name,
          name: metadata.name,
          imageUrl: `${baseRawUrl}/${metadata.imageFile}`,
          tags: metadata.tags,
          markdown: markdownContent
        };

        metadata.tags.forEach(tag => allTags.add(tag));
        projectsLoaded.push(project);
      }

      projects = projectsLoaded;
      renderTagsFilter();
      renderProjects();
    }

    function renderTagsFilter() {
      tagsFilterEl.querySelectorAll('.tag').forEach(t => t.remove());
      selectedTags.clear();

      // Insert tags before the button (which is inside tagsFilterEl)
      const tagsArray = Array.from(allTags).sort((a,b) => a.localeCompare(b));

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
        // Insert before showMoreBtn so the button stays last
        tagsFilterEl.insertBefore(btn, showMoreBtn);
      });

      // Show/hide Show more button
      if (tagsArray.length > VISIBLE_TAGS_LIMIT) {
        tagsFilterEl.classList.add("collapsed");
        showMoreBtn.hidden = false;
        showMoreBtn.textContent = "Show more tags";
        showMoreBtn.setAttribute("aria-expanded", "false");
      } else {
        tagsFilterEl.classList.remove("collapsed");
        showMoreBtn.hidden = true;
      }
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

        const imgEl = document.createElement("img");
        imgEl.src = proj.imageUrl;
        imgEl.alt = `Screenshot of ${proj.name}`;

        const contentEl = document.createElement("div");
        contentEl.className = "project-content";

        const titleEl = document.createElement("h3");
        titleEl.className = "project-title";
        titleEl.textContent = proj.name;

        const tagsEl = document.createElement("div");
        tagsEl.className = "project-tags";
        proj.tags.forEach(t => {
          const span = document.createElement("span");
          span.className = "tag";
          span.textContent = t;
          tagsEl.appendChild(span);
        });

        // Render markdown description inside content
        const mdHtml = marked.parse(proj.markdown);
        const descEl = document.createElement("div");
        descEl.innerHTML = mdHtml;

        contentEl.appendChild(titleEl);
        contentEl.appendChild(descEl);
        contentEl.appendChild(tagsEl);

        projEl.appendChild(imgEl);
        projEl.appendChild(contentEl);

        projectsListEl.appendChild(projEl);
      });
    }

    showMoreBtn.addEventListener("click", () => {
      const isCollapsed = tagsFilterEl.classList.contains("collapsed");
      if (isCollapsed) {
        tagsFilterEl.classList.remove("collapsed");
        tagsFilterEl.classList.add("expanded");
        showMoreBtn.textContent = "Show less tags";
        showMoreBtn.setAttribute("aria-expanded", "true");
      } else {
        tagsFilterEl.classList.add("collapsed");
        tagsFilterEl.classList.remove("expanded");
        showMoreBtn.textContent = "Show more tags";
        showMoreBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Load projects on page load
    loadProjects();
