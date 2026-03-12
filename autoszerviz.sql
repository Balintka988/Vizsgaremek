CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role ENUM('user', 'admin') DEFAULT 'user'
);

-- Alap felhasználók (jelszavak bcrypt-tel hash-elve)
-- admin@autoszerviz.local / admin123
-- bela@autoszerviz.local  / user123
-- anna@autoszerviz.local  / user123
INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
(1, 'Admin', 'admin@autoszerviz.local', '$2b$10$j3d6wNBZB2iQDixwwXp3IeqHQ5lOj1WxJLK9v/sysWkjvmix1DW1e', '+36 30 111 1111', 'admin'),
(2, 'Kiss Béla', 'bela@autoszerviz.local', '$2b$10$4KPyUGfNf3aXpiyYIQqmtufSAvf2E4xAUO3M5Vn4PelZ0RU3wlXkm', '+36 20 222 2222', 'user'),
(3, 'Nagy Anna', 'anna@autoszerviz.local', '$2b$10$4KPyUGfNf3aXpiyYIQqmtufSAvf2E4xAUO3M5Vn4PelZ0RU3wlXkm', '+36 70 333 3333', 'user');

CREATE TABLE cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL,
    brand_group VARCHAR(50) DEFAULT 'atlagos',
    status VARCHAR(50) DEFAULT 'Nincs státusz',
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Alap autók
INSERT INTO cars (id, owner_id, license_plate, type, brand_group, status) VALUES
(1, 2, 'ABC-123', 'Volkswagen Golf', 'nemet', 'Várakozik'),
(2, 2, 'KLM-456', 'Suzuki Swift', 'olcso', 'Kész'),
(3, 3, 'XYZ-789', 'Toyota Corolla', 'atlagos', 'Folyamatban');
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    work_hours DECIMAL(5,2) NOT NULL
);

INSERT INTO services (name, price, work_hours) VALUES
('Olajcsere', 12000.00, 1.00),
('Fékbetét csere (első)', 15000.00, 1.20),
('Féktárcsa csere (pár)', 25000.00, 2.00),
('Futómű beállítás', 14900.00, 1.00),
('Diagnosztika', 6000.00, 0.50),
('Vásárlás előtti csomag', 18000.00, 1.50);


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

-- Random foglalások
INSERT INTO bookings (id, user_id, car_id, date, note, service_id, hours, cost, description, note_to_client, status) VALUES
(1, 2, 1, '2026-04-10 10:00:00', 'Reggel hozom, kulcs a recepción.', 1, NULL, NULL, NULL, NULL, 'Várakozik'),
(2, 2, 2, '2026-03-20 14:30:00', 'Fék recseg, nézzétek meg kérlek.', 2, 2.40, 25500.00, 'Első fékbetét csere + ellenőrzés.', 'Elkészült, átvehető.', 'Kész'),
(3, 3, 3, '2026-03-25 09:00:00', 'Fura hang a futóműből.', 4, 1.00, 14900.00, 'Futómű beállítás, próbakör.', 'Kérem jelezzenek, ha további hibát találnak.', 'Folyamatban');

CREATE TABLE booking_services (
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    PRIMARY KEY (booking_id, service_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Foglalás-szolgáltatás kapcsolatok 
INSERT INTO booking_services (booking_id, service_id) VALUES
(1, 1),
(1, 5),
(2, 2),
(2, 5),
(3, 4);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50),
    message TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read TINYINT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- értesítések
INSERT INTO notifications (user_id, type, message, date, is_read) VALUES
(2, 'booking', '[KLM-456] A foglalás elkészült, átvehető.', '2026-03-20 16:45:00', 0),
(3, 'info', '[XYZ-789] A munkát megkezdtük.', '2026-03-25 09:30:00', 0);