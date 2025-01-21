export interface EntityPropsInterface {
  id: number;
  alias: string;
  type: 'user' | 'company';
  avatar?: string;
  name?: string;
  companyName?: string;
}