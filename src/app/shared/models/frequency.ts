export enum FrequencyEnum {
    Daily = 'daily',
    Weekly = 'weekly',
    Monthly = 'monthly',
    Quartely = 'quarterly',
    Yearly = 'yearly'
}

export const FrequencyTable = {
    daily: FrequencyEnum.Daily,
    weekly: FrequencyEnum.Weekly,
    monthly: FrequencyEnum.Monthly,
    quarterly: FrequencyEnum.Quartely,
    yearly: FrequencyEnum.Yearly,
};

export enum FrequencyEnumEmployee {
    Hourly,
    Yearly,
    BiWeekly,
    Weekly
}

export const FrequencyEmployeeTable = {
    hourly: FrequencyEnumEmployee.Hourly,
    yearly: FrequencyEnumEmployee.Yearly,
    'bi-weekly': FrequencyEnumEmployee.BiWeekly,
    weekly: FrequencyEnumEmployee.Weekly
};
