import { MKTADBRepository } from "repositories/mktadbRepository";

export const MKTADBService = {
    authToken: null,
    endPoint: "https://example.responsys.com", // Replace with actual endpoint
    API_PROFILE_LIST: 'Resp_Banking_Customers',

    async create(data: any) {
        return MKTADBRepository.create(data);
    },
    async getItemByField(field: string, value: any) {
        if (!field || value === undefined || value === null) {
            throw new Error("Missing field or value");
        }

        const item = await MKTADBRepository.getItemByField(field, value);
        return item;
    },
};
