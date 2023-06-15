CREATE TABLE IF NOT EXISTS "Category" (
					"postID" INTEGER REFERENCES Post(postID), 
					"category" TEXT NOT NULL
					);