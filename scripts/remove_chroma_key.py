import argparse
import io
import re
import statistics
from pathlib import Path

from PIL import Image, ImageCms


FRAME_PATTERN = re.compile(r"^frame_(\d+)\.webp$", re.IGNORECASE)
PUBLIC = Path(__file__).resolve().parents[1] / "public"
DEFAULT_SOURCE = PUBLIC / "frames_Purple_logo_3D_animation_20261014201641.mp4_60fps_webp"
DEFAULT_DESTINATION = PUBLIC / "frames_Purple_logo_3D_animation_20261014201641_clean_png"


def get_key_color(image: Image.Image) -> tuple[float, float, float]:
    width, height = image.size
    pixels = image.load()
    sample_size = min(24, width // 4, height // 4)
    samples = [[], [], []]

    for origin_x in (0, width - sample_size):
        for origin_y in (0, height - sample_size):
            for y in range(origin_y, origin_y + sample_size):
                for x in range(origin_x, origin_x + sample_size):
                    pixel = pixels[x, y]
                    for channel in range(3):
                        samples[channel].append(pixel[channel])

    return tuple(float(statistics.median(channel)) for channel in samples)


def process_frame(source: Path, destination: Path, threshold: int, feather: int) -> None:
    with Image.open(source) as image:
        rgb = image.convert("RGB")
        icc_profile = image.info.get("icc_profile")
        if icc_profile:
            rgb = ImageCms.profileToProfile(
                rgb,
                ImageCms.ImageCmsProfile(io.BytesIO(icc_profile)),
                ImageCms.createProfile("sRGB"),
                outputMode="RGB",
            )
        rgba = rgb.convert("RGBA")
        if "A" in image.getbands():
            rgba.putalpha(image.getchannel("A"))
        width, height = rgba.size
        source_pixels = rgba.load()
        key_red, key_green, key_blue = get_key_color(rgba)
        key_dominance = key_green - max(key_red, key_blue)
        transition = min(feather, max(1.0, key_dominance - threshold))
        output = bytearray(width * height * 4)
        offset = 0

        for y in range(height):
            for x in range(width):
                red, green, blue, source_alpha = source_pixels[x, y]
                dominance = green - max(red, blue)
                progress = min(1.0, max(0.0, (dominance - threshold) / transition))
                smooth = progress * progress * (3 - 2 * progress)
                alpha = source_alpha / 255 * (1 - smooth)

                if alpha <= 0.01:
                    output[offset] = output[offset + 1] = output[offset + 2] = output[
                        offset + 3
                    ] = 0
                    offset += 4
                    continue

                if alpha >= 0.995:
                    output[offset] = red
                    output[offset + 1] = green
                    output[offset + 2] = blue
                    output[offset + 3] = source_alpha
                    offset += 4
                    continue

                background = 1 - alpha
                foreground_red = round((red - background * key_red) / alpha)
                foreground_green = round((green - background * key_green) / alpha)
                foreground_blue = round((blue - background * key_blue) / alpha)
                foreground_red = min(255, max(0, foreground_red))
                foreground_blue = min(255, max(0, foreground_blue))
                foreground_green = min(
                    max(foreground_red, foreground_blue),
                    max(0, round(foreground_green)),
                )
                output[offset] = foreground_red
                output[offset + 1] = foreground_green
                output[offset + 2] = foreground_blue
                output[offset + 3] = round(alpha * 255)
                offset += 4

        Image.frombytes("RGBA", (width, height), output).save(
            destination, format="PNG", optimize=True
        )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Remove the green chroma key from the logo animation WebP frames."
    )
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--destination", type=Path, default=DEFAULT_DESTINATION)
    parser.add_argument("--threshold", type=int, default=5)
    parser.add_argument("--feather", type=int, default=64)
    args = parser.parse_args()

    if not 0 <= args.threshold <= 255:
        parser.error("--threshold must be between 0 and 255")
    if not 1 <= args.feather <= 255:
        parser.error("--feather must be between 1 and 255")
    if not args.source.is_dir():
        parser.error(f"Frame directory does not exist: {args.source}")
    if args.source.resolve() == args.destination.resolve():
        parser.error("Source and destination directories must be different")

    frames = []
    for path in args.source.iterdir():
        match = FRAME_PATTERN.fullmatch(path.name)
        if match:
            frames.append((int(match.group(1)), path))
    frames.sort()

    if not frames:
        parser.error(f"No frame_*.webp files found in {args.source}")
    if [index for index, _ in frames] != list(range(len(frames))):
        parser.error("Frame sequence must start at 0 and contain no numbering gaps")

    args.destination.mkdir(parents=True, exist_ok=True)
    expected_size = None
    for index, source in frames:
        with Image.open(source) as image:
            if expected_size is None:
                expected_size = image.size
            elif image.size != expected_size:
                parser.error(f"Unexpected frame size in {source.name}: {image.size}")
        destination = args.destination / f"frame_{index:06d}.png"
        process_frame(source, destination, args.threshold, args.feather)
        print(f"{index + 1}/{len(frames)}: {destination.name}")

    print(
        f"Processed {len(frames)} frames at {expected_size[0]}x{expected_size[1]} "
        f"into {args.destination}"
    )


if __name__ == "__main__":
    main()
