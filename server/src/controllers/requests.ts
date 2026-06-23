import { Request, Response } from "express";
import { CollaborationStatus, JoinStatus , MemberRole} from "@prisma/client";
import prisma from "../models";
import logger from "../utils/logger";

const getRequestsController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const requests = await prisma.collaborationMember.findMany({
            where: {
                joinStatus: JoinStatus.PENDING,
                collaboration: {
                creatorId: userId,
                status: CollaborationStatus.OPEN,
                deletedAt: null,
                },
            },
            select: {
                id: true,
                joinMessage: true,
                joinStatus: true,
                joinedAt: true,

                user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatarUrl: true,
                },
                },

                collaboration: {
                select: {
                    id: true,
                    title: true,
                    category: true,
                },
                },
            },
            orderBy: {
                joinedAt: "desc",
            },
            });

        const requestsDto = requests.map((request) => ({
            requestId: request.id,

            collaboration: {
                collaborationId: request.collaboration.id,
                title: request.collaboration.title,
                category: request.collaboration.category,
            },

            joinMessage: request.joinMessage,

            requestedAt: request.joinedAt.toISOString(),

            status: request.joinStatus,

            user: {
                id: request.user.id,
                name: request.user.name,
                username: request.user.username,
                avatarUrl: request.user.avatarUrl,
            },
        }));

        return res.status(200).json({
            success: true,
            data: requestsDto,
        });
    } catch (error) {
        logger.error("Error fetching requests", {
            error,
            userId: req.user?.id,
        });

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const createJoinRequestController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const collaborationId = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { message } = req.body;
    console.log(message);

    const collaboration =
      await prisma.collaboration.findFirst({
        where: {
          id: collaborationId,
          deletedAt: null,
        },
        select: {
          id: true,
          creatorId: true,
          status: true,
        },  
      });

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: "Collaboration not found",
      });
    }

    if (collaboration.creatorId === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot join your own collaboration",
      });
    }

    if (collaboration.status !== CollaborationStatus.OPEN) {
      return res.status(400).json({
        success: false,
        message:
          "Collaboration is no longer accepting members",
      });
    }

    const existingMember =
      await prisma.collaborationMember.findUnique({
        where: {
          collaborationId_userId: {
            collaborationId,
            userId,
          },
        },
      });

    if (existingMember) {
      if (existingMember.joinStatus === JoinStatus.PENDING) {
        return res.status(409).json({
          success: false,
          message: "Join request already submitted",
        });
      }

      if (existingMember.joinStatus === JoinStatus.APPROVED) {
        return res.status(409).json({
          success: false,
          message: "You are already a member",
        });
      }

      await prisma.collaborationMember.update({
        where: {
          id: existingMember.id,
        },
        data: {
          joinStatus: JoinStatus.PENDING,
          joinMessage: message ?? null,
          joinedAt: new Date(),
        },
      });
    } else {
      await prisma.collaborationMember.create({
        data: {
          collaborationId,
          userId,
          role: MemberRole.MEMBER,
          joinStatus: JoinStatus.PENDING,
          joinMessage: message ?? null,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Join request submitted successfully",
    });
  } catch (error) {
    logger.error("createJoinRequestController error", {
      error,
      userId: req.user?.id,
      collaborationId: req.params.id,
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const approveJoinRequestController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const requestId = req.params.requestId as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const joinRequest = await prisma.collaborationMember.findUnique({
      where: {
        id: requestId,
      },
      include: {
        collaboration: {
          select: {
            id: true,
            creatorId: true,
            maxMembers: true,
            status: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: "Join request not found",
      });
    }

    const collaboration = joinRequest.collaboration;

    if (
      collaboration.deletedAt ||
      collaboration.creatorId !== userId
    ) {
      return res.status(404).json({
        success: false,
        message: "Join request not found",
      });
    }

    if (collaboration.status !== CollaborationStatus.OPEN) {
      return res.status(400).json({
        success: false,
        message: "Collaboration is no longer accepting members",
      });
    }

    if (joinRequest.joinStatus !== JoinStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed",
      });
    }

    const approvedMembersCount =
      await prisma.collaborationMember.count({
        where: {
          collaborationId: collaboration.id,
          joinStatus: JoinStatus.APPROVED,
        },
      });

    if (approvedMembersCount >= collaboration.maxMembers) {
      return res.status(400).json({
        success: false,
        message: "Collaboration is already full",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.collaborationMember.update({
        where: {
          id: requestId,
        },
        data: {
          joinStatus: JoinStatus.APPROVED,
        },
      });

      const updatedApprovedCount =
        approvedMembersCount + 1;

      if (updatedApprovedCount >= collaboration.maxMembers) {
        await tx.collaboration.update({
          where: {
            id: collaboration.id,
          },
          data: {
            status: CollaborationStatus.FULL,
          },
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: "Request approved successfully",
    });
  } catch (error) {
    logger.error("approveJoinRequestController error", {
      error,
      userId: req.user?.id,
      requestId: req.params.requestId,
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const rejectJoinRequestController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const requestId = req.params.requestId as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const joinRequest = await prisma.collaborationMember.findUnique({
      where: {
        id: requestId,
      },
      include: {
        collaboration: {
          select: {
            id: true,
            creatorId: true,
            status: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: "Join request not found",
      });
    }

    const collaboration = joinRequest.collaboration;

    if (
      collaboration.deletedAt ||
      collaboration.creatorId !== userId
    ) {
      return res.status(404).json({
        success: false,
        message: "Join request not found",
      });
    }

    if (
      collaboration.status !== CollaborationStatus.OPEN &&
      collaboration.status !== CollaborationStatus.FULL
    ) {
      return res.status(400).json({
        success: false,
        message: "Collaboration can no longer process requests",
      });
    }

    if (joinRequest.joinStatus !== JoinStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed",
      });
    }

    await prisma.collaborationMember.update({
      where: {
        id: requestId,
      },
      data: {
        joinStatus: JoinStatus.REJECTED,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Request rejected successfully",
    });
  } catch (error) {
    logger.error("rejectJoinRequestController error", {
      error,
      userId: req.user?.id,
      requestId: req.params.requestId,
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getRequestsController, createJoinRequestController, approveJoinRequestController, rejectJoinRequestController };