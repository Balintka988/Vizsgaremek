CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE TABLE cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Nincs státusz',
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    work_hours DECIMAL(5,2) NOT NULL
);

INSERT INTO services (name, description, price) VALUES
('Olajcsere', 'Motorolaj és olajszűrő cseréje, ellenőrzés', 12000),
('Fékbetét csere (első)', 'Fékbetétek cseréje, fékrendszer ellenőrzése', 15000),
('Féktárcsa csere (pár)', 'Fékbetétek és tárcsák cseréje, bejáratás', 25000),
('Futómű beállítás', 'Digitális futóműbeállítás, kormánygeometria', 14900),
('Diagnosztika', 'Hibakód olvasás, törlés, alapbeállítások', 6000),
('Vásárlás előtti csomag', 'Autó teljeskörű átvizsgálása', 18000);


CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    date DATETIME NOT NULL,
    note TEXT,
    service_id INT,
    hours DECIMAL(5,2),
    cost DECIMAL(10,2),
    description TEXT,
    note_to_client TEXT,
    status VARCHAR(50) DEFAULT 'Várakozik',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50),
    message TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read TINYINT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);