"use client";

import { useQuery, useMutation, useQueryClient, } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { requestsApi } from "@/features/chats/requestsApi";
import toast from "react-hot-toast";
import { LucideInbox } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import {
  CATEGORIES,
  getCategoryStyles,
  getCategoryIcon,
} from "@/constants";

export default function RequestsPage() {
  const isMobile = useIsMobile();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["requests"],
    queryFn: requestsApi.getRequests,
  });

  const queryClient = useQueryClient();

const approveMutation = useMutation({
  mutationFn: requestsApi.approveRequest,

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["requests"],
    });
  },
});

const rejectMutation = useMutation({
  mutationFn: requestsApi.rejectRequest,

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["requests"],
    });
  },
});

  const requests = response?.data ?? [];

  const handleApprove = async (
    requestId: string,
    userName: string
  ) => {
    await approveMutation.mutateAsync(requestId);
    toast.success(`Approved request from ${userName}`);
  };

  const handleReject = async (
    requestId: string,
    userName: string
  ) => {
      await rejectMutation.mutateAsync(requestId);
      toast.success(`Rejected request from ${userName}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        Loading requests...
      </div>
    );
  }

  if (error || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <LucideInbox className="text-[50px] text-outline-variant mb-4" />
        <p className="text-on-surface-variant font-body-lg">
          No pending requests.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid ${
        isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
      } gap-gutter`}
      id="content-requests"
    >
      {requests.map((req) => {
        const CategoryIcon = getCategoryIcon(
          req.collaboration?.category
        );

        const categoryName =
          CATEGORIES.find(
            (c) => c.id === req.collaboration?.category
          )?.name ?? "Other";

        return (
          <div
            key={req.requestId}
            className="bg-card p-6 rounded-lg card-elevation border border-outline-variant/30 flex flex-col justify-between"
          >
            <div>
              {/* User */}
              <div className="flex items-start gap-4 mb-4">
                <Image
                  className="w-12 h-12 rounded-full object-cover"
                  src={
                    req.user?.avatarUrl ||
                    "/default-avatar.png"
                  }
                  alt={req.user?.name || "User"}
                  width={48}
                  height={48}
                />

                <Link
                  className="min-w-0 flex-1 cursor-pointer"
                  href={`/dashboard/profile/${req.user?.username}`}
                >
                  <h3 className="font-bold text-on-surface truncate">
                    {req.user?.name}
                  </h3>

                  <p className="text-xs text-on-surface-variant">
                    @{req.user?.username}
                  </p>
                </Link>
              </div>

              {/* Collaboration */}
              <div className="mb-4">
                <p className="text-xs text-on-surface-variant mb-1">
                  Requested to join
                </p>

                <h4 className="font-semibold text-on-surface">
                  {req.collaboration?.title}
                </h4>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${getCategoryStyles(
                    req.collaboration?.category
                  )}`}
                >
                  <CategoryIcon className="w-3 h-3" />
                  {categoryName}
                </div>

                {req.requestedAt && (
                  <div className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
                    <Clock className="w-3 h-3" />
                    {new Date(
                      req.requestedAt
                    ).toLocaleString("en-IN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </div>
                )}
              </div>

              {/* Message */}
              {req.joinMessage && (
                <div className="bg-surface-container-low p-4 rounded-xl mb-6">
                  <p className="text-on-surface-variant italic text-sm">
                    &ldquo;{req.joinMessage}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() =>
                  handleReject(
                    req.requestId!,
                    req.user?.name ?? "User"
                  )
                }
                className="flex-1 py-3 border border-outline-variant text-on-surface-variant rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer text-sm"
              >
                Reject
              </button>

              <button
                onClick={() =>
                  handleApprove(
                    req.requestId!,
                    req.user?.name ?? "User"
                  )
                }
                className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-on-primary-fixed-variant transition-transform active:scale-95 duration-200 cursor-pointer text-sm"
              >
                Approve
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}