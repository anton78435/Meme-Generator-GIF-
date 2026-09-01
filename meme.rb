# meme.rb
# Meme Generator (GIF) на Ruby

require 'optparse'
require 'mini_magick'

options = {
  output: 'meme.gif',
  font_size: 40,
  color: '#FFFFFF',
  animate: false,
  frames: 10
}

OptionParser.new do |opts|
  opts.banner = "Использование: ruby meme.rb [опции]"
  opts.on('-i', '--image FILE', 'Входное изображение') { |v| options[:image] = v }
  opts.on('-t', '--top TEXT', 'Верхний текст') { |v| options[:top] = v }
  opts.on('-b', '--bottom TEXT', 'Нижний текст') { |v| options[:bottom] = v }
  opts.on('-o', '--output FILE', 'Выходной GIF') { |v| options[:output] = v }
  opts.on('--font-size SIZE', Integer, 'Размер шрифта') { |v| options[:font_size] = v }
  opts.on('--color HEX', 'Цвет текста') { |v| options[:color] = v }
  opts.on('--animate', 'Создать анимацию') { options[:animate] = true }
  opts.on('--frames N', Integer, 'Количество кадров') { |v| options[:frames] = v }
  opts.on('-h', '--help', 'Справка') { puts opts; exit }
end.parse!

unless options[:image] && options[:top] && options[:bottom]
  $stderr.puts "Ошибка: требуются -i, -t, -b"
  exit 1
end

image = MiniMagick::Image.open(options[:image])
width = image.width
height = image.height
font_size = options[:font_size]
color = options[:color]

total_frames = options[:animate] ? options[:frames] : 1
frames = []

total_frames.times do |i|
  frame = MiniMagick::Image.open(options[:image])
  top_display = options[:top]
  bottom_display = options[:bottom]

  if options[:animate] && total_frames > 1
    progress = i.to_f / (total_frames - 1)
    top_len = [(options[:top].length * progress).ceil, 1].max
    bottom_len = [(options[:bottom].length * progress).ceil, 1].max
    top_display = options[:top][0...top_len]
    bottom_display = options[:bottom][0...bottom_len]
  end

  # Верхний текст
  frame.combine_options do |c|
    c.gravity 'North'
    c.pointsize font_size
    c.fill color
    c.font 'Arial'
    c.draw "text 0,20 '#{top_display}'" if top_display && !top_display.empty?
  end

  # Нижний текст
  frame.combine_options do |c|
    c.gravity 'South'
    c.pointsize font_size
    c.fill color
    c.font 'Arial'
    c.draw "text 0,20 '#{bottom_display}'" if bottom_display && !bottom_display.empty?
  end

  frames << frame
end

# Сохраняем как GIF
if total_frames == 1
  frames[0].write(options[:output])
else
  # Для анимации используем `convert` через MiniMagick
  # Создаём список файлов
  temp_files = []
  frames.each_with_index do |frame, idx|
    temp = Tempfile.new(['frame', '.gif'])
    frame.write(temp.path)
    temp_files << temp
  end

  # Объединяем в GIF
  # (упрощённо: используем system вызов convert)
  cmd = "convert -delay 50 -loop 0 #{temp_files.map(&:path).join(' ')} #{options[:output]}"
  system(cmd)

  temp_files.each(&:unlink)
end

puts "Мем сохранён в #{options[:output]}"
