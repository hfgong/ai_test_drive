%
O0002 (iPhone Phone Case)
N10 G21 (Set units to millimeters)
N20 G17 (Select XY plane)
N30 G90 (Absolute programming)
N40 G54 (Use work coordinate system)

(Select Tool)
N50 T1 M06 (Select Tool 1 and change tool)
N60 S1500 M03 (Spindle on clockwise at 1500 RPM)

(Machining outer rounded corners)
N70 G00 X0 Y0 Z5 (Rapid move to above bottom-left corner of workpiece)
N80 G01 Z-2 F100 (Feed down to Z=-2mm at 100 mm/min)

(Machining outer contour, clockwise direction)
N90 G01 X150 Y0 F300 (Feed along X-axis)
N100 G03 X160 Y10 I0 J10 (Arc to X160 Y10 with radius 10mm)
N110 G01 Y70 (Feed along Y-axis)
N120 G03 X150 Y80 I-10 J0 (Arc to X150 Y80 with radius 10mm)
N130 G01 X10 (Feed back along X-axis)
N140 G03 X0 Y70 I0 J-10 (Arc to X0 Y70 with radius 10mm)
N150 G01 Y10 (Feed back along Y-axis)
N160 G03 X10 Y0 I10 J0 (Arc to X10 Y0 with radius 10mm)

(Raise the tool)
N170 G00 Z5 (Rapid raise tool)

(Machining inner cavity)
N180 G00 X5 Y5 Z5 (Rapid move to near bottom-left corner)

(Start hollowing)
N190 G01 Z-78 F100 (Feed down to Z=-78mm at 100 mm/min)

(Hollowing inner cavity, clockwise direction)
N200 G01 X145 Y5 F300 (Feed along X-axis)
N210 G03 X155 Y15 I0 J10 (Arc to X155 Y15 with radius 10mm)
N220 G01 Y65 (Feed along Y-axis)
N230 G03 X145 Y75 I-10 J0 (Arc to X145 Y75 with radius 10mm)
N240 G01 X15 (Feed back along X-axis)
N250 G03 X5 Y65 I0 J-10 (Arc to X5 Y65 with radius 10mm)
N260 G01 Y15 (Feed back along Y-axis)
N270 G03 X15 Y5 I10 J0 (Arc to X15 Y5 with radius 10mm)

(Clear remaining material inside)
N280 G01 Z5 (Raise tool)
N290 G00 X10 Y10 (Rapid move to next position)
N300 G01 Z-78 F100 (Feed down)
N310 G01 X140 (Feed along X-axis)
N320 G01 Y65 (Feed along Y-axis)
N330 G01 X10 (Feed back along X-axis)
N340 G01 Y10 (Feed back along Y-axis)
N350 G01 Z5 (Raise tool)

(Finish hollowing)
N360 M05 (Spindle stop)
N370 G00 X0 Y0 (Return to origin)
N380 M30 (End program and reset)
%
