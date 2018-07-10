export enum FrequencyEnum {
    Daily,
    Weekly,
    Monthly,
    Quartely,
    Yearly
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
