// takes user id
// function parameters -> userId, type(notificationType from ./types/api.ts), title, body, isRead
import { NotificationType } from "@prisma/client";

const validNotificationTypes = Object.values(NotificationType);

async function createNotification(
    tx: any,
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    isRead: boolean = false,
    referenceId: string | null
) {
    if (!tx?.notification?.create) {
        throw new Error("A valid Prisma transaction client is required.");
    }

    if (typeof userId !== "string" || userId.trim().length === 0) {
        throw new Error("userId is required.");
    }

    if (!validNotificationTypes.includes(type)) {
        throw new Error("type is invalid.");
    }

    if (typeof title !== "string" || title.trim().length === 0) {
        throw new Error("title is required.");
    }

    if (typeof body !== "string" || body.trim().length === 0) {
        throw new Error("body is required.");
    }

    if (typeof isRead !== "boolean") {
        throw new Error("isRead must be a boolean.");
    }

    if (referenceId && (typeof referenceId !== "string" || referenceId.trim().length === 0)) {
        throw new Error("referenceId is required.");
    }

    return tx.notification.create({
        data: {
            userId: userId.trim(),
            type,
            title: title.trim(),
            body: body.trim(),
            isRead,
            referenceId,
        },
    });
}

export default createNotification;