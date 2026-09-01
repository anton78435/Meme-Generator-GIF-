# meme.py
# Meme Generator (GIF) на Python

import sys
import argparse
from PIL import Image, ImageDraw, ImageFont
import imageio
import os

def create_frame(image_path, top_text, bottom_text, font_size=40, color='#FFFFFF', frame_idx=0, total_frames=1, animate=False):
    img = Image.open(image_path).convert('RGB')
    draw = ImageDraw.Draw(img)
    
    # Загрузка шрифта
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    # Параметры текста
    color_rgb = tuple(int(color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    width, height = img.size
    
    # Если анимация, показываем только часть текста
    if animate and total_frames > 1:
        progress = frame_idx / (total_frames - 1)
        max_chars_top = max(1, int(len(top_text) * progress))
        max_chars_bottom = max(1, int(len(bottom_text) * progress))
        top_text_display = top_text[:max_chars_top]
        bottom_text_display = bottom_text[:max_chars_bottom]
    else:
        top_text_display = top_text
        bottom_text_display = bottom_text
    
    # Рисуем верхний текст
    if top_text_display:
        # Центрируем
        bbox = draw.textbbox((0,0), top_text_display, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (width - text_width) // 2
        y = 10
        draw.text((x, y), top_text_display, font=font, fill=color_rgb, stroke_width=2, stroke_fill='black')
    
    # Рисуем нижний текст
    if bottom_text_display:
        bbox = draw.textbbox((0,0), bottom_text_display, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (width - text_width) // 2
        y = height - text_height - 10
        draw.text((x, y), bottom_text_display, font=font, fill=color_rgb, stroke_width=2, stroke_fill='black')
    
    return img

def main():
    parser = argparse.ArgumentParser(description='Meme Generator (GIF)')
    parser.add_argument('-i', '--image', required=True, help='Входное изображение')
    parser.add_argument('-t', '--top', required=True, help='Верхний текст')
    parser.add_argument('-b', '--bottom', required=True, help='Нижний текст')
    parser.add_argument('-o', '--output', default='meme.gif', help='Выходной GIF')
    parser.add_argument('--font-size', type=int, default=40, help='Размер шрифта')
    parser.add_argument('--color', default='#FFFFFF', help='Цвет текста (HEX)')
    parser.add_argument('--animate', action='store_true', help='Создать анимацию')
    parser.add_argument('--frames', type=int, default=10, help='Количество кадров для анимации')
    args = parser.parse_args()

    if not os.path.exists(args.image):
        print(f"Ошибка: файл {args.image} не найден")
        sys.exit(1)

    frames = []
    total_frames = args.frames if args.animate else 1

    for i in range(total_frames):
        img = create_frame(args.image, args.top, args.bottom, args.font_size, args.color, i, total_frames, args.animate)
        frames.append(img)

    # Сохраняем как GIF
    imageio.mimsave(args.output, frames, duration=0.5)  # 0.5 сек между кадрами
    print(f"Мем сохранён в {args.output}")

if __name__ == '__main__':
    main()
