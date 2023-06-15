CREATE TABLE IF NOT EXISTS "Followers" (
						"userID" INTEGER, 
						"followerID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
						"followerFName" TEXT NOT NULL,
						"followerLName" TEXT NOT NULL,
						"influencerFName" TEXT NOT NULL,
						"influencerLName" TEXT NOT NULL,
						"accepted" TEXT,
						"unfollow" TEXT,
						FOREIGN KEY(userID)REFERENCES Users(id),
						FOREIGN KEY(followerID)REFERENCES Users(id)
						);