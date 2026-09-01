Репозиторий Meme Generator (GIF)
Описание
Meme Generator (GIF) – это набор консольных утилит на 8 языках программирования для создания мемов с анимацией. Программа накладывает верхний и нижний текст на изображение и сохраняет результат в GIF-формате (анимированный или статичный). Поддерживаются настройки шрифта, цвета текста, размера и позиции.

Возможности
Наложение текста – добавление верхнего и нижнего текста на изображение.

Настройка параметров – размер шрифта, цвет текста, положение (отступы) через аргументы командной строки.

Создание GIF – возможность создать анимированный GIF с покадровым появлением текста (эффект печати).

Формат вывода – GIF-файл с высоким качеством.

Пакетный режим – работа через аргументы командной строки.

Структура репозитория
text
meme-generator/
├── README.md
├── meme.py          (Python)
├── meme.js          (JavaScript / Node.js)
├── meme.ts          (TypeScript)
├── meme.go          (Go)
├── MemeGenerator.java (Java)
├── MemeGenerator.cs   (C#)
├── meme.php         (PHP)
└── meme.rb          (Ruby)
Установка и запуск
Для работы требуются соответствующие библиотеки (указаны в README). Установите их перед запуском.

Язык	Зависимости	Команда запуска
Python	Pillow (pip install Pillow), imageio (pip install imageio)	python meme.py [опции]
JavaScript	Node.js 14+, npm install jimp gif-encoder	node meme.js [опции]
TypeScript	Node.js + ts-node, npm install jimp gif-encoder	ts-node meme.ts [опции]
Go	Go 1.18+, библиотеки github.com/disintegration/imaging, github.com/andybons/gogif	go run meme.go [опции]
Java	JDK 11+, библиотека AnimatedGifEncoder (скачать .jar)	javac -cp .:animated-gif-encoder.jar MemeGenerator.java && java -cp .:animated-gif-encoder.jar MemeGenerator [опции]
C#	.NET SDK 6.0+, пакет System.Drawing.Common, AnimatedGif	dotnet run
PHP	PHP 8.0+, расширение imagick	php meme.php [опции]
Ruby	Ruby 2.7+, gem mini_magick	ruby meme.rb [опции]
Использование
text
meme [опции] -i <изображение> -t <верхний текст> -b <нижний текст> [-o <выходной файл>] [--font-size <размер>] [--color <цвет>]
Опции
Опция	Описание
-i, --image	Путь к входному изображению (обязательно).
-t, --top	Верхний текст (обязательно).
-b, --bottom	Нижний текст (обязательно).
-o, --output	Путь к выходному GIF-файлу (по умолчанию meme.gif).
--font-size	Размер шрифта (по умолчанию 40).
--color	Цвет текста в HEX (по умолчанию #FFFFFF).
--animate	Создать анимированный GIF с эффектом печати (по умолчанию выключено).
--frames	Количество кадров для анимации (по умолчанию 10).
-h, --help	Показать справку.
Примеры
bash
# Создать статичный мем
python meme.py -i input.jpg -t "Top text" -b "Bottom text" -o output.gif

# Создать анимированный мем
python meme.py -i input.jpg -t "Hello" -b "World" --animate --frames 15
Лицензия
MIT
