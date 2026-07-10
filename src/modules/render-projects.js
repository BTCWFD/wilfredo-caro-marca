import { projects } from '../data/projects.js';

export const renderProjects = () => {
  const projectsGrid = document.querySelector('#projects .projects-grid');
  const collaborationsGrid = document.querySelector('#collaborations .projects-grid');

  if (projectsGrid) {
    const projectsHtml = projects
      .filter(p => p.section === 'projects')
      .map(p => {
        const overlayKey = p.inDevelopment ? 'project_overlay_dev' : 'project_overlay_view';
        const overlayText = p.inDevelopment ? 'IN DEVELOPMENT' : 'VIEW PROJECT';
        
        const previewHtml = `
          <div class="project-preview ${p.previewClass}">
            <div class="preview-overlay" data-i18n="${overlayKey}">${overlayText}</div>
          </div>
        `;
        
        const tagsHtml = p.tags.map(tag => `<span>${tag}</span>`).join('');
        
        const infoHtml = `
          <div class="project-info">
            <h3 data-i18n="${p.nameKey}">${p.id}</h3>
            <p data-i18n="${p.descKey}"></p>
            <div class="project-tags">
              ${tagsHtml}
            </div>
          </div>
        `;

        if (p.href) {
          return `
            <a href="${p.href}" target="_blank" rel="noopener noreferrer" class="project-card glass-panel reveal" style="text-decoration: none; color: inherit;">
              ${previewHtml}
              ${infoHtml}
            </a>
          `;
        } else {
          return `
            <div class="project-card glass-panel reveal">
              ${previewHtml}
              ${infoHtml}
            </div>
          `;
        }
      })
      .join('');
    
    projectsGrid.innerHTML = projectsHtml;
  }

  if (collaborationsGrid) {
    const collaborationsHtml = projects
      .filter(p => p.section === 'collaborations')
      .map(p => {
        const overlayKey = p.overlayKey || 'project_overlay_view';
        const overlayText = p.overlayText || 'VIEW PROJECT';
        
        const previewHtml = `
          <div class="project-preview ${p.previewClass}">
            <div class="preview-overlay" data-i18n="${overlayKey}">${overlayText}</div>
          </div>
        `;
        
        const tagsHtml = p.tags.map(tag => `<span>${tag}</span>`).join('');
        
        const infoHtml = `
          <div class="project-info">
            <h3 data-i18n="${p.nameKey}">${p.id}</h3>
            <p data-i18n="${p.descKey}"></p>
            <div class="project-tags">
              ${tagsHtml}
            </div>
          </div>
        `;

        if (p.href) {
          return `
            <a href="${p.href}" target="_blank" rel="noopener noreferrer" class="project-card glass-panel reveal" style="text-decoration: none; color: inherit;">
              ${previewHtml}
              ${infoHtml}
            </a>
          `;
        } else {
          return `
            <div class="project-card glass-panel reveal">
              ${previewHtml}
              ${infoHtml}
            </div>
          `;
        }
      })
      .join('');
    
    collaborationsGrid.innerHTML = collaborationsHtml;
  }
};
