import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Router from "next/router";

let sID = undefined;

export default function useServerSideTracking(url = "/api/track") {
  let lastPage = undefined;

  const postAnalytics = async (sessionId, path, referrer, screenResolution) => {
    const body = {
      sessionId: sessionId,
      path: path,
      referrer: referrer,
      screenResolution: screenResolution,
    };

    await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(body),
    });
  };

  const getScreenResolution = () => screen.width + "x" + screen.height;

  const urlAboutToChange = () => {
    lastPage = document.location.href;
  };

  const urlChanged = (url) => {
    postAnalytics(sID, url, lastPage, getScreenResolution());
  };

  const messageReceived = (event) => {
    if (event.key == "next_vercel_tracking: sId" && sID === undefined) {
      sID = event.newValue;
      postAnalytics(
        sID,
        Router.pathname,
        document.referrer,
        getScreenResolution()
      );
    }

    if (event.key == "next_vercel_tracking: send_sId" && sID !== undefined) {
      sendMessage("next_vercel_tracking: sId", sID);
    }
  };

  const sendMessage = (key, value) => {
    localStorage.setItem(key, value);
    localStorage.removeItem(key);
  };

  useEffect(() => {
    Router.events.on("routeChangeStart", urlAboutToChange);
    Router.events.on("routeChangeComplete", urlChanged);

    window.addEventListener("storage", messageReceived);

    sendMessage("next_vercel_tracking: send_sId", "");

    setTimeout(() => {
      if (sID === undefined) {
        sID = uuidv4();

        postAnalytics(
          sID,
          Router.pathname,
          document.referrer,
          getScreenResolution()
        );
      }
    }, 50);
  }, []);
}
