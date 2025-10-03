export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export interface GoogleAuthResponse {
  credential: string;
  select_by: string;
}
