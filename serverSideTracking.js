"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = serverSideTracking;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _universalAnalytics = _interopRequireDefault(require("universal-analytics"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var defaultSettings = {
  sendSessionId: true,
  sendIp: true,
  anonymizeIp: true,
  sendUserAgent: true,
  sendScreenResolution: false
};

var anonymizeIp = function anonymizeIp(ip) {
  var ipSplitter = ip.includes(":") ? ":" : ".";
  var ipBits = ip.split(ipSplitter);
  ipBits[ipBits.length - 1] = "1";
  return ipBits.join(ipSplitter);
};

var prepareSettings = function prepareSettings(settings) {
  if (typeof settings === "string" || settings instanceof String) {
    var finalSettings = _objectSpread({}, defaultSettings);

    finalSettings["googleAnalyticsAccountId"] = settings;
    return finalSettings;
  } else {
    return _objectSpread(_objectSpread({}, defaultSettings), settings);
  }
};

function serverSideTracking(req, res, settings) {
  var finalSettings = prepareSettings(settings);

  if (finalSettings.hasOwnProperty("googleAnalyticsAccountId") === false) {
    res.status(500).send({
      error: "Google Analytics account id missing"
    });
    return;
  }

  var id = finalSettings.sendSessionId ? req.body.sessionId : undefined;
  var visitor = (0, _universalAnalytics["default"])(finalSettings.googleAnalyticsAccountId, id);
  var clientIp = (req.headers["x-forwarded-for"] || "").split(",").pop().trim() || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
  var params = {
    documentPath: req.body.path,
    documentReferrer: req.body.referrer
  };

  if (finalSettings.sendIp) {
    params["ipOverride"] = finalSettings.anonymizeIp ? anonymizeIp(clientIp) : clientIp;
  }

  if (finalSettings.sendUserAgent) {
    params["userAgentOverride"] = req.headers["user-agent"];
  }

  if (finalSettings.sendScreenResolution) {
    params["screenResolution"] = req.body.screenResolution;
  }

  visitor.pageview(params, function (err) {
    if (err) {
      console.error(err);
      res.status(500).send({
        error: "Error, check logs"
      });
    } else {
      res.status(200).send({
        success: true
      });
    }
  });
}