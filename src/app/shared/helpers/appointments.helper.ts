import { isEmpty } from 'lodash';

export const cleanAppointmentsProviderId = (provider: string): string[] =>  isEmpty(provider)
                                                                            ? []
                                                                            : provider.replace(/ /g, '').split('|');



export const cleanAppointmentsResourceId = (resource: string): string[] =>  isEmpty(resource)
                                                                            ? []
                                                                            :  resource.replace(/ /g, '').split('|');
