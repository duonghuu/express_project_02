import { MKTADBService } from "@services/mktaDbService";
import { ResponsysService } from "@services/responsysService";
import { utils } from "@utils/index";
import { responsysQueue } from "@workers/queue";
import { Request, Response } from "express";
import _ from "lodash";
import { v4 as uuidv4 } from 'uuid';

export const responsysController = {
    async handleRegister(req: Request, res: Response): Promise<void> {
        let json = req.body ? req.body.data : {};
        //check data
        if (!json.CUSTOMER_ID_ && !json.EMAIL_ADDRESS_ && !json.MOBILE_NUMBER_) {
            res.json({ ok: false, message: 'Missing customer data' });
            return;
        }

        let data = req.body;
        data.data = _.pick(data.data, ['CUSTOMER_ID_', 'EMAIL_ADDRESS_', 'MOBILE_NUMBER_', 'FIRST_NAME', 'MIDDLE_NAME', 'LAST_NAME', 'LEAD_SOURCE', 'MKT_CAMPAIGN', 'MKT_FORM', 'ZALO_ID']);

        if (json.FIRST_NAME && !json.LAST_NAME) {
            let format = utils.formatName(json.FIRST_NAME);

            data.data.FIRST_NAME = format.FIRST_NAME ? format.FIRST_NAME : data.data.FIRST_NAME;
            data.data.LAST_NAME = format.LAST_NAME ? format.LAST_NAME : data.data.LAST_NAME;
            data.data.MIDDLE_NAME = format.MIDDLE_NAME ? format.MIDDLE_NAME : data.data.MIDDLE_NAME;
        }

        else if (!json.FIRST_NAME && json.LAST_NAME) {
            let format = utils.formatName(json.LAST_NAME);

            data.data.FIRST_NAME = format.FIRST_NAME ? format.FIRST_NAME : data.data.FIRST_NAME;
            data.data.LAST_NAME = format.LAST_NAME ? format.LAST_NAME : data.data.LAST_NAME;
            data.data.MIDDLE_NAME = format.MIDDLE_NAME ? format.MIDDLE_NAME : data.data.MIDDLE_NAME;
        }

        // //override
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

        responsysQueue.add('resapi_queue', {
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

        res.json({ data: result });
    },
    async handleSignupS2S(req: Request, res: Response): Promise<void> {
        let json = req.body ? req.body.data : {};
        //check data
        if (!json.MOBILE_NUMBER_ && !json.CUSTOMER_ID_) {
            res.json({ ok: false, message: 'MISSING_CUSTOMER_DATA' });
            return;
        }


        let data = req.body;

        if (json.CUSTOMER_ID_) {
            data.matchColumnName1 = 'CUSTOMER_ID_';
            data.matchColumnName2 = null;
        }

        else if (json.MOBILE_NUMBER_) {
            data.matchColumnName1 = 'MOBILE_NUMBER_';
            data.matchColumnName2 = null;
        }
        let result = await ResponsysService.register(data);
        let insertData = {
            ...data,
            "RIID": `RIID_${data.feol_account_id}`,
            "customer_id_lv1": `${data.data.CUSTOMER_ID_}`,
        };

        const existingItem = await MKTADBService.getItemByField("feol_account_id", data.feol_account_id);
        if (!existingItem) {
            await MKTADBService.create(insertData);
        }

        res.json({ data: result });
    },
    async handleTriggerS2S(req: Request, res: Response): Promise<void> {
        //check data
        let data = req.body;

        if (!data.event_name || !data.event_source) {
            res.json({ ok: false, message: 'MISSING_EVENT_DATA' });
            return;
        }

        else if (!data.customer_id && !data.email_address && !data.mobile_number) {
            res.json({ ok: false, message: 'MISSING_CUSTOMER_DATA' });
            return;
        }

        data.timestamp = new Date();
        await responsysQueue.add('ADD_ACTIVITY_TRIGGER', {
            type: 'ADD_ACTIVITY_TRIGGER',
            data
        });

        res.json({ ok: true });
    }
};
