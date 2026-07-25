export const verifyBvn = (
  bvn: string,
  dateOfBirth: string,
): Promise<{
  verified: boolean;
  firstName: string;
  lastName: string;
}> => {
  // TODO: Implement the actual API call
  return Promise.resolve({
    verified: true,
    firstName: "John",
    lastName: "Doe",
  });
};
