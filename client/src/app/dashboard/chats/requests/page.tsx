"use client";

import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { requestsApi } from "@/features/chats/requestsApi";
import toast from "react-hot-toast";
import { LucideInbox } from "lucide-react";

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

  const requests = response?.data ?? [];

  const handleApprove = async (
    requestId: string,
    userName: string
  ) => {
    try {
      // await requestsApi.approveRequest(requestId);
      toast.success(`Approved request from ${userName}`);
    } catch {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (
    requestId: string,
    userName: string
  ) => {
    try {
      // await requestsApi.rejectRequest(requestId);
      toast.success(`Rejected request from ${userName}`);
    } catch {
      toast.error("Failed to reject request");
    }
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
      {requests.map((req) => (
        <div
          key={req.requestId}
          className="bg-card p-6 rounded-lg card-elevation border border-outline-variant/30 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start gap-4 mb-4">
              <img
                className="w-12 h-12 rounded-full object-cover"
                src={req.user.avatarUrl || "/default-avatar.png"}
                alt={req.user.name}
              />

              <div className="min-w-0 flex-1">
                <h3 className="font-headline-md text-body-lg font-bold text-on-surface truncate">
                  {req.user.name}
                </h3>

                <p className="text-xs text-on-surface-variant">
                  @{req.user.username}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl mb-6">
              <p className="text-on-surface-variant italic text-body-md">
                &ldquo;{req.joinMessage}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                handleReject(req.requestId, req.user.name)
              }
              className="flex-1 py-3 border border-outline-variant text-on-surface-variant font-label-md rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer text-center text-sm"
            >
              Reject
            </button>

            <button
              onClick={() =>
                handleApprove(req.requestId, req.user.name)
              }
              className="flex-1 py-3 bg-primary text-white font-label-md rounded-xl hover:bg-on-primary-fixed-variant transition-transform active:scale-95 duration-200 cursor-pointer text-center text-sm"
            >
              Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}