-- DROP TABLE IF EXISTS Profile;
ALTER TABLE "Profile" RENAME TO "Profile_temp";
CREATE TABLE IF NOT EXISTS "Profile"(
		"userID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"nickName" TEXT,
		filename TEXT,
		image BLOB,
        visibility TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
INSERT INTO "Profile" SELECT * FROM "Profile_temp";
DROP TABLE "Profile_temp";