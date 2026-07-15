import { Request, Response } from "express";
import { CollaborationStatus, JoinStatus , MemberRole, Prisma} from "@prisma/client";
import prisma from "../models";
import logger from "../utils/logger";
import createNotification from "../utils/createNotification";
import { NotificationType } from "@prisma/client";

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

    await prisma.$transaction(async (tx: Prisma.TransactionClient) =>{
        const collaboration =
        await tx.collaboration.findFirst({
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
        await tx.collaborationMember.findUnique({
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
      
        await tx.collaborationMember.update({
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
        await tx.collaborationMember.create({
          data: {
            collaborationId,
            userId,
            role: MemberRole.MEMBER,
            joinStatus: JoinStatus.PENDING,
            joinMessage: message ?? null,
          },
        });
      }
      //notification jadu to be done here(convert into transaction(bcoz 2 database is being called extraction for consistency when operations are done in 2 or tables))
      await createNotification(tx, collaboration.creatorId, NotificationType.JOIN_REQUEST, "Join Request received", `Someone Wants to join your collaboration.`,false,null)
    })
    
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
            chatRoom: {
              select: {
                id: true,
              },
            },
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

      if (collaboration.chatRoom) {
        await tx.chatMember.create({
          data: {
            roomId: collaboration.chatRoom.id,
            userId: joinRequest.userId,
          },
        });
      }

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
      await createNotification(tx,joinRequest.userId,NotificationType.JOIN_APPROVED,"Join Request Approved","Yay! Your request to join a collaboration has been approved",false,collaboration.chatRoom?.id || null)
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
            title: true,
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

    await prisma.$transaction(async(tx)=>{
      await tx.collaborationMember.update({
        where: {
          id: requestId,
        },
        data: {
          joinStatus: JoinStatus.REJECTED,
        },
      });
      await createNotification(tx,joinRequest.userId,NotificationType.JOIN_REJECTED,"Request Rejected",`Join request for ${joinRequest.collaboration.title} has been rejected.`,false,null);
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

const leaveRequestController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const collaborationId = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Find the collaboration and verify creator vs member status
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId, deletedAt: null },
      select: {
        id: true,
        creatorId: true,
        maxMembers: true,
        status: true,
        chatRoom: {
          select: { id: true },
        },
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
        message: "Creator cannot leave the collaboration. Delete it instead.",
      });
    }

    // Check if user is currently an approved member
    const memberRecord = await prisma.collaborationMember.findUnique({
      where: {
        collaborationId_userId: {
          collaborationId,
          userId,
        },
      },
      select: {
        id: true,
        joinStatus: true,
      },
    });

    if (!memberRecord || memberRecord.joinStatus !== JoinStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        message: "You are not an approved member of this collaboration",
      });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update collaboration member status to LEFT
      await tx.collaborationMember.update({
        where: { id: memberRecord.id },
        data: { joinStatus: JoinStatus.LEFT },
      });

      // 2. Remove from ChatMember if chat room exists
      if (collaboration.chatRoom) {
        await tx.chatMember.deleteMany({
          where: {
            roomId: collaboration.chatRoom.id,
            userId,
          },
        });
      }

      // 3. Update collaboration status back to OPEN if it was FULL
      const approvedCount = await tx.collaborationMember.count({
        where: {
          collaborationId,
          joinStatus: JoinStatus.APPROVED,
        },
      });

      if (approvedCount < collaboration.maxMembers && collaboration.status === CollaborationStatus.FULL) {
        await tx.collaboration.update({
          where: { id: collaborationId },
          data: { status: CollaborationStatus.OPEN },
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: "Left collaboration successfully",
    });
  } catch (error) {
    logger.error("leaveRequestController error", {
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

const removeMemberController = async (
  req: Request,
  res: Response,
) => {
  try {
    const creatorId = req.user?.id;
    const { id: collaborationId, memberId } = req.params as {
      id: string;
      memberId: string;
    };

    if (!creatorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const collaboration = await prisma.collaboration.findUnique({
      where: {
        id: collaborationId,
      },
      select: {
        id: true,
        creatorId: true,
        status: true,
        maxMembers: true,
        deletedAt: true,
        chatRoom: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!collaboration || collaboration.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Collaboration not found",
      });
    }

    if (collaboration.creatorId !== creatorId) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can remove members",
      });
    }

    if (
      collaboration.status === CollaborationStatus.COMPLETED ||
      collaboration.status === CollaborationStatus.CANCELLED
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Members cannot be removed from completed or cancelled collaborations",
      });
    }

    const member = await prisma.collaborationMember.findUnique({
      where: {
        collaborationId_userId: {
          collaborationId,
          userId: memberId,
        },
      },
      select: {
        id: true,
        role: true,
        joinStatus: true,
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    if (member.role === MemberRole.CREATOR) {
      return res.status(400).json({
        success: false,
        message: "Creator cannot be removed",
      });
    }

    if (member.joinStatus !== JoinStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        message: "Only approved members can be removed",
      });
    }

    await prisma.$transaction(async (tx) => {
      // Mark member as left
      await tx.collaborationMember.update({
        where: {
          id: member.id,
        },
        data: {
          joinStatus: JoinStatus.LEFT,
        },
      });

      // Remove from chat if chat exists
      if (collaboration.chatRoom) {
        await tx.chatMember.deleteMany({
          where: {
            roomId: collaboration.chatRoom.id,
            userId: memberId,
          },
        });
      }

      // Count approved members after removal
      const approvedMembers = await tx.collaborationMember.count({
        where: {
          collaborationId,
          joinStatus: JoinStatus.APPROVED,
        },
      });

      // If collaboration was FULL and now has space, reopen it
      if (
        collaboration.status === CollaborationStatus.FULL &&
        approvedMembers < collaboration.maxMembers
      ) {
        await tx.collaboration.update({
          where: {
            id: collaborationId,
          },
          data: {
            status: CollaborationStatus.OPEN,
          },
        });
      }

      // TODO:
      // Create MEMBER_REMOVED notification

      // TODO:
      // Emit socket event to removed member
    });

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    logger.error("removeMemberController error", {
      error,
      creatorId: req.user?.id,
      collaborationId: req.params.id,
      memberId: req.params.memberId,
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getRequestsController, createJoinRequestController, approveJoinRequestController, rejectJoinRequestController, leaveRequestController, removeMemberController };


