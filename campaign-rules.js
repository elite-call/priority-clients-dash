/* Campaign column → client + segment.
   Single source of truth for every page in this project. Loaded via <script src> in a DC helmet;
   exposes window.CampaignRules.

   Rules, checked in this order against the uppercased Campaign text:
     starts with A1G  → A1G,  PRIORITY if it contains PRIORITY, else STL
     starts with OHS  → OHS,  FP5 if it contains FP5, PROB ENROLL if it contains PROB
     contains SE26    → SE,   RENEW if it contains RENEW, else ACTIVE
     starts with AGN  → AGN,  STL
     anything else    → not one of the four clients, ignored
*/
(function (root) {
  var CLIENTS = ['OHS', 'SE', 'A1G', 'AGN'];

  var SEGMENTS = {
    OHS: ['FP5', 'PROB ENROLL'],
    SE:  ['ACTIVE', 'RENEW'],
    A1G: ['PRIORITY', 'STL'],
    AGN: ['STL']
  };

  function parse(campaign) {
    var s = String(campaign == null ? '' : campaign).toUpperCase().trim();
    if (!s) return { client: '', segment: '' };

    if (s.indexOf('A1G') === 0) {
      return { client: 'A1G', segment: s.indexOf('PRIORITY') >= 0 ? 'PRIORITY' : 'STL' };
    }
    if (s.indexOf('OHS') === 0) {
      if (s.indexOf('FP5') >= 0) return { client: 'OHS', segment: 'FP5' };
      if (s.indexOf('PROB') >= 0) return { client: 'OHS', segment: 'PROB ENROLL' };
      return { client: 'OHS', segment: '' };          // OHS with no recognised segment
    }
    if (s.indexOf('SE26') >= 0) {
      return { client: 'SE', segment: s.indexOf('RENEW') >= 0 ? 'RENEW' : 'ACTIVE' };
    }
    if (s.indexOf('AGN') === 0) {
      return { client: 'AGN', segment: 'STL' };
    }
    return { client: '', segment: '' };
  }

  /* Convenience: true when the campaign resolves to a usable client AND segment. */
  function resolves(campaign) {
    var r = parse(campaign);
    return !!(r.client && r.segment);
  }

  root.CampaignRules = { CLIENTS: CLIENTS, SEGMENTS: SEGMENTS, parse: parse, resolves: resolves };

  /* ---- Call Status → contact / lead -------------------------------------------------
     Dialer codes (CR_*, AGENTSPCB) and machine detections are not a person answering.
     OHS subtracts Already Completed to reach the net-contacts figure their AM sheet uses;
     no other client is known to. These are DEFAULTS — the aggregator page lets the user
     override them per client, and its overrides win.
  ---------------------------------------------------------------------------------------*/
  var NOT_CONTACT = /^cr_|^agent|answering\s*machine|^amd|pamd|unavailable|wrong number|busy|no answer|voicemail|fax|abandon|dead air|dropped|not in service|disconnected number|invalid|do not call|dnc/i;
  var LEADISH = /enroll|payment updated|payment update|ach |ach$|sold|sale\b|signed|upgrade/i;

  function defaultContact(client, status) {
    var s = String(status == null ? '' : status);
    if (NOT_CONTACT.test(s)) return false;
    if (client === 'OHS' && /already completed/i.test(s)) return false;
    return true;
  }
  function defaultLead(client, status) {
    return defaultContact(client, status) && LEADISH.test(String(status == null ? '' : status));
  }

  root.CallDispositions = {
    NOT_CONTACT: NOT_CONTACT, LEADISH: LEADISH,
    defaultContact: defaultContact, defaultLead: defaultLead
  };
})(typeof window !== 'undefined' ? window : this);
