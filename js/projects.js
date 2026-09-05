 let projectsData = [];

        function loadProjects() {
            fetch('data/projects.json')
                .then(res => res.json())
                .then(data => {
                    projectsData = data;
                    initializeFilters();
                    renderProjects(projectsData);
                })
                .catch(err => console.error('Failed to load project data:', err));
        }

        function filterProjects(category) {
            const buttons = document.querySelectorAll('.filter-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            const filtered = category === 'all' ? projectsData : projectsData.filter(p => Array.isArray(p.category) ? p.category.includes(category) : p.category === category);
            renderProjects(filtered);
        }

        function initializeFilters() {
            const counts = {
                all: projectsData.length,
                ai: projectsData.filter(p => Array.isArray(p.category) ? p.category.includes('ai') : p.category === 'ai').length,
                web: projectsData.filter(p => Array.isArray(p.category) ? p.category.includes('web') : p.category === 'web').length,
                mobile: projectsData.filter(p => Array.isArray(p.category) ? p.category.includes('mobile') : p.category === 'mobile').length,
                iot: projectsData.filter(p => Array.isArray(p.category) ? p.category.includes('iot') : p.category === 'iot').length,
                desktop: projectsData.filter(p => Array.isArray(p.category) ? p.category.includes('desktop') : p.category === 'desktop').length
            };

            const filterContainer = document.querySelector('.projects-filter');
            filterContainer.innerHTML = `
                <button class="filter-btn active" onclick="filterProjects('all')">All Projects (${counts.all})</button>
                <button class="filter-btn" onclick="filterProjects('ai')">AI & ML (${counts.ai})</button>
                <button class="filter-btn" onclick="filterProjects('web')">Web (${counts.web})</button>
                <button class="filter-btn" onclick="filterProjects('mobile')">Mobile (${counts.mobile})</button>
                <button class="filter-btn" onclick="filterProjects('iot')">IoT & Hardware (${counts.iot})</button>
                <button class="filter-btn" onclick="filterProjects('desktop')">Desktop App (${counts.desktop})</button>
            `;
        }

        function renderProjects(projects) {
            const grid = document.getElementById('projectsGrid');
            grid.innerHTML = '';
            projects.forEach(project => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.innerHTML = `
                <div class="project-card-image">
                    <img 
                    src="${project.image}" 
                    alt="${project.title}" 
                    loading="lazy"
                    onerror="this.onerror=null; this.parentElement.innerHTML='<div class=&quot;project-card-image-placeholder&quot;><i class=&quot;fas fa-image&quot;></i></div>'"
                    >
                </div>

                <div class="project-card-content">
                    ${project.badge ? `<div class="project-badge-mini">${project.badge}</div>` : ""}

                    <h3 class="project-card-title">${project.title}</h3>
                    <p class="project-card-description">${project.description}</p>

                    <div class="project-card-tech">
                    ${project.technologies
                        .slice(0, 2)
                        .map(tech => `<span class="tech-tag">${tech}</span>`)
                        .join("")}
                    ${project.technologies.length > 2
                        ? `<span class="tech-tag">+${project.technologies.length - 2}</span>`
                        : ""}
                    </div>

                    <div class="project-card-footer">
                    <button class="view-btn" onclick="openModal(${project.id})">
                        View Details
                    </button>

                    <a 
                        href="${project.github}" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="github-btn" 
                        title="GitHub Repository"
                    >
                        <i class="fab fa-github"></i>
                    </a>
                    </div>
                </div>
                `;
                grid.appendChild(card);
            });
            
        }

        function openModal(projectId) {
            const project = projectsData.find(p => p.id === projectId);
            if (!project) return;
            const modalTitle = document.getElementById('modalTitle');
            const modalType = document.getElementById('modalType');
            const modalBody = document.getElementById('modalBody');
            modalTitle.textContent = project.title;
            
            // Adjust title font size based on length to keep header on one line
            const titleLength = project.title.length;
            let fontSize;
            if (titleLength <= 20) {
                fontSize = '1.5rem';
            } else if (titleLength <= 35) {
                fontSize = '1.3rem';
            } else if (titleLength <= 50) {
                fontSize = '1.1rem';
            } else if (titleLength <= 65) {
                fontSize = '1rem';
            } else {
                fontSize = '0.9rem';
            }
            modalTitle.style.fontSize = fontSize;
            
            // Add type badge inside the title element if it exists
            if (project.type) {
                modalTitle.innerHTML = project.title + ' <span id="modalType" class="modal-type">' + project.type + '</span>';
            } else {
                modalTitle.innerHTML = project.title;
            }
            modalBody.innerHTML = `<img src="${project.image}" alt="${project.title}" class="modal-image" onerror="this.style.display='none'"><div class="modal-section"><h3><i class="fas fa-info-circle"></i> Overview</h3><p>${project.overview || project.description}</p></div>${project.role ? `<div class="modal-section"><h3><i class="fas fa-user"></i> My Role</h3><ul>${project.role.map(r => `<li>${r}</li>`).join('')}</ul></div>` : ''}${project.technologies ? `<div class="modal-section"><h3><i class="fas fa-tools"></i> Technologies & Tools</h3><div class="modal-tech-list">${project.technologies.map(tech => `<div class="modal-tech-item">${tech}</div>`).join('')}</div></div>` : ''}${project.features ? `<div class="modal-section"><h3><i class="fas fa-star"></i> Key Features</h3><ul>${project.features.map(f => `<li>${f}</li>`).join('')}</ul></div>` : ''}<div class="modal-actions"><a href="${project.github}" target="_blank" class="modal-action-btn primary"><i class="fab fa-github"></i> View Source Code</a>${project.demo ? `<a href="${project.demo}" target="_blank" class="modal-action-btn secondary"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}</div>`;
            document.getElementById('projectModal').classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                document.querySelector('.modal-content').scrollTop = 0;
            }, 0);
        }

        function closeModal() {
            document.getElementById('projectModal').classList.remove('active');
            document.body.style.overflow = 'auto';
            document.querySelector('.modal-content').scrollTop = 0;
        }

        document.getElementById('projectModal').addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeModal();
        });

        loadProjects();