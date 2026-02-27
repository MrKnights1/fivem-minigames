(function () {
  const f = document.createElement("link").relList;
  if (f && f.supports && f.supports("modulepreload")) return;
  for (const i of document.querySelectorAll('link[rel="modulepreload"]')) a(i);
  new MutationObserver((i) => {
    for (const d of i)
      if (d.type === "childList")
        for (const c of d.addedNodes)
          c.tagName === "LINK" && c.rel === "modulepreload" && a(c);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(i) {
    const d = {};
    return (
      i.integrity && (d.integrity = i.integrity),
      i.referrerPolicy && (d.referrerPolicy = i.referrerPolicy),
      i.crossOrigin === "use-credentials"
        ? (d.credentials = "include")
        : i.crossOrigin === "anonymous"
          ? (d.credentials = "omit")
          : (d.credentials = "same-origin"),
      d
    );
  }
  function a(i) {
    if (i.ep) return;
    i.ep = !0;
    const d = n(i);
    fetch(i.href, d);
  }
})();
