-- Seed a mock user with password "password123" (BCrypt hash)
INSERT INTO app_user (email, password_hash, role) 
VALUES ('test@example.com', '$2a$10$fNb.npcg6Xfh1bMgEcdAn.AnwgG1XmUbqXdSCLYwl3Et8Ni1Y4j.O', 'USER');

-- Seed mock transactions for this user
INSERT INTO transaction (user_id, merchant_name, amount, posted_date) VALUES 
(1, 'Uber Rides', 24.50, '2024-03-01 09:15:00'),
(1, 'Amazon.com', 129.99, '2024-03-02 14:30:00'),
(1, 'Starbucks', 5.75, '2024-03-03 08:45:00'),
(1, 'Netflix Subscription', 15.99, '2024-03-04 12:00:00'),
(1, 'Target Store', 85.20, '2024-03-05 18:20:00'),
(1, 'Spotify', 9.99, '2024-03-06 10:10:00'),
(1, 'Uber Eats', 35.50, '2024-03-07 19:45:00'),
(1, 'Whole Foods', 150.25, '2024-03-08 16:30:00'),
(1, 'Chevron Gas', 45.00, '2024-03-09 11:25:00'),
(1, 'Apple Store', 999.00, '2024-03-10 13:50:00'),
(1, 'Steam Games', 59.99, '2024-03-11 20:15:00'),
(1, 'Local Bakery', 12.50, '2024-03-12 09:30:00');
