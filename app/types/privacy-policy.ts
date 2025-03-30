export interface PrivacyPolicySection {
  title: string;
  content: string[];
  listItems?: string[];
  subsections?: {
    title: string;
    content: string[];
    listItems?: string[];
  }[];
}

export interface PrivacyPolicyData {
  lastUpdated: string;
  sections: PrivacyPolicySection[];
  contactInfo: {
    email: string;
    address: string;
  };
} 