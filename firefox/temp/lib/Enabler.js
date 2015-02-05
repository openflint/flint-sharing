const { Class }  = require('sdk/core/heritage');
const { Cc, Ci, Cu } = require('chrome');

var addon_domains = []; // list of domains the addon added
var screensharing_pref = null;
var screensharing_on_old_platforms_pref = null;
var mixed_content_pref = null;

var allowed_domains_pref = 'media.getusermedia.screensharing.allowed_domains';
var enable_screensharing_pref = 'media.getusermedia.screensharing.enabled';
var enable_mixed_content_pref = 'security.mixed_content.block_active_content';

// todo:
// enable: dom.udpsocket.enabled

// support WindowsXP
var enable_screensharing_on_old_platforms_pref = 'media.getusermedia.screensharing.allow_on_old_platforms';

const Enabler = Class({
    setup: function () {
        var prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefBranch);

        // enable screen sharing
        screensharing_pref = prefs.getBoolPref(enable_screensharing_pref);
        if (screensharing_pref == false) {
            prefs.setBoolPref(enable_screensharing_pref, true);
        }

        // enable screen sharing on WindowsXP
        screensharing_on_old_platforms_pref = prefs.getBoolPref(enable_screensharing_on_old_platforms_pref);
        if (screensharing_on_old_platforms_pref == false) {
            prefs.setBoolPref(enable_screensharing_on_old_platforms_pref, true);
        }

        // disable mixed_content
        mixed_content_pref = prefs.getBoolPref(enable_mixed_content_pref);
        if (mixed_content_pref == true) {
            prefs.setBoolPref(enable_mixed_content_pref, false);
        }

        // add allow domains
        var values = prefs.getCharPref(allowed_domains_pref).split(',');
        ['github.io', 'openflint.github.io'].forEach(function (domain) {
            if (values.indexOf(domain) === -1) {
                values.push(domain);
                addon_domains.push(domain);
            }
        });
        prefs.setCharPref(allowed_domains_pref, values.join(','));
    },

    revert: function () {
        var prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefBranch);

        // revert screen sharing
        prefs.setBoolPref(enable_screensharing_pref, screensharing_pref);

        // revert screen sharing on WindowsXP
        prefs.setBoolPref(enable_screensharing_on_old_platforms_pref, screensharing_on_old_platforms_pref);

        // revert mixed_content
        prefs.setBoolPref(enable_mixed_content_pref, mixed_content_pref);

        // revert allow domains
        var values = prefs.getCharPref(allowed_domains_pref).split(',');
        values = values.filter(function (value) {
            return addon_domains.indexOf(value) === -1;
        });
        prefs.setCharPref(allowed_domains_pref, values.join(','));
    }
});

exports.Enabler = Enabler;