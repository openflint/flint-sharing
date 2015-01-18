const { Class }  = require('sdk/core/heritage');
const { Cc, Ci, Cu } = require('chrome');

var addon_domains = []; // list of domains the addon added
var allowed_domains_pref = 'media.getusermedia.screensharing.allowed_domains';
var enable_screensharing_pref = 'media.getusermedia.screensharing.enabled';

const Enabler = Class({
    startup: function (data, reason) {
//        if (reason === APP_STARTUP) {
//            return;
//        }
        var prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefBranch);
        var values = prefs.getCharPref(allowed_domains_pref).split(',');

        console.log("2########", values);

        ['github.io', 'openflint.github.io'].forEach(function (domain) {
            if (values.indexOf(domain) === -1) {
                values.push(domain);
                addon_domains.push(domain);
            }
        });
        console.log("1########", prefs.getBoolPref(enable_screensharing_pref));
        if (prefs.getBoolPref(enable_screensharing_pref) == false) {
            prefs.setBoolPref(enable_screensharing_pref, 1);
        }
        console.log("11########", prefs.getBoolPref(enable_screensharing_pref));
        prefs.setCharPref(allowed_domains_pref, values.join(','));
    },

    shutdown: function (data, reason) {
        if (reason === APP_SHUTDOWN) {
            return;
        }
        var prefs = Cc["@mozilla.org/preferences-service;1"]
            .getService(Ci.nsIPrefBranch);
        var values = prefs.getCharPref(allowed_domains_pref).split(',');
        values = values.filter(function (value) {
            return addon_domains.indexOf(value) === -1;
        });
        prefs.setCharPref(allowed_domains_pref, values.join(','));
    },

    install: function (data, reason) {
    },

    uninstall: function (data, reason) {
    }
});

exports.Enabler = Enabler;