import axios from "axios";
import { ResponsysRepository } from "repositories/responsysRepository";
import { CallResponsysService } from "./callResponsysService";

export const ResponsysService = {
    authToken: null,
    endPoint: "https://example.responsys.com", // Replace with actual endpoint
    API_PROFILE_LIST: 'Resp_Banking_Customers',
    async processContact(pk1: string, pk2: string, data: any): Promise<any> {
        // if (!authToken) {
        //     await authenticate();
        // }

        let result = await this.callContactAPI(pk1, pk2, data);
        return result;
    },

    async callContactAPI(pk1: string, pk2: string, data: any): Promise<any> {
        //call responsys api

        let result = null;

        let fieldNames = [];
        let record = [];

        for (let key in data) {
            fieldNames.push(key);
            record.push(data[key]);
        }

        let recordData = {
            "recordData": {
                "fieldNames": fieldNames,
                "records": [
                    record
                ],
                "mapTemplateName": null
            },
            "mergeRule": {
                "htmlValue": "H",
                "optinValue": "I",
                "textValue": "T",
                "insertOnNoMatch": true,
                "updateOnMatch": "REPLACE_ALL",
                "matchColumnName1": pk1,
                "matchColumnName2": pk2,
                "matchOperator": "NONE",
                "optoutValue": "O",
                "rejectRecordIfChannelEmpty": null,
                "defaultPermissionStatus": "OPTIN"
            }
        }

        try {
            const config = {
                method: 'post',
                url: `${this.endPoint}/rest/api/v1.3/lists/${this.API_PROFILE_LIST}/members`,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": this.authToken
                },
                data: recordData
            };

            // uat: thay vi call api cua responsys thi se log vao db: table: CallResponsys

            // let res = await axios(config);
            // result = res.data;

            // if (result.recordData && result.recordData.records && result.recordData.records.length) {
            //     result = result.recordData.records[0];
            // }
            const result = await CallResponsysService.create(config);

            console.log('callContactAPI :: success', result);

        } catch (err: any) {

            console.log('callContactAPI :: error', err);

            let errorData = err.response ? err.response.data : { message: "NO_RESPONSE_RETURN" };

            //try recall if token expire
            if (errorData.errorCode && errorData.errorCode === 'TOKEN_EXPIRED') {
                this.authToken = null;
                result = await this.processContact(pk1, pk2, data);
            }
        }

        return result;
    },

    async register(body: any): Promise<any> {
        let result = await this.processContact(body.matchColumnName1, body.matchColumnName2, body.data);
        return result;
    },
    async create(data: any) {
        return ResponsysRepository.create(data);
    },

};
