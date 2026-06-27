import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import * as tagService from '../services/tag.service.js';

export async function getAllTags(req: AuthRequest, res: Response) {
  try {
    const tags = await tagService.getAllTags(req.userId!);
    res.json(tags);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTagsByFundType(req: AuthRequest, res: Response) {
  try {
    const fundType = req.params.fundType as string;
    const tags = await tagService.getTagsByFundType(fundType, req.userId!);
    res.json(tags);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createTag(req: AuthRequest, res: Response) {
  try {
    const { name, fundType, iconUrl } = req.body;
    if (!name || !fundType) {
      res.status(400).json({ error: 'name, fundType required' });
      return;
    }
    const tag = await tagService.createTag({
      name, fundType, iconUrl, userId: req.userId!,
    });
    res.status(201).json(tag);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateTag(req: AuthRequest, res: Response) {
  try {
    const tag = await tagService.updateTag(req.params.id as string, req.body);
    res.json(tag);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteTag(req: AuthRequest, res: Response) {
  try {
    await tagService.deleteTag(req.params.id as string);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
