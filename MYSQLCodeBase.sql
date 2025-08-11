CREATE DATABASE offer_alert_system;

USE offer_alert_system;

show tables;

-- Create a 'users' table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY, 
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('administrator', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from users;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    url VARCHAR(2048),
    image_url VARCHAR(2048),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id VARCHAR(36),
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

select * from products;

CREATE TABLE product_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    start_date DATE,
    end_date DATE,
    alerts_enabled BOOLEAN DEFAULT TRUE,
    is_offer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

select * from product_sources;


CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

select * from categories;


USE offer_alert_system;

CREATE TABLE calculator_settings (
  id INT PRIMARY KEY DEFAULT 1, -- Only one row of settings
  platform_commission DECIMAL(5, 2) DEFAULT 9.00,
  vat_rate DECIMAL(5, 2) DEFAULT 20.00,
  shipping_threshold DECIMAL(10, 2) DEFAULT 22.00,
  shipping_fee DECIMAL(10, 2) DEFAULT 2.29,
  full_shipping_cost DECIMAL(10, 2) DEFAULT 3.99,
  creator_commission DECIMAL(5, 2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(36),
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert the first row of default settings
INSERT INTO calculator_settings (id) VALUES (1);

select * from calculator_settings;


-- Linking Category with products
ALTER TABLE products
ADD COLUMN category_id INT NULL,
ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;






