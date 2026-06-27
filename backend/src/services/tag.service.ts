import prisma from '../lib/prisma.js';

export async function getAllTags(userId?: string) {
  // Return system tags + user's custom tags
  return prisma.transactionTag.findMany({
    where: {
      OR: [
        { isSystem: true },
        ...(userId ? [{ userId }] : []),
      ],
    },
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
  });
}

export async function getTagsByFundType(fundType: string, userId?: string) {
  return prisma.transactionTag.findMany({
    where: {
      fundType,
      OR: [
        { isSystem: true },
        ...(userId ? [{ userId }] : []),
      ],
    },
    orderBy: { name: 'asc' },
  });
}

export async function createTag(data: {
  name: string;
  fundType: string;
  iconUrl?: string;
  userId?: string;
}) {
  return prisma.transactionTag.create({
    data: {
      name: data.name,
      fundType: data.fundType,
      iconUrl: data.iconUrl,
      isSystem: false,
      userId: data.userId,
    },
  });
}

export async function updateTag(tagId: string, data: {
  name?: string;
  fundType?: string;
  iconUrl?: string;
}) {
  // Only allow updating non-system tags
  const tag = await prisma.transactionTag.findUnique({ where: { id: tagId } });
  if (!tag) throw new Error('Tag not found');
  if (tag.isSystem) throw new Error('Cannot modify system tags');

  return prisma.transactionTag.update({
    where: { id: tagId },
    data,
  });
}

export async function deleteTag(tagId: string) {
  const tag = await prisma.transactionTag.findUnique({ where: { id: tagId } });
  if (!tag) throw new Error('Tag not found');
  if (tag.isSystem) throw new Error('Cannot delete system tags');

  return prisma.transactionTag.delete({ where: { id: tagId } });
}
