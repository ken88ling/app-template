export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  department?: string;
}

export interface ProfilePhotoResponse {
  url: string;
}