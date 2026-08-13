
import { Type } from '@sinclair/typebox';
import { headersSchema } from 'src/utils/json-schema';

export const FAQResponse = Type.Object({
    id: Type.Number(),
    description: Type.Object({
        en: Type.String(),
        ar: Type.String(),
    }),
    title: Type.Object({
        en: Type.String(),
        ar: Type.String(),
    }),
});


export const addOrUpdateFAQ = {
    description: 'create or update FAQ  { admin token } ',
    headers: Type.Ref(headersSchema),
    tags: ['FAQ'],
    security: [
        {
            userToken: [],
        },
    ],
    body: Type.Object({
        id: Type.Optional(Type.Number({ description: 'send it in case you want to update' })),
        description: Type.Object({
            en: Type.String(),
            ar: Type.String(),
        }),
        title: Type.Object({
            en: Type.String(),
            ar: Type.String(),
        }),
    }),
    response: {
        200: FAQResponse
    }
}

export const getAllFAQs = {
    description: 'get all FAQs',
    headers: Type.Ref(headersSchema),
    tags: ['FAQ'],
    querystring: Type.Object({
        limit: Type.Number(),
        offset: Type.Number(),
        isSortAsc: Type.Optional(Type.Boolean({ description: '' })),
        isSortDesc: Type.Optional(Type.Boolean({ description: '' })),
    }),

    response: {
        200: Type.Object({
            count: Type.Number(),
            rows: Type.Array(FAQResponse),
        }),
    },
}

export const deleteById = {
    description: 'delete FAQ by id  { admin token } ',
    headers: Type.Ref(headersSchema),
    tags: ['FAQ'],
    security: [
        {
            userToken: [],
        },
    ],
    params: Type.Object({
        id: Type.Number(),
    }),

    response: {
        200: Type.Object({
            message: Type.String(),
        }),
    },
}
