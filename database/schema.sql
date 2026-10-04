CREATE DATABASE IF NOT EXISTS college_complaint_management;
USE college_complaint_management;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(120) NOT NULL,
  year TINYINT UNSIGNED NOT NULL,
  phone VARCHAR(25),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  category ENUM('Academic','Faculty','Infrastructure','Hostel','Library','Laboratory','Transport','Canteen','Examination','Fees','IT/Technical','Other') NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('Pending','Under Review','In Progress','Resolved','Rejected','Closed') NOT NULL DEFAULT 'Pending',
  assigned_department VARCHAR(120),
  due_date DATE NULL,
  admin_remarks TEXT,
  attachment VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  CONSTRAINT fk_complaint_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_complaint_status (status),
  INDEX idx_complaint_category (category),
  INDEX idx_complaint_created (created_at)
);

CREATE TABLE IF NOT EXISTS complaint_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  admin_id INT NOT NULL,
  old_status VARCHAR(30),
  new_status VARCHAR(30),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_update_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  CONSTRAINT fk_update_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE RESTRICT
);

-- Create the first admin after registering a password hash through the application or bcrypt.
-- Example: INSERT INTO admins (name, email, password, department) VALUES ('Portal Admin', 'admin@college.edu', '<bcrypt-hash>', 'Administration');