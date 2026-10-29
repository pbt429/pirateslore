/* Pirates Lore artwork, part two: pictures of towns, the land battle and a ship seen from the side.
   Pictures only. Nothing here is read by the screen reader. */
(function () {
  "use strict";
  var A = window.ART, TAU = Math.PI * 2, shade = A.shade, rng = A.rng;
  function ell(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU); }
  function rect(ctx, c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }

  // ---------- Sky, sea and light by the hour ----------
  function skyColors(hour) {
    if (hour < 5 || hour >= 20.5) return { top: "#0b1630", bot: "#24395c", sun: null, night: 1 };
    if (hour < 7) return { top: "#3a4d7a", bot: "#f2b27a", sun: "#ffd9a0", night: 0.3, low: true };
    if (hour >= 18) return { top: "#3c4a7c", bot: "#f39a62", sun: "#ffb067", night: 0.25, low: true };
    return { top: "#5aa7d8", bot: "#cfe8f2", sun: "#fff2c4", night: 0 };
  }
  function sky(ctx, W, H, hour, horizon, t) {
    var c = skyColors(hour);
    var g = ctx.createLinearGradient(0, 0, 0, horizon); g.addColorStop(0, c.top); g.addColorStop(1, c.bot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, horizon);
    if (c.night) {
      var r = rng(3); ctx.fillStyle = "rgba(255,255,240,0.8)";
      for (var i = 0; i < 70; i++) { var tw = 0.5 + 0.5 * Math.sin(t / 700 + i); ctx.globalAlpha = 0.4 + tw * 0.6; ctx.fillRect(r() * W, r() * horizon * 0.85, 1.5, 1.5); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#f4e7b8"; ctx.beginPath(); ctx.arc(W * 0.82, horizon * 0.25, 22, 0, TAU); ctx.fill();
      ctx.fillStyle = c.top; ctx.beginPath(); ctx.arc(W * 0.82 + 9, horizon * 0.25 - 4, 19, 0, TAU); ctx.fill();
    } else if (c.sun) {
      var sy = c.low ? horizon - 30 : horizon * 0.22, sx = hour < 12 ? W * 0.2 : W * 0.78;
      var sg = ctx.createRadialGradient(sx, sy, 5, sx, sy, 90); sg.addColorStop(0, "rgba(255,240,200,0.9)"); sg.addColorStop(1, "rgba(255,240,200,0)");
      ctx.fillStyle = sg; ctx.fillRect(sx - 90, sy - 90, 180, 180);
      ctx.fillStyle = c.sun; ctx.beginPath(); ctx.arc(sx, sy, 24, 0, TAU); ctx.fill();
    }
    // Drifting clouds
    if (!c.night) {
      ctx.fillStyle = c.low ? "rgba(255,210,180,0.6)" : "rgba(255,255,255,0.75)";
      for (var k = 0; k < 4; k++) {
        var cx = ((k * 260 + t / 90) % (W + 300)) - 150, cy = 40 + (k % 2) * 40;
        ell(ctx, cx, cy, 50, 14); ctx.fill(); ell(ctx, cx + 30, cy - 10, 30, 14); ctx.fill(); ell(ctx, cx - 28, cy - 4, 26, 11); ctx.fill();
      }
    }
    return c;
  }
  function sea(ctx, W, y0, y1, c, t) {
    var g = ctx.createLinearGradient(0, y0, 0, y1);
    if (c.night) { g.addColorStop(0, "#1b2f4a"); g.addColorStop(1, "#0d1a2c"); } else if (c.low) { g.addColorStop(0, "#c98a6a"); g.addColorStop(0.3, "#3d6f8f"); g.addColorStop(1, "#1d4a68"); } else { g.addColorStop(0, "#5fa7c8"); g.addColorStop(1, "#1f6e93"); }
    ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0);
    ctx.strokeStyle = c.night ? "rgba(200,220,240,0.18)" : "rgba(255,255,255,0.35)"; ctx.lineWidth = 1.5;
    for (var r = 0; r < 7; r++) {
      var yy = y0 + 8 + r * (y1 - y0) / 7;
      for (var x = -40 + ((t / 40 + r * 37) % 80); x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 10, yy - 3 - r * 0.4, x + 20 + r * 2, yy); ctx.stroke(); }
    }
  }
  function title(ctx, W, text) {
    ctx.font = "26px 'IM Fell English SC', Georgia, serif";
    var w = ctx.measureText(text).width + 30;
    ctx.fillStyle = "rgba(15,12,8,0.72)"; ctx.fillRect(18, 16, w, 42);
    ctx.strokeStyle = "rgba(230,190,110,0.7)"; ctx.lineWidth = 1.5; ctx.strokeRect(22, 20, w - 8, 34);
    ctx.fillStyle = "#f3e3c0"; ctx.textAlign = "left"; ctx.fillText(text, 33, 46);
  }
  A.sceneTitle = title;

  // ---------- Buildings ----------
  function house(ctx, x, y, w, h, wall, roof, lit, r) {
    rect(ctx, wall, x, y - h, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(x + w * 0.75, y - h, w * 0.25, h);
    ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x - 5, y - h); ctx.lineTo(x + w / 2, y - h - h * 0.55); ctx.lineTo(x + w + 5, y - h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(roof.charAt(0) === "#" ? roof : "#a0502c", -0.25); ctx.beginPath(); ctx.moveTo(x + w / 2, y - h - h * 0.55); ctx.lineTo(x + w + 5, y - h); ctx.lineTo(x + w / 2, y - h); ctx.closePath(); ctx.fill();
    var cols = Math.max(1, Math.floor(w / 18)), rows = Math.max(1, Math.floor(h / 22));
    for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) {
      var wx = x + (i + 0.5) * w / cols - 4, wy = y - h + 8 + j * 20;
      if (j === rows - 1 && i === Math.floor(cols / 2) && h > 30) { rect(ctx, "#5a3a1e", wx - 1, y - 18, 10, 18); continue; }
      rect(ctx, lit && (r ? r() : Math.random()) < 0.7 ? "#ffd27a" : "#3a4a5a", wx, wy, 8, 10);
      rect(ctx, "rgba(0,0,0,0.3)", wx, wy + 10, 8, 2);
    }
  }
  function palm(ctx, x, y, h, t, lean) {
    lean = lean || 0.25;
    ctx.strokeStyle = "#7a5a32"; ctx.lineWidth = 7; ctx.lineCap = "round";
    var tx = x + h * lean, ty = y - h;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + h * lean * 0.2, y - h * 0.6, tx, ty); ctx.stroke();
    ctx.strokeStyle = "rgba(60,40,20,0.4)"; ctx.lineWidth = 7; ctx.setLineDash([2, 8]); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = "#2f6d2a"; ctx.lineWidth = 5;
    for (var i = 0; i < 7; i++) {
      var a = i / 7 * TAU + Math.sin(t / 900 + i) * 0.05, len = h * 0.45;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * len * 0.6, ty + Math.sin(a) * len * 0.3 - len * 0.25, tx + Math.cos(a) * len, ty + Math.abs(Math.sin(a)) * len * 0.4 + len * 0.15); ctx.stroke();
    }
    ctx.fillStyle = "#5a3d1e"; ctx.beginPath(); ctx.arc(tx - 3, ty + 5, 4, 0, TAU); ctx.arc(tx + 4, ty + 6, 4, 0, TAU); ctx.fill();
  }
  A.palm = palm;
  function lantern(ctx, x, y, t, big) {
    var f = 0.85 + Math.sin(t / 90) * 0.08 + Math.sin(t / 37) * 0.05, R = (big ? 170 : 110) * f;
    var g = ctx.createRadialGradient(x, y, 2, x, y, R); g.addColorStop(0, "rgba(255,190,90,0.45)"); g.addColorStop(1, "rgba(255,190,90,0)");
    ctx.fillStyle = g; ctx.fillRect(x - R, y - R, R * 2, R * 2);
    rect(ctx, "#2a1a0c", x - 1, y - 22, 2, 12); rect(ctx, "#3a2717", x - 7, y - 11, 14, 3); rect(ctx, "#ffcf7a", x - 5, y - 8, 10, 13); rect(ctx, "#3a2717", x - 7, y + 5, 14, 3);
  }
  function candle(ctx, x, y, t) {
    rect(ctx, "#efe6cc", x - 3, y - 16, 6, 16);
    var fl = Math.sin(t / 70) * 1.5; ctx.fillStyle = "#ffcf5a"; ell(ctx, x + fl * 0.3, y - 21, 3, 6 + fl * 0.4); ctx.fill();
    var g = ctx.createRadialGradient(x, y - 20, 1, x, y - 20, 60); g.addColorStop(0, "rgba(255,200,100,0.35)"); g.addColorStop(1, "rgba(255,200,100,0)"); ctx.fillStyle = g; ctx.fillRect(x - 60, y - 80, 120, 120);
  }
  function barrel(ctx, x, y, w, h, label) {
    ctx.fillStyle = "#7a4e26"; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - w * 0.12, y - h / 2, x, y - h); ctx.lineTo(x + w, y - h); ctx.quadraticCurveTo(x + w * 1.12, y - h / 2, x + w, y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#3a3a3a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 2, y - h * 0.25); ctx.lineTo(x + w + 2, y - h * 0.25); ctx.moveTo(x - 2, y - h * 0.75); ctx.lineTo(x + w + 2, y - h * 0.75); ctx.stroke();
    ctx.strokeStyle = "rgba(40,20,5,0.35)"; ctx.lineWidth = 1; for (var i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + w * i / 4, y); ctx.lineTo(x + w * i / 4, y - h); ctx.stroke(); }
    if (label) { ctx.fillStyle = "#f3e3c0"; ctx.font = "bold 11px 'Atkinson Hyperlegible', sans-serif"; ctx.textAlign = "center"; ctx.fillText(label, x + w / 2, y - h / 2 + 4); }
  }
  function crate(ctx, x, y, w, h, label) {
    rect(ctx, "#b58a52", x, y - h, w, h);
    ctx.strokeStyle = "#7a5a32"; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y - h + 1.5, w - 3, h - 3);
    ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + w, y); ctx.stroke();
    if (label) { ctx.fillStyle = "#3a2410"; ctx.font = "bold 12px 'Atkinson Hyperlegible', sans-serif"; ctx.textAlign = "center"; ctx.fillText(label, x + w / 2, y - h / 2 + 4); }
  }
  function sack(ctx, x, y, s, c) { ctx.fillStyle = c || "#d8c79c"; ctx.beginPath(); ctx.moveTo(x - s, y); ctx.quadraticCurveTo(x - s * 1.1, y - s * 1.4, x - s * 0.3, y - s * 1.7); ctx.lineTo(x + s * 0.3, y - s * 1.7); ctx.quadraticCurveTo(x + s * 1.1, y - s * 1.4, x + s, y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "rgba(90,70,40,0.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - s * 0.35, y - s * 1.55); ctx.lineTo(x + s * 0.35, y - s * 1.55); ctx.stroke(); }
  function coins(ctx, x, y, n, t) {
    for (var i = 0; i < n; i++) { var cx = x + (i % 5) * 9 - 18, cy = y - Math.floor(i / 5) * 4; ctx.fillStyle = "#d9a520"; ell(ctx, cx, cy, 6, 2.5); ctx.fill(); ctx.fillStyle = "#f6d361"; ell(ctx, cx, cy - 1, 5, 2); ctx.fill(); }
    var gl = (Math.sin(t / 300) + 1) / 2; ctx.fillStyle = "rgba(255,255,220," + gl + ")"; ctx.beginPath(); ctx.arc(x + 4, y - 6, 2, 0, TAU); ctx.fill();
  }
  function chandelier(ctx, x, y, t) {
    ctx.strokeStyle = "#5a4a2a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y); ctx.stroke();
    ctx.strokeStyle = "#b8923a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y + 8, 50, 10, 0, 0, Math.PI); ctx.stroke();
    for (var i = -2; i <= 2; i++) candle(ctx, x + i * 22, y + 8 + Math.abs(i) * -1, t + i * 50);
  }
  function windowView(ctx, x, y, w, h, hour, t, bars) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    var c = sky(ctx, x + w, y + h * 0.65, hour, y + h * 0.65, t);
    ctx.save(); ctx.translate(0, 0); ctx.restore();
    sea(ctx, x + w, y + h * 0.65, y + h, c, t);
    ctx.restore();
    ctx.strokeStyle = "#3a2410"; ctx.lineWidth = 6; ctx.strokeRect(x, y, w, h);
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
    if (bars) { ctx.strokeStyle = "#2a2a2a"; ctx.lineWidth = 4; for (var i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x + i * w / 5, y); ctx.lineTo(x + i * w / 5, y + h); ctx.stroke(); } }
  }

  // ---------- A ship seen from the side ----------
  A.sideShip = function (ctx, x, y, s, o) {
    o = o || {}; var t = o.t || 0, masts = o.masts || 2, face = o.face || 1;
    ctx.save(); ctx.translate(x, y + Math.sin(t / 700) * 2 * s); ctx.rotate(Math.sin(t / 900) * 0.015); ctx.scale(face * s, s);
    // Masts, yards and sails
    var mx = masts === 1 ? [0] : masts === 2 ? [-28, 26] : [-50, 2, 46], mh = [110, 125, 100];
    mx.forEach(function (m, i) {
      var hgt = masts === 1 ? 120 : mh[i] || 110;
      rect(ctx, "#3a2717", m - 2.5, -hgt, 5, hgt);
      for (var k = 0; k < (masts === 1 ? 2 : 3); k++) {
        var yy = -hgt + 14 + k * 32, half = 30 - k * 3 + (k === 2 ? 6 : 0);
        rect(ctx, "#3a2717", m - half, yy, half * 2, 3);
        if (o.sails) {
          ctx.fillStyle = "#f3ead2"; ctx.beginPath(); ctx.moveTo(m - half + 2, yy + 3); ctx.lineTo(m + half - 2, yy + 3); ctx.quadraticCurveTo(m + half + 6, yy + 18, m + half - 4, yy + 30); ctx.lineTo(m - half + 4, yy + 30); ctx.quadraticCurveTo(m - half + 2, yy + 18, m - half + 2, yy + 3); ctx.fill();
          ctx.strokeStyle = "rgba(120,100,70,0.4)"; ctx.lineWidth = 1; ctx.stroke();
        } else { ctx.strokeStyle = "#e7dcc0"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(m - half + 4, yy + 5); ctx.lineTo(m + half - 4, yy + 5); ctx.stroke(); }
      }
      if (i === mx.length - 1 || masts === 1) {
        // Ensign at the masthead
        ctx.save(); ctx.translate(m, -hgt - 2);
        if (o.nation) A.natFlag(ctx, 0, -12, 22, 13, o.nation, t); ctx.restore();
        rect(ctx, "#3a2717", m - 1, -hgt - 14, 2, 14);
      }
    });
    // Rigging
    ctx.strokeStyle = "rgba(40,25,10,0.55)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-95, -6); ctx.lineTo(mx[0], -(masts === 1 ? 120 : mh[0])); ctx.moveTo(mx[mx.length - 1], -(masts === 1 ? 120 : mh[mx.length - 1] || 110)); ctx.lineTo(85, -18); ctx.stroke();
    // Bowsprit
    ctx.strokeStyle = "#3a2717"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-70, -10); ctx.lineTo(-115, -28); ctx.stroke();
    // Hull
    ctx.fillStyle = "#4a2e17";
    ctx.beginPath(); ctx.moveTo(-90, -14); ctx.quadraticCurveTo(-82, 18, -50, 22); ctx.lineTo(60, 22); ctx.quadraticCurveTo(82, 18, 88, -30); ctx.lineTo(60, -30); ctx.lineTo(56, -14); ctx.closePath(); ctx.fill();
    rect(ctx, "#b8923a", -86, -12, 170, 3);
    rect(ctx, "#2c1a0b", -80, 6, 150, 3);
    ctx.fillStyle = "#1a0f06"; for (var g = -60; g < 50; g += 22) ctx.fillRect(g, -6, 9, 7);
    // Stern windows
    rect(ctx, "#ffd27a", 66, -24, 6, 6); rect(ctx, "#ffd27a", 76, -24, 6, 6);
    // Waterline
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ell(ctx, 0, 22, 95, 4); ctx.fill();
    ctx.restore();
  };

  // ---------- The town and harbor ----------
  function townSkyline(ctx, W, base, info, t, lit) {
    var r = rng(info.town + "skyline"), size = info.size || 2;
    // Hills behind
    ctx.fillStyle = "#4f7a3a"; ctx.beginPath(); ctx.moveTo(0, base - 40);
    for (var x = 0; x <= W; x += 40) ctx.lineTo(x, base - 70 - Math.sin(x / 130 + r() * 0.3) * 30 - r() * 15);
    ctx.lineTo(W, base); ctx.lineTo(0, base); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#3f6a2e"; ctx.beginPath(); ctx.moveTo(0, base - 20);
    for (x = 0; x <= W; x += 50) ctx.lineTo(x, base - 40 - Math.sin(x / 90 + 2) * 16);
    ctx.lineTo(W, base); ctx.lineTo(0, base); ctx.closePath(); ctx.fill();
    // Church or chapel with a bell tower
    var cx = W * 0.36 + r() * 60;
    rect(ctx, "#ece2c8", cx, base - 130, 34, 130); ctx.fillStyle = "#9b4a2c"; ctx.beginPath(); ctx.moveTo(cx - 4, base - 130); ctx.lineTo(cx + 17, base - 165); ctx.lineTo(cx + 38, base - 130); ctx.fill();
    rect(ctx, "#3a2a1a", cx + 11, base - 115, 12, 16);
    ctx.strokeStyle = "#5a4a2a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + 17, base - 165); ctx.lineTo(cx + 17, base - 182); ctx.moveTo(cx + 10, base - 175); ctx.lineTo(cx + 24, base - 175); ctx.stroke();
    rect(ctx, "#e6dcc2", cx + 34, base - 70, 70, 70); ctx.fillStyle = "#a0502c"; ctx.beginPath(); ctx.moveTo(cx + 30, base - 70); ctx.lineTo(cx + 69, base - 96); ctx.lineTo(cx + 108, base - 70); ctx.fill();
    // Houses, more for bigger towns
    var walls = ["#f1e4c8", "#e9d3b0", "#f4d9c2", "#d9e2d0", "#efe0b8", "#f0c9a8"];
    var n = 7 + size * 4;
    for (var i = 0; i < n; i++) {
      var hx = (i / n) * W * 0.95 + r() * 20, hw = 40 + r() * 34, hh = 34 + r() * 40;
      if (Math.abs(hx - cx) < 60 && hh > 50) hh = 40;
      house(ctx, hx, base, hw, hh, walls[i % walls.length], r() < 0.75 ? "#b5542f" : "#8c4a2c", lit, r);
    }
  }
  function fort(ctx, x, base, info, t, guns) {
    // Stone walls with battlements on a headland
    ctx.fillStyle = "#8a8070"; ctx.beginPath(); ctx.moveTo(x - 30, base); ctx.lineTo(x - 10, base - 70); ctx.lineTo(x + 210, base - 70); ctx.lineTo(x + 230, base); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#9c9282"; ctx.fillRect(x, base - 120, 200, 55);
    for (var i = 0; i < 10; i++) rect(ctx, "#9c9282", x + i * 21, base - 132, 12, 12);
    ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(x + 150, base - 120, 50, 55);
    ctx.strokeStyle = "rgba(60,55,45,0.35)"; ctx.lineWidth = 1;
    for (var y = base - 115; y < base - 65; y += 10) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 200, y); ctx.stroke(); }
    // Corner tower
    rect(ctx, "#a59b8a", x - 6, base - 160, 44, 95); for (i = 0; i < 4; i++) rect(ctx, "#a59b8a", x - 6 + i * 12, base - 170, 8, 10);
    // Cannon in the embrasures
    if (guns !== false) for (i = 0; i < 4; i++) { rect(ctx, "#2a2a2a", x + 50 + i * 38, base - 100, 22, 6); }
    // Flag
    rect(ctx, "#3a2717", x + 14, base - 230, 3, 62);
    A.natFlag(ctx, x + 17, base - 228, 46, 28, info.nation, t);
  }
  function walker(ctx, x, y, s, t, i, opts) {
    var span = opts.span || 600, speed = opts.speed || 0.03, dir = i % 2 ? 1 : -1;
    var px = opts.x0 + ((t * speed * (0.7 + (i % 3) * 0.2) + i * 173) % span); if (dir < 0) px = opts.x0 + span - (px - opts.x0);
    var looks = [
      { coat: "#7a3b2a", hat: "tricorn" }, { dress: "#7d5ea8", hair: "#4a2c1a", hat: "bonnet" }, { coat: "#3f5a74", hat: "cap", sack: true },
      { coat: "#6b5a3a", hat: "bandana", bandana: "#2f6db3" }, { dress: "#b8563a", hair: "#2a1a10" }, { coat: "#556b3a", hat: "tricorn" }
    ];
    var o = Object.assign({}, looks[i % looks.length], { face: dir, walk: t / 120 + i });
    A.person(ctx, px, y, s, o);
  }

  var SCENES = {};
  SCENES.harbor = function (ctx, W, H, info, t) {
    var horizon = H * 0.42;
    var c = sky(ctx, W, H, info.hour, horizon, t);
    townSkyline(ctx, W, horizon + 40, info, t, c.night > 0.2);
    fort(ctx, W * 0.72, horizon + 44, info, t);
    // Harbor water
    sea(ctx, W, horizon + 40, H, c, t);
    // Your ship at anchor
    A.sideShip(ctx, W * 0.6, H * 0.74, 1.15, { masts: info.masts || 1, sails: false, nation: info.myNation, t: t });
    // Rowboat heading for the quay
    var bx = W * 0.48 - ((t / 60) % 120);
    ctx.fillStyle = "#6b4a2b"; ctx.beginPath(); ctx.moveTo(bx - 26, H * 0.83); ctx.lineTo(bx + 26, H * 0.83); ctx.lineTo(bx + 18, H * 0.85 + 6); ctx.lineTo(bx - 20, H * 0.85 + 6); ctx.closePath(); ctx.fill();
    A.person(ctx, bx - 6, H * 0.84, 26, { coat: "#7a3b2a", hat: "bandana", face: -1, sit: true });
    A.person(ctx, bx + 10, H * 0.84, 26, { coat: "#3f5a74", hat: "tricorn", face: -1, sit: true });
    // Quay along the left, with barrels and people
    var qy = H * 0.68;
    ctx.fillStyle = "#8a7354"; ctx.fillRect(0, qy, W * 0.38, H - qy);
    ctx.fillStyle = "#6e5a40"; ctx.fillRect(0, qy, W * 0.38, 8);
    ctx.strokeStyle = "rgba(60,45,25,0.5)"; ctx.lineWidth = 1; for (var px = 0; px < W * 0.38; px += 26) { ctx.beginPath(); ctx.moveTo(px, qy + 8); ctx.lineTo(px, H); ctx.stroke(); }
    for (var p = 0; p < 5; p++) rect(ctx, "#5a3f24", 20 + p * 70, qy - 2, 8, H - qy + 4);
    barrel(ctx, 30, qy + 2, 28, 34); barrel(ctx, 62, qy + 2, 28, 34, "RUM"); crate(ctx, 260, qy + 2, 40, 36, "SUGAR");
    for (var i = 0; i < 4; i++) walker(ctx, 0, qy + 60 + (i % 2) * 40, 72 + (i % 2) * 14, t, i, { x0: 30, span: W * 0.3, speed: 0.025 });
    palm(ctx, W * 0.93, H * 0.72, 150, t, -0.25);
    palm(ctx, W * 0.03 + 10, qy + 10, 120, t, 0.2);
    // Gulls
    ctx.strokeStyle = c.night ? "rgba(220,220,220,0.5)" : "#2a2a2a"; ctx.lineWidth = 2;
    for (var gk = 0; gk < 3; gk++) { var gx = (t / (18 + gk * 5) + gk * 300) % (W + 100) - 50, gy = 70 + gk * 25 + Math.sin(t / 500 + gk) * 10, fl = Math.sin(t / 150 + gk) * 4; ctx.beginPath(); ctx.moveTo(gx - 10, gy - fl); ctx.quadraticCurveTo(gx - 4, gy - 6, gx, gy); ctx.quadraticCurveTo(gx + 4, gy - 6, gx + 10, gy - fl); ctx.stroke(); }
    if (c.night) { ctx.fillStyle = "rgba(5,10,30,0.35)"; ctx.fillRect(0, 0, W, H); lantern(ctx, W * 0.3, qy - 40, t); }
    title(ctx, W, info.sneak ? info.town + ", at dusk" : info.town + " harbor");
  };
  SCENES.sneak = function (ctx, W, H, info, t) {
    // A narrow street at dusk, lit by a single lantern
    var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#1a2340"); g.addColorStop(1, "#3a3046"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var r = rng(info.town + "street");
    for (var i = 0; i < 7; i++) { var hx = i * 145 - 20, hh = 200 + r() * 120; house(ctx, hx, H * 0.78, 140, hh, ["#8a7c6a", "#7d6f60", "#94846c"][i % 3], "#5a3020", true, r); }
    rect(ctx, "#4a4440", 0, H * 0.78, W, H * 0.22);
    ctx.fillStyle = "rgba(10,10,25,0.45)"; ctx.fillRect(0, 0, W, H);
    lantern(ctx, W * 0.55, H * 0.42, t, true);
    for (var k = 0; k < 4; k++) A.person(ctx, W * 0.32 + k * 34 + Math.sin(t / 900 + k) * 4, H * 0.86 + (k % 2) * 6, 70, { coat: "#2a2a30", hat: "tricorn", face: 1, walk: t / 200 + k });
    // A sentry with a halberd, far down the street
    A.person(ctx, W * 0.84, H * 0.8, 58, { coat: (A.NATS[info.nation] || A.NATS.English).coat, hat: "helmet", face: -1, musket: true });
    title(ctx, W, "The streets of " + info.town + ", at dusk");
  };

  // ---------- Interiors ----------
  function room(ctx, W, H, wall, floor, beams) {
    var g = ctx.createLinearGradient(0, 0, 0, H * 0.72); g.addColorStop(0, shade(wall, -0.35)); g.addColorStop(1, wall);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.72);
    var fg = ctx.createLinearGradient(0, H * 0.72, 0, H); fg.addColorStop(0, floor); fg.addColorStop(1, shade(floor, -0.3));
    ctx.fillStyle = fg; ctx.fillRect(0, H * 0.72, W, H * 0.28);
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1.5;
    for (var y = H * 0.72 + 14; y < H; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    if (beams) { for (var x = 40; x < W; x += 180) { rect(ctx, "#3a2414", x, 0, 20, H * 0.72); } rect(ctx, "#3a2414", 0, 0, W, 22); }
  }
  SCENES.tavern = function (ctx, W, H, info, t) {
    room(ctx, W, H, "#7a5434", "#5a3a20", true);
    // Plank walls
    ctx.strokeStyle = "rgba(40,20,5,0.3)"; ctx.lineWidth = 1; for (var x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 22); ctx.lineTo(x, H * 0.72); ctx.stroke(); }
    // Window with the night harbor
    windowView(ctx, W * 0.07, H * 0.14, 120, 100, info.hour < 18 && info.hour > 6 ? info.hour : 22, t);
    // Fireplace with a fire
    var fx = W * 0.82;
    rect(ctx, "#6e6458", fx - 80, H * 0.3, 160, H * 0.42); rect(ctx, "#2a1a10", fx - 50, H * 0.45, 100, H * 0.27); rect(ctx, "#5a5048", fx - 92, H * 0.28, 184, 18);
    for (var f = 0; f < 6; f++) { var fh = 30 + Math.sin(t / 90 + f * 1.7) * 10 + f % 2 * 10; ctx.fillStyle = f % 2 ? "#ffb23a" : "#ff7a2a"; ctx.beginPath(); ctx.moveTo(fx - 40 + f * 15, H * 0.72); ctx.quadraticCurveTo(fx - 35 + f * 15, H * 0.72 - fh, fx - 30 + f * 15 + Math.sin(t / 60 + f) * 4, H * 0.72 - fh - 10); ctx.quadraticCurveTo(fx - 22 + f * 15, H * 0.72 - fh * 0.5, fx - 20 + f * 15, H * 0.72); ctx.fill(); }
    var fg = ctx.createRadialGradient(fx, H * 0.65, 10, fx, H * 0.65, 260); fg.addColorStop(0, "rgba(255,150,60,0.3)"); fg.addColorStop(1, "rgba(255,150,60,0)"); ctx.fillStyle = fg; ctx.fillRect(fx - 260, H * 0.65 - 260, 520, 520);
    // Shelves of bottles behind the bar
    rect(ctx, "#4a2e17", W * 0.25, H * 0.2, 300, 8); rect(ctx, "#4a2e17", W * 0.25, H * 0.33, 300, 8);
    var bc = ["#2f6d3a", "#6d2f2f", "#3a3a6d", "#8a6a2a", "#2f5a6d"];
    for (var b2 = 0; b2 < 22; b2++) { var bx = W * 0.25 + 8 + (b2 % 11) * 26, by = b2 < 11 ? H * 0.2 : H * 0.33; ctx.fillStyle = bc[b2 % 5]; ctx.fillRect(bx, by - 26, 10, 26); ctx.fillRect(bx + 3, by - 34, 4, 9); }
    // Barkeep behind the counter
    A.person(ctx, W * 0.42, H * 0.62, 120, { coat: "#e8e0cc", apron: "#cfc6b0", hat: "none", hair: "#3a2a1a", beard: "#3a2a1a", face: 1, arm: (Math.sin(t / 300) + 1) / 2 * 0.3 });
    // Counter with barrels and taps
    rect(ctx, "#5a3a1e", W * 0.22, H * 0.52, 330, 30); rect(ctx, "#3a2414", W * 0.22, H * 0.56, 330, H * 0.16);
    barrel(ctx, W * 0.22 + 230, H * 0.52, 44, 50, "RUM"); barrel(ctx, W * 0.22 + 280, H * 0.52, 44, 50, "ALE");
    // Lanterns hanging from the beams
    lantern(ctx, W * 0.3, H * 0.12, t, true); lantern(ctx, W * 0.62, H * 0.12, t + 400, true);
    // Tables of sailors, mugs going up and down
    function table(x, y) { rect(ctx, "#6b4424", x - 60, y - 40, 120, 10); rect(ctx, "#4a2e17", x - 50, y - 30, 8, 30); rect(ctx, "#4a2e17", x + 42, y - 30, 8, 30); }
    var ty = H * 0.95;
    A.person(ctx, W * 0.2 - 70, ty, 110, { coat: "#7a3b2a", hat: "bandana", face: 1, sit: true, mug: (Math.sin(t / 500) + 1) / 2 });
    A.person(ctx, W * 0.2 + 70, ty, 110, { coat: "#3f5a74", hat: "tricorn", face: -1, sit: true, mug: (Math.sin(t / 500 + 2) + 1) / 2, eyepatch: true });
    table(W * 0.2, ty);
    rect(ctx, "#8a6a3a", W * 0.2 - 10, ty - 54, 12, 14);
    // The old pirate in the corner, with his map
    A.person(ctx, W * 0.62 + 70, ty, 112, { coat: "#4a4a3a", hat: "tricorn", face: -1, sit: true, beard: "#cfcac0", hair: "#cfcac0" });
    table(W * 0.62, ty);
    ctx.fillStyle = "#e8d8a8"; ctx.save(); ctx.translate(W * 0.62 - 10, ty - 44); ctx.rotate(-0.1); ctx.fillRect(-28, -4, 56, 6); ctx.strokeStyle = "#8a2a1a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(4, 2); ctx.moveTo(4, -4); ctx.lineTo(-6, 2); ctx.stroke(); ctx.restore();
    // A parrot on the bar
    var px = W * 0.22 + 40, py = H * 0.52, bob = Math.sin(t / 400) * 2;
    ctx.fillStyle = "#2f9a3a"; ell(ctx, px, py - 16 + bob, 9, 14); ctx.fill(); ctx.fillStyle = "#e23a2a"; ell(ctx, px + 2, py - 30 + bob, 7, 7); ctx.fill();
    ctx.fillStyle = "#f2d24a"; ctx.beginPath(); ctx.moveTo(px + 8, py - 31 + bob); ctx.lineTo(px + 14, py - 27 + bob); ctx.lineTo(px + 8, py - 25 + bob); ctx.fill();
    ctx.fillStyle = "#2a6dc8"; ctx.beginPath(); ctx.moveTo(px - 6, py - 8 + bob); ctx.lineTo(px - 4, py + 8); ctx.lineTo(px + 2, py - 6 + bob); ctx.fill();
    ctx.fillStyle = "rgba(20,10,0,0.18)"; ctx.fillRect(0, 0, W, H);
    title(ctx, W, "The tavern, " + info.town);
  };
  SCENES.governor = function (ctx, W, H, info, t) {
    var N = A.NATS[info.nation] || A.NATS.English;
    room(ctx, W, H, "#b89a6a", "#7a4e2c", false);
    // Paneled walls
    ctx.strokeStyle = "rgba(90,60,30,0.45)"; ctx.lineWidth = 3;
    for (var x = 20; x < W; x += 120) ctx.strokeRect(x, H * 0.42, 100, H * 0.26);
    rect(ctx, "#6a4422", 0, H * 0.4, W, 8);
    // Tall windows onto the sea
    windowView(ctx, W * 0.06, H * 0.08, 110, 170, info.hour, t);
    windowView(ctx, W * 0.82, H * 0.08, 110, 170, info.hour, t);
    // Red curtains
    ctx.fillStyle = "#8a1f22"; [W * 0.06 - 18, W * 0.06 + 104, W * 0.82 - 18, W * 0.82 + 104].forEach(function (cx) { ctx.beginPath(); ctx.moveTo(cx, H * 0.06); ctx.quadraticCurveTo(cx + 22, H * 0.25, cx + 6, H * 0.44); ctx.lineTo(cx + 26, H * 0.44); ctx.quadraticCurveTo(cx + 34, H * 0.25, cx + 26, H * 0.06); ctx.fill(); });
    // Portrait of the king
    rect(ctx, "#b8923a", W * 0.42, H * 0.06, 150, 130); rect(ctx, "#3a2a2a", W * 0.42 + 10, H * 0.06 + 10, 130, 110);
    A.person(ctx, W * 0.42 + 75, H * 0.06 + 128, 120, { coat: N.coat, hat: "wig", face: 1, trim: N.trim });
    // Nation's banner on a stand
    rect(ctx, "#3a2717", W * 0.3, H * 0.15, 4, H * 0.57);
    A.natFlag(ctx, W * 0.3 + 4, H * 0.16, 80, 52, info.nation, t);
    chandelier(ctx, W * 0.6, H * 0.08, t);
    // Carpet
    ctx.fillStyle = "#7a1f22"; ctx.beginPath(); ctx.moveTo(W * 0.3, H); ctx.lineTo(W * 0.42, H * 0.76); ctx.lineTo(W * 0.78, H * 0.76); ctx.lineTo(W * 0.9, H); ctx.fill();
    ctx.strokeStyle = "#d4a83a"; ctx.lineWidth = 3; ctx.stroke();
    // The governor at his desk, in a white wig
    A.person(ctx, W * 0.6, H * 0.78, 140, { coat: N.coat, trim: N.trim, hat: "wig", face: -1, sit: true, point: Math.sin(t / 1500) > 0.6 });
    rect(ctx, "#5a3417", W * 0.48, H * 0.6, 240, 18); rect(ctx, "#4a2a12", W * 0.5, H * 0.62, 220, H * 0.16);
    ctx.fillStyle = "#e8dcc0"; ctx.save(); ctx.translate(W * 0.55, H * 0.6); ctx.rotate(0.06); ctx.fillRect(0, -3, 40, 4); ctx.restore();
    candle(ctx, W * 0.72, H * 0.6, t);
    ctx.strokeStyle = "#f2efe6"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W * 0.66, H * 0.6); ctx.quadraticCurveTo(W * 0.67, H * 0.54, W * 0.69, H * 0.52); ctx.stroke();
    // A guard at attention
    A.person(ctx, W * 0.86, H * 0.98, 150, { coat: N.coat, trim: N.trim, hat: "helmet", face: -1, musket: true });
    title(ctx, W, "The governor's mansion, " + info.town);
  };
  SCENES.daughter = function (ctx, W, H, info, t) {
    // An evening garden behind the mansion
    var horizon = H * 0.55, c = sky(ctx, W, H, Math.max(18.5, info.hour < 12 ? 19 : info.hour), horizon, t);
    sea(ctx, W, horizon, H * 0.7, c, t);
    rect(ctx, "#3f6a2e", 0, H * 0.7, W, H * 0.3);
    // Balustrade
    rect(ctx, "#e8e0cc", 0, H * 0.64, W, 10); for (var x = 10; x < W; x += 30) { ctx.fillStyle = "#ddd3bc"; ell(ctx, x, H * 0.69, 7, 12); ctx.fill(); }
    rect(ctx, "#e8e0cc", 0, H * 0.73, W, 8);
    palm(ctx, W * 0.1, H * 0.9, 220, t, 0.2); palm(ctx, W * 0.92, H * 0.92, 200, t, -0.2);
    // Flowers
    var r = rng("flowers"); for (var i = 0; i < 40; i++) { ctx.fillStyle = ["#e23a6a", "#f2d24a", "#f28a3a", "#f2f2f2"][i % 4]; ctx.beginPath(); ctx.arc(r() * W, H * 0.8 + r() * H * 0.18, 4, 0, TAU); ctx.fill(); }
    lantern(ctx, W * 0.28, H * 0.45, t, true); lantern(ctx, W * 0.72, H * 0.45, t + 300, true);
    var fem = info.fem;
    // The suitor and the captain
    if (fem) A.person(ctx, W * 0.42, H * 0.95, 150, { coat: "#3a4f7a", hat: "plume", plume: "#f2efe6", face: 1, trim: "#d4a83a" });
    else A.person(ctx, W * 0.42, H * 0.95, 140, { dress: "#c2557a", hair: "#5a3018", face: 1 });
    if (fem) A.person(ctx, W * 0.58, H * 0.95, 140, { dress: "#2f6d8a", hair: "#2a1a10", face: -1 });
    else A.person(ctx, W * 0.58, H * 0.95, 150, { coat: "#7a2a2a", hat: "plume", plume: "#f2efe6", face: -1, trim: "#d4a83a" });
    // A small heart rising now and then
    var hp = (t / 2600) % 1; if (hp < 0.7) { ctx.globalAlpha = 1 - hp / 0.7; ctx.fillStyle = "#e23a5a"; var hx = W * 0.5, hy = H * 0.6 - hp * 120; ctx.beginPath(); ctx.moveTo(hx, hy + 6); ctx.bezierCurveTo(hx - 14, hy - 4, hx - 6, hy - 14, hx, hy - 6); ctx.bezierCurveTo(hx + 6, hy - 14, hx + 14, hy - 4, hx, hy + 6); ctx.fill(); ctx.globalAlpha = 1; }
    title(ctx, W, "The governor's garden, " + info.town);
  };
  SCENES.merchant = function (ctx, W, H, info, t) {
    room(ctx, W, H, "#c8b088", "#8a7354", false);
    // Stone arches open onto the docks
    for (var a = 0; a < 3; a++) {
      var ax = 60 + a * 300;
      ctx.save(); ctx.beginPath(); ctx.moveTo(ax, H * 0.62); ctx.lineTo(ax, H * 0.25); ctx.arc(ax + 100, H * 0.25, 100, Math.PI, 0); ctx.lineTo(ax + 200, H * 0.62); ctx.closePath(); ctx.clip();
      var c = sky(ctx, W, H, info.hour, H * 0.45, t); sea(ctx, W, H * 0.45, H * 0.62, c, t);
      if (a === 1) A.sideShip(ctx, ax + 100, H * 0.6, 0.6, { masts: 3, sails: false, nation: info.nation, t: t });
      ctx.restore();
      ctx.strokeStyle = "#a8926a"; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(ax, H * 0.62); ctx.lineTo(ax, H * 0.25); ctx.arc(ax + 100, H * 0.25, 100, Math.PI, 0); ctx.lineTo(ax + 200, H * 0.62); ctx.stroke();
    }
    rect(ctx, "#a8926a", 0, H * 0.62, W, H * 0.1);
    // Goods piled up
    barrel(ctx, 30, H * 0.9, 50, 62, "RUM"); barrel(ctx, 86, H * 0.9, 50, 62, "RUM"); barrel(ctx, 58, H * 0.8, 50, 62, "WINE");
    crate(ctx, 150, H * 0.92, 70, 60, "SUGAR"); crate(ctx, 150, H * 0.81, 70, 50, "SPICE");
    sack(ctx, 260, H * 0.93, 26); sack(ctx, 300, H * 0.94, 24, "#c8b27a"); sack(ctx, 280, H * 0.86, 22);
    // Bolts of cloth
    ["#7d5ea8", "#c2557a", "#2f6d8a", "#d4a83a"].forEach(function (cc, i) { ctx.fillStyle = cc; ell(ctx, W * 0.84, H * 0.94 - i * 22, 52, 11); ctx.fill(); ctx.fillStyle = shade(cc, -0.25); ell(ctx, W * 0.84 + 50, H * 0.94 - i * 22, 6, 11); ctx.fill(); });
    // Merchant behind a counter, with scales and ledger
    A.person(ctx, W * 0.56, H * 0.76, 150, { coat: "#556b3a", hat: "cap", capColor: "#3a2a1a", face: -1, beard: "#5a3a1a", point: Math.sin(t / 1300) > 0.5 });
    rect(ctx, "#6b4424", W * 0.4, H * 0.66, 280, 16); rect(ctx, "#4a2e17", W * 0.42, H * 0.68, 260, H * 0.24);
    var sw = Math.sin(t / 700) * 0.12;
    ctx.strokeStyle = "#b8923a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W * 0.46, H * 0.66); ctx.lineTo(W * 0.46, H * 0.54); ctx.stroke();
    ctx.save(); ctx.translate(W * 0.46, H * 0.54); ctx.rotate(sw); ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(34, 0); ctx.stroke(); ctx.fillStyle = "#b8923a"; ell(ctx, -34, 12, 12, 3); ctx.fill(); ell(ctx, 34, 12, 12, 3); ctx.fill(); ctx.restore();
    rect(ctx, "#e8dcc0", W * 0.62, H * 0.64, 50, 4); rect(ctx, "#7a2a1a", W * 0.62 + 50, H * 0.635, 6, 6);
    coins(ctx, W * 0.66, H * 0.655, 8, t);
    // A porter carrying a sack across
    var pp = (t / 25) % (W + 200) - 100;
    A.person(ctx, pp, H * 0.99, 120, { coat: "#7d6040", hat: "bandana", bandana: "#c2557a", face: 1, walk: t / 120, sack: true });
    title(ctx, W, "The merchant, " + info.town);
  };
  SCENES.shipwright = function (ctx, W, H, info, t) {
    var horizon = H * 0.45, c = sky(ctx, W, H, info.hour, horizon, t);
    sea(ctx, W, horizon, H * 0.62, c, t);
    // Slipway
    ctx.fillStyle = "#8a7354"; ctx.beginPath(); ctx.moveTo(0, H * 0.62); ctx.lineTo(W, H * 0.58); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    // A hull on the stocks, ribs showing at one end
    var hx = W * 0.5, hy = H * 0.7;
    ctx.fillStyle = "#6b4424"; ctx.beginPath(); ctx.moveTo(hx - 220, hy - 80); ctx.quadraticCurveTo(hx - 210, hy, hx - 120, hy + 10); ctx.lineTo(hx + 60, hy + 10); ctx.lineTo(hx + 60, hy - 80); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(40,20,5,0.4)"; ctx.lineWidth = 2; for (var p = 0; p < 5; p++) { ctx.beginPath(); ctx.moveTo(hx - 215 + p * 4, hy - 70 + p * 16); ctx.lineTo(hx + 60, hy - 70 + p * 16); ctx.stroke(); }
    ctx.strokeStyle = "#7a5230"; ctx.lineWidth = 7;
    for (var rb = 0; rb < 6; rb++) { var rx = hx + 70 + rb * 26; ctx.beginPath(); ctx.moveTo(rx, hy - 80); ctx.quadraticCurveTo(rx + 6, hy, rx + 4, hy + 10); ctx.stroke(); }
    rect(ctx, "#5a3a1e", hx - 220, hy + 10, 460, 10);
    // Props and scaffold
    ctx.strokeStyle = "#5a3a1e"; ctx.lineWidth = 6; for (var k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(hx - 180 + k * 70, H * 0.95); ctx.lineTo(hx - 170 + k * 70, hy - 20); ctx.stroke(); }
    rect(ctx, "#7a5a32", hx - 200, hy - 92, 300, 8);
    // Crane
    ctx.strokeStyle = "#4a2e17"; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(W * 0.88, H * 0.95); ctx.lineTo(W * 0.88, H * 0.18); ctx.lineTo(W * 0.68, H * 0.12); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = "#2a1a0c"; var sw = Math.sin(t / 900) * 6; ctx.beginPath(); ctx.moveTo(W * 0.7, H * 0.13); ctx.lineTo(W * 0.7 + sw, H * 0.36); ctx.stroke();
    rect(ctx, "#8a6a3a", W * 0.7 + sw - 40, H * 0.36, 80, 10);
    // Timber stacks
    for (var lg = 0; lg < 4; lg++) { ctx.fillStyle = "#9a7444"; ctx.fillRect(40, H * 0.92 - lg * 14, 160, 12); ctx.fillStyle = "#c8a070"; ell(ctx, 200, H * 0.92 - lg * 14 + 6, 5, 6); ctx.fill(); }
    // Workers hammering and sawing
    A.person(ctx, hx - 120, hy - 92, 90, { coat: "#e8e0cc", hat: "cap", face: 1, arm: (Math.sin(t / 160) + 1) / 2 });
    A.person(ctx, hx + 20, hy - 92, 90, { coat: "#7d6040", hat: "bandana", face: -1, arm: (Math.sin(t / 160 + 1.6) + 1) / 2 });
    A.person(ctx, W * 0.24, H * 0.98, 120, { coat: "#3f5a74", hat: "tricorn", face: 1, apron: "#a89070", beard: "#8a8070", point: true });
    // Sawdust specks
    ctx.fillStyle = "rgba(240,220,170,0.7)"; for (var s = 0; s < 12; s++) { var sy = ((t / 8 + s * 30) % 90); ctx.fillRect(hx - 110 + s * 3, hy - 70 + sy, 2, 2); }
    palm(ctx, W * 0.97, H * 0.62, 130, t, -0.2);
    title(ctx, W, "The shipwright's yard, " + info.town);
  };
  SCENES.bank = function (ctx, W, H, info, t) {
    room(ctx, W, H, "#5a4a3a", "#4a3020", true);
    windowView(ctx, W * 0.75, H * 0.12, 130, 120, info.hour, t, true);
    // Shelves of ledgers
    for (var sh = 0; sh < 3; sh++) { rect(ctx, "#3a2414", 60, H * 0.15 + sh * 60, 260, 8); for (var b = 0; b < 12; b++) { ctx.fillStyle = ["#6d2f2f", "#2f4a6d", "#3a5a2f", "#6d5a2f"][(b + sh) % 4]; ctx.fillRect(66 + b * 21, H * 0.15 + sh * 60 - 44, 17, 44); } }
    // Iron strongbox, open, full of gold
    var bx = W * 0.15, by = H * 0.95;
    rect(ctx, "#3a3a3e", bx, by - 70, 130, 70); ctx.strokeStyle = "#1a1a1e"; ctx.lineWidth = 4; ctx.strokeRect(bx, by - 70, 130, 70);
    ctx.fillStyle = "#4a4a4e"; ctx.beginPath(); ctx.moveTo(bx, by - 70); ctx.lineTo(bx + 10, by - 120); ctx.lineTo(bx + 140, by - 120); ctx.lineTo(bx + 130, by - 70); ctx.fill();
    ctx.fillStyle = "#e0b030"; ell(ctx, bx + 65, by - 70, 60, 12); ctx.fill();
    coins(ctx, bx + 70, by - 72, 15, t);
    // Moneylender with spectacles at his desk
    A.person(ctx, W * 0.55, H * 0.74, 140, { coat: "#2a2a2e", hat: "cap", capColor: "#1a1a1e", face: -1, beard: "#d8d4c8", arm: (Math.sin(t / 400) + 1) / 4 });
    ctx.strokeStyle = "#b8923a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(W * 0.55 - 9, H * 0.74 - 150, 5, 0, TAU); ctx.stroke();
    rect(ctx, "#4a2a12", W * 0.38, H * 0.62, 280, 16); rect(ctx, "#3a2010", W * 0.4, H * 0.64, 260, H * 0.28);
    ctx.fillStyle = "#efe6cc"; ctx.fillRect(W * 0.42, H * 0.6, 70, 6); ctx.fillRect(W * 0.42 + 72, H * 0.6, 70, 6);
    ctx.strokeStyle = "rgba(60,40,20,0.6)"; ctx.lineWidth = 1; for (var l = 0; l < 5; l++) { ctx.beginPath(); ctx.moveTo(W * 0.42 + 5, H * 0.6 + 1 + l); ctx.lineTo(W * 0.42 + 60, H * 0.6 + 1 + l); ctx.stroke(); }
    coins(ctx, W * 0.62, H * 0.61, 12, t);
    candle(ctx, W * 0.67, H * 0.62, t);
    ctx.fillStyle = "rgba(20,10,0,0.2)"; ctx.fillRect(0, 0, W, H);
    title(ctx, W, "The bank, " + info.town);
  };
  SCENES.gates = function (ctx, W, H, info, t) {
    var horizon = H * 0.5, c = sky(ctx, W, H, info.hour, horizon, t);
    var N = A.NATS[info.nation] || A.NATS.English;
    rect(ctx, "#7a9a4a", 0, horizon, W, H - horizon);
    // Road to the gate
    ctx.fillStyle = "#b8a072"; ctx.beginPath(); ctx.moveTo(W * 0.5 - 30, horizon + 30); ctx.lineTo(W * 0.5 + 30, horizon + 30); ctx.lineTo(W * 0.62, H); ctx.lineTo(W * 0.3, H); ctx.fill();
    // Town wall with towers and a gate
    var wy = horizon + 34;
    rect(ctx, "#a59b8a", W * 0.18, wy - 110, W * 0.64, 110);
    for (var i = 0; i < 26; i++) rect(ctx, "#a59b8a", W * 0.18 + i * 24, wy - 124, 14, 14);
    ctx.strokeStyle = "rgba(60,55,45,0.3)"; ctx.lineWidth = 1; for (var y = wy - 100; y < wy; y += 12) { ctx.beginPath(); ctx.moveTo(W * 0.18, y); ctx.lineTo(W * 0.82, y); ctx.stroke(); }
    [W * 0.18 - 20, W * 0.82 - 40].forEach(function (tx2) { rect(ctx, "#958b7a", tx2, wy - 170, 60, 170); for (var k = 0; k < 4; k++) rect(ctx, "#958b7a", tx2 + k * 16, wy - 182, 10, 12); });
    ctx.fillStyle = "#2a1a10"; ctx.beginPath(); ctx.moveTo(W * 0.5 - 34, wy); ctx.lineTo(W * 0.5 - 34, wy - 60); ctx.arc(W * 0.5, wy - 60, 34, Math.PI, 0); ctx.lineTo(W * 0.5 + 34, wy); ctx.fill();
    ctx.strokeStyle = "#4a3a2a"; ctx.lineWidth = 3; for (var g = -28; g <= 28; g += 10) { ctx.beginPath(); ctx.moveTo(W * 0.5 + g, wy); ctx.lineTo(W * 0.5 + g, wy - 80); ctx.stroke(); }
    // Rooftops and the church beyond the wall
    for (var h = 0; h < 7; h++) { ctx.fillStyle = "#b5542f"; ctx.beginPath(); var hx = W * 0.22 + h * 80; ctx.moveTo(hx, wy - 110); ctx.lineTo(hx + 30, wy - 140 - (h % 2) * 10); ctx.lineTo(hx + 60, wy - 110); ctx.fill(); }
    rect(ctx, "#ece2c8", W * 0.6, wy - 190, 26, 80); ctx.fillStyle = "#9b4a2c"; ctx.beginPath(); ctx.moveTo(W * 0.6 - 4, wy - 190); ctx.lineTo(W * 0.6 + 13, wy - 215); ctx.lineTo(W * 0.6 + 30, wy - 190); ctx.fill();
    // Flag over the gate
    rect(ctx, "#3a2717", W * 0.5 - 1, wy - 210, 3, 100);
    A.natFlag(ctx, W * 0.5 + 2, wy - 208, 46, 28, info.nation, t);
    // Soldiers on the wall, if hostile; otherwise one sentry
    var n = info.hostile ? 7 : 2;
    for (var s = 0; s < n; s++) A.person(ctx, W * 0.24 + s * (W * 0.52 / n), wy - 110, 40, { coat: N.coat, hat: "helmet", face: -1, musket: true, aim: info.hostile && s % 2 === 0 });
    // Jungle framing the picture
    for (var j = 0; j < 9; j++) { ctx.fillStyle = j % 2 ? "#2f5a24" : "#3a6a2c"; ell(ctx, (j < 5 ? 0 : W) + (j < 5 ? j * 30 : -(j - 5) * 30), H * 0.4 + (j % 5) * 70, 90, 70); ctx.fill(); }
    palm(ctx, 60, H * 0.95, 230, t, 0.25); palm(ctx, W - 60, H * 0.97, 210, t, -0.25);
    // Your landing party, from behind
    for (var m = 0; m < 9; m++) A.person(ctx, W * 0.26 + m * 48 + (m % 2) * 10, H * 0.9 + (m % 3) * 18, 110, { coat: ["#7a3b2a", "#3f5a74", "#6b5a3a", "#5a6a3a"][m % 4], hat: ["bandana", "tricorn", "cap"][m % 3], face: 1, musket: m % 2 === 0 });
    title(ctx, W, "The gates of " + info.town);
  };
  SCENES.cabin = function (ctx, W, H, info, t) {
    room(ctx, W, H, "#6b4424", "#4a2e17", true);
    // Stern windows
    for (var i = 0; i < 4; i++) windowView(ctx, W * 0.18 + i * 160, H * 0.1, 130, 120, info.hour, t);
    // Map table with a chart and compass
    rect(ctx, "#5a3417", W * 0.25, H * 0.7, W * 0.5, 16); rect(ctx, "#3a2010", W * 0.27, H * 0.72, 12, H * 0.28); rect(ctx, "#3a2010", W * 0.71, H * 0.72, 12, H * 0.28);
    ctx.fillStyle = "#e8d8a8"; ctx.fillRect(W * 0.3, H * 0.66, W * 0.3, 8);
    candle(ctx, W * 0.66, H * 0.7, t);
    title(ctx, W, "The captain's cabin");
  };
  A.scene = function (ctx, W, H, kind, info, t) {
    ctx.save();
    ctx.textBaseline = "alphabetic";
    (SCENES[kind] || SCENES.harbor)(ctx, W, H, info, t);
    ctx.restore();
  };

  // ---------- The land battle ----------
  // L: { men, sol, cav, range (0 to 2), cover, nation, town, fx: [{kind, who, t}] }
  A.landBattle = function (ctx, W, H, L, info, t) {
    var horizon = H * 0.36, c = sky(ctx, W, H, info.hour, horizon, t);
    var N = A.NATS[info.nation] || A.NATS.Spanish;
    var g = ctx.createLinearGradient(0, horizon, 0, H); g.addColorStop(0, "#7d9c4c"); g.addColorStop(1, "#5c7d34"); ctx.fillStyle = g; ctx.fillRect(0, horizon, W, H - horizon);
    // Town walls far off on the right
    rect(ctx, "#a59b8a", W * 0.72, horizon - 50, W * 0.28, 60); for (var i = 0; i < 12; i++) rect(ctx, "#a59b8a", W * 0.72 + i * 24, horizon - 60, 14, 10);
    rect(ctx, "#3a2717", W * 0.86, horizon - 120, 3, 70); A.natFlag(ctx, W * 0.86 + 3, horizon - 118, 40, 24, info.nation, t);
    // Woods on the left
    for (var j = 0; j < 10; j++) { ctx.fillStyle = j % 2 ? "#2f5a24" : "#3a6a2c"; ell(ctx, j * 26 - 20, horizon + 20 + j * 34, 80, 60); ctx.fill(); }
    // Grass tufts
    var r = rng(5); ctx.strokeStyle = "rgba(40,70,20,0.5)"; ctx.lineWidth = 1.5;
    for (var k = 0; k < 60; k++) { var gx = r() * W, gy = horizon + 20 + r() * (H - horizon - 20); ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx - 3, gy - 7); ctx.moveTo(gx, gy); ctx.lineTo(gx + 3, gy - 7); ctx.stroke(); }
    // Where each side stands
    var gap = L.range === 2 ? 0.55 : L.range === 1 ? 0.3 : 0.06;
    var mid = W * 0.5, yourX = mid - gap * W / 2 - 40, foeX = mid + gap * W / 2 + 40;
    if (L.cover) { yourX = W * 0.17; }
    var now = performance.now();
    // Their soldiers in ranks, with cavalry on the flank
    var sol = Math.min(30, Math.ceil(L.sol / 3)), cav = Math.min(8, Math.ceil(L.cav / 3));
    var fired = L.fx && L.fx.some(function (f) { return f.who === "foe" && now - f.t < 700; });
    for (var s = sol - 1; s >= 0; s--) {
      var row = s % 3, col = Math.floor(s / 3);
      A.person(ctx, foeX + col * 18 + row * 8, H * 0.6 + row * 40, 52, { coat: N.coat, trim: N.trim, hat: "helmet", face: -1, musket: true, aim: L.range > 0 });
    }
    for (var cv = 0; cv < cav; cv++) {
      var hx = foeX + 30 + cv * 34, hy = H * 0.5 + (cv % 2) * 18;
      ctx.fillStyle = "#5a3a22"; ell(ctx, hx, hy - 20, 22, 10); ctx.fill(); ctx.fillRect(hx - 18, hy - 14, 4, 16); ctx.fillRect(hx + 14, hy - 14, 4, 16); ctx.beginPath(); ctx.moveTo(hx - 20, hy - 24); ctx.lineTo(hx - 34, hy - 38); ctx.lineTo(hx - 28, hy - 22); ctx.fill();
      A.person(ctx, hx, hy - 22, 34, { coat: N.coat, hat: "plume", plume: N.trim, face: -1, sword: true });
    }
    // Your men
    var men = Math.min(30, Math.ceil(L.men / 3));
    var charging = L.range === 0;
    for (var m = men - 1; m >= 0; m--) {
      var rw = m % 3, cl = Math.floor(m / 3);
      A.person(ctx, yourX - cl * 18 - rw * 8 + (charging ? Math.sin(t / 150 + m) * 4 : 0), H * 0.62 + rw * 40, 54, { coat: ["#7a3b2a", "#3f5a74", "#6b5a3a", "#5a6a3a"][m % 4], hat: ["bandana", "tricorn", "cap"][m % 3], face: 1, musket: !charging && m % 2 === 0, aim: !charging && L.range > 0 && m % 2 === 0, sword: charging || m % 2 === 1, walk: charging ? t / 120 + m : null });
    }
    if (L.cover) for (var tr = 0; tr < 5; tr++) { ctx.fillStyle = "#2f5a24"; ell(ctx, W * 0.12 + tr * 30, H * 0.66 + (tr % 2) * 40, 40, 30); ctx.fill(); }
    // Musket smoke after a volley
    (L.fx || []).forEach(function (f) {
      var age = (now - f.t) / 1800; if (age > 1) return;
      var x0 = f.who === "you" ? yourX + 30 : foeX - 30;
      for (var p = 0; p < 8; p++) { ctx.fillStyle = "rgba(240,240,235," + (0.7 * (1 - age)) + ")"; ell(ctx, x0 + (f.who === "you" ? 1 : -1) * (p * 6 + age * 30), H * 0.6 + (p % 3) * 40 - age * 20, 14 + age * 20, 10 + age * 12); ctx.fill(); }
      if (age < 0.08) { ctx.fillStyle = "rgba(255,220,120,0.8)"; for (var q = 0; q < 6; q++) { ell(ctx, x0, H * 0.6 + q * 22, 6, 3); ctx.fill(); } }
    });
    // Tallies
    ctx.font = "16px 'Atkinson Hyperlegible', sans-serif"; ctx.textAlign = "left";
    ctx.fillStyle = "rgba(15,12,8,0.72)"; ctx.fillRect(18, H - 50, 230, 32); ctx.fillStyle = "#f3e3c0"; ctx.fillText("Your men: " + L.men, 30, H - 28);
    ctx.textAlign = "right"; ctx.fillStyle = "rgba(15,12,8,0.72)"; ctx.fillRect(W - 300, H - 50, 282, 32); ctx.fillStyle = "#f3e3c0"; ctx.fillText("Soldiers: " + L.sol + (L.cav ? ", cavalry: " + L.cav : ""), W - 30, H - 28);
    title(ctx, W, "Battle before " + info.town);
  };
})();
