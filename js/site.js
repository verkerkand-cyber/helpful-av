/* Helpful AV shared site JS — hav-site-v24 */
(function () {
  var WA = "27662392340";
  var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxUXB-qiQsHxUA3JhO_7IqDkiXPuwrjza_fKPRGfzL0ySULdXQrx7Ob81vVAQVcq6ah/exec";
  window.HAV_SCRIPT_URL = SCRIPT_URL;

  function normAgent(raw) {
    return String(raw || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 12).toUpperCase();
  }

  // Agent code: ?agent=AG01 → localStorage hav_agent
  var agent = "";
  try {
    agent = normAgent(new URLSearchParams(location.search).get("agent"));
  } catch (e) {}
  try {
    if (agent) localStorage.setItem("hav_agent", agent);
    else agent = normAgent(localStorage.getItem("hav_agent") || "");
  } catch (e) {}
  window.HAV_AGENT = agent;

  var chip = document.getElementById("agentChip");
  if (chip && agent) {
    chip.textContent = "Your Helpful AV agent: " + agent;
    chip.style.display = "block";
  }
  var oa = document.getElementById("orderAgent");
  if (oa && agent) {
    oa.textContent = "Agent code: " + agent;
    oa.style.display = "block";
  }

  document.querySelectorAll(".js-wa").forEach(function (a) {
    var msg = a.getAttribute("data-msg") || "Hi Jayden";
    if (agent && msg.indexOf("AGENT -") !== 0) msg += " (Agent code: " + agent + ")";
    a.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
    a.target = "_blank";
    a.rel = "noopener";
  });

  var ac = document.getElementById("agent_code");
  if (ac) ac.value = agent || "direct";
  var subj = document.getElementById("fs_subject");
  if (subj) subj.value = "New Helpful AV order - agent " + (agent || "direct");

  // Mobile nav
  var nav = document.querySelector(".nav");
  var toggle = document.getElementById("navToggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
    });
    nav.querySelectorAll(".nav-tabs a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  // Funky: cursor glow + tilt on home
  var glow=document.querySelector(".hero-glow");
  if(glow){document.addEventListener("mousemove",function(e){glow.style.transform="translate("+(e.clientX-150)+"px,"+(e.clientY-150)+"px)";});}
  document.querySelectorAll(".tilt").forEach(function(el){
    el.addEventListener("mousemove",function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform="perspective(800px) rotateY("+x*5+"deg) rotateX("+(-y*5)+"deg)";});
    el.addEventListener("mouseleave",function(){el.style.transform="";});
  });
  if("IntersectionObserver" in window){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target);}});},{threshold:.1});
    document.querySelectorAll(".card,.sample,.stats>div").forEach(function(el){el.classList.add("reveal");io.observe(el);});}

  // Hero banner rotation
  var stage = document.getElementById("bannerStage");
  if (stage) {
    var vids = Array.prototype.slice.call(stage.querySelectorAll("video"));
    var dotsWrap = document.getElementById("bannerDots");
    var idx = 0;
    vids.forEach(function (v, i) {
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.setAttribute("muted", "");
      if (dotsWrap) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Show Short " + (i + 1));
        if (i === 0) b.classList.add("on");
        b.addEventListener("click", function () { go(i, true); });
        dotsWrap.appendChild(b);
      }
    });
    function go(n, user) {
      if (!vids.length) return;
      vids[idx].classList.remove("is-active");
      try { vids[idx].pause(); } catch (e) {}
      idx = ((n % vids.length) + vids.length) % vids.length;
      vids[idx].classList.add("is-active");
      try {
        vids[idx].currentTime = 0;
        var p = vids[idx].play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
          d.classList.toggle("on", i === idx);
        });
      }
      if (user) restart();
    }
    var timer = null;
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { go(idx + 1, false); }, 3500);
    }
    if (vids.length) {
      go(0, false);
      restart();
    }
  }

  // Social strip view counters (demo only — not live stats)
  document.querySelectorAll("[data-views]").forEach(function (el) {
    var start = parseInt(el.getAttribute("data-views"), 10) || 1200;
    var n = start;
    el.textContent = formatViews(n);
    setInterval(function () {
      n += Math.floor(Math.random() * 7) + 1;
      el.textContent = formatViews(n);
    }, 1800 + Math.floor(Math.random() * 1200));
  });

  function formatViews(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }

  // Autoplay muted loops in social strip
  document.querySelectorAll(".mini video").forEach(function (v) {
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  });

  // One sample at a time on grids with controls
  var samples = document.querySelectorAll(".sample video");
  samples.forEach(function (v) {
    v.addEventListener("play", function () {
      samples.forEach(function (o) { if (o !== v) o.pause(); });
    });
  });

  // Shared Apps Script sender
  window.havSend = function (f, subject, skipFiles, extra, done) {
    var btn = f.querySelector("button[type=submit]");
    var old = btn ? btn.textContent : "";
    if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
    var data = { subject: subject, fields: {}, files: [] };
    [].forEach.call(f.elements, function (el) {
      if (!el.name || el.type === "file" || el.type === "submit" || el.type === "button") return;
      if (el.name.charAt(0) === "_" || el.disabled) return;
      data.fields[el.name] = el.value;
    });
    for (var k in extra) data.fields[k] = extra[k];
    var jobs = [];
    if (!skipFiles) {
      [].forEach.call(f.querySelectorAll("input[type=file]"), function (i) {
        [].forEach.call(i.files, function (x) {
          jobs.push(new Promise(function (res, rej) {
            var r = new FileReader();
            r.onload = function () {
              data.files.push({
                field: i.name,
                name: i.name + " - " + x.name,
                mimeType: x.type || "application/octet-stream",
                base64: String(r.result).split(",")[1] || ""
              });
              res();
            };
            r.onerror = rej;
            r.readAsDataURL(x);
          }));
        });
      });
    }
    Promise.all(jobs).then(function () {
      return fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      });
    }).then(function () {
      done();
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = old; }
      alert("Sorry, your message could not be sent. Please check your connection and try again, or WhatsApp/email us.");
    });
  };

  // Order form behaviour (identical to v8)
  var f = document.getElementById("orderform");
  var LIMIT = 25 * 1024 * 1024;
  if (f) {
    var code = agent || "direct";
    if (location.search.indexOf("ordered=1") > -1) {
      f.hidden = true;
      var thankId = location.search.indexOf("bigfiles=1") > -1 ? "bigthanks" : "thanks";
      var thankEl = document.getElementById(thankId);
      if (thankEl) thankEl.hidden = false;
    }
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      if (f.elements["_honey"] && f.elements["_honey"].value) return;
      if (ac) ac.value = code;
      var tot = 0, names = [];
      [].forEach.call(f.querySelectorAll("input[type=file]"), function (i) {
        [].forEach.call(i.files, function (x) {
          tot += x.size;
          names.push(x.name + " (" + (x.size / 1048576).toFixed(1) + "MB, " + i.name + ")");
        });
      });
      var big = tot > LIMIT, extra = {}, subject = (subj && subj.value) || ("New Helpful AV order - agent " + code);
      if (big) {
        subject = "URGENT - CALL CLIENT - files too big to upload - agent " + code;
        extra["files-too-big"] = names.join("; ") + " - total " + (tot / 1048576).toFixed(1) + "MB";
      }
      window.havSend(f, subject, big, extra, function () {
        f.hidden = true;
        var m = document.getElementById(big ? "bigthanks" : "thanks");
        if (m) { m.hidden = false; m.scrollIntoView({ behavior: "smooth", block: "center" }); }
      });
    });
  }

  // Contact form → same Apps Script with product=Contact
  var cf = document.getElementById("contactform");
  if (cf) {
    cf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!cf.checkValidity()) { cf.reportValidity(); return; }
      if (cf.elements["_honey"] && cf.elements["_honey"].value) return;
      var cac = document.getElementById("contact_agent_code");
      if (cac) cac.value = agent || "direct";
      var csubj = "Helpful AV contact - agent " + (agent || "direct");
      window.havSend(cf, csubj, true, { product: "Contact" }, function () {
        cf.hidden = true;
        var m = document.getElementById("contactthanks");
        if (m) { m.hidden = false; m.scrollIntoView({ behavior: "smooth", block: "center" }); }
      });
    });
  }
})();
