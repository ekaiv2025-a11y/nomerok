// Рендер фирменных креативов из HTML.
//   Картинка: node brand/render.js image brand/templates/story-example-green.html out/story.png 1080 1920
//   Видео:    node brand/render.js video brand/templates/reel-example-specialists.html out/reel.mp4
// Видео-шаблон должен задать window.DURATION (сек) и window.render(t) — отрисовать кадр в момент t.
// Нужны: Playwright (Chromium) и ffmpeg.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/home/claude/.npm-global/lib/node_modules/playwright")); }

const [mode, src, out, w = "1080", h = "1920"] = process.argv.slice(2);
if (!mode || !src || !out) { console.log("usage: node brand/render.js image|video <html> <out> [width height]"); process.exit(1); }
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  await p.goto("file://" + path.resolve(src));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(200);
  if (mode === "image") {
    await p.screenshot({ path: out });
  } else {
    const fps = 30;
    // TIMEMAP (необязательно): растянуть сцены под озвучку. {"dur": 18.2, "knots": [[0,0],[4.1,3.4],…]} — [время в ролике, время в шаблоне]
    const tm = process.env.TIMEMAP ? JSON.parse(process.env.TIMEMAP) : null;
    const dur = tm ? tm.dur : await p.evaluate(() => window.DURATION);
    const toTpl = (t) => {
      if (!tm) return t;
      const k = tm.knots;
      for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return k[i - 1][1] + ((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])) * (k[i][1] - k[i - 1][1]);
      return k[k.length - 1][1];
    };
    const dir = fs.mkdtempSync(path.join(require("os").tmpdir(), "frames-"));
    for (let f = 0; f < Math.round(dur * fps); f++) {
      await p.evaluate((t) => window.render(t), toTpl(f / fps));
      await p.screenshot({ path: `${dir}/${String(f).padStart(5, "0")}.jpg`, type: "jpeg", quality: 92 });
    }
    execSync(`ffmpeg -y -loglevel error -framerate ${fps} -i ${dir}/%05d.jpg -c:v libx264 -pix_fmt yuv420p -profile:v high -crf 20 -movflags +faststart "${out}"`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
  await b.close();
  console.log("done:", out);
})();
