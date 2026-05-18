'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { Card, ShopPrice, Task, Rank, Lootbox } from '@/models';
import { auth } from '@clerk/nextjs/server';
import { User } from '@/models';

const checkAdmin = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await connectToDatabase();
  const user = await User.findOne({ clerkId: userId }).lean() as any;
  if (!user || !user.roles?.some((r: string) => ['admin', 'owner', 'co-owner'].includes(r))) {
    throw new Error("Forbidden");
  }
};

// --- Ranks ---
export async function getRanks() {
  await checkAdmin();
  return JSON.parse(JSON.stringify(await Rank.find().sort({ requiredPoints: 1 }).lean()));
}

export async function createRank(data: any) {
  await checkAdmin();
  const rank = new Rank(data);
  await rank.save();
  return JSON.parse(JSON.stringify(rank));
}

export async function updateRank(id: string, data: any) {
  await checkAdmin();
  return JSON.parse(JSON.stringify(await Rank.findByIdAndUpdate(id, data, { new: true })));
}

export async function deleteRank(id: string) {
  await checkAdmin();
  await Rank.findByIdAndDelete(id);
  return { success: true };
}

// --- Cards ---
export async function getCards() {
  await checkAdmin();
  return JSON.parse(JSON.stringify(await Card.find().sort({ createdAt: -1 }).lean()));
}

export async function createCard(data: any) {
  await checkAdmin();
  const card = new Card(data);
  await card.save();
  return JSON.parse(JSON.stringify(card));
}

export async function updateCard(id: string, data: any) {
  await checkAdmin();
  return JSON.parse(JSON.stringify(await Card.findByIdAndUpdate(id, data, { new: true })));
}

export async function deleteCard(id: string) {
  await checkAdmin();
  await Card.findByIdAndDelete(id);
  return { success: true };
}

// --- Tasks ---
export async function getTasksAdmin() {
  await checkAdmin();
  return JSON.parse(JSON.stringify(await Task.find().sort({ createdAt: -1 }).lean()));
}

export async function createTask(data: any) {
  await checkAdmin();
  const task = new Task(data);
  await task.save();
  return JSON.parse(JSON.stringify(task));
}

export async function updateTask(id: string, data: any) {
  await checkAdmin();
  return JSON.parse(JSON.stringify(await Task.findByIdAndUpdate(id, data, { new: true })));
}

export async function deleteTask(id: string) {
  await checkAdmin();
  await Task.findByIdAndDelete(id);
  return { success: true };
}

// --- Shop Prices ---
export async function getShopPrices() {
  await checkAdmin();
  return JSON.parse(JSON.stringify(await ShopPrice.find().lean()));
}

export async function updateShopPrice(rarity: string, pricePoints: number | null, priceMoney: number | null) {
  await checkAdmin();
  await ShopPrice.findOneAndUpdate(
    { rarity },
    { rarity, pricePoints, priceMoney },
    { upsert: true }
  );
  return { success: true };
}

// --- Lootboxes ---
export async function getLootboxesAdmin() {
  await checkAdmin();
  return JSON.parse(JSON.stringify(await Lootbox.find().sort({ createdAt: -1 }).lean()));
}

export async function createLootbox(data: any) {
  await checkAdmin();
  const lootbox = new Lootbox(data);
  await lootbox.save();
  return JSON.parse(JSON.stringify(lootbox));
}

export async function updateLootbox(id: string, data: any) {
  await checkAdmin();
  return JSON.parse(JSON.stringify(await Lootbox.findByIdAndUpdate(id, data, { new: true })));
}

export async function deleteLootbox(id: string) {
  await checkAdmin();
  await Lootbox.findByIdAndDelete(id);
  return { success: true };
}
