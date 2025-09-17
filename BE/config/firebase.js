require('dotenv').config();
const admin = require('firebase-admin');


exports.getFirebaseDB = (storageIndex = 0) => {
  let app;
  const appNameDefault = "[DEFAULT]";
  if (admin.apps.some(existingApp => existingApp.name === appNameDefault)) {
    app = admin.app(appNameDefault);
  } else {
    app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: "http://127.0.0.1:9000/?ns=hopejapaneseshiken",
    }, appNameDefault);
  }


  return app.database();
}

exports.getCustomTokenByUserId = async (userId, storageIndex = 0) => {
  try {
    const app = getApp(storageIndex);
    const customToken = await app.auth().createCustomToken(userId, claims);
    return customToken;
  } catch (error) {
    console.error('Error creating custom token:', error);
  }
}

exports.getBucket = (storageIndex = 0) => {
  const app = getApp(storageIndex);
  return app.storage().bucket();
}

exports.uploadFile = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(file);
      const bucket = getApp(0).storage().bucket();

      // Unique path
      const blob = bucket.file(file.originalname);

      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      blobStream.on("error", (err) => reject(err));

      blobStream.on("finish", async () => {
        try {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          resolve(publicUrl);
        } catch (err) {
          reject(err);
        }
      });

      blobStream.end(file.buffer);
    } catch (error) {
      reject(error);
    }
  });
};
