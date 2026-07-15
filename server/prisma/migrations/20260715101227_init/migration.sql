-- CreateEnum
CREATE TYPE "Category" AS ENUM ('CARPOOLING', 'EVENTS', 'STUDY', 'PROFESSIONAL', 'SPORTS', 'TRIPS', 'OTHER');

-- CreateEnum
CREATE TYPE "CollaborationStatus" AS ENUM ('OPEN', 'FULL', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('CREATOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "JoinStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'LEFT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('JOIN_REQUEST', 'JOIN_APPROVED', 'JOIN_REJECTED', 'CHAT_CREATED', 'NEW_MESSAGE', 'COLLABORATION_COMPLETED', 'COLLABORATION_CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" STRING NOT NULL,
    "google_id" STRING NOT NULL,
    "email" STRING NOT NULL,
    "name" STRING NOT NULL,
    "username" STRING NOT NULL,
    "avatar_url" STRING,
    "bio" STRING,
    "onboarding_completed" BOOL NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_categories" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "category" "Category" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collaborations" (
    "id" STRING NOT NULL,
    "creator_id" STRING NOT NULL,
    "category" "Category" NOT NULL,
    "title" STRING NOT NULL,
    "description" STRING NOT NULL,
    "from_location_name" STRING NOT NULL,
    "from_lat" FLOAT8,
    "from_lng" FLOAT8,
    "from_point" geography(Point,4326),
    "to_location_name" STRING NOT NULL,
    "to_lat" FLOAT8,
    "to_lng" FLOAT8,
    "to_point" geography(Point,4326),
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "max_members" INT4 NOT NULL,
    "status" "CollaborationStatus" NOT NULL DEFAULT 'OPEN',
    "completed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collaborations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collaboration_members" (
    "id" STRING NOT NULL,
    "collaboration_id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "role" "MemberRole" NOT NULL,
    "join_status" "JoinStatus" NOT NULL,
    "join_message" STRING,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collaboration_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_rooms" (
    "id" STRING NOT NULL,
    "collaboration_id" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_members" (
    "id" STRING NOT NULL,
    "room_id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" STRING NOT NULL,
    "room_id" STRING NOT NULL,
    "sender_id" STRING NOT NULL,
    "message" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" STRING NOT NULL,
    "collaboration_id" STRING NOT NULL,
    "reviewer_id" STRING NOT NULL,
    "reviewed_user_id" STRING NOT NULL,
    "show_up_rating" INT4 NOT NULL,
    "friendly_rating" INT4 NOT NULL,
    "safe_rating" INT4 NOT NULL,
    "collaborative_rating" INT4 NOT NULL,
    "comment" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" STRING NOT NULL,
    "body" STRING NOT NULL,
    "is_read" BOOL NOT NULL DEFAULT false,
    "referenceId" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "token" STRING NOT NULL,
    "platform" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "user_categories_user_id_idx" ON "user_categories"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_categories_user_id_category_key" ON "user_categories"("user_id", "category");

-- CreateIndex
CREATE INDEX "collaborations_title_idx" ON "collaborations"("title");

-- CreateIndex
CREATE INDEX "collaborations_from_location_name_idx" ON "collaborations"("from_location_name");

-- CreateIndex
CREATE INDEX "collaborations_to_location_name_idx" ON "collaborations"("to_location_name");

-- CreateIndex
CREATE INDEX "collaborations_creator_id_idx" ON "collaborations"("creator_id");

-- CreateIndex
CREATE INDEX "collaborations_category_idx" ON "collaborations"("category");

-- CreateIndex
CREATE INDEX "collaborations_status_idx" ON "collaborations"("status");

-- CreateIndex
CREATE INDEX "collaborations_scheduled_at_idx" ON "collaborations"("scheduled_at");

-- CreateIndex
CREATE INDEX "collaborations_category_status_idx" ON "collaborations"("category", "status");

-- CreateIndex
CREATE INDEX "collaborations_deleted_at_idx" ON "collaborations"("deleted_at");

-- CreateIndex
CREATE INDEX "collaboration_members_user_id_idx" ON "collaboration_members"("user_id");

-- CreateIndex
CREATE INDEX "collaboration_members_collaboration_id_idx" ON "collaboration_members"("collaboration_id");

-- CreateIndex
CREATE INDEX "collaboration_members_join_status_idx" ON "collaboration_members"("join_status");

-- CreateIndex
CREATE UNIQUE INDEX "collaboration_members_collaboration_id_user_id_key" ON "collaboration_members"("collaboration_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_collaboration_id_key" ON "chat_rooms"("collaboration_id");

-- CreateIndex
CREATE INDEX "chat_members_room_id_idx" ON "chat_members"("room_id");

-- CreateIndex
CREATE INDEX "chat_members_user_id_idx" ON "chat_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_members_room_id_user_id_key" ON "chat_members"("room_id", "user_id");

-- CreateIndex
CREATE INDEX "messages_room_id_created_at_idx" ON "messages"("room_id", "created_at");

-- CreateIndex
CREATE INDEX "ratings_reviewed_user_id_idx" ON "ratings"("reviewed_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_collaboration_id_reviewer_id_reviewed_user_id_key" ON "ratings"("collaboration_id", "reviewer_id", "reviewed_user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_user_id_idx" ON "device_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "user_categories" ADD CONSTRAINT "user_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration_members" ADD CONSTRAINT "collaboration_members_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "collaborations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration_members" ADD CONSTRAINT "collaboration_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "collaborations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "collaborations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_reviewed_user_id_fkey" FOREIGN KEY ("reviewed_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
