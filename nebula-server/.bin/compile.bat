
echo "Cleaning..."
rmdir /S /Q dist

echo "Building..."
call tsc -b

echo "Copying node_modules..."
xcopy "node_modules" "dist\node_modules\" /E /H /I /Y

echo "Copying configurazion..."
copy .env dist\  /Y

echo "Fine"

