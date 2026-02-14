Page({
  data: {
    url: ''
  },
  onLoad(options: any) {
    if (options.url) {
      this.setData({
        url: decodeURIComponent(options.url)
      });
    }
  }
});