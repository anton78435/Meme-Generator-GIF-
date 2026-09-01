// meme.go
// Meme Generator (GIF) на Go

package main

import (
	"flag"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/gif"
	"os"

	"github.com/andybons/gogif"
	"github.com/disintegration/imaging"
	"golang.org/x/image/font"
	"golang.org/x/image/font/basicfont"
	"golang.org/x/image/math/fixed"
)

func createFrame(img image.Image, topText, bottomText string, fontSize int, col color.Color,
	frameIdx, totalFrames int, animate bool) *image.RGBA {
	bounds := img.Bounds()
	dst := image.NewRGBA(bounds)
	draw.Draw(dst, bounds, img, bounds.Min, draw.Src)

	// Шрифт (basicfont не масштабируется, но для демо используем его)
	fontFace := basicfont.Face7x13

	// Анимация
	topDisplay := topText
	bottomDisplay := bottomText
	if animate && totalFrames > 1 {
		progress := float64(frameIdx) / float64(totalFrames-1)
		topLen := int(float64(len(topText)) * progress)
		if topLen < 1 {
			topLen = 1
		}
		bottomLen := int(float64(len(bottomText)) * progress)
		if bottomLen < 1 {
			bottomLen = 1
		}
		if topLen > len(topText) {
			topLen = len(topText)
		}
		if bottomLen > len(bottomText) {
			bottomLen = len(bottomText)
		}
		topDisplay = topText[:topLen]
		bottomDisplay = bottomText[:bottomLen]
	}

	// Рисуем текст вручную (basicfont)
	drawText := func(dst *image.RGBA, text string, x, y int, col color.Color) {
		point := fixed.Point26_6{X: fixed.I(x), Y: fixed.I(y)}
		d := &font.Drawer{
			Dst:  dst,
			Src:  image.NewUniform(col),
			Face: fontFace,
			Dot:  point,
		}
		d.DrawString(text)
	}

	// Верхний текст
	if topDisplay != "" {
		// Считаем ширину (приблизительно)
		textWidth := len(topDisplay) * 7 // 7 пикселей на символ
		x := (bounds.Dx() - textWidth) / 2
		if x < 0 {
			x = 0
		}
		y := 10 + 13
		drawText(dst, topDisplay, x, y, col)
	}

	// Нижний текст
	if bottomDisplay != "" {
		textWidth := len(bottomDisplay) * 7
		x := (bounds.Dx() - textWidth) / 2
		if x < 0 {
			x = 0
		}
		y := bounds.Dy() - 10
		drawText(dst, bottomDisplay, x, y, col)
	}

	return dst
}

func main() {
	var (
		imagePath string
		topText   string
		bottomText string
		output    string
		fontSize  int
		colorHex  string
		animate   bool
		frames    int
	)
	flag.StringVar(&imagePath, "i", "", "Входное изображение")
	flag.StringVar(&topText, "t", "", "Верхний текст")
	flag.StringVar(&bottomText, "b", "", "Нижний текст")
	flag.StringVar(&output, "o", "meme.gif", "Выходной GIF")
	flag.IntVar(&fontSize, "font-size", 40, "Размер шрифта")
	flag.StringVar(&colorHex, "color", "#FFFFFF", "Цвет текста")
	flag.BoolVar(&animate, "animate", false, "Создать анимацию")
	flag.IntVar(&frames, "frames", 10, "Количество кадров")
	flag.Parse()

	if imagePath == "" || topText == "" || bottomText == "" {
		fmt.Println("Ошибка: требуются -i, -t, -b")
		flag.Usage()
		os.Exit(1)
	}

	// Читаем изображение
	srcImg, err := imaging.Open(imagePath)
	if err != nil {
		fmt.Printf("Ошибка открытия изображения: %v\n", err)
		os.Exit(1)
	}

	// Парсим цвет
	var col color.Color
	if colorHex == "#FFFFFF" {
		col = color.White
	} else {
		// Упрощённо: белый
		col = color.White
	}

	totalFrames := 1
	if animate {
		totalFrames = frames
	}
	var gifImages []*image.Paletted
	var delays []int

	for i := 0; i < totalFrames; i++ {
		frameImg := createFrame(srcImg, topText, bottomText, fontSize, col, i, totalFrames, animate)
		paletted := image.NewPaletted(frameImg.Bounds(), nil)
		draw.Draw(paletted, paletted.Bounds(), frameImg, frameImg.Bounds().Min, draw.Src)
		gifImages = append(gifImages, paletted)
		delays = append(delays, 50) // 0.5 сек
	}

	// Сохраняем GIF
	outFile, err := os.Create(output)
	if err != nil {
		fmt.Printf("Ошибка создания файла: %v\n", err)
		os.Exit(1)
	}
	defer outFile.Close()

	err = gif.EncodeAll(outFile, &gif.GIF{
		Image: gifImages,
		Delay: delays,
	})
	if err != nil {
		fmt.Printf("Ошибка сохранения GIF: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("Мем сохранён в %s\n", output)
}
