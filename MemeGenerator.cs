// MemeGenerator.cs
// Meme Generator (GIF) на C#

using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using AnimatedGif;

class MemeGenerator
{
    static void Main(string[] args)
    {
        string imagePath = null;
        string topText = null;
        string bottomText = null;
        string output = "meme.gif";
        int fontSize = 40;
        Color color = Color.White;
        bool animate = false;
        int frames = 10;

        for (int i = 0; i < args.Length; i++)
        {
            if (args[i] == "-i" || args[i] == "--image") imagePath = args[++i];
            else if (args[i] == "-t" || args[i] == "--top") topText = args[++i];
            else if (args[i] == "-b" || args[i] == "--bottom") bottomText = args[++i];
            else if (args[i] == "-o" || args[i] == "--output") output = args[++i];
            else if (args[i] == "--font-size") fontSize = int.Parse(args[++i]);
            else if (args[i] == "--color")
            {
                string hex = args[++i];
                color = ColorTranslator.FromHtml(hex);
            }
            else if (args[i] == "--animate") animate = true;
            else if (args[i] == "--frames") frames = int.Parse(args[++i]);
            else if (args[i] == "-h" || args[i] == "--help")
            {
                Console.WriteLine(@"Использование: MemeGenerator [опции]
  -i, --image <файл>      Входное изображение
  -t, --top <текст>       Верхний текст
  -b, --bottom <текст>    Нижний текст
  -o, --output <файл>     Выходной GIF
  --font-size <размер>    Размер шрифта
  --color <HEX>           Цвет текста
  --animate               Анимация
  --frames <число>        Количество кадров");
                return;
            }
        }

        if (string.IsNullOrEmpty(imagePath) || string.IsNullOrEmpty(topText) || string.IsNullOrEmpty(bottomText))
        {
            Console.WriteLine("Ошибка: требуются -i, -t, -b");
            Environment.Exit(1);
        }

        using (Image img = Image.FromFile(imagePath))
        {
            int totalFrames = animate ? frames : 1;
            using (var gif = AnimatedGif.AnimatedGif.Create(output, 50))
            {
                for (int i = 0; i < totalFrames; i++)
                {
                    using (Bitmap frame = CreateFrame(img, topText, bottomText, fontSize, color, i, totalFrames, animate))
                    {
                        gif.AddFrame(frame, delay: 500);
                    }
                }
            }
        }
        Console.WriteLine($"Мем сохранён в {output}");
    }

    static Bitmap CreateFrame(Image img, string topText, string bottomText, int fontSize, Color color,
                              int frameIdx, int totalFrames, bool animate)
    {
        Bitmap bitmap = new Bitmap(img.Width, img.Height);
        using (Graphics g = Graphics.FromImage(bitmap))
        {
            g.DrawImage(img, 0, 0, img.Width, img.Height);
            using (Font font = new Font("Arial", fontSize, FontStyle.Bold))
            {
                string topDisplay = topText;
                string bottomDisplay = bottomText;
                if (animate && totalFrames > 1)
                {
                    double progress = (double)frameIdx / (totalFrames - 1);
                    int topLen = (int)Math.Max(1, topText.Length * progress);
                    int bottomLen = (int)Math.Max(1, bottomText.Length * progress);
                    topDisplay = topText.Substring(0, Math.Min(topLen, topText.Length));
                    bottomDisplay = bottomText.Substring(0, Math.Min(bottomLen, bottomText.Length));
                }

                // Верхний текст
                if (!string.IsNullOrEmpty(topDisplay))
                {
                    SizeF size = g.MeasureString(topDisplay, font);
                    float x = (img.Width - size.Width) / 2;
                    float y = 10;
                    g.DrawString(topDisplay, font, new SolidBrush(color), x, y);
                }

                // Нижний текст
                if (!string.IsNullOrEmpty(bottomDisplay))
                {
                    SizeF size = g.MeasureString(bottomDisplay, font);
                    float x = (img.Width - size.Width) / 2;
                    float y = img.Height - size.Height - 10;
                    g.DrawString(bottomDisplay, font, new SolidBrush(color), x, y);
                }
            }
        }
        return bitmap;
    }
}
