CREATE DATABASE cloudUnify;

/c cloudUnify;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE google_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  access_token VARCHAR(255) NOT NULL,
  refresh_token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
