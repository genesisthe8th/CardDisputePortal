-- Seed an admin user with password "password123" (BCrypt hash)
INSERT INTO app_user (email, password_hash, role) 
VALUES ('admin@example.com', '$2a$10$fNb.npcg6Xfh1bMgEcdAn.AnwgG1XmUbqXdSCLYwl3Et8Ni1Y4j.O', 'ADMIN')
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN', password_hash = '$2a$10$fNb.npcg6Xfh1bMgEcdAn.AnwgG1XmUbqXdSCLYwl3Et8Ni1Y4j.O';
