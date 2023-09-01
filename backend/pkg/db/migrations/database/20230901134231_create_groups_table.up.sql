CREATE TABLE IF NOT EXISTS "Groups" ( 
            "groupID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "creator"  TEXT,
            "title" TEXT,
            "description" TEXT,
           FOREIGN KEY(creator)REFERENCES Users(nickName)
           );