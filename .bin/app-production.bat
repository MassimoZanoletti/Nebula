
rmdir /S /Q  dist
call ng build -c production --base-href /code/bbs/
echo "Copia .htaccess"
copy src\.htaccess dist\bbs\browser

