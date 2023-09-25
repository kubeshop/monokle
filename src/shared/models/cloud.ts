/**
 * This type is used by the renderer so it doesn't need to have all the properties of the User class
 */
export type CloudUser = {
  readonly email: string;
};

export type CloudLoginResponse = {
  user: CloudUser;
};

export type CloudState = {
  user?: CloudUser;
};
