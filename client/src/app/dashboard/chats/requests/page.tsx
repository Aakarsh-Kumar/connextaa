"use client";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCategoryIcon, getCategoryStyles } from "@/constants";
import toast from "react-hot-toast";
import type { Category } from "@/types";

interface ChatRequest {
  id: number;
  name: string;
  avatar: string;
  avatarAlt: string;
  activityName: string;
  category: Category;
  message: string;
}

const INITIAL_REQUESTS: ChatRequest[] = [
  {
    id: 1,
    name: "Ananya K.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSJK5fLH8ezogqcxo50Jald_pIqZA_xohFM1lFx7BdggNfPZYz6bGBIna9FLChxQdC-T2ujNjaZ3iF_termpmJff19JdqYEJTDqUsHm_P-yzQb3NdB5L3egjNc16nbnAJK5vJygzCLsnoz9lrkEhihGj83sHJJ7SArZ5ryzjrNUjD8whria0gU8Wjgl2tnUqwiZ2hXmQZv0PjZMv7rh7D7zqKeJlpwXHYxIK80CjE_sIgmslfj4CBnondO-P4QhGkwPgB5N7JT5deL",
    avatarAlt: "A close-up portrait of a cheerful young woman with curly hair, radiating positive energy. She is standing in a brightly lit, modern apartment with soft plants in the background. The lighting is bright and airy, typical of a high-quality community-focused mobile app interface.",
    activityName: "Airport Ride to T2",
    category: "CARPOOLING",
    message: "Hey, looking for a ride for my 6am flight! I have only one cabin bag. Happy to split fuel costs!",
  },
  {
    id: 2,
    name: "Ishaan M.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTCwxssz_gmm2mqPYCSOdEGh7axT3f2F0oDnwfxGkoAFsWq-rR9kgqR37_a3oD1bWXL3MgRWeZi1_7K29ATuPSxrnZKhBTyQBXeIk16Odo-Dia2KEkzX_KITh_gt9CHoybyqAtHXRzGgHpsKsy_smqO1c9RxeutEprinqggRWbs9xMs89Ms5iD_EXHTsLKd3Es96VxrQyjBvuSYYdGx_2hddCUVOACOF6ASAKAgqRsw3-mLlRpOnT9-ijsKqvklsFRXYkBFpWbl5Ve",
    avatarAlt: "A friendly male university student wearing a light denim shirt, smiling warmly at the camera. The background is a blurred university library with wooden shelves and soft ambient light, creating a focused and academic yet approachable atmosphere for a community platform.",
    activityName: "DSA Revision Session",
    category: "STUDY",
    message: "I've been struggling with Graphs. Mind if I join your session today? I can help with Dynamic Programming!",
  },
  {
    id: 3,
    name: "Priya R.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0SCImkRZFhGqUlyeOtfoBsVroGiubOYleUrKKLxv-JwoyzbbM5Z4TqozZQfXcLn15jqwndC5k8KXzNa6vF6Y127XMb5e6yK-pi2-Hlt_Ygr8PCpAyWVV2wwjN_FtDwC0oi60fod-mkXrJuLZ6l7e8AQUzRmwzdfeIocX9lN4J199j-M2wxdsfCL5aCaBLeZ07r4e64aG6k9DdoXlgpoOzbc0xXfhc5A6_o7wWyuYsO8KxP93gcO4U4z_7b7jGyXfMe-0J7y9lqkX9",
    avatarAlt: "A confident young woman with glasses, looking professional and friendly. She is in a minimalist office environment with clean lines and soft lighting, representing a reliable community member for a professional networking or help-based platform.",
    activityName: "Morning Tennis",
    category: "SPORTS",
    message: "Intermediate player here. Would love to join the court session at 7 AM. I have extra balls!",
  },
];

export default function RequestsPage() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const isMobile = useIsMobile();

  const handleApprove = (id: number, name: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    toast.success(`Approved request from ${name}`);
  };

  const handleReject = (id: number, name: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    toast.error(`Rejected request from ${name}`);
  };

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">
          inbox
        </span>
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
      {requests.map(req => {
        const CategoryIcon = getCategoryIcon(req.category);
        const styleClasses = getCategoryStyles(req.category);

        return (
          <div
            key={req.id}
            className="bg-card p-6 rounded-lg card-elevation border border-outline-variant/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-4 mb-4">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  data-alt={req.avatarAlt}
                  src={req.avatar}
                  alt={req.name}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-headline-md text-body-lg font-bold text-on-surface truncate">
                    {req.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] uppercase tracking-wider font-bold border flex items-center gap-1 shrink-0 ${styleClasses}`}>
                      <CategoryIcon className="w-3 h-3" />
                      {req.category.toLowerCase()}
                    </span>
                    <span className="text-on-surface-variant font-label-md truncate text-xs">
                      {req.activityName}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface-container-low p-4 rounded-xl mb-6">
                <p className="text-on-surface-variant italic text-body-md">
                  &ldquo;{req.message}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleReject(req.id, req.name)}
                className="flex-1 py-3 border border-outline-variant text-on-surface-variant font-label-md rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer text-center text-sm"
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(req.id, req.name)}
                className="flex-1 py-3 bg-primary text-white font-label-md rounded-xl hover:bg-on-primary-fixed-variant transition-transform active:scale-95 duration-200 cursor-pointer text-center text-sm"
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