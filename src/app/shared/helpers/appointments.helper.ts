import { isEmpty } from 'lodash';

export const cleanAppointemntsProviderId = (provider: string): string[] =>  isEmpty(provider)
                                                                            ? []
                                                                            : provider.replace(/ /g, '').split('|');
