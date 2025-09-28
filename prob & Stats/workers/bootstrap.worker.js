self.addEventListener("message", ({ data }) => { self.postMessage({ samples: data.samples || [] }); });
