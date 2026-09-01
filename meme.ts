// meme.ts
// Meme Generator (GIF) на TypeScript

import * as Jimp from 'jimp';
import { GIFEncoder } from 'gif-encoder';
import * as fs from 'fs';

interface Options {
    image: string;
    top: string;
    bottom: string;
    output?: string;
    fontSize?: number;
    color?: string;
    animate?: boolean;
    frames?: number;
}

async function createFrame(imagePath: string, topText: string, bottomText: string,
                           fontSize: number = 40, color: string = '#FFFFFF',
                           frameIdx: number = 0, totalFrames: number = 1,
                           animate: boolean = false): Promise<Jimp> {
    const image = await Jimp.read(imagePath);
    const img = image.clone();
    const width = img.bitmap.width;
    const height = img.bitmap.height;

    // Загрузка шрифта
    let font: Jimp.Font;
    if (fontSize <= 32) font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    else if (fontSize <= 64) font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    else font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);

    // Анимация
    let topDisplay = topText;
    let bottomDisplay = bottomText;
    if (animate && totalFrames > 1) {
        const progress = frameIdx / (totalFrames - 1);
        const topLen = Math.max(1, Math.floor(topText.length * progress));
        const bottomLen = Math.max(1, Math.floor(bottomText.length * progress));
        topDisplay = topText.substring(0, topLen);
        bottomDisplay = bottomText.substring(0, bottomLen);
    }

    // Верхний текст
    if (topDisplay) {
        const textWidth = Jimp.measureText(font, topDisplay);
        const textHeight = Jimp.measureTextHeight(font, topDisplay, width);
        const x = (width - textWidth) / 2;
        const y = 10;
        img.print(font, x, y, topDisplay);
    }

    // Нижний текст
    if (bottomDisplay) {
        const textWidth = Jimp.measureText(font, bottomDisplay);
        const textHeight = Jimp.measureTextHeight(font, bottomDisplay, width);
        const x = (width - textWidth) / 2;
        const y = height - textHeight - 10;
        img.print(font, x, y, bottomDisplay);
    }

    return img;
}

async function main() {
    const args = process.argv.slice(2);
    const options: Options = { image: '', top: '', bottom: '' };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-i' || arg === '--image') options.image = args[++i];
        else if (arg === '-t' || arg === '--top') options.top = args[++i];
        else if (arg === '-b' || arg === '--bottom') options.bottom = args[++i];
        else if (arg === '-o' || arg === '--output') options.output = args[++i];
        else if (arg === '--font-size') options.fontSize = parseInt(args[++i]);
        else if (arg === '--color') options.color = args[++i];
        else if (arg === '--animate') options.animate = true;
        else if (arg === '--frames') options.frames = parseInt(args[++i]);
        else if (arg === '-h' || arg === '--help') {
            console.log(`Использование: ts-node meme.ts [опции]
  -i, --image <файл>      Входное изображение
  -t, --top <текст>       Верхний текст
  -b, --bottom <текст>    Нижний текст
  -o, --output <файл>     Выходной GIF (по умолчанию meme.gif)
  --font-size <размер>    Размер шрифта (по умолчанию 40)
  --color <HEX>           Цвет текста (по умолчанию #FFFFFF)
  --animate               Создать анимацию
  --frames <число>        Количество кадров (по умолчанию 10)
  -h, --help              Справка`);
            process.exit(0);
        }
    }

    if (!options.image || !options.top || !options.bottom) {
        console.error('Ошибка: требуются -i, -t, -b');
        process.exit(1);
    }

    const output = options.output || 'meme.gif';
    const fontSize = options.fontSize || 40;
    const color = options.color || '#FFFFFF';
    const animate = options.animate || false;
    const totalFrames = animate ? (options.frames || 10) : 1;

    const encoder = new GIFEncoder(output);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setQuality(10);

    for (let i = 0; i < totalFrames; i++) {
        const img = await createFrame(options.image, options.top, options.bottom,
                                      fontSize, color, i, totalFrames, animate);
        const bitmap = img.bitmap;
        encoder.setDelay(500);
        encoder.addFrame(bitmap.data, bitmap.width, bitmap.height, 1);
    }
    encoder.finish();
    console.log(`Мем сохранён в ${output}`);
}

main().catch(console.error);
