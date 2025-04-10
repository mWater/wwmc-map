export default class Tab {
  protected content: any;
  protected initialized: boolean;
  protected visitsData: any;
  protected needToBeShown: boolean;

  constructor(content: any) {
    this.content = content;
    this.initialized = false;
    this.visitsData = null;
    this.needToBeShown = false;
  }

  show(): void {
    this.needToBeShown = true;
    this.update();
  }

  setVisitsData(visitsData: any): void {
    this.visitsData = visitsData;
    this.update();
  }

  update(): void {
    if (this.needToBeShown && this.visitsData && !this.initialized) {
      this.initialized = true;
      this.initialize();
    }
  }

  protected initialize(): void {
    // To be implemented by subclasses
  }
} 