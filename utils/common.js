import moment from "moment";
import fs from "fs";
import path from "path";

import prisma from "../prisma/prismaClient.js";
import { Role } from "../constants/common.js";

export const getPrettyDate = (date) => {
  return moment(date).format("MMMM Do YYYY, h:mm:ss a").toString();
};

export const getQaManagerEmailsByDepartmentId = async (departmentId) => {
  const qaMangerRole = await prisma.role.findUnique({
    where: { name: Role.QA_MANAGER },
  });
  const users = await prisma.user.findMany({
    where: {
      roleId: qaMangerRole.id,
      departmentId,
    },
  });
  if (users.length === 0) {
    throw new Error("QA Manager user not found.");
  }
  return users.map((user) => user.email);
};

export const getQaCoordinatorEmailsByDepartmentId = async (departmentId) => {
  const qaCordinatorRole = await prisma.role.findUnique({
    where: { name: Role.QA_COORDINATOR },
  });
  const users = await prisma.user.findMany({
    where: {
      roleId: qaCordinatorRole.id,
      departmentId,
    },
  });
  if (users.length === 0) {
    throw new Error("QA Cordinator user not found.");
  }
  return users.map((user) => user.email);
};

export function ensureTmpDir() {
  const tmpDir = path.resolve("tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
    console.log("✅ /tmp directory created.");
  } else {
    console.log("📁 /tmp directory already exists.");
  }
}
