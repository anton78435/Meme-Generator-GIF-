// MemeGenerator.java
// Meme Generator (GIF) на Java

import java.awt.*;
import java.awt.image.*;
import java.io.*;
import javax.imageio.*;
import java.net.*;
import com.madgag.gif.AnimatedGifEncoder;

public class MemeGenerator {
    public static void main(String[] args) throws Exception {
        String imagePath = null;
        String topText = null;
        String bottomText = null;
        String output = "meme.gif";
        int fontSize = 40;
        String colorHex = "#FFFFFF";
        boolean animate = false;
        int frames = 10;

        for (int i = 0; i < args.length; i++) {
            if (args[i].equals("-i") || args[i].equals("--image")) {
                imagePath = args[++i];
            } else if (args[i].equals("-t") || args[i].equals("--top")) {
                topText = args[++i];
            } else if (args[i].equals("-b") || args[i].equals("--bottom")) {
                bottomText = args[++i];
            } else if (args[i].equals("-o") || args[i].equals("--output")) {
                output = args[++i];
            } else if (args[i].equals("--font-size")) {
                fontSize = Integer.parseInt(args[++i]);
            } else if (args[i].equals("--color")) {
                colorHex = args[++i];
            } else if (args[i].equals("--animate")) {
                animate = true;
            } else if (args[i].equals("--frames")) {
                frames = Integer.parseInt(args[++i]);
            } else if (args[i].equals("-h") || args[i].equals("--help")) {
                System.out.println("Использование: java MemeGenerator [опции]\n" +
                        "  -i, --image <файл>      Входное изображение\n" +
                        "  -t, --top <текст>       Верхний текст\n" +
                        "  -b, --bottom <текст>    Нижний текст\n" +
                        "  -o, --output <файл>     Выходной GIF\n" +
                        "  --font-size <размер>    Размер шрифта\n" +
                        "  --color <HEX>           Цвет текста\n" +
                        "  --animate               Анимация\n" +
                        "  --frames <число>        Количество кадров");
                return;
            }
        }

        if (imagePath == null || topText == null || bottomText == null) {
            System.err.println("Ошибка: требуются -i, -t, -b");
            System.exit(1);
        }

        // Читаем изображение
        BufferedImage img = ImageIO.read(new File(imagePath));
        if (img == null) {
            System.err.println("Не удалось прочитать изображение");
            System.exit(1);
        }

        // Парсим цвет
        Color textColor = Color.WHITE;
        if (!colorHex.equals("#FFFFFF")) {
            try {
                textColor = Color.decode(colorHex);
            } catch (Exception e) {}
        }

        int totalFrames = animate ? frames : 1;
        AnimatedGifEncoder encoder = new AnimatedGifEncoder();
        encoder.start(output);
        encoder.setRepeat(0);
        encoder.setDelay(500);

        for (int i = 0; i < totalFrames; i++) {
            BufferedImage frame = createFrame(img, topText, bottomText, fontSize, textColor, i, totalFrames, animate);
            encoder.addFrame(frame);
        }
        encoder.finish();
        System.out.println("Мем сохранён в " + output);
    }

    private static BufferedImage createFrame(BufferedImage img, String topText, String bottomText,
                                             int fontSize, Color color, int frameIdx, int totalFrames, boolean animate) {
        int width = img.getWidth();
        int height = img.getHeight();
        BufferedImage frame = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = frame.createGraphics();
        g.drawImage(img, 0, 0, null);

        // Шрифт
        Font font = new Font("Arial", Font.BOLD, fontSize);
        g.setFont(font);
        g.setColor(color);

        // Анимация
        String topDisplay = topText;
        String bottomDisplay = bottomText;
        if (animate && totalFrames > 1) {
            double progress = (double) frameIdx / (totalFrames - 1);
            int topLen = (int) Math.max(1, topText.length() * progress);
            int bottomLen = (int) Math.max(1, bottomText.length() * progress);
            topDisplay = topText.substring(0, Math.min(topLen, topText.length()));
            bottomDisplay = bottomText.substring(0, Math.min(bottomLen, bottomText.length()));
        }

        // Верхний текст
        if (!topDisplay.isEmpty()) {
            FontMetrics fm = g.getFontMetrics();
            int textWidth = fm.stringWidth(topDisplay);
            int x = (width - textWidth) / 2;
            int y = 10 + fm.getAscent();
            g.drawString(topDisplay, x, y);
        }

        // Нижний текст
        if (!bottomDisplay.isEmpty()) {
            FontMetrics fm = g.getFontMetrics();
            int textWidth = fm.stringWidth(bottomDisplay);
            int x = (width - textWidth) / 2;
            int y = height - 10 - fm.getDescent();
            g.drawString(bottomDisplay, x, y);
        }

        g.dispose();
        return frame;
    }
}
