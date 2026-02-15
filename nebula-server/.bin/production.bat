
call .bin\clean-all.bat
call npm install --production
call tsc -b
xcopy "node_modules" "dist\node_modules\" /E /H /I /Y
copy .env dist\  /Y

