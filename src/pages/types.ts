export interface Page {
  /** Page name; the document title becomes "<title> · UpgradeLab". */
  title: string;
  description: string;
  render(ctx: { search: string }): HTMLElement;
}
