import ua from "universal-analytics";

const defaultSettings = {
  sendSessionId: true,
  sendIp: true,
  anonymizeIp: true,
  sendUserAgent: true,
  sendScreenResolution: false,
};

const anonymizeIp = (ip) => {
  const ipSplitter = ip.includes(":") ? ":" : ".";

  const ipBits = ip.split(ipSplitter);

  ipBits[ipBits.length - 1] = "1";

  return ipBits.join(ipSplitter);
};

const prepareSettings = (settings) => {
  if (typeof settings === "string" || settings instanceof String) {
    const finalSettings = { ...defaultSettings };

    finalSettings["googleAnalyticsAccountId"] = settings;

    return finalSettings;
  } else {
    return { ...defaultSettings, ...settings };
  }
};

export default function serverSideTracking(req, res, settings) {
  const finalSettings = prepareSettings(settings);

  if (finalSettings.hasOwnProperty("googleAnalyticsAccountId") === false) {
    res.status(500).send({ error: "Google Analytics account id missing" });
    return;
  }

  const id = finalSettings.sendSessionId ? req.body.sessionId : undefined;

  const visitor = ua(finalSettings.googleAnalyticsAccountId, id);

  const clientIp =
    (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  var params = {
    documentPath: req.body.path,
    documentReferrer: req.body.referrer,
  };

  if (finalSettings.sendIp) {
    params["ipOverride"] = finalSettings.anonymizeIp
      ? anonymizeIp(clientIp)
      : clientIp;
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
      res.status(500).send({ error: "Error, check logs" });  
    } else {
      res.status(200).send({ success: true });  
    }

  });
}
