import { isEmpty } from 'lodash';

export const cleanAppointmentsProviderId = (provider: string): string[] =>  isEmpty(provider)
                                                                            ? []
                                                                            : provider.replace(/ /g, '').split('|');
