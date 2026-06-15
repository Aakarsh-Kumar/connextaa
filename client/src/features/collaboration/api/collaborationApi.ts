import { api } from "@/services/api";
import { CreateCollaborationRequest, CreateCollaborationResponse } from "@/types";

export const collaborationApi = {
    createCollaboration: async (collaborationData: CreateCollaborationRequest): Promise<CreateCollaborationResponse> => {
        const response = await api.post("/collaborations", collaborationData);
        console.log("api",response.data)
        return response.data;
    },
};