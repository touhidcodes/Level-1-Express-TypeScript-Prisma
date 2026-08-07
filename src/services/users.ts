import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.post("/", async (req, res) => {
  const data = await prisma.user.create({ data: req.body });
  res.status(201).json(data);
});

router.get("/", async (req, res) => {
  res.json(await prisma.user.findMany());
});

router.get("/:id", async (req, res) => {
  res.json(await prisma.user.findUnique({ where: { id: req.params.id } }));
});

router.patch("/:id", async (req, res) => {
  res.json(
    await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
    }),
  );
});

router.delete("/:id", async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

export default router;
