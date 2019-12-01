gnuplot -persist <<-EOFMarker
	set yrange [0:8]
	set xlabel "Miss Rate" font 'times.ttf,18'
	set ylabel "Delay" font 'times.ttf,18'
	set grid
	set xtics font 'times.ttf,10'
	set ytics font 'times.ttf,10'
	set key bottom at 90, 7 font 'times.ttf,18'
	plot "localroot" using 1:2 w lp pt 5 title "localroot", "recursive" using 1:2 w lp pt 7 title "normal"
	set terminal postscript eps color
	#set output "./output rate.eps"
	replot
	set output
EOFMarker