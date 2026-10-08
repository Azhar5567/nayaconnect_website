document.addEventListener('DOMContentLoaded', () => {
  // --- Header Scrolled State ---
  const header = document.getElementById('header');
  
  function checkScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  
  window.addEventListener('scroll', checkScroll);
  checkScroll(); // Initial check

  // --- Mobile Menu Toggle ---
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
      
      // Animate burger lines
      const spans = navToggle.querySelectorAll('span');
      if (navToggle.classList.contains('active')) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close menu when close button or a link is clicked
    const menuCloseBtn = document.getElementById('mobile-menu-close');
    if (menuCloseBtn) {
      menuCloseBtn.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    }

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  // --- Active Nav Link Indicator on Scroll ---
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-menu .nav-item');

  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      const link = item.querySelector('a');
      if (link && link.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });

  // --- Scroll Animations (Intersection Observer) ---
  const animElements = document.querySelectorAll('.fade-in-up');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Trigger animation only once
      }
    });
  }, observerOptions);

  animElements.forEach(el => {
    animationObserver.observe(el);
  });

  // --- Web3Forms Live Email Submission Logic ---
  const WEB3FORMS_KEY = '19dd0956-8628-49d9-a33f-326ea72711dc';

  async function handleFormSubmit(form, successHtml) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Transmitting Confidential Inquiry...';

    const formData = new FormData(form);
    formData.set('access_key', WEB3FORMS_KEY.trim());
    formData.set('from_name', 'NayaConnect Executive Search Website');
    formData.set('subject', 'New Executive Search Mandate Inquiry - NayaConnect');

    const object = Object.fromEntries(formData);
    const jsonPayload = JSON.stringify(object);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: jsonPayload
      });
      const data = await response.json();
      
      if (data.success) {
        form.innerHTML = successHtml;
      } else {
        alert(data.message || 'Transmission error. Please email hrsolutions@nayaconnect.com directly.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    } catch (error) {
      console.error('Web3Forms submit error:', error);
      alert('Network error. Please email hrsolutions@nayaconnect.com directly.');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  // 1. Homepage & Contact Section Form
  const inquiryForm = document.getElementById('hiring-inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const successHtml = `
        <div style="text-align: center; padding: 3rem 0;">
          <div style="font-size: 2.5rem; color: var(--color-accent); margin-bottom: 1rem;">&bull;</div>
          <h3 style="margin-bottom: 1rem; color: var(--color-primary);">Inquiry Transmitted Successfully</h3>
          <p style="color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.6; max-width: 380px; margin: 0 auto;">
            Thank you. Your request has been delivered directly to Managing Partner Azhar Khan. We will contact you within one business day under strict confidentiality.
          </p>
        </div>
      `;
      handleFormSubmit(inquiryForm, successHtml);
    });
  }

  // 2. Contact Page Form
  const contactPageForm = document.getElementById('contact-form');
  if (contactPageForm) {
    contactPageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const successHtml = `
        <div style="text-align: center; padding: 3rem 0;">
          <div style="font-size: 2.5rem; color: var(--color-accent); margin-bottom: 1rem;">&bull;</div>
          <h3 style="margin-bottom: 1rem; color: var(--color-primary);">Inquiry Transmitted Successfully</h3>
          <p style="color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.6; max-width: 380px; margin: 0 auto;">
            Thank you. Your request has been delivered directly to Managing Partner Azhar Khan. We will contact you within one business day under strict confidentiality.
          </p>
        </div>
      `;
      handleFormSubmit(contactPageForm, successHtml);
    });
  }

  // 3. Newsletter Briefing Form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = newsletterForm.querySelector('.footer-subscribe-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
      
      const successHtml = `
        <p style="color: var(--color-accent); font-size: 0.9rem; margin-top: 0.5rem;">
          Successfully subscribed to Executive Briefings.
        </p>
      `;
      handleFormSubmit(newsletterForm, successHtml);
    });
  }

  // --- Mandate Modal Drawer Logic ---
  const modalOverlay = document.getElementById('modal-overlay');
  const modalDrawer = document.getElementById('modal-drawer');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const openModalTriggers = document.querySelectorAll('.header-cta, [data-open-modal]');

  function openModal(e) {
    if (e) e.preventDefault();
    if (modalOverlay && modalDrawer) {
      modalOverlay.classList.add('active');
      modalDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (modalOverlay && modalDrawer) {
      modalOverlay.classList.remove('active');
      modalDrawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  openModalTriggers.forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalDrawer && modalDrawer.classList.contains('active')) {
      closeModal();
    }
  });

  // 4. Modal Drawer Form Submission
  const modalForm = document.getElementById('modal-inquiry-form');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const successHtml = `
        <div style="text-align: center; padding: 3rem 0;">
          <div style="font-size: 2.5rem; color: var(--color-accent); margin-bottom: 1rem;">&bull;</div>
          <h3 style="margin-bottom: 1rem; color: var(--color-primary);">Inquiry Transmitted Successfully</h3>
          <p style="color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.6; max-width: 340px; margin: 0 auto;">
            Thank you. Your request has been delivered directly to Managing Partner Azhar Khan. We will contact you within one business day under strict confidentiality.
          </p>
        </div>
      `;
      handleFormSubmit(modalForm, successHtml);
    });
  }

  // --- Insight Article Reader Drawer ---
  const ARTICLES_DATA = {
    1: {
      category: "Leadership Report • October 2026",
      title: "FinTech Leadership in 2026: Scale, Unit Economics & Regulatory Scrutiny",
      content: `
        <p style="font-size: 0.95rem; line-height: 1.7; color: var(--color-text-muted); margin-bottom: 1.25rem;"><strong>Executive Summary:</strong> The era of 'growth-at-all-costs' in FinTech has definitively ended. Venture investors, public markets, and central bank regulators now demand sustainable unit economics, compliance-first architecture, and seasoned executive governance.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">1. The Capital-Efficient Founder & CEO</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1rem;">FinTech CEOs are transitioning from rapid customer acquisition metrics to gross margin health, contribution profit per transaction, and regulatory capital adequacy.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">2. Institutionalizing the C-Suite</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1rem;">Scaleups crossing Series B and C stages are aggressively recruiting seasoned CFOs and COOs from tier-1 banking institutions who bring rigorous audit, treasury, and capital markets experience.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">3. Strategic Talent Pipeline</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1.5rem;">Winning FinTechs build leadership redundancy early, securing specialized leaders across tech, product, and risk before regulatory scrutiny intensifies.</p>
      `
    },
    2: {
      category: "Talent Strategy • September 2026",
      title: "Building High-Performance Engineering & Product Teams in Digital Finance",
      content: `
        <p style="font-size: 0.95rem; line-height: 1.7; color: var(--color-text-muted); margin-bottom: 1.25rem;"><strong>Executive Summary:</strong> Financial technology architectures require zero-downtime reliability, millisecond latency, and bank-grade data security. Sourcing engineering and product executives who understand both code and financial plumbing is the defining competitive advantage.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">1. Bridging Tech Agility with Banking Protocols</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1rem;">The most effective FinTech CTOs understand ISO 20022 messaging, core banking APIs, and payment ledger idempotency while maintaining modern DevOps speed.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">2. Outcome-Driven Product Leadership</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1rem;">Chief Product Officers in FinTech must balance user conversion optimization with mandatory KYC frictions, multi-factor authentication, and fraud prevention controls.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">3. Specialized Tech Hiring Imperative</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1.5rem;">Leading firms map cross-border engineering talent in hubs like Bengaluru, Dubai, and Singapore to recruit specialized ledger, risk engine, and security architects.</p>
      `
    },
    3: {
      category: "Risk & Governance • August 2026",
      title: "The Modern Chief Risk Officer in FinTech: Innovation vs. Governance",
      content: `
        <p style="font-size: 0.95rem; line-height: 1.7; color: var(--color-text-muted); margin-bottom: 1.25rem;"><strong>Executive Summary:</strong> As central banks across India (RBI), UAE (CBUAE), and global markets establish dedicated digital lending and payment frameworks, the FinTech CRO has evolved into a strategic board-level pillar.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">1. Proactive Regulatory Navigation</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1rem;">Modern CROs actively engage with regulatory sandboxes and supervisory bodies, ensuring product launches comply with cross-border data residency and AML norms.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">2. Algorithmic & AI Credit Risk Oversight</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1rem;">With machine learning powering underwriting and fraud detection, risk leaders must audit model bias, explainability, and systemic delinquency risk.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">3. Executive Profile of the Modern CRO</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1.5rem;">FinTech boards are increasingly prioritizing risk executives who combine regulatory legal standing with commercial empathy for rapid product iterations.</p>
      `
    }
  };

  const articleTriggers = document.querySelectorAll('[data-read-article]');
  articleTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const articleId = trigger.getAttribute('data-read-article');
      const articleData = ARTICLES_DATA[articleId];
      if (!articleData) return;

      const modalDrawer = document.getElementById('modal-drawer');
      const modalOverlay = document.getElementById('modal-overlay');
      
      if (modalDrawer && modalOverlay) {
        modalDrawer.innerHTML = `
          <button class="modal-close-btn" id="modal-close-btn" aria-label="Close modal">&times;</button>
          <span class="section-label">${articleData.category}</span>
          <h3 style="font-size: 1.5rem; margin-bottom: 1.25rem; color: var(--color-primary); line-height: 1.3;">${articleData.title}</h3>
          
          <div class="article-body">
            ${articleData.content}
          </div>
          
          <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border);">
            <button class="btn btn-primary" id="article-cta-btn" style="width: 100%; border: none;">Discuss Search Mandate In This Area &rarr;</button>
          </div>
        `;

        modalOverlay.classList.add('active');
        modalDrawer.classList.add('active');
        document.body.style.overflow = 'hidden';

        const closeBtn = document.getElementById('modal-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        const articleCtaBtn = document.getElementById('article-cta-btn');
        if (articleCtaBtn) {
          articleCtaBtn.addEventListener('click', () => {
            // Restore default inquiry form
            window.location.href = "contact.html";
          });
        }
      }
    });
  });
});
