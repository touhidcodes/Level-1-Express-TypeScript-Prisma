import { Router } from "express";
import prisma from "./prisma";

const router = Router();

router.post("/", async (req, res) => {
  const data = await prisma.product.create({ data: req.body });
  res.status(201).json(data);
});

router.get("/", async (req, res) => {
  res.json(await prisma.product.findMany());
});

router.get("/:id", async (req, res) => {
  res.json(await prisma.product.findUnique({ where: { id: req.params.id } }));
});

router.patch("/:id", async (req, res) => {
  res.json(
    await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    }),
  );
});

router.delete("/:id", async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

export default router;
