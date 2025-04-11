import QueryStream from "pg-query-stream";
import fastCsv from "fast-csv";
import pg from "pg";
const { Pool } = pg;
import archiver from "archiver";
import { PassThrough } from "stream";
import { ideaService } from "./idea.service.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class StreamingService {
  async streamIdeasToZip(res) {
    const client = await pool.connect();

    try {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="ideas_export.zip"'
      );

      // Create archiver and pipe to response
      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);

      // Create CSV stream
      const csvStream = fastCsv.format({ headers: true });
      const csvBuffer = new PassThrough();
      csvStream.pipe(csvBuffer);

      // Add CSV to archive directly
      archive.append(csvBuffer, { name: "ideas.csv" });

      // Stream ideas from DB
      const query = new QueryStream('SELECT * FROM "Idea"');
      const ideaStream = client.query(query);

      for await (const idea of ideaStream) {
        const { rows: files } = await pool.query(
          'SELECT * FROM "IdeaFile" WHERE "ideaId" = $1',
          [idea.id]
        );

        const fileObjs = files.map((file, index) => {
          return {
            fileUrl: `${process.env.FILE_PREVIEW_ROUTE}/${file.id}`,
            fileName: `${index}-${file.ideaId}-${file.fileName}`,
          };
        });

        const relatedLinks = fileObjs
          .map(
            (fileObj) =>
              `=HYPERLINK("${fileObj.fileUrl}", "${fileObj.fileName}")`
          )
          .join(" ; ");
        // Write CSV row
        csvStream.write({
          ...idea,
          related_files: relatedLinks,
        });

        // Add S3 files to zip
        await Promise.all(
          files.map(async (file, index) => {
            const { Body } = await ideaService.getIdeaFile(file.id);
            const localPath = `documents/${index}-${file.ideaId}-${file.fileName}`;
            archive.append(Body, { name: localPath });
          })
        );
      }

      csvStream.end(); // Will trigger csvBuffer 'end'
      csvBuffer.on("end", () => {
        archive.finalize(); // Finalize zip after all CSV data is in
      });

      ideaStream.on("end", () => {
        client.release();
      });

      ideaStream.on("error", (err) => {
        console.error("Stream error:", err);
        client.release();
        archive.abort();
        res.status(500).end();
      });
    } catch (err) {
      console.error("Export error:", err);
      client.release();
      res.status(500).end();
    }
  }
}

export const streamService = new StreamingService();
