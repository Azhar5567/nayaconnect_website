/**
 * NayaConnect Advertising & Campaign Tracking Module
 * Captures, persists (first-party storage), and attaches campaign attribution
 * to employer enquiry forms without modifying page design or layout.
 *
 * Supported parameters:
 * utm_source, utm_medium, utm_campaign, utm_term, utm_content,
 * campaign_id (utm_id), ad_group_id (adgroup_id, adset_id), ad_id (creative_id),
 * and platform click IDs (gclid, fbclid, li_fat_id, msclkid, ttclid).
 */
(function(window, document) {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    FIRST_TOUCH: 'nc_trk_first_touch',
    LAST_TOUCH: 'nc_trk_last_touch',
    SESSION: 'nc_trk_session',
    SUBMISSIONS: 'nc_trk_submissions'
  };

  // Safe First-Party Storage Wrapper (handles private browsing / localStorage blocks)
  const SafeStorage = {
    _mem: {},

    isSupported: function() {
      try {
        const test = '__nc_test__';
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    },

    get: function(key) {
      if (this.isSupported()) {
        try {
          const raw = window.localStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch (e) {
          return null;
        }
      }
      return this._mem[key] || null;
    },

    set: function(key, val) {
      if (this.isSupported()) {
        try {
          window.localStorage.setItem(key, JSON.stringify(val));
          return true;
        } catch (e) {
          // LocalStorage might be full or restricted
        }
      }
      this._mem[key] = val;
      return true;
    }
  };

  // Device Classifier
  function getDeviceType() {
    const width = window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || 1024;
    const nav = window.navigator || {};
    const ua = nav.userAgent || '';
    const isTouch = ('ontouchstart' in window) || (Boolean(nav.maxTouchPoints && nav.maxTouchPoints > 0));

    if (/iPad|Tablet/i.test(ua) || (isTouch && width >= 681 && width <= 1024)) {
      return 'tablet';
    }
    if (/Mobi|Android|iPhone|iPod/i.test(ua) || (isTouch && width <= 680) || width <= 680) {
      return 'mobile';
    }
    return 'desktop';
  }

  // Privacy & Consent Check (Global Privacy Control & Do-Not-Track)
  function isPrivacyRestricted() {
    try {
      const nav = window.navigator || {};
      if (nav.globalPrivacyControl === true) return true;
      if (nav.doNotTrack === '1' || window.doNotTrack === '1') return true;
    } catch (e) {}
    return false;
  }

  // Sanitize Parameter (prevents XSS and limits string length)
  function sanitizeParam(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>"'`;]/g, '').trim().substring(0, 255);
  }

  // Parameter Extraction from URL
  function extractCampaignParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};

    // Standard UTMs
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const utmTerm = params.get('utm_term');
    const utmContent = params.get('utm_content');

    if (utmSource) result.utm_source = sanitizeParam(utmSource);
    if (utmMedium) result.utm_medium = sanitizeParam(utmMedium);
    if (utmCampaign) result.utm_campaign = sanitizeParam(utmCampaign);
    if (utmTerm) result.utm_term = sanitizeParam(utmTerm);
    if (utmContent) result.utm_content = sanitizeParam(utmContent);

    // Campaign ID (supports campaign_id or utm_id)
    const campaignId = params.get('campaign_id') || params.get('utm_id');
    if (campaignId) result.campaign_id = sanitizeParam(campaignId);

    // Ad Group ID (supports ad_group_id, adgroup_id, adset_id)
    const adGroupId = params.get('ad_group_id') || params.get('adgroup_id') || params.get('adset_id');
    if (adGroupId) result.ad_group_id = sanitizeParam(adGroupId);

    // Ad ID (supports ad_id, creative_id)
    const adId = params.get('ad_id') || params.get('creative_id');
    if (adId) result.ad_id = sanitizeParam(adId);

    // Click IDs (only if privacy allows)
    if (!isPrivacyRestricted()) {
      const clickId = params.get('gclid') || params.get('fbclid') || params.get('li_fat_id') ||
                      params.get('msclkid') || params.get('ttclid') || params.get('wbraid');
      if (clickId) result.click_id = sanitizeParam(clickId);
    }

    return result;
  }

  // Determine if extracted params contain any meaningful campaign data
  function hasCampaignData(params) {
    if (!params) return false;
    return Boolean(
      params.utm_source ||
      params.utm_medium ||
      params.utm_campaign ||
      params.campaign_id ||
      params.ad_group_id ||
      params.ad_id ||
      params.click_id
    );
  }

  // Main Tracker Object
  const NTC_Tracker = {
    init: function() {
      this.captureAttribution();
      this.attachToForms();
      this.setupConsultationTracking();
    },

    captureAttribution: function() {
      const now = new Date().toISOString();
      const currentPath = window.location.pathname + window.location.search;
      const referrer = document.referrer ? sanitizeParam(document.referrer) : '';
      const currentCampaign = extractCampaignParams();
      const hasCurrentCampaign = hasCampaignData(currentCampaign);

      // 1. First-Touch Attribution (set once, never overwritten)
      let firstTouch = SafeStorage.get(STORAGE_KEYS.FIRST_TOUCH);
      if (!firstTouch) {
        if (hasCurrentCampaign) {
          firstTouch = {
            ...currentCampaign,
            landing_page: currentPath,
            referrer: referrer || 'direct',
            timestamp: now,
            type: 'campaign'
          };
        } else {
          // Direct or Organic First Touch
          let organicSource = 'direct';
          if (referrer) {
            try {
              const refHost = new URL(referrer).hostname;
              if (refHost && !refHost.includes(window.location.hostname)) {
                organicSource = refHost;
              }
            } catch (e) {
              organicSource = referrer;
            }
          }
          firstTouch = {
            utm_source: organicSource,
            utm_medium: organicSource === 'direct' ? 'none' : 'organic_referral',
            utm_campaign: 'none',
            landing_page: currentPath,
            referrer: referrer || 'direct',
            timestamp: now,
            type: 'organic_or_direct'
          };
        }
        SafeStorage.set(STORAGE_KEYS.FIRST_TOUCH, firstTouch);
      }

      // 2. Last-Touch Attribution (only updated if new campaign parameters exist)
      // Requirement 7: Do not overwrite existing tracking information with empty parameters!
      if (hasCurrentCampaign) {
        const lastTouch = {
          ...currentCampaign,
          landing_page: currentPath,
          referrer: referrer || 'direct',
          timestamp: now
        };
        SafeStorage.set(STORAGE_KEYS.LAST_TOUCH, lastTouch);
      }
    },

    // Get combined attribution payload for form attachment
    getAttributionPayload: function() {
      const firstTouch = SafeStorage.get(STORAGE_KEYS.FIRST_TOUCH) || {};
      const lastTouch = SafeStorage.get(STORAGE_KEYS.LAST_TOUCH) || {};
      const deviceType = getDeviceType();
      const currentPath = window.location.pathname;

      return {
        // Last-touch / Recent Campaign
        utm_source: lastTouch.utm_source || firstTouch.utm_source || 'direct',
        utm_medium: lastTouch.utm_medium || firstTouch.utm_medium || '',
        utm_campaign: lastTouch.utm_campaign || firstTouch.utm_campaign || '',
        utm_term: lastTouch.utm_term || '',
        utm_content: lastTouch.utm_content || '',
        campaign_id: lastTouch.campaign_id || '',
        ad_group_id: lastTouch.ad_group_id || '',
        ad_id: lastTouch.ad_id || '',
        click_id: lastTouch.click_id || firstTouch.click_id || '',
        
        // Original / First-touch Campaign
        first_touch_source: firstTouch.utm_source || 'direct',
        first_touch_medium: firstTouch.utm_medium || '',
        first_touch_campaign: firstTouch.utm_campaign || '',
        first_landing_page: firstTouch.landing_page || currentPath,

        // Context
        recent_landing_page: currentPath,
        traffic_referrer: document.referrer ? sanitizeParam(document.referrer) : (firstTouch.referrer || 'direct'),
        device_type: deviceType,
        tracking_timestamp: new Date().toISOString()
      };
    },

    // Attach tracking fields as hidden inputs to any forms on the page
    attachToForms: function() {
      const forms = document.querySelectorAll('form.contact-form, #hiring-inquiry-form, #contact-form');
      if (!forms || forms.length === 0) return;

      const payload = this.getAttributionPayload();

      forms.forEach(form => {
        Object.keys(payload).forEach(key => {
          let input = form.querySelector(`input[name="${key}"]`);
          if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.id = `trk_${key}`;
            form.appendChild(input);
          }
          input.value = payload[key] || '';
        });
      });
    },

    // Track Form Submission Event (called on successful Web3Forms response)
    trackLeadSubmission: function(formElement, additionalData) {
      const payload = {
        ...this.getAttributionPayload(),
        ...(additionalData || {})
      };

      // 1. First-Party Audit Storage (store submission record for client verification)
      try {
        const history = SafeStorage.get(STORAGE_KEYS.SUBMISSIONS) || [];
        history.push({
          timestamp: new Date().toISOString(),
          form_id: formElement ? formElement.id : 'hiring-inquiry-form',
          tracking: payload
        });
        if (history.length > 20) history.shift(); // keep last 20
        SafeStorage.set(STORAGE_KEYS.SUBMISSIONS, history);
      } catch (e) {}

      // 2. Google Tag Manager / dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'generate_lead',
        form_id: formElement ? formElement.id : 'hiring-inquiry-form',
        form_name: 'fintech_recruitment_enquiry',
        lead_type: 'employer_enquiry',
        utm_source: payload.utm_source,
        utm_medium: payload.utm_medium,
        utm_campaign: payload.utm_campaign,
        campaign_id: payload.campaign_id,
        ad_group_id: payload.ad_group_id,
        ad_id: payload.ad_id,
        first_touch_source: payload.first_touch_source,
        first_touch_campaign: payload.first_touch_campaign,
        device_type: payload.device_type
      });

      // 3. Google Analytics 4 / Google Ads (gtag)
      if (typeof window.gtag === 'function') {
        try {
          window.gtag('event', 'generate_lead', {
            event_category: 'Fintech Recruitment Lead',
            event_label: payload.utm_campaign || 'direct',
            value: 1,
            currency: 'USD'
          });
        } catch (e) {}
      }

      // 4. Meta Pixel (fbq)
      if (typeof window.fbq === 'function') {
        try {
          window.fbq('track', 'Lead', {
            content_name: 'Fintech Recruitment Enquiry',
            content_category: 'Employer Mandate'
          });
        } catch (e) {}
      }

      // 5. LinkedIn Insight Tag (lintrk)
      if (typeof window.lintrk === 'function') {
        try {
          window.lintrk('track', { conversion_id: 'lead' });
        } catch (e) {}
      }

      // 6. Custom DOM Event for custom handlers or sidecars
      try {
        window.dispatchEvent(new CustomEvent('nc_lead_submitted', {
          detail: {
            formId: formElement ? formElement.id : 'hiring-inquiry-form',
            tracking: payload,
            timestamp: new Date().toISOString()
          }
        }));
      } catch (e) {}
    },

    // Consultation Booking & Intent Tracking
    setupConsultationTracking: function() {
      // Track clicks on primary Consultation / Hiring intent CTA buttons
      document.addEventListener('click', (e) => {
        const target = e.target.closest('a[href="#enquiry"], a[href*="contact"], .hero-cta-btn, #header-cta-btn');
        if (target) {
          const ctaText = target.textContent ? target.textContent.trim() : 'Discuss Hiring';
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'consultation_cta_click',
            cta_text: ctaText,
            cta_href: target.getAttribute('href') || '#enquiry',
            page: window.location.pathname
          });

          try {
            window.dispatchEvent(new CustomEvent('nc_consultation_intent', {
              detail: {
                cta_text: ctaText,
                page: window.location.pathname,
                timestamp: new Date().toISOString()
              }
            }));
          } catch (err) {}
        }
      });
    }
  };

  // Expose globally
  window.NTC_Tracker = NTC_Tracker;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      NTC_Tracker.init();
    });
  } else {
    NTC_Tracker.init();
  }

})(window, document);
