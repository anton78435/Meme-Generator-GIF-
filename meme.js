// meme.js
// Meme Generator (GIF) на JavaScript (Node.js)

const Jimp = require('jimp');
const GIFEncoder = require('gif-encoder');
const fs = require('fs');
const path = require('path');

async function createFrame(imagePath, topText, bottomText, fontsize = 40, color = '#FFFFFF', frameIdx = 0, totalFrames = 1, animate = false) {
    const image = await Jimp.read(imagePath);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK); // базовый шрифт, но можно масштабировать
    // В Jimp сложно масштабировать шрифт, поэтому будем использовать растровый шрифт с изменением размера?
    // Проще: использовать draw методы с текстом, но Jimp не поддерживает произвольный шрифт.
    // Вместо этого будем использовать 'print' с шрифтом, который масштабируется.
    // Для простоты используем встроенный шрифт и масштабируем изображение.
    // Создадим временное изображение с текстом.
    const imgWidth = image.bitmap.width;
    const imgHeight = image.bitmap.height;
    
    // Используем Jimp для текста, но нам нужен шрифт, мы можем использовать загруженный шрифт.
    // Для простоты оставим как есть, но в демо можно использовать шрифт из файла.
    // Вместо этого используем метод print с font.
    // Для регулировки размера шрифта используем FONT_SANS_32_WHITE и т.д.
    let fontToUse;
    if (fontsize <= 32) fontToUse = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    else if (fontsize <= 64) fontToUse = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    else fontToUse = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    
    // Клонируем изображение
    const img = image.clone();
    
    // Определяем цвет
    const hexColor = Jimp.cssColorToHex(color);
    
    // Если анимация, обрезаем текст
    let topDisplay = topText;
    let bottomDisplay = bottomText;
    if (animate && totalFrames > 1) {
        const progress = frameIdx / (totalFrames - 1);
        const topLen = Math.max(1, Math.floor(topText.length * progress));
        const bottomLen = Math.max(1, Math.floor(bottomText.length * progress));
        topDisplay = topText.substring(0, topLen);
        bottomDisplay = bottomText.substring(0, bottomLen);
    }
    
    // Рисуем верхний текст
    if (topDisplay) {
        const textWidth = Jimp.measureText(fontToUse, topDisplay);
        const textHeight = Jimp.measureTextHeight(fontToUse, topDisplay, imgWidth);
        const x = (imgWidth - textWidth) / 2;
        const y = 10;
        img.print(fontToUse, x, y, topDisplay);
        // обводка не реализована в простом варианте
    }
    
    // Рисуем нижний текст
    if (bottomDisplay) {
        const textWidth = Jimp.measureText(fontToUse, bottomDisplay);
        const textHeight = Jimp.measureTextHeight(fontToUse, bottomDisplay, imgWidth);
        const x = (imgWidth - textWidth) / 2;
        const y = imgHeight - textHeight - 10;
        img.print(fontToUse, x, y, bottomDisplay);
    }
    
    return img;
}

async function main() {
    const args = process.argv.slice(2);
    let imagePath, topText, bottomText, output = 'meme.gif', fontSize = 40, color = '#FFFFFF', animate = false, frames = 10;
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-i' || arg === '--image') imagePath = args[++i];
        else if (arg === '-t' || arg === '--top') topText = args[++i];
        else if (arg === '-b' || arg === '--bottom') bottomText = args[++i];
        else if (arg === '-o' || arg === '--output') output = args[++i];
        else if (arg === '--font-size') fontSize = parseInt(args[++i]);
        else if (arg === '--color') color = args[++i];
        else if (arg === '--animate') animate = true;
        else if (arg === '--frames') frames = parseInt(args[++i]);
        else if (arg === '-h' || arg === '--help') {
            console.log(`Использование: node meme.js [опции]
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
    
    if (!imagePath || !topText || !bottomText) {
        console.error('Ошибка: требуются -i, -t, -b');
        process.exit(1);
    }
    
    const totalFrames = animate ? frames : 1;
    const encoder = new GIFEncoder(output);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setQuality(10);
    
    for (let i = 0; i < totalFrames; i++) {
        const img = await createFrame(imagePath, topText, bottomText, fontSize, color, i, totalFrames, animate);
        const bitmap = img.bitmap;
        encoder.setDelay(500);
        encoder.addFrame(bitmap.data, bitmap.width, bitmap.height, 1);
    }
    encoder.finish();
    console.log(`Мем сохранён в ${output}`);
}

main().catch(console.error);
