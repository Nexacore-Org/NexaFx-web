// Store tags in localStorage keyed by transaction ID
export interface TransactionTag {
  transactionId: string;
  tags: string[];
}
export const getTagsForTransaction = (id: string): string[] => {
  const allTags = JSON.parse(localStorage.getItem("transactionTags") || "{}");
  return allTags[id] || [];
};
export const setTagsForTransaction = (id: string, tags: string[]): void => {
  const allTags = JSON.parse(localStorage.getItem("transactionTags") || "{}");
  allTags[id] = tags;
  localStorage.setItem("transactionTags", JSON.stringify(allTags));
};
export const getAllUsedTags = (): string[] => {
  const allTags = JSON.parse(localStorage.getItem("transactionTags") || "{}");
  const allTagArrays = Object.values(allTags) as string[][];
  const allTagsFlat = allTagArrays.flat();
  return [...new Set(allTagsFlat)];
};
