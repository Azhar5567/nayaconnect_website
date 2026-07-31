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

    // Close menu when a link is clicked
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
    formData.append('access_key', WEB3FORMS_KEY);
    formData.append('from_name', 'NayaConnect Executive Search Website');
    formData.append('subject', 'New Executive Search Mandate Inquiry - NayaConnect');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
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
      category: "Talent Report • July 2026",
      title: "The Next Era of Wealth Management Leadership",
      content: `
        <p style="font-size: 0.95rem; line-height: 1.7; color: var(--color-text-muted); margin-bottom: 1.25rem;"><strong>Executive Summary:</strong> The global wealth management sector is undergoing a structural shift driven by an estimated $84 trillion intergenerational wealth transfer and rapid digitization of advisory services.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">1. Dual-Competency Leadership</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1rem;">Traditional relationship-only wealth managers are being superseded by leaders who combine private banking pedigree with digital portfolio intelligence capabilities.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">2. Next-Gen Client Retention</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1rem;">Next-generation heirs demand ESG-aligned investment strategies, alternative assets (Private Equity, Venture Capital), and instant mobile portal access.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">3. Strategic Sourcing Imperative</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1.5rem;">Institutions must actively recruit leaders capable of scaling multi-family office platforms while maintaining ultra-high-net-worth client trust.</p>
      `
    },
    2: {
      category: "Governance • June 2026",
      title: "Risk and Regulation in FinTech Scale-Ups",
      content: `
        <p style="font-size: 0.95rem; line-height: 1.7; color: var(--color-text-muted); margin-bottom: 1.25rem;"><strong>Executive Summary:</strong> As digital banking and neo-lending platforms achieve institutional scale, regulatory scrutiny from financial authorities across India, GCC, and global jurisdictions has intensified.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">1. The Evolving CRO Mandate</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1rem;">FinTech Chief Risk Officers (CROs) must bridge the gap between high-velocity engineering and rigorous compliance, AML, and credit risk governance.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">2. Regulatory Technology & Reporting</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1rem;">Modern compliance leaders are required to implement automated transaction monitoring and real-time regulatory reporting frameworks.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">3. Board Oversight Requirements</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1.5rem;">Investors and regulators require FinTech boards to maintain independent risk committees with veteran banking compliance expertise.</p>
      `
    },
    3: {
      category: "Board Advisory • May 2026",
      title: "Board Composition in the Era of AI & Automation",
      content: `
        <p style="font-size: 0.95rem; line-height: 1.7; color: var(--color-text-muted); margin-bottom: 1.25rem;"><strong>Executive Summary:</strong> Artificial Intelligence and algorithmic decision-making have shifted from operational tools to strategic board-level governance priorities across banking and capital markets.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">1. Algorithmic Risk Oversight</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1rem;">Boards require Independent Directors capable of evaluating credit scoring algorithms, fraud detection models, and data privacy safeguards.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">2. Technology & Cyber Expertise</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1rem;">Tier-1 financial institutions are actively recruiting former CTOs, CISOs, and Tech Founders into Non-Executive Director roles.</p>
        <h4 style="margin: 1.5rem 0 0.5rem 0; color: var(--color-primary); font-size: 1.1rem;">3. Governance & Ethics Frameworks</h4>
        <p style="font-size: 0.9rem; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 1.5rem;">Establishing clear ethical AI boundaries and model risk management guidelines is now mandatory for board audit and risk committees.</p>
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
