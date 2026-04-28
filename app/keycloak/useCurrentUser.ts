
import { User } from 'oidc-client-ts';
import { useAsync } from 'react-async-states';
import { currentUserSource } from './data/ressources';

export interface BuyTrackUser extends User {
  roles: Set<string>;
}

export function useCurrentUser() {
  const { data } = useAsync(currentUserSource);
  if (!data) {
    throw new Error('No user, this is a bug');
  }
  return data;
}
