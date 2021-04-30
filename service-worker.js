let id = undefined;
let date = undefined;

addEventListener("message", ({ data }) => {
  if (
    id === undefined ||
    data.date < date ||
    (data.date === date && data.id < id)
  ) {
    id = data.id;
    date = data.date;
  }

  clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ id, date });
    });
  });
});
