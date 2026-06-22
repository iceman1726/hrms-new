-- No CREATE DATABASE or USE lines here

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('hr', 'coordinator', 'teamleader', 'employee') NOT NULL,
    employee_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position ENUM('TL','LINEMAN','DRIVER','HELPER') NOT NULL,
    department VARCHAR(50),
    daily_rate DECIMAL(10,2),
    monthly_rate DECIMAL(10,2),
    status ENUM('Active','On Leave','Probationary','Inactive') DEFAULT 'Active',
    start_date DATE,
    prob_end_date DATE
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    timestamp DATETIME NOT NULL,
    method ENUM('Fingerprint','Facial recognition') NOT NULL,
    is_adjusted BOOLEAN DEFAULT FALSE,
    original_timestamp DATETIME NULL,
    adjusted_by INT NULL,
    reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    reason TEXT,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Job orders table
CREATE TABLE IF NOT EXISTS job_orders (
    id VARCHAR(20) PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    start_date DATE,
    assigned_team VARCHAR(50),
    status ENUM('Pending','Dispatched','In Progress','For Validation','Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deployments table
CREATE TABLE IF NOT EXISTS deployments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_order_id VARCHAR(20) NOT NULL,
    shift ENUM('morning','night') NOT NULL,
    team_name VARCHAR(50),
    status ENUM('Active','Completed','For Validation') DEFAULT 'Active',
    before_photo VARCHAR(255) NULL,
    after_photo VARCHAR(255) NULL,
    completion_notes TEXT,
    submitted_at DATETIME NULL,
    validated_by_hr BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (job_order_id) REFERENCES job_orders(id) ON DELETE CASCADE
);

INSERT INTO users (username, password, role, employee_id) VALUES
('hr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hr', NULL),
('coordinator', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coordinator', NULL),
('teamleader', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teamleader', NULL),
('employee1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 1);