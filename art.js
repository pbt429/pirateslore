/* Pirates Lore artwork. Everything here only paints pictures for sighted players.
   The game itself, its sounds and everything the screen reader hears live in the pages. */
(function () {
  "use strict";
  var A = {};
  var TAU = Math.PI * 2;

  // ---------- Helpers ----------
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    var a = typeof seed === "string" ? hashStr(seed) : (seed >>> 0) || 1;
    return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  A.rng = rng;
  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    return "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")";
  }
  A.shade = shade;
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function ellipse(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU); }

  // A flag that ripples in the wind. Drawn from the top of its staff, flying toward +x.
  function flagCloth(ctx, x, y, w, h, color, t, opts) {
    opts = opts || {};
    var n = 8, ph = t / 260;
    ctx.beginPath();
    for (var i = 0; i <= n; i++) { var u = i / n; ctx.lineTo(x + u * w, y + Math.sin(ph + u * 4) * u * h * 0.18); }
    for (var j = n; j >= 0; j--) { var v = j / n; ctx.lineTo(x + v * w, y + h + Math.sin(ph + v * 4) * v * h * 0.18); }
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    if (opts.skull) {
      ctx.fillStyle = "#f2efe6"; var cx = x + w * 0.45, cy = y + h * 0.42 + Math.sin(ph + 1.8) * h * 0.08;
      ellipse(ctx, cx, cy, h * 0.16, h * 0.15); ctx.fill();
      ctx.strokeStyle = "#f2efe6"; ctx.lineWidth = Math.max(1, h * 0.07);
      ctx.beginPath(); ctx.moveTo(cx - h * 0.28, cy + h * 0.1); ctx.lineTo(cx + h * 0.28, cy + h * 0.36); ctx.moveTo(cx + h * 0.28, cy + h * 0.1); ctx.lineTo(cx - h * 0.28, cy + h * 0.36); ctx.stroke();
    } else if (opts.cross) {
      ctx.strokeStyle = opts.cross; ctx.lineWidth = Math.max(1, h * 0.18);
      ctx.beginPath(); ctx.moveTo(x + w * 0.38, y + Math.sin(ph + 1.5) * h * 0.07); ctx.lineTo(x + w * 0.38, y + h + Math.sin(ph + 1.5) * h * 0.07); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2 + Math.sin(ph + 4) * h * 0.18); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1; ctx.stroke();
  }
  A.flagCloth = flagCloth;
  // Nation colors for flags and uniforms.
  var NATS = {
    English: { mark: "#d23b3b", flag: "#d23b3b", cross: "#ffffff", coat: "#b3302b", trim: "#f0e2c0" },
    French:  { mark: "#4f7fd6", flag: "#f3f0e6", cross: "#3a62b8", coat: "#3d5fa8", trim: "#f0e2c0" },
    Dutch:   { mark: "#e8833a", flag: "#e8833a", cross: "#ffffff", coat: "#2f4f7d", trim: "#e8833a" },
    Spanish: { mark: "#e8b22e", flag: "#f0ead8", cross: "#b3302b", coat: "#e2c55a", trim: "#b3302b" },
    Pirate:  { mark: "#1b1b1b", flag: "#1b1b1b", skull: true, coat: "#3a3a3a", trim: "#9a8a6a" }
  };
  A.NATS = NATS;
  function natFlag(ctx, x, y, w, h, nation, t) {
    var N = NATS[nation] || NATS.English;
    flagCloth(ctx, x, y, w, h, N.flag, t, N.skull ? { skull: true } : { cross: N.cross });
  }
  A.natFlag = natFlag;

  // ---------- Ships seen from above, for the sea chart and sea battles ----------
  // o: { flag, nation, sail, sails (0 furled, 1 half, 2 full), masts, t, dmg (0 to 5), brace (radians), speed (0 to 1), wreck }
  A.ship = function (ctx, X, Y, h, sc, o) {
    o = o || {};
    var t = o.t || 0, masts = o.masts || 1, sails = o.sails === undefined ? 2 : o.sails, dmg = o.dmg || 0;
    var L = masts === 1 ? 34 : masts === 2 ? 40 : 46, B = masts === 1 ? 9 : masts === 2 ? 10.5 : 12;
    ctx.save(); ctx.translate(X, Y); ctx.rotate(h * Math.PI / 180); ctx.scale(sc, sc);
    if (dmg >= 5) ctx.rotate(Math.sin(t / 700) * 0.05);
    var bow = -L / 2, stern = L / 2;
    // Shadow on the water
    ctx.fillStyle = "rgba(0,15,30,0.35)";
    ctx.beginPath(); ctx.moveTo(3, bow + 3); ctx.quadraticCurveTo(B + 4, bow + L * 0.35, B * 0.9 + 3, stern + 3); ctx.lineTo(-B * 0.9 + 3, stern + 3); ctx.quadraticCurveTo(-B + 2, bow + L * 0.35, 3, bow + 3); ctx.fill();
    // Bow wave and foam along the sides
    var sp = o.speed || 0;
    if (sp > 0.05) {
      ctx.strokeStyle = "rgba(255,255,255," + Math.min(0.85, 0.35 + sp * 0.5) + ")"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
      var wob = Math.sin(t / 160) * 1.2;
      ctx.beginPath(); ctx.moveTo(0, bow - 1); ctx.quadraticCurveTo(B * 0.9, bow + 6, B + 3 + sp * 6 + wob, bow + 16 + sp * 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, bow - 1); ctx.quadraticCurveTo(-B * 0.9, bow + 6, -B - 3 - sp * 6 - wob, bow + 16 + sp * 8); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255," + (0.25 + sp * 0.3) + ")";
      for (var f = 0; f < 5; f++) { var fy = stern + 2 + f * 3, fx = Math.sin(t / 120 + f) * 2; ellipse(ctx, fx, fy, 3 + f * 0.8, 1.6); ctx.fill(); }
    }
    // Bowsprit
    ctx.strokeStyle = "#3b2512"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, bow + 2); ctx.lineTo(0, bow - 9); ctx.stroke();
    // Hull
    var hullPath = new Path2D();
    hullPath.moveTo(0, bow); hullPath.quadraticCurveTo(B * 1.1, bow + L * 0.3, B * 0.85, stern); hullPath.lineTo(-B * 0.85, stern); hullPath.quadraticCurveTo(-B * 1.1, bow + L * 0.3, 0, bow); hullPath.closePath();
    ctx.fillStyle = o.wreck ? "#3a2a1c" : "#5a3a1e"; ctx.fill(hullPath);
    ctx.strokeStyle = "#1e1208"; ctx.lineWidth = 1.4; ctx.stroke(hullPath);
    // Deck, inset from the hull, with planks
    ctx.save(); ctx.clip(hullPath);
    ctx.fillStyle = dmg >= 3 ? "#8a6a44" : "#b48b58";
    ctx.beginPath(); ctx.moveTo(0, bow + 3); ctx.quadraticCurveTo(B * 0.85, bow + L * 0.3, B * 0.65, stern - 1.5); ctx.lineTo(-B * 0.65, stern - 1.5); ctx.quadraticCurveTo(-B * 0.85, bow + L * 0.3, 0, bow + 3); ctx.fill();
    ctx.strokeStyle = "rgba(60,35,15,0.35)"; ctx.lineWidth = 0.6;
    for (var px = -B; px <= B; px += 2.4) { ctx.beginPath(); ctx.moveTo(px, bow); ctx.lineTo(px, stern); ctx.stroke(); }
    // Quarterdeck at the stern
    ctx.fillStyle = "#9c7546"; ctx.fillRect(-B, stern - L * 0.22, B * 2, L * 0.22);
    ctx.strokeStyle = "#3b2512"; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-B, stern - L * 0.22); ctx.lineTo(B, stern - L * 0.22); ctx.stroke();
    // Gun ports along the rail
    ctx.fillStyle = "#1e1208";
    var guns = masts === 1 ? 3 : masts === 2 ? 4 : 6;
    for (var g = 0; g < guns; g++) { var gy = bow + L * 0.28 + g * (L * 0.5 / guns); ctx.fillRect(B * 0.62, gy, 1.6, 1.8); ctx.fillRect(-B * 0.62 - 1.6, gy, 1.6, 1.8); }
    // Hatch and boat
    ctx.fillStyle = "#6b4a28"; ctx.fillRect(-2.2, bow + L * 0.42, 4.4, 3.4);
    ctx.restore();
    // Masts and sails
    var mys = masts === 1 ? [-2] : masts === 2 ? [-7, 6] : [-12, -1.5, 9];
    var brace = o.brace || 0, sailCol = o.sail || "#f6efdc";
    // Jib from the bowsprit
    if (sails && dmg < 4) {
      ctx.fillStyle = sailCol; ctx.globalAlpha = 0.95;
      ctx.beginPath(); ctx.moveTo(0, bow - 8); ctx.lineTo(sails === 2 ? 3.5 : 2, mys[0] - 1); ctx.lineTo(0, mys[0] + 1); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = "rgba(80,60,30,0.6)"; ctx.lineWidth = 0.6; ctx.stroke();
    }
    mys.forEach(function (my, i) {
      var broken = dmg >= 2 && i === mys.length - 1 && masts > 1 || (dmg >= 2 && masts === 1 && i === 0 && dmg >= 4);
      ctx.save(); ctx.translate(0, my);
      if (broken) {
        // A broken mast lying across the deck with its torn sail
        ctx.rotate(0.9);
        ctx.strokeStyle = "#3b2512"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-B * 0.2, 0); ctx.lineTo(B * 1.6, 0); ctx.stroke();
        ctx.fillStyle = "rgba(220,210,185,0.85)"; ctx.beginPath(); ctx.moveTo(B * 0.2, -1); ctx.lineTo(B * 1.4, -3); ctx.lineTo(B * 1.3, 4); ctx.lineTo(B * 0.3, 3); ctx.closePath(); ctx.fill();
        ctx.restore(); return;
      }
      var span = B * 1.55 * (masts === 3 && i === 2 ? 0.85 : masts === 3 && i === 0 ? 0.92 : 1);
      ctx.rotate(brace);
      // Yard
      ctx.strokeStyle = "#2d1c0d"; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-span, 0); ctx.lineTo(span, 0); ctx.stroke();
      if (sails) {
        var belly = sails === 2 ? 14 : 7, depth = sails === 2 ? 6 : 3.5, flutter = Math.sin(t / 300 + i) * 0.4;
        var sg = ctx.createLinearGradient(0, -belly, 0, depth);
        sg.addColorStop(0, sailCol); sg.addColorStop(1, shade(sailCol.charAt(0) === "#" ? sailCol : "#f6efdc", -0.18));
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.moveTo(-span, 0); ctx.quadraticCurveTo(0, -belly - flutter, span, 0); ctx.lineTo(span * 0.92, depth * 0.5); ctx.quadraticCurveTo(0, depth - belly * 0.6, -span * 0.92, depth * 0.5); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(90,70,40,0.55)"; ctx.lineWidth = 0.6; ctx.stroke();
        // Seams
        ctx.beginPath(); ctx.moveTo(-span * 0.33, -belly * 0.55); ctx.lineTo(-span * 0.3, depth * 0.3); ctx.moveTo(span * 0.33, -belly * 0.55); ctx.lineTo(span * 0.3, depth * 0.3); ctx.stroke();
        if (dmg >= 1) { ctx.fillStyle = "rgba(40,30,20,0.75)"; for (var hh = 0; hh < Math.min(4, dmg + 1); hh++) { ellipse(ctx, (hh * 7 % 11) - 5, -belly * 0.3 + (hh % 2) * 2, 1.2, 0.9); ctx.fill(); } }
      } else {
        // Furled sail bundled on the yard
        ctx.strokeStyle = "#e7dcc0"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-span * 0.9, 0.6); ctx.lineTo(span * 0.9, 0.6); ctx.stroke();
      }
      // Mast top
      ctx.fillStyle = "#2d1c0d"; ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, TAU); ctx.fill();
      ctx.restore();
    });
    // Ensign at the stern, streaming aft
    if (o.flag || o.nation) {
      ctx.save(); ctx.translate(0, stern - 1);
      ctx.strokeStyle = "#2d1c0d"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 2); ctx.stroke();
      ctx.rotate(Math.PI / 2);
      if (o.nation && NATS[o.nation]) natFlag(ctx, 1, -3, 9, 6, o.nation, t);
      else flagCloth(ctx, 1, -3, 9, 6, o.flag, t);
      ctx.restore();
    }
    ctx.restore();
    // Smoke and fire on a badly damaged ship (drawn upright, not rotated)
    if (dmg >= 3) {
      var k = sc;
      for (var s = 0; s < 5; s++) {
        var age = ((t / 900 + s / 5) % 1);
        ctx.fillStyle = "rgba(60,55,50," + (0.45 * (1 - age)) + ")";
        ellipse(ctx, X + Math.sin(s * 2.1) * 4 * k + age * 14 * k, Y - age * 30 * k, (4 + age * 10) * k, (3 + age * 7) * k); ctx.fill();
      }
      if (dmg >= 4) { ctx.fillStyle = "rgba(255," + (120 + Math.round(Math.sin(t / 80) * 40)) + ",40,0.85)"; ellipse(ctx, X + 2 * k, Y + 3 * k, 3.5 * k, 4.5 * k); ctx.fill(); }
    }
  };
  A.mastsFor = function (kind) {
    kind = (kind || "").toLowerCase();
    if (/pinnace|sloop/.test(kind)) return 1;
    if (/barque|fluyt|merchant/.test(kind)) return 2;
    return 3;
  };

  // ---------- Coasts, jungle and hills on the sea chart ----------
  var LAND = null;
  A.buildLand = function (lands, landAt, map) {
    var paths = lands.map(function (L) {
      var p = new Path2D(); (L.pts || []).forEach(function (pt, i) { i ? p.lineTo(pt[0], pt[1]) : p.moveTo(pt[0], pt[1]); }); p.closePath(); return p;
    });
    var r = rng("caribbean"), buckets = {}, step = 0.11;
    function isLand(x, y) { var L = landAt(x, y); return !!(L && L.pts); }
    for (var x = map.x0; x <= map.x1; x += step) for (var y = map.y0; y <= map.y1; y += step) {
      var jx = x + (r() - 0.5) * step * 0.9, jy = y + (r() - 0.5) * step * 0.9, roll = r();
      if (!isLand(jx, jy)) continue;
      var d1 = 0.12, coast = !(isLand(jx + d1, jy) && isLand(jx - d1, jy) && isLand(jx, jy + d1) && isLand(jx, jy - d1));
      var f = null;
      if (coast) { if (roll < 0.45) f = { k: "palm", x: jx, y: jy, s: 0.8 + r() * 0.4 }; }
      else {
        var d2 = 0.42, deep = isLand(jx + d2, jy) && isLand(jx - d2, jy) && isLand(jx, jy + d2) && isLand(jx, jy - d2);
        var d3 = 0.9, deeper = deep && isLand(jx + d3, jy) && isLand(jx - d3, jy) && isLand(jx, jy + d3) && isLand(jx, jy - d3);
        if (deeper && roll < 0.22) f = { k: "mount", x: jx, y: jy, s: 1 + r() * 0.8 };
        else if (deep && roll < 0.14) f = { k: "hill", x: jx, y: jy, s: 0.9 + r() * 0.5 };
        else if (roll < 0.8) f = { k: "tree", x: jx, y: jy, s: 0.7 + r() * 0.6, c: r() };
      }
      if (f) { var key = Math.floor(jx) + "," + Math.floor(jy); (buckets[key] = buckets[key] || []).push(f); }
    }
    // Draw mountains behind trees: sort each bucket so far features come first.
    for (var k in buckets) buckets[k].sort(function (a, b) { return b.y - a.y; });
    LAND = { lands: lands, paths: paths, buckets: buckets };
  };
  // v: { s, cx, cy } as the page's view(). Draws shallows, beaches, land and jungle.
  A.drawLand = function (ctx, v, W, H, t, opt) {
    if (!LAND) return;
    opt = opt || {};
    var s = v.s;
    ctx.save();
    ctx.setTransform(s, 0, 0, -s, W / 2 - v.cx * s, H / 2 + v.cy * s);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    LAND.paths.forEach(function (p) {
      ctx.strokeStyle = "rgba(70,165,170,0.30)"; ctx.lineWidth = 26 / s; ctx.stroke(p);
      ctx.strokeStyle = "rgba(120,205,200,0.35)"; ctx.lineWidth = 13 / s; ctx.stroke(p);
      var pulse = opt.still ? 0.55 : 0.45 + Math.sin(t / 900) * 0.15;
      ctx.strokeStyle = "rgba(245,252,250," + pulse + ")"; ctx.lineWidth = 6 / s; ctx.stroke(p);
    });
    LAND.paths.forEach(function (p) {
      ctx.fillStyle = "#5e8c3e"; ctx.fill(p);
      ctx.strokeStyle = "#e6d29a"; ctx.lineWidth = 4.5 / s; ctx.stroke(p);
    });
    ctx.restore();
    if (s < 30) return; // zoomed out: no trees
    var k = s / 64;
    var xA = v.cx - (W / 2 + 40) / s, xB = v.cx + (W / 2 + 40) / s, yA = v.cy - (H / 2 + 40) / s, yB = v.cy + (H / 2 + 40) / s;
    var list = [];
    for (var bx = Math.floor(xA); bx <= Math.floor(xB); bx++) for (var by = Math.floor(yA); by <= Math.floor(yB); by++) { var b = LAND.buckets[bx + "," + by]; if (b) list.push.apply(list, b); }
    list.sort(function (a, b) { return b.y - a.y; });
    for (var i = 0; i < list.length; i++) {
      var f = list[i], X = (f.x - v.cx) * s + W / 2, Y = (v.cy - f.y) * s + H / 2;
      if (X < -30 || X > W + 30 || Y < -30 || Y > H + 30) continue;
      if (f.k === "tree") {
        var r = 4.2 * f.s * k;
        ctx.fillStyle = "rgba(20,45,15,0.35)"; ellipse(ctx, X + r * 0.4, Y + r * 0.5, r, r * 0.6); ctx.fill();
        ctx.fillStyle = f.c < 0.5 ? "#3f7030" : "#477a34"; ctx.beginPath(); ctx.arc(X, Y, r, 0, TAU); ctx.fill();
        ctx.fillStyle = "rgba(160,200,110,0.35)"; ctx.beginPath(); ctx.arc(X - r * 0.35, Y - r * 0.35, r * 0.45, 0, TAU); ctx.fill();
      } else if (f.k === "palm") {
        var pr = 4 * f.s * k;
        ctx.strokeStyle = "#7a5a32"; ctx.lineWidth = 1.2 * k; ctx.beginPath(); ctx.moveTo(X, Y + pr); ctx.quadraticCurveTo(X + pr * 0.4, Y, X + pr * 0.2, Y - pr * 0.5); ctx.stroke();
        ctx.strokeStyle = "#3f7a2a"; ctx.lineWidth = 1.6 * k;
        for (var a = 0; a < 5; a++) { var an = a / 5 * TAU + 0.3; ctx.beginPath(); ctx.moveTo(X + pr * 0.2, Y - pr * 0.5); ctx.quadraticCurveTo(X + pr * 0.2 + Math.cos(an) * pr * 0.8, Y - pr * 0.5 + Math.sin(an) * pr * 0.5 - pr * 0.3, X + pr * 0.2 + Math.cos(an) * pr * 1.3, Y - pr * 0.5 + Math.sin(an) * pr * 0.9); ctx.stroke(); }
      } else {
        var m = (f.k === "mount" ? 13 : 9) * f.s * k, hgt = m * (f.k === "mount" ? 0.95 : 0.6);
        ctx.fillStyle = f.k === "mount" ? "#7b6a4a" : "#5d7f39";
        ctx.beginPath(); ctx.moveTo(X - m, Y + m * 0.3); ctx.lineTo(X, Y - hgt); ctx.lineTo(X + m, Y + m * 0.3); ctx.closePath(); ctx.fill();
        ctx.fillStyle = f.k === "mount" ? "#5a4c34" : "#456a2a";
        ctx.beginPath(); ctx.moveTo(X, Y - hgt); ctx.lineTo(X + m, Y + m * 0.3); ctx.lineTo(X + m * 0.1, Y + m * 0.3); ctx.closePath(); ctx.fill();
        if (f.k === "mount" && f.s > 1.4) { ctx.fillStyle = "rgba(240,240,235,0.85)"; ctx.beginPath(); ctx.moveTo(X, Y - hgt); ctx.lineTo(X - m * 0.22, Y - hgt * 0.72); ctx.lineTo(X + m * 0.22, Y - hgt * 0.72); ctx.closePath(); ctx.fill(); }
      }
    }
  };

  // ---------- Towns on the sea chart ----------
  A.mapTown = function (ctx, X, Y, size, nation, t, name, small, onLand) {
    var N = NATS[nation] || NATS.English;
    if (small) {
      ctx.fillStyle = "#2a1d0e"; ctx.fillRect(X - 4, Y - 4, 8, 8); ctx.fillStyle = N.mark; ctx.fillRect(X - 3, Y - 3, 6, 6); return;
    }
    var r = rng(name || "town"), n = 3 + size * 2;
    // Houses clustered around the fort
    for (var i = 0; i < n; i++) {
      var a = r() * TAU, d = 6 + r() * (6 + size * 4), hx = X + Math.cos(a) * d, hy = Y + Math.sin(a) * d * 0.7 + 2;
      var w = 5 + r() * 3, h2 = 4 + r() * 2;
      if (onLand && !onLand(hx, hy)) continue;
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(hx - w / 2 + 1.5, hy - h2 / 2 + 1.5, w, h2);
      ctx.fillStyle = ["#efe6d2", "#f2dcc0", "#e9e2cf", "#f5ead8"][i % 4]; ctx.fillRect(hx - w / 2, hy - h2 / 2, w, h2);
      ctx.fillStyle = r() < 0.7 ? "#b5542f" : "#8c4a2c"; ctx.fillRect(hx - w / 2, hy - h2 / 2, w, h2 * 0.5);
    }
    // Church tower in bigger towns
    if (size >= 2) { ctx.fillStyle = "#e8e0cc"; ctx.fillRect(X - 13, Y - 10, 5, 9); ctx.fillStyle = "#8c4a2c"; ctx.beginPath(); ctx.moveTo(X - 14, Y - 10); ctx.lineTo(X - 10.5, Y - 15); ctx.lineTo(X - 7, Y - 10); ctx.fill(); }
    // The fort: a star of stone
    var fr = 5 + size * 1.5;
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath();
    for (var k = 0; k < 8; k++) { var aa = k / 8 * TAU, rad = k % 2 ? fr * 0.65 : fr; ctx.lineTo(X + 1.5 + Math.cos(aa) * rad, Y + 1.5 + Math.sin(aa) * rad); } ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#9a9284"; ctx.strokeStyle = "#4a443a"; ctx.lineWidth = 1; ctx.beginPath();
    for (k = 0; k < 8; k++) { var ab = k / 8 * TAU, rd = k % 2 ? fr * 0.65 : fr; ctx.lineTo(X + Math.cos(ab) * rd, Y + Math.sin(ab) * rd); } ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#7f786c"; ctx.fillRect(X - fr * 0.35, Y - fr * 0.35, fr * 0.7, fr * 0.7);
    // Flagpole and flag
    ctx.strokeStyle = "#2a1a0c"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X, Y - 16); ctx.stroke();
    natFlag(ctx, X, Y - 16, 11, 7, nation, t);
  };

  // ---------- Weather on the chart ----------
  A.cloud = function (ctx, X, Y, R, dark, t, seed) {
    var r = rng(seed || 1), puffs = 6;
    // Shadow on the sea
    ctx.fillStyle = dark ? "rgba(5,15,25,0.28)" : "rgba(5,20,35,0.12)";
    for (var i = 0; i < puffs; i++) { var a = i / puffs * TAU + r(), d = R * (0.3 + r() * 0.5); ctx.beginPath(); ctx.arc(X + Math.cos(a) * d + R * 0.35, Y + Math.sin(a) * d * 0.6 + R * 0.45, R * (0.45 + r() * 0.25), 0, TAU); ctx.fill(); }
    r = rng(seed || 1);
    for (var j = 0; j < puffs; j++) {
      var a2 = j / puffs * TAU + r(), d2 = R * (0.3 + r() * 0.5), pr = R * (0.45 + r() * 0.25);
      var cx = X + Math.cos(a2) * d2, cy = Y + Math.sin(a2) * d2 * 0.6;
      var g = ctx.createRadialGradient(cx - pr * 0.3, cy - pr * 0.4, pr * 0.1, cx, cy, pr);
      if (dark) { g.addColorStop(0, "rgba(120,128,140,0.85)"); g.addColorStop(1, "rgba(55,62,74,0.75)"); }
      else { g.addColorStop(0, "rgba(255,255,255,0.55)"); g.addColorStop(1, "rgba(220,230,240,0.25)"); }
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, pr, 0, TAU); ctx.fill();
    }
    if (dark) {
      // Rain falling from the squall
      ctx.strokeStyle = "rgba(170,190,210,0.35)"; ctx.lineWidth = 1;
      for (var k = 0; k < 18; k++) { var rx = X - R + ((k * 37 + t / 6) % (R * 2)), ry = Y + ((k * 53 + t / 3) % (R * 1.4)) - R * 0.2; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 10); ctx.stroke(); }
    }
  };
  // Rain over the whole picture, slanting with the wind. dx is -1 to 1 across the screen.
  A.rain = function (ctx, W, H, amount, dx, t) {
    if (amount <= 0) return;
    ctx.fillStyle = "rgba(20,30,45," + (0.35 * amount) + ")"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(200,215,230," + (0.45 * amount) + ")"; ctx.lineWidth = 1.2;
    var n = Math.round(160 * amount), slant = dx * 10;
    for (var i = 0; i < n; i++) {
      var x = ((i * 97.3 + t * 0.35 * (1 + (i % 3))) % (W + 40)) - 20, y = ((i * 61.7 + t * 0.9) % (H + 40)) - 20;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + slant, y + 16); ctx.stroke();
    }
  };
  A.lightning = function (ctx, W, H, f) { if (f > 0) { ctx.fillStyle = "rgba(230,235,255," + (0.6 * f) + ")"; ctx.fillRect(0, 0, W, H); } };

  // ---------- People ----------
  // A side-view figure standing on (x, y). s is the height in pixels of a grown man.
  // o: { coat, pants, skin, hat ("tricorn", "wig", "bandana", "helmet", "cap", "plume", "none"), face (1 right, -1 left),
  //      walk (phase, or null), dress, hair, beard, sit, mug (raise 0 to 1), musket, sword, arm (0 to 1 hammer swing), sack, eyepatch, apron }
  A.person = function (ctx, x, y, s, o) {
    o = o || {};
    var k = s / 100, face = o.face || 1, skin = o.skin || "#e0b48a", coat = o.coat || "#7a4a2a", pants = o.pants || "#3a2c22";
    ctx.save(); ctx.translate(x, y); ctx.scale(face * k, k);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ellipse(ctx, 0, 0, 22, 4); ctx.fill();
    var sw = o.walk === null || o.walk === undefined ? 0 : Math.sin(o.walk) * 0.5;
    var hipY = o.sit ? -38 : -46;
    // Legs
    if (o.dress) {
      ctx.fillStyle = o.dress; ctx.beginPath(); ctx.moveTo(-9, -60); ctx.lineTo(9, -60); ctx.lineTo(20, 0); ctx.lineTo(-20, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = shade(o.dress, -0.2); ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.lineTo(18, -6); ctx.lineTo(-18, -6); ctx.closePath(); ctx.fill();
    } else if (o.sit) {
      ctx.strokeStyle = pants; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(18, hipY); ctx.lineTo(18, 0); ctx.stroke();
      ctx.fillStyle = "#1a1210"; ctx.fillRect(14, -6, 12, 6);
    } else {
      ctx.strokeStyle = pants; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(Math.sin(sw) * 22 + 2, -3); ctx.moveTo(0, hipY); ctx.lineTo(-Math.sin(sw) * 22 - 2, -3); ctx.stroke();
      ctx.fillStyle = "#1a1210";
      ctx.fillRect(Math.sin(sw) * 22 - 2, -7, 12, 7); ctx.fillRect(-Math.sin(sw) * 22 - 6, -7, 12, 7);
    }
    // Body: coat with tails
    var top = o.sit ? -86 : -94;
    ctx.fillStyle = coat;
    ctx.beginPath(); ctx.moveTo(-11, top); ctx.lineTo(11, top); ctx.lineTo(14, hipY + (o.sit ? 6 : 14)); ctx.lineTo(-15, hipY + (o.sit ? 6 : 14)); ctx.closePath(); ctx.fill();
    if (o.apron) { ctx.fillStyle = o.apron; ctx.fillRect(1, top + 18, 13, hipY - top - 4); }
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(-12, hipY - 4, 25, 5);
    if (o.trim) { ctx.fillStyle = o.trim; ctx.fillRect(9, top + 2, 3, hipY - top + 10); }
    // Back arm
    // Head
    var hy = top - 12;
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(2, hy, 11, 0, TAU); ctx.fill();
    ctx.fillStyle = "#1b120c"; ctx.beginPath(); ctx.arc(7, hy - 2, 1.4, 0, TAU); ctx.fill();
    if (o.eyepatch) { ctx.fillStyle = "#111"; ctx.fillRect(4, hy - 5, 7, 5); ctx.strokeStyle = "#111"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-8, hy - 7); ctx.lineTo(12, hy - 3); ctx.stroke(); }
    if (o.beard) { ctx.fillStyle = o.beard; ctx.beginPath(); ctx.moveTo(-4, hy + 2); ctx.quadraticCurveTo(6, hy + 18, 13, hy + 2); ctx.closePath(); ctx.fill(); }
    if (o.hair) { ctx.fillStyle = o.hair; ctx.beginPath(); ctx.arc(-1, hy - 2, 11, Math.PI * 0.55, Math.PI * 1.75); ctx.fill(); if (o.dress) { ctx.beginPath(); ctx.ellipse(-8, hy + 8, 6, 14, 0.2, 0, TAU); ctx.fill(); } }
    var hat = o.hat || "none";
    if (hat === "tricorn" || hat === "plume") {
      ctx.fillStyle = "#16100c"; ctx.beginPath(); ctx.moveTo(-16, hy - 7); ctx.quadraticCurveTo(2, hy - 30, 20, hy - 7); ctx.quadraticCurveTo(2, hy - 13, -16, hy - 7); ctx.fill();
      ctx.strokeStyle = "#c9a24a"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-15, hy - 8); ctx.quadraticCurveTo(2, hy - 14, 19, hy - 8); ctx.stroke();
      if (hat === "plume") { ctx.fillStyle = o.plume || "#f2efe6"; ctx.beginPath(); ctx.ellipse(-6, hy - 22, 12, 4, -0.5, 0, TAU); ctx.fill(); }
    } else if (hat === "wig") {
      ctx.fillStyle = "#ece8dc"; ctx.beginPath(); ctx.arc(1, hy - 3, 13, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-9, hy + 6, 6, 12, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(12, hy + 6, 5, 11, 0, 0, TAU); ctx.fill();
    } else if (hat === "bandana") {
      ctx.fillStyle = o.bandana || "#b3302b"; ctx.beginPath(); ctx.arc(2, hy - 2, 11.5, Math.PI * 1.05, Math.PI * 1.98); ctx.fill(); ctx.fillRect(-13, hy - 6, 6, 10);
    } else if (hat === "helmet") {
      ctx.fillStyle = "#9aa0a6"; ctx.beginPath(); ctx.arc(2, hy - 3, 12, Math.PI, 0); ctx.fill(); ctx.fillRect(-14, hy - 4, 32, 3); ctx.beginPath(); ctx.moveTo(2, hy - 15); ctx.lineTo(2, hy - 22); ctx.lineWidth = 2; ctx.strokeStyle = "#9aa0a6"; ctx.stroke();
    } else if (hat === "cap") {
      ctx.fillStyle = o.capColor || "#5a4632"; ctx.beginPath(); ctx.arc(2, hy - 3, 11.5, Math.PI, 0); ctx.fill();
    } else if (hat === "bonnet") {
      ctx.fillStyle = "#f2ede0"; ctx.beginPath(); ctx.arc(1, hy - 2, 13, Math.PI * 0.9, Math.PI * 2.05); ctx.fill();
    }
    // Front arm
    var sx = 4, sy = top + 6, ax, ay;
    if (o.mug !== undefined) { var m = o.mug; ax = 16 - m * 2; ay = sy + 22 - m * 34; }
    else if (o.arm !== undefined) { var am = o.arm; ax = 14 + Math.cos(am * 2.2 - 1.2) * 18; ay = sy + 4 - Math.sin(am * 2.2 - 0.4) * 22; }
    else if (o.musket) { ax = 14; ay = sy + 16; }
    else if (o.point) { ax = 30; ay = sy + 2; }
    else { ax = 6 - sw * 14; ay = sy + 30; }
    ctx.strokeStyle = coat; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ax, ay); ctx.stroke();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(ax, ay, 4, 0, TAU); ctx.fill();
    if (o.mug !== undefined) { ctx.fillStyle = "#8a6a3a"; ctx.fillRect(ax - 2, ay - 12, 9, 12); ctx.fillStyle = "#f3e7c4"; ctx.fillRect(ax - 2, ay - 13, 9, 3); }
    if (o.arm !== undefined) { ctx.save(); ctx.translate(ax, ay); ctx.rotate(-o.arm * 1.6 + 0.4); ctx.fillStyle = "#5a3a1e"; ctx.fillRect(-1.5, -14, 3, 16); ctx.fillStyle = "#6e6e72"; ctx.fillRect(-5, -18, 10, 6); ctx.restore(); }
    if (o.musket) { ctx.strokeStyle = "#4a3018"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(ax - 4, ay + 14); ctx.lineTo(ax + (o.aim ? 46 : 4), ay - (o.aim ? 4 : 56)); ctx.stroke(); ctx.strokeStyle = "#7c7c80"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax + (o.aim ? 30 : 2), ay - (o.aim ? 3 : 40)); ctx.lineTo(ax + (o.aim ? 50 : 4), ay - (o.aim ? 4 : 62)); ctx.stroke(); }
    if (o.sword) { ctx.strokeStyle = "#d9dde2"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 30, ay - 22); ctx.stroke(); }
    if (o.sack) { ctx.fillStyle = "#cdb88a"; ellipse(ctx, 0, top - 4, 16, 10); ctx.fill(); ctx.strokeStyle = "#8a7550"; ctx.lineWidth = 1.5; ctx.stroke(); }
    ctx.restore();
  };

  // A small band of men marching across the chart. dir is the screen direction of travel in radians.
  A.party = function (ctx, X, Y, n, dir, t, flagColor, skull) {
    var face = Math.cos(dir) >= 0 ? 1 : -1, r = rng(7), count = Math.max(3, Math.min(14, n));
    var spots = [];
    for (var i = 0; i < count; i++) {
      var row = Math.floor(i / 4), col = i % 4;
      spots.push({ x: -Math.cos(dir) * row * 9 + (col - 1.5) * 5.5 * Math.sin(dir) + (r() - 0.5) * 3, y: -Math.sin(dir) * row * 9 + (col - 1.5) * 4 + (r() - 0.5) * 2, ph: r() * TAU });
    }
    spots.sort(function (a, b) { return a.y - b.y; });
    // Dust
    ctx.fillStyle = "rgba(200,180,130,0.25)";
    for (var d = 0; d < 4; d++) { ellipse(ctx, X - Math.cos(dir) * (28 + d * 10), Y - Math.sin(dir) * (28 + d * 10) + 8, 10 + d * 3, 5 + d); ctx.fill(); }
    spots.forEach(function (p, i) {
      var coat = ["#7a3b2a", "#3f5a74", "#6b5a3a", "#5a6a3a", "#7d6040"][i % 5];
      A.person(ctx, X + p.x * 1.8, Y + p.y * 1.8 + 10, 26, { coat: coat, hat: i % 3 === 0 ? "bandana" : i % 3 === 1 ? "tricorn" : "cap", face: face, walk: t / 110 + p.ph, musket: i % 2 === 0 });
    });
    // Standard bearer
    var fx = X + Math.cos(dir) * 14, fy = Y + Math.sin(dir) * 14 - 10;
    ctx.strokeStyle = "#3b2512"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(fx, fy + 16); ctx.lineTo(fx, fy - 18); ctx.stroke();
    ctx.save(); if (face < 0) { ctx.translate(fx, 0); ctx.scale(-1, 1); ctx.translate(-fx, 0); }
    flagCloth(ctx, fx, fy - 18, 16, 10, flagColor || "#1b1b1b", t, skull ? { skull: true } : null);
    ctx.restore();
  };

  window.ART = A;
})();
