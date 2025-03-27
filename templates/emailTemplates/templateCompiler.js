import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";

const __dirname = dirname(fileURLToPath(import.meta.url));

function compileTemplate(bodyTemplateFileName) {
  console.log(__dirname);
  const themeTemplatePath = resolve(__dirname, "themeTemplate.html");

  const themeTemplateContent = readFileSync(themeTemplatePath, "utf-8");
  const bodyTemplatePath = resolve(
    __dirname,
    `../emailTemplates/bodyTemplates/${bodyTemplateFileName}`
  );

  const bodyTemplate = resolve(__dirname, bodyTemplatePath);

  const bodyContent = readFileSync(bodyTemplate, "utf-8");

  const handlebarsTemplate = handlebars.compile(themeTemplateContent);
  const compiledTemplate = handlebarsTemplate({ body: bodyContent });
  writeFileSync(
    resolve(__dirname, `compiledTemplates/${bodyTemplateFileName}`),
    compiledTemplate,
    "utf-8"
  );
  console.log(
    "[ Success ] ============= Successfully compiled file =============="
  );
  console.log(
    `[ Output File ] ${__dirname}/compiledTemplates/${bodyTemplateFileName}`
  );
}

compileTemplate("comment.html");
