"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = useServerSideTracking;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _react = require("react");

var _uuid = require("uuid");

var _router = _interopRequireDefault(require("next/router"));

function useServerSideTracking() {
  var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "/api/track";
  var id = (0, _uuid.v4)();
  var date = new Date();
  var lastPage = undefined;

  var postAnalytics = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(sessionId, path, referrer, screenResolution) {
      var body;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              body = {
                sessionId: sessionId,
                path: path,
                referrer: referrer,
                screenResolution: screenResolution
              };
              _context.next = 3;
              return fetch(url, {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(body)
              });

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function postAnalytics(_x, _x2, _x3, _x4) {
      return _ref.apply(this, arguments);
    };
  }();

  var getScreenResolution = function getScreenResolution() {
    return screen.width + "x" + screen.height;
  };

  var urlAboutToChange = function urlAboutToChange() {
    if (lastPage === undefined) {
      postAnalytics(id, _router["default"].pathname, document.referrer, getScreenResolution());
    }

    lastPage = document.location.href;
  };

  var urlChanged = function urlChanged(url) {
    postAnalytics(id, url, lastPage, getScreenResolution());
  };

  var setupCommunications = function setupCommunications() {
    navigator.serviceWorker.addEventListener("message", messageReceived);
    navigator.serviceWorker.controller.postMessage({
      id: id,
      date: date
    });

    if (window && navigator.serviceWorker.controller) {
      window.onbeforeunload = function () {
        navigator.serviceWorker.controller.postMessage({
          id: id,
          date: date
        });
      };
    }
  };

  var messageReceived = function messageReceived(_ref2) {
    var data = _ref2.data;

    if (date < data.date || date === data.date && id < data.id) {
      navigator.serviceWorker.controller.postMessage({
        id: id,
        date: date
      });
    } else {
      id = data.id;
      date = data.date;
    }
  };

  (0, _react.useEffect)(function () {
    _router["default"].events.on("routeChangeStart", urlAboutToChange);

    _router["default"].events.on("routeChangeComplete", urlChanged);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./next-google-analytics/service-worker.js").then(function () {
        return navigator.serviceWorker.ready;
      }).then(setupCommunications)["catch"](function (error) {
        console.error(error);
      });
    }

    setTimeout(function () {
      if (lastPage === undefined) {
        lastPage = document.location.href;
        postAnalytics(id, _router["default"].pathname, document.referrer, getScreenResolution());
      }
    }, 1000);
  }, []);
}