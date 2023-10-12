CREATE TABLE IF NOT EXISTS "PostViewers" (
						"viewerID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
                        "postID" INTEGER NOT NULL,
						"userName" TEXT NOT NULL,
                        FOREIGN KEY(postID)REFERENCES Posts(postID)
						);