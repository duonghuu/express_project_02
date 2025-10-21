import { redis } from "@config/redis";
import { ResponsysService } from "@services/responsysService";
import { jobQueue } from "@workers/queue";
import dayjs from "dayjs";
import { Request, Response } from "express";
import fs from "fs";
import _ from "lodash";
import { v4 as uuidv4 } from 'uuid';

function formatName(str: string) {

    str = str.replace(/  +/g, ' ');

    let arrTemp = str.split(' ');

    const objName: { LAST_NAME?: string; MIDDLE_NAME?: string; FIRST_NAME?: string } = {};
    if (arrTemp.length > 0) {

        objName['LAST_NAME'] = arrTemp[0];

        if (arrTemp.length > 1) {
            objName['FIRST_NAME'] = arrTemp[arrTemp.length - 1];
        }

        if (arrTemp.length > 2) {
            arrTemp.splice(0, 1);
            arrTemp.splice(arrTemp.length - 1, 1);
            objName['MIDDLE_NAME'] = arrTemp.join(' ');
        }
    }


    return objName;
}

export const responsysController = {
    async handleRegister(req: Request, res: Response): Promise<void> {
        let json = req.body ? req.body.data : {};

        //check data
        if (!json.CUSTOMER_ID_ && !json.EMAIL_ADDRESS_ && !json.MOBILE_NUMBER_) {
            res.send({ ok: false, message: 'Missing customer data' });
            return;
        }

        let data = req.body;
        data.data = _.pick(data.data, ['CUSTOMER_ID_', 'EMAIL_ADDRESS_', 'MOBILE_NUMBER_', 'FIRST_NAME', 'MIDDLE_NAME', 'LAST_NAME', 'LEAD_SOURCE', 'MKT_CAMPAIGN', 'MKT_FORM', 'ZALO_ID']);

        if (json.FIRST_NAME && !json.LAST_NAME) {
            let format = formatName(json.FIRST_NAME);

            data.data.FIRST_NAME = format.FIRST_NAME ? format.FIRST_NAME : data.data.FIRST_NAME;
            data.data.LAST_NAME = format.LAST_NAME ? format.LAST_NAME : data.data.LAST_NAME;
            data.data.MIDDLE_NAME = format.MIDDLE_NAME ? format.MIDDLE_NAME : data.data.MIDDLE_NAME;
        }

        else if (!json.FIRST_NAME && json.LAST_NAME) {
            let format = formatName(json.LAST_NAME);

            data.data.FIRST_NAME = format.FIRST_NAME ? format.FIRST_NAME : data.data.FIRST_NAME;
            data.data.LAST_NAME = format.LAST_NAME ? format.LAST_NAME : data.data.LAST_NAME;
            data.data.MIDDLE_NAME = format.MIDDLE_NAME ? format.MIDDLE_NAME : data.data.MIDDLE_NAME;
        }

        //override
        if (json.CUSTOMER_ID_) {
            data.matchColumnName1 = 'CUSTOMER_ID_';
            data.matchColumnName2 = null;
        }

        else if (json.MOBILE_NUMBER_) {
            data.matchColumnName1 = 'MOBILE_NUMBER_';
            data.matchColumnName2 = null;
        }

        else if (json.EMAIL_ADDRESS_) {
            data.matchColumnName1 = 'EMAIL_ADDRESS_';
            data.matchColumnName2 = null;
        }

        let result = await ResponsysService.register(data);

        responsysQueue.add({
            type: 'SYNC_LEAD',
            data: {
                CUSTOMERID: json.CUSTOMER_ID_,
                EMAILADDRESS: json.EMAIL_ADDRESS_,
                MOBILENUMBER: json.MOBILE_NUMBER_,
                FULL_NAME: json.FIRST_NAME ? json.FIRST_NAME + " " + json.LAST_NAME : json.LAST_NAME,
                LEAD_SOURCE: json.LEAD_SOURCE,
                MKT_CAMPAIGN: json.MKT_CAMPAIGN,
                MKT_FORM: json.MKT_FORM,
                UTM: json.UTM,
                DATE_OF_BIRTH: json.DATE_OF_BIRTH,
                CURRENT_ADDRESS: json.CURRENT_ADDRESS,
                PROVINCE: json.PROVINCE,
                RECORDID: json.CRMID ? json.CRMID : uuidv4(),
                LEADNEXTVALID: json.LEADNEXTVALID,
                PRODUCT: json.PRODUCT,
                NOTIFIED_ID: json.NOTIFIED_ID,
                SALE_CHANNEL: json.SALE_CHANNEL,
                WEB_LEADID: json.WEB_LEADID,
                GCLID: json.GCLID,
                CX_SOURCE: "WEBSITE"
            }
        });

        res.send({ data: result });
    },
};
