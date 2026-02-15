
echo "Call Cleaning..."
call .bin\app-clean.bat

echo "Call npminstall..."
call .bin\app-npminstall.bat

echo "---"
echo "Copia risorse..."
copy /Y "assets\*" "node_modules\primeng\resources\images\"

echo "Building..."
call ng build

echo "Fine"

