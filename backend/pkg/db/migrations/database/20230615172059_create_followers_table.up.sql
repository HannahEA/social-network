CREATE TABLE IF NOT EXISTS "Followers" (
						"follow" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
						"followerID" INTEGER NOT NULL,
						"followerUserName" TEXT NOT NULL,
						"influencerID" INTEGER NOT NULL,
						"influencerUserName" TEXT NOT NULL,
						"accepted" TEXT,
						FOREIGN KEY(followerUserName)REFERENCES Users(nickName),
						FOREIGN KEY(influencerUserName)REFERENCES Users(nickName)
						);