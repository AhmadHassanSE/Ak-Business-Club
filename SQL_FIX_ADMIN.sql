-- Run this SQL in Railway PostgreSQL console to fix admin password
-- This deletes the old admin user with plain text password and the entry will be recreated on next app restart

DELETE FROM users WHERE username = 'admin';

-- After running this, restart your Railway app and it will auto-seed a new admin user with proper hashing
-- Login with: username=admin, password=admin123
