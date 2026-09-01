<?php
// meme.php
// Meme Generator (GIF) на PHP

if (php_sapi_name() !== 'cli') {
    die("Это консольное приложение.\n");
}

$shortOpts = "i:t:b:o:h";
$longOpts = ['image:', 'top:', 'bottom:', 'output:', 'font-size:', 'color:', 'animate', 'frames:', 'help'];
$options = getopt($shortOpts, $longOpts);

$help = isset($options['h']) || isset($options['help']);
if ($help) {
    echo "Использование: php meme.php [опции]\n";
    echo "  -i, --image <файл>      Входное изображение\n";
    echo "  -t, --top <текст>       Верхний текст\n";
    echo "  -b, --bottom <текст>    Нижний текст\n";
    echo "  -o, --output <файл>     Выходной GIF (по умолчанию meme.gif)\n";
    echo "  --font-size <размер>    Размер шрифта (по умолчанию 40)\n";
    echo "  --color <HEX>           Цвет текста (по умолчанию #FFFFFF)\n";
    echo "  --animate               Создать анимацию\n";
    echo "  --frames <число>        Количество кадров (по умолчанию 10)\n";
    echo "  -h, --help              Справка\n";
    exit(0);
}

$image = $options['i'] ?? $options['image'] ?? null;
$top = $options['t'] ?? $options['top'] ?? null;
$bottom = $options['b'] ?? $options['bottom'] ?? null;
$output = $options['o'] ?? $options['output'] ?? 'meme.gif';
$fontSize = $options['font-size'] ?? 40;
$color = $options['color'] ?? '#FFFFFF';
$animate = isset($options['animate']);
$frames = isset($options['frames']) ? (int)$options['frames'] : 10;

if (!$image || !$top || !$bottom) {
    fwrite(STDERR, "Ошибка: требуются -i, -t, -b\n");
    exit(1);
}

// Проверка Imagick
if (!extension_loaded('imagick')) {
    fwrite(STDERR, "Ошибка: расширение imagick не загружено\n");
    exit(1);
}

try {
    $img = new Imagick($image);
} catch (Exception $e) {
    fwrite(STDERR, "Ошибка чтения изображения: " . $e->getMessage() . "\n");
    exit(1);
}

$width = $img->getImageWidth();
$height = $img->getImageHeight();

$totalFrames = $animate ? $frames : 1;
$gif = new Imagick();
$gif->setFormat('gif');

for ($i = 0; $i < $totalFrames; $i++) {
    $frame = clone $img;
    $draw = new ImagickDraw();
    $draw->setFillColor($color);
    $draw->setFontSize($fontSize);
    $draw->setFont('Arial');
    $draw->setGravity(Imagick::GRAVITY_NORTH);

    $topDisplay = $top;
    $bottomDisplay = $bottom;
    if ($animate && $totalFrames > 1) {
        $progress = $i / ($totalFrames - 1);
        $topLen = max(1, (int)(strlen($top) * $progress));
        $bottomLen = max(1, (int)(strlen($bottom) * $progress));
        $topDisplay = mb_substr($top, 0, min($topLen, strlen($top)));
        $bottomDisplay = mb_substr($bottom, 0, min($bottomLen, strlen($bottom)));
    }

    // Верхний текст
    if ($topDisplay) {
        $frame->annotateImage($draw, 0, 20, 0, $topDisplay);
    }

    // Нижний текст
    if ($bottomDisplay) {
        $draw->setGravity(Imagick::GRAVITY_SOUTH);
        $frame->annotateImage($draw, 0, 20, 0, $bottomDisplay);
    }

    $frame->setImageDelay(50); // 0.5 сек
    $gif->addImage($frame);
    $frame->destroy();
}

$gif->setImageIterations(0);
$gif->writeImages($output, true);
$gif->destroy();
$img->destroy();

echo "Мем сохранён в $output\n";
