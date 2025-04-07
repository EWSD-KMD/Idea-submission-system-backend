import path from "path";
import multer from "multer";
import { dirname } from "node:path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const fileUpload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(__dirname, "..", "tmp"));
    },
    filename: (_, file, cb) => {
      if (file.originalname.length > 255) {
        // Throw an error if the file name is too long
        return cb(
          new Error(
            "File name exceeds the maximum allowed length of 255 characters."
          ),
          ""
        );
      }
      const uniqueSuffix =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        `-${file.originalname}`;
      cb(null, uniqueSuffix);
    },
  }),
});

export default fileUpload;
