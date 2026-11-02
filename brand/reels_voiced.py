# Рилсы с готовой озвучкой (голос «Дмитрий», файлы <reel>-<n>.mp3 из «Озвучка роликов.bat»).
#   python3 brand/reels_voiced.py <папка с mp3>
# Сцены растягиваются под длину фраз (render.js, TIMEMAP), музыка — своя (voice_music.music), приглушается под голосом.
import json, os, subprocess, sys, tempfile

sys.path.insert(0, os.path.dirname(__file__))
from voice_music import dur, music  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "brand", "out", "reels")
# начало сцен 2, 3, 4 в шаблоне (сек) и длина шаблона
SCENES = {
    "reel-clients-2": ([0, 3.4, 7.8, 11.6], 15, 0),
    "reel-specialists-2": ([0, 3.4, 7.8, 11.6], 15, 2),
    "reel-novostroyki": ([0, 3.2, 7.7, 11.6], 15, 5),
    "reel-life": ([0, 3.2, 7.7, 11.6], 15, 7),
}
LEAD, GAP, TAIL = 0.35, 0.55, 1.8


def trim(src, dst):
    """Убираем тишину в начале и в конце фразы."""
    af = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,aresample=44100"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", af, dst], check=True)
    return dur(dst)


def main(vdir):
    env = dict(os.environ, NODE_PATH="/home/claude/.npm-global/lib/node_modules")
    for name, (starts, tlen, key) in SCENES.items():
        tmp = tempfile.mkdtemp()
        lines = []
        for i in range(4):
            p = os.path.join(tmp, f"l{i}.wav")
            lines.append((p, trim(os.path.join(vdir, f"{name}-{i + 1}.mp3"), p)))
        tpl_bounds = starts + [tlen]
        knots, out_t, voice_at = [[0, 0]], 0.0, []
        for i in range(4):
            tpl_len = tpl_bounds[i + 1] - tpl_bounds[i]
            need = LEAD + lines[i][1] + (TAIL if i == 3 else GAP)
            voice_at.append(out_t + LEAD)
            out_t += max(tpl_len, need)
            knots.append([round(out_t, 3), tpl_bounds[i + 1]])
        total = round(out_t, 2)
        tm = {"dur": total, "knots": knots}
        video = os.path.join(OUT, f"nomerok-{name}-v.mp4")
        subprocess.run(["node", "brand/render.js", "video", f"brand/templates/{name}.html", video], cwd=ROOT, env=dict(env, TIMEMAP=json.dumps(tm)), check=True, capture_output=True)
        mpath = os.path.join(tmp, "music.wav")
        music(total, key, mpath)
        inputs, filt, labels = [], [], []
        for i, (p, _) in enumerate(lines):
            ms = int(voice_at[i] * 1000)
            inputs += ["-i", p]
            filt.append(f"[{i}:a]adelay={ms}|{ms}[v{i}]")
            labels.append(f"[v{i}]")
        fc = ";".join(filt + [
            f"{''.join(labels)}amix=inputs=4:normalize=0,apad=whole_dur={total},loudnorm=I=-16:TP=-1.5[vo]",
            "[vo]asplit[vo1][vo2]", "[4:a]volume=0.5[mu]",
            "[mu][vo1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck]",
            f"[duck][vo2]amix=inputs=2:normalize=0,atrim=0:{total}[a]",
        ])
        audio = os.path.join(tmp, "mix.m4a")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-i", mpath, "-filter_complex", fc, "-map", "[a]", "-c:a", "aac", "-b:a", "192k", audio], check=True)
        final = os.path.join(OUT, f"nomerok-{name}-voice.mp4")
        part = final + ".part.mp4"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c", "copy", "-shortest", "-movflags", "+faststart", part], check=True)
        os.replace(part, final)
        os.remove(video)
        print(name, total, [round(l[1], 2) for l in lines])


if __name__ == "__main__":
    main(sys.argv[1])
