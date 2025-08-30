-- MySQL script to initialize the database schema for the modern spiritual chat SaaS

CREATE DATABASE IF NOT EXISTS mihrabir_aD14mi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mihrabir_aD14mi;

-- Users table stores both regular users and admins. Admins are distinguished by their email (e.g. admin@example.com).
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  token_balance INT NOT NULL DEFAULT 0,
  join_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active','blocked') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB;

-- Conversations table holds chats between a user and the AI (one conversation per topic/question thread).
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  marja_name VARCHAR(255),
  title VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Messages table stores individual messages exchanged in a conversation.
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  sender ENUM('user','ai') NOT NULL,
  text TEXT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('sending','sent','error') NOT NULL DEFAULT 'sent',
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Reports capture user feedback regarding AI responses. When a user reports or dislikes an answer, an entry is created here.
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ip VARCHAR(45),
  marja VARCHAR(255),
  conversation_id VARCHAR(36),
  feedback ENUM('liked','disliked','reported') NOT NULL DEFAULT 'liked',
  date DATE NOT NULL DEFAULT (CURRENT_DATE),
  report_text TEXT,
  category ENUM('incorrect','irrelevant','harmful','technical','other') DEFAULT 'other',
  refunded BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('new','reviewed') NOT NULL DEFAULT 'new',
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
) ENGINE=InnoDB;

-- Admin logs record significant actions taken by administrators (e.g. blocking a user, refunding a token).
CREATE TABLE IF NOT EXISTS admin_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_name VARCHAR(255) NOT NULL,
  action TEXT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Token packages define purchasable bundles of tokens. Users can buy these to increase their token balance.
CREATE TABLE IF NOT EXISTS token_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tokens INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  special BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;

-- Discount codes allow administrators to create limited‐use percentage or fixed discounts for token package purchases.
CREATE TABLE IF NOT EXISTS discount_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  value VARCHAR(10) NOT NULL,
  expiry DATE NOT NULL,
  usage_limit INT NOT NULL DEFAULT 0,
  used_count INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- Gift cards grant a fixed number of tokens. They may optionally be assigned to a user once used.
CREATE TABLE IF NOT EXISTS gift_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  tokens INT NOT NULL,
  used_by INT NULL,
  FOREIGN KEY (used_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- Transactions record purchases of token packages by users.
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  package_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','successful','failed') NOT NULL DEFAULT 'pending',
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (package_id) REFERENCES token_packages(id)
) ENGINE=InnoDB;

-- Suggested prompts provide pre–written questions that help users start conversations. Administrators can manage this list.
CREATE TABLE IF NOT EXISTS suggested_prompts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- Site administrators table contains the list of platform administrators and their roles.
CREATE TABLE IF NOT EXISTS site_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL
) ENGINE=InnoDB;