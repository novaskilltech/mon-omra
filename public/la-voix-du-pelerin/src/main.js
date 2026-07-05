import { db } from './db.js';

// Init DB
db.init();

// App Router & Views Management
const app = {
  routes: {
    '#/': 'renderHome',
    '#/guide': 'renderGuide',
    '#/article': 'renderArticle',
    '#/experiences': 'renderExperiences',
    '#/partager': 'renderPartager',
    '#/legal': 'renderLegal',
    '#/admin': 'renderAdminLogin',
    '#/admin/dashboard': 'renderAdminDashboard'
  },

  init() {
    window.addEventListener('hashchange', () => this.route());
    this.route();
    this.setupGlobalEvents();
  },

  route() {
    let hash = window.location.hash || '#/';
    
    // Check dynamic routes like #/article?id=art-1
    let routeHandler = this.routes[hash];
    let params = {};
    
    if (hash.startsWith('#/article?')) {
      routeHandler = 'renderArticle';
      const searchParams = new URLSearchParams(hash.split('?')[1]);
      params.id = searchParams.get('id');
    }

    // Admin Route Protection
    if (hash.startsWith('#/admin/dashboard') && !db.isAdminLogged()) {
      window.location.hash = '#/admin';
      return;
    }

    if (db.isAdminLogged() && hash === '#/admin') {
      window.location.hash = '#/admin/dashboard';
      return;
    }

    const handler = this[routeHandler] || this.renderNotFound;
    
    // Clear and render
    const mainEl = document.querySelector('main');
    mainEl.innerHTML = '<div class="page-container" id="page-content"></div>';
    
    const container = document.getElementById('page-content');
    handler.call(this, container, params);
    
    this.updateActiveNav(hash);
    window.scrollTo(0, 0);
  },

  updateActiveNav(hash) {
    document.querySelectorAll('nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === hash || (hash.startsWith('#/guide') && href === '#/guide') || (hash.startsWith('#/experiences') && href === '#/experiences')) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  },

  setupGlobalEvents() {
    // Floating WhatsApp click tracking placeholder
    const waBtn = document.querySelector('.whatsapp-float');
    if (waBtn) {
      waBtn.addEventListener('click', () => {
        this.trackClick('WhatsApp_Float');
      });
    }
  },

  trackClick(elementName) {
    console.log(`[Analytics] Click on ${elementName} at ${new Date().toISOString()}`);
    // P1 : Simple click tracker in localStorage can be added here
  },

  // --- VIEWS RENDERING ---

  renderHome(container) {
    container.innerHTML = `
      <section class="hero">
        <h1>Bienvenue sur <span>La Voix du Pèlerin</span></h1>
        <p>Votre guide éditorial de confiance pour préparer sereinement votre Omra avec OmraYanair, enrichi par les témoignages authentiques de nos pèlerins.</p>
        <div class="hero-ctas">
          <a href="#/guide" class="btn-premium">Consulter le Guide Omra</a>
          <a href="#/experiences" class="btn-premium btn-accent">Lire les Expériences</a>
          <a href="https://wa.me/33752280890?text=Bonjour,%20je%20souhaite%20des%20informations%20pour%20une%20Omra%20avec%20OmraYanair." target="_blank" class="btn-premium btn-whatsapp">
            <svg style="width:20px;height:20px;fill:currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.449 5.413 1.451 5.428 0 9.85-4.414 9.853-9.843.002-2.63-1.012-5.101-2.859-6.95C17.207 1.963 14.73 1.96 12.01 1.96c-5.43 0-9.85 4.414-9.853 9.845-.001 1.925.501 3.805 1.458 5.41l-.984 3.591 3.684-.966zm11.23-6.843c-.3-.15-1.772-.875-2.046-.975-.276-.102-.476-.15-.676.15-.2.3-.778.976-.951 1.177-.174.2-.347.225-.648.075-.3-.15-1.264-.467-2.409-1.487-.889-.79-1.49-1.77-1.664-2.07-.174-.3-.019-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525C9.444 8.01 8.82 6.48 8.563 5.86c-.25-.605-.503-.522-.689-.532-.177-.01-.379-.01-.581-.01-.203 0-.532.075-.812.379-.28.305-1.063 1.04-1.063 2.537 0 1.497 1.09 2.946 1.24 3.149.15.2 2.146 3.279 5.198 4.6c.725.313 1.292.5 1.734.64.73.23 1.393.197 1.918.12.585-.087 1.773-.725 2.022-1.397.25-.673.25-1.25.175-1.373-.075-.125-.275-.2-.575-.35z"/></svg>
            Contact WhatsApp
          </a>
        </div>
      </section>

      <section class="home-grid">
        <div class="feature-card">
          <div class="card-icon">📖</div>
          <h2>Le Guide de la Omra</h2>
          <p>Toutes les informations officielles et spirituelles rédigées par nos accompagnateurs. De la check-list bagages aux détails précis des rites.</p>
          <a href="#/guide" class="btn-link">Explorer le guide &rarr;</a>
        </div>

        <div class="feature-card">
          <div class="card-icon">🤝</div>
          <h2>Expériences Pèlerins</h2>
          <p>Découvrez les retours authentiques de ceux qui nous ont fait confiance. Une transparence totale pour vous aider à franchir le pas.</p>
          <a href="#/experiences" class="btn-link">Voir les témoignages &rarr;</a>
        </div>

        <div class="feature-card">
          <div class="card-icon">✏️</div>
          <h2>Partager votre Voyage</h2>
          <p>Vous êtes parti avec OmraYanair ? Aidez la communauté en partageant votre expérience, vos conseils et vos photos de voyage.</p>
          <a href="#/partager" class="btn-link">Déposer un témoignage &rarr;</a>
        </div>
      </section>

      <section style="text-align:center; padding: 2rem 0; border-top: 1px solid rgba(15, 81, 50, 0.08);">
        <p style="color: var(--color-text-muted); font-size: 0.95rem;">Un service éditorial proposé par <strong>OmraYanair — Luxury Hajj & Umrah Travel</strong></p>
      </section>
    `;
  },

  renderGuide(container) {
    const articles = db.getPublishedArticles();
    const categories = ["Tous", "Avant le départ", "Documents", "Bagages", "Rites", "Conseils pratiques"];
    
    let activeCat = "Tous";

    const renderArticlesList = (cat) => {
      const filtered = cat === "Tous" ? articles : articles.filter(a => a.category === cat);
      let html = '';
      
      if (filtered.length === 0) {
        html = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted); padding: 3rem;">Aucun article dans cette catégorie pour le moment.</p>';
      } else {
        filtered.forEach(art => {
          html += `
            <article class="article-card">
              <div class="article-img-wrapper">
                <img src="${art.imageUrl}" alt="${art.title}" class="article-img" loading="lazy">
                <span class="article-cat-badge">${art.category}</span>
              </div>
              <div class="article-card-body">
                <div class="article-date">Publié le ${new Date(art.publishedAt).toLocaleDateString('fr-FR')}</div>
                <h3>${art.title}</h3>
                <p>${art.summary}</p>
                <a href="#/article?id=${art.id}" class="btn-premium btn-mini" style="align-self: flex-start; margin-top: auto;">Lire l'article</a>
              </div>
            </article>
          `;
        });
      }
      return html;
    };

    container.innerHTML = `
      <div class="section-header">
        <h2>Le Guide Pratique de la Omra</h2>
        <p>Préparez votre départ étape par étape grâce à nos fiches pratiques et conseils éditoriaux.</p>
      </div>

      <div class="category-filter" id="cat-filters">
        ${categories.map(c => `<button class="filter-btn ${c === activeCat ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('')}
      </div>

      <div class="articles-grid" id="articles-container">
        ${renderArticlesList(activeCat)}
      </div>
    `;

    // Filters event
    container.querySelectorAll('#cat-filters button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('#cat-filters button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-cat');
        container.querySelector('#articles-container').innerHTML = renderArticlesList(cat);
      });
    });
  },

  renderArticle(container, params) {
    const art = db.getArticleById(params.id);
    if (!art) {
      container.innerHTML = `<div style="text-align:center; padding: 4rem;"><h2 style="margin-bottom:1rem;">Article introuvable</h2><a href="#/guide" class="btn-premium">Retour au guide</a></div>`;
      return;
    }

    container.innerHTML = `
      <article class="article-full">
        <div class="article-header">
          <a href="#/guide" style="display:inline-flex; align-items:center; gap:0.25rem; color:var(--color-text-muted); font-size:0.9rem; margin-bottom:1.5rem;">&larr; Retour au Guide</a>
          <h1>${art.title}</h1>
          <div class="article-meta">
            <span>Catégorie : <strong>${art.category}</strong></span>
            <span>Publié le : <strong>${new Date(art.publishedAt).toLocaleDateString('fr-FR')}</strong></span>
          </div>
        </div>
        <img src="${art.imageUrl}" alt="${art.title}" class="article-full-img">
        <div class="article-content">
          ${art.content}
        </div>
        <div class="article-cta-box">
          <h3>Un projet de Omra ?</h3>
          <p>Des questions spécifiques sur l'organisation de votre futur pèlerinage ? Contactez directement nos conseillers OmraYanair via WhatsApp.</p>
          <a href="https://wa.me/33752280890?text=Bonjour,%20je%20souhaite%20des%20informations%20pour%20une%20Omra%20avec%20OmraYanair." target="_blank" class="btn-premium btn-whatsapp">
            Discuter sur WhatsApp
          </a>
        </div>
      </article>
    `;
  },

  renderExperiences(container) {
    const testimonies = db.getPublishedTestimonies();

    container.innerHTML = `
      <div class="testimonies-header-actions">
        <div>
          <h2>Expériences de nos Pèlerins</h2>
          <p>Découvrez les témoignages authentiques partagés par nos clients.</p>
        </div>
        <a href="#/partager" class="btn-premium">Partager mon expérience</a>
      </div>

      <div class="testimonies-grid">
        ${testimonies.length === 0 ? `
          <p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted); padding: 3rem;">Aucun témoignage publié pour le moment. Soyez le premier à partager votre voyage !</p>
        ` : testimonies.map(t => `
          <div class="testimony-card">
            <span class="testimony-quote">“</span>
            <p class="testimony-text">${t.text.replace(/\n/g, '<br>')}</p>
            
            ${t.images && t.images.length > 0 ? `
              <div class="testimony-photos-preview">
                ${t.images.map(img => `<img src="${img}" class="testimony-photo" alt="Photo de pèlerin" onclick="window.open('${img}', '_blank')">`).join('')}
              </div>
            ` : ''}

            <div class="testimony-author-info">
              <div class="author-meta">
                <h4>${t.name}</h4>
                <p>${t.city}, ${t.country}</p>
              </div>
              <div class="testimony-date">${new Date(t.publishedAt || t.submittedAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderPartager(container) {
    let uploadedImages = [];

    container.innerHTML = `
      <div class="form-card">
        <h2 style="text-align: center; margin-bottom: 2rem; color: var(--color-primary);">Partager mon expérience de la Omra</h2>
        
        <form id="experience-form">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Prénom ou Pseudo *</label>
              <input type="text" id="name" required placeholder="Ex: Yassine">
            </div>
            <div class="form-group">
              <label for="email">Adresse Email * (restera privée)</label>
              <input type="email" id="email" required placeholder="Ex: yassine@email.com">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="city">Ville *</label>
              <input type="text" id="city" required placeholder="Ex: Lyon">
            </div>
            <div class="form-group">
              <label for="country">Pays *</label>
              <input type="text" id="country" required placeholder="Ex: France">
            </div>
          </div>

          <div class="form-group">
            <label for="testimony">Votre témoignage *</label>
            <textarea id="testimony" rows="6" required placeholder="Racontez-nous votre voyage, l'accompagnement, vos conseils..."></textarea>
          </div>

          <div class="form-group">
            <label>Ajouter des photos (optionnel - max 3 photos, 2 Mo chacune)</label>
            <div class="upload-zone" id="drop-zone">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <div class="upload-zone-text">Glissez-déposez vos photos ou cliquez pour parcourir</div>
              <input type="file" id="file-input" multiple accept="image/*" style="display:none;">
            </div>
            <div class="upload-thumbnails" id="thumbnails-container"></div>
          </div>

          <div class="checkbox-group">
            <input type="checkbox" id="consent" required>
            <label for="consent">
              J’accepte que mon prénom ou pseudo, ma ville, mon pays, mon témoignage et les photos sélectionnées soient publiés sur le site La Voix du Pèlerin / OmraYanair après modération. Je comprends que mon adresse email reste privée.
            </label>
          </div>

          <button type="submit" class="btn-premium" style="width: 100%; justify-content: center; margin-top: 1rem;">Envoyer mon témoignage</button>
        </form>
      </div>
    `;

    // Photo Upload Event Logic
    const dropZone = container.querySelector('#drop-zone');
    const fileInput = container.querySelector('#file-input');
    const thumbnailsContainer = container.querySelector('#thumbnails-container');

    dropZone.addEventListener('click', () => fileInput.click());

    const handleFiles = (files) => {
      if (uploadedImages.length + files.length > 3) {
        alert("Vous ne pouvez pas ajouter plus de 3 photos.");
        return;
      }

      Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
          alert(`Le fichier ${file.name} n'est pas une image valide.`);
          return;
        }

        if (file.size > 2 * 1024 * 1024) {
          alert(`L'image ${file.name} dépasse la limite autorisée de 2 Mo.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const imgBase64 = e.target.result;
          uploadedImages.push(imgBase64);

          // Add thumbnail wrapper
          const index = uploadedImages.length - 1;
          const wrapper = document.createElement('div');
          wrapper.className = 'thumb-wrapper';
          wrapper.dataset.index = index;
          wrapper.innerHTML = `
            <img src="${imgBase64}" class="thumb-img">
            <button type="button" class="thumb-remove">&times;</button>
          `;

          wrapper.querySelector('.thumb-remove').addEventListener('click', () => {
            uploadedImages.splice(index, 1);
            wrapper.remove();
            // Re-index attributes
            container.querySelectorAll('.thumb-wrapper').forEach((el, i) => el.dataset.index = i);
          });

          thumbnailsContainer.appendChild(wrapper);
        };
        reader.readAsDataURL(file);
      });
    };

    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--color-accent)';
    });
    dropZone.addEventListener('dragleave', () => dropZone.style.borderColor = 'rgba(15, 81, 50, 0.15)');
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'rgba(15, 81, 50, 0.15)';
      handleFiles(e.dataTransfer.files);
    });

    // Submit Action
    container.querySelector('#experience-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        name: container.querySelector('#name').value,
        email: container.querySelector('#email').value,
        city: container.querySelector('#city').value,
        country: container.querySelector('#country').value,
        text: container.querySelector('#testimony').value,
        images: uploadedImages
      };

      db.submitTestimony(data);

      container.innerHTML = `
        <div class="form-card" style="text-align:center;">
          <div class="success-icon">✓</div>
          <h2 style="margin-bottom:1rem; color:var(--color-primary)">Témoignage envoyé !</h2>
          <p style="color:var(--color-text-muted); margin-bottom:2rem;">Merci pour votre contribution spirituelle. Votre témoignage sera vérifié par notre équipe avant d'être publié.</p>
          <a href="#/experiences" class="btn-premium">Retour aux témoignages</a>
        </div>
      `;
    });
  },

  renderLegal(container) {
    container.innerHTML = `
      <div class="legal-container">
        <div class="legal-nav" id="legal-tabs">
          <button class="legal-nav-btn active" data-target="mentions">Mentions Légales</button>
          <button class="legal-nav-btn" data-target="privacy">Confidentialité (RGPD)</button>
          <button class="legal-nav-btn" data-target="cgu">CGU Contribution</button>
        </div>

        <div class="legal-section active" id="mentions">
          <h2>Mentions Légales</h2>
          <p>En vigueur au 25 juin 2026.</p>
          <h3>1. Éditeur du site</h3>
          <p>Le site <strong>lavoixdupelerin.fr</strong> est édité par l'entreprise OmraYanair, dont l'identité juridique est en cours d'enregistrement.</p>
          <p>Directeur de la publication : Service Éditorial OmraYanair.<br>Contact : +33 7 52 28 08 90</p>
          <h3>2. Hébergement</h3>
          <p>Le site est hébergé par Firebase Hosting (Google Cloud Platform), hébergé dans des centres de données européens conformes RGPD.</p>
        </div>

        <div class="legal-section" id="privacy">
          <h2>Politique de Confidentialité (RGPD)</h2>
          <p>Dernière mise à jour : 25 Juin 2026.</p>
          <h3>1. Responsable de traitement</h3>
          <p>Le traitement des données personnelles collectées sur ce site est réalisé par OmraYanair.</p>
          <h3>2. Données collectées et finalités</h3>
          <p>Dans le cadre du formulaire de témoignages, nous collectons les données suivantes :</p>
          <ul>
            <li>Prénom ou pseudo (affiché publiquement) ;</li>
            <li>Ville et Pays (affichés publiquement) ;</li>
            <li>Adresse email (privée, conservée uniquement pour la modération et le suivi des demandes) ;</li>
            <li>Texte du témoignage (affiché publiquement) ;</li>
            <li>Photos (affichées publiquement après validation).</li>
          </ul>
          <h3>3. Durée de conservation</h3>
          <ul>
            <li>Témoignages publiés : conservés en ligne jusqu'à votre demande de retrait.</li>
            <li>Témoignages refusés ou obsolètes : suppression définitive sous 12 mois maximum.</li>
            <li>Photos refusées : suppression immédiate de nos serveurs.</li>
          </ul>
          <h3>4. Vos Droits (DSAR)</h3>
          <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour toute demande de retrait d'un témoignage ou d'une photo, contactez-nous au <strong>+33 7 52 28 08 90</strong>.</p>
        </div>

        <div class="legal-section" id="cgu">
          <h2>CGU de Contribution</h2>
          <h3>1. Objet</h3>
          <p>Les présentes Conditions Générales d'Utilisation régissent le dépôt de témoignages et de photos sur le site La Voix du Pèlerin.</p>
          <h3>2. Règles de publication</h3>
          <p>En soumettant une contribution, vous vous engagez à :</p>
          <ul>
            <li>Fournir un témoignage authentique de votre expérience réelle ;</li>
            <li>Ne pas publier de propos injurieux, diffamatoires, racistes ou contraires aux bonnes mœurs ;</li>
            <li>Ne pas soumettre de photos sur lesquelles apparaissent des tiers sans leur accord explicite (respect du droit à l'image) ;</li>
            <li>Ne pas insérer de liens publicitaires ou d'informations personnelles excessives.</li>
          </ul>
          <h3>3. Droit de modération</h3>
          <p>L'éditeur se réserve le droit de corriger les fautes d'orthographe (sans modifier le sens), de refuser ou supprimer tout contenu sans notification préalable, et de retirer les photos non conformes.</p>
        </div>
      </div>
    `;

    // Tabs logic
    container.querySelectorAll('#legal-tabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('#legal-tabs button').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.legal-section').forEach(sec => sec.classList.remove('active'));
        
        btn.classList.add('active');
        const target = btn.getAttribute('data-target');
        container.querySelector(`#${target}`).classList.add('active');
      });
    });
  },

  renderAdminLogin(container) {
    container.innerHTML = `
      <div class="admin-login-card">
        <h2 style="color:var(--color-primary)">Administration</h2>
        <form id="admin-login-form">
          <div class="form-group">
            <label for="admin-email">Email Admin</label>
            <input type="email" id="admin-email" required placeholder="admin@omrayanair.com">
          </div>
          <div class="form-group">
            <label for="admin-password">Mot de passe</label>
            <input type="password" id="admin-password" required placeholder="••••••••">
          </div>
          <div id="login-error" style="color:var(--color-error); font-size:0.85rem; margin-bottom:1rem; display:none;">Email ou mot de passe incorrect.</div>
          <button type="submit" class="btn-premium" style="width:100%; justify-content:center;">Se connecter</button>
        </form>
      </div>
    `;

    container.querySelector('#admin-login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = container.querySelector('#admin-email').value;
      const pass = container.querySelector('#admin-password').value;

      if (db.loginAdmin(email, pass)) {
        window.location.hash = '#/admin/dashboard';
      } else {
        container.querySelector('#login-error').style.display = 'block';
      }
    });
  },

  renderAdminDashboard(container) {
    let currentTab = 'testimonies'; // or 'articles'
    
    const renderContent = () => {
      const mainContent = container.querySelector('#admin-main-content');
      if (currentTab === 'testimonies') {
        const list = db.getAllTestimonies();
        const pendingCount = list.filter(t => t.status === 'pending').length;
        const publishedCount = list.filter(t => t.status === 'published').length;

        mainContent.innerHTML = `
          <div class="admin-header-actions">
            <div>
              <h2>Gestion des Témoignages</h2>
              <p>Modérez les contributions et gérez l'authenticité.</p>
            </div>
            <div style="display:flex; gap:0.5rem">
              <span class="status-badge pending">${pendingCount} En attente</span>
              <span class="status-badge published">${publishedCount} Publiés</span>
            </div>
          </div>

          <table class="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Auteur</th>
                <th>Origine</th>
                <th>Message / Photos</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? '<tr><td colspan="6" style="text-align:center;">Aucun témoignage enregistré.</td></tr>' : list.map(t => `
                <tr>
                  <td>${new Date(t.submittedAt).toLocaleDateString('fr-FR')}</td>
                  <td><strong>${t.name}</strong><br><span style="font-size:0.8rem;color:var(--color-text-muted);">${t.email}</span></td>
                  <td>${t.city} (${t.country})</td>
                  <td style="max-width:300px; font-size:0.9rem;">
                    <div style="max-height:80px; overflow-y:auto;">${t.text}</div>
                    ${t.images && t.images.length > 0 ? `
                      <div class="admin-photo-row">
                        ${t.images.map(img => `<img src="${img}" class="admin-photo-thumb" onclick="window.open('${img}', '_blank')">`).join('')}
                      </div>
                    ` : ''}
                  </td>
                  <td><span class="status-badge ${t.status}">${t.status === 'pending' ? 'en attente' : t.status === 'published' ? 'publié' : 'refusé'}</span></td>
                  <td>
                    <div class="table-actions">
                      ${t.status !== 'published' ? `<button class="btn-premium btn-mini btn-approve" data-id="${t.id}">Valider</button>` : ''}
                      ${t.status !== 'rejected' ? `<button class="btn-premium btn-mini btn-accent btn-reject" data-id="${t.id}">Refuser</button>` : ''}
                      <button class="btn-premium btn-mini btn-delete" data-id="${t.id}">Supprimer</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

        // Bind events
        mainContent.querySelectorAll('.btn-approve').forEach(btn => {
          btn.addEventListener('click', () => {
            db.updateTestimonyStatus(btn.getAttribute('data-id'), 'published');
            renderContent();
          });
        });

        mainContent.querySelectorAll('.btn-reject').forEach(btn => {
          btn.addEventListener('click', () => {
            db.updateTestimonyStatus(btn.getAttribute('data-id'), 'rejected');
            renderContent();
          });
        });

        mainContent.querySelectorAll('.btn-delete').forEach(btn => {
          btn.addEventListener('click', () => {
            if (confirm("Supprimer définitivement ce témoignage ?")) {
              db.deleteTestimony(btn.getAttribute('data-id'));
              renderContent();
            }
          });
        });

      } else {
        // Articles list
        const articles = db.getAllArticles();

        mainContent.innerHTML = `
          <div class="admin-header-actions">
            <div>
              <h2>Gestion du Guide Omra</h2>
              <p>Gérez et publiez vos articles éditoriaux.</p>
            </div>
            <button class="btn-premium" id="btn-create-article">+ Nouvel Article</button>
          </div>

          <table class="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Catégorie</th>
                <th>Titre</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${articles.length === 0 ? '<tr><td colspan="5" style="text-align:center;">Aucun article dans le guide.</td></tr>' : articles.map(art => `
                <tr>
                  <td><img src="${art.imageUrl}" style="width:50px;height:35px;object-fit:cover;border-radius:4px;"></td>
                  <td><span class="status-badge" style="background:#f1f5f9;color:var(--color-primary)">${art.category}</span></td>
                  <td><strong>${art.title}</strong></td>
                  <td><span class="status-badge ${art.status}">${art.status === 'published' ? 'publié' : 'brouillon'}</span></td>
                  <td>
                    <div class="table-actions">
                      <button class="btn-premium btn-mini btn-edit-art" data-id="${art.id}">Modifier</button>
                      <button class="btn-premium btn-mini btn-delete-art btn-delete" data-id="${art.id}">Supprimer</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

        // Create button event
        mainContent.querySelector('#btn-create-article').addEventListener('click', () => {
          this.openArticleModal(null, renderContent);
        });

        mainContent.querySelectorAll('.btn-edit-art').forEach(btn => {
          btn.addEventListener('click', () => {
            const artId = btn.getAttribute('data-id');
            const art = db.getArticleById(artId);
            this.openArticleModal(art, renderContent);
          });
        });

        mainContent.querySelectorAll('.btn-delete-art').forEach(btn => {
          btn.addEventListener('click', () => {
            if (confirm("Supprimer cet article ?")) {
              db.deleteArticle(btn.getAttribute('data-id'));
              renderContent();
            }
          });
        });
      }
    };

    container.innerHTML = `
      <div class="admin-dashboard-container">
        <aside class="admin-sidebar">
          <h3 style="margin-bottom:1.5rem; color:var(--color-primary)">Administration</h3>
          <div class="admin-nav-item active" id="tab-testimonies-btn">💬 Témoignages</div>
          <div class="admin-nav-item" id="tab-articles-btn">📝 Articles Guide</div>
          <div class="admin-nav-item" id="admin-logout-btn" style="margin-top:4rem; color:var(--color-error)">Déconnexion</div>
        </aside>
        <section class="admin-main" id="admin-main-content">
          <!-- Content injected here -->
        </section>
      </div>
    `;

    // Tab bindings
    const tabT = container.querySelector('#tab-testimonies-btn');
    const tabA = container.querySelector('#tab-articles-btn');
    
    tabT.addEventListener('click', () => {
      tabT.classList.add('active');
      tabA.classList.remove('active');
      currentTab = 'testimonies';
      renderContent();
    });

    tabA.addEventListener('click', () => {
      tabA.classList.add('active');
      tabT.classList.remove('active');
      currentTab = 'articles';
      renderContent();
    });

    container.querySelector('#admin-logout-btn').addEventListener('click', () => {
      db.logoutAdmin();
      window.location.hash = '#/admin';
    });

    renderContent();
  },

  openArticleModal(article, onSaveCallback) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width:600px;">
        <h3>${article ? 'Modifier l\'article' : 'Nouvel Article'}</h3>
        <form id="modal-article-form">
          <div class="form-group">
            <label for="modal-art-title">Titre *</label>
            <input type="text" id="modal-art-title" required value="${article ? article.title : ''}">
          </div>
          <div class="form-group">
            <label for="modal-art-cat">Catégorie *</label>
            <select id="modal-art-cat" style="width:100%; padding:0.75rem; border-radius:var(--border-radius-md); border:1px solid #cbd5e1;">
              <option value="Avant le départ" ${article && article.category === 'Avant le départ' ? 'selected' : ''}>Avant le départ</option>
              <option value="Documents" ${article && article.category === 'Documents' ? 'selected' : ''}>Documents</option>
              <option value="Bagages" ${article && article.category === 'Bagages' ? 'selected' : ''}>Bagages</option>
              <option value="Rites" ${article && article.category === 'Rites' ? 'selected' : ''}>Rites</option>
              <option value="Conseils pratiques" ${article && article.category === 'Conseils pratiques' ? 'selected' : ''}>Conseils pratiques</option>
            </select>
          </div>
          <div class="form-group">
            <label for="modal-art-summary">Résumé court *</label>
            <textarea id="modal-art-summary" rows="2" required>${article ? article.summary : ''}</textarea>
          </div>
          <div class="form-group">
            <label for="modal-art-content">Contenu (HTML autorisé) *</label>
            <textarea id="modal-art-content" rows="6" required>${article ? article.content : ''}</textarea>
          </div>
          <div class="form-group">
            <label for="modal-art-img">URL de l'image de couverture</label>
            <input type="text" id="modal-art-img" placeholder="https://images.unsplash.com/..." value="${article ? article.imageUrl : ''}">
          </div>
          <div class="form-group">
            <label for="modal-art-status">Statut *</label>
            <select id="modal-art-status" style="width:100%; padding:0.75rem; border-radius:var(--border-radius-md); border:1px solid #cbd5e1;">
              <option value="draft" ${article && article.status === 'draft' ? 'selected' : ''}>Brouillon</option>
              <option value="published" ${article && article.status === 'published' ? 'selected' : ''}>Publié</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-premium btn-accent btn-mini" id="modal-cancel">Annuler</button>
            <button type="submit" class="btn-premium btn-mini">Enregistrer</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#modal-cancel').addEventListener('click', () => modal.remove());

    modal.querySelector('#modal-article-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        id: article ? article.id : null,
        title: modal.querySelector('#modal-art-title').value,
        category: modal.querySelector('#modal-art-cat').value,
        summary: modal.querySelector('#modal-art-summary').value,
        content: modal.querySelector('#modal-art-content').value,
        imageUrl: modal.querySelector('#modal-art-img').value || undefined,
        status: modal.querySelector('#modal-art-status').value
      };

      db.saveArticle(data);
      modal.remove();
      onSaveCallback();
    });
  },

  renderNotFound(container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem;">
        <h2 style="font-size: 2.5rem; margin-bottom: 1rem; color:var(--color-primary)">Page Introuvable (404)</h2>
        <p style="color: var(--color-text-muted); margin-bottom: 2rem;">Le chemin demandé n'existe pas ou a été déplacé.</p>
        <a href="#/" class="btn-premium">Retour à l'accueil</a>
      </div>
    `;
  }
};

// Start App
app.init();
