import Tab from './Tab';
import PhotosTabTemplate from './PhotosTab.hbs';

export default class PhotosTab extends Tab {
  constructor(content: JQuery) {
    super(content);
  }

  protected initialize(): void {
    this.content.html(PhotosTabTemplate({
      data: this.visitsData,
      hasNoData: this.visitsData.length === 0
    }));
  }
} 