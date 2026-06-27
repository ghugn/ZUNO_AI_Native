import prisma from '../lib/prisma.js';

interface CreateProfileInput {
  userId: string;
  residenceType: string;
  bankBalance: number;
  dormPaidSemester?: boolean;
  hasFoodFromFamily?: boolean;
}

interface UpdateProfileInput {
  residenceType?: string;
  bankBalance?: number;
  bankAccountId?: string;
  dormPaidSemester?: boolean;
  hasFoodFromFamily?: boolean;
  onboardingCompleted?: boolean;
}

export async function createProfile(input: CreateProfileInput) {
  return prisma.userProfile.create({
    data: {
      userId: input.userId,
      residenceType: input.residenceType,
      bankBalance: BigInt(input.bankBalance),
      dormPaidSemester: input.dormPaidSemester ?? false,
      hasFoodFromFamily: input.hasFoodFromFamily ?? false,
    },
  });
}

export async function getProfile(userId: string) {
  return prisma.userProfile.findUnique({
    where: { userId },
  });
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const data: Record<string, unknown> = {};
  if (input.residenceType !== undefined) data.residenceType = input.residenceType;
  if (input.bankBalance !== undefined) data.bankBalance = BigInt(input.bankBalance);
  if (input.dormPaidSemester !== undefined) data.dormPaidSemester = input.dormPaidSemester;
  if (input.hasFoodFromFamily !== undefined) data.hasFoodFromFamily = input.hasFoodFromFamily;
  if (input.onboardingCompleted !== undefined) data.onboardingCompleted = input.onboardingCompleted;
  if (input.bankAccountId !== undefined) data.bankAccountId = input.bankAccountId;

  return prisma.userProfile.update({
    where: { userId },
    data,
  });
}

export async function completeOnboarding(userId: string) {
  return prisma.userProfile.update({
    where: { userId },
    data: { onboardingCompleted: true },
  });
}
