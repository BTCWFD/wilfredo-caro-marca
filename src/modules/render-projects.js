import { projects } from '../data/projects.js';

const SOCIAL_ICONS = {
  web: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5a2.7 2.7 0 0 0-1.9 1.9C2 8.9 2 12 2 12s0 3.1.4 4.8a2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8zM10 15.2V8.8l5.5 3.2-5.5 3.2z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 19.5l1.1-3.6A8 8 0 1 1 8.4 18.6z"/><path d="M9.5 9c.3 2.2 2.2 4.1 4.4 4.5"/></svg>`
};

const renderCard = (p, isCollab = false) => {
  const overlayKey = isCollab
    ? p.overlayKey || 'project_overlay_view'
    : p.inDevelopment
      ? 'project_overlay_dev'
      : 'project_overlay_view';
  const overlayText = isCollab
    ? p.overlayText || 'VIEW PROJECT'
    : p.inDevelopment
      ? 'IN DEVELOPMENT'
      : 'VIEW PROJECT';

  const tagsHtml = p.tags.map((tag) => `<span>${tag}</span>`).join('');

  // When a card includes dedicated web & social links, avoid nested <a> tags (valid HTML5)
  if (Array.isArray(p.socials) && p.socials.length > 0) {
    const socialsHtml = `
      <div class="project-socials" aria-label="${p.id} links">
        ${p.socials
          .map(
            (s) => `
          <a href="${s.href}" target="_blank" rel="noopener noreferrer" class="project-social-pill project-social-pill--${s.type}" title="${s.label}">
            ${SOCIAL_ICONS[s.type] || SOCIAL_ICONS.web}
            <span>${s.label}</span>
          </a>
        `
          )
          .join('')}
      </div>
    `;

    const previewInner = `<div class="preview-overlay" data-i18n="${overlayKey}">${overlayText}</div>`;
    const previewBlock = p.href
      ? `<a href="${p.href}" target="_blank" rel="noopener noreferrer" class="project-preview ${p.previewClass}" style="display: block; text-decoration: none;">${previewInner}</a>`
      : `<div class="project-preview ${p.previewClass}">${previewInner}</div>`;

    const titleInner = p.href
      ? `<a href="${p.href}" target="_blank" rel="noopener noreferrer" class="project-title-link" data-i18n="${p.nameKey}">${p.id}</a>`
      : `<span data-i18n="${p.nameKey}">${p.id}</span>`;

    return `
      <div class="project-card glass-panel reveal">
        ${previewBlock}
        <div class="project-info">
          <h3>${titleInner}</h3>
          <p data-i18n="${p.descKey}"></p>
          ${socialsHtml}
          <div class="project-tags">
            ${tagsHtml}
          </div>
        </div>
      </div>
    `;
  }

  const previewHtml = `
    <div class="project-preview ${p.previewClass}">
      <div class="preview-overlay" data-i18n="${overlayKey}">${overlayText}</div>
    </div>
  `;

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
  }

  return `
    <div class="project-card glass-panel reveal">
      ${previewHtml}
      ${infoHtml}
    </div>
  `;
};

export const renderProjects = () => {
  const projectsGrid = document.querySelector('#projects .projects-grid');
  const collaborationsGrid = document.querySelector('#collaborations .projects-grid');

  if (projectsGrid) {
    projectsGrid.innerHTML = projects
      .filter((p) => p.section === 'projects')
      .map((p) => renderCard(p, false))
      .join('');
  }

  if (collaborationsGrid) {
    collaborationsGrid.innerHTML = projects
      .filter((p) => p.section === 'collaborations')
      .map((p) => renderCard(p, true))
      .join('');
  }
};
