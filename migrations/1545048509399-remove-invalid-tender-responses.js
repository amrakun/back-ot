import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Tenders, TenderResponses } from '../src/db/models';
import { encrypt } from '../src/db/models/utils';

dotenv.config();

/**
 * Remove invalid tender responses
 */
module.exports.up = next => {
    const { MONGO_URL = '' } = process.env;

    mongoose.connect(
        MONGO_URL,
        async () => {
            const invalidResponses = [];
            const responses = await TenderResponses.find();

            for (const response of responses) {
                const tender = await Tenders.findOne({ _id: response.tenderId });

                if (tender.isToAll) {
                    continue
                }

                if (tender.tierTypes && tender.tierTypes.length > 0) {
                    continue
                }

                if (!tender.supplierIds.includes(encrypt(response.supplierId))) {
                    invalidResponses.push(response._id);
                }
            }

            const result = await TenderResponses.remove({ _id: { $in: invalidResponses } });

            console.log(result);

            next();
        },
    );
};
