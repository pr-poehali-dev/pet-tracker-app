CREATE TABLE t_p83045439_pet_tracker_app.articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Общее',
  emoji VARCHAR(10) NOT NULL DEFAULT '🐾',
  author VARCHAR(100) NOT NULL DEFAULT 'Редакция',
  published_at TIMESTAMP DEFAULT NOW(),
  views INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE
);

CREATE TABLE t_p83045439_pet_tracker_app.comments (
  id SERIAL PRIMARY KEY,
  article_id INT NOT NULL,
  user_id INT,
  author_phone VARCHAR(20),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p83045439_pet_tracker_app.user_stories (
  id SERIAL PRIMARY KEY,
  user_id INT,
  author_phone VARCHAR(20),
  pet_name VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  story TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
