self.addEventListener("message", ({ data }) => { self.postMessage({ mean: data.reduce((a,b)=>a+b,0)/data.length || 0 }); });
