import db from "@/lib/db";

export const profileRepository = {
  getUserById(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        photoUrl: true,
        role: true,
        bio: true,
        phoneNumber: true,
        homeAddress: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  getUserPasswordHashById(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
  },

  updateUser(userId: string, data: Record<string, unknown>) {
    return db.user.update({
      where: { id: userId },
      data: data as any,
      select: {
        id: true,
        name: true,
        email: true,
        photoUrl: true,
        role: true,
        bio: true,
        phoneNumber: true,
        homeAddress: true,
        dateOfBirth: true,
        updatedAt: true,
      },
    });
  },

  getUserByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
      select: { id: true },
    });
  },

  /**
   * Atomic write for "my profile" updates.
   * Transaction boundary lives in repository (infrastructure concern).
   */
  updateMyProfileAtomic(params: {
    userId: string;
    dataToUpdate: Record<string, unknown>;
    wantsBioUpdate: boolean;
    wantsDomainUpdate: boolean;
    input: {
      bio?: unknown;
      phoneNumber?: string;
      homeAddress?: string;
      dateOfBirth?: Date;
    };
  }) {
    const {
      userId,
      dataToUpdate,
      wantsBioUpdate,
      wantsDomainUpdate,
      input,
    } = params;

    return db.$transaction(async (tx) => {
      const consolidatedUpdates: Record<string, unknown> = {
        ...(wantsBioUpdate ? { bio: input.bio ?? null } : {}),
        ...(input.phoneNumber !== undefined
          ? { phoneNumber: input.phoneNumber || null }
          : {}),
        ...(input.homeAddress !== undefined
          ? { homeAddress: input.homeAddress || null }
          : {}),
        ...(input.dateOfBirth !== undefined
          ? { dateOfBirth: input.dateOfBirth || null }
          : {}),
      };

      const updatedUser =
        Object.keys({ ...dataToUpdate, ...consolidatedUpdates }).length > 0
          ? await tx.user.update({
              where: { id: userId },
              data: { ...dataToUpdate, ...consolidatedUpdates } as any,
              select: {
                id: true,
                name: true,
                email: true,
                photoUrl: true,
                role: true,
                bio: true,
                phoneNumber: true,
                homeAddress: true,
                dateOfBirth: true,
                updatedAt: true,
              },
            })
          : await tx.user.findUnique({
              where: { id: userId },
              select: {
                id: true,
                name: true,
                email: true,
                photoUrl: true,
                role: true,
                bio: true,
                phoneNumber: true,
                homeAddress: true,
                dateOfBirth: true,
                createdAt: true,
                updatedAt: true,
              },
            });

      return updatedUser;
    });
  },
};


