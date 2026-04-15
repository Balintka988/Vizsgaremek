
# Typescript module
.env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=jelszo
DB_NAME=autoszerviz
DB_PORT=3306
JWT_SECRET=nagyon_titkos

docker-kód létrehozáshoz:
docker run -p 3306:3306 --name autoszerviz-mysql -e MYSQL_ROOT_PASSWORD=jelszo -e MYSQL_DATABASE=autoszerviz -d mysql:latest

Alap felhasználók (jelszavak bcrypt-tel hash-elve)
admin@autoszerviz.local / admin123
bela@autoszerviz.local  / user123
anna@autoszerviz.local  / user123