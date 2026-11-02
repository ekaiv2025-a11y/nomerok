# Озвучка и музыка для рилсов NomerOk.
#   python3 brand/voice_music.py
# Голос: RHVoice (apt install rhvoice rhvoice-russian). Музыка генерируется кодом — своя, без чужих прав.
# Берёт brand/out/reels/nomerok-<reel>.mp4 (видео без звука) и пишет nomerok-<reel>-sound.mp4.
import json, os, subprocess, tempfile, wave
import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "out", "reels")

# (время начала фразы в секундах, конец окна, текст). Окна совпадают со сценами шаблонов (reel-*.html).
REELS = {
    "reel-clients-2": {"voice": "tatiana", "key": 0, "lines": [
        (0.3, 3.4, "Нужен мастер? Сантехник, электрик, няня?"),
        (3.7, 7.7, "Опишите задачу на Номерке. Это бесплатно."),
        (8.1, 11.6, "Свободные специалисты откликнутся сами."),
        (12.1, 15.0, "Номерок точка гэ е. Разместите заявку."),
    ]},
    "reel-specialists-2": {"voice": "vitaliy", "key": 2, "lines": [
        (0.3, 3.4, "Вы сантехник, репетитор или мастер маникюра?"),
        (3.7, 7.7, "Анкета на Номерке — за три минуты, через Телеграм."),
        (8.1, 11.6, "Заявки приходят в Телеграм. Без комиссии."),
        (12.1, 15.0, "Номерок. Клиенты сами найдут ваш номер."),
    ]},
    "reel-novostroyki": {"voice": "tatiana", "key": 5, "lines": [
        (0.3, 3.2, "Ищете квартиру в новостройке в Грузии?"),
        (3.5, 7.6, "Жилые комплексы Батуми, Тбилиси и курортов — в одном месте."),
        (8.0, 11.6, "Сроки и цены. Оставьте заявку — подберут варианты."),
        (12.1, 15.0, "Новостройки Грузии на Номерок точка гэ е."),
    ]},
    "reel-life": {"voice": "tatiana", "key": 7, "lines": [
        (0.3, 3.2, "Переехали в Грузию? Или только собираетесь?"),
        (3.5, 7.6, "Открыть И Пэ, снять квартиру, открыть счёт — всё по шагам."),
        (8.0, 11.6, "Плюс полезные контакты и путеводитель по городам."),
        (12.1, 15.0, "Журнал «Жизнь в Грузии» на Номерок точка гэ е."),
    ]},
}


def dur(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).decode())


def synth(text, voice, path, slot):
    """Говорим чуть быстрее, если фраза не влезает в сцену."""
    for rate in (100, 108, 116, 124, 132, 140):
        subprocess.run(["RHVoice-test", "-p", voice, "-r", str(rate), "-o", path], input=text.encode(), check=True, capture_output=True)
        if dur(path) <= slot - 0.25:
            return rate
    return rate


def music(seconds, key, path):
    """Лёгкий фон: аккорды I–V–vi–IV, переборы, мягкий бит. 112 ударов в минуту."""
    bpm = 112
    beat = 60 / bpm
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    base = 261.63 * 2 ** (key / 12) / 2  # C3 + сдвиг тональности
    prog = [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]]
    bar = beat * 4
    f = lambda semi: base * 2 ** (semi / 12)
    for b in range(int(seconds / bar) + 1):
        ch = prog[b % 4]
        s0 = int(b * bar * SR)
        seg = min(int(bar * SR), n - s0)
        if seg <= 0:
            break
        tt = np.arange(seg) / SR
        env = np.minimum(1, tt / 0.25) * np.exp(-tt / 3.5)
        pad = sum(np.sin(2 * np.pi * f(s) * tt) + 0.3 * np.sin(2 * np.pi * 2 * f(s) * tt) for s in ch)
        out[s0:s0 + seg] += 0.10 * env * pad
        bass = np.sin(2 * np.pi * f(ch[0] - 12) * tt) * np.exp(-tt / 1.2)
        out[s0:s0 + seg] += 0.22 * bass
        # перебор восьмыми
        for k in range(8):
            st = s0 + int(k * beat / 2 * SR)
            ln = min(int(0.35 * SR), n - st)
            if ln <= 0:
                continue
            tp = np.arange(ln) / SR
            note = f(ch[[0, 1, 2, 1, 2, 1, 0, 2][k]] + 12)
            out[st:st + ln] += 0.08 * np.exp(-tp / 0.12) * (np.sin(2 * np.pi * note * tp) + 0.4 * np.sin(2 * np.pi * 2 * note * tp))
    rng = np.random.default_rng(1)
    for k in range(int(seconds / beat) + 1):
        st = int(k * beat * SR)
        if st >= n:
            break
        ln = min(int(0.25 * SR), n - st)
        tp = np.arange(ln) / SR
        if k % 2 == 0:  # мягкая бочка
            out[st:st + ln] += 0.35 * np.sin(2 * np.pi * (50 + 60 * np.exp(-tp / 0.03)) * tp) * np.exp(-tp / 0.12)
        hs = st + int(beat / 2 * SR)  # хэт между долями
        hl = min(int(0.05 * SR), n - hs)
        if hl > 0:
            out[hs:hs + hl] += 0.03 * rng.standard_normal(hl) * np.exp(-np.arange(hl) / SR / 0.015)
    fade = np.ones(n)
    fade[: int(0.5 * SR)] = np.linspace(0, 1, int(0.5 * SR))
    fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR))
    out *= fade
    out = out / max(1e-9, np.abs(out).max()) * 0.8
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((out * 32767).astype(np.int16).tobytes())


def main():
    report = {}
    for name, cfg in REELS.items():
        video = os.path.join(OUT, f"nomerok-{name}.mp4")
        if not os.path.exists(video):
            print("нет видео:", video)
            continue
        d = dur(video)
        tmp = tempfile.mkdtemp()
        inputs, filters, labels = [], [], []
        rates = []
        for i, (start, end, text) in enumerate(cfg["lines"]):
            p = os.path.join(tmp, f"l{i}.wav")
            rates.append(synth(text, cfg["voice"], p, end - start))
            inputs += ["-i", p]
            ms = int(start * 1000)
            filters.append(f"[{i}:a]aresample=44100,adelay={ms}|{ms}[v{i}]")
            labels.append(f"[v{i}]")
        mpath = os.path.join(tmp, "music.wav")
        music(d, cfg["key"], mpath)
        k = len(cfg["lines"])
        voice_mix = f"{''.join(labels)}amix=inputs={k}:normalize=0,apad=whole_dur={d},loudnorm=I=-16:TP=-1.5[vo]"
        # музыка тише голоса и приглушается, пока говорят
        fc = ";".join(filters + [voice_mix, "[vo]asplit[vo1][vo2]", f"[{k}:a]volume=0.5[mu]", "[mu][vo1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck]", "[duck][vo2]amix=inputs=2:normalize=0,atrim=0:" + str(d) + "[a]"])
        out_audio = os.path.join(tmp, "mix.m4a")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-i", mpath, "-filter_complex", fc, "-map", "[a]", "-c:a", "aac", "-b:a", "192k", out_audio], check=True)
        final = os.path.join(OUT, f"nomerok-{name}-sound.mp4")
        part = final + ".part.mp4"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-i", out_audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "copy", "-shortest", "-movflags", "+faststart", part], check=True)
        os.replace(part, final)
        report[name] = {"voice": cfg["voice"], "rates": rates}
        print("готово:", final, rates)
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
