export declare const DATA_SOURCE: {
    userID: string;
    username: string;
    password: string;
    userDetails: {
        email: string;
        isAdmin: boolean;
        other: string;
        birthDay: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
    };
    userAccounts: ({
        account1: string;
        account2?: undefined;
        account3?: undefined;
    } | {
        account2: string;
        account1?: undefined;
        account3?: undefined;
    } | {
        account3: {
            accountNumber: string;
        };
        account1?: undefined;
        account2?: undefined;
    })[];
}[];
export declare const COLUMN_SETTINGS: ({
    column: string;
    title: string;
    align: string;
    freeze: boolean;
    filterBy: {
        type: string;
        value: string;
        options?: undefined;
    };
    width?: undefined;
    groupTitle?: undefined;
    order?: undefined;
    hide?: undefined;
} | {
    column: string;
    title: string;
    width: string;
    align?: undefined;
    freeze?: undefined;
    filterBy?: undefined;
    groupTitle?: undefined;
    order?: undefined;
    hide?: undefined;
} | {
    column: string;
    title: string;
    groupTitle: string;
    order: number;
    freeze: boolean;
    align?: undefined;
    filterBy?: undefined;
    width?: undefined;
    hide?: undefined;
} | {
    column: string;
    title: string;
    groupTitle: string;
    order: number;
    filterBy: {
        type: string;
        value: string;
        options: {
            text: string;
            value: string;
        }[];
    };
    align?: undefined;
    freeze?: undefined;
    width?: undefined;
    hide?: undefined;
} | {
    column: string;
    title: string;
    groupTitle: string;
    align?: undefined;
    freeze?: undefined;
    filterBy?: undefined;
    width?: undefined;
    order?: undefined;
    hide?: undefined;
} | {
    column: string;
    title: string;
    groupTitle: string;
    order: number;
    align?: undefined;
    freeze?: undefined;
    filterBy?: undefined;
    width?: undefined;
    hide?: undefined;
} | {
    column: string;
    title: string;
    align?: undefined;
    freeze?: undefined;
    filterBy?: undefined;
    width?: undefined;
    groupTitle?: undefined;
    order?: undefined;
    hide?: undefined;
} | {
    column: string;
    title: string;
    groupTitle: string;
    hide: boolean;
    align?: undefined;
    freeze?: undefined;
    filterBy?: undefined;
    width?: undefined;
    order?: undefined;
})[];
