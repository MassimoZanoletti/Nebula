
rmdir /S /Q  dist
call ng build -c production
echo "Copia .htaccess"
copy src\.htaccess dist\bbs\browser

