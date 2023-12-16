DROP TABLE IF EXISTS membership CASCADE;
CREATE TABLE membership (
  id SERIAL PRIMARY KEY NOT NULL,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  preferred_movie_1 VARCHAR(250),
  preferred_movie_2 VARCHAR(250),
  preferred_movie_3 VARCHAR(250),
  voted_movie VARCHAR(250),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);