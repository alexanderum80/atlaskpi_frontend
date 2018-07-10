import { IActivity } from '../activity';

export function Activity(activity: new () => IActivity) {
    return function(target) {
        target.__activity__ = activity;
      };
}
