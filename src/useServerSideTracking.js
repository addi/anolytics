import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Router from "next/router";

export default function useServerSideTracking(url = "/api/track") {
  let id = uuidv4();
  let date = new Date();
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
    if (lastPage === undefined) {
      postAnalytics(
        id,
        Router.pathname,
        document.referrer,
        getScreenResolution()
      );
    }

    lastPage = document.location.href;
  };

  const urlChanged = (url) => {
    postAnalytics(id, url, lastPage, getScreenResolution());
  };

  const setupCommunications = () => {
    navigator.serviceWorker.addEventListener("message", messageReceived);

    navigator.serviceWorker.controller.postMessage({ id, date });

    if (window && navigator.serviceWorker.controller) {
      window.onbeforeunload = function () {
        navigator.serviceWorker.controller.postMessage({ id, date });
      };
    }
  };

  const messageReceived = ({ data }) => {
    if (date < data.date || (date === data.date && id < data.id)) {
      navigator.serviceWorker.controller.postMessage({ id, date });
    } else {
      id = data.id;
      date = data.date;
    }
  };

  useEffect(() => {
    Router.events.on("routeChangeStart", urlAboutToChange);
    Router.events.on("routeChangeComplete", urlChanged);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("./next-google-analytics/service-worker.js")
        .then(() => navigator.serviceWorker.ready)
        .then(setupCommunications)
        .catch((error) => {
          console.error(error);
        });
    }

    setTimeout(() => {
      if (lastPage === undefined) {
        lastPage = document.location.href;

        postAnalytics(
          id,
          Router.pathname,
          document.referrer,
          getScreenResolution()
        );
      }
    }, 1000);
  }, []);
}
